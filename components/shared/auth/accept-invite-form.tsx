'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import { Icon } from '@/components/shared/icon';
import { acceptInvitation } from '@/lib/actions/invitations';

const ROLE_LABELS: Record<string, string> = {
  analyst: 'Аналитик ИБ',
  admin: 'Администратор',
  viewer: 'Наблюдатель',
};

interface Props {
  token: string;
  email: string;
  role: string;
  orgName: string;
}

export function AcceptInviteForm({ token, email, role, orgName }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const result = await acceptInvitation(token, firstName, lastName, password);
      if (result?.error) setError(result.error);
    } catch (err) {
      if (err && typeof err === 'object' && 'digest' in err) throw err;
      setError('Произошла ошибка. Попробуйте ещё раз.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-form">
      <Link href="/" className="auth-logo-wrap" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, textDecoration: 'none' }}>
        <Logo size={32} />
        <span className="brand-name">DTEK<span className="brand-core">Core</span></span>
      </Link>

      <h1 className="auth-title">Принять приглашение</h1>
      <p className="auth-sub">
        Организация <strong>{orgName}</strong> · {ROLE_LABELS[role] ?? role}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
        <div className="set-fields">
          <div className="set-field">
            <label className="set-field-label">Email</label>
            <input
              className="set-input"
              type="email"
              value={email}
              readOnly
              style={{ opacity: 0.6, cursor: 'default' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="set-field">
              <label className="set-field-label">Имя</label>
              <input
                className="set-input"
                type="text"
                required
                autoFocus
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Иван"
              />
            </div>
            <div className="set-field">
              <label className="set-field-label">Фамилия</label>
              <input
                className="set-input"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Петров"
              />
            </div>
          </div>

          <div className="set-field">
            <label className="set-field-label">Придумайте пароль</label>
            <input
              className="set-input"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 8 символов"
            />
          </div>
        </div>

        {error && <p className="ob-error">{error}</p>}

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={pending}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {pending ? (
            'Подождите…'
          ) : (
            <>
              Принять приглашение и войти
              <Icon name="chevR" size={16} />
            </>
          )}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-mute)', marginTop: 4 }}>
          Уже есть аккаунт?{' '}
          <a href="/login" className="link-inline">
            Войти
          </a>
        </p>
      </form>
    </div>
  );
}
