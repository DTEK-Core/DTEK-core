'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserContext } from '@/lib/supabase/auth';

type UserRole = 'analyst' | 'admin' | 'viewer';

interface ProfileRow {
  id: string;
  role: string | null;
  organization_id: string | null;
}

async function getCallerProfile(): Promise<{
  profile: ProfileRow;
  orgId: string;
} | null> {
  const context = await getCurrentUserContext();
  const profile = context?.profile as ProfileRow | null;
  if (!profile?.organization_id) return null;
  if (profile.role !== 'owner' && profile.role !== 'admin') return null;

  return {
    profile,
    orgId: profile.organization_id,
  };
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

  const { error } = await supabase
    .rpc('change_organization_member_role' as never, {
      p_target_user_id: targetUserId,
      p_role:           role,
    } as never);

  if (error) return { error: 'Не удалось изменить роль. Попробуйте ещё раз.' };

  revalidatePath('/users');
  return {};
}

export async function blockUser(targetUserId: string): Promise<{ error?: string }> {
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

  const { error } = await supabase
    .rpc('set_organization_member_status' as never, {
      p_target_user_id: targetUserId,
      p_status:         'blocked',
    } as never);

  if (error) return { error: 'Не удалось заблокировать пользователя. Попробуйте ещё раз.' };

  revalidatePath('/users');
  return {};
}

export async function unblockUser(targetUserId: string): Promise<{ error?: string }> {
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
  if (target.role === 'owner') return { error: 'Нельзя изменить статус владельца' };

  const { error } = await supabase
    .rpc('set_organization_member_status' as never, {
      p_target_user_id: targetUserId,
      p_status:         'active',
    } as never);

  if (error) return { error: 'Не удалось разблокировать пользователя. Попробуйте ещё раз.' };

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

  const { error } = await supabase
    .rpc('remove_organization_member' as never, {
      p_target_user_id: targetUserId,
    } as never);

  if (error) return { error: 'Не удалось удалить пользователя. Попробуйте ещё раз.' };

  revalidatePath('/users');
  return {};
}
