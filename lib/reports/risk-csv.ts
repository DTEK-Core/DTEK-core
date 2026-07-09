import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { serializeCsv, withUtf8Bom, type CsvColumn } from '@/lib/reports/csv';

const ALLOWED_EXPORT_ROLES = ['owner', 'analyst'];
const ALLOWED_SEVERITIES = ['low', 'medium', 'high', 'critical'];
const ALLOWED_STATUSES = ['open', 'in_progress', 'accepted', 'mitigated', 'closed'];

const CATEGORY_LABELS: Record<string, string> = {
  vulnerability: 'Уязвимость',
  configuration: 'Конфигурация',
  access: 'Доступ',
  network: 'Сеть',
  compliance: 'Соответствие',
  incident: 'Инцидент',
  monitoring: 'Мониторинг',
  organizational: 'Организационный',
  physical: 'Физический',
  human: 'Человеческий',
  other: 'Прочее',
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'Критический',
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Открыт',
  in_progress: 'В работе',
  accepted: 'Принят',
  mitigated: 'Устранён',
  closed: 'Закрыт',
};

const PROBABILITY_LABELS: Record<string, string> = {
  high: 'Высокая',
  medium: 'Средняя',
  low: 'Низкая',
};

interface ProfileRaw {
  role: string;
  organization_id: string | null;
}

interface ProfileLinkRaw {
  full_name: string;
}

interface ObjLinkRaw {
  id: string;
  name: string;
}

interface ObjRiskRaw {
  objects: ObjLinkRaw | ObjLinkRaw[] | null;
}

interface RiskRaw {
  id: string;
  title: string;
  description: string | null;
  category: string;
  severity: string;
  probability: string | null;
  cvss_score: number | null;
  status: string;
  impact: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  owner: ProfileLinkRaw | ProfileLinkRaw[] | null;
  author: ProfileLinkRaw | ProfileLinkRaw[] | null;
  object_risks: ObjRiskRaw[] | null;
}

export interface RiskCsvRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  categoryLabel: string;
  severity: string;
  severityLabel: string;
  probability: string | null;
  probabilityLabel: string;
  cvssScore: number | null;
  status: string;
  statusLabel: string;
  impact: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  ownerName: string | null;
  authorName: string | null;
  linkedObjectNames: string[];
  linkedObjectIds: string[];
}

export interface RiskCsvExport {
  csv: string;
  filename: string;
  rowCount: number;
  orgId: string;
  userId: string;
  userEmail?: string;
  filters: {
    q: string | null;
    severity: string | null;
    status: string | null;
  };
}

function single<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function normalizeFilter(
  value: string | null,
  allowed: string[],
): string | null {
  if (!value || value === 'all') return null;
  return allowed.includes(value) ? value : null;
}

function normalizeQuery(value: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 120);
}

function formatDateForFilename(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function mapRisk(raw: RiskRaw): RiskCsvRow {
  const owner = single(raw.owner);
  const author = single(raw.author);
  const linkedObjects = (raw.object_risks ?? [])
    .map((link) => single(link.objects))
    .filter((object): object is ObjLinkRaw => object !== null);

  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    category: raw.category,
    categoryLabel: CATEGORY_LABELS[raw.category] ?? raw.category,
    severity: raw.severity,
    severityLabel: SEVERITY_LABELS[raw.severity] ?? raw.severity,
    probability: raw.probability,
    probabilityLabel: raw.probability ? (PROBABILITY_LABELS[raw.probability] ?? raw.probability) : '',
    cvssScore: raw.cvss_score,
    status: raw.status,
    statusLabel: STATUS_LABELS[raw.status] ?? raw.status,
    impact: raw.impact,
    dueDate: raw.due_date,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    ownerName: owner?.full_name ?? null,
    authorName: author?.full_name ?? null,
    linkedObjectNames: linkedObjects.map((object) => object.name),
    linkedObjectIds: linkedObjects.map((object) => object.id),
  };
}

function filterRisks(
  rows: RiskCsvRow[],
  filters: RiskCsvExport['filters'],
): RiskCsvRow[] {
  return rows.filter((row) => {
    if (filters.severity && row.severity !== filters.severity) return false;
    if (filters.status && row.status !== filters.status) return false;

    if (filters.q) {
      const q = filters.q.toLowerCase();
      const haystack = [
        row.id,
        row.title,
        row.description ?? '',
        row.categoryLabel,
        row.severityLabel,
        row.statusLabel,
        row.ownerName ?? '',
        row.authorName ?? '',
        ...row.linkedObjectNames,
        ...row.linkedObjectIds,
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    }

    return true;
  });
}

const RISK_CSV_COLUMNS: CsvColumn<RiskCsvRow>[] = [
  { header: 'Risk ID', value: (row) => row.id },
  { header: 'Название', value: (row) => row.title },
  { header: 'Описание', value: (row) => row.description },
  { header: 'Категория', value: (row) => row.categoryLabel },
  { header: 'Категория key', value: (row) => row.category },
  { header: 'Критичность', value: (row) => row.severityLabel },
  { header: 'Критичность key', value: (row) => row.severity },
  { header: 'Вероятность', value: (row) => row.probabilityLabel },
  { header: 'CVSS', value: (row) => row.cvssScore },
  { header: 'Статус', value: (row) => row.statusLabel },
  { header: 'Статус key', value: (row) => row.status },
  { header: 'Impact', value: (row) => row.impact },
  { header: 'Due date', value: (row) => row.dueDate },
  { header: 'Owner', value: (row) => row.ownerName },
  { header: 'Author', value: (row) => row.authorName },
  { header: 'Linked objects', value: (row) => row.linkedObjectNames.join('; ') },
  { header: 'Linked object IDs', value: (row) => row.linkedObjectIds.join('; ') },
  { header: 'Created at', value: (row) => row.createdAt },
  { header: 'Updated at', value: (row) => row.updatedAt },
  { header: 'Source', value: () => 'DTEK Core Risk Registry' },
  { header: 'Evidence note', value: () => 'Evidence Layer будет расширен после Sprint 11–15' },
];

export async function getRiskCsvExport(searchParams: URLSearchParams): Promise<RiskCsvExport> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const admin = createAdminClient();

  const { data: profileRaw } = await admin
    .from('profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single();

  const profile = profileRaw as unknown as ProfileRaw | null;
  if (!profile?.organization_id) redirect('/onboarding/create');

  if (!ALLOWED_EXPORT_ROLES.includes(profile.role)) {
    throw new Error('REPORT_FORBIDDEN');
  }

  const filters: RiskCsvExport['filters'] = {
    q: normalizeQuery(searchParams.get('q')),
    severity: normalizeFilter(searchParams.get('severity'), ALLOWED_SEVERITIES),
    status: normalizeFilter(searchParams.get('status'), ALLOWED_STATUSES),
  };

  const { data: risksRaw } = await admin
    .from('risks')
    .select(`
      id, title, description, category, severity, probability,
      cvss_score, status, impact, due_date, created_at, updated_at,
      owner:profiles!owner_id(full_name),
      author:profiles!author_id(full_name),
      object_risks(objects(id, name))
    `)
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false });

  const rows = filterRisks(
    ((risksRaw as unknown as RiskRaw[] | null) ?? []).map(mapRisk),
    filters,
  );

  return {
    csv: withUtf8Bom(serializeCsv(rows, RISK_CSV_COLUMNS)),
    filename: `dtek-core-risk-registry-${formatDateForFilename(new Date())}.csv`,
    rowCount: rows.length,
    orgId: profile.organization_id,
    userId: user.id,
    userEmail: user.email,
    filters,
  };
}
