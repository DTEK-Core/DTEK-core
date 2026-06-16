'use client';

import { useState } from 'react';
import { Icon } from '@/components/shared/icon';

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (v: string) => void;
}

export function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  const [open, setOpen] = useState(false);
  const cur = options.find(o => o.value === value);
  const isFiltered = value !== (options[0]?.value ?? 'all');

  return (
    <div className="fsel">
      <button
        className={`fsel-btn${isFiltered ? ' active' : ''}`}
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        <Icon name="filter" size={13} />
        <span>{cur ? cur.label : label}</span>
        <Icon name="chevD" size={13} className="fsel-chev" />
      </button>

      {open && (
        <>
          <div className="overlay-soft" onClick={() => setOpen(false)} />
          <div className="fsel-menu pop">
            {options.map(o => (
              <button
                key={o.value}
                type="button"
                className={`fsel-item${o.value === value ? ' active' : ''}`}
                onClick={() => { onChange(o.value); setOpen(false); }}
              >
                {o.label}
                {o.value === value && <Icon name="check" size={14} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
