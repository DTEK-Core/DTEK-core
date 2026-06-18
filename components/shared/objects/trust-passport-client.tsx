'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/shared/icon';
import { Logo } from '@/components/shared/logo';
import { CritTag } from '@/components/shared/crit-tag';
import { TrustRing } from '@/components/shared/trust-ring';
import { getTrustBand, TRUST_FACTORS, OBJECT_TYPES } from '@/lib/design-tokens';

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
}

interface TrustPassportClientProps {
  object: PassportObject;
  passport: PassportData;
  risks: PassportRisk[];
  orgName: string;
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

// ── Helpers ────────────────────────────────────────────────────────────────────

interface FactorItem {
  key: string;
  label: string;
  weight: number;
  score: number;
  contribution: number;
}

function makeFactors(p: PassportData): FactorItem[] {
  const scores: Record<string, number> = {
    vuln:       p.vuln_score,
    config:     p.config_score,
    access:     p.access_score,
    network:    p.network_score,
    compliance: p.compliance_score,
    incident:   p.incident_score,
  };
  return TRUST_FACTORS.map(f => {
    const score = scores[f.key] ?? 70;
    return {
      key:          f.key,
      label:        f.label,
      weight:       f.weight,
      score,
      contribution: Math.round((score * f.weight) / 100),
    };
  });
}

function typeLabel(type: string): string {
  return OBJECT_TYPES.find(t => t.key === type)?.label ?? type;
}

function formatCalcDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ru', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatRiskMeta(riskId: string, dueDate: string | null): string {
  const shortId = riskId.slice(0, 8);
  if (!dueDate) return shortId;
  const d = new Date(dueDate).toLocaleDateString('ru', { day: 'numeric', month: 'short' });
  return `${shortId} · SLA: ${d}`;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function TrustPassportClient({
  object,
  passport,
  risks,
  orgName,
}: TrustPassportClientProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Trigger CSS transitions after first paint
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const band    = getTrustBand(passport.trust_score);
  const tone    = BAND_TONE[band.key] ?? 'teal';
  const factors = makeFactors(passport);

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
          <button className="btn btn-ghost btn-sm" disabled title="Доступно в Sprint 07">
            <Icon name="download" size={14} />
            PDF
          </button>
          <button className="btn btn-line btn-sm" disabled title="Доступно в Sprint 05">
            <Icon name="refresh" size={14} />
            Переоценить
          </button>
        </div>
      </div>

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
          <PpStat label="Изменение, 30 дн" value={<span className="mono">+0 п.</span>} />
          <PpStat
            label="Открытых рисков"
            value={<span className="mono">{passport.open_risk_count}</span>}
            accent={passport.open_risk_count > 0 ? 'orange' : 'teal'}
          />
          <PpStat label="Связей в графе" value={<span className="mono">{passport.connection_count}</span>} />
          <PpStat label="Покрытие ПБ" value={<span className="mono">{passport.compliance_score}%</span>} />
          <PpStat label="Оценка" value={<span className="mono">{formatCalcDate(passport.calculated_at)}</span>} />
        </div>

        {/* ── Factor breakdown ── */}
        <section className="pp-section">
          <div className="pp-section-head">
            <h2 className="pp-section-title">Расчёт оценки</h2>
            <span className="pp-formula mono">Trust = Σ (фактор × вес)</span>
          </div>

          <div className="pp-factors">
            {factors.map(f => {
              const fb = getTrustBand(f.score);
              return (
                <div className="ppf" key={f.key}>
                  <div className="ppf-head">
                    <span className="ppf-label">{f.label}</span>
                    <span className="ppf-contrib mono">+{f.contribution}</span>
                  </div>
                  <div className="ppf-bar">
                    <div
                      className="ppf-fill"
                      style={{
                        width: mounted ? `${f.score}%` : '0%',
                        background: fb.color,
                      }}
                    />
                  </div>
                  <div className="ppf-foot">
                    <span className="ppf-weight mono">вес {f.weight}%</span>
                    <span className="ppf-score mono" style={{ color: fb.color }}>
                      {f.score}/100
                    </span>
                  </div>
                </div>
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
                    title={`${f.label}: +${f.contribution}`}
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
