import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ObjectDetailClient } from '@/components/shared/objects/object-detail-client';
import type {
  DetailObject,
  PassportData,
  RiskItem,
  RelatedObject,
  HistoryEntry,
} from '@/components/shared/objects/object-detail-client';
import '@/app/objects.css';

export const metadata: Metadata = { title: 'Объект — DTEK Core' };

// ── Raw DB shapes ──────────────────────────────────────────────────────────────

interface ProfileRaw {
  role: string;
  organization_id: string | null;
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
  risk_count: number | null;
  open_risk_count: number | null;
  critical_risk_count: number | null;
  connection_count: number | null;
  completeness_pct: number | null;
  calculated_at: string | null;
}

interface ObjectRaw {
  id: string;
  name: string;
  type: string;
  description: string | null;
  criticality: string;
  status: string;
  trust_score: number;
  trust_level: string;
  ip_address: string | null;
  os_platform: string | null;
  segment: string | null;
  exposure: string | null;
  created_at: string;
  updated_at: string;
  owner: OwnerRaw | OwnerRaw[] | null;
  trust_passports: PassportRaw | PassportRaw[] | null;
}

interface RiskRaw {
  id: string;
  title: string;
  severity: string;
  status: string;
  category: string;
  cvss_score: number | null;
  due_date: string | null;
}

interface RiskLinkRaw {
  risks: RiskRaw | RiskRaw[] | null;
}

interface RelLinkRaw {
  source_object_id: string;
  target_object_id: string;
}

interface RelatedObjRaw {
  id: string;
  name: string;
  type: string;
  trust_score: number;
  trust_level: string;
}

interface HistoryEntryRaw {
  id:         string;
  old_score:  number | null;
  new_score:  number;
  reason:     string | null;
  changed_by: string;
  created_at: string;
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function ObjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
  const role  = profile.role;

  // ── Object with passport ───────────────────────────────────────────────────
  const { data: objData } = await admin
    .from('objects')
    .select(`
      id, name, type, description, criticality, status,
      trust_score, trust_level,
      ip_address, os_platform, segment, exposure,
      created_at, updated_at,
      owner:profiles!owner_id(full_name),
      trust_passports(
        trust_score, trust_level,
        vuln_score, config_score, access_score,
        network_score, compliance_score, incident_score,
        risk_count, open_risk_count, critical_risk_count,
        connection_count, completeness_pct, calculated_at
      )
    `)
    .eq('id', id)
    .eq('organization_id', orgId)
    .single();

  if (!objData) notFound();

  const raw     = objData as unknown as ObjectRaw;
  const tpRaw   = Array.isArray(raw.trust_passports) ? raw.trust_passports[0] : raw.trust_passports;
  const ownerRaw = Array.isArray(raw.owner) ? raw.owner[0] : raw.owner;

  const object: DetailObject = {
    id:          raw.id,
    name:        raw.name,
    type:        raw.type,
    description: raw.description,
    criticality: raw.criticality,
    status:      raw.status,
    trust_score: raw.trust_score,
    trust_level: raw.trust_level,
    ip_address:  raw.ip_address,
    os_platform: raw.os_platform,
    segment:     raw.segment,
    exposure:    raw.exposure,
    created_at:  raw.created_at,
    updated_at:  raw.updated_at,
    owner_name:  ownerRaw?.full_name ?? null,
  };

  const passport: PassportData | null = tpRaw
    ? {
        trust_score:         tpRaw.trust_score         ?? 70,
        trust_level:         tpRaw.trust_level         ?? 'medium',
        vuln_score:          tpRaw.vuln_score          ?? 70,
        config_score:        tpRaw.config_score        ?? 70,
        access_score:        tpRaw.access_score        ?? 70,
        network_score:       tpRaw.network_score       ?? 70,
        compliance_score:    tpRaw.compliance_score    ?? 70,
        incident_score:      tpRaw.incident_score      ?? 70,
        risk_count:          tpRaw.risk_count          ?? 0,
        open_risk_count:     tpRaw.open_risk_count     ?? 0,
        critical_risk_count: tpRaw.critical_risk_count ?? 0,
        connection_count:    tpRaw.connection_count    ?? 0,
        completeness_pct:    tpRaw.completeness_pct    ?? 0,
        calculated_at:       tpRaw.calculated_at       ?? null,
      }
    : null;

  // ── Risks via object_risks junction ────────────────────────────────────────
  const { data: riskLinksData } = await admin
    .from('object_risks')
    .select('risks(id, title, severity, status, category, cvss_score, due_date)')
    .eq('object_id', id);

  const riskLinks = (riskLinksData as unknown as RiskLinkRaw[] | null) ?? [];
  const risks: RiskItem[] = riskLinks
    .map(link => {
      const r = Array.isArray(link.risks) ? link.risks[0] : link.risks;
      return r
        ? {
            id:         r.id,
            title:      r.title,
            severity:   r.severity,
            status:     r.status,
            category:   r.category,
            cvss_score: r.cvss_score,
            due_date:   r.due_date,
          }
        : null;
    })
    .filter((r): r is RiskItem => r !== null);

  // ── Related objects via relations ──────────────────────────────────────────
  const { data: relLinksData } = await admin
    .from('relations')
    .select('source_object_id, target_object_id')
    .or(`source_object_id.eq.${id},target_object_id.eq.${id}`)
    .eq('organization_id', orgId);

  const relLinks = (relLinksData as unknown as RelLinkRaw[] | null) ?? [];
  const relatedIdSet = new Set(
    relLinks.flatMap(r => [r.source_object_id, r.target_object_id])
            .filter(rid => rid !== id),
  );
  const relatedIds = Array.from(relatedIdSet);

  let related: RelatedObject[] = [];
  if (relatedIds.length > 0) {
    const { data: relObjsData } = await admin
      .from('objects')
      .select('id, name, type, trust_score, trust_level')
      .in('id', relatedIds)
      .eq('organization_id', orgId);

    const relObjs = (relObjsData as unknown as RelatedObjRaw[] | null) ?? [];
    related = relObjs.map(o => ({
      id:          o.id,
      name:        o.name,
      type:        o.type,
      trust_score: o.trust_score,
      trust_level: o.trust_level,
    }));
  }

  // ── Trust Score history (last 20 entries) ─────────────────────────────────
  const { data: historyRaw } = await admin
    .from('trust_score_history')
    .select('id, old_score, new_score, reason, changed_by, created_at')
    .eq('object_id', id)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(20);

  const historyEntries: HistoryEntry[] = (
    (historyRaw as unknown as HistoryEntryRaw[] | null) ?? []
  ).map(h => ({
    id:         h.id,
    old_score:  h.old_score,
    new_score:  h.new_score,
    reason:     h.reason,
    changed_by: h.changed_by,
    created_at: h.created_at,
  }));

  return (
    <ObjectDetailClient
      object={object}
      passport={passport}
      risks={risks}
      related={related}
      historyEntries={historyEntries}
      userRole={role}
    />
  );
}
