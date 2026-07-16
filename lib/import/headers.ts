import {
  issue,
  normalizeHeader,
  type ImportCell,
  type ImportIssue,
  type ImportMatrix,
} from '@/lib/import/shared';

export type ImportDatasetType = 'objects' | 'risks';

interface HeaderAlias {
  field: string;
  priority: number;
}

interface HeaderCandidate extends HeaderAlias {
  index: number;
  raw: string;
}

export interface ResolvedImportHeaders {
  headerIndex: Map<string, number>;
  issues: ImportIssue[];
}

const OBJECT_HEADERS = new Set([
  'name', 'type', 'external_id', 'description', 'criticality', 'ip_address',
  'os_platform', 'segment', 'exposure', 'owner_email', 'source_name',
  'source_type', 'source_record_id', 'source_collected_at', 'confidence', 'import_note',
]);

const RISK_HEADERS = new Set([
  'title', 'severity', 'external_id', 'description', 'category', 'status',
  'probability', 'cvss_score', 'impact', 'sla_days', 'due_date',
  'linked_object_name', 'linked_object_ip', 'linked_object_external_id',
  'owner_email', 'source_name', 'source_type', 'source_record_id',
  'source_collected_at', 'confidence', 'import_note',
]);

const COMMON_ALIASES: Record<string, HeaderAlias> = {
  source: { field: 'source_name', priority: 50 },
  'источник': { field: 'source_name', priority: 50 },
  'источник_данных': { field: 'source_name', priority: 50 },
  'тип_источника': { field: 'source_type', priority: 50 },
  'дата_сбора': { field: 'source_collected_at', priority: 60 },
  updated_at: { field: 'source_collected_at', priority: 30 },
  'уверенность': { field: 'confidence', priority: 50 },
  confidence_level: { field: 'confidence', priority: 50 },
  'комментарий_импорта': { field: 'import_note', priority: 50 },
};

const OBJECT_ALIASES: Record<string, HeaderAlias> = {
  ...COMMON_ALIASES,
  'название': { field: 'name', priority: 60 },
  'имя': { field: 'name', priority: 60 },
  object_name: { field: 'name', priority: 70 },
  'тип': { field: 'type', priority: 60 },
  'тип_объекта': { field: 'type', priority: 70 },
  object_type: { field: 'type', priority: 70 },
  'описание': { field: 'description', priority: 60 },
  'критичность': { field: 'criticality', priority: 60 },
  criticality_key: { field: 'criticality', priority: 90 },
  'критичность_key': { field: 'criticality', priority: 90 },
  ip: { field: 'ip_address', priority: 60 },
  'ip_адрес': { field: 'ip_address', priority: 60 },
  'ос': { field: 'os_platform', priority: 60 },
  platform: { field: 'os_platform', priority: 50 },
  'операционная_система': { field: 'os_platform', priority: 60 },
  'сегмент': { field: 'segment', priority: 60 },
  'экспозиция': { field: 'exposure', priority: 60 },
  'доступность': { field: 'exposure', priority: 40 },
};

const RISK_ALIASES: Record<string, HeaderAlias> = {
  ...COMMON_ALIASES,
  'название': { field: 'title', priority: 60 },
  risk_title: { field: 'title', priority: 70 },
  'описание': { field: 'description', priority: 60 },
  category_key: { field: 'category', priority: 90 },
  'категория_key': { field: 'category', priority: 90 },
  'категория': { field: 'category', priority: 60 },
  severity_key: { field: 'severity', priority: 90 },
  'критичность_key': { field: 'severity', priority: 90 },
  'критичность': { field: 'severity', priority: 60 },
  'вероятность': { field: 'probability', priority: 60 },
  cvss: { field: 'cvss_score', priority: 70 },
  status_key: { field: 'status', priority: 90 },
  'статус_key': { field: 'status', priority: 90 },
  'статус': { field: 'status', priority: 60 },
  'влияние': { field: 'impact', priority: 60 },
  'срок_устранения': { field: 'due_date', priority: 60 },
  linked_objects: { field: 'linked_object_name', priority: 60 },
  linked_object_names: { field: 'linked_object_name', priority: 70 },
  'связанные_объекты': { field: 'linked_object_name', priority: 60 },
};

const OBJECT_IGNORED_HEADERS = new Set([
  'id', 'object_id', 'status', 'trust_score', 'trust_level', 'owner', 'author',
  'created_at', 'risk_count', 'open_risk_count', 'connection_count',
]);

const RISK_IGNORED_HEADERS = new Set([
  'id', 'risk_id', 'owner', 'author', 'linked_object_ids', 'created_at',
  'evidence_note',
]);

function config(type: ImportDatasetType) {
  return type === 'objects'
    ? { supported: OBJECT_HEADERS, aliases: OBJECT_ALIASES, ignored: OBJECT_IGNORED_HEADERS }
    : { supported: RISK_HEADERS, aliases: RISK_ALIASES, ignored: RISK_IGNORED_HEADERS };
}

function listSummary(values: string[]): string {
  const visible = values.slice(0, 8).map(value => `\`${value}\``).join(', ');
  return values.length > 8 ? `${visible} и ещё ${values.length - 8}` : visible;
}

export function resolveImportHeaders(
  type: ImportDatasetType,
  headerRow: ImportCell[],
): ResolvedImportHeaders {
  const { supported, aliases, ignored } = config(type);
  const candidates = new Map<string, HeaderCandidate>();
  const seenRaw = new Set<string>();
  const unknownHeaders: string[] = [];
  const ignoredHeaders: string[] = [];
  const issues: ImportIssue[] = [];

  headerRow.forEach((cell, index) => {
    const raw = normalizeHeader(cell);
    if (!raw) return;

    if (seenRaw.has(raw)) {
      issues.push(issue(1, raw, 'duplicate_column', `Колонка «${raw}» указана несколько раз`, 'error'));
      return;
    }
    seenRaw.add(raw);

    if (ignored.has(raw)) {
      ignoredHeaders.push(raw);
      return;
    }

    const definition = supported.has(raw)
      ? { field: raw, priority: 100 }
      : aliases[raw];
    if (!definition) {
      unknownHeaders.push(raw);
      return;
    }

    const next: HeaderCandidate = { ...definition, index, raw };
    const current = candidates.get(definition.field);
    if (!current) {
      candidates.set(definition.field, next);
      return;
    }

    if (next.priority > current.priority) {
      ignoredHeaders.push(current.raw);
      candidates.set(definition.field, next);
    } else if (next.priority < current.priority) {
      ignoredHeaders.push(next.raw);
    } else {
      issues.push(issue(
        1,
        definition.field,
        'duplicate_column',
        `Колонки «${current.raw}» и «${next.raw}» сопоставляются с одним полем «${definition.field}»`,
        'error',
      ));
    }
  });

  if (unknownHeaders.length > 0) {
    issues.push(issue(
      1,
      '_header',
      'unknown_columns',
      `Неиспользуемые колонки (${unknownHeaders.length}): ${listSummary(unknownHeaders)}`,
      'warning',
      unknownHeaders.join(', '),
      'Проверьте шаблон импорта; эти колонки не будут записаны',
    ));
  }

  if (ignoredHeaders.length > 0) {
    const uniqueIgnored = [...new Set(ignoredHeaders)];
    issues.push(issue(
      1,
      '_header',
      'ignored_columns',
      `Служебные или дублирующие колонки безопасно пропущены (${uniqueIgnored.length}): ${listSummary(uniqueIgnored)}`,
      'info',
      uniqueIgnored.join(', '),
    ));
  }

  const mapped = [...candidates.values()].filter(candidate => candidate.raw !== candidate.field);
  if (mapped.length > 0) {
    issues.push(issue(
      1,
      '_header',
      'mapped_columns',
      `Сопоставлены заголовки (${mapped.length}): ${listSummary(mapped.map(item => `${item.raw} → ${item.field}`))}`,
      'info',
    ));
  }

  return {
    headerIndex: new Map([...candidates.entries()].map(([field, candidate]) => [field, candidate.index])),
    issues,
  };
}

function detectedFields(type: ImportDatasetType, headerRow: ImportCell[]): Set<string> {
  const { supported, aliases } = config(type);
  const fields = new Set<string>();
  for (const cell of headerRow) {
    const raw = normalizeHeader(cell);
    if (!raw) continue;
    if (supported.has(raw)) fields.add(raw);
    else if (aliases[raw]) fields.add(aliases[raw].field);
  }
  return fields;
}

function score(fields: Set<string>, required: string[], signals: string[]): number {
  const requiredScore = required.filter(field => fields.has(field)).length * 3;
  const signalScore = signals.filter(field => fields.has(field)).length;
  return requiredScore + signalScore;
}

export function detectImportDatasetType(matrix: ImportMatrix): ImportDatasetType | null {
  const headerRow = matrix[0] ?? [];
  const objectFields = detectedFields('objects', headerRow);
  const riskFields = detectedFields('risks', headerRow);
  const objectScore = score(objectFields, ['name', 'type'], ['criticality', 'ip_address', 'os_platform', 'segment', 'exposure']);
  const riskScore = score(riskFields, ['title', 'severity'], ['category', 'status', 'probability', 'cvss_score', 'linked_object_name']);

  if (objectScore >= 6 && objectScore > riskScore) return 'objects';
  if (riskScore >= 6 && riskScore > objectScore) return 'risks';
  return null;
}

export function importTypeMismatchMessage(
  expected: ImportDatasetType,
  matrix: ImportMatrix,
): string | null {
  const detected = detectImportDatasetType(matrix);
  if (!detected || detected === expected) return null;
  return detected === 'risks'
    ? 'Похоже, выбран файл реестра рисков. Откройте раздел «Импорт рисков».'
    : 'Похоже, выбран файл объектов. Откройте раздел «Импорт объектов».';
}
