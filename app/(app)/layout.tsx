import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppSidebar } from '@/components/shared/shell/app-sidebar';

interface Profile {
  full_name: string | null;
  email: string | null;
  organization_id: string | null;
}

interface Organization {
  name: string;
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('full_name, email, organization_id')
    .eq('id', user.id)
    .single();

  const profile = profileRaw as unknown as Profile | null;

  let orgName: string | null = null;
  if (profile?.organization_id) {
    const { data: orgRaw } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', profile.organization_id)
      .single();
    const org = orgRaw as unknown as Organization | null;
    orgName = org?.name ?? null;
  }

  const displayName = profile?.full_name ?? '';
  const email = profile?.email ?? user.email ?? '';

  return (
    <div className="app">
      <AppSidebar displayName={displayName} email={email} orgName={orgName} />
      <div className="app-main">
        <div className="app-scroll">{children}</div>
      </div>
    </div>
  );
}
