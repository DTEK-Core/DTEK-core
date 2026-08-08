import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

export interface CurrentProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  organization_id: string | null;
}

export interface CurrentUserContext {
  userId: string;
  profile: CurrentProfile | null;
}

/**
 * React cache is scoped to the current server render. It lets the app layout
 * and the requested page share one verified identity/profile lookup.
 */
export const getCurrentUserContext = cache(async (): Promise<CurrentUserContext | null> => {
  const supabase = await createClient();
  const { data: claimData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError) throw claimsError;

  const userId = typeof claimData?.claims.sub === 'string' ? claimData.claims.sub : null;
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, organization_id')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;

  return {
    userId,
    profile: data as unknown as CurrentProfile | null,
  };
});
