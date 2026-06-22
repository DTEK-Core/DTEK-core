import Link from 'next/link';
import { Icon } from '@/components/shared/icon';
import { TrustChip } from '@/components/shared/trust-chip';
import { CritTag } from '@/components/shared/crit-tag';

export interface RiskyObject {
  id: string;
  name: string;
  type: string;
  trust_score: number;
  trust_level: string;
  criticality: string;
}

const TYPE_ICONS: Record<string, string> = {
  server: 'server', workstation: 'monitor', laptop: 'monitor',
  app: 'app', database: 'db', network: 'network',
  cloud: 'cloud', user: 'user', ot: 'chip',
};

export function TopRiskyObjects({ objects }: { objects: RiskyObject[] }) {
  if (objects.length === 0) {
    return (
      <div style={{ padding: '32px 8px', textAlign: 'center', color: 'var(--text-mute)', fontSize: 13 }}>
        Объекты не добавлены
      </div>
    );
  }
  return (
    <div className="mini-table">
      {objects.map(o => (
        <Link
          key={o.id}
          href={`/objects/${o.id}`}
          className="mini-row"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <span className="mini-type">
            <Icon name={TYPE_ICONS[o.type] ?? 'objects'} size={15} />
          </span>
          <span className="mini-name">
            <span className="mini-name-main">{o.name}</span>
            <span className="mini-name-sub">{o.id.slice(0, 8)} · {o.type}</span>
          </span>
          <CritTag value={o.criticality} />
          <TrustChip value={o.trust_score} size="sm" />
          <Icon name="chevR" size={15} className="mini-arrow" />
        </Link>
      ))}
    </div>
  );
}
