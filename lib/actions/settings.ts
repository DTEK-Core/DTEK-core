'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateProfile(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Не авторизован' };

  const fullName = (formData.get('full_name') as string | null)?.trim();
  const team = (formData.get('team') as string | null)?.trim() ?? null;

  if (!fullName) return { error: 'Имя не может быть пустым' };

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, team } as never)
    .eq('id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/settings');
  revalidatePath('/');
  return {};
}

interface OrgData {
  name: string;
  inn: string | null;
  industry: string | null;
  region: string | null;
  size: string | null;
}

export async function updateOrganization(
  orgId: string,
  data: OrgData,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Не авторизован' };

  if (!data.name?.trim()) return { error: 'Наименование не может быть пустым' };

  const { error } = await supabase
    .from('organizations')
    .update({
      name: data.name.trim(),
      inn: data.inn?.trim() || null,
      industry: data.industry || null,
      region: data.region?.trim() || null,
      size: data.size || null,
    } as never)
    .eq('id', orgId);

  if (error) return { error: error.message };

  revalidatePath('/settings');
  return {};
}
