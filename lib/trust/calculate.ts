/**
 * Trust Score Calculation Library
 * Реализует формулу из docs/Trust_Score_Model_v2.md (ADR-001).
 * Чистые функции — без побочных эффектов, без обращений к БД.
 */

// ── Константы модели ───────────────────────────────────────────────────────────

/** Базовые значения факторов по критичности объекта (Trust_Score_Model_v2.md §3.3) */
const BASE: Readonly<Record<string, number>> = {
  critical: 65,
  high:     70,
  medium:   75,
  low:      80,
};

/** Штрафы за активные риски по критичности (Trust_Score_Model_v2.md §4.3) */
const PENALTY: Readonly<Record<string, number>> = {
  critical: 40,
  high:     25,
  medium:   15,
  low:       5,
};

/**
 * Маппинг категорий рисков на ключи факторов (Trust_Score_Model_v2.md §4.2).
 * null означает равномерное влияние на все 6 факторов (÷ 6).
 */
const CATEGORY_FACTOR: Readonly<Record<string, string | null>> = {
  vulnerability:  'vuln',
  configuration:  'config',
  access:         'access',
  network:        'network',
  compliance:     'compliance',
  incident:       'incident',
  monitoring:     'incident',
  organizational: null,
  physical:       null,
  human:          null,
  other:          null,
};

/** Вес критичности объекта в организационном индексе (Trust_Score_Model_v2.md §6) */
const CRITICALITY_WEIGHT: Readonly<Record<string, number>> = {
  critical: 4,
  high:     3,
  medium:   2,
  low:      1,
};

/** Нейтральная оценка фактора при отсутствии данных (Trust_Score_Model_v2.md §10) */
const NEUTRAL_FACTOR_SCORE = 70;

// ── TypeScript типы ────────────────────────────────────────────────────────────

export interface RiskForCalc {
  category: string;
  severity: string;
  status:   string;
}

export interface ObjectForCalc {
  criticality:  string;
  name:         string;
  type:         string;
  description:  string | null;
  ip_address:   string | null;
  os_platform:  string | null;
  segment:      string | null;
  exposure:     string | null;
  owner_id:     string | null;
}

export interface FactorWeights {
  vuln_weight:       number;
  config_weight:     number;
  access_weight:     number;
  network_weight:    number;
  compliance_weight: number;
  incident_weight:   number;
}

export interface TrustFactors {
  vuln:       number;
  config:     number;
  access:     number;
  network:    number;
  compliance: number;
  incident:   number;
}

export interface TrustResult {
  trust_score:      number;
  trust_level:      string;
  factors:          TrustFactors;
  completeness_pct: number;
}

// ── Вспомогательные функции ────────────────────────────────────────────────────

/**
 * Преобразует числовую оценку в уровень доверия (Trust_Score_Model_v2.md §2).
 * 80–100 → high | 60–79 → good | 40–59 → medium | 20–39 → low | 0–19 → critical
 */
export function scoreToLevel(score: number): string {
  if (score >= 80) return 'high';
  if (score >= 60) return 'good';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'critical';
}

/**
 * Рассчитывает процент заполненности цифрового паспорта объекта.
 * 9 полей с весами суммарно 100% (Trust_Score_Model_v2.md §4.4).
 */
export function calcCompleteness(obj: ObjectForCalc): number {
  let score = 0;
  if (obj.name?.trim())        score += 15; // Название
  if (obj.type?.trim())        score += 10; // Тип
  if (obj.owner_id)            score += 10; // Владелец
  score                                += 10; // Критичность (всегда задана)
  if (obj.description?.trim()) score += 15; // Описание
  if (obj.ip_address?.trim())  score += 10; // IP-адрес / сетевой идентификатор
  if (obj.os_platform?.trim()) score += 10; // Платформа / ОС
  if (obj.segment?.trim())     score += 10; // Сетевой сегмент
  if (obj.exposure?.trim())    score += 10; // Тип экспозиции
  return Math.min(score, 100);
}

/**
 * Рассчитывает оценку одного фактора Trust Score.
 * Алгоритм: base − risk_penalty + completeness_bonus, clamp(0, 100).
 * (Trust_Score_Model_v2.md §4.5)
 */
export function calcFactorScore(
  factorKey:    string,
  base:         number,
  risks:        RiskForCalc[],
  completeness: number,
): number {
  // Только риски в статусе open или in_progress снижают оценку
  const activeRisks = risks.filter(
    r => r.status === 'open' || r.status === 'in_progress',
  );

  let penalty = 0;
  for (const risk of activeRisks) {
    const mapped = CATEGORY_FACTOR[risk.category] ?? null;
    const p = PENALTY[risk.severity] ?? 0;

    if (mapped === null) {
      // Категория без конкретного фактора — равномерно по всем 6
      penalty += Math.round(p / 6);
    } else if (mapped === factorKey) {
      penalty += p;
    }
  }

  let bonus = 0;
  if (factorKey === 'compliance') {
    if (completeness >= 95)      bonus = 20;
    else if (completeness >= 80) bonus = 10;
  }

  return Math.max(0, Math.min(100, base - penalty + bonus));
}

// ── Основные функции расчёта ───────────────────────────────────────────────────

/**
 * Рассчитывает полный Trust Score объекта по 6-факторной формуле.
 * (Trust_Score_Model_v2.md §4.6)
 */
export function calcTrustScore(
  obj:     ObjectForCalc,
  risks:   RiskForCalc[],
  weights: FactorWeights,
): TrustResult {
  const base         = BASE[obj.criticality] ?? NEUTRAL_FACTOR_SCORE;
  const completeness = calcCompleteness(obj);

  const factors: TrustFactors = {
    vuln:       calcFactorScore('vuln',       base, risks, completeness),
    config:     calcFactorScore('config',     base, risks, completeness),
    access:     calcFactorScore('access',     base, risks, completeness),
    network:    calcFactorScore('network',    base, risks, completeness),
    compliance: calcFactorScore('compliance', base, risks, completeness),
    incident:   calcFactorScore('incident',   base, risks, completeness),
  };

  const raw = (
    factors.vuln       * weights.vuln_weight +
    factors.config     * weights.config_weight +
    factors.access     * weights.access_weight +
    factors.network    * weights.network_weight +
    factors.compliance * weights.compliance_weight +
    factors.incident   * weights.incident_weight
  ) / 100;

  const trust_score = Math.max(0, Math.min(100, Math.round(raw)));
  const trust_level = scoreToLevel(trust_score);

  return { trust_score, trust_level, factors, completeness_pct: completeness };
}

/**
 * Рассчитывает организационный индекс доверия как взвешенное среднее
 * Trust Score всех активных объектов с учётом их критичности.
 * (Trust_Score_Model_v2.md §6)
 */
export function calcOrgIndex(
  objects: ReadonlyArray<{ trust_score: number; criticality: string }>,
): { trust_score: number; trust_level: string } {
  if (objects.length === 0) {
    return { trust_score: NEUTRAL_FACTOR_SCORE, trust_level: scoreToLevel(NEUTRAL_FACTOR_SCORE) };
  }

  let weightedSum  = 0;
  let totalWeight  = 0;

  for (const obj of objects) {
    const w = CRITICALITY_WEIGHT[obj.criticality] ?? 1;
    weightedSum += obj.trust_score * w;
    totalWeight += w;
  }

  const trust_score = Math.round(weightedSum / totalWeight);
  return { trust_score, trust_level: scoreToLevel(trust_score) };
}
