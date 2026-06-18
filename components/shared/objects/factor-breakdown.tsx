import { getTrustBand } from '@/lib/design-tokens';
import { Meter } from '@/components/shared/meter';

export interface FactorItem {
  key: string;
  label: string;
  weight: number;
  score: number;
  desc: string;
}

interface FactorBreakdownProps {
  factors: FactorItem[];
  compact?: boolean;
}

export function FactorBreakdown({ factors, compact }: FactorBreakdownProps) {
  return (
    <div className={`factors${compact ? ' compact' : ''}`}>
      {factors.map(f => {
        const band = getTrustBand(f.score);
        return (
          <div className="factor" key={f.key}>
            <div className="factor-top">
              <span className="factor-label">{f.label}</span>
              <span className="factor-weight mono">вес {f.weight}%</span>
              <span className="factor-score mono" style={{ color: band.color }}>
                {f.score}
              </span>
            </div>
            <Meter value={f.score} color={band.color} />
            {!compact && <p className="factor-desc">{f.desc}</p>}
          </div>
        );
      })}
    </div>
  );
}
