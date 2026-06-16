import { CRITICALITY_LEVELS } from '@/lib/design-tokens';

const TONE: Record<string, string> = {
  critical: 'crit',
  high:     'orange',
  medium:   'amber',
  low:      'info',
};

export function CritTag({ value }: { value: string }) {
  const level = CRITICALITY_LEVELS.find(l => l.key === value);
  const tone = TONE[value] ?? 'neutral';
  return (
    <span className={`badge badge-${tone} soft`}>
      {level?.label ?? value}
    </span>
  );
}
