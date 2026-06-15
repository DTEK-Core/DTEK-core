'use client';

import type { WizardData } from '@/components/shared/onboarding/wizard';

interface Props {
  data: WizardData;
  setData: (d: WizardData) => void;
}

export function Step1OrgDetails({ data, setData }: Props) {
  function update(field: keyof Pick<WizardData, 'description' | 'contactEmail' | 'website'>, value: string) {
    setData({ ...data, [field]: value });
  }

  return (
    <div className="wiz-step-body">
      <div className="wiz-step-intro">
        <h2 className="wiz-step-title">Детали организации</h2>
        <p className="wiz-step-sub">Добавьте описание и контактные данные для вашей цифровой модели</p>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="set-fields" style={{ gridTemplateColumns: '1fr' }}>
            <label className="set-field">
              <span className="set-field-label">Описание деятельности</span>
              <textarea
                className="set-input"
                name="description"
                rows={3}
                placeholder="Краткое описание деятельности организации и её ключевых ИТ-систем"
                value={data.description}
                onChange={(e) => update('description', e.target.value)}
                style={{ resize: 'vertical', minHeight: 80 }}
              />
            </label>

            <label className="set-field">
              <span className="set-field-label">Контактный email ИБ-команды</span>
              <input
                className="set-input"
                name="contactEmail"
                type="email"
                placeholder="security@company.ru"
                value={data.contactEmail}
                onChange={(e) => update('contactEmail', e.target.value)}
              />
            </label>

            <label className="set-field">
              <span className="set-field-label">Веб-сайт организации</span>
              <input
                className="set-input"
                name="website"
                type="url"
                placeholder="https://company.ru"
                value={data.website}
                onChange={(e) => update('website', e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
