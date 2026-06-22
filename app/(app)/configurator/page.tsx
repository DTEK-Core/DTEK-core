import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { WeightsEditor } from '@/components/shared/configurator/weights-editor';
import type { FactorWeights } from '@/lib/trust/calculate';
import '@/app/configurator.css';

export const metadata: Metadata = { title: 'Конфигуратор — DTEK Core' };

const DEFAULT_WEIGHTS: FactorWeights = {
  vuln_weight:       22,
  config_weight:     18,
  access_weight:     18,
  network_weight:    14,
  compliance_weight: 16,
  incident_weight:   12,
};

export default async function ConfiguratorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();

  const { data: profileRaw } = await admin
    .from('profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single() as unknown as { data: { role: string; organization_id: string } | null };

  const profile = profileRaw;
  if (!profile?.organization_id) redirect('/onboarding/create');

  const orgId   = profile.organization_id;
  const canEdit = ['owner', 'analyst'].includes(profile.role);

  const [orgResult, configResult] = await Promise.all([
    admin.from('organizations')
      .select('name, short_name')
      .eq('id', orgId)
      .single(),
    admin.from('trust_factor_config')
      .select('vuln_weight, config_weight, access_weight, network_weight, compliance_weight, incident_weight')
      .eq('organization_id', orgId)
      .maybeSingle(),
  ]);

  const orgRaw  = orgResult.data as { name: string; short_name: string | null } | null;
  const orgName = orgRaw?.short_name ?? orgRaw?.name ?? '';

  const configRaw = configResult.data as FactorWeights | null;
  const weights   = configRaw ?? DEFAULT_WEIGHTS;

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Конфигуратор</h1>
          <p className="screen-sub">Настройка модели Trust Score · {orgName}</p>
        </div>
      </div>
      <WeightsEditor weights={weights} canEdit={canEdit} />
    </div>
  );
}
