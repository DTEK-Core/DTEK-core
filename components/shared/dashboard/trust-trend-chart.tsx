'use client';

import { useState } from 'react';

export interface HistoryPoint {
  new_score: number;
  created_at: string;
}

type TrendRange = '7d' | '30d' | '90d' | '180d';

const PERIODS = [
  { value: '7d', label: '7д', days: 7 },
  { value: '30d', label: '30д', days: 30 },
  { value: '90d', label: '90д', days: 90 },
  { value: '180d', label: '6м', days: 180 },
] as const;

export function TrustTrendChart({ data }: { data: HistoryPoint[] }) {
  const [period, setPeriod] = useState<TrendRange>('30d');

  const cutoffMs = Date.now() - (PERIODS.find(p => p.value === period)?.days ?? 30) * 86_400_000;
  const filtered = data.filter(p => new Date(p.created_at).getTime() >= cutoffMs);
  const points = filtered.length >= 2 ? filtered : data;
  const scores = points.map(p => p.new_score);
  const latest = scores.at(-1);
  const previous = scores.at(-2);
  const delta = latest !== undefined && previous !== undefined ? latest - previous : null;

  if (scores.length < 2) {
    return (
      <div>
        <RangeSwitch period={period} setPeriod={setPeriod} />
        <div className="trend-empty">
          Недостаточно данных для построения графика
        </div>
      </div>
    );
  }

  const W = 640, H = 190, pad = 28;
  const raw = { min: Math.min(...scores) - 4, max: Math.max(...scores) + 4 };
  const rng = raw.max - raw.min || 1;
  const X = (i: number) => pad + (i / (scores.length - 1)) * (W - pad * 2);
  const Y = (v: number) => H - pad - ((v - raw.min) / rng) * (H - pad * 2);
  const path = scores.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
  const area = `${path} L${X(scores.length - 1)} ${H - pad} L${X(0)} ${H - pad} Z`;
  const ticks = [Math.round(raw.max), Math.round((raw.max + raw.min) / 2), Math.round(raw.min)];
  const lx = X(scores.length - 1), ly = Y(scores[scores.length - 1]);

  return (
    <div>
      <div className="trend-toolbar">
        <div className="trend-summary">
          <span className="trend-summary-label">Период</span>
          <span className="trend-summary-value">
            {scores.length} точек
            {delta !== null && (
              <span className={`trend-delta${delta >= 0 ? ' pos' : ' neg'}`}>
                {delta > 0 ? '+' : ''}{delta}
              </span>
            )}
          </span>
        </div>
        <RangeSwitch period={period} setPeriod={setPeriod} />
      </div>
      <div className="trend">
        <svg viewBox={`0 0 ${W} ${H}`} className="trend-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="dash-trendg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--teal)" stopOpacity="0.22" />
              <stop offset="1" stopColor="var(--teal)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((_, i) => (
            <line key={i} x1={pad} x2={W - pad}
              y1={pad + i * (H - pad * 2) / 2}
              y2={pad + i * (H - pad * 2) / 2}
              stroke="rgba(255,255,255,.05)" />
          ))}
          <path d={area} fill="url(#dash-trendg)" />
          <path d={path} fill="none" stroke="var(--teal)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={lx} cy={ly} r="9" fill="var(--teal)" opacity="0.16" />
          <circle cx={lx} cy={ly} r="3.4" fill="var(--teal)" />
        </svg>
        <div className="trend-axis">
          {ticks.map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </div>
    </div>
  );
}

function RangeSwitch({
  period,
  setPeriod,
}: {
  period: TrendRange;
  setPeriod: (period: TrendRange) => void;
}) {
  return (
    <div className="trend-range" aria-label="Период динамики индекса доверия">
      {PERIODS.map(p => (
        <button
          key={p.value}
          type="button"
          className={`trend-range-btn${period === p.value ? ' active' : ''}`}
          onClick={() => setPeriod(p.value)}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
