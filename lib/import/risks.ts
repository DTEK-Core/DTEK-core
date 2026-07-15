import { z } from 'zod';
import { CreateRiskSchema } from '@/lib/validation/schemas';
import {
  MAX_IMPORT_ROWS,
  SourceMetadataSchema,
  appendSourceBlock,
  cellText,
  isBlankRow,
  issue,
  normalizeEnum,
  normalizeHeader,
  normalizeImportDate,
  validateImportPayload,
  zodIssueCode,
  type ImportCommitSummary,
  type ImportIssue,
  type ImportMatrix,
  type ImportPreviewSummary,
} from '@/lib/import/shared';

export const MAX_RISK_IMPORT_ROWS = MAX_IMPORT_ROWS;
export { validateImportPayload as validateRiskImportPayload };

type RiskCategory = 'vulnerability' | 'configuration' | 'access' | 'network' | 'compliance' | 'incident' | 'monitoring' | 'organizational' | 'physical' | 'human' | 'other';
type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
type RiskProbability = 'low' | 'medium' | 'high';
type RiskStatus = 'open' | 'in_progress' | 'mitigated' | 'accepted' | 'closed';

export interface RiskImportRecord {
  title: string;
  description: string | null;
  category: RiskCategory;
  severity: RiskSeverity;
  probability: RiskProbability | null;
  cvss_score: number | null;
  status: RiskStatus;
  impact: string | null;
  sla_days: number | null;
  due_date: string | null;
  linkedObjectId: string | null;
  linkedObjectName: string | null;
}

export interface RiskImportPreviewRow {
  rowNumber: number;
  risk: RiskImportRecord | null;
  issues: ImportIssue[];
  duplicateInFile: boolean;
  duplicateExisting: boolean;
}

export interface RiskImportPreview extends ImportPreviewSummary {
  rows: RiskImportPreviewRow[];
}

export interface RiskImportObjectMatch {
  id: string;
  name: string;
  ip_address: string | null;
}

export interface ExistingRiskMatch {
  title: string;
  category: string;
  severity: string;
  linkedObjectIds: string[];
}

export interface RiskImportCommitResult extends ImportCommitSummary {
  linked: number;
  unlinked: number;
  linkFailures: number;
}

const IMPORT_HEADERS = new Set([
  'title', 'severity', 'external_id', 'description', 'category', 'status',
  'probability', 'cvss_score', 'impact', 'sla_days', 'due_date',
  'linked_object_name', 'linked_object_ip', 'linked_object_external_id',
  'owner_email', 'source_name', 'source_type', 'source_record_id',
  'source_collected_at', 'confidence', 'import_note',
]);

const CATEGORY_ALIASES: Record<string, RiskCategory> = {
  vulnerability: 'vulnerability', 'уязвимость': 'vulnerability', vuln: 'vulnerability', cve: 'vulnerability',
  configuration: 'configuration', 'конфигурация': 'configuration', config: 'configuration', misconfiguration: 'configuration',
  access: 'access', 'доступ': 'access', privilege: 'access', iam: 'access',
  network: 'network', 'сеть': 'network', segmentation: 'network', exposure: 'network',
  compliance: 'compliance', 'соответствие': 'compliance', regulation: 'compliance', audit: 'compliance',
  incident: 'incident', 'инцидент': 'incident', event: 'incident',
  monitoring: 'monitoring', 'мониторинг': 'monitoring', logging: 'monitoring', coverage: 'monitoring',
  organizational: 'organizational', 'организационный': 'organizational', process: 'organizational',
  physical: 'physical', 'физический': 'physical',
  human: 'human', 'человеческий фактор': 'human', people: 'human',
  other: 'other', 'прочее': 'other',
};

const SEVERITY_ALIASES: Record<string, RiskSeverity> = {
  low: 'low', 'низкий': 'low', 'низкая': 'low',
  medium: 'medium', 'средний': 'medium', 'средняя': 'medium',
  high: 'high', 'высокий': 'high', 'высокая': 'high',
  critical: 'critical', 'критический': 'critical', 'критичная': 'critical', crit: 'critical',
};

const PROBABILITY_ALIASES: Record<string, RiskProbability> = {
  low: 'low', 'низкая': 'low', 'низкий': 'low',
  medium: 'medium', 'средняя': 'medium', 'средний': 'medium',
  high: 'high', 'высокая': 'high', 'высокий': 'high',
};

const STATUS_ALIASES: Record<string, RiskStatus> = {
  open: 'open', 'открыт': 'open', 'новый': 'open',
  in_progress: 'in_progress', 'в работе': 'in_progress', progress: 'in_progress',
  mitigated: 'mitigated', 'устранён': 'mitigated', 'устранен': 'mitigated',
  accepted: 'accepted', 'принят': 'accepted',
  closed: 'closed', 'закрыт': 'closed',
};

const StatusSchema = z.enum(['open', 'in_progress', 'mitigated', 'accepted', 'closed'], { message: 'Недопустимый статус риска' });

function parseCvss(value: string | null, row: number, issues: ImportIssue[]): number | null {
  if (!value) return null;
  const normalized = value.replace(',', '.');
  const parsed = Number(normalized);
  if (!/^\d+(?:\.\d+)?$/.test(normalized) || !Number.isFinite(parsed) || parsed < 0 || parsed > 10) {
    issues.push(issue(row, 'cvss_score', 'invalid_number', 'CVSS должен быть числом от 0 до 10', 'error', value));
    return null;
  }
  return parsed;
}

function parseSlaDays(value: string | null, row: number, issues: ImportIssue[]): number | null {
  if (!value) return null;
  if (!/^\d+$/.test(value) || Number(value) <= 0 || Number(value) > 36_500) {
    issues.push(issue(row, 'sla_days', 'invalid_number', 'SLA должен быть целым числом от 1 до 36500', 'error', value));
    return null;
  }
  return Number(value);
}

function matchObject(
  rowNumber: number,
  name: string | null,
  ip: string | null,
  externalId: string | null,
  objectsByName: Map<string, RiskImportObjectMatch[]>,
  objectsByIp: Map<string, RiskImportObjectMatch[]>,
  issues: ImportIssue[],
): RiskImportObjectMatch | null {
  if (name && name.length > 200) issues.push(issue(rowNumber, 'linked_object_name', 'value_too_long', 'Название объекта не должно превышать 200 символов', 'error', name));
  if (ip && ip.length > 45) issues.push(issue(rowNumber, 'linked_object_ip', 'value_too_long', 'IP-адрес не должен превышать 45 символов', 'error', ip));
  if (externalId && externalId.length > 200) issues.push(issue(rowNumber, 'linked_object_external_id', 'value_too_long', 'External ID не должен превышать 200 символов', 'error', externalId));

  const nameMatches = name ? (objectsByName.get(name.toLocaleLowerCase('ru')) ?? []) : [];
  const ipMatches = ip ? (objectsByIp.get(ip) ?? []) : [];
  if (nameMatches.length > 1) issues.push(issue(rowNumber, 'linked_object_name', 'object_ambiguous', 'Найдено несколько объектов с таким именем', 'warning', name));
  if (ipMatches.length > 1) issues.push(issue(rowNumber, 'linked_object_ip', 'object_ambiguous', 'Найдено несколько объектов с таким IP-адресом', 'warning', ip));

  const byName = nameMatches.length === 1 ? nameMatches[0] : null;
  const byIp = ipMatches.length === 1 ? ipMatches[0] : null;
  if (byName && byIp && byName.id !== byIp.id) {
    issues.push(issue(rowNumber, '_row', 'object_reference_conflict', 'Имя и IP указывают на разные объекты', 'error'));
    return null;
  }

  const matched = byName ?? byIp;
  if (externalId) {
    issues.push(issue(rowNumber, 'linked_object_external_id', 'unsupported_mapping', 'External ID объекта пока не используется для поиска', 'warning', externalId));
  }
  if (!matched && (name || ip || externalId)) {
    issues.push(issue(rowNumber, '_row', 'object_not_found', 'Объект для связи не найден; риск будет создан без связи', 'warning'));
  }
  return matched;
}

export function prepareRiskImport(
  fileName: string,
  matrix: ImportMatrix,
  objects: RiskImportObjectMatch[],
  existingRisks: ExistingRiskMatch[],
): RiskImportPreview {
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
    if (!IMPORT_HEADERS.has(header)) globalIssues.push(issue(1, header, 'unknown_column', `Колонка «${header}» не используется при импорте`, 'warning'));
  });
  for (const required of ['title', 'severity']) {
    if (!headerIndex.has(required)) globalIssues.push(issue(1, required, 'missing_required_field', `В файле отсутствует обязательная колонка «${required}»`, 'error'));
  }

  const blockingHeader = globalIssues.some(item => item.severity === 'error');
  const dataRows = matrix.slice(1).map((row, index) => ({ row, rowNumber: index + 2 })).filter(({ row }) => !isBlankRow(row));
  const objectsByName = new Map<string, RiskImportObjectMatch[]>();
  const objectsByIp = new Map<string, RiskImportObjectMatch[]>();
  for (const object of objects) {
    const nameKey = object.name.toLocaleLowerCase('ru');
    objectsByName.set(nameKey, [...(objectsByName.get(nameKey) ?? []), object]);
    if (object.ip_address) objectsByIp.set(object.ip_address, [...(objectsByIp.get(object.ip_address) ?? []), object]);
  }

  const existingKeys = new Set(existingRisks.map(risk => `${risk.title.toLocaleLowerCase('ru')}\u0000${risk.category}\u0000${risk.severity}`));
  const existingTitleObjects = new Set(existingRisks.flatMap(risk => risk.linkedObjectIds.map(objectId => `${risk.title.toLocaleLowerCase('ru')}\u0000${objectId}`)));
  const seenInFile = new Set<string>();

  const rows: RiskImportPreviewRow[] = dataRows.map(({ row, rowNumber }) => {
    const rowIssues: ImportIssue[] = [];
    const value = (field: string) => {
      const index = headerIndex.get(field);
      return index === undefined ? null : cellText(row[index]);
    };

    if (blockingHeader) rowIssues.push(issue(rowNumber, '_row', 'invalid_header', 'Исправьте обязательные или повторяющиеся колонки файла', 'error'));
    if (row.length > headerRow.length && row.slice(headerRow.length).some(cell => cellText(cell) !== null)) {
      rowIssues.push(issue(rowNumber, '_row', 'extra_columns', 'В строке есть значения без заголовков колонок', 'warning'));
    }

    const sourceDate = normalizeImportDate(value('source_collected_at'));
    if (!sourceDate.valid) rowIssues.push(issue(rowNumber, 'source_collected_at', 'invalid_date', 'Дата источника не распознана', 'error', value('source_collected_at'), 'Используйте YYYY-MM-DD, ISO datetime или DD.MM.YYYY'));
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
      if (!z.email().safeParse(ownerEmail).success) rowIssues.push(issue(rowNumber, 'owner_email', 'invalid_value', 'Некорректный email владельца', 'error', ownerEmail));
      else rowIssues.push(issue(rowNumber, 'owner_email', 'unsupported_mapping', 'owner_email пока не назначает владельца риска', 'warning', ownerEmail));
    }

    const linkedObject = matchObject(
      rowNumber,
      value('linked_object_name'),
      value('linked_object_ip'),
      value('linked_object_external_id'),
      objectsByName,
      objectsByIp,
      rowIssues,
    );
    const cvssScore = parseCvss(value('cvss_score'), rowNumber, rowIssues);
    const slaDays = parseSlaDays(value('sla_days'), rowNumber, rowIssues);
    const dueDateResult = normalizeImportDate(value('due_date'));
    if (!dueDateResult.valid) rowIssues.push(issue(rowNumber, 'due_date', 'invalid_date', 'Срок устранения не распознан', 'error', value('due_date'), 'Используйте YYYY-MM-DD, ISO datetime или DD.MM.YYYY'));
    const dueDate = dueDateResult.value ?? (slaDays ? new Date(Date.now() + slaDays * 86_400_000).toISOString() : null);
    const statusResult = StatusSchema.safeParse(normalizeEnum(value('status'), STATUS_ALIASES) ?? 'open');
    if (!statusResult.success) rowIssues.push(issue(rowNumber, 'status', 'invalid_enum', statusResult.error.issues[0]?.message ?? 'Недопустимый статус', 'error', value('status')));

    const source = sourceResult.success ? sourceResult.data : null;
    const parsed = CreateRiskSchema.safeParse({
      title: value('title'),
      description: source ? appendSourceBlock(value('description'), source, fileName) : value('description'),
      category: normalizeEnum(value('category'), CATEGORY_ALIASES) ?? 'other',
      severity: normalizeEnum(value('severity'), SEVERITY_ALIASES),
      probability: normalizeEnum(value('probability'), PROBABILITY_ALIASES),
      cvss_score: cvssScore,
      impact: value('impact'),
      sla_days: slaDays,
      object_id: linkedObject?.id ?? null,
    });
    if (!parsed.success) {
      for (const zIssue of parsed.error.issues) {
        const field = String(zIssue.path[0] ?? '_row');
        const original = value(field);
        const code = !original && (field === 'title' || field === 'severity') ? 'missing_required_field' : zodIssueCode(zIssue.code);
        rowIssues.push(issue(rowNumber, field, code, zIssue.message, 'error', original));
      }
    }

    let risk: RiskImportRecord | null = null;
    let duplicateInFile = false;
    let duplicateExisting = false;
    if (parsed.success && statusResult.success) {
      risk = {
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        category: parsed.data.category,
        severity: parsed.data.severity,
        probability: parsed.data.probability ?? null,
        cvss_score: parsed.data.cvss_score ?? null,
        impact: parsed.data.impact ?? null,
        sla_days: parsed.data.sla_days ?? null,
        status: statusResult.data,
        due_date: dueDate,
        linkedObjectId: linkedObject?.id ?? null,
        linkedObjectName: linkedObject?.name ?? null,
      } as RiskImportRecord;

      const key = `${risk.title.toLocaleLowerCase('ru')}\u0000${risk.category}\u0000${risk.severity}`;
      duplicateInFile = seenInFile.has(key);
      if (duplicateInFile) rowIssues.push(issue(rowNumber, 'title', 'duplicate_in_file', 'Похожий риск уже есть в файле', 'warning', risk.title));
      else seenInFile.add(key);

      duplicateExisting = existingKeys.has(key)
        || (!!risk.linkedObjectId && existingTitleObjects.has(`${risk.title.toLocaleLowerCase('ru')}\u0000${risk.linkedObjectId}`));
      if (duplicateExisting) rowIssues.push(issue(rowNumber, 'title', 'possible_duplicate_existing', 'Похожий риск уже существует в организации и будет пропущен', 'warning', risk.title));
    }

    return { rowNumber, risk, issues: rowIssues, duplicateInFile, duplicateExisting };
  });

  const allIssues = [...globalIssues, ...rows.flatMap(row => row.issues)];
  const validRows = rows.filter(row => row.risk && !row.issues.some(item => item.severity === 'error')).length;
  const creatableRows = rows.filter(row => row.risk && !row.issues.some(item => item.severity === 'error') && !row.duplicateInFile && !row.duplicateExisting).length;

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
