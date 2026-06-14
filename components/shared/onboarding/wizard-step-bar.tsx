'use client';

import { Icon } from '@/components/shared/icon';

const STEPS = [
  'Детали',
  'Объекты',
  'Веса',
  'Команда',
  'Запуск',
];

interface WizardStepBarProps {
  current: number; // 0-based
}

export function WizardStepBar({ current }: WizardStepBarProps) {
  return (
    <div className="config-steps">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div
            key={label}
            className={`cstep${active ? ' active' : ''}${done ? ' done' : ''}`}
          >
            <span className="cstep-n mono">
              {done ? <Icon name="check" size={13} /> : i + 1}
            </span>
            <span className="cstep-label">{label}</span>
            {i < STEPS.length - 1 && <span className="cstep-line" />}
          </div>
        );
      })}
    </div>
  );
}
