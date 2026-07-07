// Server-only service role client — bypasses RLS.
// Never import this in client components or expose to the browser.
import { createClient } from '@supabase/supabase-js';
import {
  getSupabaseClientOptions,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from '@/lib/supabase/config';

export function createServiceClient() {
  return createClient(
    getSupabaseUrl(),
    getSupabaseServiceRoleKey(),
    {
      ...getSupabaseClientOptions(),
      auth: { persistSession: false },
    },
  );
}
