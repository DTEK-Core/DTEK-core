'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { recalculateOrgIndex } from '@/lib/trust/engine';
import { createCompletedImportAudit, createFailedImportAudit } from '@/lib/security/import-audit';
import {
  MAX_OBJECT_IMPORT_ROWS,
  prepareObjectImport,
  validateObjectImportPayload,
  type ExistingObjectMatch,
  type ObjectImportCommitResult,
  type ObjectImportPreview,
  type ObjectImportPreviewRow,
} from '@/lib/import/objects';
import {
  validateImportSourceDefaults,
  countImportDataRows,
  type ImportMatrix,
  type ImportSourceDefaults,
} from '@/lib/import/shared';

const INITIAL_SCORE: Record<string, number> = {
  critical: 65, high: 70, medium: 75, low: 80,
};
const INITIAL_LEVEL: Record<string, string> = {
  critical: 'low', high: 'medium', medium: 'good', low: 'good',
};

interface AuthContext {
  userId: string;
  actorEmail?: string;
  role: string;
  orgId: string;
  admin: ReturnType<typeof createAdminClient>;
}

async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from('profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single();

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

async function loadExistingObjects(ctx: AuthContext): Promise<ExistingObjectMatch[] | null> {
  const { data, error } = await ctx.admin
    .from('objects')
    .select('name, type, ip_address')
    .eq('organization_id', ctx.orgId)
    .neq('status', 'archived');

  if (error) return null;
  return (data as unknown as ExistingObjectMatch[] | null) ?? [];
}

async function createPreview(
  fileName: string,
  matrix: ImportMatrix,
  sourceDefaults: ImportSourceDefaults,
  ctx: AuthContext,
): Promise<{ preview?: ObjectImportPreview; error?: string }> {
  if (!['owner', 'analyst', 'admin'].includes(ctx.role)) return { error: 'Недостаточно прав для импорта объектов' };
  if (!/\.(csv|xlsx)$/i.test(fileName)) return { error: 'Поддерживаются только файлы CSV и XLSX' };

  const payload = validateObjectImportPayload(fileName, matrix);
  if (!payload.success) return { error: 'Файл имеет недопустимый размер или структуру' };
  const source = validateImportSourceDefaults(sourceDefaults);
  if (!source.success) return { error: 'Проверьте название, тип, дату и комментарий источника' };

  if (countImportDataRows(payload.data.matrix) > MAX_OBJECT_IMPORT_ROWS) {
    return { error: `В файле больше ${MAX_OBJECT_IMPORT_ROWS} строк объектов` };
  }

  const existingObjects = await loadExistingObjects(ctx);
  if (!existingObjects) return { error: 'Не удалось проверить существующие объекты. Попробуйте ещё раз.' };

  return { preview: prepareObjectImport(payload.data.fileName, payload.data.matrix, ctx.role, existingObjects, source.data) };
}

export async function previewObjectImport(
  fileName: string,
  matrix: ImportMatrix,
  sourceDefaults: ImportSourceDefaults,
): Promise<{ preview?: ObjectImportPreview; error?: string }> {
  const ctx = await getAuthContext();
  if (!ctx) redirect('/login');
  return createPreview(fileName, matrix, sourceDefaults, ctx);
}

function insertPayload(row: ObjectImportPreviewRow, ctx: AuthContext) {
  const object = row.object!;
  return {
    organization_id: ctx.orgId,
    owner_id: ctx.userId,
    name: object.name,
    type: object.type,
    description: object.description,
    criticality: object.criticality,
    ip_address: object.ip_address,
    os_platform: object.os_platform,
    segment: object.segment,
    exposure: object.exposure,
    trust_score: INITIAL_SCORE[object.criticality] ?? 75,
    trust_level: INITIAL_LEVEL[object.criticality] ?? 'good',
  };
}

export async function commitObjectImport(
  fileName: string,
  matrix: ImportMatrix,
  sourceDefaults: ImportSourceDefaults,
): Promise<{ result?: ObjectImportCommitResult; error?: string }> {
  const ctx = await getAuthContext();
  if (!ctx) redirect('/login');

  const prepared = await createPreview(fileName, matrix, sourceDefaults, ctx);
  if (!prepared.preview) {
    await createFailedImportAudit({
      organizationId: ctx.orgId,
      actorId: ctx.userId,
      actorEmail: ctx.actorEmail,
      importType: 'objects',
      fileName,
      source: sourceDefaults,
      failureStage: 'validation',
      counts: { totalRows: countImportDataRows(matrix) },
    });
    return { error: prepared.error ?? 'Не удалось подготовить импорт' };
  }

  const preview = prepared.preview;
  const candidates = preview.rows.filter(row => (
    row.object
    && !row.duplicateInFile
    && !row.duplicateExisting
    && !row.issues.some(item => item.severity === 'error')
  ));

  let created = 0;
  const failures: ObjectImportCommitResult['failures'] = [];

  for (let offset = 0; offset < candidates.length; offset += 50) {
    const batch = candidates.slice(offset, offset + 50);
    const { error } = await ctx.admin.from('objects').insert(batch.map(row => insertPayload(row, ctx)) as never);

    if (!error) {
      created += batch.length;
      continue;
    }

    for (const row of batch) {
      const { error: rowError } = await ctx.admin.from('objects').insert(insertPayload(row, ctx) as never);
      if (rowError) {
        failures.push({ row: row.rowNumber, name: row.object!.name, message: 'Не удалось создать объект' });
      } else {
        created += 1;
      }
    }
  }

  if (created > 0) {
    try {
      await recalculateOrgIndex(ctx.orgId);
    } catch {
      // Object import is complete; organization index can be recalculated later.
    }
    revalidatePath('/objects');
    revalidatePath('/dashboard');
    revalidatePath('/graph');
  }

  const result: ObjectImportCommitResult = {
    totalRows: preview.totalRows,
    created,
    skipped: preview.totalRows - candidates.length,
    failed: failures.length,
    failures,
  };

  if (result.created === 0 && result.failed > 0) {
    await createFailedImportAudit({
      organizationId: ctx.orgId,
      actorId: ctx.userId,
      actorEmail: ctx.actorEmail,
      importType: 'objects',
      fileName: preview.fileName,
      source: preview.sourceMetadata,
      failureStage: 'write',
      counts: {
        totalRows: result.totalRows,
        createdRows: result.created,
        skippedRows: result.skipped,
        failedRows: result.failed,
        warnings: preview.warningCount,
      },
    });
  } else {
    await createCompletedImportAudit({
      organizationId: ctx.orgId,
      actorId: ctx.userId,
      actorEmail: ctx.actorEmail,
      importType: 'objects',
      fileName: preview.fileName,
      source: preview.sourceMetadata,
      totalRows: result.totalRows,
      createdRows: result.created,
      skippedRows: result.skipped,
      failedRows: result.failed,
      warnings: preview.warningCount,
    });
  }

  return { result };
}
