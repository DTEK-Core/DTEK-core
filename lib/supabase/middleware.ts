import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/database';
import {
  getSupabaseAnonKey,
  getSupabaseClientOptions,
  getSupabaseUrl,
} from '@/lib/supabase/config';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      ...getSupabaseClientOptions(),
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let organizationId: string | null = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();
    organizationId =
      (data as unknown as { organization_id: string | null } | null)?.organization_id ?? null;
  }

  return { supabaseResponse, user, organizationId };
}
