'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/shared/icon';
import { logPrintableReportExport } from '@/lib/actions/reports';

interface PassportReportActionsProps {
  objectId: string;
}

export function PassportReportActions({ objectId }: PassportReportActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handlePrint() {
    startTransition(async () => {
      try {
        await logPrintableReportExport({ reportType: 'passport', objectId });
      } finally {
        window.print();
      }
    });
  }

  return (
    <div className="report-actions no-print">
      <Link href={`/objects/${objectId}/passport`} className="btn btn-ghost btn-sm">
        <Icon name="chevL" size={14} />
        Назад к паспорту
      </Link>
      <button type="button" className="btn btn-primary btn-sm" onClick={handlePrint} disabled={isPending}>
        <Icon name="download" size={14} />
        {isPending ? 'Подготовка…' : 'Сохранить PDF'}
      </button>
    </div>
  );
}

export function ExecutiveReportActions() {
  const [isPending, startTransition] = useTransition();

  function handlePrint() {
    startTransition(async () => {
      try {
        await logPrintableReportExport({ reportType: 'executive' });
      } finally {
        window.print();
      }
    });
  }

  return (
    <div className="report-actions no-print">
      <Link href="/dashboard" className="btn btn-ghost btn-sm">
        <Icon name="chevL" size={14} />
        Назад к Dashboard
      </Link>
      <button type="button" className="btn btn-primary btn-sm" onClick={handlePrint} disabled={isPending}>
        <Icon name="download" size={14} />
        {isPending ? 'Подготовка…' : 'Сохранить PDF'}
      </button>
    </div>
  );
}
