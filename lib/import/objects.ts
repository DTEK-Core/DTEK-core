import { z } from 'zod';
import { CreateObjectSchema } from '@/lib/validation/schemas';

export const MAX_IMPORT_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_OBJECT_IMPORT_ROWS = 500;

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

export interface ObjectImportRecord {
  name: string;
  type: 'server' | 'workstation' | 'laptop' | 'network' | 'app' | 'database' | 'service' | 'identity' | 'ot' | 'policy' | 'other';
  criticality: 'low' | 'medium' | 'high' | 'critical';
  description: string | null;
  ip_address: string | null;
  os_platform: string | null;
  segment: string | null;
  exposure: 'internal' | 'external' | 'isolated' | null;
}

export interface ObjectImportPreviewRow {
  rowNumber: number;
  object: ObjectImportRecord | null;
  issues: ImportIssue[];
  duplicateInFile: boolean;
  duplicateExisting: boolean;
}

export interface ObjectImportPreview {
  fileName: string;
  totalRows: number;
  validRows: number;
  creatableRows: number;
  errorRows: number;
  warningCount: number;
  issues: ImportIssue[];
  rows: ObjectImportPreviewRow[];
}

export interface ExistingObjectMatch {
  name: string;
  type: string;
  ip_address: string | null;
}

export interface ObjectImportCommitResult {
  totalRows: number;
  created: number;
  skipped: number;
  failed: number;
  failures: Array<{ row: number; name: string; message: string }>;
}

const IMPORT_HEADERS = new Set([
  'name',
  'type',
  'external_id',
  'description',
  'criticality',
  'ip_address',
  'os_platform',
  'segment',
  'exposure',
  'owner_email',
  'source_name',
  'source_type',
  'source_record_id',
  'source_collected_at',
  'confidence',
  'import_note',
]);

const INFRA_TYPES = new Set(['server', 'workstation', 'laptop', 'network', 'ot']);

const TYPE_ALIASES: Record<string, ObjectImportRecord['type']> = {
  server: 'server', 'сервер': 'server', srv: 'server', host: 'server',
  workstation: 'workstation', 'рабочая станция': 'workstation', pc: 'workstation', desktop: 'workstation',
  laptop: 'laptop', 'ноутбук': 'laptop', notebook: 'laptop',
  network: 'network', network_device: 'network', router: 'network', switch: 'network', firewall: 'network', 'сетевое устройство': 'network',
  app: 'app', application: 'app', 'приложение': 'app',
  database: 'database', db: 'database', 'база данных': 'database',
  service: 'service', cloud_service: 'service', 'сервис': 'service',
  identity: 'identity', account: 'identity', user: 'identity', 'учетная запись': 'identity', 'учётная запись': 'identity',
  ot: 'ot', ics: 'ot', iot: 'ot', 'асу тп': 'ot',
  policy: 'policy', document: 'policy', 'политика': 'policy',
  other: 'other', 'прочее': 'other', unknown: 'other',
};

const CRITICALITY_ALIASES: Record<string, ObjectImportRecord['criticality']> = {
  low: 'low', 'низкая': 'low', 'низкий': 'low',
  medium: 'medium', 'средняя': 'medium', 'средний': 'medium',
  high: 'high', 'высокая': 'high', 'высокий': 'high',
  critical: 'critical', 'критичная': 'critical', 'критический': 'critical', crit: 'critical',
};

const EXPOSURE_ALIASES: Record<string, NonNullable<ObjectImportRecord['exposure']>> = {
  internal: 'internal', 'внутренний': 'internal', inside: 'internal', lan: 'internal',
  external: 'external', 'внешний': 'external', internet: 'external', public: 'external',
  isolated: 'isolated', 'изолированный': 'isolated', offline: 'isolated', 'dmz-isolated': 'isolated',
};

const SOURCE_TYPES = [
  'manual_csv', 'asset_inventory', 'vulnerability_export', 'monitoring_export',
  'directory_export', 'security_tool_export', 'network_export', 'other',
] as const;

const SOURCE_CONFIDENCE = ['high', 'medium', 'low'] as const;

const SourceMetadataSchema = z.object({
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

export function validateObjectImportPayload(fileName: string, matrix: ImportMatrix) {
  return ImportPayloadSchema.safeParse({ fileName, matrix });
}

function cellText(value: ImportCell | undefined): string | null {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeHeader(value: ImportCell | undefined): string {
  return (cellText(value) ?? '')
    .replace(/^\uFEFF/, '')
    .toLocaleLowerCase('ru')
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function normalizeEnum<T extends string>(value: string | null, aliases: Record<string, T>): string | null {
  if (!value) return null;
  const key = value.toLocaleLowerCase('ru').trim();
  return aliases[key] ?? key;
}

function normalizeSourceDate(value: string | null): { value: string | null; valid: boolean } {
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

function safeMetadataValue(value: string): string {
  return value.replace(/[\r\n\u0000-\u001f\u007f]+/g, ' ').trim();
}

function issue(
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

function zodIssueCode(code: string): string {
  if (code === 'too_big') return 'value_too_long';
  if (code === 'invalid_value') return 'invalid_enum';
  return 'invalid_value';
}

function appendSourceBlock(
  description: string | null,
  source: z.infer<typeof SourceMetadataSchema>,
  fileName: string,
): string {
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

function isBlankRow(row: ImportCell[]): boolean {
  return row.every(cell => cellText(cell) === null);
}

export function prepareObjectImport(
  fileName: string,
  matrix: ImportMatrix,
  role: string,
  existingObjects: ExistingObjectMatch[],
): ObjectImportPreview {
  const headerRow = matrix[0] ?? [];
  const headerIndex = new Map<string, number>();
  const globalIssues: ImportIssue[] = [];

  headerRow.forEach((cell, index) => {
    const header = normalizeHeader(cell);
    if (!header) return;
    if (headerIndex.has(header)) {
      globalIssues.push(issue(1, header, 'duplicate_column', `Колонка «${header}» указана несколько раз`, 'error'));
      return;
    }
    headerIndex.set(header, index);
    if (!IMPORT_HEADERS.has(header)) {
      globalIssues.push(issue(1, header, 'unknown_column', `Колонка «${header}» не используется при импорте`, 'warning'));
    }
  });

  for (const required of ['name', 'type']) {
    if (!headerIndex.has(required)) {
      globalIssues.push(issue(1, required, 'missing_required_field', `В файле отсутствует обязательная колонка «${required}»`, 'error'));
    }
  }

  const blockingHeader = globalIssues.some(item => item.severity === 'error');
  const dataRows = matrix.slice(1)
    .map((row, index) => ({ row, rowNumber: index + 2 }))
    .filter(({ row }) => !isBlankRow(row));

  const seenInFile = new Set<string>();
  const existingByNameType = new Set(existingObjects.map(object => `${object.name.toLocaleLowerCase('ru')}\u0000${object.type}`));
  const existingIpCounts = new Map<string, number>();
  for (const object of existingObjects) {
    if (object.ip_address) existingIpCounts.set(object.ip_address, (existingIpCounts.get(object.ip_address) ?? 0) + 1);
  }

  const rows: ObjectImportPreviewRow[] = dataRows.map(({ row, rowNumber }) => {
    const rowIssues: ImportIssue[] = [];
    const value = (field: string) => {
      const index = headerIndex.get(field);
      return index === undefined ? null : cellText(row[index]);
    };

    if (blockingHeader) {
      rowIssues.push(issue(rowNumber, '_row', 'invalid_header', 'Исправьте обязательные или повторяющиеся колонки файла', 'error'));
    }
    if (row.length > headerRow.length && row.slice(headerRow.length).some(cell => cellText(cell) !== null)) {
      rowIssues.push(issue(rowNumber, '_row', 'extra_columns', 'В строке есть значения без заголовков колонок', 'warning'));
    }

    const sourceDate = normalizeSourceDate(value('source_collected_at'));
    if (!sourceDate.valid) {
      rowIssues.push(issue(
        rowNumber,
        'source_collected_at',
        'invalid_date',
        'Дата источника не распознана',
        'error',
        value('source_collected_at'),
        'Используйте YYYY-MM-DD, ISO datetime или DD.MM.YYYY',
      ));
    }

    const sourceResult = SourceMetadataSchema.safeParse({
      source_name: value('source_name'),
      source_type: value('source_type')?.toLocaleLowerCase('ru') ?? 'manual_csv',
      source_record_id: value('source_record_id') ?? value('external_id'),
      source_collected_at: sourceDate.value,
      confidence: value('confidence')?.toLocaleLowerCase('ru') ?? 'medium',
      import_note: value('import_note'),
    });

    if (!sourceResult.success) {
      for (const zIssue of sourceResult.error.issues) {
        const field = String(zIssue.path[0] ?? '_row');
        rowIssues.push(issue(rowNumber, field, zodIssueCode(zIssue.code), zIssue.message, 'error', value(field)));
      }
    }

    const ownerEmail = value('owner_email');
    if (ownerEmail) {
      const emailResult = z.email().safeParse(ownerEmail);
      if (!emailResult.success) {
        rowIssues.push(issue(rowNumber, 'owner_email', 'invalid_value', 'Некорректный email владельца', 'error', ownerEmail));
      } else {
        rowIssues.push(issue(rowNumber, 'owner_email', 'unsupported_mapping', 'owner_email пока не назначает владельца объекта', 'warning', ownerEmail));
      }
    }

    const source = sourceResult.success ? sourceResult.data : null;
    const type = normalizeEnum(value('type'), TYPE_ALIASES);
    const criticality = normalizeEnum(value('criticality'), CRITICALITY_ALIASES) ?? 'medium';
    const exposure = normalizeEnum(value('exposure'), EXPOSURE_ALIASES);
    const description = source ? appendSourceBlock(value('description'), source, fileName) : value('description');

    const parsed = CreateObjectSchema.safeParse({
      name: value('name'),
      type,
      criticality,
      description,
      ip_address: value('ip_address'),
      os_platform: value('os_platform'),
      segment: value('segment'),
      exposure,
    });

    if (!parsed.success) {
      for (const zIssue of parsed.error.issues) {
        const field = String(zIssue.path[0] ?? '_row');
        const original = value(field);
        const code = !original && (field === 'name' || field === 'type')
          ? 'missing_required_field'
          : zodIssueCode(zIssue.code);
        rowIssues.push(issue(rowNumber, field, code, zIssue.message, 'error', original));
      }
    }

    let object: ObjectImportRecord | null = null;
    let duplicateInFile = false;
    let duplicateExisting = false;

    if (parsed.success) {
      object = parsed.data as ObjectImportRecord;

      if (role === 'admin' && !INFRA_TYPES.has(object.type)) {
        rowIssues.push(issue(
          rowNumber,
          'type',
          'rbac_denied',
          'Администратор может импортировать только инфраструктурные объекты',
          'error',
          object.type,
        ));
      }

      const key = `${object.name.toLocaleLowerCase('ru')}\u0000${object.type}`;
      duplicateInFile = seenInFile.has(key);
      if (duplicateInFile) {
        rowIssues.push(issue(rowNumber, 'name', 'duplicate_in_file', 'Объект с таким именем и типом уже есть в файле', 'warning', object.name));
      } else {
        seenInFile.add(key);
      }

      duplicateExisting = existingByNameType.has(key)
        || (!!object.ip_address && existingIpCounts.get(object.ip_address) === 1);
      if (duplicateExisting) {
        rowIssues.push(issue(rowNumber, 'name', 'possible_duplicate_existing', 'Похожий объект уже существует в организации и будет пропущен', 'warning', object.name));
      }
    }

    return { rowNumber, object, issues: rowIssues, duplicateInFile, duplicateExisting };
  });

  const allIssues = [...globalIssues, ...rows.flatMap(row => row.issues)];
  const validRows = rows.filter(row => row.object && !row.issues.some(item => item.severity === 'error')).length;
  const creatableRows = rows.filter(row => (
    row.object
    && !row.issues.some(item => item.severity === 'error')
    && !row.duplicateInFile
    && !row.duplicateExisting
  )).length;

  return {
    fileName,
    totalRows: rows.length,
    validRows,
    creatableRows,
    errorRows: rows.length - validRows,
    warningCount: allIssues.filter(item => item.severity === 'warning').length,
    issues: allIssues,
    rows,
  };
}
