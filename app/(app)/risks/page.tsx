import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { RisksPageClient } from '@/components/shared/risks/risks-page-client';
import type { RiskRow, LinkedObj } from '@/components/shared/risks/risks-page-client';
import '@/app/risks.css';

export const metadata: Metadata = { title: 'Реестр рисков — DTEK Core' };

// ── Raw DB shapes ──────────────────────────────────────────────────────────────

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

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function RisksPage() {
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

  // ── Load risks with owner, author, and linked objects ─────────────────────
  const { data: risksRaw } = await admin
    .from('risks')
    .select(`
      id, title, description, category, severity, probability,
      cvss_score, status, impact, due_date, created_at, updated_at,
      owner:profiles!owner_id(full_name),
      author:profiles!author_id(full_name),
      object_risks(objects(id, name))
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  const rawList = (risksRaw as unknown as RiskRaw[] | null) ?? [];

  const risks: RiskRow[] = rawList.map(raw => {
    const ownerRaw  = Array.isArray(raw.owner)  ? raw.owner[0]  : raw.owner;
    const authorRaw = Array.isArray(raw.author) ? raw.author[0] : raw.author;

    const linkedObjects: LinkedObj[] = (raw.object_risks ?? [])
      .map(or => {
        const obj = Array.isArray(or.objects) ? or.objects[0] : or.objects;
        return obj ? { id: obj.id, name: obj.name } : null;
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
      owner_name:     ownerRaw?.full_name  ?? null,
      author_name:    authorRaw?.full_name ?? null,
      linked_objects: linkedObjects,
    };
  });

  // ── Load objects for the create-risk form ─────────────────────────────────
  const { data: objectsRaw } = await admin
    .from('objects')
    .select('id, name, type')
    .eq('organization_id', orgId)
    .neq('status', 'archived')
    .order('name');

  const objects = ((objectsRaw as unknown as { id: string; name: string; type: string }[] | null) ?? []).map(o => ({
    id:   o.id,
    name: o.name,
    type: o.type,
  }));

  return <RisksPageClient risks={risks} userRole={profile.role} objects={objects} />;
}
