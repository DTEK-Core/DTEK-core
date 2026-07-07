'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { updateOrganization } from '@/lib/actions/settings';

const INDUSTRIES = [
  { value: '', label: 'Не указана' },
  { value: 'energy', label: 'Энергетика' },
  { value: 'finance', label: 'Финансы' },
  { value: 'health', label: 'Здравоохранение' },
  { value: 'it', label: 'IT и телеком' },
  { value: 'gov', label: 'Государственный сектор' },
  { value: 'industry', label: 'Промышленность' },
  { value: 'transport', label: 'Транспорт' },
  { value: 'other', label: 'Другое' },
];

const SIZES = [
  { value: '', label: 'Не указано' },
  { value: 'micro', label: 'До 15 чел.' },
  { value: 'small', label: '15–100 чел.' },
  { value: 'medium', label: '100–1 000 чел.' },
  { value: 'large', label: '1 000–10 000 чел.' },
  { value: 'enterprise', label: 'Более 10 000 чел.' },
];

interface Props {
  name: string;
  inn: string | null;
  industry: string | null;
  region: string | null;
  size: string | null;
  isOwner: boolean;
}

export function OrgTab({ name: initialName, inn: initialInn, industry: initialIndustry, region: initialRegion, size: initialSize, isOwner }: Props) {
  const [name, setName] = useState(initialName);
  const [inn, setInn] = useState(initialInn ?? '');
  const [industry, setIndustry] = useState(initialIndustry ?? '');
  const [region, setRegion] = useState(initialRegion ?? '');
  const [size, setSize] = useState(initialSize ?? '');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isOwner) return;
    setError(null);
    startTransition(async () => {
      const result = await updateOrganization({ name, inn: inn || null, industry: industry || null, region: region || null, size: size || null });
      if (result.error) {
        setError(result.error);
      } else {
        toast.success('Данные организации обновлены');
      }
    });
  }

  const ro = !isOwner;

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">Организация</span>
        {!isOwner && (
          <span className="set-card-note">Редактирование доступно только владельцу</span>
        )}
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="set-fields">
            <div className="set-field set-field-wide">
              <label className="set-field-label">Наименование</label>
              <input
                className={`set-input${ro ? ' set-input-readonly' : ''}`}
                type="text"
                required
                readOnly={ro}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="set-field">
              <label className="set-field-label">ИНН</label>
              <input
                className={`set-input${ro ? ' set-input-readonly' : ''}`}
                type="text"
                readOnly={ro}
                value={inn}
                onChange={(e) => setInn(e.target.value)}
                placeholder="1234567890"
                pattern="[0-9]{10}|[0-9]{12}"
                title="10 или 12 цифр"
              />
            </div>
            <div className="set-field">
              <label className="set-field-label">Регион</label>
              <input
                className={`set-input${ro ? ' set-input-readonly' : ''}`}
                type="text"
                readOnly={ro}
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Москва"
              />
            </div>
            <div className="set-field">
              <label className="set-field-label">Отрасль</label>
              <select
                className={`set-input${ro ? ' set-input-readonly' : ''}`}
                disabled={ro}
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                {INDUSTRIES.map((i) => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            </div>
            <div className="set-field">
              <label className="set-field-label">Размер организации</label>
              <select
                className={`set-input${ro ? ' set-input-readonly' : ''}`}
                disabled={ro}
                value={size}
                onChange={(e) => setSize(e.target.value)}
              >
                {SIZES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="ob-error set-error">{error}</p>}

          {isOwner && (
            <div className="set-actions">
              <button type="submit" className="btn btn-primary" disabled={isPending}>
                {isPending ? 'Сохранение…' : 'Сохранить изменения'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
