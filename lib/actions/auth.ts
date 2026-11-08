'use server';

import { createClient } from '@/lib/supabase/server';
import {
  getSupabaseUnavailableMessage,
  isSupabaseConnectionError,
} from '@/lib/supabase/config';
import { redirect } from 'next/navigation';

type ActionResult = {
  error?: string;
  success?: boolean;
};

const ACCOUNT_ACCESS_DENIED_MESSAGE =
  'Доступ к аккаунту приостановлен. Обратитесь к администратору организации.';

interface AccessContextRow {
  status: string;
}

function authError(error: unknown): ActionResult {
  if (isSupabaseConnectionError(error)) {
    return { error: getSupabaseUnavailableMessage() };
  }

  if (error instanceof Error) return { error: error.message };
  return { error: 'Произошла ошибка. Попробуйте ещё раз.' };
}

export async function register(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const firstName = (formData.get('first_name') as string).trim();
    const lastName = (formData.get('last_name') as string).trim();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`.trim(),
        },
      },
    });

    if (error) return { error: error.message };
  } catch (error) {
    return authError(error);
  }

  redirect('/onboarding');
}

export async function login(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });

    if (error) return { error: error.message };

    const { data: accessRaw, error: accessError } = await supabase
      .rpc('get_current_access_context' as never)
      .maybeSingle();

    if (accessError) {
      await supabase.auth.signOut({ scope: 'local' });
      return authError(accessError);
    }

    const access = accessRaw as unknown as AccessContextRow | null;
    if (access?.status !== 'active') {
      await supabase.auth.signOut({ scope: 'global' });
      return { error: ACCOUNT_ACCESS_DENIED_MESSAGE };
    }
  } catch (error) {
    return authError(error);
  }

  redirect('/dashboard');
}

export async function logout() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (error) {
    if (!isSupabaseConnectionError(error)) throw error;
  }

  redirect('/login');
}

export async function forgotPassword(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(
      formData.get('email') as string,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      },
    );

    if (error) return { error: error.message };
  } catch (error) {
    return authError(error);
  }

  return { success: true };
}

export async function updatePassword(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const { data: accessRaw, error: accessError } = await supabase
      .rpc('get_current_access_context' as never)
      .maybeSingle();

    if (accessError) return authError(accessError);

    const access = accessRaw as unknown as AccessContextRow | null;
    if (access?.status !== 'active') {
      await supabase.auth.signOut({ scope: 'local' });
      return { error: ACCOUNT_ACCESS_DENIED_MESSAGE };
    }

    const { error } = await supabase.auth.updateUser({
      password: formData.get('password') as string,
    });

    if (error) return { error: error.message };
  } catch (error) {
    return authError(error);
  }

  redirect('/dashboard');
}
