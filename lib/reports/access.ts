import { notFound, redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const REPORT_FORBIDDEN = 'REPORT_FORBIDDEN';

export const REPORT_ACCESS_ROLES = {
  passport:  ['owner', 'analyst', 'admin', 'viewer'],
  riskCsv:   ['owner', 'analyst'],
  executive: ['owner', 'analyst'],
} as const;

export type ReportKind = keyof typeof REPORT_ACCESS_ROLES;

interface ProfileRaw {
  role: string;
  organization_id: string | null;
}

export interface ReportAccessContext {
  admin: ReturnType<typeof createAdminClient>;
  user: User;
  orgId: string;
  role: string;
}

export class ReportForbiddenError extends Error {
  constructor(report: ReportKind) {
    super(REPORT_FORBIDDEN);
    this.name = 'ReportForbiddenError';
    this.cause = report;
  }
}

export function hasReportAccess(role: string | null | undefined, report: ReportKind): boolean {
  if (!role) return false;
  return (REPORT_ACCESS_ROLES[report] as readonly string[]).includes(role);
}

export function assertReportAccess(
  role: string,
  report: ReportKind,
  onDenied: 'throw' | 'notFound' = 'throw',
): void {
  if (hasReportAccess(role, report)) return;
  if (onDenied === 'notFound') notFound();
  throw new ReportForbiddenError(report);
}

export async function getReportAccessContext(
  report: ReportKind,
  options: { onDenied?: 'throw' | 'notFound' } = {},
): Promise<ReportAccessContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const admin = createAdminClient();

  const { data: profileRaw } = await admin
    .from('profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single();

  const profile = profileRaw as unknown as ProfileRaw | null;
  if (!profile?.organization_id) redirect('/onboarding/create');

  assertReportAccess(profile.role, report, options.onDenied);

  return {
    admin,
    user,
    orgId: profile.organization_id,
    role: profile.role,
  };
}
