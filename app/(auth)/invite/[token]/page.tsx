import type { Metadata } from 'next';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/service';
import { AcceptInviteForm } from '@/components/shared/auth/accept-invite-form';

export const metadata: Metadata = {
  title: 'Принять приглашение — DTEK Core',
};

interface InvitationRow {
  email: string;
  role: string;
  organization_id: string;
  status: string;
  expires_at: string;
}

interface OrgRow {
  name: string;
}

function InviteError({ message }: { message: string }) {
  return (
    <div className="auth-form" style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 32, marginBottom: 16 }}>🔒</p>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Приглашение недоступно</h2>
      <p style={{ fontSize: 14, color: 'var(--text-mute)', marginBottom: 24 }}>{message}</p>
      <Link href="/login" className="btn btn-ghost">
        Войти в платформу
      </Link>
    </div>
  );
}

export default async function InvitePage({
  params,
}: {
  params: { token: string };
}) {
  const service = createServiceClient();

  const { data: invRaw } = await service
    .from('invitations')
    .select('email, role, organization_id, status, expires_at')
    .eq('token', params.token)
    .single();

  const invitation = invRaw as unknown as InvitationRow | null;

  if (!invitation) {
    return <InviteError message="Приглашение не найдено или уже использовано." />;
  }

  if (invitation.status !== 'pending' || new Date(invitation.expires_at) < new Date()) {
    return <InviteError message="Срок действия приглашения истёк. Попросите владельца организации выслать новое." />;
  }

  const { data: orgRaw } = await service
    .from('organizations')
    .select('name')
    .eq('id', invitation.organization_id)
    .single();

  const org = orgRaw as unknown as OrgRow | null;

  return (
    <AcceptInviteForm
      token={params.token}
      email={invitation.email}
      role={invitation.role}
      orgName={org?.name ?? ''}
    />
  );
}
