import { createSecurityEvent } from '@/lib/security/audit';
import { IMPORT_SOURCE_TYPES } from '@/lib/import/shared';

type ImportType = 'objects' | 'risks';
type FailureStage = 'validation' | 'write';

interface ImportAuditActor {
  organizationId: string;
  actorId: string;
  actorEmail?: string;
}

interface ImportAuditSource {
  source_name?: unknown;
  source_type?: unknown;
}

interface ImportAuditCounts {
  totalRows: number;
  createdRows: number;
  skippedRows: number;
  failedRows: number;
  warnings: number;
  linkedRows?: number;
  unlinkedRows?: number;
  linkFailedRows?: number;
}

interface CompletedImportAuditInput extends ImportAuditActor, ImportAuditCounts {
  importType: ImportType;
  fileName: string;
  source: ImportAuditSource;
}

interface FailedImportAuditInput extends ImportAuditActor {
  importType: ImportType;
  fileName: string;
  source?: ImportAuditSource;
  failureStage: FailureStage;
  counts?: Partial<ImportAuditCounts>;
}

function safeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim();
  return normalized ? normalized.slice(0, maxLength) : null;
}

function safeFileName(value: unknown): string {
  const normalized = safeText(value, 255) ?? 'unknown-file';
  return normalized.replace(/\\/g, '/').split('/').pop() || 'unknown-file';
}

function safeSourceType(value: unknown): string {
  return typeof value === 'string' && IMPORT_SOURCE_TYPES.includes(value as typeof IMPORT_SOURCE_TYPES[number])
    ? value
    : 'unknown';
}

function safeCount(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.min(10_000, Math.max(0, Math.trunc(value)));
}

function sourceMetadata(source: ImportAuditSource | undefined, fileName: string) {
  return {
    sourceName: safeText(source?.source_name, 200) ?? safeFileName(fileName),
    sourceType: safeSourceType(source?.source_type),
  };
}

function countMetadata(counts: Partial<ImportAuditCounts> | undefined) {
  return {
    totalRows: safeCount(counts?.totalRows),
    createdRows: safeCount(counts?.createdRows),
    skippedRows: safeCount(counts?.skippedRows),
    failedRows: safeCount(counts?.failedRows),
    warnings: safeCount(counts?.warnings),
  };
}

export async function createCompletedImportAudit(input: CompletedImportAuditInput): Promise<void> {
  const relationCounts = input.importType === 'risks'
    ? {
        linkedRows: safeCount(input.linkedRows),
        unlinkedRows: safeCount(input.unlinkedRows),
        linkFailedRows: safeCount(input.linkFailedRows),
      }
    : {};

  await createSecurityEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorEmail: input.actorEmail,
    eventType: input.importType === 'objects' ? 'import.objects_completed' : 'import.risks_completed',
    targetType: 'organization',
    targetId: input.organizationId,
    metadata: {
      importType: input.importType,
      fileName: safeFileName(input.fileName),
      ...sourceMetadata(input.source, input.fileName),
      ...countMetadata(input),
      ...relationCounts,
    },
  });
}

export async function createFailedImportAudit(input: FailedImportAuditInput): Promise<void> {
  await createSecurityEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorEmail: input.actorEmail,
    eventType: 'import.failed',
    targetType: 'organization',
    targetId: input.organizationId,
    metadata: {
      importType: input.importType,
      fileName: safeFileName(input.fileName),
      ...sourceMetadata(input.source, input.fileName),
      ...countMetadata(input.counts),
      failureStage: input.failureStage,
    },
  });
}
