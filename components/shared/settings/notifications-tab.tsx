'use client';

import { useState } from 'react';
import { toast } from 'sonner';

const ITEMS: [string, boolean][] = [
  ['Критические риски', true],
  ['Снижение индекса доверия', true],
  ['Новые объекты в модели', false],
  ['Еженедельный дайджест', true],
  ['Изменения политик', false],
];

export function NotificationsTab() {
  const [states, setStates] = useState<boolean[]>(ITEMS.map(([, d]) => d));

  function toggle(i: number) {
    setStates((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
    toast.info('Настройки уведомлений будут доступны в следующих версиях');
  }

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">Уведомления</span>
      </div>
      <div className="card-body">
        <div className="toggles">
          {ITEMS.map(([label], i) => (
            <button
              key={label}
              type="button"
              className="toggle-row"
              onClick={() => toggle(i)}
            >
              <span className="toggle-label">{label}</span>
              <span className={`toggle ${states[i] ? 'on' : ''}`}>
                <span className="toggle-knob" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
