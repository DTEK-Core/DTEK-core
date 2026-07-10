import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DashboardClient } from '@/components/shared/dashboard/dashboard-client';
import type { DashboardProps } from '@/components/shared/dashboard/dashboard-client';
import type { EventItem } from '@/components/shared/dashboard/event-feed';
import '@/app/dashboard.css';

export const metadata: Metadata = { title: 'Центр управления — DTEK Core' };

// ── Raw shapes ────────────────────────────────────────────────────────────────

interface OrgRaw {
  trust_score: number | null;
  trust_level: string | null;
  name: string;
  short_name: string | null;
}

interface ObjectRaw {
  id: string;
  name: string;
  type: string;
  trust_score: number;
  trust_level: string;
  criticality: string;
}

interface EventRaw {
  object_id: string;
  old_score: number | null;
  new_score: number;
  reason: string | null;
  created_at: string;
  objects: { name: string; type: string } | { name: string; type: string }[] | null;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();

  const { data: profileRaw } = await admin
    .from('profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single();

  const profile = profileRaw as { role: string; organization_id: string } | null;
  if (!profile?.organization_id) redirect('/onboarding/create');

  const orgId = profile.organization_id;
  const role  = profile.role;

  // ── All queries in parallel ───────────────────────────────────────────────
  const LEVELS = ['critical', 'low', 'medium', 'good', 'high'] as const;

  const [
    orgResult,
    kpi1, kpi2, kpi3, kpi4,
    topRiskyResult,
    historyResult,
    eventsResult,
    ...distResults
  ] = await Promise.all([
    // 1. Org
    admin.from('organizations')
      .select('trust_score, trust_level, name, short_name')
      .eq('id', orgId)
      .single(),

    // 2. KPI counts
    admin.from('objects')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .neq('status', 'archived'),
    admin.from('risks')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .in('status', ['open', 'in_progress']),
    admin.from('risks')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('severity', 'critical')
      .in('status', ['open', 'in_progress']),
    admin.from('objects')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('trust_level', 'critical')
      .neq('status', 'archived'),

    // 3. Top 5 risky objects
    admin.from('objects')
      .select('id, name, type, trust_score, trust_level, criticality')
      .eq('organization_id', orgId)
      .neq('status', 'archived')
      .order('trust_score', { ascending: true })
      .limit(5),

    // 4. Trend history
    admin.from('trust_score_history')
      .select('new_score, created_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: true })
      .limit(180),

    // 5. Event feed
    admin.from('trust_score_history')
      .select('object_id, old_score, new_score, reason, created_at, objects(name, type)')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(15),

    // 6. Distribution: 5 level counts
    ...LEVELS.map(level =>
      admin.from('objects')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('trust_level', level)
        .neq('status', 'archived'),
    ),
  ]);

  // ── Shape data ────────────────────────────────────────────────────────────
  const orgRaw = orgResult.data as OrgRaw | null;

  const org: DashboardProps['org'] = {
    trust_score: orgRaw?.trust_score ?? 70,
    trust_level: orgRaw?.trust_level ?? 'medium',
    name:        orgRaw?.name ?? '',
    short_name:  orgRaw?.short_name ?? null,
  };

  const kpi: DashboardProps['kpi'] = {
    totalObjects:     kpi1.count ?? 0,
    openRisks:        kpi2.count ?? 0,
    critRisks:        kpi3.count ?? 0,
    critLevelObjects: kpi4.count ?? 0,
  };

  const topRisky = ((topRiskyResult.data ?? []) as ObjectRaw[]).map(o => ({
    id:          o.id,
    name:        o.name,
    type:        o.type,
    trust_score: o.trust_score,
    trust_level: o.trust_level,
    criticality: o.criticality,
  }));

  const history = ((historyResult.data ?? []) as { new_score: number; created_at: string }[]).map(p => ({
    new_score:  p.new_score,
    created_at: p.created_at,
  }));

  const distribution = LEVELS.map((level, i) => ({
    level,
    count: distResults[i]?.count ?? 0,
  }));

  const events: EventItem[] = ((eventsResult.data ?? []) as EventRaw[]).map(e => {
    const obj = Array.isArray(e.objects) ? e.objects[0] : e.objects;
    return {
      object_id:   e.object_id,
      old_score:   e.old_score,
      new_score:   e.new_score,
      reason:      e.reason,
      created_at:  e.created_at,
      object_name: obj?.name ?? e.object_id.slice(0, 8),
      object_type: obj?.type ?? 'other',
    };
  });

  const canRecalc = ['owner', 'analyst'].includes(role);

  return (
    <DashboardClient
      org={org}
      kpi={kpi}
      topRisky={topRisky}
      distribution={distribution}
      history={history}
      events={events}
      canRecalc={canRecalc}
      canOpenExecutiveReport={canRecalc}
    />
  );
}
