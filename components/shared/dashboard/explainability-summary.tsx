import Link from 'next/link';
import { Icon } from '@/components/shared/icon';
import type { DashboardExplainabilitySummary } from '@/lib/trust/explainability';

function objectCountLabel(value: number): string {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return 'объект';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'объекта';
  return 'объектов';
}

function signed(value: number): string {
  return `${value > 0 ? '+' : ''}${value}`;
}

export function DashboardExplainability({
  summary,
}: {
  summary: DashboardExplainabilitySummary;
}) {
  const hasCoverage = summary.analyzedObjects > 0;

  return (
    <section className="card dash-explainability-card">
      <div className="card-head">
        <div>
          <span className="card-title">Что снижает доверие</span>
          <span className="dash-explain-subtitle">
            Факторные отклонения объектов относительно нейтрального уровня 70
          </span>
        </div>
        <span className="dash-explain-coverage mono">
          Паспорта {summary.analyzedObjects}/{summary.totalObjects}
        </span>
      </div>

      <div className="card-body dash-explain-body">
        {!hasCoverage ? (
          <div className="dash-explain-empty">
            <Icon name="passport" size={20} />
            <div>
              <strong>Недостаточно данных для сводки</strong>
              <span>Факторные оценки появятся после расчёта Trust Passport.</span>
            </div>
          </div>
        ) : summary.drivers.length === 0 ? (
          <div className="dash-explain-empty is-positive">
            <Icon name="check" size={20} />
            <div>
              <strong>Материальных отрицательных факторов нет</strong>
              <span>Факторы не создают материального снижения относительно уровня 70.</span>
            </div>
          </div>
        ) : (
          <div className="dash-explain-list">
            {summary.drivers.map((driver, index) => (
              <div className="dash-explain-row" key={driver.key}>
                <span className="dash-explain-rank mono">{index + 1}</span>
                <div className="dash-explain-factor">
                  <div className="dash-explain-factor-title">
                    <strong>{driver.label}</strong>
                    <span>вес {driver.weight}%</span>
                  </div>
                  <div className="dash-explain-bar" aria-hidden="true">
                    <span style={{ width: `${driver.coveragePct}%` }} />
                  </div>
                  <span className="dash-explain-reach">
                    {driver.affectedObjects} {objectCountLabel(driver.affectedObjects)} с фактором ниже 70 · {driver.coveragePct}% паспортов
                  </span>
                </div>
                <div className="dash-explain-metric">
                  <strong className="mono">{signed(driver.averageNeutralDelta)}</strong>
                  <span>
                    среди затронутых · фактор {driver.averageFactorScore}/100
                  </span>
                </div>
                <Link
                  href={`/objects/${driver.leadingObject.id}/passport`}
                  className="dash-explain-object"
                  title={`Открыть Trust Passport: ${driver.leadingObject.name}`}
                >
                  <span>Наибольшее влияние</span>
                  <strong>{driver.leadingObject.name}</strong>
                  <small className="mono">
                    фактор {driver.leadingObject.factorScore}/100 · {signed(driver.leadingObject.neutralDelta)}
                  </small>
                </Link>
                <Icon name="chevR" size={15} className="dash-explain-arrow" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
