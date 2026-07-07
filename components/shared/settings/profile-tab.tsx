'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { updateProfile } from '@/lib/actions/settings';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

const ROLE_LABELS: Record<string, string> = {
  owner:   'Владелец',
  admin:   'Администратор',
  analyst: 'Аналитик ИБ',
  viewer:  'Наблюдатель',
};

interface Props {
  fullName: string;
  email: string;
  team: string | null;
  role: string | null;
}

export function ProfileTab({ fullName: initialName, email, team: initialTeam, role }: Props) {
  const [fullName, setFullName] = useState(initialName);
  const [team, setTeam] = useState(initialTeam ?? '');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const initials = getInitials(fullName || initialName);
  const roleLabel = ROLE_LABELS[role ?? ''] ?? role ?? '';

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.error) {
        setError(result.error);
      } else {
        toast.success('Профиль обновлён');
      }
    });
  }

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">Профиль</span>
      </div>
      <div className="card-body">
        <div className="set-profile">
          <div className="set-avatar-wrap" title="Загрузка фото профиля — скоро">
            <span className="set-avatar">{initials}</span>
            <span className="set-avatar-hint">Скоро</span>
          </div>
          <div className="set-profile-info">
            <div className="set-profile-name">{fullName || initialName}</div>
            <div className="set-profile-role mono">
              {roleLabel}{team ? ` · ${team}` : ''}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="set-fields">
            <div className="set-field">
              <label className="set-field-label">Полное имя</label>
              <input
                className="set-input"
                name="full_name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Иван Петров"
              />
            </div>
            <div className="set-field">
              <label className="set-field-label">Email</label>
              <input
                className="set-input"
                type="email"
                value={email}
                readOnly
                aria-readonly="true"
                title="Email нельзя изменить без процедуры верификации"
              />
            </div>
            <div className="set-field set-field-wide">
              <label className="set-field-label">Должность / Команда</label>
              <input
                className="set-input"
                name="team"
                type="text"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                placeholder="Директор по ИБ · CISO Office"
              />
            </div>
          </div>

          {error && <p className="ob-error set-error">{error}</p>}

          <div className="set-actions">
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? 'Сохранение…' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
