import { TRUST_FACTORS, type TrustFactorKey } from '../design-tokens';
import {
  calcTrustScore,
  getCompletenessBonus,
  getCriticalityBase,
  getRiskPenaltyForFactor,
  getRiskSeverityPenalty,
  isActiveRisk,
  type FactorWeights,
  type ObjectForCalc,
  type RiskForCalc,
} from './calculate';

export const NEUTRAL_TRUST_REFERENCE = 70;

const MATERIAL_DELTA_THRESHOLD = 0.05;

export type ScoreDriverDirection = 'negative' | 'positive' | 'neutral';

export interface ScoreFactorInput {
  key: TrustFactorKey;
  label: string;
  score: number;
  weight: number;
}

export interface ScoreFactor extends ScoreFactorInput {
  contribution: number;
  neutralDelta: number;
  direction: ScoreDriverDirection;
}

export type SourceConfidence = 'low' | 'medium' | 'high';
export type SourceContextKind = 'manual' | 'import' | 'system_derived' | 'evidence';

export interface SourceContext {
  kind: SourceContextKind;
  sourceName: string;
  sourceType: string | null;
  sourceRecordId: string | null;
  collectedAt: string | null;
  confidence: SourceConfidence | null;
  isEvidenceRecord: boolean;
}

export interface ExplainabilityRisk extends RiskForCalc {
  id: string;
  title: string;
  description: string | null;
}

export interface FactorRiskReason {
  riskId: string;
  title: string;
  severity: string;
  status: string;
  rawPenalty: number;
  appliedPenalty: number;
  source: SourceContext;
}

export interface FactorExplanation extends ScoreFactor {
  base: number;
  appliedPenalty: number;
  completenessBonus: number;
  calculatedScore: number;
  wasClamped: boolean;
  isConsistent: boolean;
  risks: FactorRiskReason[];
  sources: SourceContext[];
}

export interface FactorExplanationContext {
  criticality: string;
  completenessPct: number;
  objectDescription: string | null;
  risks: ReadonlyArray<ExplainabilityRisk>;
}

export interface RiskImpactInput extends RiskForCalc {
  id: string;
}

export type RiskImpactState = 'potential_gain' | 'no_rounded_change' | 'inactive';

export interface RiskImpactHint {
  riskId: string;
  state: RiskImpactState;
  currentScore: number;
  projectedScore: number;
  potentialGain: number;
}

export interface ScoreHistoryInput {
  id: string;
  oldScore: number | null;
  newScore: number;
  factorsSnapshot: unknown;
  reason: string | null;
  changedBy: string;
  createdAt: string;
}

export interface FactorScoreDelta {
  key: TrustFactorKey;
  label: string;
  previousScore: number;
  currentScore: number;
  delta: number;
}

export interface ScoreDeltaEvent {
  id: string;
  oldScore: number | null;
  newScore: number;
  delta: number | null;
  reasonLabel: string;
  actorLabel: string;
  createdAt: string;
  factorComparisonAvailable: boolean;
  factorDeltas: FactorScoreDelta[];
}

export interface DashboardObjectDriversInput {
  objectId: string;
  objectName: string;
  factors: ReadonlyArray<ScoreFactorInput> | null;
}

export interface DashboardDriverSummary {
  key: TrustFactorKey;
  label: string;
  weight: number;
  affectedObjects: number;
  averageNeutralDelta: number;
  averageFactorScore: number;
  coveragePct: number;
  leadingObject: {
    id: string;
    name: string;
    factorScore: number;
    neutralDelta: number;
  };
}

export interface DashboardExplainabilitySummary {
  totalObjects: number;
  analyzedObjects: number;
  drivers: DashboardDriverSummary[];
}

const SOURCE_KEYS = new Set([
  'source_name',
  'source_type',
  'source_record_id',
  'source_collected_at',
  'confidence',
  'import_note',
]);
const SOURCE_CONFIDENCE = new Set<SourceConfidence>(['low', 'medium', 'high']);
const SCORE_REASON_LABELS: Readonly<Record<string, string>> = {
  recalculated:    'Ручная переоценка',
  risk_changed:    'Изменение риска',
  risk_imported:   'Импорт рисков',
  object_updated:  'Изменение данных объекта',
  weights_changed: 'Изменение весов факторов',
};

function manualSourceContext(): SourceContext {
  return {
    kind: 'manual',
    sourceName: 'Ручные данные DTEK Core',
    sourceType: null,
    sourceRecordId: null,
    collectedAt: null,
    confidence: null,
    isEvidenceRecord: false,
  };
}

export function parseSourceContext(description: string | null): SourceContext {
  if (!description) return manualSourceContext();

  const markerPattern = /(?:^|\r?\n)\[Import Source\]\r?\n/g;
  const markers = Array.from(description.matchAll(markerPattern));
  const lastMarker = markers.at(-1);
  if (!lastMarker || lastMarker.index === undefined) return manualSourceContext();

  const block = description.slice(lastMarker.index + lastMarker[0].length);
  if (!block.trim()) return manualSourceContext();

  const values: Record<string, string> = {};
  const lines = block.split(/\r?\n/).filter((line) => line.trim().length > 0);

  for (const line of lines) {
    const separator = line.indexOf(':');
    if (separator <= 0) return manualSourceContext();

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (!SOURCE_KEYS.has(key) || !value || values[key]) return manualSourceContext();
    values[key] = value;
  }

  const sourceName = values.source_name;
  const sourceType = values.source_type;
  const confidence = values.confidence as SourceConfidence | undefined;
  if (!sourceName || !sourceType || !confidence || !SOURCE_CONFIDENCE.has(confidence)) {
    return manualSourceContext();
  }

  return {
    kind: 'import',
    sourceName,
    sourceType,
    sourceRecordId: values.source_record_id ?? null,
    collectedAt: values.source_collected_at ?? null,
    confidence,
    isEvidenceRecord: false,
  };
}

function uniqueSources(sources: ReadonlyArray<SourceContext>): SourceContext[] {
  const seen = new Set<string>();
  return sources.filter((source) => {
    const key = [
      source.kind,
      source.sourceName,
      source.sourceType,
      source.collectedAt,
      source.confidence,
    ].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseFactorSnapshot(value: unknown): Record<TrustFactorKey, number> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const snapshot = value as Record<string, unknown>;
  const parsed = {} as Record<TrustFactorKey, number>;
  for (const factor of TRUST_FACTORS) {
    const score = snapshot[factor.key];
    if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 100) {
      return null;
    }
    parsed[factor.key] = score;
  }
  return parsed;
}

function scoreActorLabel(changedBy: string): string {
  if (changedBy === 'system') return 'Система';
  if (changedBy.startsWith('user:') || /^[0-9a-f-]{36}$/i.test(changedBy)) {
    return 'Пользователь';
  }
  return 'Служебный процесс';
}

function sourceTimestamp(source: SourceContext): number {
  if (!source.collectedAt) return Number.NEGATIVE_INFINITY;
  const timestamp = new Date(source.collectedAt).getTime();
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

function roundOne(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function explainFactor(factor: ScoreFactorInput): {
  factor: ScoreFactor;
  rawNeutralDelta: number;
} {
  const contribution = factor.score * factor.weight / 100;
  const rawNeutralDelta = (
    (factor.score - NEUTRAL_TRUST_REFERENCE) * factor.weight / 100
  );
  const direction: ScoreDriverDirection = rawNeutralDelta < -MATERIAL_DELTA_THRESHOLD
    ? 'negative'
    : rawNeutralDelta > MATERIAL_DELTA_THRESHOLD
      ? 'positive'
      : 'neutral';

  return {
    factor: {
      ...factor,
      contribution: roundOne(contribution),
      neutralDelta: roundOne(rawNeutralDelta),
      direction,
    },
    rawNeutralDelta,
  };
}

function normalizeDashboardFactors(
  factors: ReadonlyArray<ScoreFactorInput> | null,
): ScoreFactorInput[] | null {
  if (!factors || factors.length !== TRUST_FACTORS.length) return null;

  const factorsByKey = new Map<TrustFactorKey, ScoreFactorInput>();
  for (const factor of factors) {
    const canonical = TRUST_FACTORS.find((item) => item.key === factor.key);
    if (
      !canonical
      || factorsByKey.has(canonical.key)
      || !Number.isFinite(factor.score)
      || factor.score < 0
      || factor.score > 100
      || !Number.isFinite(factor.weight)
      || factor.weight < 0
      || factor.weight > 100
    ) {
      return null;
    }
    factorsByKey.set(canonical.key, {
      key: canonical.key,
      label: canonical.label,
      score: factor.score,
      weight: factor.weight,
    });
  }

  return TRUST_FACTORS.map((factor) => factorsByKey.get(factor.key) ?? null)
    .filter((factor): factor is ScoreFactorInput => factor !== null);
}

export function buildScoreFactors(
  factors: ReadonlyArray<ScoreFactorInput>,
): ScoreFactor[] {
  return factors.map((factor) => explainFactor(factor).factor);
}

export function buildTopScoreDrivers(
  factors: ReadonlyArray<ScoreFactorInput>,
  maxDrivers = 5,
): ScoreFactor[] {
  const limit = Math.max(0, Math.floor(maxDrivers));

  return factors
    .map((factor, index) => ({ ...explainFactor(factor), index }))
    .filter(({ factor }) => factor.direction !== 'neutral')
    .sort((left, right) => (
      Math.abs(right.rawNeutralDelta) - Math.abs(left.rawNeutralDelta)
      || left.index - right.index
    ))
    .slice(0, limit)
    .map(({ factor }) => factor);
}

export function buildDashboardExplainabilitySummary(
  objects: ReadonlyArray<DashboardObjectDriversInput>,
  maxDrivers = 3,
): DashboardExplainabilitySummary {
  const limit = Math.max(0, Math.floor(maxDrivers));
  const analyzedObjects = objects.flatMap((object, objectIndex) => {
    const normalizedFactors = normalizeDashboardFactors(object.factors);
    if (!normalizedFactors) return [];
    return [{
      object,
      objectIndex,
      factors: normalizedFactors.map((factor) => explainFactor(factor)),
    }];
  });

  const drivers = TRUST_FACTORS.flatMap((canonicalFactor, factorIndex) => {
    const affected = analyzedObjects.flatMap((entry) => {
      const explanation = entry.factors.find(
        ({ factor }) => factor.key === canonicalFactor.key,
      );
      return explanation?.factor.direction === 'negative'
        ? [{ ...entry, ...explanation }]
        : [];
    });
    if (affected.length === 0) return [];

    const leading = affected.reduce((current, candidate) => (
      candidate.rawNeutralDelta < current.rawNeutralDelta
      || (
        candidate.rawNeutralDelta === current.rawNeutralDelta
        && candidate.objectIndex < current.objectIndex
      )
        ? candidate
        : current
    ));
    const totalNeutralDelta = affected.reduce(
      (sum, entry) => sum + entry.rawNeutralDelta,
      0,
    );
    const averageFactorScore = affected.reduce(
      (sum, entry) => sum + entry.factor.score,
      0,
    ) / affected.length;

    return [{
      factorIndex,
      totalMagnitude: Math.abs(totalNeutralDelta),
      driver: {
        key: canonicalFactor.key,
        label: canonicalFactor.label,
        weight: leading.factor.weight,
        affectedObjects: affected.length,
        averageNeutralDelta: roundOne(totalNeutralDelta / affected.length),
        averageFactorScore: roundOne(averageFactorScore),
        coveragePct: analyzedObjects.length > 0
          ? Math.round((affected.length / analyzedObjects.length) * 100)
          : 0,
        leadingObject: {
          id: leading.object.objectId,
          name: leading.object.objectName,
          factorScore: leading.factor.score,
          neutralDelta: roundOne(leading.rawNeutralDelta),
        },
      },
    }];
  })
    .sort((left, right) => (
      right.totalMagnitude - left.totalMagnitude
      || left.factorIndex - right.factorIndex
    ))
    .slice(0, limit)
    .map(({ driver }) => driver);

  return {
    totalObjects: objects.length,
    analyzedObjects: analyzedObjects.length,
    drivers,
  };
}

export function buildRiskImpactHints(
  object: ObjectForCalc,
  risks: ReadonlyArray<RiskImpactInput>,
  weights: FactorWeights,
): RiskImpactHint[] {
  const currentRisks = Array.from(risks);
  const currentScore = calcTrustScore(object, currentRisks, weights).trust_score;

  return currentRisks.map((risk) => {
    if (!isActiveRisk(risk)) {
      return {
        riskId: risk.id,
        state: 'inactive',
        currentScore,
        projectedScore: currentScore,
        potentialGain: 0,
      };
    }

    const projectedScore = calcTrustScore(
      object,
      currentRisks.filter((candidate) => candidate.id !== risk.id),
      weights,
    ).trust_score;
    const potentialGain = Math.max(0, projectedScore - currentScore);

    return {
      riskId: risk.id,
      state: potentialGain > 0 ? 'potential_gain' : 'no_rounded_change',
      currentScore,
      projectedScore,
      potentialGain,
    };
  });
}

export function buildScoreDeltaTimeline(
  history: ReadonlyArray<ScoreHistoryInput>,
  maxEvents = 5,
): ScoreDeltaEvent[] {
  const limit = Math.max(0, Math.floor(maxEvents));

  return history.slice(0, limit).map((entry, index) => {
    const previousEntry = history[index + 1];
    const currentSnapshot = parseFactorSnapshot(entry.factorsSnapshot);
    const previousSnapshot = parseFactorSnapshot(previousEntry?.factorsSnapshot);
    const hasContinuousHistory = entry.oldScore !== null
      && previousEntry?.newScore === entry.oldScore;
    const factorComparisonAvailable = hasContinuousHistory
      && currentSnapshot !== null
      && previousSnapshot !== null;
    const factorDeltas = factorComparisonAvailable
      ? TRUST_FACTORS.flatMap((factor) => {
          const previousScore = previousSnapshot[factor.key];
          const currentScore = currentSnapshot[factor.key];
          const delta = currentScore - previousScore;
          return delta === 0
            ? []
            : [{
                key: factor.key,
                label: factor.label,
                previousScore,
                currentScore,
                delta,
              }];
        })
      : [];

    return {
      id: entry.id,
      oldScore: entry.oldScore,
      newScore: entry.newScore,
      delta: entry.oldScore === null ? null : entry.newScore - entry.oldScore,
      reasonLabel: entry.reason
        ? SCORE_REASON_LABELS[entry.reason] ?? 'Переоценка Trust Score'
        : 'Переоценка Trust Score',
      actorLabel: scoreActorLabel(entry.changedBy),
      createdAt: entry.createdAt,
      factorComparisonAvailable,
      factorDeltas,
    };
  });
}

export function buildSourceTimeline(
  sources: ReadonlyArray<SourceContext>,
  maxSources = 6,
): SourceContext[] {
  const limit = Math.max(0, Math.floor(maxSources));

  return uniqueSources(sources)
    .map((source, index) => ({ source, index }))
    .sort((left, right) => (
      sourceTimestamp(right.source) - sourceTimestamp(left.source)
      || Number(right.source.kind === 'import') - Number(left.source.kind === 'import')
      || left.index - right.index
    ))
    .slice(0, limit)
    .map(({ source }) => source);
}

export function buildFactorExplanations(
  factors: ReadonlyArray<ScoreFactorInput>,
  context: FactorExplanationContext,
): FactorExplanation[] {
  const base = getCriticalityBase(context.criticality);
  const objectSource = parseSourceContext(context.objectDescription);

  return buildScoreFactors(factors).map((factor) => {
    const riskReasons = context.risks
      .map((risk, index) => ({
        risk,
        index,
        appliedPenalty: getRiskPenaltyForFactor(factor.key, risk),
      }))
      .filter(({ risk, appliedPenalty }) => isActiveRisk(risk) && appliedPenalty > 0)
      .sort((left, right) => (
        right.appliedPenalty - left.appliedPenalty
        || left.index - right.index
      ))
      .map(({ risk, appliedPenalty }) => ({
        riskId: risk.id,
        title: risk.title,
        severity: risk.severity,
        status: risk.status,
        rawPenalty: getRiskSeverityPenalty(risk.severity),
        appliedPenalty,
        source: parseSourceContext(risk.description),
      }));
    const appliedPenalty = riskReasons.reduce(
      (sum, risk) => sum + risk.appliedPenalty,
      0,
    );
    const completenessBonus = getCompletenessBonus(
      factor.key,
      context.completenessPct,
    );
    const unclampedScore = base - appliedPenalty + completenessBonus;
    const calculatedScore = Math.max(0, Math.min(100, unclampedScore));

    return {
      ...factor,
      base,
      appliedPenalty,
      completenessBonus,
      calculatedScore,
      wasClamped: calculatedScore !== unclampedScore,
      isConsistent: factor.score === calculatedScore,
      risks: riskReasons,
      sources: uniqueSources([
        objectSource,
        ...riskReasons.map((risk) => risk.source),
      ]),
    };
  });
}
