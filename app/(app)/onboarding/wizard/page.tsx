import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Wizard } from '@/components/shared/onboarding/wizard';

export const metadata: Metadata = {
  title: 'Настройка платформы — DTEK Core',
};

interface Profile {
  organization_id: string | null;
}

interface Organization {
  id: string;
  name: string;
}

export default async function WizardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  const profile = profileRaw as unknown as Profile | null;
  if (!profile?.organization_id) redirect('/onboarding/create');

  const { data: orgRaw } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('id', profile.organization_id)
    .single();

  const org = orgRaw as unknown as Organization | null;
  if (!org) redirect('/onboarding/create');

  return <Wizard orgId={org.id} orgName={org.name} />;
}
