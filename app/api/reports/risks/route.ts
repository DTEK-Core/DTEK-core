import { NextResponse } from 'next/server';
import { createSecurityEvent } from '@/lib/security/audit';
import { ReportForbiddenError } from '@/lib/reports/access';
import { getRiskCsvExport } from '@/lib/reports/risk-csv';

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

    throw error;
  }
}
