import type { ImportIssue } from '@/lib/import/shared';

function csvCell(value: string | number | null): string {
  let raw = value === null ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(raw)) raw = `'${raw}`;
  return `"${raw.replace(/"/g, '""')}"`;
}

export function buildImportErrorReport(sourceFile: string, issues: ImportIssue[]): string {
  const header = [
    'source_file', 'row', 'field', 'code', 'message',
    'original_value', 'suggestion', 'severity',
  ];
  const rows = issues.map(item => [
    sourceFile,
    item.row,
    item.field,
    item.code,
    item.message,
    item.originalValue,
    item.suggestion,
    item.severity,
  ]);

  return `\uFEFF${[header, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n')}`;
}

export function downloadImportErrorReport(
  importType: string,
  sourceFile: string,
  issues: ImportIssue[],
): void {
  const csv = buildImportErrorReport(sourceFile, issues);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeType = importType.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '') || 'data';

  link.href = url;
  link.download = `dtek-core-${safeType}-import-validation-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
