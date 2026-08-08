import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserContext } from '@/lib/supabase/auth';
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
  const context = await getCurrentUserContext();
  if (!context) redirect('/login');
  const profile = context.profile as Profile | null;
  if (!profile?.organization_id) redirect('/onboarding/create');

  const supabase = await createClient();
  const { data: orgRaw } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('id', profile.organization_id)
    .single();

  const org = orgRaw as unknown as Organization | null;
  if (!org) redirect('/onboarding/create');

  return <Wizard orgId={org.id} orgName={org.name} />;
}
