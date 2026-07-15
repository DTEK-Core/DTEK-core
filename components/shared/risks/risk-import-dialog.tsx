'use client';

import { DataImportDialog } from '@/components/shared/import/data-import-dialog';
import { commitRiskImport, previewRiskImport } from '@/lib/actions/risk-imports';
import { parseRiskImportFile } from '@/lib/import/browser-file';

interface RiskImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RiskImportDialog(props: RiskImportDialogProps) {
  return (
    <DataImportDialog
      {...props}
      title="Импорт рисков"
      pickerTitle="Выберите CSV или XLSX"
      pickerNote="До 5 МБ и 500 рисков, первый лист XLSX"
      checkingText="Проверяем риски, объекты и права доступа…"
      parseFile={parseRiskImportFile}
      previewImport={previewRiskImport}
      commitImport={commitRiskImport}
      successToast={result => `Импортировано рисков: ${result.created}`}
      resultSummary={result => (
        <p>
          Создано: {result.created} · Связано с объектами: {result.linked} ·
          Без связи: {result.unlinked} · Пропущено: {result.skipped} · Ошибок записи: {result.failed}
          {result.linkFailures > 0 ? ` · Ошибок связи: ${result.linkFailures}` : ''}
        </p>
      )}
    />
  );
}
