import { getTrustBand } from '@/lib/design-tokens';

interface TrustChipProps {
  value: number;
  size?: 'sm' | 'md';
}

export function TrustChip({ value, size = 'md' }: TrustChipProps) {
  const band = getTrustBand(value);
  return (
    <span
      className={`trust-chip${size === 'sm' ? ' sm' : ''}`}
      style={{ '--c': band.color } as React.CSSProperties}
    >
      <span className="mono trust-chip-val">{value}</span>
    </span>
  );
}
