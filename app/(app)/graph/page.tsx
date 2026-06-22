import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { GraphPageClient } from './graph-page-client';
import type { GraphNode, RawLink } from '@/lib/trust/graph-types';
import '@/app/graph.css';

export const metadata: Metadata = { title: 'Граф доверия — DTEK Core' };

const NODE_SIZE: Record<string, number> = {
  critical: 22, high: 18, medium: 15, low: 12,
};

export default async function GraphPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();

  const { data: profileRaw } = await admin
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  const profile = profileRaw as { organization_id: string } | null;
  if (!profile?.organization_id) redirect('/onboarding/create');

  const orgId = profile.organization_id;

  const [orgResult, objectsResult, relationsResult] = await Promise.all([
    admin.from('organizations')
      .select('name, short_name, trust_score')
      .eq('id', orgId)
      .single(),
    admin.from('objects')
      .select('id, name, type, trust_score, criticality')
      .eq('organization_id', orgId)
      .neq('status', 'archived')
      .order('name', { ascending: true }),
    admin.from('relations')
      .select('id, source_object_id, target_object_id, relation_type')
      .eq('organization_id', orgId),
  ]);

  const orgRaw = orgResult.data as {
    name: string; short_name: string | null; trust_score: number | null;
  } | null;

  const orgName  = orgRaw?.short_name ?? orgRaw?.name ?? '';
  const orgScore = orgRaw?.trust_score ?? 70;

  // ── Nodes ─────────────────────────────────────────────────────────────────
  const objectNodes: GraphNode[] = ((objectsResult.data ?? []) as Array<{
    id: string; name: string; type: string; trust_score: number; criticality: string;
  }>).map(o => ({
    id:          o.id,
    name:        o.name,
    type:        o.type,
    trust_score: o.trust_score ?? 50,
    criticality: o.criticality,
    size:        NODE_SIZE[o.criticality] ?? 15,
    x: 0, y: 0, vx: 0, vy: 0, fx: null, fy: null,
  }));

  const orgNode: GraphNode = {
    id:          orgId,
    name:        orgName,
    type:        'org',
    trust_score: orgScore,
    criticality: 'critical',
    size:        28,
    x: 0, y: 0, vx: 0, vy: 0, fx: null, fy: null,
  };

  const nodes: GraphNode[] = [orgNode, ...objectNodes];

  // ── Links ─────────────────────────────────────────────────────────────────
  const objectIds = new Set(objectNodes.map(n => n.id));

  // Org → each object (structural backbone)
  const orgLinks: RawLink[] = objectNodes.map(n => ({
    id:            `org-${n.id}`,
    source:        orgId,
    target:        n.id,
    relation_type: 'belongs_to',
  }));

  // Object ↔ object relations from DB
  const objLinks: RawLink[] = ((relationsResult.data ?? []) as Array<{
    id: string; source_object_id: string; target_object_id: string; relation_type: string;
  }>)
    .filter(r => objectIds.has(r.source_object_id) && objectIds.has(r.target_object_id))
    .map(r => ({
      id:            r.id,
      source:        r.source_object_id,
      target:        r.target_object_id,
      relation_type: r.relation_type,
    }));

  const links: RawLink[] = [...orgLinks, ...objLinks];

  return (
    <GraphPageClient
      nodes={nodes}
      links={links}
      orgName={orgName}
    />
  );
}
