/**
 * Trust Score Recalculation Engine
 * Server-only — imported only from Server Actions, never by client components.
 * Uses service_role (admin) client to bypass RLS for system writes.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { calcTrustScore, calcCompleteness, calcOrgIndex } from './calculate';
import type { ObjectForCalc, RiskForCalc, FactorWeights } from './calculate';

// ── Internal DB row shapes ─────────────────────────────────────────────────────

interface ObjRow extends ObjectForCalc {
  trust_score: number;
}

interface RiskLinkRow {
  risks: { category: string; severity: string; status: string } | null;
}

interface WeightsRow {
  vuln_weight:       number;
  config_weight:     number;
  access_weight:     number;
  network_weight:    number;
  compliance_weight: number;
  incident_weight:   number;
}

interface OrgObjectRow {
  trust_score: number;
  criticality: string;
}

// ── Defaults ───────────────────────────────────────────────────────────────────

const DEFAULT_WEIGHTS: FactorWeights = {
  vuln_weight:       22,
  config_weight:     18,
  access_weight:     18,
  network_weight:    14,
  compliance_weight: 16,
  incident_weight:   12,
};

// ── Options ────────────────────────────────────────────────────────────────────

export interface RecalcOptions {
  reason?:    string;
  changedBy?: string;
  skipOrgIndex?: boolean;
}

// ── Engine functions ───────────────────────────────────────────────────────────

/**
 * Рассчитывает Trust Score объекта и записывает результаты в БД:
 * — trust_passports (все 6 факторов, completeness_pct, open_risk_count)
 * — objects (trust_score, trust_level)
 * — trust_score_history (только если оценка изменилась)
 * — organizations (org-индекс)
 */
export async function recalculateObjectTrust(
  objectId: string,
  orgId:    string,
  options:  RecalcOptions = {},
): Promise<void> {
  const admin = createAdminClient();
  const { reason = 'recalculated', changedBy = 'system', skipOrgIndex = false } = options;

  // 1. Загрузить данные объекта
  const { data: objRaw } = await admin
    .from('objects')
    .select('criticality, name, type, description, ip_address, os_platform, segment, exposure, owner_id, trust_score')
    .eq('id', objectId)
    .eq('organization_id', orgId)
    .single();

  if (!objRaw) return;
  const obj = objRaw as unknown as ObjRow;
  const previousScore = obj.trust_score;

  // 2. Загрузить риски объекта через object_risks → risks
  const { data: riskLinksRaw } = await admin
    .from('object_risks')
    .select('risks(category, severity, status)')
    .eq('object_id', objectId);

  const riskLinks = (riskLinksRaw as unknown as RiskLinkRow[] | null) ?? [];
  const risks: RiskForCalc[] = riskLinks
    .map(l => l.risks)
    .filter((r): r is RiskForCalc => r !== null);

  // 3. Загрузить веса факторов организации
  const { data: weightsRaw } = await admin
    .from('trust_factor_config')
    .select('vuln_weight, config_weight, access_weight, network_weight, compliance_weight, incident_weight')
    .eq('organization_id', orgId)
    .single();

  const weights = (weightsRaw as unknown as WeightsRow | null) ?? DEFAULT_WEIGHTS;

  // 4. Рассчитать
  const result       = calcTrustScore(obj, risks, weights);
  const completeness = calcCompleteness(obj);
  const openRiskCount = risks.filter(
    r => r.status === 'open' || r.status === 'in_progress',
  ).length;
  const now = new Date().toISOString();

  // 5. Обновить trust_passports
  await admin
    .from('trust_passports')
    .update({
      trust_score:      result.trust_score,
      trust_level:      result.trust_level,
      vuln_score:       result.factors.vuln,
      config_score:     result.factors.config,
      access_score:     result.factors.access,
      network_score:    result.factors.network,
      compliance_score: result.factors.compliance,
      incident_score:   result.factors.incident,
      completeness_pct: completeness,
      open_risk_count:  openRiskCount,
      calculated_at:    now,
      updated_at:       now,
    } as never)
    .eq('object_id', objectId);

  // 6. Обновить objects.trust_score и trust_level
  await admin
    .from('objects')
    .update({
      trust_score: result.trust_score,
      trust_level: result.trust_level,
      updated_at:  now,
    } as never)
    .eq('id', objectId)
    .eq('organization_id', orgId);

  // 7. Записать в историю только если оценка изменилась
  if (result.trust_score !== previousScore) {
    await admin
      .from('trust_score_history')
      .insert({
        object_id:        objectId,
        organization_id:  orgId,
        old_score:        previousScore,
        new_score:        result.trust_score,
        factors_snapshot: result.factors,
        reason,
        changed_by:       changedBy,
      } as never);
  }

  // 8. Обновить org-индекс
  if (!skipOrgIndex) await recalculateOrgIndex(orgId);
}

/**
 * Пересчитывает организационный индекс доверия на основе всех активных объектов.
 */
export async function recalculateOrgIndex(orgId: string): Promise<void> {
  const admin = createAdminClient();

  const { data: objsRaw } = await admin
    .from('objects')
    .select('trust_score, criticality')
    .eq('organization_id', orgId)
    .neq('status', 'archived');

  const objs = (objsRaw as unknown as OrgObjectRow[] | null) ?? [];
  const { trust_score, trust_level } = calcOrgIndex(objs);

  await admin
    .from('organizations')
    .update({ trust_score, trust_level } as never)
    .eq('id', orgId);
}

/**
 * Пересчитывает Trust Score всех активных объектов организации.
 * Используется при изменении весов факторов в Конфигураторе (T007).
 */
export async function recalculateAllOrgObjects(
  orgId:   string,
  options: RecalcOptions = {},
): Promise<void> {
  const admin = createAdminClient();

  const { data: idsRaw } = await admin
    .from('objects')
    .select('id')
    .eq('organization_id', orgId)
    .neq('status', 'archived');

  const ids = (idsRaw as unknown as Array<{ id: string }> | null) ?? [];
  for (const { id } of ids) {
    await recalculateObjectTrust(id, orgId, options);
  }
}
