import { z } from 'zod';
import { CreateObjectSchema } from '@/lib/validation/schemas';
import {
  MAX_IMPORT_ROWS,
  DEFAULT_IMPORT_SOURCE,
  SourceMetadataSchema,
  appendSourceBlock,
  cellText,
  isBlankRow,
  issue,
  normalizeEnum,
  normalizeHeader,
  normalizeImportDate,
  sourcePreview,
  validateImportPayload,
  zodIssueCode,
  type ImportIssue,
  type ImportMatrix,
  type ImportPreviewSummary,
  type ImportCommitSummary,
  type ImportSourceDefaults,
} from '@/lib/import/shared';

export const MAX_OBJECT_IMPORT_ROWS = MAX_IMPORT_ROWS;
export { validateImportPayload as validateObjectImportPayload };
export type { ImportCell, ImportMatrix, ImportIssue, ImportIssueSeverity } from '@/lib/import/shared';

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

export interface ObjectImportPreview extends ImportPreviewSummary {
  rows: ObjectImportPreviewRow[];
}

export interface ExistingObjectMatch {
  name: string;
  type: string;
  ip_address: string | null;
}

export type ObjectImportCommitResult = ImportCommitSummary;

const IMPORT_HEADERS = new Set([
  'name', 'type', 'external_id', 'description', 'criticality', 'ip_address',
  'os_platform', 'segment', 'exposure', 'owner_email', 'source_name',
  'source_type', 'source_record_id', 'source_collected_at', 'confidence', 'import_note',
]);

const INFRA_TYPES = new Set(['server', 'workstation', 'laptop', 'network', 'ot']);
const SOURCE_OVERRIDE_FIELDS = [
  'external_id', 'source_name', 'source_type', 'source_record_id',
  'source_collected_at', 'confidence', 'import_note',
] as const;

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

export function prepareObjectImport(
  fileName: string,
  matrix: ImportMatrix,
  role: string,
  existingObjects: ExistingObjectMatch[],
  sourceDefaults: ImportSourceDefaults = DEFAULT_IMPORT_SOURCE,
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
  let sourceOverrideRows = 0;
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
    if (SOURCE_OVERRIDE_FIELDS.some(field => value(field) !== null)) sourceOverrideRows += 1;

    if (blockingHeader) rowIssues.push(issue(rowNumber, '_row', 'invalid_header', 'Исправьте обязательные или повторяющиеся колонки файла', 'error'));
    if (row.length > headerRow.length && row.slice(headerRow.length).some(cell => cellText(cell) !== null)) {
      rowIssues.push(issue(rowNumber, '_row', 'extra_columns', 'В строке есть значения без заголовков колонок', 'warning'));
    }

    const sourceDate = normalizeImportDate(value('source_collected_at') ?? sourceDefaults.source_collected_at);
    if (!sourceDate.valid) {
      rowIssues.push(issue(rowNumber, 'source_collected_at', 'invalid_date', 'Дата источника не распознана', 'error', value('source_collected_at'), 'Используйте YYYY-MM-DD, ISO datetime или DD.MM.YYYY'));
    }

    const sourceResult = SourceMetadataSchema.safeParse({
      source_name: value('source_name') ?? sourceDefaults.source_name,
      source_type: value('source_type')?.toLocaleLowerCase('ru') ?? sourceDefaults.source_type,
      source_record_id: value('source_record_id') ?? value('external_id'),
      source_collected_at: sourceDate.value,
      confidence: value('confidence')?.toLocaleLowerCase('ru') ?? sourceDefaults.confidence,
      import_note: value('import_note') ?? sourceDefaults.import_note,
    });
    if (!sourceResult.success) {
      for (const zIssue of sourceResult.error.issues) {
        const field = String(zIssue.path[0] ?? '_row');
        rowIssues.push(issue(rowNumber, field, zodIssueCode(zIssue.code), zIssue.message, 'error', value(field)));
      }
    }

    const ownerEmail = value('owner_email');
    if (ownerEmail) {
      if (!z.email().safeParse(ownerEmail).success) {
        rowIssues.push(issue(rowNumber, 'owner_email', 'invalid_value', 'Некорректный email владельца', 'error', ownerEmail));
      } else {
        rowIssues.push(issue(rowNumber, 'owner_email', 'unsupported_mapping', 'owner_email пока не назначает владельца объекта', 'warning', ownerEmail));
      }
    }

    const source = sourceResult.success ? sourceResult.data : null;
    const parsed = CreateObjectSchema.safeParse({
      name: value('name'),
      type: normalizeEnum(value('type'), TYPE_ALIASES),
      criticality: normalizeEnum(value('criticality'), CRITICALITY_ALIASES) ?? 'medium',
      description: source ? appendSourceBlock(value('description'), source, fileName) : value('description'),
      ip_address: value('ip_address'),
      os_platform: value('os_platform'),
      segment: value('segment'),
      exposure: normalizeEnum(value('exposure'), EXPOSURE_ALIASES),
    });
    if (!parsed.success) {
      for (const zIssue of parsed.error.issues) {
        const field = String(zIssue.path[0] ?? '_row');
        const original = value(field);
        const code = !original && (field === 'name' || field === 'type') ? 'missing_required_field' : zodIssueCode(zIssue.code);
        rowIssues.push(issue(rowNumber, field, code, zIssue.message, 'error', original));
      }
    }

    let object: ObjectImportRecord | null = null;
    let duplicateInFile = false;
    let duplicateExisting = false;
    if (parsed.success) {
      object = parsed.data as ObjectImportRecord;
      if (role === 'admin' && !INFRA_TYPES.has(object.type)) {
        rowIssues.push(issue(rowNumber, 'type', 'rbac_denied', 'Администратор может импортировать только инфраструктурные объекты', 'error', object.type));
      }

      const key = `${object.name.toLocaleLowerCase('ru')}\u0000${object.type}`;
      duplicateInFile = seenInFile.has(key);
      if (duplicateInFile) rowIssues.push(issue(rowNumber, 'name', 'duplicate_in_file', 'Объект с таким именем и типом уже есть в файле', 'warning', object.name));
      else seenInFile.add(key);

      duplicateExisting = existingByNameType.has(key) || (!!object.ip_address && existingIpCounts.get(object.ip_address) === 1);
      if (duplicateExisting) rowIssues.push(issue(rowNumber, 'name', 'possible_duplicate_existing', 'Похожий объект уже существует в организации и будет пропущен', 'warning', object.name));
    }

    return { rowNumber, object, issues: rowIssues, duplicateInFile, duplicateExisting };
  });

  const allIssues = [...globalIssues, ...rows.flatMap(row => row.issues)];
  const validRows = rows.filter(row => row.object && !row.issues.some(item => item.severity === 'error')).length;
  const creatableRows = rows.filter(row => row.object && !row.issues.some(item => item.severity === 'error') && !row.duplicateInFile && !row.duplicateExisting).length;

  return {
    fileName,
    totalRows: rows.length,
    validRows,
    creatableRows,
    errorRows: rows.length - validRows,
    duplicateRows: rows.filter(row => row.duplicateInFile || row.duplicateExisting).length,
    warningCount: allIssues.filter(item => item.severity === 'warning').length,
    sourceMetadata: sourcePreview(fileName, sourceDefaults, sourceOverrideRows),
    issues: allIssues,
    rows,
  };
}
