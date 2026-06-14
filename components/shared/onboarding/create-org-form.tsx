'use client';

import { useState, useTransition } from 'react';
import { createOrganization } from '@/lib/actions/organizations';
import { Icon } from '@/components/shared/icon';

const INDUSTRIES = [
  'Энергетика',
  'Финансы',
  'Здравоохранение',
  'IT и телеком',
  'Государственный сектор',
  'Промышленность',
  'Транспорт',
  'Другое',
];

const SIZES = [
  { value: 'micro', label: 'Микро (менее 15 сотрудников)' },
  { value: 'small', label: 'Малое (15–100 сотрудников)' },
  { value: 'medium', label: 'Среднее (100–500 сотрудников)' },
  { value: 'large', label: 'Крупное (500–5000 сотрудников)' },
  { value: 'enterprise', label: 'Предприятие (более 5000 сотрудников)' },
];

export function CreateOrgForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string).trim();
    const short_name = (formData.get('short_name') as string).trim();
    const industry = formData.get('industry') as string;
    const size = formData.get('size') as string;

    if (!name) {
      setError('Укажите полное наименование организации');
      return;
    }
    if (!short_name) {
      setError('Укажите краткое наименование');
      return;
    }
    if (!industry) {
      setError('Выберите отрасль');
      return;
    }
    if (!size) {
      setError('Выберите размер организации');
      return;
    }

    startTransition(async () => {
      const result = await createOrganization(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="ob-page">
      <div className="ob-head">
        <h1 className="ob-title">Давайте настроим вашу организацию</h1>
        <p className="ob-sub">Вы сможете изменить эти данные позже в настройках</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-head">
            <span className="card-title">Основная информация</span>
          </div>
          <div className="card-body">
            <div className="set-fields">
              <label className="set-field">
                <span className="set-field-label">Полное наименование *</span>
                <input
                  className="set-input"
                  name="name"
                  type="text"
                  placeholder='АО "Меридиан-Энерго"'
                  autoComplete="organization"
                  required
                />
              </label>

              <label className="set-field">
                <span className="set-field-label">Краткое наименование *</span>
                <input
                  className="set-input"
                  name="short_name"
                  type="text"
                  placeholder="Меридиан"
                  required
                />
              </label>

              <label className="set-field">
                <span className="set-field-label">Отрасль *</span>
                <select className="set-input" name="industry" defaultValue="" required>
                  <option value="" disabled>Выберите отрасль</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </label>

              <label className="set-field">
                <span className="set-field-label">Размер *</span>
                <select className="set-input" name="size" defaultValue="" required>
                  <option value="" disabled>Выберите размер</option>
                  {SIZES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </label>

              <label className="set-field">
                <span className="set-field-label">ИНН</span>
                <input
                  className="set-input"
                  name="inn"
                  type="text"
                  placeholder="7712345678"
                  maxLength={12}
                  pattern="[0-9]{10}|[0-9]{12}"
                />
              </label>

              <label className="set-field">
                <span className="set-field-label">Регион</span>
                <input
                  className="set-input"
                  name="region"
                  type="text"
                  placeholder="Москва"
                />
              </label>
            </div>
          </div>
        </div>

        {error && <p className="ob-error">{error}</p>}

        <div className="ob-actions">
          <button
            className="btn btn-primary btn-lg"
            type="submit"
            disabled={isPending}
          >
            {isPending ? 'Создание…' : 'Продолжить'}
            {!isPending && <Icon name="chevR" size={16} />}
          </button>
        </div>
      </form>
    </div>
  );
}
