'use client';

import { useRef, useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Icon } from '@/components/shared/icon';
import type { ImportCommitSummary, ImportMatrix, ImportPreviewSummary } from '@/lib/import/shared';

interface DataImportDialogProps<Preview extends ImportPreviewSummary, Result extends ImportCommitSummary> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  pickerTitle: string;
  pickerNote: string;
  checkingText: string;
  parseFile: (file: File) => Promise<ImportMatrix>;
  previewImport: (fileName: string, matrix: ImportMatrix) => Promise<{ preview?: Preview; error?: string }>;
  commitImport: (fileName: string, matrix: ImportMatrix) => Promise<{ result?: Result; error?: string }>;
  successToast: (result: Result) => string;
  resultSummary?: (result: Result) => ReactNode;
}

export function DataImportDialog<Preview extends ImportPreviewSummary, Result extends ImportCommitSummary>({
  open,
  onOpenChange,
  title,
  pickerTitle,
  pickerNote,
  checkingText,
  parseFile,
  previewImport,
  commitImport,
  successToast,
  resultSummary,
}: DataImportDialogProps<Preview, Result>) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [fileName, setFileName] = useState('');
  const [matrix, setMatrix] = useState<ImportMatrix | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setFileName('');
    setMatrix(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return;
    onOpenChange(nextOpen);
    if (!nextOpen) reset();
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setPreview(null);
    setResult(null);
    setFileName(file.name);

    try {
      const parsedMatrix = await parseFile(file);
      setMatrix(parsedMatrix);
      startTransition(async () => {
        const response = await previewImport(file.name, parsedMatrix);
        if (response.error || !response.preview) {
          setError(response.error ?? 'Не удалось проверить файл');
          return;
        }
        setPreview(response.preview);
      });
    } catch (parseError) {
      setMatrix(null);
      setError(parseError instanceof Error ? parseError.message : 'Не удалось прочитать файл');
    }
  }

  function handleCommit() {
    if (!matrix || !preview || preview.creatableRows === 0) return;
    setError(null);
    startTransition(async () => {
      const response = await commitImport(fileName, matrix);
      if (response.error || !response.result) {
        setError(response.error ?? 'Не удалось выполнить импорт');
        return;
      }
      setResult(response.result);
      setPreview(null);
      router.refresh();
      if (response.result.created > 0) toast.success(successToast(response.result));
    });
  }

  const visibleIssues = preview?.issues.slice(0, 8) ?? [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="object-import-dialog">
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--text)' }}>{title}</DialogTitle>
        </DialogHeader>

        {!preview && !result && (
          <div className="object-import-upload">
            <input
              ref={inputRef}
              className="sr-only"
              type="file"
              accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={event => void handleFile(event.target.files?.[0])}
              disabled={isPending}
            />
            <button type="button" className="object-import-picker" onClick={() => inputRef.current?.click()} disabled={isPending}>
              <span className="object-import-picker-icon"><Icon name="upload" size={22} /></span>
              <span className="object-import-picker-title">{pickerTitle}</span>
              <span className="object-import-picker-note">{pickerNote}</span>
            </button>
            {fileName && <p className="object-import-file mono">{fileName}</p>}
            {isPending && <p className="object-import-status">{checkingText}</p>}
          </div>
        )}

        {preview && (
          <div className="object-import-preview">
            <div className="object-import-file-row"><Icon name="doc" size={16} /><span className="mono">{preview.fileName}</span></div>
            <div className="object-import-stats">
              <ImportStat label="Строк" value={preview.totalRows} />
              <ImportStat label="Будет создано" value={preview.creatableRows} tone="good" />
              <ImportStat label="С ошибками" value={preview.errorRows} tone={preview.errorRows ? 'bad' : undefined} />
              <ImportStat label="Предупреждений" value={preview.warningCount} tone={preview.warningCount ? 'warn' : undefined} />
            </div>

            {visibleIssues.length > 0 && (
              <div className="object-import-issues">
                <div className="object-import-section-title">Результаты проверки</div>
                {visibleIssues.map((item, index) => (
                  <div className={`object-import-issue ${item.severity}`} key={`${item.row}-${item.field}-${item.code}-${index}`}>
                    <span className="object-import-issue-mark">{item.severity === 'error' ? '!' : 'i'}</span>
                    <span><b>Строка {item.row}, {item.field}:</b> {item.message}</span>
                  </div>
                ))}
                {preview.issues.length > visibleIssues.length && <p className="object-import-more">Ещё замечаний: {preview.issues.length - visibleIssues.length}</p>}
              </div>
            )}

            <p className="object-import-note">Строки с ошибками и найденные дубли будут пропущены. Существующие записи не изменяются.</p>
            <div className="object-import-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={reset} disabled={isPending}>Другой файл</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleCommit} disabled={isPending || preview.creatableRows === 0}>
                {isPending ? 'Импортируем…' : `Импортировать ${preview.creatableRows}`}
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="object-import-result">
            <span className="object-import-result-icon"><Icon name="check" size={24} /></span>
            <div className="object-import-result-title">Импорт завершён</div>
            {resultSummary ? resultSummary(result) : <p>Создано: {result.created} · Пропущено: {result.skipped} · Ошибок записи: {result.failed}</p>}
            {result.failures.slice(0, 5).map(failure => (
              <p className="object-import-failure" key={`${failure.row}-${failure.name}`}>Строка {failure.row}, {failure.name}: {failure.message}</p>
            ))}
            <div className="object-import-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>Импортировать ещё</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => handleOpenChange(false)}>Готово</button>
            </div>
          </div>
        )}

        {error && <p className="auth-error" style={{ margin: 0 }}>{error}</p>}
      </DialogContent>
    </Dialog>
  );
}

function ImportStat({ label, value, tone }: { label: string; value: number; tone?: 'good' | 'warn' | 'bad' }) {
  return (
    <div className={`object-import-stat${tone ? ` ${tone}` : ''}`}>
      <span className="object-import-stat-value mono">{value}</span>
      <span className="object-import-stat-label">{label}</span>
    </div>
  );
}
