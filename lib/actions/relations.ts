'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { CreateRelationSchema } from '@/lib/validation/schemas';

async function getAuthCtx() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from('profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single() as unknown as { data: { role: string; organization_id: string } | null };

  if (!data?.organization_id) return null;
  return {
    orgId: data.organization_id,
    role:  data.role,
  };
}

export async function createRelation(
  sourceObjectId: string,
  targetObjectId: string,
  relationType: string,
): Promise<{ error?: string }> {
  const ctx = await getAuthCtx();
  if (!ctx) redirect('/login');

  if (!['owner', 'analyst'].includes(ctx.role)) {
    return { error: 'Недостаточно прав для создания связи' };
  }

  const parsed = CreateRelationSchema.safeParse({ sourceObjectId, targetObjectId, relationType });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Некорректные данные' };
  }

  if (parsed.data.sourceObjectId === parsed.data.targetObjectId) {
    return { error: 'Объект не может ссылаться на самого себя' };
  }

  const admin = createAdminClient();

  // Verify both objects belong to org
  const { count } = await admin
    .from('objects')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', ctx.orgId)
    .in('id', [parsed.data.sourceObjectId, parsed.data.targetObjectId]);

  if (count !== 2) {
    return { error: 'Один или оба объекта не найдены в организации' };
  }

  const { error } = await admin.from('relations').insert({
    organization_id:  ctx.orgId,
    source_object_id: parsed.data.sourceObjectId,
    target_object_id: parsed.data.targetObjectId,
    relation_type:    parsed.data.relationType,
  } as never);

  if (error) {
    if (error.code === '23505') {
      return { error: 'Такая связь уже существует между этими объектами' };
    }
    return { error: 'Не удалось создать связь. Попробуйте ещё раз.' };
  }

  revalidatePath('/graph');
  return {};
}

export async function deleteRelation(
  relationId: string,
): Promise<{ error?: string }> {
  const ctx = await getAuthCtx();
  if (!ctx) redirect('/login');

  if (!['owner', 'analyst'].includes(ctx.role)) {
    return { error: 'Недостаточно прав для удаления связи' };
  }

  const admin = createAdminClient();

  // Verify relation belongs to org
  const { data: existing } = await admin
    .from('relations')
    .select('id')
    .eq('id', relationId)
    .eq('organization_id', ctx.orgId)
    .single();

  if (!existing) {
    return { error: 'Связь не найдена или не принадлежит вашей организации' };
  }

  const { error } = await admin
    .from('relations')
    .delete()
    .eq('id', relationId);

  if (error) {
    return { error: 'Не удалось удалить связь. Попробуйте ещё раз.' };
  }

  revalidatePath('/graph');
  return {};
}
