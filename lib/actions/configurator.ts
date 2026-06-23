'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { recalculateAllOrgObjects } from '@/lib/trust/engine';
import type { FactorWeights } from '@/lib/trust/calculate';
import { FactorWeightsSchema } from '@/lib/validation/schemas';
import { createSecurityEvent } from '@/lib/security/audit';

export async function saveFactorWeights(
  weights: FactorWeights,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();
  const { data } = await admin
    .from('profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single() as unknown as { data: { role: string; organization_id: string } | null };

  if (!data?.organization_id) redirect('/onboarding/create');
  if (!['owner', 'analyst'].includes(data.role)) {
    return { error: 'Недостаточно прав для изменения весов' };
  }

  const orgId = data.organization_id;

  // Fetch current weights for audit before/after metadata
  const { data: oldConfigRaw } = await admin
    .from('trust_factor_config')
    .select('vuln_weight, config_weight, access_weight, network_weight, compliance_weight, incident_weight')
    .eq('organization_id', orgId)
    .single() as unknown as { data: Record<string, number> | null };

  const parsed = FactorWeightsSchema.safeParse(weights);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Некорректные данные весов' };
  }

  const w = parsed.data;

  const { error } = await admin
    .from('trust_factor_config')
    .upsert({
      organization_id:   orgId,
      vuln_weight:       w.vuln_weight,
      config_weight:     w.config_weight,
      access_weight:     w.access_weight,
      network_weight:    w.network_weight,
      compliance_weight: w.compliance_weight,
      incident_weight:   w.incident_weight,
    } as never, { onConflict: 'organization_id' });

  if (error) {
    return { error: 'Не удалось сохранить настройки. Попробуйте ещё раз.' };
  }

  createSecurityEvent({
    organizationId: orgId,
    actorId:        user.id,
    actorEmail:     user.email ?? undefined,
    eventType:      'config.weights_changed',
    targetType:     'config',
    metadata:       { before: oldConfigRaw ?? null, after: w },
  });

  // Non-blocking recalculation of all org objects
  try {
    await recalculateAllOrgObjects(orgId, {
      reason:    'recalculated',
      changedBy: `user:${user.id}`,
    });
  } catch {
    // Weights saved; recalc failed silently — scores will update on next trigger
  }

  revalidatePath('/configurator');
  revalidatePath('/dashboard');
  revalidatePath('/objects');
  return {};
}
