import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UsersTable } from '@/components/shared/users/users-table';
import { RolesInfoCard } from '@/components/shared/users/roles-info-card';
import { Icon } from '@/components/shared/icon';

export const metadata: Metadata = {
  title: 'Пользователи — DTEK Core',
};

interface Profile {
  id: string;
  organization_id: string | null;
  role: string | null;
}

interface Member {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  team: string | null;
  status: string | null;
  last_seen_at: string | null;
}

export default async function UsersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('id, organization_id, role')
    .eq('id', user.id)
    .single();

  const profile = profileRaw as unknown as Profile | null;
  if (!profile?.organization_id) redirect('/onboarding/create');

  const currentRole = profile.role ?? 'viewer';
  if (currentRole !== 'owner' && currentRole !== 'admin') {
    redirect('/dashboard');
  }

  const { data: membersRaw } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, team, status, last_seen_at')
    .eq('organization_id', profile.organization_id)
    .order('created_at');

  const members = (membersRaw as unknown as Member[] | null) ?? [];

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Пользователи</h1>
          <p className="screen-sub">
            {members.length} участник{members.length === 1 ? '' : members.length < 5 ? 'а' : 'ов'} · управление доступом и ролями
          </p>
        </div>
        {/* Invite flow реализуется в T009 */}
        <button className="btn btn-primary btn-sm" type="button" disabled>
          <Icon name="plus" size={15} />
          Пригласить
        </button>
      </div>

      <div className="users-layout">
        <div className="card span-8" style={{ padding: 0 }}>
          <UsersTable
            members={members}
            currentUserId={user.id}
            currentUserRole={currentRole}
          />
        </div>
        <RolesInfoCard />
      </div>
    </div>
  );
}
