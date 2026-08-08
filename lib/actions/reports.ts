'use server';

import { createSecurityEvent } from '@/lib/security/audit';
import { getReportAccessContext } from '@/lib/reports/access';

type PrintableReportExportInput =
  | {
      reportType: 'passport';
      objectId: string;
    }
  | {
      reportType: 'executive';
    };

type PrintableReportExportResult =
  | { success: true }
  | { error: string };

export async function logPrintableReportExport(
  input: PrintableReportExportInput,
): Promise<PrintableReportExportResult> {
  if (input.reportType === 'passport') {
    const { admin, userId, userEmail, orgId } = await getReportAccessContext('passport');

    const { data: objectRaw } = await admin
      .from('objects')
      .select('id, trust_score, trust_level')
      .eq('id', input.objectId)
      .eq('organization_id', orgId)
      .single();

    const object = objectRaw as { id: string; trust_score: number; trust_level: string } | null;
    if (!object) {
      return { error: 'Отчёт недоступен' };
    }

    await createSecurityEvent({
      organizationId: orgId,
      actorId: userId,
      actorEmail: userEmail,
      eventType: 'report.passport_exported',
      targetType: 'object',
      targetId: object.id,
      metadata: {
        reportType: 'passport',
        format: 'print_html',
        trigger: 'print_button',
        trustScore: object.trust_score,
        trustLevel: object.trust_level,
      },
    });

    return { success: true };
  }

  const { userId, userEmail, orgId } = await getReportAccessContext('executive');

  await createSecurityEvent({
    organizationId: orgId,
    actorId: userId,
    actorEmail: userEmail,
    eventType: 'report.executive_exported',
    targetType: 'organization',
    targetId: orgId,
    metadata: {
      reportType: 'executive',
      format: 'print_html',
      trigger: 'print_button',
    },
  });

  return { success: true };
}
