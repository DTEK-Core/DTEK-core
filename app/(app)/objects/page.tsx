import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserContext } from '@/lib/supabase/auth';
import { ObjectsListClient } from '@/components/shared/objects/objects-list-client';
import type { ObjItem } from '@/components/shared/objects/objects-list-client';
import '@/app/objects.css';

export const metadata: Metadata = {
  title: 'Объекты — DTEK Core',
};

interface Profile {
  id: string;
  role: string | null;
  organization_id: string | null;
}

interface TrustPassportRaw {
  risk_count: number | null;
  open_risk_count: number | null;
  connection_count: number | null;
}

interface ObjectRaw {
  id: string;
  name: string;
  type: string;
  criticality: string;
  status: string;
  trust_score: number;
  trust_level: string;
  ip_address: string | null;
  os_platform: string | null;
  segment: string | null;
  exposure: string | null;
  updated_at: string;
  trust_passports: TrustPassportRaw | TrustPassportRaw[] | null;
}

export default async function ObjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ import?: string }>;
}) {
  const query = await searchParams;
  const context = await getCurrentUserContext();
  if (!context) redirect('/login');
  const profile = context.profile as Profile | null;
  if (!profile?.organization_id) redirect('/onboarding/create');

  const supabase = await createClient();

  const { data: objectsRaw } = await supabase
    .from('objects')
    .select(`
      id, name, type, criticality, status, trust_score, trust_level,
      ip_address, os_platform, segment, exposure, updated_at,
      trust_passports(risk_count, open_risk_count, connection_count)
    `)
    .neq('status', 'archived')
    .order('trust_score', { ascending: true });

  const rawList = (objectsRaw as unknown as ObjectRaw[] | null) ?? [];

  const objects: ObjItem[] = rawList.map(o => {
    const tp = Array.isArray(o.trust_passports) ? (o.trust_passports[0] ?? null) : o.trust_passports;
    return {
      id: o.id,
      name: o.name,
      type: o.type,
      criticality: o.criticality,
      status: o.status,
      trust_score: o.trust_score,
      trust_level: o.trust_level,
      ip_address: o.ip_address,
      os_platform: o.os_platform,
      segment: o.segment,
      exposure: o.exposure,
      updated_at: o.updated_at,
      trust_passports: tp ? {
        risk_count: tp.risk_count,
        open_risk_count: tp.open_risk_count,
        connection_count: tp.connection_count,
      } : null,
    };
  });

  return (
    <ObjectsListClient
      objects={objects}
      userRole={profile.role ?? 'viewer'}
      totalInOrg={objects.length}
      initialImportOpen={query.import === '1'}
    />
  );
}
