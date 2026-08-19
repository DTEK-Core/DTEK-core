'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserContext } from '@/lib/supabase/auth';

export interface OnboardingWeights {
  vuln: number;
  config: number;
  access: number;
  network: number;
  compliance: number;
  incident: number;
}

export interface OnboardingData {
  orgId: string;
  description: string;
  contactEmail: string;
  website: string;
  objectTypes: string[];
  weights: OnboardingWeights;
}

export async function completeOnboarding(data: OnboardingData) {
  const context = await getCurrentUserContext();
  if (!context) redirect('/login');
  const supabase = await createClient();

  // Update trust factor config weights
  const weightsResult = supabase
    .from('trust_factor_config')
    .update({
      vuln_weight: data.weights.vuln,
      config_weight: data.weights.config,
      access_weight: data.weights.access,
      network_weight: data.weights.network,
      compliance_weight: data.weights.compliance,
      incident_weight: data.weights.incident,
    } as never)
    .eq('organization_id', data.orgId);

  const weightsResponse = await weightsResult;
  if (weightsResponse.error) {
    return { error: 'Не удалось завершить настройку. Попробуйте ещё раз.' };
  }

  redirect('/dashboard');
}
