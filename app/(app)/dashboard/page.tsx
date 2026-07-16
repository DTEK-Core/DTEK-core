import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DashboardClient } from '@/components/shared/dashboard/dashboard-client';
import type { DashboardProps } from '@/components/shared/dashboard/dashboard-client';
import type { EventItem } from '@/components/shared/dashboard/event-feed';
import { TRUST_FACTORS, type TrustFactorKey } from '@/lib/design-tokens';
import {
  buildDashboardExplainabilitySummary,
  type DashboardObjectDriversInput,
  type ScoreFactorInput,
} from '@/lib/trust/explainability';
import {
  DEFAULT_FACTOR_WEIGHTS,
  type FactorWeights,
} from '@/lib/trust/calculate';
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
  trust_passports: ExplainabilityPassportRaw | ExplainabilityPassportRaw[] | null;
}

interface EventRaw {
  object_id: string;
  old_score: number | null;
  new_score: number;
  reason: string | null;
  created_at: string;
  objects: { name: string; type: string } | { name: string; type: string }[] | null;
}

interface ExplainabilityPassportRaw {
  organization_id: string;
  vuln_score: number;
  config_score: number;
  access_score: number;
  network_score: number;
  compliance_score: number;
  incident_score: number;
}

const FACTOR_SCORE_KEYS: Readonly<Record<
  TrustFactorKey,
  keyof Omit<ExplainabilityPassportRaw, 'organization_id'>
>> = {
  vuln:       'vuln_score',
  config:     'config_score',
  access:     'access_score',
  network:    'network_score',
  compliance: 'compliance_score',
  incident:   'incident_score',
};

const FACTOR_WEIGHT_KEYS: Readonly<Record<TrustFactorKey, keyof FactorWeights>> = {
  vuln:       'vuln_weight',
  config:     'config_weight',
  access:     'access_weight',
  network:    'network_weight',
  compliance: 'compliance_weight',
  incident:   'incident_weight',
};

function single<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function scoreFactors(
  passport: ExplainabilityPassportRaw,
  weights: FactorWeights,
): ScoreFactorInput[] {
  return TRUST_FACTORS.map((factor) => ({
    key: factor.key,
    label: factor.label,
    score: passport[FACTOR_SCORE_KEYS[factor.key]],
    weight: weights[FACTOR_WEIGHT_KEYS[factor.key]],
  }));
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
    openRisksResult,
    criticalRisksResult,
    objectsResult,
    historyResult,
    eventsResult,
    factorWeightsResult,
  ] = await Promise.all([
    // 1. Org
    admin.from('organizations')
      .select('trust_score, trust_level, name, short_name')
      .eq('id', orgId)
      .single(),

    // 2. Risk KPI counts
    admin.from('risks')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .in('status', ['open', 'in_progress']),
    admin.from('risks')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('severity', 'critical')
      .in('status', ['open', 'in_progress']),

    // 3. One active object set for KPI, distribution, top-5 and explainability
    admin.from('objects')
      .select(`
        id, name, type, trust_score, trust_level, criticality,
        trust_passports(
          organization_id, vuln_score, config_score, access_score,
          network_score, compliance_score, incident_score
        )
      `)
      .eq('organization_id', orgId)
      .neq('status', 'archived'),

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

    // 6. Current organization factor weights
    admin.from('trust_factor_config')
      .select('vuln_weight, config_weight, access_weight, network_weight, compliance_weight, incident_weight')
      .eq('organization_id', orgId)
      .single(),
  ]);

  // ── Shape data ────────────────────────────────────────────────────────────
  const orgRaw = orgResult.data as OrgRaw | null;

  const org: DashboardProps['org'] = {
    trust_score: orgRaw?.trust_score ?? 70,
    trust_level: orgRaw?.trust_level ?? 'medium',
    name:        orgRaw?.name ?? '',
    short_name:  orgRaw?.short_name ?? null,
  };

  const objects = (
    (objectsResult.data ?? []) as unknown as ObjectRaw[]
  );

  const kpi: DashboardProps['kpi'] = {
    totalObjects: objects.length,
    openRisks: openRisksResult.count ?? 0,
    critRisks: criticalRisksResult.count ?? 0,
    critLevelObjects: objects.filter(({ trust_level }) => trust_level === 'critical').length,
  };

  const topRisky = [...objects]
    .sort((left, right) => left.trust_score - right.trust_score)
    .slice(0, 5)
    .map(o => ({
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

  const distribution = LEVELS.map((level) => ({
    level,
    count: objects.filter((object) => object.trust_level === level).length,
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

  const factorWeights = (
    factorWeightsResult.data as unknown as FactorWeights | null
  ) ?? DEFAULT_FACTOR_WEIGHTS;
  const explainabilityObjects: DashboardObjectDriversInput[] = objects.map((object) => {
    const passport = single(object.trust_passports);
    return {
      objectId: object.id,
      objectName: object.name,
      factors: passport?.organization_id === orgId
        ? scoreFactors(passport, factorWeights)
        : null,
    };
  });
  const explainability = buildDashboardExplainabilitySummary(explainabilityObjects);

  const canRecalc = ['owner', 'analyst'].includes(role);

  return (
    <DashboardClient
      org={org}
      kpi={kpi}
      topRisky={topRisky}
      distribution={distribution}
      history={history}
      events={events}
      explainability={explainability}
      canRecalc={canRecalc}
      canOpenExecutiveReport={canRecalc}
    />
  );
}
