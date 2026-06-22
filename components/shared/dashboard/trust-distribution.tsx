import { TRUST_BANDS } from '@/lib/design-tokens';

export interface DistEntry {
  level: string;
  count: number;
}

export function TrustDistribution({ distribution }: { distribution: DistEntry[] }) {
  const maxCount = Math.max(...distribution.map(d => d.count), 1);

  return (
    <div className="dist-list">
      {[...TRUST_BANDS].reverse().map(band => {
        const count = distribution.find(d => d.level === band.key)?.count ?? 0;
        return (
          <div className="dist-row" key={band.key}>
            <div className="dist-meta">
              <span className="dist-dot" style={{ background: band.color }} />
              <span className="dist-band">{band.label}</span>
              <span className="dist-range">{band.range[0]}–{band.range[1]}</span>
            </div>
            <div className="dist-bar-wrap">
              <div className="dist-bar" style={{ width: `${(count / maxCount) * 100}%`, background: band.color }} />
            </div>
            <span className="dist-count">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
