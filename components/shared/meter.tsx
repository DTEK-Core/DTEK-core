interface MeterProps {
  value: number;
  color: string;
  h?: number;
}

export function Meter({ value, color, h = 8 }: MeterProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="meter" style={{ height: h, background: 'rgba(255,255,255,.05)' }}>
      <div className="meter-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
