const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

function loadExplainabilityModule() {
  const modulePath = path.resolve(__dirname, '../../lib/trust/explainability.ts');
  const source = fs.readFileSync(modulePath, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: modulePath,
  });
  const loaded = { exports: {} };
  const execute = new Function(
    'exports',
    'require',
    'module',
    '__filename',
    '__dirname',
    outputText,
  );
  execute(loaded.exports, require, loaded, modulePath, path.dirname(modulePath));
  return loaded.exports;
}

const {
  buildScoreFactors,
  buildTopScoreDrivers,
  NEUTRAL_TRUST_REFERENCE,
} = loadExplainabilityModule();

const defaultFactors = [
  { key: 'vuln', label: 'Уязвимости', score: 45, weight: 22 },
  { key: 'config', label: 'Конфигурация', score: 55, weight: 18 },
  { key: 'access', label: 'Доступ', score: 70, weight: 18 },
  { key: 'network', label: 'Сеть', score: 70, weight: 14 },
  { key: 'compliance', label: 'Соответствие', score: 80, weight: 16 },
  { key: 'incident', label: 'Инциденты', score: 70, weight: 12 },
];

test('top drivers reproduce the approved Sprint 12 worked example', () => {
  const drivers = buildTopScoreDrivers(defaultFactors);

  assert.equal(NEUTRAL_TRUST_REFERENCE, 70);
  assert.deepEqual(
    drivers.map(({ key, neutralDelta, direction }) => ({ key, neutralDelta, direction })),
    [
      { key: 'vuln', neutralDelta: -5.5, direction: 'negative' },
      { key: 'config', neutralDelta: -2.7, direction: 'negative' },
      { key: 'compliance', neutralDelta: 1.6, direction: 'positive' },
    ],
  );
});

test('custom organization weights change driver order and contribution', () => {
  const factors = [
    { key: 'vuln', label: 'Уязвимости', score: 60, weight: 10 },
    { key: 'config', label: 'Конфигурация', score: 65, weight: 40 },
    { key: 'access', label: 'Доступ', score: 70, weight: 0 },
  ];

  const drivers = buildTopScoreDrivers(factors);
  const explained = buildScoreFactors(factors);

  assert.deepEqual(drivers.map(({ key }) => key), ['config', 'vuln']);
  assert.equal(explained[1].contribution, 26);
  assert.equal(explained[1].neutralDelta, -2);
});

test('neutral factors are excluded and the result is capped at five', () => {
  const factors = [
    { key: 'vuln', label: 'Уязвимости', score: 80, weight: 22 },
    { key: 'config', label: 'Конфигурация', score: 80, weight: 18 },
    { key: 'access', label: 'Доступ', score: 80, weight: 18 },
    { key: 'network', label: 'Сеть', score: 80, weight: 14 },
    { key: 'compliance', label: 'Соответствие', score: 80, weight: 16 },
    { key: 'incident', label: 'Инциденты', score: 80, weight: 12 },
  ];

  assert.deepEqual(
    buildTopScoreDrivers(factors).map(({ key }) => key),
    ['vuln', 'config', 'access', 'compliance', 'network'],
  );
  assert.deepEqual(
    buildTopScoreDrivers(factors.map((factor) => ({ ...factor, score: 70 }))),
    [],
  );
});

test('ties preserve the canonical input order', () => {
  const factors = [
    { key: 'vuln', label: 'Уязвимости', score: 60, weight: 20 },
    { key: 'config', label: 'Конфигурация', score: 60, weight: 20 },
  ];

  assert.deepEqual(buildTopScoreDrivers(factors).map(({ key }) => key), ['vuln', 'config']);
  assert.deepEqual(buildTopScoreDrivers(factors, 1).map(({ key }) => key), ['vuln']);
});
