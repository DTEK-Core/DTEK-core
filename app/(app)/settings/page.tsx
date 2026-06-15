import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SettingsLayout } from '@/components/shared/settings/settings-layout';

export const metadata: Metadata = {
  title: 'Настройки — DTEK Core',
};

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  team: string | null;
  organization_id: string | null;
}

interface Organization {
  id: string;
  name: string;
  inn: string | null;
  industry: string | null;
  region: string | null;
  size: string | null;
}

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, team, organization_id')
    .eq('id', user.id)
    .single();

  const profile = profileRaw as unknown as Profile | null;
  if (!profile?.organization_id) redirect('/onboarding/create');

  const { data: orgRaw } = await supabase
    .from('organizations')
    .select('id, name, inn, industry, region, size')
    .eq('id', profile.organization_id)
    .single();

  const org = orgRaw as unknown as Organization | null;
  if (!org) redirect('/onboarding/create');

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Настройки</h1>
          <p className="screen-sub">Управление профилем, организацией и платформой</p>
        </div>
      </div>

      <SettingsLayout
        profile={{
          fullName: profile.full_name ?? '',
          email: profile.email ?? user.email ?? '',
          team: profile.team,
          role: profile.role,
        }}
        org={{
          id: org.id,
          name: org.name,
          inn: org.inn,
          industry: org.industry,
          region: org.region,
          size: org.size,
        }}
        isOwner={profile.role === 'owner'}
      />
    </div>
  );
}
