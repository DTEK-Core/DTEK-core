import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import {
  getSupabaseAnonKey,
  getSupabaseClientOptions,
  getSupabaseUrl,
} from '@/lib/supabase/config';

export function createClient() {
  return createBrowserClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    getSupabaseClientOptions(),
  );
}
