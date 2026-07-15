'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { recalculateObjectTrust, recalculateOrgIndex } from '@/lib/trust/engine';
import { createCompletedImportAudit, createFailedImportAudit } from '@/lib/security/import-audit';
import {
  MAX_RISK_IMPORT_ROWS,
  prepareRiskImport,
  validateRiskImportPayload,
  type ExistingRiskMatch,
  type RiskImportCommitResult,
  type RiskImportObjectMatch,
  type RiskImportPreview,
  type RiskImportPreviewRow,
} from '@/lib/import/risks';
import {
  validateImportSourceDefaults,
  countImportDataRows,
  type ImportMatrix,
  type ImportSourceDefaults,
} from '@/lib/import/shared';

interface AuthContext {
  userId: string;
  actorEmail?: string;
  role: string;
  orgId: string;
  admin: ReturnType<typeof createAdminClient>;
}

interface ExistingRiskRaw {
  title: string;
  category: string;
  severity: string;
  object_risks: Array<{ object_id: string }> | null;
}

interface CreatedRiskRow {
  id: string;
  row: RiskImportPreviewRow;
}

async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin.from('profiles').select('role, organization_id').eq('id', user.id).single();
  const profile = data as { role: string | null; organization_id: string | null } | null;
  if (!profile?.role || !profile.organization_id) return null;
  return {
    userId: user.id,
    actorEmail: user.email,
    role: profile.role,
    orgId: profile.organization_id,
    admin,
  };
}

async function loadImportContext(ctx: AuthContext): Promise<{
  objects: RiskImportObjectMatch[];
  existingRisks: ExistingRiskMatch[];
} | null> {
  const [objectsResult, risksResult] = await Promise.all([
    ctx.admin.from('objects').select('id, name, ip_address').eq('organization_id', ctx.orgId).neq('status', 'archived'),
    ctx.admin.from('risks').select('title, category, severity, object_risks(object_id)').eq('organization_id', ctx.orgId),
  ]);
  if (objectsResult.error || risksResult.error) return null;

  const objects = (objectsResult.data as unknown as RiskImportObjectMatch[] | null) ?? [];
  const risks = (risksResult.data as unknown as ExistingRiskRaw[] | null) ?? [];
  return {
    objects,
    existingRisks: risks.map(risk => ({
      title: risk.title,
      category: risk.category,
      severity: risk.severity,
      linkedObjectIds: (risk.object_risks ?? []).map(link => link.object_id),
    })),
  };
}

async function createPreview(
  fileName: string,
  matrix: ImportMatrix,
  sourceDefaults: ImportSourceDefaults,
  ctx: AuthContext,
): Promise<{ preview?: RiskImportPreview; error?: string }> {
  if (!['owner', 'analyst'].includes(ctx.role)) return { error: 'Только владелец или аналитик может импортировать риски' };
  if (!/\.(csv|xlsx)$/i.test(fileName)) return { error: 'Поддерживаются только файлы CSV и XLSX' };

  const payload = validateRiskImportPayload(fileName, matrix);
  if (!payload.success) return { error: 'Файл имеет недопустимый размер или структуру' };
  const source = validateImportSourceDefaults(sourceDefaults);
  if (!source.success) return { error: 'Проверьте название, тип, дату и комментарий источника' };
  if (countImportDataRows(payload.data.matrix) > MAX_RISK_IMPORT_ROWS) {
    return { error: `В файле больше ${MAX_RISK_IMPORT_ROWS} строк рисков` };
  }

  const context = await loadImportContext(ctx);
  if (!context) return { error: 'Не удалось проверить риски и объекты организации. Попробуйте ещё раз.' };
  return { preview: prepareRiskImport(payload.data.fileName, payload.data.matrix, context.objects, context.existingRisks, source.data) };
}

export async function previewRiskImport(fileName: string, matrix: ImportMatrix, sourceDefaults: ImportSourceDefaults) {
  const ctx = await getAuthContext();
  if (!ctx) redirect('/login');
  return createPreview(fileName, matrix, sourceDefaults, ctx);
}

function insertPayload(row: RiskImportPreviewRow, ctx: AuthContext) {
  const risk = row.risk!;
  return {
    organization_id: ctx.orgId,
    author_id: ctx.userId,
    title: risk.title,
    description: risk.description,
    category: risk.category,
    severity: risk.severity,
    probability: risk.probability,
    cvss_score: risk.cvss_score,
    status: risk.status,
    impact: risk.impact,
    sla_days: risk.sla_days,
    due_date: risk.due_date,
    resolved_at: risk.status === 'mitigated' || risk.status === 'closed' ? new Date().toISOString() : null,
  };
}

function riskKey(risk: { title: string; category: string; severity: string }): string {
  return `${risk.title.toLocaleLowerCase('ru')}\u0000${risk.category}\u0000${risk.severity}`;
}

export async function commitRiskImport(
  fileName: string,
  matrix: ImportMatrix,
  sourceDefaults: ImportSourceDefaults,
): Promise<{ result?: RiskImportCommitResult; error?: string }> {
  const ctx = await getAuthContext();
  if (!ctx) redirect('/login');

  const prepared = await createPreview(fileName, matrix, sourceDefaults, ctx);
  if (!prepared.preview) {
    await createFailedImportAudit({
      organizationId: ctx.orgId,
      actorId: ctx.userId,
      actorEmail: ctx.actorEmail,
      importType: 'risks',
      fileName,
      source: sourceDefaults,
      failureStage: 'validation',
      counts: { totalRows: countImportDataRows(matrix) },
    });
    return { error: prepared.error ?? 'Не удалось подготовить импорт' };
  }
  const preview = prepared.preview;
  const candidates = preview.rows.filter(row => row.risk && !row.duplicateInFile && !row.duplicateExisting && !row.issues.some(item => item.severity === 'error'));
  const createdRows: CreatedRiskRow[] = [];
  const failures: RiskImportCommitResult['failures'] = [];

  for (let offset = 0; offset < candidates.length; offset += 50) {
    const batch = candidates.slice(offset, offset + 50);
    const { data, error } = await ctx.admin
      .from('risks')
      .insert(batch.map(row => insertPayload(row, ctx)) as never)
      .select('id, title, category, severity');

    if (!error && data) {
      const idsByKey = new Map((data as Array<{ id: string; title: string; category: string; severity: string }>).map(risk => [riskKey(risk), risk.id]));
      for (const row of batch) {
        const id = idsByKey.get(riskKey(row.risk!));
        if (id) createdRows.push({ id, row });
        else failures.push({ row: row.rowNumber, name: row.risk!.title, message: 'Не удалось подтвердить создание риска' });
      }
      continue;
    }

    for (const row of batch) {
      const { data: riskData, error: rowError } = await ctx.admin
        .from('risks')
        .insert(insertPayload(row, ctx) as never)
        .select('id')
        .single();
      if (rowError || !riskData) failures.push({ row: row.rowNumber, name: row.risk!.title, message: 'Не удалось создать риск' });
      else createdRows.push({ id: (riskData as { id: string }).id, row });
    }
  }

  const linkedRows = createdRows.filter(item => item.row.risk?.linkedObjectId);
  const successfulObjectIds = new Set<string>();
  let linkFailures = 0;
  for (let offset = 0; offset < linkedRows.length; offset += 100) {
    const batch = linkedRows.slice(offset, offset + 100);
    const links = batch.map(item => ({
      risk_id: item.id,
      object_id: item.row.risk!.linkedObjectId!,
      linked_by: ctx.userId,
    }));
    const { error } = await ctx.admin.from('object_risks').insert(links as never);
    if (!error) {
      batch.forEach(item => successfulObjectIds.add(item.row.risk!.linkedObjectId!));
      continue;
    }

    for (const item of batch) {
      const { error: linkError } = await ctx.admin.from('object_risks').insert({
        risk_id: item.id,
        object_id: item.row.risk!.linkedObjectId!,
        linked_by: ctx.userId,
      } as never);
      if (linkError) linkFailures += 1;
      else successfulObjectIds.add(item.row.risk!.linkedObjectId!);
    }
  }

  for (const objectId of successfulObjectIds) {
    try {
      await recalculateObjectTrust(objectId, ctx.orgId, { reason: 'risk_imported', changedBy: ctx.userId, skipOrgIndex: true });
    } catch {
      // Import remains successful; score can be recalculated by the existing engine later.
    }
    revalidatePath(`/objects/${objectId}`);
    revalidatePath(`/objects/${objectId}/passport`);
  }
  if (successfulObjectIds.size > 0) {
    try { await recalculateOrgIndex(ctx.orgId); } catch { /* non-blocking */ }
  }

  if (createdRows.length > 0) {
    revalidatePath('/risks');
    revalidatePath('/objects');
    revalidatePath('/dashboard');
    revalidatePath('/graph');
  }

  const result: RiskImportCommitResult = {
    totalRows: preview.totalRows,
    created: createdRows.length,
    skipped: preview.totalRows - candidates.length,
    failed: failures.length,
    failures,
    linked: linkedRows.length - linkFailures,
    unlinked: createdRows.length - linkedRows.length + linkFailures,
    linkFailures,
  };

  if (result.created === 0 && result.failed > 0) {
    await createFailedImportAudit({
      organizationId: ctx.orgId,
      actorId: ctx.userId,
      actorEmail: ctx.actorEmail,
      importType: 'risks',
      fileName: preview.fileName,
      source: preview.sourceMetadata,
      failureStage: 'write',
      counts: {
        totalRows: result.totalRows,
        createdRows: result.created,
        skippedRows: result.skipped,
        failedRows: result.failed,
        warnings: preview.warningCount,
        linkedRows: result.linked,
        unlinkedRows: result.unlinked,
        linkFailedRows: result.linkFailures,
      },
    });
  } else {
    await createCompletedImportAudit({
      organizationId: ctx.orgId,
      actorId: ctx.userId,
      actorEmail: ctx.actorEmail,
      importType: 'risks',
      fileName: preview.fileName,
      source: preview.sourceMetadata,
      totalRows: result.totalRows,
      createdRows: result.created,
      skippedRows: result.skipped,
      failedRows: result.failed,
      warnings: preview.warningCount,
      linkedRows: result.linked,
      unlinkedRows: result.unlinked,
      linkFailedRows: result.linkFailures,
    });
  }

  return { result };
}
