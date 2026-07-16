const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

function loadExplainabilityModule() {
  const modulePath = path.resolve(__dirname, '../../lib/trust/explainability.ts');
  const previousLoader = require.extensions['.ts'];

  require.extensions['.ts'] = (module, fileName) => {
    const source = fs.readFileSync(fileName, 'utf8');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
      fileName,
    });
    module._compile(outputText, fileName);
  };

  delete require.cache[modulePath];
  try {
    return require(modulePath);
  } finally {
    if (previousLoader) require.extensions['.ts'] = previousLoader;
    else delete require.extensions['.ts'];
  }
}

const {
  buildScoreFactors,
  buildFactorExplanations,
  buildRiskImpactHints,
  buildTopScoreDrivers,
  NEUTRAL_TRUST_REFERENCE,
  parseSourceContext,
} = loadExplainabilityModule();

const defaultWeights = {
  vuln_weight: 22,
  config_weight: 18,
  access_weight: 18,
  network_weight: 14,
  compliance_weight: 16,
  incident_weight: 12,
};

const completeHighObject = {
  criticality: 'high',
  name: 'APP-01',
  type: 'server',
  description: 'Сервер приложений',
  ip_address: '10.0.0.10',
  os_platform: 'Astra Linux',
  segment: 'production',
  exposure: 'internal',
  owner_id: 'owner-1',
};

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

test('source parser reads only the last valid trailing import block', () => {
  const source = parseSourceContext([
    'Описание объекта',
    '',
    '[Import Source]',
    'source_name: Старый источник',
    'source_type: other',
    'confidence: low',
    '',
    '[Import Source]',
    'source_name: MaxPatrol VM',
    'source_type: vulnerability_export',
    'source_record_id: vm-1001',
    'source_collected_at: 2026-07-15',
    'confidence: high',
    'import_note: Тестовый импорт',
  ].join('\n'));

  assert.deepEqual(source, {
    kind: 'import',
    sourceName: 'MaxPatrol VM',
    sourceType: 'vulnerability_export',
    sourceRecordId: 'vm-1001',
    collectedAt: '2026-07-15',
    confidence: 'high',
    isEvidenceRecord: false,
  });
});

test('missing and malformed source metadata use the manual fallback', () => {
  const expected = {
    kind: 'manual',
    sourceName: 'Ручные данные DTEK Core',
    sourceType: null,
    sourceRecordId: null,
    collectedAt: null,
    confidence: null,
    isEvidenceRecord: false,
  };

  assert.deepEqual(parseSourceContext('Обычное описание'), expected);
  assert.deepEqual(parseSourceContext([
    '[Import Source]',
    'source_name: Источник',
    'unknown_key: value',
    'confidence: high',
  ].join('\n')), expected);
});

test('factor reasons reproduce base, active penalties, bonus and sources', () => {
  const importedObject = [
    'Сервер приложений',
    '',
    '[Import Source]',
    'source_name: Asset Inventory',
    'source_type: asset_inventory',
    'source_collected_at: 2026-07-14',
    'confidence: medium',
  ].join('\n');
  const importedRisk = [
    '[Import Source]',
    'source_name: MaxPatrol VM',
    'source_type: vulnerability_export',
    'source_record_id: vm-1001',
    'confidence: high',
  ].join('\n');
  const explanations = buildFactorExplanations(defaultFactors, {
    criticality: 'high',
    completenessPct: 85,
    objectDescription: importedObject,
    risks: [
      {
        id: 'risk-vuln',
        title: 'Критичная версия пакета',
        category: 'vulnerability',
        severity: 'high',
        status: 'open',
        description: importedRisk,
      },
      {
        id: 'risk-config',
        title: 'Небезопасная конфигурация',
        category: 'configuration',
        severity: 'medium',
        status: 'in_progress',
        description: null,
      },
      {
        id: 'risk-closed',
        title: 'Закрытый риск',
        category: 'vulnerability',
        severity: 'critical',
        status: 'closed',
        description: null,
      },
    ],
  });

  const vuln = explanations.find(({ key }) => key === 'vuln');
  const compliance = explanations.find(({ key }) => key === 'compliance');

  assert.ok(vuln);
  assert.equal(vuln.base, 70);
  assert.equal(vuln.appliedPenalty, 25);
  assert.equal(vuln.completenessBonus, 0);
  assert.equal(vuln.calculatedScore, 45);
  assert.equal(vuln.isConsistent, true);
  assert.deepEqual(vuln.risks.map(({ riskId }) => riskId), ['risk-vuln']);
  assert.deepEqual(vuln.sources.map(({ sourceName }) => sourceName), [
    'Asset Inventory',
    'MaxPatrol VM',
  ]);

  assert.ok(compliance);
  assert.equal(compliance.appliedPenalty, 0);
  assert.equal(compliance.completenessBonus, 10);
  assert.equal(compliance.calculatedScore, 80);
  assert.equal(compliance.risks.length, 0);
});

test('distributed penalties and clamp state match the score engine rules', () => {
  const distributedFactors = defaultFactors.map((factor) => ({ ...factor, score: 69 }));
  const distributed = buildFactorExplanations(distributedFactors, {
    criticality: 'high',
    completenessPct: 0,
    objectDescription: null,
    risks: [{
      id: 'risk-other',
      title: 'Общий организационный риск',
      category: 'organizational',
      severity: 'low',
      status: 'open',
      description: null,
    }],
  });

  assert.ok(distributed.every(factor => factor.appliedPenalty === 1));
  assert.ok(distributed.every(factor => factor.calculatedScore === 69));

  const clamped = buildFactorExplanations([
    { key: 'vuln', label: 'Уязвимости', score: 0, weight: 22 },
  ], {
    criticality: 'critical',
    completenessPct: 0,
    objectDescription: null,
    risks: [
      { id: 'a', title: 'A', category: 'vulnerability', severity: 'critical', status: 'open', description: null },
      { id: 'b', title: 'B', category: 'vulnerability', severity: 'critical', status: 'open', description: null },
    ],
  })[0];

  assert.equal(clamped.appliedPenalty, 80);
  assert.equal(clamped.calculatedScore, 0);
  assert.equal(clamped.wasClamped, true);
  assert.equal(clamped.isConsistent, true);
});

test('risk impact uses counterfactual engine scores and excludes inactive risks', () => {
  const hints = buildRiskImpactHints(completeHighObject, [
    { id: 'risk-vuln', category: 'vulnerability', severity: 'high', status: 'open' },
    { id: 'risk-config', category: 'configuration', severity: 'medium', status: 'in_progress' },
    { id: 'risk-closed', category: 'vulnerability', severity: 'critical', status: 'closed' },
  ], defaultWeights);

  assert.deepEqual(hints, [
    {
      riskId: 'risk-vuln',
      state: 'potential_gain',
      currentScore: 65,
      projectedScore: 71,
      potentialGain: 6,
    },
    {
      riskId: 'risk-config',
      state: 'potential_gain',
      currentScore: 65,
      projectedScore: 68,
      potentialGain: 3,
    },
    {
      riskId: 'risk-closed',
      state: 'inactive',
      currentScore: 65,
      projectedScore: 65,
      potentialGain: 0,
    },
  ]);
});

test('risk impact respects clamp, final rounding and distributed penalties', () => {
  const criticalObject = { ...completeHighObject, criticality: 'critical' };
  const clamped = buildRiskImpactHints(criticalObject, [
    { id: 'risk-a', category: 'vulnerability', severity: 'critical', status: 'open' },
    { id: 'risk-b', category: 'vulnerability', severity: 'critical', status: 'open' },
    { id: 'risk-c', category: 'vulnerability', severity: 'critical', status: 'open' },
  ], defaultWeights);

  assert.equal(clamped[0].state, 'no_rounded_change');
  assert.equal(clamped[0].currentScore, 54);
  assert.equal(clamped[0].projectedScore, 54);
  assert.equal(clamped[0].potentialGain, 0);

  const distributed = buildRiskImpactHints(completeHighObject, [
    { id: 'risk-other', category: 'organizational', severity: 'low', status: 'open' },
  ], defaultWeights)[0];

  assert.deepEqual(distributed, {
    riskId: 'risk-other',
    state: 'potential_gain',
    currentScore: 72,
    projectedScore: 73,
    potentialGain: 1,
  });
});

test('risk impact uses the current organization factor weights', () => {
  const vulnOnlyWeights = {
    vuln_weight: 100,
    config_weight: 0,
    access_weight: 0,
    network_weight: 0,
    compliance_weight: 0,
    incident_weight: 0,
  };
  const hint = buildRiskImpactHints(completeHighObject, [
    { id: 'risk-vuln', category: 'vulnerability', severity: 'high', status: 'open' },
  ], vulnOnlyWeights)[0];

  assert.deepEqual(hint, {
    riskId: 'risk-vuln',
    state: 'potential_gain',
    currentScore: 45,
    projectedScore: 70,
    potentialGain: 25,
  });
});
