'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { EnvironmentHealthCard } from '@/components/shared/settings/environment-health-card';

const ITEMS: [string, boolean][] = [
  ['Двухфакторная аутентификация (2FA)', true],
  ['Единый вход (SSO / SAML)', true],
  ['Ограничение по IP-адресам', false],
  ['Журнал аудита действий', true],
];

interface SecurityTabProps {
  canRunEnvironmentHealth: boolean;
}

export function SecurityTab({ canRunEnvironmentHealth }: SecurityTabProps) {
  const [states, setStates] = useState<boolean[]>(ITEMS.map(([, d]) => d));

  function toggle(i: number) {
    setStates((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
    toast.info('Настройки безопасности будут доступны в следующих версиях');
  }

  return (
    <div className="security-tab-stack">
      <div className="card">
        <div className="card-head">
          <span className="card-title">Безопасность</span>
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

      {canRunEnvironmentHealth && <EnvironmentHealthCard />}
    </div>
  );
}
