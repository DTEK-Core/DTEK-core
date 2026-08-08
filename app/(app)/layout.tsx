import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/supabase/auth';
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
  const context = await getCurrentUserContext();
  if (!context) redirect('/login');

  const profile = context.profile as Profile | null;

  let orgName: string | null = null;
  if (profile?.organization_id) {
    const supabase = await createClient();
    const { data: orgRaw } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', profile.organization_id)
      .single();
    const org = orgRaw as unknown as Organization | null;
    orgName = org?.name ?? null;
  }

  const displayName = profile?.full_name ?? '';
  const email = profile?.email ?? '';

  return (
    <div className="app">
      <AppSidebar displayName={displayName} email={email} orgName={orgName} />
      <div className="app-main">
        <div className="app-scroll">{children}</div>
      </div>
    </div>
  );
}
