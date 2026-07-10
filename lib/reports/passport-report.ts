import { notFound } from 'next/navigation';
import { TRUST_FACTORS } from '@/lib/design-tokens';
import { getReportAccessContext } from '@/lib/reports/access';
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
  owner: OwnerRaw | OwnerRaw[] | null;
  trust_passports: PassportRaw | PassportRaw[] | null;
}

interface RiskRaw {
  id: string;
  title: string;
  severity: string;
  cvss_score: number | null;
  due_date: string | null;
}

interface RiskLinkRaw {
  risks: RiskRaw | RiskRaw[] | null;
}

export interface PassportReportFactor {
  key: string;
  label: string;
  weight: number;
  score: number;
  contribution: number;
}

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

function buildFactors(passport: PassportData): PassportReportFactor[] {
  const scores: Record<string, number> = {
    vuln:       passport.vuln_score,
    config:     passport.config_score,
    access:     passport.access_score,
    network:    passport.network_score,
    compliance: passport.compliance_score,
    incident:   passport.incident_score,
  };

  return TRUST_FACTORS.map((factor) => {
    const score = scores[factor.key] ?? 70;
    return {
      key:          factor.key,
      label:        factor.label,
      weight:       factor.weight,
      score,
      contribution: Math.round((score * factor.weight) / 100),
    };
  });
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

export async function getPassportReportData(objectId: string): Promise<PassportReportData> {
  const { admin, user, orgId, role } = await getReportAccessContext('passport', {
    onDenied: 'notFound',
  });

  const { data: objData } = await admin
    .from('objects')
    .select(`
      id, name, type, criticality, ip_address, os_platform, segment, exposure,
      owner:profiles!owner_id(full_name),
      trust_passports(
        trust_score, trust_level,
        vuln_score, config_score, access_score,
        network_score, compliance_score, incident_score,
        open_risk_count, connection_count, calculated_at
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
    open_risk_count:  tpRaw.open_risk_count  ?? 0,
    connection_count: tpRaw.connection_count ?? 0,
    calculated_at:    tpRaw.calculated_at    ?? null,
  };

  const { data: riskLinksData } = await admin
    .from('object_risks')
    .select('risks(id, title, severity, cvss_score, due_date)')
    .eq('object_id', objectId);

  const riskLinks = (riskLinksData as unknown as RiskLinkRaw[] | null) ?? [];
  const risks: PassportRisk[] = riskLinks
    .map((link) => {
      const risk = single(link.risks);
      return risk
        ? {
            id:         risk.id,
            title:      risk.title,
            severity:   risk.severity,
            cvss_score: risk.cvss_score,
            due_date:   risk.due_date,
          }
        : null;
    })
    .filter((risk): risk is PassportRisk => risk !== null);

  const { data: orgData } = await admin
    .from('organizations')
    .select('name, short_name')
    .eq('id', orgId)
    .single();

  const org = orgData as unknown as OrgRaw | null;
  const orgName = org?.short_name ?? org?.name ?? '';

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: deltaRaw } = await admin
    .from('trust_score_history')
    .select('new_score')
    .eq('object_id', objectId)
    .eq('organization_id', orgId)
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  const firstScore = (deltaRaw as unknown as { new_score: number } | null)?.new_score ?? null;
  const delta30 = firstScore !== null ? passport.trust_score - firstScore : 0;

  return {
    object,
    passport,
    risks,
    orgName,
    orgId,
    userId: user.id,
    userEmail: user.email,
    role,
    delta30,
    factors: buildFactors(passport),
    generatedAt: new Date().toISOString(),
    sourceCoverage: buildSourceCoverage(object, risks),
  };
}
