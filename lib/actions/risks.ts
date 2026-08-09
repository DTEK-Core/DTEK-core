'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUserContext } from '@/lib/supabase/auth';
import { recalculateObjectTrust } from '@/lib/trust/engine';
import { preserveImportSourceDescription } from '@/lib/import/shared';
import {
  AddRiskCommentSchema,
  CreateRiskSchema,
  UpdateRiskSchema,
  UpdateRiskStatusSchema,
} from '@/lib/validation/schemas';

// ── Auth helper ────────────────────────────────────────────────────────────────

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

function num(fd: FormData, key: string): number | null {
  const v = (fd.get(key) as string | null)?.trim();
  if (!v) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function calculateDueDate(dateOnly: string | null | undefined, slaDays: number | null | undefined): string | null {
  if (dateOnly) return `${dateOnly}T23:59:59.999Z`;
  if (!slaDays) return null;

  const target = new Date();
  target.setUTCDate(target.getUTCDate() + slaDays);
  return `${target.toISOString().slice(0, 10)}T23:59:59.999Z`;
}

async function validateRiskOwner(
  ownerId: string | null | undefined,
  orgId: string,
  admin: ReturnType<typeof createAdminClient>,
): Promise<string | null> {
  if (!ownerId) return null;

  const { data, error } = await admin
    .from('profiles')
    .select('id')
    .eq('id', ownerId)
    .eq('organization_id', orgId)
    .eq('status', 'active')
    .maybeSingle();

  if (error || !data) {
    return 'Выберите активного участника текущей организации';
  }

  return null;
}

// ── Actions ────────────────────────────────────────────────────────────────────

export async function createRisk(formData: FormData) {
  const ctx = await getAuthCtx();
  if (!ctx) redirect('/login');

  const { userId, role, orgId, admin } = ctx;

  if (!['owner', 'analyst'].includes(role)) {
    return { error: 'Только владелец или аналитик может создавать риски' };
  }

  const cvssRaw = num(formData, 'cvss_score');
  const slaDaysNum = num(formData, 'sla_days');

  const parsed = CreateRiskSchema.safeParse({
    title:       str(formData, 'title'),
    description: str(formData, 'description'),
    category:    str(formData, 'category') ?? 'other',
    severity:    str(formData, 'severity') ?? 'medium',
    probability: str(formData, 'probability') || null,
    cvss_score:  cvssRaw,
    impact:      str(formData, 'impact'),
    sla_days:    slaDaysNum,
    due_date:    str(formData, 'due_date'),
    object_id:   str(formData, 'object_id') || null,
    owner_id:    str(formData, 'owner_id') || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Некорректные данные' };
  }

  const ownerError = await validateRiskOwner(parsed.data.owner_id, orgId, admin);
  if (ownerError) return { error: ownerError };

  const { sla_days, due_date: dueDateInput, object_id, ...riskFields } = parsed.data;
  const due_date = calculateDueDate(dueDateInput, sla_days);

  const { data: risk, error } = await admin
    .from('risks')
    .insert({
      organization_id: orgId,
      author_id:       userId,
      ...riskFields,
      sla_days,
      due_date,
    } as never)
    .select('id')
    .single();

  if (error) return { error: 'Не удалось создать риск. Попробуйте ещё раз.' };

  if (object_id && risk) {
    await admin.from('object_risks').insert({
      risk_id:   (risk as { id: string }).id,
      object_id,
      linked_by: userId,
    } as never);
    try { await recalculateObjectTrust(object_id, orgId); } catch { /* non-blocking */ }
    revalidatePath(`/objects/${object_id}`);
    revalidatePath(`/objects/${object_id}/passport`);
  }

  revalidatePath('/risks');
  return { success: true };
}

export async function updateRisk(id: string, formData: FormData) {
  const ctx = await getAuthCtx();
  if (!ctx) redirect('/login');

  const { role, orgId, admin } = ctx;

  if (!['owner', 'analyst'].includes(role)) {
    return { error: 'Недостаточно прав' };
  }

  const parsed = UpdateRiskSchema.safeParse({
    title:       str(formData, 'title'),
    description: str(formData, 'description'),
    category:    str(formData, 'category') || null,
    severity:    str(formData, 'severity') || null,
    probability: str(formData, 'probability') || null,
    cvss_score:  num(formData, 'cvss_score'),
    impact:      str(formData, 'impact'),
    owner_id:    str(formData, 'owner_id') || null,
    sla_days:    num(formData, 'sla_days'),
    due_date:    str(formData, 'due_date'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Некорректные данные' };
  }

  const { data: currentRiskRaw, error: currentRiskError } = await admin
    .from('risks')
    .select('owner_id, description')
    .eq('id', id)
    .eq('organization_id', orgId)
    .maybeSingle();
  const currentRisk = currentRiskRaw as {
    owner_id: string | null;
    description: string | null;
  } | null;

  if (currentRiskError || !currentRisk) return { error: 'Риск не найден' };

  if (parsed.data.owner_id !== currentRisk.owner_id) {
    const ownerError = await validateRiskOwner(parsed.data.owner_id, orgId, admin);
    if (ownerError) return { error: ownerError };
  }

  const { due_date: dueDateInput, sla_days, ...riskFields } = parsed.data;
  const { error } = await admin
    .from('risks')
    .update({
      ...riskFields,
      description: preserveImportSourceDescription(
        riskFields.description ?? null,
        currentRisk.description,
      ),
      sla_days,
      due_date: calculateDueDate(dueDateInput, sla_days),
    } as never)
    .eq('id', id)
    .eq('organization_id', orgId);

  if (error) return { error: 'Не удалось обновить риск. Попробуйте ещё раз.' };

  const { data: links } = await admin
    .from('object_risks')
    .select('object_id')
    .eq('risk_id', id);
  for (const link of (links ?? []) as { object_id: string }[]) {
    try { await recalculateObjectTrust(link.object_id, orgId); } catch { /* non-blocking */ }
    revalidatePath(`/objects/${link.object_id}`);
    revalidatePath(`/objects/${link.object_id}/passport`);
  }

  revalidatePath('/risks');
  return { success: true };
}

export async function deleteRisk(id: string) {
  const ctx = await getAuthCtx();
  if (!ctx) redirect('/login');

  const { role, orgId, admin } = ctx;

  if (!['owner', 'analyst'].includes(role)) {
    return { error: 'Только владелец или аналитик может удалять риски' };
  }

  const { data: links } = await admin
    .from('object_risks')
    .select('object_id')
    .eq('risk_id', id);
  const affectedObjects = (links ?? []) as { object_id: string }[];

  const { error } = await admin
    .from('risks')
    .delete()
    .eq('id', id)
    .eq('organization_id', orgId);

  if (error) return { error: 'Не удалось удалить риск. Попробуйте ещё раз.' };

  for (const link of affectedObjects) {
    try { await recalculateObjectTrust(link.object_id, orgId); } catch { /* non-blocking */ }
    revalidatePath(`/objects/${link.object_id}`);
    revalidatePath(`/objects/${link.object_id}/passport`);
  }

  revalidatePath('/risks');
  return { success: true };
}

export async function addRiskComment(riskId: string, body: string) {
  let ctx: AuthCtx | null;
  try {
    ctx = await getAuthCtx();
  } catch {
    return { error: 'Не удалось проверить доступ. Попробуйте ещё раз.' };
  }

  if (!ctx) redirect('/login');

  const { userId, role, orgId, admin } = ctx;
  if (!['owner', 'analyst'].includes(role)) {
    return { error: 'Только владелец или аналитик может добавлять комментарии' };
  }

  const parsed = AddRiskCommentSchema.safeParse({ risk_id: riskId, body });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Некорректный комментарий' };
  }

  try {
    const { data: risk, error: riskError } = await admin
      .from('risks')
      .select('id')
      .eq('id', parsed.data.risk_id)
      .eq('organization_id', orgId)
      .maybeSingle();
    if (riskError || !risk) return { error: 'Риск не найден' };

    const { data: commentRaw, error: commentError } = await admin
      .from('risk_comments')
      .insert({
        organization_id: orgId,
        risk_id: parsed.data.risk_id,
        author_id: userId,
        body: parsed.data.body,
      } as never)
      .select('id')
      .single();
    const comment = commentRaw as { id: string } | null;

    if (commentError || !comment) {
      return { error: 'Не удалось добавить комментарий. Попробуйте ещё раз.' };
    }

    const { error: activityError } = await admin.from('risk_activity').insert({
      organization_id: orgId,
      risk_id: parsed.data.risk_id,
      actor_id: userId,
      event_type: 'comment_added',
      metadata: {},
    } as never);

    if (activityError) {
      await admin.from('risk_comments').delete().eq('id', comment.id);
      return { error: 'Не удалось зафиксировать комментарий. Попробуйте ещё раз.' };
    }

    revalidatePath('/risks');
    return { success: true };
  } catch {
    return { error: 'Не удалось добавить комментарий. Попробуйте ещё раз.' };
  }
}

export async function updateRiskStatus(id: string, status: string) {
  const ctx = await getAuthCtx();
  if (!ctx) redirect('/login');

  const { role, orgId, admin } = ctx;

  if (!['owner', 'analyst'].includes(role)) {
    return { error: 'Недостаточно прав' };
  }

  const parsedStatus = UpdateRiskStatusSchema.safeParse({ status });
  if (!parsedStatus.success) {
    return { error: parsedStatus.error.issues[0]?.message ?? 'Недопустимый статус' };
  }

  const validStatus = parsedStatus.data.status;
  const updates: Record<string, unknown> = { status: validStatus };
  if (validStatus === 'mitigated' || validStatus === 'closed') {
    updates.resolved_at = new Date().toISOString();
  }

  const { error } = await admin
    .from('risks')
    .update(updates as never)
    .eq('id', id)
    .eq('organization_id', orgId);

  if (error) return { error: 'Не удалось обновить статус риска. Попробуйте ещё раз.' };

  const { data: links } = await admin
    .from('object_risks')
    .select('object_id')
    .eq('risk_id', id);
  for (const link of (links ?? []) as { object_id: string }[]) {
    try { await recalculateObjectTrust(link.object_id, orgId); } catch { /* non-blocking */ }
    revalidatePath(`/objects/${link.object_id}`);
    revalidatePath(`/objects/${link.object_id}/passport`);
  }

  revalidatePath('/risks');
  return { success: true };
}

export async function linkRiskToObject(riskId: string, objectId: string) {
  const ctx = await getAuthCtx();
  if (!ctx) redirect('/login');

  const { userId, role, orgId, admin } = ctx;

  if (!['owner', 'analyst'].includes(role)) {
    return { error: 'Недостаточно прав' };
  }

  const { data: risk } = await admin
    .from('risks')
    .select('id')
    .eq('id', riskId)
    .eq('organization_id', orgId)
    .single();

  if (!risk) return { error: 'Риск не найден' };

  const { data: obj } = await admin
    .from('objects')
    .select('id')
    .eq('id', objectId)
    .eq('organization_id', orgId)
    .single();

  if (!obj) return { error: 'Объект не найден' };

  const { error } = await admin
    .from('object_risks')
    .insert({
      risk_id:   riskId,
      object_id: objectId,
      linked_by: userId,
    } as never);

  if (error && !error.code?.includes('23505')) {
    return { error: 'Не удалось привязать риск к объекту. Попробуйте ещё раз.' };
  }

  try { await recalculateObjectTrust(objectId, orgId); } catch { /* non-blocking */ }
  revalidatePath(`/objects/${objectId}`);
  revalidatePath(`/objects/${objectId}/passport`);
  revalidatePath('/risks');
  return { success: true };
}
