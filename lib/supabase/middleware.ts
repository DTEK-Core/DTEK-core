import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/database';
import {
  getSupabaseAnonKey,
  getSupabaseClientOptions,
  getSupabaseUrl,
} from '@/lib/supabase/config';

export type MembershipAccessStatus = 'active' | 'blocked' | 'invited' | 'missing';

interface AccessContextRow {
  organization_id: string | null;
  status: string;
}

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
  let accessStatus: MembershipAccessStatus = 'missing';
  if (userId) {
    const { data, error } = await supabase
      .rpc('get_current_access_context' as never)
      .maybeSingle();
    if (error) throw error;

    const access = data as unknown as AccessContextRow | null;
    if (access?.status === 'active' || access?.status === 'blocked' || access?.status === 'invited') {
      accessStatus = access.status;
    }

    if (accessStatus === 'active') {
      organizationId = access?.organization_id ?? null;
    } else if (accessStatus === 'blocked') {
      await supabase.auth.signOut({ scope: 'local' });
    }
  }

  return { supabaseResponse, userId, organizationId, accessStatus };
}
