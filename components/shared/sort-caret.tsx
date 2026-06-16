import { Icon } from '@/components/shared/icon';

interface SortCaretProps {
  active: boolean;
  dir: 'asc' | 'desc';
}

export function SortCaret({ active, dir }: SortCaretProps) {
  return (
    <span className={`sort-caret${active ? ' on' : ''}`}>
      <Icon
        name={active && dir === 'desc' ? 'arrowDown' : 'arrowUp'}
        size={11}
        stroke={2.4}
      />
    </span>
  );
}
