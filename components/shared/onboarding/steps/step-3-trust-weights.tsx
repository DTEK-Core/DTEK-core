'use client';

import type { WizardData } from '@/components/shared/onboarding/wizard';
import type { OnboardingWeights } from '@/lib/actions/onboarding';

const FACTORS: { key: keyof OnboardingWeights; label: string; desc: string }[] = [
  { key: 'vuln',       label: 'Уязвимости',    desc: 'Известные CVE, давность патчей, поверхность атаки' },
  { key: 'config',     label: 'Конфигурация',  desc: 'Соответствие эталонным конфигурациям и хардненингу' },
  { key: 'access',     label: 'Доступы',       desc: 'Избыточные права, MFA, ротация секретов' },
  { key: 'network',    label: 'Сегментация',   desc: 'Сетевая изоляция, открытые порты, внешняя экспозиция' },
  { key: 'compliance', label: 'Соответствие',  desc: 'Покрытие политиками ИБ и регуляторными требованиями' },
  { key: 'incident',   label: 'Инциденты',     desc: 'Аномалии, инциденты и их давность' },
];

interface Props {
  data: WizardData;
  setData: (d: WizardData) => void;
}

export function Step3TrustWeights({ data, setData }: Props) {
  const total = Object.values(data.weights).reduce((a, b) => a + b, 0);
  const isValid = total === 100;

  function setWeight(key: keyof OnboardingWeights, value: number) {
    setData({ ...data, weights: { ...data.weights, [key]: value } });
  }

  return (
    <div className="wiz-step-body">
      <div className="wiz-step-intro">
        <h2 className="wiz-step-title">Веса факторов доверия</h2>
        <p className="wiz-step-sub">
          Настройте относительную важность каждого фактора. Сумма должна равняться 100%.
        </p>
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">Модель Trust Score</span>
          <span className="card-hint mono">ADR-001: vuln 22 · config 18 · access 18 · network 14 · compliance 16 · incident 12</span>
        </div>
        <div className="card-body">
          <div className="weights">
            {FACTORS.map((f) => {
              const val = data.weights[f.key];
              const pct = (val / 40) * 100;
              return (
                <div className="weight" key={f.key}>
                  <div className="weight-top">
                    <span className="weight-label">{f.label}</span>
                    <span className="weight-val mono">{val}%</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-mute)', marginBottom: 8 }}>{f.desc}</p>
                  <input
                    type="range"
                    min={0}
                    max={40}
                    value={val}
                    className="weight-slider"
                    style={{ '--p': `${pct}%` } as React.CSSProperties}
                    onChange={(e) => setWeight(f.key, Number(e.target.value))}
                  />
                </div>
              );
            })}
            <div className={`weight-total${isValid ? '' : ' warn'}`}>
              <span>Сумма весов</span>
              <span className="mono">
                {total}%{' '}
                {isValid
                  ? '✓'
                  : total > 100
                  ? `(−${total - 100})`
                  : `(+${100 - total})`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {!isValid && (
        <p className="ob-error" style={{ marginTop: 12 }}>
          Сумма весов должна равняться 100%. Сейчас: {total}%.
        </p>
      )}
    </div>
  );
}
