import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUserContext } from '@/lib/supabase/auth';
import { SettingsLayout } from '@/components/shared/settings/settings-layout';
import type { SecurityEventRow } from '@/components/shared/settings/security-log';

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
  const context = await getCurrentUserContext();
  if (!context) redirect('/login');
  const profile = context.profile as Profile | null;
  if (!profile?.organization_id) redirect('/onboarding/create');

  const supabase = await createClient();
  const { data: orgRaw } = await supabase
    .from('organizations')
    .select('id, name, inn, industry, region, size')
    .eq('id', profile.organization_id)
    .single();

  const org = orgRaw as unknown as Organization | null;
  if (!org) redirect('/onboarding/create');

  // Audit log — only for owner and admin
  let auditLogs: SecurityEventRow[] = [];
  if (profile.role === 'owner' || profile.role === 'admin') {
    const admin = createAdminClient();
    const { data: eventsRaw } = await admin
      .from('security_events')
      .select('id, event_type, actor_email, target_type, target_id, metadata, created_at')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })
      .limit(100);

    auditLogs = (eventsRaw as unknown as SecurityEventRow[] | null) ?? [];
  }

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
          email: profile.email ?? '',
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
        role={profile.role}
        auditLogs={auditLogs}
      />
    </div>
  );
}
