'use client';

import { DataImportDialog } from '@/components/shared/import/data-import-dialog';
import { commitObjectImport, previewObjectImport } from '@/lib/actions/object-imports';
import { parseObjectImportFile } from '@/lib/import/browser-file';

interface ObjectImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ObjectImportDialog(props: ObjectImportDialogProps) {
  return (
    <DataImportDialog
      {...props}
      title="Импорт объектов"
      pickerTitle="Выберите CSV или XLSX"
      pickerNote="До 5 МБ и 500 объектов, первый лист XLSX"
      checkingText="Проверяем структуру и права доступа…"
      parseFile={parseObjectImportFile}
      previewImport={previewObjectImport}
      commitImport={commitObjectImport}
      successToast={result => `Импортировано объектов: ${result.created}`}
    />
  );
}
