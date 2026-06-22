'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { UpdateProfileSchema, UpdateOrgSchema } from '@/lib/validation/schemas';

export async function updateProfile(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const parsed = UpdateProfileSchema.safeParse({
    full_name: (formData.get('full_name') as string | null)?.trim(),
    team:      (formData.get('team') as string | null)?.trim() || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Некорректные данные' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: parsed.data.full_name, team: parsed.data.team } as never)
    .eq('id', user.id);

  if (error) return { error: 'Не удалось обновить профиль. Попробуйте ещё раз.' };

  revalidatePath('/settings');
  revalidatePath('/');
  return {};
}

// orgId is NOT accepted from the client — derived server-side from authenticated profile.
// Explicit RBAC: only owner can edit organization data.
export async function updateOrganization(
  data: {
    name: string;
    inn: string | null;
    industry: string | null;
    region: string | null;
    size: string | null;
  },
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();
  const { data: profileRaw } = await admin
    .from('profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single() as unknown as { data: { role: string; organization_id: string } | null };

  if (!profileRaw?.organization_id) redirect('/onboarding/create');

  if (profileRaw.role !== 'owner') {
    return { error: 'Только владелец организации может изменять её данные' };
  }

  const parsed = UpdateOrgSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Некорректные данные' };
  }

  const { error } = await admin
    .from('organizations')
    .update({
      name:     parsed.data.name,
      inn:      parsed.data.inn ?? null,
      industry: parsed.data.industry ?? null,
      region:   parsed.data.region ?? null,
      size:     parsed.data.size ?? null,
    } as never)
    .eq('id', profileRaw.organization_id);

  if (error) return { error: 'Не удалось обновить данные организации. Попробуйте ещё раз.' };

  revalidatePath('/settings');
  return {};
}
