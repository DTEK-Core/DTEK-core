'use server';

import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUserContext } from '@/lib/supabase/auth';
import { CreateOrgSchema } from '@/lib/validation/schemas';

export async function createOrganization(formData: FormData) {
  const context = await getCurrentUserContext();
  if (!context) redirect('/login');

  const parsed = CreateOrgSchema.safeParse({
    name:       (formData.get('name') as string | null)?.trim(),
    short_name: (formData.get('short_name') as string | null)?.trim(),
    industry:   (formData.get('industry') as string | null)?.trim() || null,
    size:       formData.get('size') as string | null,
    inn:        ((formData.get('inn') as string | null) ?? '').trim() || null,
    region:     ((formData.get('region') as string | null) ?? '').trim() || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Заполните все обязательные поля' };
  }

  const { name, short_name, industry, size, inn, region } = parsed.data;

  // Admin client bypasses RLS — safe, Server Action runs server-side only.
  // auth.uid() is not reliably set in PostgREST context after signUp redirect.
  const admin = createAdminClient();

  const { data: orgRaw, error: orgError } = await admin
    .from('organizations')
    .insert({
      name,
      short_name,
      industry,
      size,
      inn,
      region,
      owner_id: context.userId,
    } as never)
    .select('id')
    .single();

  if (orgError) return { error: 'Не удалось создать организацию. Попробуйте ещё раз.' };

  const org = orgRaw as unknown as { id: string } | null;
  if (!org?.id) return { error: 'Не удалось создать организацию' };

  const [profileResult, configResult] = await Promise.all([
    admin
      .from('profiles')
      .update({ organization_id: org.id, role: 'owner' } as never)
      .eq('id', context.userId),
    admin
      .from('trust_factor_config')
      .insert({ organization_id: org.id } as never),
  ]);

  if (profileResult.error) {
    return { error: 'Не удалось назначить роль владельца. Попробуйте ещё раз.' };
  }
  if (configResult.error) {
    return { error: 'Не удалось создать конфигурацию Trust Score. Попробуйте ещё раз.' };
  }

  redirect('/onboarding/wizard');
}
