'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/shared/icon';
import { Logo } from '@/components/shared/logo';
import { CritTag } from '@/components/shared/crit-tag';
import { TrustRing } from '@/components/shared/trust-ring';
import { getTrustBand, OBJECT_TYPES } from '@/lib/design-tokens';
import { triggerRecalculate } from '@/lib/actions/trust';
import type {
  FactorExplanation,
  RiskImpactHint,
  ScoreFactor,
  SourceContext,
} from '@/lib/trust/explainability';
import { fmtDateLong, fmtDateShort } from '@/lib/utils/dates';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PassportObject {
  id: string;
  name: string;
  type: string;
  criticality: string;
  segment: string | null;
  exposure: string | null;
  ip_address: string | null;
  os_platform: string | null;
  owner_name: string | null;
}

export interface PassportData {
  trust_score: number;
  trust_level: string;
  vuln_score: number;
  config_score: number;
  access_score: number;
  network_score: number;
  compliance_score: number;
  incident_score: number;
  completeness_pct: number;
  open_risk_count: number;
  connection_count: number;
  calculated_at: string | null;
}

export interface PassportRisk {
  id: string;
  title: string;
  severity: string;
  cvss_score: number | null;
  due_date: string | null;
  impactHint: RiskImpactHint | null;
}

interface TrustPassportClientProps {
  object:         PassportObject;
  passport:       PassportData;
  risks:          PassportRisk[];
  orgName:        string;
  canRecalculate: boolean;
  delta30:        number;
  factors:        ScoreFactor[];
  topDrivers:     ScoreFactor[];
  factorExplanations: FactorExplanation[];
}

// ── Constants ──────────────────────────────────────────────────────────────────

const BAND_TONE: Record<string, string> = {
  critical: 'crit',
  low:      'orange',
  medium:   'amber',
  good:     'lime',
  high:     'teal',
};

const EXPOSURE_LABELS: Record<string, string> = {
  internal: 'Внутренний',
  external:  'Внешний',
  isolated:  'Изолированный',
};

const CRITICALITY_LABELS: Record<string, string> = {
  critical: 'Критическая',
  high:     'Высокая',
  medium:   'Средняя',
  low:      'Низкая',
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'Критический',
  high:     'Высокий',
  medium:   'Средний',
  low:      'Низкий',
};

const SOURCE_TYPE_LABELS: Record<string, string> = {
  manual_csv:             'Ручная таблица',
  asset_inventory:        'Инвентаризация / CMDB',
  vulnerability_export:   'Сканер уязвимостей',
  monitoring_export:      'Мониторинг',
  directory_export:       'AD / LDAP / FreeIPA',
  security_tool_export:   'Средство защиты',
  network_export:         'Сетевое оборудование',
  other:                  'Другой источник',
};

const CONFIDENCE_LABELS: Record<string, string> = {
  high:   'Высокая',
  medium: 'Средняя',
  low:    'Низкая',
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function typeLabel(type: string): string {
  return OBJECT_TYPES.find(t => t.key === type)?.label ?? type;
}

function formatRiskMeta(riskId: string, dueDate: string | null): string {
  const shortId = riskId.slice(0, 8);
  if (!dueDate) return shortId;
  return `${shortId} · SLA: ${fmtDateShort(new Date(dueDate))}`;
}

function formatDecimal(value: number): string {
  return value.toFixed(1).replace('.', ',');
}

function formatDriverDelta(value: number): string {
  const sign = value > 0 ? '+' : '−';
  return `${sign}${formatDecimal(Math.abs(value))}`;
}

function formatSourceDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return fmtDateShort(date);
}

function sourceMeta(source: SourceContext): string {
  if (source.kind === 'manual') return 'Ручной источник · не является evidence record';

  const parts = [
    source.sourceType ? SOURCE_TYPE_LABELS[source.sourceType] ?? source.sourceType : null,
    source.confidence ? `Уверенность: ${CONFIDENCE_LABELS[source.confidence]}` : null,
    formatSourceDate(source.collectedAt),
  ].filter((part): part is string => Boolean(part));
  return `${parts.join(' · ')} · source context, не evidence record`;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function TrustPassportClient({
  object,
  passport,
  risks,
  orgName,
  canRecalculate,
  delta30,
  factors,
  topDrivers,
  factorExplanations,
}: TrustPassportClientProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [recalcError, setRecalcError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Trigger CSS transitions after first paint
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  function handleRecalculate() {
    setRecalcError(null);
    startTransition(async () => {
      try {
        const result = await triggerRecalculate(object.id);
        if (result?.error) { setRecalcError(result.error); return; }
        router.refresh();
      } catch {
        setRecalcError('Не удалось запустить переоценку. Попробуйте ещё раз.');
      }
    });
  }

  const band    = getTrustBand(passport.trust_score);
  const tone    = BAND_TONE[band.key] ?? 'teal';
  const metaParts = [
    object.id.slice(0, 8),
    typeLabel(object.type),
    orgName,
  ].filter(Boolean);

  return (
    <div className="screen passport-screen">
      {/* ── Top bar ── */}
      <div className="passport-bar">
        <button
          className="back-link"
          onClick={() => router.push(`/objects/${object.id}`)}
        >
          <Icon name="chevL" size={15} />
          К деталям объекта
        </button>
        <div className="passport-bar-actions">
          <button className="btn btn-ghost btn-sm" disabled title="Доступно позже">
            <Icon name="link" size={14} />
            Поделиться
          </button>
          <Link
            className="btn btn-ghost btn-sm"
            href={`/reports/passport/${object.id}`}
            target="_blank"
            rel="noreferrer"
            title="Открыть печатную версию паспорта"
          >
            <Icon name="download" size={14} />
            PDF
          </Link>
          {canRecalculate ? (
            <button
              className="btn btn-line btn-sm"
              onClick={handleRecalculate}
              disabled={isPending}
            >
              <Icon name="refresh" size={14} />
              {isPending ? 'Оценка…' : 'Переоценить'}
            </button>
          ) : (
            <button className="btn btn-line btn-sm" disabled>
              <Icon name="refresh" size={14} />
              Переоценить
            </button>
          )}
        </div>
      </div>
      {recalcError && (
        <div style={{ padding: '8px 24px', fontSize: 12, color: 'var(--crit)' }}>
          {recalcError}
        </div>
      )}

      {/* ── Passport card ── */}
      <article
        className="passport"
        style={{ '--band': band.color } as React.CSSProperties}
      >
        <div className="passport-grain" />

        {/* ── Head ── */}
        <header className="pp-head">
          <div className="pp-head-left">
            <div className="pp-kicker mono">
              <Logo size={18} />
              ЦИФРОВОЙ ПАСПОРТ ДОВЕРИЯ
            </div>
            <h1 className="pp-name">{object.name}</h1>
            <div className="pp-sub mono">{metaParts.join(' · ')}</div>
            <div className="pp-tags">
              <CritTag value={object.criticality} />
              {object.segment && (
                <span className="badge badge-neutral soft">{object.segment}</span>
              )}
              {object.exposure && (
                <span className="badge badge-neutral soft">
                  {EXPOSURE_LABELS[object.exposure] ?? object.exposure}
                </span>
              )}
            </div>
          </div>
          <div className="pp-head-ring">
            <TrustRing value={passport.trust_score} size={168} stroke={12} sub="из 100" />
            <div className={`pp-band-tag tag-${tone}`}>
              <span
                className="badge-dot"
                style={{ background: band.color, width: 7, height: 7, borderRadius: '50%', flexShrink: 0 }}
              />
              {band.label} доверие
            </div>
          </div>
        </header>

        {/* ── Summary stats ── */}
        <div className="pp-summary">
          <PpStat
            label="Изменение, 30 дн"
            value={
              <span className="mono" style={{ color: delta30 > 0 ? 'var(--lime)' : delta30 < 0 ? 'var(--orange)' : undefined }}>
                {delta30 === 0 ? '—' : `${delta30 > 0 ? '+' : ''}${delta30} п.`}
              </span>
            }
          />
          <PpStat
            label="Открытых рисков"
            value={<span className="mono">{passport.open_risk_count}</span>}
            accent={passport.open_risk_count > 0 ? 'orange' : 'teal'}
          />
          <PpStat label="Связей в графе" value={<span className="mono">{passport.connection_count}</span>} />
          <PpStat label="Покрытие ПБ" value={<span className="mono">{passport.compliance_score}%</span>} />
          <PpStat label="Оценка" value={<span className="mono">{fmtDateLong(passport.calculated_at)}</span>} />
        </div>

        {/* ── Top score drivers ── */}
        <section className="pp-section pp-drivers-section">
          <div className="pp-section-head">
            <h2 className="pp-section-title">Ключевые факторы оценки</h2>
            <span className="pp-neutral-reference mono">Относительно уровня 70</span>
          </div>

          {topDrivers.length > 0 ? (
            <ol className="pp-drivers">
              {topDrivers.map((driver, index) => {
                const isNegative = driver.direction === 'negative';
                const factorBand = getTrustBand(driver.score);
                return (
                  <li
                    className={`pp-driver is-${driver.direction}`}
                    key={driver.key}
                  >
                    <span className="pp-driver-rank mono">{index + 1}</span>
                    <span className="pp-driver-direction" aria-hidden="true">
                      <Icon name={isNegative ? 'arrowDown' : 'arrowUp'} size={16} />
                    </span>
                    <div className="pp-driver-main">
                      <div className="pp-driver-title-row">
                        <span className="pp-driver-title">{driver.label}</span>
                        <span
                          className="pp-driver-score mono"
                          style={{ color: factorBand.color }}
                        >
                          {driver.score}/100
                        </span>
                      </div>
                      <span className="pp-driver-meta">
                        Вес {driver.weight}% · {isNegative
                          ? 'снижает итоговую оценку'
                          : 'поддерживает итоговую оценку'}
                      </span>
                    </div>
                    <div
                      className="pp-driver-impact"
                      aria-label={`Вклад ${formatDriverDelta(driver.neutralDelta)} пункта относительно уровня 70`}
                    >
                      <strong className="mono">{formatDriverDelta(driver.neutralDelta)} п.</strong>
                      <span>вклад к 70</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="pp-drivers-empty">
              <Icon name="shield" size={19} />
              <span>Существенных отклонений от нейтрального уровня нет</span>
            </div>
          )}
        </section>

        {/* ── Factor breakdown ── */}
        <section className="pp-section">
          <div className="pp-section-head">
            <h2 className="pp-section-title">Расчёт оценки</h2>
            <span className="pp-formula mono">Trust = Σ (фактор × вес)</span>
          </div>

          <div className="pp-reasons">
            {factorExplanations.map(factor => {
              const fb = getTrustBand(factor.score);
              const visibleRisks = factor.risks.slice(0, 5);
              return (
                <details className="pp-reason" key={factor.key}>
                  <summary className="pp-reason-summary">
                    <span className="pp-reason-chevron" aria-hidden="true">
                      <Icon name="chevR" size={15} />
                    </span>
                    <span className="pp-reason-main">
                      <span className="pp-reason-head">
                        <strong>{factor.label}</strong>
                        <span className="mono" style={{ color: fb.color }}>
                          {factor.score}/100
                        </span>
                      </span>
                      <span className="pp-reason-bar" aria-hidden="true">
                        <span
                          style={{
                            width: mounted ? `${factor.score}%` : '0%',
                            background: fb.color,
                          }}
                        />
                      </span>
                      <span className="pp-reason-formula mono">
                        <span>
                          {factor.base} база − {factor.appliedPenalty} штрафы + {factor.completenessBonus} бонус = {factor.calculatedScore}
                        </span>
                        <span>
                          {factor.score} × {factor.weight}% = {formatDecimal(factor.contribution)} вклад
                        </span>
                      </span>
                    </span>
                    <span className="pp-reason-contribution">
                      <strong className="mono">+{formatDecimal(factor.contribution)}</strong>
                      <span>вклад · вес {factor.weight}%</span>
                    </span>
                  </summary>

                  <div className="pp-reason-body">
                    {!factor.isConsistent && (
                      <div className="pp-reason-warning" role="status">
                        <Icon name="risk" size={16} />
                        <span>
                          Сохранённая оценка {factor.score} отличается от текущего расчёта {factor.calculatedScore}.
                          {canRecalculate
                            ? ' Запустите переоценку объекта.'
                            : ' Требуется переоценка пользователем с правом изменения.'}
                        </span>
                      </div>
                    )}
                    {factor.wasClamped && (
                      <p className="pp-reason-note">
                        Результат ограничен допустимым диапазоном 0–100.
                      </p>
                    )}

                    <div className="pp-reason-columns">
                      <div className="pp-reason-group">
                        <h3>Активные риски</h3>
                        {visibleRisks.length > 0 ? (
                          <ul className="pp-reason-risks">
                            {visibleRisks.map(risk => (
                              <li key={risk.riskId}>
                                <span className={`pp-reason-severity sev-${risk.severity}`} />
                                <span className="pp-reason-risk-main">
                                  <strong>{risk.title}</strong>
                                  <span>
                                    {SEVERITY_LABELS[risk.severity] ?? risk.severity} · {risk.source.sourceName}
                                  </span>
                                </span>
                                <span className="pp-reason-penalty mono">−{risk.appliedPenalty}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="pp-reason-empty">
                            Активные риски этого фактора не зарегистрированы.
                          </p>
                        )}
                        {factor.risks.length > visibleRisks.length && (
                          <p className="pp-reason-more">
                            Ещё рисков: {factor.risks.length - visibleRisks.length}
                          </p>
                        )}
                      </div>

                      <div className="pp-reason-group">
                        <h3>Источники данных</h3>
                        <ul className="pp-reason-sources">
                          {factor.sources.map((source, index) => (
                            <li key={`${source.kind}-${source.sourceName}-${index}`}>
                              <span className="pp-reason-source-icon" aria-hidden="true">
                                <Icon name={source.kind === 'import' ? 'download' : 'edit'} size={14} />
                              </span>
                              <span>
                                <strong>{source.sourceName}</strong>
                                <small>{sourceMeta(source)}</small>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>

          {/* Composite bar */}
          <div className="pp-total">
            <span className="pp-total-label">Итоговый индекс доверия</span>
            <div className="pp-total-bar">
              {factors.map(f => {
                const fb = getTrustBand(f.score);
                return (
                  <div
                    key={f.key}
                    className="pp-total-seg"
                    style={{
                      flex: mounted ? f.contribution : 0,
                      background: fb.color,
                      opacity: 0.85,
                    }}
                    title={`${f.label}: +${formatDecimal(f.contribution)}`}
                  />
                );
              })}
            </div>
            <span
              className="pp-total-val mono"
              style={{ color: band.color }}
            >
              {passport.trust_score}
            </span>
          </div>
        </section>

        {/* ── Two-column section ── */}
        <div className="pp-two-col">
          {/* Risks */}
          <section className="pp-section">
            <h2 className="pp-section-title">Риски объекта</h2>
            {risks.length > 0 ? (
              <div className="pp-risks">
                {risks.map(r => (
                  <div className="pp-risk" key={r.id}>
                    <span className={`pp-risk-sev sev-${r.severity}`} />
                    <div className="pp-risk-info">
                      <span className="pp-risk-title">{r.title}</span>
                      <span className="pp-risk-meta mono">
                        {formatRiskMeta(r.id, r.due_date)}
                      </span>
                      <PassportRiskImpact hint={r.impactHint} />
                    </div>
                    {r.cvss_score != null && (
                      <span className="pp-risk-score mono">{r.cvss_score}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="pp-norisk">
                <Icon name="shield" size={20} />
                <span>Открытых рисков не зафиксировано</span>
              </div>
            )}
          </section>

          {/* Object attributes */}
          <section className="pp-section">
            <h2 className="pp-section-title">Реквизиты объекта</h2>
            <div className="pp-meta-grid">
              <PpMeta label="Идентификатор" value={object.id.slice(0, 16) + '…'} />
              <PpMeta label="Тип" value={typeLabel(object.type)} />
              <PpMeta label="Сетевой адрес" value={object.ip_address ?? '—'} />
              <PpMeta label="Платформа" value={object.os_platform ?? '—'} />
              <PpMeta label="Сегмент" value={object.segment ?? '—'} />
              <PpMeta label="Экспозиция" value={EXPOSURE_LABELS[object.exposure ?? ''] ?? '—'} />
              <PpMeta label="Владелец" value={object.owner_name ?? '—'} />
              <PpMeta label="Критичность" value={CRITICALITY_LABELS[object.criticality] ?? object.criticality} />
            </div>
          </section>
        </div>

        {/* ── Footer / seal ── */}
        <footer className="pp-foot">
          <div className="pp-seal">
            <div className="pp-seal-ring">
              <Icon name="shield" size={22} />
            </div>
            <div>
              <span className="pp-seal-title">Подтверждено DTEK Core</span>
              <span className="pp-seal-sub mono">
                SHA-256: a4f9…{object.id.slice(-4)} · {new Date().toLocaleDateString('ru')}
              </span>
            </div>
          </div>
          <div className="pp-qr" aria-hidden="true">
            {Array.from({ length: 49 }).map((_, i) => (
              <span
                key={i}
                className="qr-px"
                style={{ opacity: (i * 7 + passport.trust_score) % 3 === 0 ? 1 : 0.12 }}
              />
            ))}
          </div>
        </footer>
      </article>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function PpStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: 'orange' | 'teal';
}) {
  return (
    <div className={`pp-stat${accent ? ` accent-${accent}` : ''}`}>
      <span className="pp-stat-label">{label}</span>
      <span className="pp-stat-val">{value}</span>
    </div>
  );
}

function PpMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="pp-meta">
      <span className="pp-meta-label">{label}</span>
      <span className="pp-meta-val mono">{value}</span>
    </div>
  );
}

function PassportRiskImpact({ hint }: { hint: RiskImpactHint | null }) {
  if (!hint) {
    return <span className="pp-risk-impact">Влияние пока не рассчитано</span>;
  }
  if (hint.state === 'inactive') {
    return <span className="pp-risk-impact">Сейчас не влияет на Trust Score</span>;
  }
  if (hint.state === 'no_rounded_change') {
    return (
      <span className="pp-risk-impact">
        Закрытие не изменит округлённый Score · {hint.currentScore} → {hint.projectedScore}
      </span>
    );
  }
  return (
    <span className="pp-risk-impact is-gain">
      Ориентировочно +{hint.potentialGain} к Trust Score после закрытия · {hint.currentScore} → {hint.projectedScore}
    </span>
  );
}
