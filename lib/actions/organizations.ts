'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { CreateOrgSchema } from '@/lib/validation/schemas';

export async function createOrganization(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

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
      owner_id: user.id,
    } as never)
    .select('id')
    .single();

  if (orgError) return { error: 'Не удалось создать организацию. Попробуйте ещё раз.' };

  const org = orgRaw as unknown as { id: string } | null;
  if (!org?.id) return { error: 'Не удалось создать организацию' };

  const { error: profileError } = await admin
    .from('profiles')
    .update({ organization_id: org.id, role: 'owner' } as never)
    .eq('id', user.id);

  if (profileError) return { error: 'Не удалось назначить роль владельца. Попробуйте ещё раз.' };

  await admin
    .from('trust_factor_config')
    .insert({ organization_id: org.id } as never);

  redirect('/onboarding/wizard');
}
