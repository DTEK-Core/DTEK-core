'use client';

import { useEffect } from 'react';
import { ReportState } from '@/components/shared/reports/report-state';

export default function ReportsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[reports]', error.digest ?? error.message);
  }, [error]);

  return (
    <main className="report-shell">
      <ReportState
        icon="shield"
        title="Не удалось сформировать отчёт"
        description="Данные отчёта временно недоступны. Попробуйте повторить запрос или вернитесь в рабочий раздел."
        onRetry={reset}
        secondaryHref="/dashboard"
        secondaryLabel="К Dashboard"
      />
    </main>
  );
}
