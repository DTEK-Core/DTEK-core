'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { recalculateAllOrgObjects } from '@/lib/trust/engine';
import type { FactorWeights } from '@/lib/trust/calculate';

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

  // Server-side validation (mirror client-side checks)
  const vals = [
    weights.vuln_weight, weights.config_weight, weights.access_weight,
    weights.network_weight, weights.compliance_weight, weights.incident_weight,
  ];
  if (vals.some(v => !Number.isInteger(v) || v < 0 || v > 100)) {
    return { error: 'Каждый вес должен быть целым числом от 0 до 100' };
  }
  const sum = vals.reduce((a, b) => a + b, 0);
  if (sum !== 100) {
    return { error: `Сумма весов должна быть равна 100 (сейчас: ${sum})` };
  }

  // Upsert (handles both new orgs without a row and existing configs)
  const { error } = await admin
    .from('trust_factor_config')
    .upsert({
      organization_id:   orgId,
      vuln_weight:       weights.vuln_weight,
      config_weight:     weights.config_weight,
      access_weight:     weights.access_weight,
      network_weight:    weights.network_weight,
      compliance_weight: weights.compliance_weight,
      incident_weight:   weights.incident_weight,
    } as never, { onConflict: 'organization_id' });

  if (error) {
    return { error: 'Не удалось сохранить настройки. Попробуйте ещё раз.' };
  }

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
