'use client';

import type { WizardData } from '@/components/shared/onboarding/wizard';

const OBJECT_TYPES = [
  { value: 'server',      label: 'Серверы',             icon: '🖥' },
  { value: 'workstation', label: 'Рабочие станции',     icon: '💻' },
  { value: 'laptop',      label: 'Ноутбуки',            icon: '🔲' },
  { value: 'network',     label: 'Сетевое оборудование',icon: '🌐' },
  { value: 'app',         label: 'Приложения',          icon: '📦' },
  { value: 'database',    label: 'Базы данных',         icon: '🗄' },
  { value: 'service',     label: 'Сервисы',             icon: '⚙' },
  { value: 'identity',    label: 'Учётные записи',      icon: '👤' },
  { value: 'ot',          label: 'АСУ ТП',              icon: '🏭' },
  { value: 'policy',      label: 'Политики',            icon: '📋' },
];

interface Props {
  data: WizardData;
  setData: (d: WizardData) => void;
}

export function Step2ObjectTypes({ data, setData }: Props) {
  function toggle(value: string) {
    const next = data.objectTypes.includes(value)
      ? data.objectTypes.filter((t) => t !== value)
      : [...data.objectTypes, value];
    setData({ ...data, objectTypes: next });
  }

  return (
    <div className="wiz-step-body">
      <div className="wiz-step-intro">
        <h2 className="wiz-step-title">Типы объектов</h2>
        <p className="wiz-step-sub">
          Выберите категории объектов, которые будут отслеживаться в вашей цифровой модели
        </p>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="obj-types">
            {OBJECT_TYPES.map((t) => {
              const checked = data.objectTypes.includes(t.value);
              return (
                <button
                  key={t.value}
                  type="button"
                  className={`obj-type${checked ? ' selected' : ''}`}
                  onClick={() => toggle(t.value)}
                >
                  <span className="obj-type-icon">{t.icon}</span>
                  <span className="obj-type-label">{t.label}</span>
                  {checked && (
                    <span className="obj-type-check">
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="card-hint" style={{ marginTop: 16 }}>
            Выбрано: {data.objectTypes.length} из {OBJECT_TYPES.length}. Настройку можно изменить позже.
          </p>
        </div>
      </div>
    </div>
  );
}
