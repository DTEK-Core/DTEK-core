'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/shared/icon';
import { TrustChip } from '@/components/shared/trust-chip';
import { typeGlyph } from '@/lib/design-tokens';

export interface RelatedObject {
  id: string;
  name: string;
  type: string;
  trust_score: number;
  trust_level: string;
}

interface ConnListProps {
  related: RelatedObject[];
  bare?: boolean;
}

export function ConnList({ related, bare }: ConnListProps) {
  const router = useRouter();

  const body = (
    <div className="conn-grid">
      {related.map(c => (
        <button
          key={c.id}
          className="conn-card"
          onClick={() => router.push(`/objects/${c.id}`)}
        >
          <span className="conn-ico">
            <Icon name={typeGlyph(c.type)} size={16} />
          </span>
          <span className="conn-info">
            <span className="conn-name">{c.name}</span>
            <span className="conn-id mono">{c.id.slice(0, 8)}</span>
          </span>
          <TrustChip value={c.trust_score} size="sm" />
        </button>
      ))}
    </div>
  );

  return bare ? body : <div className="card" style={{ padding: 18 }}>{body}</div>;
}
