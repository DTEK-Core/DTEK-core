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

  const { data: claimData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError) throw claimsError;

  const userId = typeof claimData?.claims.sub === 'string' ? claimData.claims.sub : null;

  let organizationId: string | null = null;
  if (userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();
    if (error) throw error;
    organizationId =
      (data as unknown as { organization_id: string | null } | null)?.organization_id ?? null;
  }

  return { supabaseResponse, userId, organizationId };
}
