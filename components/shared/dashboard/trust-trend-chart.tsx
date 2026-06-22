'use client';

import { useState } from 'react';

export interface HistoryPoint {
  new_score: number;
  created_at: string;
}

const PERIODS = [
  { value: '30', label: '30 дн', days: 30 },
  { value: '90', label: '90 дн', days: 90 },
  { value: '1y', label: '1 год', days: 365 },
] as const;

export function TrustTrendChart({ data }: { data: HistoryPoint[] }) {
  const [period, setPeriod] = useState<'30' | '90' | '1y'>('30');

  const cutoffMs = Date.now() - (PERIODS.find(p => p.value === period)?.days ?? 30) * 86_400_000;
  const filtered = data.filter(p => new Date(p.created_at).getTime() >= cutoffMs);
  const scores = (filtered.length >= 2 ? filtered : data).map(p => p.new_score);

  if (scores.length < 2) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 190, color: 'var(--text-mute)', fontSize: 13 }}>
        Недостаточно данных для построения графика
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginBottom: 10 }}>
        {PERIODS.map(p => (
          <button
            key={p.value}
            className="btn btn-ghost btn-sm"
            style={{
              minWidth: 52, fontSize: 12, padding: '4px 10px',
              ...(period === p.value ? { color: 'var(--teal)', borderColor: 'var(--teal-line)' } : {}),
            }}
            onClick={() => setPeriod(p.value)}
          >
            {p.label}
          </button>
        ))}
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
