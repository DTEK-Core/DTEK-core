import Link from 'next/link';
import { Icon } from '@/components/shared/icon';

interface SparklineProps {
  data: number[];
  color?: string;
}

function Sparkline({ data, color = 'var(--teal)' }: SparklineProps) {
  if (data.length < 2) return null;
  const w = 84, h = 28, pad = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const rng = max - min || 1;
  const X = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const Y = (v: number) => h - pad - ((v - min) / rng) * (h - pad * 2);
  const path = data.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h} className="sparkline" viewBox={`0 0 ${w} ${h}`}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Delta({ value, invert = false, suffix = '' }: { value: number; invert?: boolean; suffix?: string }) {
  if (value === 0) return <span className="delta flat">—</span>;
  const pos = invert ? value < 0 : value > 0;
  return (
    <span className={`delta ${pos ? 'pos' : 'neg'}`}>
      {value > 0 ? '+' : ''}{value}{suffix}
    </span>
  );
}

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number | null;
  deltaInvert?: boolean;
  icon: string;
  spark?: number[];
  sparkColor?: string;
  href?: string;
}

function KpiInner({ label, value, unit, delta, deltaInvert, icon, spark, sparkColor }: Omit<KpiCardProps, 'href'>) {
  return (
    <div className="kpi">
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        <span className="kpi-ico"><Icon name={icon} size={16} /></span>
      </div>
      <div className="kpi-val">
        {value}
        {unit && <span className="kpi-unit">{unit}</span>}
      </div>
      <div className="kpi-foot">
        {delta != null && <Delta value={delta} invert={deltaInvert} />}
        {spark && <Sparkline data={spark} color={sparkColor} />}
      </div>
    </div>
  );
}

export function KpiCard(props: KpiCardProps) {
  const { href, ...rest } = props;
  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
        <KpiInner {...rest} />
      </Link>
    );
  }
  return <KpiInner {...rest} />;
}
