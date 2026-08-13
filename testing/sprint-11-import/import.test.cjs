const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const Module = require('node:module');
const ts = require('typescript');

const projectRoot = path.resolve(__dirname, '../..');
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveProjectAlias(request, parent, isMain, options) {
  const mapped = request.startsWith('@/')
    ? path.join(projectRoot, request.slice(2))
    : request;
  return originalResolveFilename.call(this, mapped, parent, isMain, options);
};

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const { parseCsv } = require('../../lib/import/browser-file.ts');
const { prepareObjectImport } = require('../../lib/import/objects.ts');
const { prepareRiskImport } = require('../../lib/import/risks.ts');
const {
  detectImportDatasetType,
  importTypeMismatchMessage,
} = require('../../lib/import/headers.ts');
const {
  preserveImportSourceDescription,
  splitImportSourceDescription,
} = require('../../lib/import/shared.ts');

function fixture(relativePath) {
  return parseCsv(fs.readFileSync(path.join(__dirname, relativePath), 'utf8'));
}

test('risk origin helpers hide and preserve the trailing import source block', () => {
  const stored = [
    'Описание риска',
    '',
    '[Import Source]',
    'source_name: MaxPatrol VM',
    'source_type: vulnerability_export',
    'confidence: high',
  ].join('\n');

  assert.deepEqual(splitImportSourceDescription(stored), {
    description: 'Описание риска',
    sourceBlock: [
      '[Import Source]',
      'source_name: MaxPatrol VM',
      'source_type: vulnerability_export',
      'confidence: high',
    ].join('\n'),
  });
  assert.equal(
    preserveImportSourceDescription('Обновлённое описание', stored),
    stored.replace('Описание риска', 'Обновлённое описание'),
  );
  assert.equal(splitImportSourceDescription('Ручной риск').sourceBlock, null);
});

test('CSV parser supports comma, semicolon, tab, BOM, quotes and multiline values', () => {
  assert.deepEqual(parseCsv('name,type\na,server'), [['name', 'type'], ['a', 'server']]);
  assert.deepEqual(parseCsv('name;type\na;server'), [['name', 'type'], ['a', 'server']]);
  assert.deepEqual(parseCsv('name\ttype\na\tserver'), [['name', 'type'], ['a', 'server']]);
  assert.equal(parseCsv('\uFEFFname,type\na,server')[0][0], 'name');
  assert.equal(parseCsv('name,description\na,"line 1\nline 2, value"')[1][1], 'line 1\nline 2, value');
  assert.throws(() => parseCsv('name,type\na,"server'), /незакрытое значение/);
});

test('CSV parser and object preview tolerate empty columns, rows and trailing cells', () => {
  const matrix = parseCsv('name,,type,\n\nS11-EMPTY-COLUMNS,,server,\n,,,\n');
  const preview = prepareObjectImport('empty-columns.csv', matrix, 'owner', []);
  assert.equal(preview.totalRows, 1);
  assert.equal(preview.creatableRows, 1);
  assert.equal(preview.errorRows, 0);
});

test('canonical object and risk templates remain importable', () => {
  const objects = prepareObjectImport('objects.csv', fixture('../../public/templates/dtek-core-objects-import-template.csv'), 'owner', []);
  const risks = prepareRiskImport('risks.csv', fixture('../../public/templates/dtek-core-risks-import-template.csv'), [], []);
  assert.equal(objects.creatableRows, 1);
  assert.equal(risks.creatableRows, 1);
  assert.equal(risks.warningCount, 1);
});

test('demo import package creates linked objects and risks without blocking issues', () => {
  const objectPreview = prepareObjectImport(
    'dtek-core-demo-objects.csv',
    fixture('../demo-import/dtek-core-demo-objects.csv'),
    'owner',
    [],
  );
  assert.equal(objectPreview.totalRows, 15);
  assert.equal(objectPreview.creatableRows, 15);
  assert.equal(objectPreview.errorRows, 0);

  const objects = objectPreview.rows.map((row, index) => ({
    id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    name: row.object.name,
    ip_address: row.object.ip_address,
  }));
  const riskPreview = prepareRiskImport(
    'dtek-core-demo-risks.csv',
    fixture('../demo-import/dtek-core-demo-risks.csv'),
    objects,
    [],
  );
  assert.equal(riskPreview.totalRows, 12);
  assert.equal(riskPreview.creatableRows, 12);
  assert.equal(riskPreview.errorRows, 0);
  assert.equal(riskPreview.rows.filter(row => row.risk.linkedObjectId).length, 12);
});

test('localized object headers map to canonical fields', () => {
  const preview = prepareObjectImport('localized.csv', fixture('objects/objects-localized.csv'), 'owner', []);
  assert.equal(preview.totalRows, 2);
  assert.equal(preview.creatableRows, 2);
  assert.equal(preview.errorRows, 0);
  assert.ok(preview.informationCount > 0);
});

test('DTEK Core risk export maps back into risk import', () => {
  const objects = [
    { id: '00000000-0000-4000-8000-000000000001', name: 'S11-OBJ-SERVER-001', ip_address: '10.111.1.1' },
    { id: '00000000-0000-4000-8000-000000000002', name: 'S11-OBJ-SERVER-002', ip_address: '10.111.1.2' },
    { id: '00000000-0000-4000-8000-000000000003', name: 'S11-OBJ-SERVER-003', ip_address: '10.111.1.3' },
  ];
  const preview = prepareRiskImport('risk-export.csv', fixture('risks/dtek-core-risk-export-sample.csv'), objects, []);
  assert.equal(preview.totalRows, 2);
  assert.equal(preview.creatableRows, 2);
  assert.equal(preview.errorRows, 0);
  assert.equal(preview.rows[0].risk.category, 'vulnerability');
  assert.equal(preview.rows[0].risk.severity, 'critical');
  assert.equal(preview.rows[0].risk.status, 'open');
  assert.equal(preview.rows[1].risk.linkedObjectName, 'S11-OBJ-SERVER-002');
  assert.ok(preview.issues.some(item => item.code === 'multiple_object_references'));
  assert.ok(preview.issues.filter(item => item.code === 'ignored_columns').length === 1);
});

test('technical risk keys override localized display values', () => {
  const matrix = parseCsv([
    'Название,Категория,Категория key,Критичность,Критичность key,Статус,Статус key',
    'S11 key priority,Неверное значение,vulnerability,Неверное значение,high,Неверное значение,open',
  ].join('\n'));
  const preview = prepareRiskImport('key-priority.csv', matrix, [], []);
  assert.equal(preview.creatableRows, 1);
  assert.equal(preview.rows[0].risk.category, 'vulnerability');
  assert.equal(preview.rows[0].risk.severity, 'high');
  assert.equal(preview.rows[0].risk.status, 'open');
});

test('localized dates and decimal values normalize before validation', () => {
  const matrix = parseCsv([
    'Название;Критичность;Категория;Статус;Вероятность;CVSS;Due date',
    'S11 localized values;Высокий;Уязвимость;В работе;Средняя;7,5;31.12.2026',
  ].join('\n'));
  const preview = prepareRiskImport('localized-values.csv', matrix, [], []);
  assert.equal(preview.creatableRows, 1);
  assert.equal(preview.rows[0].risk.cvss_score, 7.5);
  assert.equal(preview.rows[0].risk.due_date, '2026-12-31');
  assert.equal(preview.rows[0].risk.status, 'in_progress');
});

test('wrong dataset type is detected before preview', () => {
  const riskMatrix = fixture('invalid/risk-file-for-object-import.csv');
  const objectMatrix = fixture('invalid/object-file-for-risk-import.csv');
  assert.equal(detectImportDatasetType(riskMatrix), 'risks');
  assert.equal(detectImportDatasetType(objectMatrix), 'objects');
  assert.match(importTypeMismatchMessage('objects', riskMatrix), /реестра рисков/);
  assert.match(importTypeMismatchMessage('risks', objectMatrix), /файл объектов/);
});

test('unknown headers are grouped into one warning', () => {
  const preview = prepareObjectImport('unknown.csv', fixture('invalid/unknown-columns.csv'), 'owner', []);
  const unknownIssues = preview.issues.filter(item => item.code === 'unknown_columns');
  assert.equal(unknownIssues.length, 1);
  assert.equal(preview.creatableRows, 1);
});

test('object partial success keeps valid rows and skips error plus duplicate', () => {
  const preview = prepareObjectImport('partial.csv', fixture('partial-success/objects-partial-success.csv'), 'owner', []);
  assert.deepEqual({
    total: preview.totalRows,
    valid: preview.validRows,
    creatable: preview.creatableRows,
    errors: preview.errorRows,
    duplicates: preview.duplicateRows,
  }, { total: 5, valid: 4, creatable: 3, errors: 1, duplicates: 1 });
});

test('source metadata is appended to created record context', () => {
  const preview = prepareObjectImport(
    'source.csv',
    parseCsv('name,type,description\nS11 source object,server,Imported row'),
    'owner',
    [],
    {
      source_name: 'S11 source fixture',
      source_type: 'asset_inventory',
      source_collected_at: '2026-07-16',
      confidence: 'high',
      import_note: 'Controlled smoke test',
    },
  );
  assert.match(preview.rows[0].object.description, /\[Import Source\]/);
  assert.match(preview.rows[0].object.description, /source_name: S11 source fixture/);
  assert.match(preview.rows[0].object.description, /confidence: high/);
  assert.equal(preview.sourceMetadata.source_name, 'S11 source fixture');
});

test('risk partial success keeps valid rows and skips error plus duplicate', () => {
  const objects = [
    { id: '00000000-0000-4000-8000-000000000001', name: 'S11-OBJ-SERVER-001', ip_address: '10.111.1.1' },
    { id: '00000000-0000-4000-8000-000000000002', name: 'S11-OBJ-SERVER-002', ip_address: '10.111.1.2' },
    { id: '00000000-0000-4000-8000-000000000003', name: 'S11-OBJ-SERVER-003', ip_address: '10.111.1.3' },
  ];
  const preview = prepareRiskImport('partial.csv', fixture('partial-success/risks-partial-success.csv'), objects, []);
  assert.deepEqual({
    total: preview.totalRows,
    valid: preview.validRows,
    creatable: preview.creatableRows,
    errors: preview.errorRows,
    duplicates: preview.duplicateRows,
  }, { total: 5, valid: 4, creatable: 3, errors: 1, duplicates: 1 });
});

test('repeat object import is create-only and produces no candidates', () => {
  const matrix = fixture('objects/objects-valid-60.csv');
  const rows = matrix.slice(1).map(row => ({
    name: row[0],
    type: row[1],
    ip_address: row[3],
  }));
  const preview = prepareObjectImport('objects.csv', matrix, 'owner', rows);
  assert.equal(preview.totalRows, 60);
  assert.equal(preview.creatableRows, 0);
  assert.equal(preview.duplicateRows, 60);
});

test('repeat risk import is create-only and produces no candidates', () => {
  const matrix = fixture('risks/risks-valid-25.csv');
  const objectMatrix = fixture('objects/objects-valid-60.csv');
  const objects = objectMatrix.slice(1).map((row, index) => ({
    id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    name: row[0],
    ip_address: row[3],
  }));
  const firstPreview = prepareRiskImport('risks.csv', matrix, objects, []);
  const existingRisks = firstPreview.rows.map(row => ({
    title: row.risk.title,
    category: row.risk.category,
    severity: row.risk.severity,
    linkedObjectIds: row.risk.linkedObjectId ? [row.risk.linkedObjectId] : [],
  }));
  const repeatPreview = prepareRiskImport('risks.csv', matrix, objects, existingRisks);
  assert.equal(repeatPreview.totalRows, 25);
  assert.equal(repeatPreview.creatableRows, 0);
  assert.equal(repeatPreview.duplicateRows, 25);
});

test('changed repeat rows follow documented duplicate keys without updating records', () => {
  const objectMatrix = parseCsv('name,type,criticality,description\nS11 changed object,server,critical,New description');
  const objectPreview = prepareObjectImport('changed-object.csv', objectMatrix, 'owner', [
    { name: 'S11 changed object', type: 'server', ip_address: null },
  ]);
  assert.equal(objectPreview.creatableRows, 0);
  assert.match(
    objectPreview.issues.find(item => item.code === 'possible_duplicate_existing').message,
    /name \+ type/,
  );

  const linkedObject = {
    id: '00000000-0000-4000-8000-000000000777',
    name: 'S11 linked object',
    ip_address: null,
  };
  const riskMatrix = parseCsv('title,severity,category,linked_object_name\nS11 changed risk,critical,vulnerability,S11 linked object');
  const riskPreview = prepareRiskImport('changed-risk.csv', riskMatrix, [linkedObject], [{
    title: 'S11 changed risk',
    category: 'vulnerability',
    severity: 'high',
    linkedObjectIds: [linkedObject.id],
  }]);
  assert.equal(riskPreview.creatableRows, 0);
  assert.match(
    riskPreview.issues.find(item => item.code === 'possible_duplicate_existing').message,
    /title \+ linked object/,
  );
});

test('admin preview rejects non-infrastructure object rows', () => {
  const preview = prepareObjectImport('objects.csv', fixture('objects/objects-valid-60.csv'), 'admin', []);
  assert.ok(preview.errorRows > 0);
  assert.ok(preview.issues.some(item => item.code === 'rbac_denied'));
  assert.ok(preview.creatableRows > 0);
});

test('performance fixtures stay within Sprint 11 limits', () => {
  const objectMatrix = fixture('performance/objects-performance-200.csv');
  const objectPreview = prepareObjectImport('objects.csv', objectMatrix, 'owner', []);
  const objects = objectMatrix.slice(1).map((row, index) => ({
    id: `10000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    name: row[0],
    ip_address: row[3],
  }));
  const riskPreview = prepareRiskImport('risks.csv', fixture('performance/risks-performance-100.csv'), objects, []);
  assert.equal(objectPreview.creatableRows, 200);
  assert.equal(riskPreview.creatableRows, 100);
  assert.equal(riskPreview.rows.filter(row => row.risk.linkedObjectId).length, 100);
});
