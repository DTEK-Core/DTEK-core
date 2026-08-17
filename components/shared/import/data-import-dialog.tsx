'use client';

import { useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Icon } from '@/components/shared/icon';
import { DownloadButton } from '@/components/shared/download-button';
import { downloadImportErrorReport } from '@/lib/import/error-report';
import {
  DEFAULT_IMPORT_SOURCE,
  type ImportCommitSummary,
  type ImportMatrix,
  type ImportPreviewSummary,
  type ImportSourceConfidence,
  type ImportSourceDefaults,
  type ImportSourceType,
} from '@/lib/import/shared';
import { detectImportDatasetType, type ImportDatasetType } from '@/lib/import/headers';

const FILE_READ_TIMEOUT_MS = 30_000;
const PREVIEW_TIMEOUT_MS = 30_000;
const COMMIT_TIMEOUT_MS = 120_000;

class ImportTimeoutError extends Error {}

interface DataImportDialogProps<Preview extends ImportPreviewSummary, Result extends ImportCommitSummary> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  pickerTitle: string;
  pickerNote: string;
  checkingText: string;
  importType: ImportDatasetType;
  canOpenMismatchedImport?: boolean;
  reportName: string;
  templateHref: string;
  parseFile: (file: File) => Promise<ImportMatrix>;
  previewImport: (fileName: string, matrix: ImportMatrix, source: ImportSourceDefaults) => Promise<{ preview?: Preview; error?: string }>;
  commitImport: (fileName: string, matrix: ImportMatrix, source: ImportSourceDefaults) => Promise<{ result?: Result; error?: string }>;
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
  importType,
  canOpenMismatchedImport = true,
  reportName,
  templateHref,
  parseFile,
  previewImport,
  commitImport,
  successToast,
  resultSummary,
}: DataImportDialogProps<Preview, Result>) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [operation, setOperation] = useState<'reading' | 'preview' | 'commit' | null>(null);
  const [fileName, setFileName] = useState('');
  const [matrix, setMatrix] = useState<ImportMatrix | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mismatchedType, setMismatchedType] = useState<ImportDatasetType | null>(null);
  const [commitStatusUnknown, setCommitStatusUnknown] = useState(false);
  const [source, setSource] = useState<ImportSourceDefaults>(() => ({ ...DEFAULT_IMPORT_SOURCE }));
  const isPending = operation !== null;

  function reset() {
    setFileName('');
    setMatrix(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setMismatchedType(null);
    setCommitStatusUnknown(false);
    setSource({ ...DEFAULT_IMPORT_SOURCE });
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return;
    onOpenChange(nextOpen);
    if (!nextOpen) reset();
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setOperation('reading');
    setError(null);
    setMismatchedType(null);
    setCommitStatusUnknown(false);
    setPreview(null);
    setResult(null);
    setFileName(file.name);

    try {
      const parsedMatrix = await withTimeout(
        parseFile(file),
        FILE_READ_TIMEOUT_MS,
        'Чтение файла заняло больше 30 секунд. Проверьте файл и выберите его повторно.',
      );
      const detectedType = detectImportDatasetType(parsedMatrix);
      if (detectedType && detectedType !== importType) {
        setMatrix(null);
        setMismatchedType(detectedType);
        return;
      }

      setMatrix(parsedMatrix);
      setOperation('preview');
      const response = await withTimeout(
        previewImport(file.name, parsedMatrix, source),
        PREVIEW_TIMEOUT_MS,
        'Проверка файла заняла больше 30 секунд. Проверьте соединение и выберите файл повторно.',
      );
      if (response.error || !response.preview) {
        setError(response.error ?? 'Не удалось проверить файл');
        return;
      }
      setPreview(response.preview);
    } catch (parseError) {
      setMatrix(null);
      setError(parseError instanceof Error ? parseError.message : 'Не удалось прочитать файл');
    } finally {
      setOperation(null);
    }
  }

  async function handleCommit() {
    if (!matrix || !preview || preview.creatableRows === 0 || commitStatusUnknown) return;
    setOperation('commit');
    setError(null);
    try {
      const response = await withTimeout(
        commitImport(fileName, matrix, source),
        COMMIT_TIMEOUT_MS,
        'Импорт выполняется дольше двух минут. Обновите страницу и проверьте результат перед повторной загрузкой.',
      );
      if (response.error || !response.result) {
        setError(response.error ?? 'Не удалось выполнить импорт');
        return;
      }
      setResult(response.result);
      setPreview(null);
      router.refresh();
      if (response.result.created > 0) toast.success(successToast(response.result));
    } catch (commitError) {
      if (commitError instanceof ImportTimeoutError) setCommitStatusUnknown(true);
      setError(commitError instanceof Error ? commitError.message : 'Не удалось выполнить импорт');
    } finally {
      setOperation(null);
    }
  }

  const issueGroups = preview ? [
    { severity: 'error' as const, label: 'Блокирующие ошибки', issues: preview.issues.filter(item => item.severity === 'error') },
    { severity: 'warning' as const, label: 'Предупреждения', issues: preview.issues.filter(item => item.severity === 'warning') },
    { severity: 'info' as const, label: 'Информация', issues: preview.issues.filter(item => item.severity === 'info') },
  ].filter(group => group.issues.length > 0) : [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="object-import-dialog">
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--text)' }}>{title}</DialogTitle>
        </DialogHeader>

        {!preview && !result && (
          <div className="object-import-upload">
            <div className="object-import-source-form">
              <div className="object-import-section-title">Источник данных</div>
              <div className="object-import-source-grid">
                <label className="object-import-field object-import-field-wide" title="Система, файл или выгрузка, из которой получены данные">
                  <span>Название источника</span>
                  <input
                    type="text"
                    value={source.source_name ?? ''}
                    maxLength={200}
                    placeholder="Имя файла"
                    onChange={event => setSource(current => ({ ...current, source_name: event.target.value || null }))}
                    disabled={isPending}
                  />
                </label>
                <label className="object-import-field" title="Категория системы или способа получения данных">
                  <span>Тип</span>
                  <select
                    value={source.source_type}
                    onChange={event => setSource(current => ({ ...current, source_type: event.target.value as ImportSourceType }))}
                    disabled={isPending}
                  >
                    {SOURCE_TYPE_OPTIONS.map(option => <option value={option.value} key={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <label className="object-import-field" title="Экспертная оценка надёжности исходных данных">
                  <span>Уверенность</span>
                  <select
                    value={source.confidence}
                    onChange={event => setSource(current => ({ ...current, confidence: event.target.value as ImportSourceConfidence }))}
                    disabled={isPending}
                  >
                    {CONFIDENCE_OPTIONS.map(option => <option value={option.value} key={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <label className="object-import-field" title="Дата, на которую данные были собраны в источнике">
                  <span>Дата сбора</span>
                  <input
                    type="date"
                    value={source.source_collected_at ?? ''}
                    onChange={event => setSource(current => ({ ...current, source_collected_at: event.target.value || null }))}
                    disabled={isPending}
                  />
                </label>
                <label className="object-import-field object-import-field-wide" title="Контекст выгрузки или примечание для Evidence/Source истории">
                  <span>Комментарий</span>
                  <input
                    type="text"
                    value={source.import_note ?? ''}
                    maxLength={500}
                    onChange={event => setSource(current => ({ ...current, import_note: event.target.value || null }))}
                    disabled={isPending}
                  />
                </label>
              </div>
            </div>
            <div className="object-import-section-row object-import-template-row">
              <div className="object-import-section-title">Файл импорта</div>
              <DownloadButton label="Шаблон CSV" href={templateHref} compact />
            </div>
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
            {isPending && <p className="object-import-status">{operation === 'reading' ? 'Читаем файл…' : checkingText}</p>}
            {mismatchedType && (
              <div className="object-import-type-warning">
                <Icon name={mismatchedType === 'risks' ? 'risk' : 'objects'} size={18} />
                <div>
                  <strong>{mismatchedType === 'risks' ? 'Похоже, выбран файл реестра рисков' : 'Похоже, выбран файл объектов'}</strong>
                  <span>
                    {canOpenMismatchedImport
                      ? 'Этот файл нужно открыть в соответствующем разделе импорта.'
                      : 'Файл не обработан. Для импорта рисков нужна роль владельца или аналитика.'}
                  </span>
                </div>
                {canOpenMismatchedImport && (
                  <Link className="btn btn-line btn-sm" href={mismatchedType === 'risks' ? '/risks?import=1' : '/objects?import=1'}>
                    Перейти
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {preview && (
          <div className="object-import-preview">
            <div className="object-import-file-row"><Icon name="doc" size={16} /><span className="mono">{preview.fileName}</span></div>
            <div className="object-import-source-summary">
              <Icon name="layers" size={17} />
              <div>
                <span className="object-import-source-label">Источник</span>
                <strong>{preview.sourceMetadata.source_name}</strong>
                <span>
                  {sourceTypeLabel(preview.sourceMetadata.source_type)} · {confidenceLabel(preview.sourceMetadata.confidence)}
                  {preview.sourceMetadata.source_collected_at ? ` · ${preview.sourceMetadata.source_collected_at.slice(0, 10)}` : ''}
                  {preview.sourceMetadata.overriddenRows > 0 ? ` · Переопределено в строках: ${preview.sourceMetadata.overriddenRows}` : ''}
                </span>
                {preview.sourceMetadata.import_note && <span>{preview.sourceMetadata.import_note}</span>}
              </div>
            </div>
            <div className="object-import-stats">
              <ImportStat label="Строк" value={preview.totalRows} />
              <ImportStat label="Валидных" value={preview.validRows} tone="good" />
              <ImportStat label="К созданию" value={preview.creatableRows} tone="good" />
              <ImportStat label="С ошибками" value={preview.errorRows} tone={preview.errorRows ? 'bad' : undefined} />
              <ImportStat label="Дублей" value={preview.duplicateRows} tone={preview.duplicateRows ? 'warn' : undefined} />
              <ImportStat label="Предупреждений" value={preview.warningCount} tone={preview.warningCount ? 'warn' : undefined} />
              <ImportStat label="Информация" value={preview.informationCount} />
            </div>

            {issueGroups.length > 0 && (
              <div className="object-import-issues">
                <div className="object-import-section-row">
                  <div className="object-import-section-title">Результаты проверки</div>
                  <DownloadButton
                    label="Отчёт CSV"
                    loadingLabel="Формирование…"
                    onDownload={() => downloadImportErrorReport(reportName, preview.fileName, preview.issues)}
                    compact
                  />
                </div>
                {issueGroups.map(group => (
                  <div className="object-import-issue-group" key={group.severity}>
                    <div className="object-import-issue-group-title">{group.label} · {group.issues.length}</div>
                    {group.issues.slice(0, 5).map((item, index) => (
                      <div className={`object-import-issue ${item.severity}`} key={`${item.row}-${item.field}-${item.code}-${index}`}>
                        <span className="object-import-issue-mark">{item.severity === 'error' ? '!' : 'i'}</span>
                        <span className="object-import-issue-content">
                          <span><b>{item.row > 1 ? `Строка ${item.row}, ` : ''}{item.field}:</b> {item.message}</span>
                          {item.originalValue !== null && <span className="object-import-issue-meta">Исходное значение: {item.originalValue}</span>}
                          {item.suggestion && <span className="object-import-issue-meta">Рекомендация: {item.suggestion}</span>}
                        </span>
                      </div>
                    ))}
                    {group.issues.length > 5 && <p className="object-import-more">Ещё в разделе: {group.issues.length - 5}</p>}
                  </div>
                ))}
              </div>
            )}

            {preview.issues.length === 0 && (
              <div className="object-import-valid"><Icon name="check" size={16} />Ошибок, предупреждений и служебных замечаний не найдено</div>
            )}

            {commitStatusUnknown && (
              <div className="object-import-commit-unknown">
                Статус операции нужно проверить после обновления страницы. Не запускайте тот же импорт повторно вслепую.
                <button type="button" className="btn btn-line btn-sm" onClick={() => window.location.reload()}>Обновить данные</button>
              </div>
            )}

            <p className="object-import-note">Строки с ошибками и найденные дубли будут пропущены. Существующие записи не изменяются.</p>
            <div className="object-import-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={reset} disabled={isPending}>Другой файл</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => void handleCommit()} disabled={isPending || preview.creatableRows === 0 || commitStatusUnknown}>
                {operation === 'commit' ? 'Импортируем…' : `Импортировать ${preview.creatableRows}`}
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

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => reject(new ImportTimeoutError(message)), timeoutMs);
    promise.then(
      value => {
        window.clearTimeout(timeoutId);
        resolve(value);
      },
      error => {
        window.clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

const SOURCE_TYPE_OPTIONS: Array<{ value: ImportSourceType; label: string }> = [
  { value: 'manual_csv', label: 'Ручная таблица' },
  { value: 'asset_inventory', label: 'Инвентаризация / CMDB' },
  { value: 'vulnerability_export', label: 'Сканер уязвимостей' },
  { value: 'monitoring_export', label: 'Мониторинг' },
  { value: 'directory_export', label: 'AD / LDAP / FreeIPA' },
  { value: 'security_tool_export', label: 'Средство защиты' },
  { value: 'network_export', label: 'Сетевое оборудование' },
  { value: 'other', label: 'Другой источник' },
];

const CONFIDENCE_OPTIONS: Array<{ value: ImportSourceConfidence; label: string }> = [
  { value: 'high', label: 'Высокая' },
  { value: 'medium', label: 'Средняя' },
  { value: 'low', label: 'Низкая' },
];

function sourceTypeLabel(value: ImportSourceType): string {
  return SOURCE_TYPE_OPTIONS.find(option => option.value === value)?.label ?? value;
}

function confidenceLabel(value: ImportSourceConfidence): string {
  return CONFIDENCE_OPTIONS.find(option => option.value === value)?.label ?? value;
}

function ImportStat({ label, value, tone }: { label: string; value: number; tone?: 'good' | 'warn' | 'bad' }) {
  return (
    <div className={`object-import-stat${tone ? ` ${tone}` : ''}`}>
      <span className="object-import-stat-value mono">{value}</span>
      <span className="object-import-stat-label">{label}</span>
    </div>
  );
}
