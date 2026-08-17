'use client';

import Link from 'next/link';
import { Icon } from '@/components/shared/icon';
import { DownloadButton } from '@/components/shared/download-button';
import { logPrintableReportExport } from '@/lib/actions/reports';

interface PassportReportActionsProps {
  objectId: string;
}

export function PassportReportActions({ objectId }: PassportReportActionsProps) {
  async function handlePrint() {
    const result = await logPrintableReportExport({ reportType: 'passport', objectId });
    if ('error' in result) throw new Error(result.error);
    window.print();
  }

  return (
    <div className="report-actions no-print">
      <Link href={`/objects/${objectId}/passport`} className="btn btn-ghost btn-sm">
        <Icon name="chevL" size={14} />
        Назад к паспорту
      </Link>
      <DownloadButton
        label="Сохранить PDF"
        loadingLabel="Подготовка…"
        onDownload={handlePrint}
        variant="primary"
      />
    </div>
  );
}

export function ExecutiveReportActions() {
  async function handlePrint() {
    const result = await logPrintableReportExport({ reportType: 'executive' });
    if ('error' in result) throw new Error(result.error);
    window.print();
  }

  return (
    <div className="report-actions no-print">
      <Link href="/dashboard" className="btn btn-ghost btn-sm">
        <Icon name="chevL" size={14} />
        Назад к Dashboard
      </Link>
      <DownloadButton
        label="Сохранить PDF"
        loadingLabel="Подготовка…"
        onDownload={handlePrint}
        variant="primary"
      />
    </div>
  );
}
