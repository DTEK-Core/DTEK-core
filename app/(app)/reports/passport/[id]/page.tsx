import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { getTrustBand, OBJECT_TYPES } from '@/lib/design-tokens';
import { fmtDateLong, fmtDateShort } from '@/lib/utils/dates';
import { getPassportReportData } from '@/lib/reports/passport-report';
import { Logo } from '@/components/shared/logo';
import { PassportReportActions } from '@/components/shared/reports/report-actions';
import type { RiskImpactHint, SourceContext } from '@/lib/trust/explainability';
import '@/app/report.css';

export const metadata: Metadata = {
  title: 'Trust Passport PDF — DTEK Core',
  robots: { index: false, follow: false },
};

const EXPOSURE_LABELS: Record<string, string> = {
  internal: 'Внутренний',
  external: 'Внешний',
  isolated: 'Изолированный',
};

const CRITICALITY_LABELS: Record<string, string> = {
  critical: 'Критическая',
  high: 'Высокая',
  medium: 'Средняя',
  low: 'Низкая',
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'Критический',
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
};

function typeLabel(type: string): string {
  return OBJECT_TYPES.find((item) => item.key === type)?.label ?? type;
}

function formatGeneratedAt(iso: string): string {
  const date = new Date(iso);
  return `${fmtDateLong(iso)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function riskImpactCopy(hint: RiskImpactHint | null): string {
  if (!hint) return 'Влияние на Trust Score не рассчитано';
  if (hint.state === 'inactive') return 'Риск сейчас не влияет на Trust Score';
  if (hint.state === 'no_rounded_change') {
    return `Закрытие не изменит округлённый Score (${hint.currentScore} → ${hint.projectedScore})`;
  }
  return `Ориентировочно +${hint.potentialGain} после закрытия (${hint.currentScore} → ${hint.projectedScore})`;
}

function signedDelta(value: number): string {
  return `${value > 0 ? '+' : ''}${value}`;
}

function sourceContextCopy(source: SourceContext): string {
  const parts = [source.kind === 'import' ? 'Импорт' : 'Ручной ввод'];
  if (source.collectedAt) parts.push(fmtDateLong(source.collectedAt));
  if (source.confidence) parts.push(`confidence: ${source.confidence}`);
  return parts.join(' · ');
}

export default async function PassportReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getPassportReportData(id);
  const band = getTrustBand(report.passport.trust_score);
  const latestDelta = report.scoreTimeline[0] ?? null;

  return (
    <main className="report-shell">
      <PassportReportActions objectId={report.object.id} />

      <article className="passport-report" style={{ '--report-band': band.color } as CSSProperties}>
        <header className="report-header">
          <div>
            <div className="report-kicker">
              <Logo size={20} />
              DTEK Core · Trust Passport
            </div>
            <h1>{report.object.name}</h1>
            <p>
              {report.orgName || 'Организация'} · {typeLabel(report.object.type)} · ID {report.object.id.slice(0, 8)}
            </p>
          </div>
          <div className="report-score">
            <span className="report-score-value">{report.passport.trust_score}</span>
            <span className="report-score-label">{band.label} доверие</span>
          </div>
        </header>

        <section className="report-summary-grid">
          <ReportStat label="Дата отчёта" value={formatGeneratedAt(report.generatedAt)} />
          <ReportStat label="Расчёт Trust Score" value={fmtDateLong(report.passport.calculated_at)} />
          <ReportStat
            label="Изменение за 30 дней"
            value={report.delta30 === 0 ? '—' : `${report.delta30 > 0 ? '+' : ''}${report.delta30} п.`}
          />
          <ReportStat label="Открытых рисков" value={String(report.passport.open_risk_count)} />
          <ReportStat label="Связей в графе" value={String(report.passport.connection_count)} />
          <ReportStat label="Compliance factor" value={`${report.passport.compliance_score}/100`} />
        </section>

        <section className="report-section">
          <div className="report-section-head">
            <h2>Факторная оценка</h2>
            <span>Trust = Σ (фактор × вес)</span>
          </div>
          <div className="report-factor-grid">
            {report.factors.map((factor) => {
              const factorBand = getTrustBand(factor.score);
              return (
                <div className="report-factor" key={factor.key}>
                  <div className="report-factor-top">
                    <strong>{factor.label}</strong>
                    <span>{factor.score}/100</span>
                  </div>
                  <div className="report-factor-bar">
                    <span
                      style={{
                        width: `${factor.score}%`,
                        background: factorBand.color,
                      }}
                    />
                  </div>
                  <div className="report-factor-foot">
                    <span>Вес {factor.weight}%</span>
                    <span>Вклад +{factor.contribution}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="report-section">
          <div className="report-section-head">
            <h2>Объяснение изменения Score</h2>
            <span>История расчётов и текущий source context</span>
          </div>
          {!latestDelta ? (
            <p className="report-empty">
              История изменений пока пуста. Объяснение появится после первого изменения Trust Score.
            </p>
          ) : (
            <div className="report-delta-grid">
              <div className="report-delta-block">
                <div className="report-delta-score">
                  <div>
                    <span>{latestDelta.reasonLabel}</span>
                    <strong>
                      {latestDelta.oldScore === null
                        ? `Первая зафиксированная оценка: ${latestDelta.newScore}`
                        : `${latestDelta.oldScore} → ${latestDelta.newScore}`}
                    </strong>
                    <small>{fmtDateLong(latestDelta.createdAt)} · {latestDelta.actorLabel}</small>
                  </div>
                  <b>
                    {latestDelta.delta === null
                      ? latestDelta.newScore
                      : signedDelta(latestDelta.delta)}
                  </b>
                </div>
                <h3>Изменение факторов</h3>
                {!latestDelta.factorComparisonAvailable ? (
                  <p className="report-delta-limit">
                    Предыдущий factor snapshot недоступен, поэтому детализация факторов ограничена.
                  </p>
                ) : latestDelta.factorDeltas.length === 0 ? (
                  <p className="report-delta-limit">
                    Факторные оценки не изменились. Исторические веса не сохранены и не детализируются.
                  </p>
                ) : (
                  <ul className="report-factor-deltas">
                    {latestDelta.factorDeltas.map((factor) => (
                      <li key={factor.key}>
                        <span>{factor.label}</span>
                        <span>{factor.previousScore} → {factor.currentScore}</span>
                        <strong>{signedDelta(factor.delta)}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="report-delta-block">
                <h3>Контекст источников</h3>
                <p className="report-delta-limit">
                  Это текущие источники данных. Даты сбора не являются доказанной причиной конкретного изменения Score.
                </p>
                <ol className="report-source-timeline">
                  {report.sourceTimeline.map((source, index) => (
                    <li key={`${source.kind}-${source.sourceName}-${index}`}>
                      <span />
                      <div>
                        <strong>{source.sourceName}</strong>
                        <small>{sourceContextCopy(source)}</small>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </section>

        <section className="report-two-col">
          <div className="report-section compact">
            <h2>Реквизиты объекта</h2>
            <ReportField label="Полный ID" value={report.object.id} />
            <ReportField label="Тип" value={typeLabel(report.object.type)} />
            <ReportField label="Критичность" value={CRITICALITY_LABELS[report.object.criticality] ?? report.object.criticality} />
            <ReportField label="Владелец" value={report.object.owner_name ?? '—'} />
            <ReportField label="Сетевой адрес" value={report.object.ip_address ?? '—'} />
            <ReportField label="Платформа" value={report.object.os_platform ?? '—'} />
            <ReportField label="Сегмент" value={report.object.segment ?? '—'} />
            <ReportField label="Экспозиция" value={EXPOSURE_LABELS[report.object.exposure ?? ''] ?? '—'} />
          </div>

          <div className="report-section compact">
            <h2>Риски объекта</h2>
            {report.risks.length > 0 ? (
              <div className="report-risk-list">
                {report.risks.map((risk) => (
                  <div className="report-risk" key={risk.id}>
                    <div>
                      <strong>{risk.title}</strong>
                      <span>ID {risk.id.slice(0, 8)}{risk.due_date ? ` · SLA ${fmtDateShort(new Date(risk.due_date))}` : ''}</span>
                      <span className={`report-risk-impact${risk.impactHint?.state === 'potential_gain' ? ' is-gain' : ''}`}>
                        {riskImpactCopy(risk.impactHint)}
                      </span>
                    </div>
                    <em>{SEVERITY_LABELS[risk.severity] ?? risk.severity}</em>
                    {risk.cvss_score != null && <b>{risk.cvss_score}</b>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="report-empty">Открытых связанных рисков не зафиксировано.</p>
            )}
          </div>
        </section>

        <section className="report-section">
          <div className="report-section-head">
            <h2>Source / Evidence Coverage</h2>
            <span>ADR-007 compatible</span>
          </div>
          <div className="report-source-grid">
            {report.sourceCoverage.map((source) => (
              <div className="report-source" key={source.source}>
                <strong>{source.source}</strong>
                <span>{source.status}</span>
                <p>{source.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="report-footer">
          <span>DTEK Core · Evidence-first Trust Intelligence Platform</span>
          <span>SHA-256: a4f9…{report.object.id.slice(-4)}</span>
        </footer>
      </article>
    </main>
  );
}

function ReportStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="report-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ReportField({ label, value }: { label: string; value: string }) {
  return (
    <div className="report-field">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
