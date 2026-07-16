import type { TrustFactorKey } from '@/lib/design-tokens';

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
