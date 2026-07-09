export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

function csvCell(value: string | number | null | undefined): string {
  const raw = value == null ? '' : String(value);
  const escaped = raw.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function serializeCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((column) => csvCell(column.header)).join(',');
  const body = rows.map((row) =>
    columns.map((column) => csvCell(column.value(row))).join(','),
  );

  return [header, ...body].join('\r\n');
}

export function withUtf8Bom(csv: string): string {
  return `\uFEFF${csv}`;
}
