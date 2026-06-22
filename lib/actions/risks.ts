'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { recalculateObjectTrust } from '@/lib/trust/engine';

// ── Auth helper ────────────────────────────────────────────────────────────────

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

function num(fd: FormData, key: string): number | null {
  const v = (fd.get(key) as string | null)?.trim();
  if (!v) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

// ── Actions ────────────────────────────────────────────────────────────────────

export async function createRisk(formData: FormData) {
  const ctx = await getAuthCtx();
  if (!ctx) redirect('/login');

  const { userId, role, orgId, admin } = ctx;

  if (!['owner', 'analyst'].includes(role)) {
    return { error: 'Только владелец или аналитик может создавать риски' };
  }

  const title = str(formData, 'title');
  if (!title) return { error: 'Введите название риска' };

  const slaDaysRaw = str(formData, 'sla_days');
  const slaDays = slaDaysRaw ? parseInt(slaDaysRaw, 10) : null;
  const due_date = slaDays
    ? new Date(Date.now() + slaDays * 86400000).toISOString()
    : null;

  const { data: risk, error } = await admin
    .from('risks')
    .insert({
      organization_id: orgId,
      author_id:       userId,
      title,
      description: str(formData, 'description'),
      category:    str(formData, 'category') ?? 'other',
      severity:    str(formData, 'severity') ?? 'medium',
      probability: str(formData, 'probability'),
      cvss_score:  num(formData, 'cvss_score'),
      impact:      str(formData, 'impact'),
      sla_days:    slaDays,
      due_date,
    } as never)
    .select('id')
    .single();

  if (error) return { error: error.message };

  const objectId = str(formData, 'object_id');
  if (objectId && risk) {
    await admin.from('object_risks').insert({
      risk_id:   (risk as { id: string }).id,
      object_id: objectId,
      linked_by: userId,
    } as never);
    try { await recalculateObjectTrust(objectId, orgId); } catch { /* non-blocking */ }
    revalidatePath(`/objects/${objectId}`);
    revalidatePath(`/objects/${objectId}/passport`);
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

  const title = str(formData, 'title');
  if (!title) return { error: 'Введите название риска' };

  const { error } = await admin
    .from('risks')
    .update({
      title,
      description: str(formData, 'description'),
      category:    str(formData, 'category'),
      severity:    str(formData, 'severity'),
      probability: str(formData, 'probability'),
      cvss_score:  num(formData, 'cvss_score'),
      impact:      str(formData, 'impact'),
    } as never)
    .eq('id', id)
    .eq('organization_id', orgId);

  if (error) return { error: error.message };

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

  // Collect affected objects before delete (FK cascade removes object_risks)
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

  if (error) return { error: error.message };

  for (const link of affectedObjects) {
    try { await recalculateObjectTrust(link.object_id, orgId); } catch { /* non-blocking */ }
    revalidatePath(`/objects/${link.object_id}`);
    revalidatePath(`/objects/${link.object_id}/passport`);
  }

  revalidatePath('/risks');
  return { success: true };
}

export async function updateRiskStatus(id: string, status: string) {
  const ctx = await getAuthCtx();
  if (!ctx) redirect('/login');

  const { orgId, admin } = ctx;

  const updates: Record<string, unknown> = { status };
  if (status === 'mitigated' || status === 'closed') {
    updates.resolved_at = new Date().toISOString();
  }

  const { error } = await admin
    .from('risks')
    .update(updates as never)
    .eq('id', id)
    .eq('organization_id', orgId);

  if (error) return { error: error.message };

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

  if (!['owner', 'analyst', 'admin'].includes(role)) {
    return { error: 'Недостаточно прав' };
  }

  // Verify risk belongs to org
  const { data: risk } = await admin
    .from('risks')
    .select('id')
    .eq('id', riskId)
    .eq('organization_id', orgId)
    .single();

  if (!risk) return { error: 'Риск не найден' };

  // Verify object belongs to org
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

  // Treat duplicate key as success
  if (error && !error.code?.includes('23505')) return { error: error.message };

  try { await recalculateObjectTrust(objectId, orgId); } catch { /* non-blocking */ }
  revalidatePath(`/objects/${objectId}`);
  revalidatePath(`/objects/${objectId}/passport`);
  revalidatePath('/risks');
  return { success: true };
}
