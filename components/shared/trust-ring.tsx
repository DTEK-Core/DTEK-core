'use client';

import { useEffect, useState } from 'react';
import { getTrustBand } from '@/lib/design-tokens';

interface TrustRingProps {
  value: number;
  size?: number;
  stroke?: number;
  label?: boolean;
  sub?: string;
  animate?: boolean;
}

export function TrustRing({
  value,
  size = 132,
  stroke = 9,
  label = true,
  sub = 'Доверие',
  animate = true,
}: TrustRingProps) {
  const [shown, setShown] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate) {
      setShown(value);
      return;
    }
    if (typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(value);
      return;
    }
    let raf: number;
    let start: number | null = null;
    const dur = 900;

    const step = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, animate]);

  const r = (size - stroke) / 2 - 3;
  const c = 2 * Math.PI * r;
  const band = getTrustBand(value);
  const off = c * (1 - shown / 100);

  return (
    <div className="trust-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={`tg-${size}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={band.color} stopOpacity="0.65" />
            <stop offset="1" stopColor={band.color} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,.06)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#tg-${size})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset .1s linear',
            filter: `drop-shadow(0 0 6px ${band.color}55)`,
          }}
        />
      </svg>
      {label && (
        <div className="trust-ring-center">
          <div className="trust-ring-val mono" style={{ color: band.color }}>
            {shown}
          </div>
          {sub && <div className="trust-ring-sub">{sub}</div>}
        </div>
      )}
    </div>
  );
}
