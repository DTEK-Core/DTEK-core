'use server';

import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
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

  const supabase = await createClient();
  const { data: organizationId, error } = await supabase.rpc(
    'create_organization_atomic' as never,
    {
      p_name: parsed.data.name,
      p_short_name: parsed.data.short_name,
      p_industry: parsed.data.industry ?? null,
      p_size: parsed.data.size,
      p_inn: parsed.data.inn ?? null,
      p_region: parsed.data.region ?? null,
    } as never,
  );

  if (error || typeof organizationId !== 'string') {
    return { error: 'Не удалось создать организацию. Попробуйте ещё раз.' };
  }

  redirect('/onboarding/wizard');
}
