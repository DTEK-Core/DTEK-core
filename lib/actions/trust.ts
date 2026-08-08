'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getCurrentUserContext } from '@/lib/supabase/auth';
import { recalculateObjectTrust, recalculateAllOrgObjects } from '@/lib/trust/engine';

// ── Auth helper ────────────────────────────────────────────────────────────────

interface AuthCtx {
  userId: string;
  orgId:  string;
  role:   string;
}

async function getAuthCtx(): Promise<AuthCtx | null> {
  const context = await getCurrentUserContext();
  if (!context) return null;
  const profile = context?.profile as { role: string; organization_id: string } | null;
  if (!profile?.organization_id) return null;

  return { userId: context.userId, orgId: profile.organization_id, role: profile.role };
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
