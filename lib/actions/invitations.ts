'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

interface CallerProfile {
  id: string;
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('id, role, organization_id')
    .eq('id', user.id)
    .single();

  return data as unknown as CallerProfile | null;
}

export async function sendInvitation(
  email: string,
  role: string,
): Promise<{ error?: string }> {
  const caller = await getCallerProfile();
  if (!caller?.organization_id) return { error: 'Нет активной организации' };
  if (caller.role !== 'owner') return { error: 'Только владелец может отправлять приглашения' };

  const supabase = await createClient();

  const { data: invRaw, error } = await supabase
    .from('invitations')
    .insert({
      email,
      role,
      organization_id: caller.organization_id,
      invited_by: caller.id,
    } as never)
    .select('token')
    .single();

  if (error) {
    if (error.code === '23505') return { error: 'Приглашение для этого email уже отправлено' };
    return { error: error.message };
  }

  const inv = invRaw as unknown as { token: string } | null;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  console.log(`[INVITE] ${email} → ${appUrl}/invite/${inv?.token}`);

  revalidatePath('/users');
  return {};
}

export async function revokeInvitation(invitationId: string): Promise<{ error?: string }> {
  const caller = await getCallerProfile();
  if (!caller?.organization_id) return { error: 'Нет активной организации' };
  if (caller.role !== 'owner' && caller.role !== 'admin') return { error: 'Нет прав' };

  const service = createServiceClient();

  const { error } = await service
    .from('invitations')
    .update({ status: 'expired' } as never)
    .eq('id', invitationId)
    .eq('organization_id', caller.organization_id)
    .eq('status', 'pending');

  if (error) return { error: error.message };

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

  redirect('/dashboard');
}
