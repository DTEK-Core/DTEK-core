import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import {
  getSupabaseClientOptions,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from '@/lib/supabase/config';

// Server-side only. Bypasses RLS — use ONLY in Server Actions for trusted operations.
// Never import from client components.
export function createAdminClient() {
  return createClient<Database>(
    getSupabaseUrl(),
    getSupabaseServiceRoleKey(),
    getSupabaseClientOptions(),
  );
}
