import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { getTrustBand, OBJECT_TYPES, SEVERITY_LEVELS, CRITICALITY_LEVELS } from '@/lib/design-tokens';
import { fmtDateLong, fmtDateShort } from '@/lib/utils/dates';
import { createSecurityEvent } from '@/lib/security/audit';
import { getExecutiveReportData } from '@/lib/reports/executive-report';
import { Logo } from '@/components/shared/logo';
import { ExecutiveReportActions } from '@/components/shared/reports/report-actions';
import { ReportState } from '@/components/shared/reports/report-state';
import '@/app/report.css';

export const metadata: Metadata = {
  title: 'Executive Organization Report — DTEK Core',
  robots: { index: false, follow: false },
};

const RISK_STATUS_LABELS: Record<string, string> = {
  open:        'Открыт',
  in_progress: 'В работе',
  accepted:    'Принят',
  mitigated:   'Устранён',
  closed:      'Закрыт',
};

function typeLabel(type: string): string {
  return OBJECT_TYPES.find((item) => item.key === type)?.label ?? type;
}

function severityLabel(severity: string): string {
  return SEVERITY_LEVELS.find((item) => item.key === severity)?.label ?? severity;
}

function criticalityLabel(criticality: string): string {
  return CRITICALITY_LEVELS.find((item) => item.key === criticality)?.label ?? criticality;
}

function formatGeneratedAt(iso: string): string {
  const date = new Date(iso);
  return `${fmtDateLong(iso)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default async function ExecutiveReportPage() {
  const report = await getExecutiveReportData();
  const band = getTrustBand(report.org.trustScore);
  const orgName = report.org.shortName ?? report.org.name;

  await createSecurityEvent({
    organizationId: report.org.id,
    actorId: report.userId,
    actorEmail: report.userEmail,
    eventType: 'report.executive_opened',
    targetType: 'organization',
    targetId: report.org.id,
    metadata: {
      reportType: 'executive',
      format: 'print_html',
      trustScore: report.org.trustScore,
      objectCount: report.kpi.activeObjects,
      riskCount: report.kpi.activeRisks,
    },
  });

  return (
    <main className="report-shell">
      <ExecutiveReportActions />

      <article className="passport-report executive-report" style={{ '--report-band': band.color } as CSSProperties}>
        <header className="report-header executive-report-header">
          <div>
            <div className="report-kicker">
              <Logo size={20} />
              DTEK Core · Executive Organization Report
            </div>
            <h1>{orgName}</h1>
            <p>
              Управленческая сводка доверия · {report.org.industry ?? 'отрасль не указана'}
              {report.org.size ? ` · ${report.org.size}` : ''}
            </p>
          </div>
          <div className="report-score">
            <span className="report-score-value">{report.org.trustScore}</span>
            <span className="report-score-label">{band.label} доверие</span>
          </div>
        </header>

        <section className="report-summary-grid executive-kpi-grid">
          <ReportStat label="Дата отчёта" value={formatGeneratedAt(report.generatedAt)} />
          <ReportStat label="Активных объектов" value={String(report.kpi.activeObjects)} />
          <ReportStat label="Открытых рисков" value={String(report.kpi.activeRisks)} />
          <ReportStat label="Критических рисков" value={String(report.kpi.criticalRisks)} />
          <ReportStat label="Просроченных SLA" value={String(report.kpi.overdueRisks)} />
          <ReportStat label="Полнота паспортов" value={`${report.kpi.passportCompleteness}%`} />
        </section>

        <section className="report-section">
          <div className="report-section-head">
            <h2>Executive Summary</h2>
            <span>Market MVP report</span>
          </div>
          <div className="executive-summary">
            {report.summary.map((item) => (
              <div className="executive-summary-item" key={item}>
                <span />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </section>

        {report.kpi.activeObjects === 0 ? (
          <section className="report-section">
            <ReportState
              icon="objects"
              title="Цифровая модель пока пуста"
              description="Executive Report будет показывать распределение доверия, факторный профиль и рисковые объекты после добавления активов в организацию."
              primaryHref="/objects"
              primaryLabel="К объектам"
              secondaryHref="/dashboard"
              secondaryLabel="К Dashboard"
            />
          </section>
        ) : (
          <>
            <section className="report-two-col executive-two-col">
              <div className="report-section compact">
                <h2>Распределение доверия</h2>
                <div className="executive-distribution">
                  {report.distribution.map((item) => {
                    const percent = Math.round((item.count / report.kpi.activeObjects) * 100);
                    return (
                      <div className="executive-bar-row" key={item.key}>
                        <div className="executive-bar-top">
                          <strong>{item.label}</strong>
                          <span>{item.count} · {percent}%</span>
                        </div>
                        <div className="executive-bar">
                          <span style={{ width: `${percent}%`, background: item.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="report-section compact">
                <h2>Факторный профиль</h2>
                <div className="executive-factor-list">
                  {report.factorAverages.map((factor) => {
                    const factorBand = getTrustBand(factor.score);
                    return (
                      <div className="report-factor" key={factor.key}>
                        <div className="report-factor-top">
                          <strong>{factor.label}</strong>
                          <span>{factor.score}/100</span>
                        </div>
                        <div className="report-factor-bar">
                          <span style={{ width: `${factor.score}%`, background: factorBand.color }} />
                        </div>
                        <div className="report-factor-foot">
                          <span>Вес {factor.weight}%</span>
                          <span>{factorBand.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="report-section">
              <div className="report-section-head">
                <h2>Топ рисковых объектов</h2>
                <span>низкое доверие + открытые риски + критичность</span>
              </div>
              {report.topRiskyObjects.length > 0 ? (
                <div className="executive-table">
                  <div className="executive-table-head">
                    <span>Объект</span>
                    <span>Тип</span>
                    <span>Критичность</span>
                    <span>Риски</span>
                    <span>Trust</span>
                  </div>
                  {report.topRiskyObjects.map((object) => {
                    const objectBand = getTrustBand(object.trustScore);
                    return (
                      <div className="executive-table-row" key={object.id}>
                        <strong>{object.name}</strong>
                        <span>{typeLabel(object.type)}</span>
                        <span>{criticalityLabel(object.criticality)}</span>
                        <span>
                          {object.openRiskCount}
                          {object.criticalRiskCount > 0 ? ` / крит. ${object.criticalRiskCount}` : ''}
                        </span>
                        <b style={{ color: objectBand.color }}>{object.trustScore}</b>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="report-empty">Нет объектов с открытыми рисками или сниженным доверием.</p>
              )}
            </section>

            <section className="report-section">
              <div className="report-section-head">
                <h2>Критические риски</h2>
                <span>открытые и в работе</span>
              </div>
              {report.criticalRisks.length > 0 ? (
                <div className="report-risk-list">
                  {report.criticalRisks.map((risk) => (
                    <div className="report-risk executive-risk" key={risk.id}>
                      <div>
                        <strong>{risk.title}</strong>
                        <span>
                          ID {risk.id.slice(0, 8)}
                          {risk.dueDate ? ` · SLA ${fmtDateShort(new Date(risk.dueDate))}` : ''}
                          {risk.linkedObjects.length > 0 ? ` · ${risk.linkedObjects.map((object) => object.name).join(', ')}` : ''}
                        </span>
                      </div>
                      <em>{severityLabel(risk.severity)} · {RISK_STATUS_LABELS[risk.status] ?? risk.status}</em>
                      {risk.cvssScore != null && <b>{risk.cvssScore}</b>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="report-empty">Критических открытых рисков не обнаружено.</p>
              )}
            </section>
          </>
        )}

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
          <span>ORG {report.org.id.slice(0, 8)} · generated for {report.role}</span>
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
