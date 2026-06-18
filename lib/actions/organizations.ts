'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function createOrganization(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const name = (formData.get('name') as string).trim();
  const short_name = (formData.get('short_name') as string).trim();
  const industry = formData.get('industry') as string;
  const size = formData.get('size') as string;
  const inn = ((formData.get('inn') as string) ?? '').trim() || null;
  const region = ((formData.get('region') as string) ?? '').trim() || null;

  if (!name || !short_name || !industry || !size) {
    return { error: 'Заполните все обязательные поля' };
  }

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

  if (orgError) return { error: orgError.message };

  const org = orgRaw as unknown as { id: string } | null;
  if (!org?.id) return { error: 'Не удалось создать организацию' };

  const { error: profileError } = await admin
    .from('profiles')
    .update({ organization_id: org.id, role: 'owner' } as never)
    .eq('id', user.id);

  if (profileError) return { error: profileError.message };

  await admin
    .from('trust_factor_config')
    .insert({ organization_id: org.id } as never);

  redirect('/onboarding/wizard');
}
