import type { Metadata } from 'next';
import { TrustPassportClient } from '@/components/shared/objects/trust-passport-client';
import { getPassportReportData } from '@/lib/reports/passport-report';
import '@/app/objects.css';
import '@/app/passport.css';

export const metadata: Metadata = { title: 'Паспорт доверия — DTEK Core' };

export default async function PassportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getPassportReportData(id);

  return (
    <TrustPassportClient
      object={report.object}
      passport={report.passport}
      risks={report.risks}
      orgName={report.orgName}
      canRecalculate={['owner', 'analyst', 'admin'].includes(report.role)}
      delta30={report.delta30}
      factors={report.factors}
      topDrivers={report.topDrivers}
      factorExplanations={report.factorExplanations}
    />
  );
}
