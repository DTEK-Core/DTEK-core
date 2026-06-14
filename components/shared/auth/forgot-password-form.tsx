'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/actions/auth';
import { Icon } from '@/components/shared/icon';

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    if (!email.includes('@')) {
      setError('Введите корректный email-адрес');
      return;
    }

    setSentEmail(email);

    startTransition(async () => {
      const result = await forgotPassword(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSent(true);
      }
    });
  }

  if (sent) {
    return (
      <div className="auth-form-wrap">
        <div className="auth-success-icon">
          <Icon name="check" size={24} />
        </div>
        <h1 className="auth-title">Письмо отправлено</h1>
        <p className="auth-sub">
          Мы отправили ссылку для сброса пароля на{' '}
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{sentEmail}</span>.
          Проверьте почту и перейдите по ссылке.
        </p>
        <p className="auth-foot" style={{ marginTop: 32 }}>
          <Link href="/login" className="link-inline">
            ← Вернуться ко входу
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-form-wrap">
      <h1 className="auth-title">Забыли пароль?</h1>
      <p className="auth-sub">Введите email — пришлём ссылку для сброса</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span className="auth-field-label">Рабочий email</span>
          <div className="auth-input-wrap">
            <Icon name="user" size={15} className="auth-input-ico" />
            <input
              className="auth-input"
              name="email"
              type="email"
              placeholder="name@company.ru"
              autoComplete="email"
              required
            />
          </div>
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button
          className="btn btn-primary btn-lg auth-submit"
          type="submit"
          disabled={isPending}
        >
          {isPending ? 'Отправка…' : 'Отправить ссылку'}
          {!isPending && <Icon name="chevR" size={16} />}
        </button>
      </form>

      <p className="auth-foot" style={{ marginTop: 24 }}>
        <Link href="/login" className="link-inline">
          ← Вернуться ко входу
        </Link>
      </p>
    </div>
  );
}
