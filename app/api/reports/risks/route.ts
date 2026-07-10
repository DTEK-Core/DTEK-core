import { NextResponse } from 'next/server';
import { createSecurityEvent } from '@/lib/security/audit';
import { ReportForbiddenError } from '@/lib/reports/access';
import { getRiskCsvExport } from '@/lib/reports/risk-csv';

function isNextRedirect(error: unknown): boolean {
  return typeof error === 'object'
    && error !== null
    && 'digest' in error
    && typeof (error as { digest?: unknown }).digest === 'string'
    && (error as { digest: string }).digest.startsWith('NEXT_REDIRECT');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exportData = await getRiskCsvExport(searchParams);

    await createSecurityEvent({
      organizationId: exportData.orgId,
      actorId: exportData.userId,
      actorEmail: exportData.userEmail,
      eventType: 'report.risks_csv_exported',
      targetType: 'organization',
      targetId: exportData.orgId,
      metadata: {
        reportType: 'risk_csv',
        format: 'csv',
        filters: exportData.filters,
        rowCount: exportData.rowCount,
      },
    });

    return new NextResponse(exportData.csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${exportData.filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    if (error instanceof ReportForbiddenError) {
      return NextResponse.json(
        { error: 'Недостаточно прав для экспорта реестра рисков' },
        { status: 403 },
      );
    }

    if (isNextRedirect(error)) throw error;

    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('[reports:risks_csv]', message);

    return NextResponse.json(
      { error: 'Не удалось сформировать CSV-отчёт. Попробуйте повторить экспорт позже.' },
      { status: 500 },
    );
  }
}
