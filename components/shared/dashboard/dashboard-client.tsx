'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrustRing } from '@/components/shared/trust-ring';
import { getTrustBand } from '@/lib/design-tokens';
import { Icon } from '@/components/shared/icon';
import { triggerRecalculateAll } from '@/lib/actions/trust';
import { KpiCard } from './kpi-card';
import { TrustTrendChart, type HistoryPoint } from './trust-trend-chart';
import { TrustDistribution, type DistEntry } from './trust-distribution';
import { TopRiskyObjects, type RiskyObject } from './top-risky-objects';
import { EventFeed, type EventItem } from './event-feed';

export interface DashboardProps {
  org: {
    trust_score: number;
    trust_level: string;
    name: string;
    short_name: string | null;
  };
  kpi: {
    totalObjects: number;
    openRisks: number;
    critRisks: number;
    critLevelObjects: number;
  };
  topRisky: RiskyObject[];
  distribution: DistEntry[];
  history: HistoryPoint[];
  events: EventItem[];
  canRecalc: boolean;
  canOpenExecutiveReport: boolean;
}

export function DashboardClient({
  org,
  kpi,
  topRisky,
  distribution,
  history,
  events,
  canRecalc,
  canOpenExecutiveReport,
}: DashboardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const band    = getTrustBand(org.trust_score);
  const orgName = org.short_name ?? org.name;

  function handleRecalcAll() {
    startTransition(async () => {
      await triggerRecalculateAll();
      router.refresh();
    });
  }

  if (kpi.totalObjects === 0) {
    return (
      <div className="screen">
        <div className="screen-head">
          <div>
            <h1 className="screen-title">Центр управления</h1>
            <p className="screen-sub">Цифровая модель · {orgName}</p>
          </div>
        </div>
        <div className="dash-empty">
          <Icon name="objects" size={40} />
          <div className="dash-empty-title">Добавьте объекты в цифровую модель</div>
          <div className="dash-empty-sub">
            Trust Score рассчитывается по объектам организации. Перейдите в раздел «Объекты» и добавьте первый объект.
          </div>
          <Link href="/objects" className="btn btn-primary btn-sm">
            <Icon name="plus" size={14} />
            Добавить объект
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      {/* ── Header ── */}
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Центр управления</h1>
          <p className="screen-sub">Цифровая модель · {orgName} · обновляется в реальном времени</p>
        </div>
        <div className="screen-head-actions">
          {canOpenExecutiveReport && (
            <Link href="/reports/executive" className="btn btn-line btn-sm">
              <Icon name="download" size={14} />
              Отчёт CISO
            </Link>
          )}
          {canRecalc && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleRecalcAll}
              disabled={isPending}
            >
              <Icon name="refresh" size={14} />
              {isPending ? 'Переоценка…' : 'Переоценить всё'}
            </button>
          )}
        </div>
      </div>

      {/* ── Hero strip ── */}
      <div className="dash-hero">
        {/* Trust Ring */}
        <div className="hero-trust card">
          <div className="hero-trust-ring">
            <TrustRing value={org.trust_score} size={150} stroke={11} sub="из 100" />
          </div>
          <div className="hero-trust-info">
            <div className="hero-trust-label">Индекс доверия организации</div>
            <div className="hero-trust-band">
              <span
                className="badge soft"
                style={{ background: `${band.color}22`, color: band.color, border: `1px solid ${band.color}44` }}
              >
                <span className="badge-dot" style={{ background: band.color }} />
                {band.label}
              </span>
            </div>
            <p className="hero-trust-note">
              Совокупная оценка по {kpi.totalObjects} объектам цифровой модели.
              {kpi.critLevelObjects > 0
                ? ` ${kpi.critLevelObjects} объект${kpi.critLevelObjects === 1 ? '' : 'а'} на критическом уровне.`
                : ' Критических объектов нет.'}
            </p>
            <div className="hero-trust-cta">
              <Link href="/graph" className="btn btn-line btn-sm">
                <Icon name="graph" size={14} />
                Открыть граф доверия
              </Link>
              <Link href="/objects" className="btn btn-ghost btn-sm">
                <Icon name="eye" size={14} />
                К объектам
              </Link>
            </div>
          </div>
        </div>

        {/* KPI grid */}
        <div className="kpi-grid">
          <KpiCard
            label="Объектов в модели"
            value={kpi.totalObjects}
            icon="objects"
            href="/objects"
          />
          <KpiCard
            label="Открытых рисков"
            value={kpi.openRisks}
            icon="risk"
            href="/risks"
            delta={null}
          />
          <KpiCard
            label="Критических рисков"
            value={kpi.critRisks}
            icon="shield"
            href="/risks"
            delta={null}
          />
          <KpiCard
            label="Критичных объектов"
            value={kpi.critLevelObjects}
            icon="pulse"
          />
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="dash-grid">
        {/* Trend chart */}
        <section className="card dash-chart-row">
          <div className="card-head">
            <span className="card-title">Динамика индекса доверия</span>
          </div>
          <div className="card-body">
            <TrustTrendChart data={history} />
          </div>
        </section>

        <div className="dash-mid-row">
          {/* Distribution */}
          <section className="card dash-dist-card">
            <div className="card-head">
              <span className="card-title">Распределение по уровню доверия</span>
            </div>
            <div className="card-body">
              <TrustDistribution distribution={distribution} />
            </div>
          </section>

          {/* Top risky objects */}
          <section className="card dash-risky-card">
            <div className="card-head">
              <span className="card-title">Объекты с наименьшим доверием</span>
              <Link href="/objects" className="card-link">
                Все объекты <Icon name="chevR" size={13} />
              </Link>
            </div>
            <div className="card-body" style={{ paddingTop: 8, paddingBottom: 8 }}>
              <TopRiskyObjects objects={topRisky} />
            </div>
          </section>
        </div>

        {/* Event feed */}
        <section className="card dash-feed-row">
          <div className="card-head">
            <span className="card-title">Лента событий</span>
            <div className="live-mini">
              <span className="status-dot teal pulse" />
              live
            </div>
          </div>
          <div className="card-body dash-feed-body">
            <EventFeed events={events} />
          </div>
        </section>
      </div>
    </div>
  );
}
