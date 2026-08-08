'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserContext } from '@/lib/supabase/auth';
import { InviteSchema } from '@/lib/validation/schemas';
import { createServiceClient } from '@/lib/supabase/service';
import { createSecurityEvent } from '@/lib/security/audit';

interface CallerProfile {
  id: string;
  email: string | null;
  role: string | null;
  organization_id: string | null;
}

interface InvitationRow {
  id: string;
  email: string;
  role: string;
  organization_id: string;
  status: string;
  expires_at: string;
}

type SendInvitationResult = {
  error?: string;
  inviteUrl?: string;
  email?: string;
  role?: string;
  status?: 'created' | 'existing' | 'expired';
};

async function getCallerProfile(): Promise<CallerProfile | null> {
  const context = await getCurrentUserContext();
  const profile = context?.profile as CallerProfile | null;
  if (!profile) return null;
  return { ...profile, email: profile.email ?? null };
}

function buildInviteUrl(token: string): string | null {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '');
  if (!appUrl) return null;
  return `${appUrl}/invite/${token}`;
}

export async function sendInvitation(
  email: string,
  role: string,
  createNewExpired = false,
): Promise<SendInvitationResult> {
  const caller = await getCallerProfile();
  if (!caller?.organization_id) return { error: 'Нет активной организации' };
  if (caller.role !== 'owner') return { error: 'Только владелец может отправлять приглашения' };

  const parsed = InviteSchema.safeParse({ email, role });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Некорректные данные' };
  }

  const supabase = await createClient();
  const normalizedEmail = parsed.data.email.toLowerCase();

  const { data: existingRaw } = await supabase
    .from('invitations')
    .select('token, email, role, status, expires_at')
    .eq('organization_id', caller.organization_id)
    .eq('email', normalizedEmail)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const existing = existingRaw as unknown as (
    { token: string; email: string; role: string; status: string; expires_at: string } | null
  );

  if (existing?.status === 'pending') {
    const expired = new Date(existing.expires_at) < new Date();

    if (!expired) {
      const inviteUrl = buildInviteUrl(existing.token);
      if (!inviteUrl) return { error: 'NEXT_PUBLIC_APP_URL не настроен' };

      return {
        inviteUrl,
        email: existing.email,
        role: existing.role,
        status: 'existing',
      };
    }

    if (!createNewExpired) {
      return {
        email: existing.email,
        role: existing.role,
        status: 'expired',
      };
    }
  }

  const { data: invRaw, error } = await supabase
    .from('invitations')
    .insert({
      email:           normalizedEmail,
      role:            parsed.data.role,
      organization_id: caller.organization_id,
      invited_by:      caller.id,
    } as never)
    .select('token')
    .single();

  if (error) {
    if (error.code === '23505') return { error: 'Приглашение для этого email уже отправлено' };
    return { error: 'Не удалось отправить приглашение. Попробуйте ещё раз.' };
  }

  const inv = invRaw as unknown as { token: string } | null;
  if (!inv?.token) return { error: 'Не удалось создать ссылку приглашения' };

  const inviteUrl = buildInviteUrl(inv.token);
  if (!inviteUrl) return { error: 'NEXT_PUBLIC_APP_URL не настроен' };

  createSecurityEvent({
    organizationId: caller.organization_id,
    actorId:        caller.id,
    actorEmail:     caller.email ?? undefined,
    eventType:      'invitation.sent',
    targetType:     'invitation',
    metadata:       { email: normalizedEmail, role: parsed.data.role },
  });

  revalidatePath('/users');
  return {
    inviteUrl,
    email: normalizedEmail,
    role: parsed.data.role,
    status: 'created',
  };
}

export async function revokeInvitation(invitationId: string): Promise<{ error?: string }> {
  const caller = await getCallerProfile();
  if (!caller?.organization_id) return { error: 'Нет активной организации' };
  if (caller.role !== 'owner' && caller.role !== 'admin') return { error: 'Нет прав' };

  const service = createServiceClient();

  const { data: invRaw } = await service
    .from('invitations')
    .select('email')
    .eq('id', invitationId)
    .eq('organization_id', caller.organization_id)
    .single();

  const inv = invRaw as unknown as { email: string } | null;

  const { error } = await service
    .from('invitations')
    .update({ status: 'expired' } as never)
    .eq('id', invitationId)
    .eq('organization_id', caller.organization_id)
    .eq('status', 'pending');

  if (error) return { error: 'Не удалось отозвать приглашение. Попробуйте ещё раз.' };

  createSecurityEvent({
    organizationId: caller.organization_id,
    actorId:        caller.id,
    actorEmail:     caller.email ?? undefined,
    eventType:      'invitation.cancelled',
    targetType:     'invitation',
    targetId:       invitationId,
    metadata:       { email: inv?.email },
  });

  revalidatePath('/users');
  return {};
}

export async function acceptInvitation(
  token: string,
  firstName: string,
  lastName: string,
  password: string,
): Promise<{ error?: string }> {
  const service = createServiceClient();

  const { data: invRaw } = await service
    .from('invitations')
    .select('id, email, role, organization_id, status, expires_at')
    .eq('token', token)
    .single();

  const inv = invRaw as unknown as InvitationRow | null;

  if (!inv || inv.status !== 'pending' || new Date(inv.expires_at) < new Date()) {
    return { error: 'Приглашение недействительно или срок действия истёк' };
  }

  // Sign up or sign in
  const supabase = await createClient();
  let userId: string;

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: inv.email,
    password,
  });

  if (signUpError) {
    // User already exists — try sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: inv.email,
      password,
    });
    if (signInError) return { error: 'Неверный пароль для существующего аккаунта' };
    userId = signInData.user.id;
  } else {
    userId = signUpData.user!.id;
  }

  const fullName = `${firstName} ${lastName}`.trim();

  await service
    .from('profiles')
    .update({
      full_name: fullName,
      organization_id: inv.organization_id,
      role: inv.role,
      status: 'active',
    } as never)
    .eq('id', userId);

  await service
    .from('invitations')
    .update({ status: 'accepted' } as never)
    .eq('id', inv.id);

  createSecurityEvent({
    organizationId: inv.organization_id,
    actorId:        userId,
    actorEmail:     inv.email,
    eventType:      'invitation.accepted',
    targetType:     'invitation',
    targetId:       inv.id,
    metadata:       { email: inv.email, role: inv.role },
  });

  redirect('/dashboard');
}
