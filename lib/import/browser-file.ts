import {
  MAX_IMPORT_FILE_SIZE,
  MAX_IMPORT_ROWS,
  type ImportCell,
  type ImportMatrix,
} from '@/lib/import/shared';

function isBlankRow(row: ImportMatrix[number]): boolean {
  return row.every(cell => cell === null || String(cell).trim() === '');
}

function trimTrailingBlankRows(matrix: ImportMatrix): ImportMatrix {
  const result = [...matrix];
  while (result.length > 0 && isBlankRow(result[result.length - 1])) result.pop();
  return result;
}

type CsvDelimiter = ',' | ';' | '\t';

function countDelimiter(line: string, delimiter: CsvDelimiter): number {
  let count = 0;
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    if (line[index] === '"') {
      if (inQuotes && line[index + 1] === '"') index += 1;
      else inQuotes = !inQuotes;
    } else if (!inQuotes && line[index] === delimiter) {
      count += 1;
    }
  }
  return count;
}

function detectDelimiter(text: string): CsvDelimiter {
  const firstLine = text.split(/\r?\n/).find(line => line.trim().length > 0) ?? '';
  const counts = ([',', ';', '\t'] as const).map(delimiter => ({
    delimiter,
    count: countDelimiter(firstLine, delimiter),
  }));
  counts.sort((left, right) => right.count - left.count);
  return counts[0]?.count ? counts[0].delimiter : ',';
}

export function parseCsv(text: string): ImportMatrix {
  const source = text.replace(/^\uFEFF/, '');
  const delimiter = detectDelimiter(source);
  const matrix: ImportMatrix = [];
  let row: ImportCell[] = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (char === '"') {
      if (inQuotes && source[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      row.push(field);
      field = '';
      continue;
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      row.push(field);
      matrix.push(row);
      row = [];
      field = '';
      if (char === '\r' && source[index + 1] === '\n') index += 1;
      continue;
    }

    field += char;
  }

  if (inQuotes) throw new Error('В CSV обнаружено незакрытое значение в кавычках');
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    matrix.push(row);
  }

  return trimTrailingBlankRows(matrix);
}

function serializeCell(cell: unknown): ImportCell {
  if (cell === null || cell === undefined) return null;
  if (cell instanceof Date) return cell.toISOString();
  if (typeof cell === 'string' || typeof cell === 'number' || typeof cell === 'boolean') return cell;
  return String(cell);
}

async function parseImportFile(file: File, rowLabel: string): Promise<ImportMatrix> {
  if (file.size > MAX_IMPORT_FILE_SIZE) throw new Error('Размер файла не должен превышать 5 МБ');

  const extension = file.name.split('.').pop()?.toLocaleLowerCase('ru');
  let matrix: ImportMatrix;

  if (extension === 'csv') {
    matrix = parseCsv(await file.text());
  } else if (extension === 'xlsx') {
    const { readSheet } = await import('read-excel-file/browser');
    const sheet = await readSheet(file);
    matrix = sheet.map(row => row.map(serializeCell));
  } else {
    throw new Error('Поддерживаются только файлы CSV и XLSX');
  }

  matrix = trimTrailingBlankRows(matrix);
  if (matrix.length === 0 || isBlankRow(matrix[0])) throw new Error('Файл не содержит строки заголовков');

  const dataRows = matrix.slice(1).filter(row => !isBlankRow(row)).length;
  if (dataRows === 0) throw new Error('Файл не содержит данных для импорта');
  if (dataRows > MAX_IMPORT_ROWS) throw new Error(`В файле больше ${MAX_IMPORT_ROWS} строк ${rowLabel}`);

  return matrix;
}

export function parseObjectImportFile(file: File): Promise<ImportMatrix> {
  return parseImportFile(file, 'объектов');
}

export function parseRiskImportFile(file: File): Promise<ImportMatrix> {
  return parseImportFile(file, 'рисков');
}
