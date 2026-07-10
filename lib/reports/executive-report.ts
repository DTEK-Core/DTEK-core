import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { TRUST_FACTORS, TRUST_BANDS, getTrustBand } from '@/lib/design-tokens';

const ALLOWED_EXECUTIVE_REPORT_ROLES = ['owner', 'analyst'];
const ACTIVE_RISK_STATUSES = ['open', 'in_progress'];

const SEVERITY_WEIGHT: Record<string, number> = {
  critical: 4,
  high:     3,
  medium:   2,
  low:      1,
};

const CRITICALITY_WEIGHT: Record<string, number> = {
  critical: 4,
  high:     3,
  medium:   2,
  low:      1,
};

interface ProfileRaw {
  role: string;
  organization_id: string | null;
}

interface OrgRaw {
  id: string;
  name: string;
  short_name: string | null;
  industry: string | null;
  size: string | null;
  trust_score: number | null;
  trust_level: string | null;
}

interface PassportRaw {
  vuln_score: number | null;
  config_score: number | null;
  access_score: number | null;
  network_score: number | null;
  compliance_score: number | null;
  incident_score: number | null;
  open_risk_count: number | null;
  critical_risk_count: number | null;
  completeness_pct: number | null;
}

interface ObjectRaw {
  id: string;
  name: string;
  type: string;
  criticality: string;
  status: string;
  trust_score: number;
  trust_level: string;
  segment: string | null;
  exposure: string | null;
  trust_passports: PassportRaw | PassportRaw[] | null;
}

interface ObjectLinkRaw {
  id: string;
  name: string;
}

interface ObjectRiskRaw {
  objects: ObjectLinkRaw | ObjectLinkRaw[] | null;
}

interface RiskRaw {
  id: string;
  title: string;
  category: string;
  severity: string;
  probability: string | null;
  cvss_score: number | null;
  status: string;
  due_date: string | null;
  object_risks: ObjectRiskRaw[] | null;
}

export interface ExecutiveReportObject {
  id: string;
  name: string;
  type: string;
  criticality: string;
  trustScore: number;
  trustLevel: string;
  openRiskCount: number;
  criticalRiskCount: number;
  riskWeight: number;
}

export interface ExecutiveReportRisk {
  id: string;
  title: string;
  category: string;
  severity: string;
  probability: string | null;
  cvssScore: number | null;
  status: string;
  dueDate: string | null;
  linkedObjects: Array<{
    id: string;
    name: string;
  }>;
}

export interface ExecutiveReportData {
  org: {
    id: string;
    name: string;
    shortName: string | null;
    industry: string | null;
    size: string | null;
    trustScore: number;
    trustLevel: string;
  };
  userId: string;
  userEmail?: string;
  role: string;
  generatedAt: string;
  summary: string[];
  kpi: {
    totalObjects: number;
    activeObjects: number;
    activeRisks: number;
    criticalRisks: number;
    overdueRisks: number;
    criticalTrustObjects: number;
    passportCompleteness: number;
  };
  distribution: Array<{
    key: string;
    label: string;
    count: number;
    color: string;
  }>;
  factorAverages: Array<{
    key: string;
    label: string;
    weight: number;
    score: number;
  }>;
  topRiskyObjects: ExecutiveReportObject[];
  criticalRisks: ExecutiveReportRisk[];
  sourceCoverage: Array<{
    source: string;
    status: string;
    detail: string;
  }>;
}

function single<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function isActiveRisk(status: string): boolean {
  return ACTIVE_RISK_STATUSES.includes(status);
}

function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || !isActiveRisk(status)) return false;
  return new Date(dueDate).getTime() < Date.now();
}

function linkedObjects(raw: RiskRaw): ObjectLinkRaw[] {
  return (raw.object_risks ?? [])
    .map((link) => single(link.objects))
    .filter((object): object is ObjectLinkRaw => object !== null);
}

function average(values: number[]): number {
  if (values.length === 0) return 70;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function buildFactorAverages(objects: ObjectRaw[]): ExecutiveReportData['factorAverages'] {
  const passports = objects
    .map((object) => single(object.trust_passports))
    .filter((passport): passport is PassportRaw => passport !== null);

  const scores: Record<string, number[]> = {
    vuln:       passports.map((passport) => passport.vuln_score ?? 70),
    config:     passports.map((passport) => passport.config_score ?? 70),
    access:     passports.map((passport) => passport.access_score ?? 70),
    network:    passports.map((passport) => passport.network_score ?? 70),
    compliance: passports.map((passport) => passport.compliance_score ?? 70),
    incident:   passports.map((passport) => passport.incident_score ?? 70),
  };

  return TRUST_FACTORS.map((factor) => ({
    key:    factor.key,
    label:  factor.label,
    weight: factor.weight,
    score:  average(scores[factor.key] ?? []),
  }));
}

function buildDistribution(objects: ObjectRaw[]): ExecutiveReportData['distribution'] {
  return TRUST_BANDS.map((band) => ({
    key:   band.key,
    label: band.label,
    color: band.color,
    count: objects.filter((object) => object.trust_level === band.key).length,
  }));
}

function buildTopRiskyObjects(
  objects: ObjectRaw[],
  activeRisks: ExecutiveReportRisk[],
): ExecutiveReportObject[] {
  const riskStatsByObject = new Map<string, { count: number; criticalCount: number; weight: number }>();

  for (const risk of activeRisks) {
    const weight = SEVERITY_WEIGHT[risk.severity] ?? 1;
    for (const object of risk.linkedObjects) {
      const current = riskStatsByObject.get(object.id) ?? { count: 0, criticalCount: 0, weight: 0 };
      current.count += 1;
      current.weight += weight;
      if (risk.severity === 'critical') current.criticalCount += 1;
      riskStatsByObject.set(object.id, current);
    }
  }

  return objects
    .map((object) => {
      const passport = single(object.trust_passports);
      const stats = riskStatsByObject.get(object.id);
      const openRiskCount = stats?.count ?? passport?.open_risk_count ?? 0;
      const criticalRiskCount = stats?.criticalCount ?? passport?.critical_risk_count ?? 0;
      const riskWeight = stats?.weight ?? openRiskCount;

      return {
        id: object.id,
        name: object.name,
        type: object.type,
        criticality: object.criticality,
        trustScore: object.trust_score,
        trustLevel: object.trust_level,
        openRiskCount,
        criticalRiskCount,
        riskWeight,
      };
    })
    .sort((a, b) => {
      const scoreA = (100 - a.trustScore) + a.riskWeight * 7 + (CRITICALITY_WEIGHT[a.criticality] ?? 1) * 5;
      const scoreB = (100 - b.trustScore) + b.riskWeight * 7 + (CRITICALITY_WEIGHT[b.criticality] ?? 1) * 5;
      return scoreB - scoreA || a.trustScore - b.trustScore;
    })
    .slice(0, 7);
}

function buildSummary(report: {
  trustScore: number;
  activeObjects: number;
  activeRisks: number;
  criticalRisks: number;
  overdueRisks: number;
  criticalTrustObjects: number;
}): string[] {
  const band = getTrustBand(report.trustScore);
  const summary = [
    `Индекс доверия организации: ${report.trustScore}/100, уровень — ${band.label.toLowerCase()}.`,
    `В цифровой модели ${report.activeObjects} активных объектов и ${report.activeRisks} открытых рисков.`,
  ];

  if (report.criticalRisks > 0) {
    summary.push(`Критических рисков: ${report.criticalRisks}; требуется приоритизация remediation-плана.`);
  } else {
    summary.push('Критических открытых рисков в отчёте не обнаружено.');
  }

  if (report.overdueRisks > 0) {
    summary.push(`Просроченных рисков: ${report.overdueRisks}; SLA-контроль требует внимания.`);
  } else if (report.criticalTrustObjects > 0) {
    summary.push(`Объектов на критическом уровне доверия: ${report.criticalTrustObjects}; проверьте владельцев и связанные риски.`);
  } else {
    summary.push('Нет просроченных рисков и объектов на критическом уровне доверия.');
  }

  return summary;
}

function buildSourceCoverage(report: {
  objects: number;
  risks: number;
  passports: number;
  completeness: number;
}): ExecutiveReportData['sourceCoverage'] {
  return [
    {
      source: 'Digital Model',
      status: report.objects > 0 ? 'Сформирована' : 'Пустая модель',
      detail: `Активных объектов в отчёте: ${report.objects}.`,
    },
    {
      source: 'Trust Score Engine',
      status: report.passports > 0 ? 'Есть паспорта' : 'Нет паспортов',
      detail: `Средняя полнота Trust Passport: ${report.completeness}%.`,
    },
    {
      source: 'Risk Registry',
      status: report.risks > 0 ? 'Есть открытые риски' : 'Открытых рисков нет',
      detail: `Открытых рисков в управленческой сводке: ${report.risks}.`,
    },
    {
      source: 'Evidence Layer',
      status: 'Запланировано',
      detail: 'Автоматические источники и evidence coverage будут расширены после Sprint 11–15.',
    },
  ];
}

export async function getExecutiveReportData(): Promise<ExecutiveReportData> {
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

  if (!ALLOWED_EXECUTIVE_REPORT_ROLES.includes(profile.role)) {
    notFound();
  }

  const orgId = profile.organization_id;

  const [orgResult, objectsResult, risksResult] = await Promise.all([
    admin
      .from('organizations')
      .select('id, name, short_name, industry, size, trust_score, trust_level')
      .eq('id', orgId)
      .single(),
    admin
      .from('objects')
      .select(`
        id, name, type, criticality, status, trust_score, trust_level, segment, exposure,
        trust_passports(
          vuln_score, config_score, access_score, network_score, compliance_score,
          incident_score, open_risk_count, critical_risk_count, completeness_pct
        )
      `)
      .eq('organization_id', orgId),
    admin
      .from('risks')
      .select(`
        id, title, category, severity, probability, cvss_score, status, due_date,
        object_risks(objects(id, name))
      `)
      .eq('organization_id', orgId),
  ]);

  const orgRaw = orgResult.data as unknown as OrgRaw | null;
  if (!orgRaw) notFound();

  const objects = ((objectsResult.data ?? []) as unknown as ObjectRaw[])
    .filter((object) => object.status !== 'archived');

  const risks = ((risksResult.data ?? []) as unknown as RiskRaw[]).map((risk) => ({
    id: risk.id,
    title: risk.title,
    category: risk.category,
    severity: risk.severity,
    probability: risk.probability,
    cvssScore: risk.cvss_score,
    status: risk.status,
    dueDate: risk.due_date,
    linkedObjects: linkedObjects(risk),
  }));

  const activeRisks = risks.filter((risk) => isActiveRisk(risk.status));
  const criticalRisks = activeRisks
    .filter((risk) => risk.severity === 'critical')
    .sort((a, b) => (b.cvssScore ?? 0) - (a.cvssScore ?? 0))
    .slice(0, 8);

  const passportCompletenessValues = objects
    .map((object) => single(object.trust_passports)?.completeness_pct)
    .filter((value): value is number => value !== null && value !== undefined);
  const passportCompleteness = passportCompletenessValues.length > 0
    ? average(passportCompletenessValues)
    : 0;

  const fallbackScore = average(objects.map((object) => object.trust_score));
  const trustScore = orgRaw.trust_score ?? fallbackScore;
  const trustLevel = orgRaw.trust_level ?? getTrustBand(trustScore).key;
  const criticalTrustObjects = objects.filter((object) => object.trust_level === 'critical').length;
  const overdueRisks = activeRisks.filter((risk) => isOverdue(risk.dueDate, risk.status)).length;

  const kpi = {
    totalObjects: objects.length,
    activeObjects: objects.length,
    activeRisks: activeRisks.length,
    criticalRisks: activeRisks.filter((risk) => risk.severity === 'critical').length,
    overdueRisks,
    criticalTrustObjects,
    passportCompleteness,
  };

  return {
    org: {
      id: orgRaw.id,
      name: orgRaw.name,
      shortName: orgRaw.short_name,
      industry: orgRaw.industry,
      size: orgRaw.size,
      trustScore,
      trustLevel,
    },
    userId: user.id,
    userEmail: user.email,
    role: profile.role,
    generatedAt: new Date().toISOString(),
    summary: buildSummary({
      trustScore,
      activeObjects: kpi.activeObjects,
      activeRisks: kpi.activeRisks,
      criticalRisks: kpi.criticalRisks,
      overdueRisks: kpi.overdueRisks,
      criticalTrustObjects: kpi.criticalTrustObjects,
    }),
    kpi,
    distribution: buildDistribution(objects),
    factorAverages: buildFactorAverages(objects),
    topRiskyObjects: buildTopRiskyObjects(objects, activeRisks),
    criticalRisks,
    sourceCoverage: buildSourceCoverage({
      objects: kpi.activeObjects,
      risks: kpi.activeRisks,
      passports: objects.filter((object) => single(object.trust_passports) !== null).length,
      completeness: passportCompleteness,
    }),
  };
}
