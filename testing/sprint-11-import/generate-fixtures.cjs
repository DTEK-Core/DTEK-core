const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;

function csvCell(value) {
  const raw = value == null ? '' : String(value);
  return `"${raw.replace(/"/g, '""')}"`;
}

function writeCsv(relativePath, headers, rows, delimiter = ',') {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const content = [headers, ...rows]
    .map(row => row.map(csvCell).join(delimiter))
    .join('\n');
  fs.writeFileSync(target, `\uFEFF${content}\n`, 'utf8');
}

const objectHeaders = [
  'name', 'type', 'criticality', 'ip_address', 'os_platform', 'segment',
  'exposure', 'description', 'source_name', 'source_type', 'source_record_id',
  'source_collected_at', 'confidence',
];

function objectRow(prefix, index, type, criticality = 'medium') {
  const number = String(index).padStart(3, '0');
  return [
    `${prefix}-${type.toUpperCase()}-${number}`,
    type,
    criticality,
    `10.111.${Math.floor((index - 1) / 250) + 1}.${((index - 1) % 250) + 1}`,
    type === 'server' ? 'Astra Linux' : 'DTEK Test Platform',
    index % 3 === 0 ? 'dmz' : 'corporate',
    index % 5 === 0 ? 'external' : 'internal',
    `Controlled Sprint 11 object ${number}`,
    'S11 Test Asset Inventory',
    'asset_inventory',
    `${prefix.toLowerCase()}-asset-${number}`,
    '2026-07-16',
    index % 4 === 0 ? 'high' : 'medium',
  ];
}

const objectTypes = [
  ...Array(20).fill('server'),
  ...Array(10).fill('workstation'),
  ...Array(6).fill('laptop'),
  ...Array(6).fill('network'),
  ...Array(5).fill('database'),
  ...Array(5).fill('app'),
  ...Array(4).fill('service'),
  ...Array(2).fill('identity'),
  'ot',
  'policy',
];
const criticalities = ['low', 'medium', 'high', 'critical'];
const validObjects = objectTypes.map((type, index) => objectRow('S11-OBJ', index + 1, type, criticalities[index % criticalities.length]));
writeCsv('objects/objects-valid-60.csv', objectHeaders, validObjects);

writeCsv('objects/objects-localized.csv', [
  'Название', 'Тип', 'Критичность', 'IP адрес', 'ОС', 'Сегмент', 'Экспозиция', 'Описание',
], [
  ['S11-LOCAL-SRV-001', 'Сервер', 'Критический', '10.112.1.1', 'Astra Linux', 'prod', 'Внутренний', 'Localized headers'],
  ['S11-LOCAL-NET-002', 'Сетевое устройство', 'Высокий', '10.112.1.2', 'DTEK Test Platform', 'dmz', 'Внешний', 'Localized headers'],
]);

writeCsv('objects/objects-tab-delimited.csv', objectHeaders, validObjects.slice(0, 3), '\t');

const riskHeaders = [
  'title', 'severity', 'category', 'status', 'probability', 'cvss_score',
  'sla_days', 'linked_object_name', 'description', 'impact', 'source_name',
  'source_type', 'source_record_id', 'source_collected_at', 'confidence',
];
const categories = ['vulnerability', 'configuration', 'access', 'network', 'compliance'];
const statuses = ['open', 'in_progress', 'mitigated', 'accepted', 'closed'];

function riskRow(prefix, index, linkedObject = '') {
  const number = String(index).padStart(3, '0');
  const severity = criticalities[(index + 1) % criticalities.length];
  return [
    `${prefix} Risk ${number}`,
    severity,
    categories[(index - 1) % categories.length],
    statuses[(index - 1) % statuses.length],
    index % 3 === 0 ? 'high' : 'medium',
    severity === 'critical' ? '9.4' : severity === 'high' ? '7.8' : '5.2',
    severity === 'critical' ? '7' : '30',
    linkedObject,
    `Controlled Sprint 11 risk ${number}`,
    `Test impact ${number}`,
    'S11 Test Vulnerability Export',
    'vulnerability_export',
    `${prefix.toLowerCase()}-risk-${number}`,
    '2026-07-16',
    index % 4 === 0 ? 'high' : 'medium',
  ];
}

const validRisks = Array.from({ length: 25 }, (_, index) => riskRow(
  'S11-RISK',
  index + 1,
  index < 20 ? validObjects[index][0] : '',
));
writeCsv('risks/risks-valid-25.csv', riskHeaders, validRisks);

const exportHeaders = [
  'Risk ID', 'Название', 'Описание', 'Категория', 'Категория key',
  'Критичность', 'Критичность key', 'Вероятность', 'CVSS', 'Статус',
  'Статус key', 'Impact', 'Due date', 'Owner', 'Author', 'Linked objects',
  'Linked object IDs', 'Created at', 'Updated at', 'Source', 'Evidence note',
];
writeCsv('risks/dtek-core-risk-export-sample.csv', exportHeaders, [
  [
    '00000000-0000-4000-8000-000000000101', 'Exported critical risk', 'Roundtrip row',
    'Уязвимость', 'vulnerability', 'Критический', 'critical', 'Высокая', '9.4',
    'Открыт', 'open', 'Controlled impact', '2026-08-01', 'Owner Name', 'Author Name',
    validObjects[0][0], '00000000-0000-4000-8000-000000000001',
    '2026-07-15T10:00:00.000Z', '2026-07-16T10:00:00.000Z',
    'DTEK Core Risk Registry', 'Evidence Layer future note',
  ],
  [
    '00000000-0000-4000-8000-000000000102', 'Exported multi-object risk', 'Uses first object',
    'Сеть', 'network', 'Высокий', 'high', 'Средняя', '7.8',
    'В работе', 'in_progress', 'Controlled impact', '2026-08-15', 'Owner Name', 'Author Name',
    `${validObjects[1][0]}; ${validObjects[2][0]}`, 'id-2; id-3',
    '2026-07-15T11:00:00.000Z', '2026-07-16T11:00:00.000Z',
    'DTEK Core Risk Registry', 'Evidence Layer future note',
  ],
]);

const partialObjects = [
  objectRow('S11-PART', 1, 'server', 'critical'),
  objectRow('S11-PART', 2, 'network', 'high'),
  objectRow('S11-PART', 3, 'app', 'medium'),
];
writeCsv('partial-success/objects-partial-success.csv', objectHeaders, [
  ...partialObjects,
  partialObjects[0],
  objectRow('S11-PART', 4, 'spaceship', 'high'),
]);

const partialRisks = [
  riskRow('S11-PART', 1, validObjects[0][0]),
  riskRow('S11-PART', 2, validObjects[1][0]),
  riskRow('S11-PART', 3, ''),
];
const invalidRisk = riskRow('S11-PART', 4, validObjects[2][0]);
invalidRisk[1] = 'extreme';
writeCsv('partial-success/risks-partial-success.csv', riskHeaders, [
  ...partialRisks,
  partialRisks[0],
  invalidRisk,
]);

writeCsv('duplicates/objects-existing-duplicates.csv', objectHeaders, validObjects.slice(0, 5));
writeCsv('duplicates/risks-existing-duplicates.csv', riskHeaders, validRisks.slice(0, 5));

writeCsv('invalid/risk-file-for-object-import.csv', riskHeaders, validRisks.slice(0, 2));
writeCsv('invalid/object-file-for-risk-import.csv', objectHeaders, validObjects.slice(0, 2));
writeCsv('invalid/unknown-columns.csv', ['name', 'type', 'legacy_a', 'legacy_b', 'legacy_c'], [
  ['S11-UNKNOWN-001', 'server', 'a', 'b', 'c'],
]);

const performanceObjects = Array.from({ length: 200 }, (_, index) => objectRow(
  'S11-PERF',
  index + 1,
  objectTypes[index % objectTypes.length],
  criticalities[index % criticalities.length],
));
writeCsv('performance/objects-performance-200.csv', objectHeaders, performanceObjects);
const performanceRisks = Array.from({ length: 100 }, (_, index) => riskRow(
  'S11-PERF',
  index + 1,
  performanceObjects[index][0],
));
writeCsv('performance/risks-performance-100.csv', riskHeaders, performanceRisks);

console.log('Sprint 11 import fixtures generated.');
