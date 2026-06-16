import { SEVERITY_LEVELS } from '@/lib/design-tokens';

const TONE: Record<string, string> = {
  critical: 'crit',
  high:     'orange',
  medium:   'amber',
  low:      'info',
};

interface SeverityTagProps {
  value: string;
  dot?: boolean;
}

export function SeverityTag({ value, dot = false }: SeverityTagProps) {
  const level = SEVERITY_LEVELS.find(l => l.key === value);
  const tone = TONE[value] ?? 'neutral';
  return (
    <span className={`badge badge-${tone} soft`}>
      {dot && <span className="badge-dot" />}
      {level?.label ?? value}
    </span>
  );
}
