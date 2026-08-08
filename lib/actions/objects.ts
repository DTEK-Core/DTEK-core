'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUserContext } from '@/lib/supabase/auth';
import { recalculateObjectTrust } from '@/lib/trust/engine';
import { CreateObjectSchema, UpdateObjectSchema } from '@/lib/validation/schemas';

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
  const context = await getCurrentUserContext();
  if (!context) return null;
  const profile = context?.profile as { role: string; organization_id: string } | null;
  if (!profile?.organization_id) return null;

  return {
    userId: context.userId,
    role: profile.role,
    orgId: profile.organization_id,
    admin: createAdminClient(),
  };
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

  const parsed = CreateObjectSchema.safeParse({
    name:        str(formData, 'name'),
    type:        str(formData, 'type'),
    criticality: str(formData, 'criticality') ?? 'medium',
    description: str(formData, 'description'),
    ip_address:  str(formData, 'ip_address'),
    os_platform: str(formData, 'os_platform'),
    segment:     str(formData, 'segment'),
    exposure:    str(formData, 'exposure') || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Некорректные данные' };
  }

  const { name, type, criticality, description, ip_address, os_platform, segment, exposure } = parsed.data;

  if (role === 'admin' && !INFRA_TYPES.includes(type)) {
    return { error: 'Администратор может создавать только инфраструктурные объекты (сервер, рабочая станция, ноутбук, сетевое оборудование, АСУ ТП)' };
  }

  const { error } = await admin.from('objects').insert({
    organization_id: orgId,
    owner_id:        userId,
    name,
    type,
    description,
    criticality,
    ip_address,
    os_platform,
    segment,
    exposure,
    trust_score: INITIAL_SCORE[criticality] ?? 75,
    trust_level: INITIAL_LEVEL[criticality] ?? 'good',
  } as never);

  if (error) return { error: 'Не удалось создать объект. Попробуйте ещё раз.' };

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

  const parsed = UpdateObjectSchema.safeParse({
    name:        str(formData, 'name'),
    type:        str(formData, 'type') || null,
    criticality: str(formData, 'criticality') || null,
    description: str(formData, 'description'),
    ip_address:  str(formData, 'ip_address'),
    os_platform: str(formData, 'os_platform'),
    segment:     str(formData, 'segment'),
    exposure:    str(formData, 'exposure') || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Некорректные данные' };
  }

  const { error } = await admin
    .from('objects')
    .update({
      name:        parsed.data.name,
      type:        parsed.data.type,
      description: parsed.data.description,
      criticality: parsed.data.criticality ?? 'medium',
      ip_address:  parsed.data.ip_address,
      os_platform: parsed.data.os_platform,
      segment:     parsed.data.segment,
      exposure:    parsed.data.exposure,
    } as never)
    .eq('id', id)
    .eq('organization_id', orgId);

  if (error) return { error: 'Не удалось обновить объект. Попробуйте ещё раз.' };

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

  if (error) return { error: 'Не удалось удалить объект. Попробуйте ещё раз.' };

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

  if (error) return { error: 'Не удалось архивировать объект. Попробуйте ещё раз.' };

  revalidatePath('/objects');
  revalidatePath(`/objects/${id}`);
  return { success: true };
}
