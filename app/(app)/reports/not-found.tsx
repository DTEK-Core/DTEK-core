import type { Metadata } from 'next';
import { ReportState } from '@/components/shared/reports/report-state';

export const metadata: Metadata = {
  title: 'Отчёт недоступен — DTEK Core',
  robots: { index: false, follow: false },
};

export default function ReportsNotFound() {
  return (
    <main className="report-shell">
      <ReportState
        icon="shield"
        title="Отчёт недоступен"
        description="Запрошенный отчёт не найден, объект был удалён или у текущей роли нет доступа к этому артефакту."
        primaryHref="/dashboard"
        primaryLabel="К Dashboard"
        secondaryHref="/objects"
        secondaryLabel="К объектам"
      />
    </main>
  );
}
