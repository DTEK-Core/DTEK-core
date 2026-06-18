import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { TrustPassportClient } from '@/components/shared/objects/trust-passport-client';
import type { PassportObject, PassportData, PassportRisk } from '@/components/shared/objects/trust-passport-client';
import '@/app/objects.css';
import '@/app/passport.css';

export const metadata: Metadata = { title: 'Паспорт доверия — DTEK Core' };

// ── Raw DB shapes ──────────────────────────────────────────────────────────────

interface ProfileRaw {
  role: string;
  organization_id: string | null;
}

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

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function PassportPage({
  params,
}: {
  params: { id: string };
}) {
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

  const orgId = profile.organization_id;

  // ── Object with passport and owner ────────────────────────────────────────
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
    .eq('id', params.id)
    .eq('organization_id', orgId)
    .single();

  if (!objData) notFound();

  const raw      = objData as unknown as ObjectRaw;
  const tpRaw    = Array.isArray(raw.trust_passports) ? raw.trust_passports[0] : raw.trust_passports;
  const ownerRaw = Array.isArray(raw.owner) ? raw.owner[0] : raw.owner;

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

  // ── Risks ──────────────────────────────────────────────────────────────────
  const { data: riskLinksData } = await admin
    .from('object_risks')
    .select('risks(id, title, severity, cvss_score, due_date)')
    .eq('object_id', params.id);

  const riskLinks = (riskLinksData as unknown as RiskLinkRaw[] | null) ?? [];
  const risks: PassportRisk[] = riskLinks
    .map(link => {
      const r = Array.isArray(link.risks) ? link.risks[0] : link.risks;
      return r
        ? {
            id:         r.id,
            title:      r.title,
            severity:   r.severity,
            cvss_score: r.cvss_score,
            due_date:   r.due_date,
          }
        : null;
    })
    .filter((r): r is PassportRisk => r !== null);

  // ── Organization name ──────────────────────────────────────────────────────
  const { data: orgData } = await admin
    .from('organizations')
    .select('name, short_name')
    .eq('id', orgId)
    .single();

  const org = orgData as unknown as OrgRaw | null;
  const orgName = org?.short_name ?? org?.name ?? '';

  return (
    <TrustPassportClient
      object={object}
      passport={passport}
      risks={risks}
      orgName={orgName}
    />
  );
}
