'use client';

import { Icon } from '@/components/shared/icon';
import type { WizardData } from '@/components/shared/onboarding/wizard';
import type { InviteEntry } from '@/lib/actions/onboarding';

const ROLES: { value: InviteEntry['role']; label: string }[] = [
  { value: 'analyst', label: 'Аналитик ИБ' },
  { value: 'admin',   label: 'Администратор' },
  { value: 'viewer',  label: 'Наблюдатель' },
];

interface Props {
  data: WizardData;
  setData: (d: WizardData) => void;
}

export function Step4InviteTeam({ data, setData }: Props) {
  function updateInvite(index: number, field: keyof InviteEntry, value: string) {
    const next = data.invites.map((inv, i) =>
      i === index ? { ...inv, [field]: value } : inv,
    );
    setData({ ...data, invites: next });
  }

  function addInvite() {
    setData({ ...data, invites: [...data.invites, { email: '', role: 'analyst' }] });
  }

  function removeInvite(index: number) {
    setData({ ...data, invites: data.invites.filter((_, i) => i !== index) });
  }

  return (
    <div className="wiz-step-body">
      <div className="wiz-step-intro">
        <h2 className="wiz-step-title">Пригласить команду</h2>
        <p className="wiz-step-sub">
          Добавьте коллег сейчас или пропустите этот шаг — пригласить можно будет позже.
        </p>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="invite-rows">
            {data.invites.map((inv, i) => (
              <div className="invite-row" key={i}>
                <input
                  className="set-input"
                  type="email"
                  placeholder="email@company.ru"
                  value={inv.email}
                  onChange={(e) => updateInvite(i, 'email', e.target.value)}
                  style={{ flex: 1 }}
                />
                <select
                  className="set-input invite-role"
                  value={inv.role}
                  onChange={(e) => updateInvite(i, 'role', e.target.value as InviteEntry['role'])}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="icon-btn sm"
                  onClick={() => removeInvite(i)}
                  title="Удалить"
                  style={{ color: 'var(--crit)', flexShrink: 0 }}
                >
                  <Icon name="x" size={16} />
                </button>
              </div>
            ))}

            {data.invites.length === 0 && (
              <p style={{ color: 'var(--text-mute)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                Нет участников. Добавьте приглашение ниже.
              </p>
            )}
          </div>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={addInvite}
            style={{ marginTop: 12, width: '100%' }}
          >
            <Icon name="plus" size={15} />
            Добавить участника
          </button>
        </div>
      </div>

      <p className="card-hint" style={{ marginTop: 12 }}>
        Ссылки для приглашений будут выведены в консоль сервера. SMTP-отправка — Sprint 08.
      </p>
    </div>
  );
}
