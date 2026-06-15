'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

type UserRole = 'analyst' | 'admin' | 'viewer';
type UserStatus = 'active' | 'blocked';

interface ProfileRow {
  id: string;
  role: string | null;
  organization_id: string | null;
}

async function getCallerProfile(): Promise<{ profile: ProfileRow; orgId: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('id, role, organization_id')
    .eq('id', user.id)
    .single();

  const profile = data as unknown as ProfileRow | null;
  if (!profile?.organization_id) return null;
  if (profile.role !== 'owner' && profile.role !== 'admin') return null;

  return { profile, orgId: profile.organization_id };
}

export async function changeUserRole(
  targetUserId: string,
  role: UserRole,
): Promise<{ error?: string }> {
  const caller = await getCallerProfile();
  if (!caller) return { error: 'Нет прав для изменения ролей' };

  if (targetUserId === caller.profile.id) {
    return { error: 'Нельзя изменить собственную роль' };
  }

  const supabase = await createClient();

  // Fetch target to verify same org and not an owner
  const { data: targetRaw } = await supabase
    .from('profiles')
    .select('id, role, organization_id')
    .eq('id', targetUserId)
    .single();

  const target = targetRaw as unknown as ProfileRow | null;
  if (!target || target.organization_id !== caller.orgId) {
    return { error: 'Пользователь не найден' };
  }
  if (target.role === 'owner') {
    return { error: 'Нельзя изменить роль владельца' };
  }

  await supabase
    .from('profiles')
    .update({ role } as never)
    .eq('id', targetUserId);

  revalidatePath('/users');
  return {};
}

export async function blockUser(targetUserId: string): Promise<{ error?: string }> {
  return setUserStatus(targetUserId, 'blocked');
}

export async function unblockUser(targetUserId: string): Promise<{ error?: string }> {
  return setUserStatus(targetUserId, 'active');
}

async function setUserStatus(
  targetUserId: string,
  status: UserStatus,
): Promise<{ error?: string }> {
  const caller = await getCallerProfile();
  if (!caller) return { error: 'Нет прав' };
  if (targetUserId === caller.profile.id) return { error: 'Нельзя изменить собственный статус' };

  const supabase = await createClient();

  const { data: targetRaw } = await supabase
    .from('profiles')
    .select('id, role, organization_id')
    .eq('id', targetUserId)
    .single();

  const target = targetRaw as unknown as ProfileRow | null;
  if (!target || target.organization_id !== caller.orgId) return { error: 'Пользователь не найден' };
  if (target.role === 'owner') return { error: 'Нельзя заблокировать владельца' };

  await supabase
    .from('profiles')
    .update({ status } as never)
    .eq('id', targetUserId);

  revalidatePath('/users');
  return {};
}

export async function removeUser(targetUserId: string): Promise<{ error?: string }> {
  const caller = await getCallerProfile();
  if (!caller) return { error: 'Нет прав' };
  if (targetUserId === caller.profile.id) return { error: 'Нельзя удалить себя из организации' };

  const supabase = await createClient();

  const { data: targetRaw } = await supabase
    .from('profiles')
    .select('id, role, organization_id')
    .eq('id', targetUserId)
    .single();

  const target = targetRaw as unknown as ProfileRow | null;
  if (!target || target.organization_id !== caller.orgId) return { error: 'Пользователь не найден' };
  if (target.role === 'owner') return { error: 'Нельзя удалить владельца' };

  await supabase
    .from('profiles')
    .update({ organization_id: null, role: null } as never)
    .eq('id', targetUserId);

  revalidatePath('/users');
  return {};
}
