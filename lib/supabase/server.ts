import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';
import {
  getSupabaseAnonKey,
  getSupabaseClientOptions,
  getSupabaseUrl,
} from '@/lib/supabase/config';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      ...getSupabaseClientOptions(),
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll called from Server Component — cookies are read-only.
            // Middleware handles session refresh in this case.
          }
        },
      },
    },
  );
}
