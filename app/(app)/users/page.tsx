import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserContext } from '@/lib/supabase/auth';
import { UsersPageClient } from '@/components/shared/users/users-page-client';
import type { Member } from '@/components/shared/users/user-row';

export const metadata: Metadata = {
  title: 'Пользователи — DTEK Core',
};

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  team: string | null;
  status: string | null;
  last_seen_at: string | null;
  organization_id: string | null;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default async function UsersPage() {
  const context = await getCurrentUserContext();
  if (!context) redirect('/login');
  const currentProfile = context.profile as Profile | null;
  if (!currentProfile?.organization_id) redirect('/onboarding/create');

  const currentRole = currentProfile.role ?? 'viewer';
  if (currentRole !== 'owner' && currentRole !== 'admin') {
    redirect('/dashboard');
  }

  const supabase = await createClient();

  // Fetch active/blocked members
  const { data: membersRaw } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, team, status, last_seen_at')
    .eq('organization_id', currentProfile.organization_id)
    .order('created_at');

  const memberProfiles = (membersRaw as unknown as Profile[] | null) ?? [];

  const members: Member[] = memberProfiles.map((p) => ({
    id: p.id,
    full_name: p.full_name,
    email: p.email,
    role: p.role,
    team: p.team,
    status: p.status,
    last_seen_at: p.last_seen_at,
  }));

  // Fetch pending invitations to show in the table
  const { data: invitationsRaw } = await supabase
    .from('invitations')
    .select('id, email, role, created_at')
    .eq('organization_id', currentProfile.organization_id)
    .eq('status', 'pending')
    .order('created_at');

  const invitations = (invitationsRaw as unknown as PendingInvitation[] | null) ?? [];

  // Map pending invitations to Member shape for display
  const invitedRows: Member[] = invitations.map((inv) => ({
    id: inv.id,
    full_name: null,
    email: inv.email,
    role: inv.role,
    team: null,
    status: 'invited',
    last_seen_at: null,
    invitation_id: inv.id,
  }));

  const allMembers = [...members, ...invitedRows];

  return (
    <UsersPageClient
      members={allMembers}
      currentUserId={context.userId}
      currentUserRole={currentRole}
    />
  );
}
