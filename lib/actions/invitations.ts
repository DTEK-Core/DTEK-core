'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
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

async function getCallerProfile(): Promise<CallerProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('id, email, role, organization_id')
    .eq('id', user.id)
    .single();

  const profile = data as unknown as CallerProfile | null;
  if (!profile) return null;
  return { ...profile, email: user.email ?? profile.email ?? null };
}

export async function sendInvitation(
  email: string,
  role: string,
): Promise<{ error?: string }> {
  const caller = await getCallerProfile();
  if (!caller?.organization_id) return { error: 'Нет активной организации' };
  if (caller.role !== 'owner') return { error: 'Только владелец может отправлять приглашения' };

  const parsed = InviteSchema.safeParse({ email, role });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Некорректные данные' };
  }

  const supabase = await createClient();

  const { data: invRaw, error } = await supabase
    .from('invitations')
    .insert({
      email:           parsed.data.email,
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  console.log(`[INVITE] ${email} → ${appUrl}/invite/${inv?.token}`);

  createSecurityEvent({
    organizationId: caller.organization_id,
    actorId:        caller.id,
    actorEmail:     caller.email ?? undefined,
    eventType:      'invitation.sent',
    targetType:     'invitation',
    metadata:       { email: parsed.data.email, role: parsed.data.role },
  });

  revalidatePath('/users');
  return {};
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
