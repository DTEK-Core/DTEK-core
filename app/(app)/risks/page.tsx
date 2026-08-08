import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUserContext } from '@/lib/supabase/auth';
import { RisksPageClient } from '@/components/shared/risks/risks-page-client';
import type { RiskRow, LinkedObj } from '@/components/shared/risks/risks-page-client';
import {
  buildRiskImpactHints,
  type RiskImpactHint,
  type RiskImpactInput,
} from '@/lib/trust/explainability';
import {
  DEFAULT_FACTOR_WEIGHTS,
  type FactorWeights,
  type ObjectForCalc,
} from '@/lib/trust/calculate';
import '@/app/risks.css';

export const metadata: Metadata = { title: 'Реестр рисков — DTEK Core' };

// ── Raw DB shapes ──────────────────────────────────────────────────────────────

interface ProfileRaw {
  role: string;
  organization_id: string | null;
}

interface ProfileLinkRaw {
  full_name: string;
  status?: string;
}

interface RiskAssigneeRaw {
  id: string;
  full_name: string;
  role: string;
}

interface ObjLinkRaw {
  id: string;
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
  owner_id: string | null;
  owner: ProfileLinkRaw | ProfileLinkRaw[] | null;
  author: ProfileLinkRaw | ProfileLinkRaw[] | null;
  object_risks: ObjRiskRaw[] | null;
}

interface ObjectImpactRaw extends ObjectForCalc {
  id: string;
  status: string;
}

function single<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function RisksPage({
  searchParams,
}: {
  searchParams: Promise<{ import?: string }>;
}) {
  const query = await searchParams;
  const context = await getCurrentUserContext();
  if (!context) redirect('/login');
  const profile = context.profile as ProfileRaw | null;
  if (!profile?.organization_id) redirect('/onboarding/create');

  const admin = createAdminClient();
  const orgId = profile.organization_id;
  const canManageRisks = ['owner', 'analyst'].includes(profile.role);

  const [risksResult, objectsResult, weightsResult, assigneesResult] = await Promise.all([
    admin
      .from('risks')
      .select(`
        id, title, description, category, severity, probability,
        cvss_score, status, impact, due_date, owner_id, created_at, updated_at,
        owner:profiles!owner_id(full_name, status),
        author:profiles!author_id(full_name),
        object_risks(objects(id))
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false }),
    admin
      .from('objects')
      .select('id, name, type, criticality, description, ip_address, os_platform, segment, exposure, owner_id, status')
      .eq('organization_id', orgId)
      .order('name'),
    admin
      .from('trust_factor_config')
      .select('vuln_weight, config_weight, access_weight, network_weight, compliance_weight, incident_weight')
      .eq('organization_id', orgId)
      .single(),
    canManageRisks
      ? admin
          .from('profiles')
          .select('id, full_name, role')
          .eq('organization_id', orgId)
          .eq('status', 'active')
          .order('full_name')
      : Promise.resolve({ data: null }),
  ]);

  const rawList = (risksResult.data as unknown as RiskRaw[] | null) ?? [];
  const objectList = (
    objectsResult.data as unknown as ObjectImpactRaw[] | null
  ) ?? [];
  const weights = (
    weightsResult.data as unknown as FactorWeights | null
  ) ?? DEFAULT_FACTOR_WEIGHTS;
  const objectsById = new Map(objectList.map((object) => [object.id, object]));
  const risksByObject = new Map<string, RiskImpactInput[]>();

  for (const risk of rawList) {
    for (const relation of risk.object_risks ?? []) {
      const linkedObject = single(relation.objects);
      if (!linkedObject || !objectsById.has(linkedObject.id)) continue;

      const objectRisks = risksByObject.get(linkedObject.id) ?? [];
      objectRisks.push({
        id: risk.id,
        category: risk.category,
        severity: risk.severity,
        status: risk.status,
      });
      risksByObject.set(linkedObject.id, objectRisks);
    }
  }

  const impactByRelation = new Map<string, RiskImpactHint>();
  for (const object of objectList) {
    const objectRisks = risksByObject.get(object.id) ?? [];
    for (const hint of buildRiskImpactHints(object, objectRisks, weights)) {
      impactByRelation.set(`${object.id}:${hint.riskId}`, hint);
    }
  }

  const risks: RiskRow[] = rawList.map(raw => {
    const ownerRaw  = Array.isArray(raw.owner)  ? raw.owner[0]  : raw.owner;
    const authorRaw = Array.isArray(raw.author) ? raw.author[0] : raw.author;

    const linkedObjects: LinkedObj[] = (raw.object_risks ?? [])
      .map(or => {
        const relationObject = single(or.objects);
        const object = relationObject ? objectsById.get(relationObject.id) : null;
        return object
          ? {
              id: object.id,
              name: object.name,
              impactHint: impactByRelation.get(`${object.id}:${raw.id}`) ?? null,
            }
          : null;
      })
      .filter((o): o is LinkedObj => o !== null);

    return {
      id:             raw.id,
      title:          raw.title,
      description:    raw.description,
      category:       raw.category,
      severity:       raw.severity,
      probability:    raw.probability,
      cvss_score:     raw.cvss_score,
      status:         raw.status,
      impact:         raw.impact,
      due_date:       raw.due_date,
      created_at:     raw.created_at,
      updated_at:     raw.updated_at,
      owner_id:       raw.owner_id,
      owner_name:     ownerRaw?.full_name  ?? null,
      owner_is_active: ownerRaw?.status === 'active',
      author_name:    authorRaw?.full_name ?? null,
      linked_objects: linkedObjects,
    };
  });

  const objects = objectList
    .filter((object) => object.status !== 'archived')
    .map((object) => ({
      id:   object.id,
      name: object.name,
      type: object.type,
    }));

  const assignees = (
    assigneesResult.data as unknown as RiskAssigneeRaw[] | null
  ) ?? [];

  return (
    <RisksPageClient
      risks={risks}
      userRole={profile.role}
      objects={objects}
      assignees={assignees}
      initialImportOpen={query.import === '1'}
    />
  );
}
