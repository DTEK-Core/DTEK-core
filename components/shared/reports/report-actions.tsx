'use client';

import Link from 'next/link';
import { Icon } from '@/components/shared/icon';

interface PassportReportActionsProps {
  objectId: string;
}

export function PassportReportActions({ objectId }: PassportReportActionsProps) {
  return (
    <div className="report-actions no-print">
      <Link href={`/objects/${objectId}/passport`} className="btn btn-ghost btn-sm">
        <Icon name="chevL" size={14} />
        Назад к паспорту
      </Link>
      <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>
        <Icon name="download" size={14} />
        Сохранить PDF
      </button>
    </div>
  );
}
