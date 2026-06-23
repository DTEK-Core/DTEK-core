'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createSecurityEvent } from '@/lib/security/audit';

type UserRole = 'analyst' | 'admin' | 'viewer';

interface ProfileRow {
  id: string;
  email: string | null;
  role: string | null;
  organization_id: string | null;
}

async function getCallerProfile(): Promise<{
  profile: ProfileRow;
  orgId: string;
  actorEmail: string;
} | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('id, email, role, organization_id')
    .eq('id', user.id)
    .single();

  const profile = data as unknown as ProfileRow | null;
  if (!profile?.organization_id) return null;
  if (profile.role !== 'owner' && profile.role !== 'admin') return null;

  return {
    profile,
    orgId: profile.organization_id,
    actorEmail: user.email ?? profile.email ?? '',
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
    .select('id, email, role, organization_id')
    .eq('id', targetUserId)
    .single();

  const target = targetRaw as unknown as ProfileRow | null;
  if (!target || target.organization_id !== caller.orgId) {
    return { error: 'Пользователь не найден' };
  }
  if (target.role === 'owner') {
    return { error: 'Нельзя изменить роль владельца' };
  }

  const fromRole = target.role;

  const { error } = await supabase
    .from('profiles')
    .update({ role } as never)
    .eq('id', targetUserId);

  if (error) return { error: 'Не удалось изменить роль. Попробуйте ещё раз.' };

  createSecurityEvent({
    organizationId: caller.orgId,
    actorId:        caller.profile.id,
    actorEmail:     caller.actorEmail,
    eventType:      'role.changed',
    targetType:     'user',
    targetId:       targetUserId,
    metadata:       { fromRole, toRole: role },
  });

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
    .select('id, email, role, organization_id')
    .eq('id', targetUserId)
    .single();

  const target = targetRaw as unknown as ProfileRow | null;
  if (!target || target.organization_id !== caller.orgId) return { error: 'Пользователь не найден' };
  if (target.role === 'owner') return { error: 'Нельзя заблокировать владельца' };

  const { error } = await supabase
    .from('profiles')
    .update({ status: 'blocked' } as never)
    .eq('id', targetUserId);

  if (error) return { error: 'Не удалось заблокировать пользователя. Попробуйте ещё раз.' };

  createSecurityEvent({
    organizationId: caller.orgId,
    actorId:        caller.profile.id,
    actorEmail:     caller.actorEmail,
    eventType:      'user.blocked',
    targetType:     'user',
    targetId:       targetUserId,
    metadata:       { targetEmail: target.email },
  });

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
    .select('id, email, role, organization_id')
    .eq('id', targetUserId)
    .single();

  const target = targetRaw as unknown as ProfileRow | null;
  if (!target || target.organization_id !== caller.orgId) return { error: 'Пользователь не найден' };
  if (target.role === 'owner') return { error: 'Нельзя изменить статус владельца' };

  const { error } = await supabase
    .from('profiles')
    .update({ status: 'active' } as never)
    .eq('id', targetUserId);

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
    .select('id, email, role, organization_id')
    .eq('id', targetUserId)
    .single();

  const target = targetRaw as unknown as ProfileRow | null;
  if (!target || target.organization_id !== caller.orgId) return { error: 'Пользователь не найден' };
  if (target.role === 'owner') return { error: 'Нельзя удалить владельца' };

  const { error } = await supabase
    .from('profiles')
    .update({ organization_id: null, role: null } as never)
    .eq('id', targetUserId);

  if (error) return { error: 'Не удалось удалить пользователя. Попробуйте ещё раз.' };

  createSecurityEvent({
    organizationId: caller.orgId,
    actorId:        caller.profile.id,
    actorEmail:     caller.actorEmail,
    eventType:      'user.removed',
    targetType:     'user',
    targetId:       targetUserId,
    metadata:       { targetEmail: target.email },
  });

  revalidatePath('/users');
  return {};
}
