'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { recalculateObjectTrust } from '@/lib/trust/engine';

const INFRA_TYPES = ['server', 'workstation', 'laptop', 'network', 'ot'];

const INITIAL_SCORE: Record<string, number> = {
  critical: 65, high: 70, medium: 75, low: 80,
};
const INITIAL_LEVEL: Record<string, string> = {
  critical: 'low', high: 'medium', medium: 'good', low: 'good',
};

interface AuthCtx {
  userId: string;
  role: string;
  orgId: string;
  admin: ReturnType<typeof createAdminClient>;
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

  return { userId: user.id, role: profile.role, orgId: profile.organization_id, admin };
}

function str(fd: FormData, key: string): string | null {
  const v = (fd.get(key) as string | null)?.trim();
  return v || null;
}

export async function createObject(formData: FormData) {
  const ctx = await getAuthCtx();
  if (!ctx) redirect('/login');

  const { userId, role, orgId, admin } = ctx;

  if (!['owner', 'analyst', 'admin'].includes(role)) {
    return { error: 'Недостаточно прав' };
  }

  const type = str(formData, 'type') ?? '';
  if (!type) return { error: 'Выберите тип объекта' };

  if (role === 'admin' && !INFRA_TYPES.includes(type)) {
    return { error: 'Администратор может создавать только инфраструктурные объекты (сервер, рабочая станция, ноутбук, сетевое оборудование, АСУ ТП)' };
  }

  const name = str(formData, 'name');
  if (!name) return { error: 'Введите название объекта' };

  const criticality = str(formData, 'criticality') ?? 'medium';

  const { error } = await admin.from('objects').insert({
    organization_id: orgId,
    owner_id: userId,
    name,
    type,
    description: str(formData, 'description'),
    criticality,
    ip_address: str(formData, 'ip_address'),
    os_platform: str(formData, 'os_platform'),
    segment: str(formData, 'segment'),
    exposure: str(formData, 'exposure'),
    trust_score: INITIAL_SCORE[criticality] ?? 75,
    trust_level: INITIAL_LEVEL[criticality] ?? 'good',
  } as never);

  if (error) return { error: error.message };

  revalidatePath('/objects');
  return { success: true };
}

export async function updateObject(id: string, formData: FormData) {
  const ctx = await getAuthCtx();
  if (!ctx) redirect('/login');

  const { role, orgId, admin } = ctx;

  if (!['owner', 'analyst', 'admin'].includes(role)) {
    return { error: 'Недостаточно прав' };
  }

  const name = str(formData, 'name');
  if (!name) return { error: 'Введите название объекта' };

  const { error } = await admin
    .from('objects')
    .update({
      name,
      type: str(formData, 'type'),
      description: str(formData, 'description'),
      criticality: str(formData, 'criticality') ?? 'medium',
      ip_address: str(formData, 'ip_address'),
      os_platform: str(formData, 'os_platform'),
      segment: str(formData, 'segment'),
      exposure: str(formData, 'exposure'),
    } as never)
    .eq('id', id)
    .eq('organization_id', orgId);

  if (error) return { error: error.message };

  try { await recalculateObjectTrust(id, orgId); } catch { /* non-blocking */ }

  revalidatePath('/objects');
  revalidatePath(`/objects/${id}`);
  revalidatePath(`/objects/${id}/passport`);
  return { success: true };
}

export async function deleteObject(id: string) {
  const ctx = await getAuthCtx();
  if (!ctx) redirect('/login');

  const { role, orgId, admin } = ctx;

  if (!['owner', 'analyst'].includes(role)) {
    return { error: 'Только владелец или аналитик может удалять объекты' };
  }

  const { error } = await admin
    .from('objects')
    .delete()
    .eq('id', id)
    .eq('organization_id', orgId);

  if (error) return { error: error.message };

  revalidatePath('/objects');
  return { success: true };
}

export async function archiveObject(id: string) {
  const ctx = await getAuthCtx();
  if (!ctx) redirect('/login');

  const { role, orgId, admin } = ctx;

  if (!['owner', 'analyst', 'admin'].includes(role)) {
    return { error: 'Недостаточно прав' };
  }

  const { error } = await admin
    .from('objects')
    .update({ status: 'archived' } as never)
    .eq('id', id)
    .eq('organization_id', orgId);

  if (error) return { error: error.message };

  revalidatePath('/objects');
  revalidatePath(`/objects/${id}`);
  return { success: true };
}
