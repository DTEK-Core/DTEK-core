import { notFound } from 'next/navigation';
import { TRUST_FACTORS, type TrustFactorKey } from '@/lib/design-tokens';
import { getReportAccessContext } from '@/lib/reports/access';
import {
  buildFactorExplanations,
  buildRiskImpactHints,
  buildScoreDeltaTimeline,
  buildScoreFactors,
  buildSourceTimeline,
  buildTopScoreDrivers,
  type ExplainabilityRisk,
  type FactorExplanation,
  type ScoreDeltaEvent,
  type ScoreFactor,
  type ScoreHistoryInput,
  type SourceContext,
} from '@/lib/trust/explainability';
import {
  DEFAULT_FACTOR_WEIGHTS,
  type FactorWeights,
} from '@/lib/trust/calculate';
import type {
  PassportData,
  PassportObject,
  PassportRisk,
} from '@/components/shared/objects/trust-passport-client';

interface OrgRaw {
  name: string;
  short_name: string | null;
}

interface OwnerRaw {
  full_name: string;
}

interface PassportRaw {
  trust_score: number | null;
  trust_level: string | null;
  vuln_score: number | null;
  config_score: number | null;
  access_score: number | null;
  network_score: number | null;
  compliance_score: number | null;
  incident_score: number | null;
  completeness_pct: number | null;
  open_risk_count: number | null;
  connection_count: number | null;
  calculated_at: string | null;
}

interface ObjectRaw {
  id: string;
  name: string;
  type: string;
  criticality: string;
  ip_address: string | null;
  os_platform: string | null;
  segment: string | null;
  exposure: string | null;
  description: string | null;
  owner_id: string | null;
  owner: OwnerRaw | OwnerRaw[] | null;
  trust_passports: PassportRaw | PassportRaw[] | null;
}

interface RiskRaw {
  id: string;
  organization_id: string;
  title: string;
  severity: string;
  category: string;
  status: string;
  description: string | null;
  cvss_score: number | null;
  due_date: string | null;
}

interface RiskLinkRaw {
  risks: RiskRaw | RiskRaw[] | null;
}

interface ScoreHistoryRaw {
  id: string;
  old_score: number | null;
  new_score: number;
  factors_snapshot: unknown;
  reason: string | null;
  changed_by: string;
  created_at: string;
}

type WeightsRaw = FactorWeights;

const FACTOR_WEIGHT_KEYS: Readonly<Record<TrustFactorKey, keyof FactorWeights>> = {
  vuln:       'vuln_weight',
  config:     'config_weight',
  access:     'access_weight',
  network:    'network_weight',
  compliance: 'compliance_weight',
  incident:   'incident_weight',
};

export type PassportReportFactor = ScoreFactor;

export interface PassportReportData {
  object: PassportObject;
  passport: PassportData;
  risks: PassportRisk[];
  orgName: string;
  orgId: string;
  userId: string;
  userEmail?: string;
  role: string;
  delta30: number;
  factors: PassportReportFactor[];
  topDrivers: ScoreFactor[];
  factorExplanations: FactorExplanation[];
  scoreTimeline: ScoreDeltaEvent[];
  sourceTimeline: SourceContext[];
  generatedAt: string;
  sourceCoverage: Array<{
    source: string;
    status: string;
    detail: string;
  }>;
}

function single<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function buildFactors(
  passport: PassportData,
  weights: Readonly<FactorWeights>,
): PassportReportFactor[] {
  const scores: Record<string, number> = {
    vuln:       passport.vuln_score,
    config:     passport.config_score,
    access:     passport.access_score,
    network:    passport.network_score,
    compliance: passport.compliance_score,
    incident:   passport.incident_score,
  };

  return buildScoreFactors(TRUST_FACTORS.map((factor) => {
    const score = scores[factor.key] ?? 70;
    return {
      key:    factor.key,
      label:  factor.label,
      weight: weights[FACTOR_WEIGHT_KEYS[factor.key]],
      score,
    };
  }));
}

function buildSourceCoverage(object: PassportObject, risks: PassportRisk[]) {
  return [
    {
      source: 'DTEK Core',
      status: 'Подтверждено',
      detail: 'Объект и Trust Passport получены из защищённой модели организации.',
    },
    {
      source: 'Manual / Import',
      status: 'MVP',
      detail: object.ip_address || object.os_platform || object.segment
        ? 'Технические атрибуты заполнены в текущей модели данных.'
        : 'Технические атрибуты пока требуют уточнения.',
    },
    {
      source: 'Risk Registry',
      status: risks.length > 0 ? 'Есть связанные риски' : 'Рисков нет',
      detail: risks.length > 0
        ? `Связанных рисков: ${risks.length}.`
        : 'Открытых связанных рисков в отчёте не найдено.',
    },
    {
      source: 'Evidence Layer',
      status: 'Запланировано',
      detail: 'Source/evidence coverage будет расширен после Sprint 11–15.',
    },
  ];
}

function hideSourceRecordIds(
  explanations: ReadonlyArray<FactorExplanation>,
): FactorExplanation[] {
  return explanations.map((factor) => ({
    ...factor,
    risks: factor.risks.map((risk) => ({
      ...risk,
      source: { ...risk.source, sourceRecordId: null },
    })),
    sources: factor.sources.map((source) => ({
      ...source,
      sourceRecordId: null,
    })),
  }));
}

export async function getPassportReportData(objectId: string): Promise<PassportReportData> {
  const { admin, userId, userEmail, orgId, role } = await getReportAccessContext('passport', {
    onDenied: 'notFound',
  });

  const { data: objData } = await admin
    .from('objects')
    .select(`
      id, name, type, criticality, ip_address, os_platform, segment, exposure, description, owner_id,
      owner:profiles!owner_id(full_name),
      trust_passports(
        trust_score, trust_level,
        vuln_score, config_score, access_score,
        network_score, compliance_score, incident_score,
        completeness_pct, open_risk_count, connection_count, calculated_at
      )
    `)
    .eq('id', objectId)
    .eq('organization_id', orgId)
    .single();

  if (!objData) notFound();

  const raw = objData as unknown as ObjectRaw;
  const tpRaw = single(raw.trust_passports);
  const ownerRaw = single(raw.owner);

  if (!tpRaw) notFound();

  const object: PassportObject = {
    id:          raw.id,
    name:        raw.name,
    type:        raw.type,
    criticality: raw.criticality,
    segment:     raw.segment,
    exposure:    raw.exposure,
    ip_address:  raw.ip_address,
    os_platform: raw.os_platform,
    owner_name:  ownerRaw?.full_name ?? null,
  };

  const passport: PassportData = {
    trust_score:      tpRaw.trust_score      ?? 70,
    trust_level:      tpRaw.trust_level      ?? 'medium',
    vuln_score:       tpRaw.vuln_score       ?? 70,
    config_score:     tpRaw.config_score     ?? 70,
    access_score:     tpRaw.access_score     ?? 70,
    network_score:    tpRaw.network_score    ?? 70,
    compliance_score: tpRaw.compliance_score ?? 70,
    incident_score:   tpRaw.incident_score   ?? 70,
    completeness_pct: tpRaw.completeness_pct ?? 0,
    open_risk_count:  tpRaw.open_risk_count  ?? 0,
    connection_count: tpRaw.connection_count ?? 0,
    calculated_at:    tpRaw.calculated_at    ?? null,
  };

  const { data: riskLinksData } = await admin
    .from('object_risks')
    .select('risks(id, organization_id, title, severity, category, status, description, cvss_score, due_date)')
    .eq('object_id', objectId);

  const riskLinks = (riskLinksData as unknown as RiskLinkRaw[] | null) ?? [];
  const linkedRisks = riskLinks
    .map((link) => single(link.risks))
    .filter((risk): risk is RiskRaw => risk?.organization_id === orgId);

  const [orgResult, weightsResult] = await Promise.all([
    admin
      .from('organizations')
      .select('name, short_name')
      .eq('id', orgId)
      .single(),
    admin
      .from('trust_factor_config')
      .select('vuln_weight, config_weight, access_weight, network_weight, compliance_weight, incident_weight')
      .eq('organization_id', orgId)
      .single(),
  ]);

  const orgData = orgResult.data;
  const org = orgData as unknown as OrgRaw | null;
  const orgName = org?.short_name ?? org?.name ?? '';
  const weights = (
    weightsResult.data as unknown as WeightsRaw | null
  ) ?? DEFAULT_FACTOR_WEIGHTS;
  const explanationRisks: ExplainabilityRisk[] = linkedRisks.map((risk) => ({
    id:          risk.id,
    title:       risk.title,
    severity:    risk.severity,
    category:    risk.category,
    status:      risk.status,
    description: risk.description,
  }));
  const impactByRisk = new Map(
    buildRiskImpactHints({
      criticality: raw.criticality,
      name: raw.name,
      type: raw.type,
      description: raw.description,
      ip_address: raw.ip_address,
      os_platform: raw.os_platform,
      segment: raw.segment,
      exposure: raw.exposure,
      owner_id: raw.owner_id,
    }, explanationRisks, weights).map((hint) => [hint.riskId, hint]),
  );
  const risks: PassportRisk[] = linkedRisks.map((risk) => ({
    id:         risk.id,
    title:      risk.title,
    severity:   risk.severity,
    cvss_score: risk.cvss_score,
    due_date:   risk.due_date,
    impactHint: impactByRisk.get(risk.id) ?? null,
  }));

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [deltaResult, historyResult] = await Promise.all([
    admin
      .from('trust_score_history')
      .select('new_score')
      .eq('object_id', objectId)
      .eq('organization_id', orgId)
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: true })
      .limit(1)
      .single(),
    admin
      .from('trust_score_history')
      .select('id, old_score, new_score, factors_snapshot, reason, changed_by, created_at')
      .eq('object_id', objectId)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(6),
  ]);

  const firstScore = (
    deltaResult.data as unknown as { new_score: number } | null
  )?.new_score ?? null;
  const delta30 = firstScore !== null ? passport.trust_score - firstScore : 0;
  const factors = buildFactors(passport, weights);
  const factorExplanations = hideSourceRecordIds(
    buildFactorExplanations(factors, {
      criticality: raw.criticality,
      completenessPct: passport.completeness_pct,
      objectDescription: raw.description,
      risks: explanationRisks,
    }),
  );
  const historyRows = (
    historyResult.data as unknown as ScoreHistoryRaw[] | null
  ) ?? [];
  const scoreHistory: ScoreHistoryInput[] = historyRows.map((entry) => ({
    id: entry.id,
    oldScore: entry.old_score,
    newScore: entry.new_score,
    factorsSnapshot: entry.factors_snapshot,
    reason: entry.reason,
    changedBy: entry.changed_by,
    createdAt: entry.created_at,
  }));
  const scoreTimeline = buildScoreDeltaTimeline(scoreHistory, 5);
  const sourceTimeline = buildSourceTimeline(
    factorExplanations.flatMap((factor) => factor.sources),
  );

  return {
    object,
    passport,
    risks,
    orgName,
    orgId,
    userId,
    userEmail,
    role,
    delta30,
    factors,
    topDrivers: buildTopScoreDrivers(factors),
    factorExplanations,
    scoreTimeline,
    sourceTimeline,
    generatedAt: new Date().toISOString(),
    sourceCoverage: buildSourceCoverage(object, risks),
  };
}
