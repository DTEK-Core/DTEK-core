import { z } from 'zod';

export const MAX_IMPORT_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 500;

export type ImportCell = string | number | boolean | null;
export type ImportMatrix = ImportCell[][];
export type ImportIssueSeverity = 'error' | 'warning';

export interface ImportIssue {
  row: number;
  field: string;
  code: string;
  message: string;
  originalValue: string | null;
  suggestion: string | null;
  severity: ImportIssueSeverity;
}

export interface ImportPreviewSummary {
  fileName: string;
  totalRows: number;
  validRows: number;
  creatableRows: number;
  errorRows: number;
  warningCount: number;
  issues: ImportIssue[];
}

export interface ImportCommitSummary {
  totalRows: number;
  created: number;
  skipped: number;
  failed: number;
  failures: Array<{ row: number; name: string; message: string }>;
}

const SOURCE_TYPES = [
  'manual_csv', 'asset_inventory', 'vulnerability_export', 'monitoring_export',
  'directory_export', 'security_tool_export', 'network_export', 'other',
] as const;

const SOURCE_CONFIDENCE = ['high', 'medium', 'low'] as const;

export const SourceMetadataSchema = z.object({
  source_name: z.string().max(200, 'Название источника не должно превышать 200 символов').nullable(),
  source_type: z.enum(SOURCE_TYPES, { message: 'Недопустимый тип источника' }),
  source_record_id: z.string().max(200, 'ID записи источника не должен превышать 200 символов').nullable(),
  source_collected_at: z.string().nullable(),
  confidence: z.enum(SOURCE_CONFIDENCE, { message: 'Недопустимый уровень уверенности' }),
  import_note: z.string().max(500, 'Комментарий импорта не должен превышать 500 символов').nullable(),
});

const ImportPayloadSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  matrix: z.array(
    z.array(z.union([
      z.string().max(10_000),
      z.number().finite(),
      z.boolean(),
      z.null(),
    ])).max(40),
  ).min(1).max(1_001),
});

export type SourceMetadata = z.infer<typeof SourceMetadataSchema>;

export function validateImportPayload(fileName: string, matrix: ImportMatrix) {
  return ImportPayloadSchema.safeParse({ fileName, matrix });
}

export function cellText(value: ImportCell | undefined): string | null {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

export function normalizeHeader(value: ImportCell | undefined): string {
  return (cellText(value) ?? '')
    .replace(/^\uFEFF/, '')
    .toLocaleLowerCase('ru')
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export function normalizeEnum<T extends string>(value: string | null, aliases: Record<string, T>): string | null {
  if (!value) return null;
  const key = value.toLocaleLowerCase('ru').trim();
  return aliases[key] ?? key;
}

export function normalizeImportDate(value: string | null): { value: string | null; valid: boolean } {
  if (!value) return { value: null, valid: true };

  const ruDate = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
  const normalized = ruDate ? `${ruDate[3]}-${ruDate[2]}-${ruDate[1]}` : value;
  const isDate = /^\d{4}-\d{2}-\d{2}$/.test(normalized);
  const isIsoDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(normalized);
  if (!isDate && !isIsoDateTime) return { value: null, valid: false };

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return { value: null, valid: false };

  if (isDate) {
    const [year, month, day] = normalized.split('-').map(Number);
    const exact = new Date(Date.UTC(year, month - 1, day));
    if (exact.getUTCFullYear() !== year || exact.getUTCMonth() !== month - 1 || exact.getUTCDate() !== day) {
      return { value: null, valid: false };
    }
    return { value: normalized, valid: true };
  }

  return { value: parsed.toISOString(), valid: true };
}

export function issue(
  row: number,
  field: string,
  code: string,
  message: string,
  severity: ImportIssueSeverity,
  originalValue: string | null = null,
  suggestion: string | null = null,
): ImportIssue {
  return { row, field, code, message, originalValue, suggestion, severity };
}

export function zodIssueCode(code: string): string {
  if (code === 'too_big') return 'value_too_long';
  if (code === 'invalid_value') return 'invalid_enum';
  return 'invalid_value';
}

function safeMetadataValue(value: string): string {
  return value.replace(/[\r\n\u0000-\u001f\u007f]+/g, ' ').trim();
}

export function appendSourceBlock(description: string | null, source: SourceMetadata, fileName: string): string {
  const lines = [
    '[Import Source]',
    `source_name: ${safeMetadataValue(source.source_name ?? fileName)}`,
    `source_type: ${source.source_type}`,
  ];
  if (source.source_record_id) lines.push(`source_record_id: ${safeMetadataValue(source.source_record_id)}`);
  if (source.source_collected_at) lines.push(`source_collected_at: ${source.source_collected_at}`);
  lines.push(`confidence: ${source.confidence}`);
  if (source.import_note) lines.push(`import_note: ${safeMetadataValue(source.import_note)}`);

  return description ? `${description}\n\n${lines.join('\n')}` : lines.join('\n');
}

export function isBlankRow(row: ImportCell[]): boolean {
  return row.every(cell => cellText(cell) === null);
}
