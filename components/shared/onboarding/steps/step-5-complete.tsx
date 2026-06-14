'use client';

import { Icon } from '@/components/shared/icon';
import type { WizardData } from '@/components/shared/onboarding/wizard';

const FACTOR_LABELS: Record<string, string> = {
  vuln: 'Уязвимости',
  config: 'Конфигурация',
  access: 'Доступы',
  network: 'Сегментация',
  compliance: 'Соответствие',
  incident: 'Инциденты',
};

const OBJ_LABELS: Record<string, string> = {
  server: 'Серверы', workstation: 'Рабочие станции', laptop: 'Ноутбуки',
  network: 'Сетевое оборудование', app: 'Приложения', database: 'Базы данных',
  service: 'Сервисы', identity: 'Учётные записи', ot: 'АСУ ТП', policy: 'Политики',
};

interface Props {
  data: WizardData;
  orgName: string;
  isPending: boolean;
  onSubmit: () => void;
}

export function Step5Complete({ data, orgName, isPending, onSubmit }: Props) {
  const validInvites = data.invites.filter((i) => i.email.includes('@'));

  return (
    <div className="wiz-step-body">
      <div className="wiz-step-intro">
        <div className="wiz-success-icon">
          <Icon name="check" size={28} />
        </div>
        <h2 className="wiz-step-title" style={{ marginTop: 16 }}>Всё готово к запуску!</h2>
        <p className="wiz-step-sub">Проверьте настройки и запустите платформу</p>
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">Итоги настройки</span>
        </div>
        <div className="card-body">
          <div className="summary-items">
            <div className="summary-item">
              <span className="summary-label">Организация</span>
              <span className="summary-value">{orgName}</span>
            </div>

            {data.objectTypes.length > 0 && (
              <div className="summary-item">
                <span className="summary-label">Типы объектов</span>
                <span className="summary-value">
                  {data.objectTypes.map((t) => OBJ_LABELS[t] ?? t).join(', ')}
                </span>
              </div>
            )}

            <div className="summary-item">
              <span className="summary-label">Веса факторов</span>
              <span className="summary-value mono" style={{ fontSize: 12 }}>
                {Object.entries(data.weights)
                  .map(([k, v]) => `${FACTOR_LABELS[k] ?? k}: ${v}%`)
                  .join(' · ')}
              </span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Приглашения</span>
              <span className="summary-value">
                {validInvites.length > 0
                  ? `${validInvites.length} участник${validInvites.length > 1 ? 'а' : ''}`
                  : 'Не добавлены'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="ob-actions" style={{ marginTop: 28 }}>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={onSubmit}
          disabled={isPending}
        >
          {isPending ? 'Запуск…' : 'Запустить платформу'}
          {!isPending && <Icon name="chevR" size={16} />}
        </button>
      </div>
    </div>
  );
}
