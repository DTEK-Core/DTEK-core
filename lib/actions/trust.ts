'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { recalculateObjectTrust, recalculateAllOrgObjects } from '@/lib/trust/engine';

// ── Auth helper ────────────────────────────────────────────────────────────────

interface AuthCtx {
  userId: string;
  orgId:  string;
  role:   string;
}

async function getAuthCtx(): Promise<AuthCtx | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from('profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single();

  const profile = data as { role: string; organization_id: string } | null;
  if (!profile?.organization_id) return null;

  return { userId: user.id, orgId: profile.organization_id, role: profile.role };
}

// ── Actions ────────────────────────────────────────────────────────────────────

/**
 * Ручной запуск переоценки Trust Score объекта.
 * Доступно owner, analyst, admin.
 */
export async function triggerRecalculate(objectId: string) {
  const ctx = await getAuthCtx();
  if (!ctx) redirect('/login');

  const { userId, orgId, role } = ctx;

  if (!['owner', 'analyst', 'admin'].includes(role)) {
    return { error: 'Недостаточно прав для запуска переоценки' };
  }

  try {
    await recalculateObjectTrust(objectId, orgId, {
      reason:    'recalculated',
      changedBy: `user:${userId}`,
    });
  } catch {
    return { error: 'Не удалось выполнить переоценку. Попробуйте ещё раз.' };
  }

  revalidatePath(`/objects/${objectId}`);
  revalidatePath(`/objects/${objectId}/passport`);
  return { success: true };
}

export async function triggerRecalculateAll() {
  const ctx = await getAuthCtx();
  if (!ctx) redirect('/login');

  const { userId, orgId, role } = ctx;

  if (!['owner', 'analyst'].includes(role)) {
    return { error: 'Только владелец или аналитик может запустить полную переоценку' };
  }

  try {
    await recalculateAllOrgObjects(orgId, {
      reason:    'recalculated',
      changedBy: `user:${userId}`,
    });
  } catch {
    return { error: 'Не удалось выполнить переоценку. Попробуйте ещё раз.' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/objects');
  return { success: true };
}
