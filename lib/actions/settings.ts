'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUserContext } from '@/lib/supabase/auth';
import { UpdateProfileSchema, UpdateOrgSchema } from '@/lib/validation/schemas';
import { createSecurityEvent } from '@/lib/security/audit';

export async function updateProfile(formData: FormData): Promise<{ error?: string }> {
  const context = await getCurrentUserContext();
  if (!context) redirect('/login');
  const supabase = await createClient();

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
    .eq('id', context.userId);

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
  const context = await getCurrentUserContext();
  if (!context) redirect('/login');
  const profileRaw = context.profile as { role: string; organization_id: string } | null;
  if (!profileRaw?.organization_id) redirect('/onboarding/create');

  if (profileRaw.role !== 'owner') {
    return { error: 'Только владелец организации может изменять её данные' };
  }

  const parsed = UpdateOrgSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Некорректные данные' };
  }

  const { error } = await createAdminClient()
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

  createSecurityEvent({
    organizationId: profileRaw.organization_id,
    actorId:        context.userId,
    actorEmail:     context.profile?.email ?? undefined,
    eventType:      'org.updated',
    targetType:     'organization',
    targetId:       profileRaw.organization_id,
    metadata:       {
      changedFields: Object.keys(parsed.data).filter(k =>
        parsed.data[k as keyof typeof parsed.data] !== undefined,
      ),
    },
  });

  revalidatePath('/settings');
  return {};
}
