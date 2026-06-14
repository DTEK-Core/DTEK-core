'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { updatePassword } from '@/lib/actions/auth';
import { Icon } from '@/components/shared/icon';

type Stage = 'exchanging' | 'form' | 'error';

interface Props {
  code: string | undefined;
}

export function ResetPasswordForm({ code }: Props) {
  const [stage, setStage] = useState<Stage>('exchanging');
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setExchangeError('Ссылка для сброса пароля недействительна или устарела');
      setStage('error');
      return;
    }

    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error: err }) => {
      if (err) {
        setExchangeError(err.message);
        setStage('error');
      } else {
        setStage('form');
      }
    });
  }, [code]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirm = formData.get('confirm_password') as string;

    if (password.length < 8) {
      setError('Пароль должен содержать не менее 8 символов');
      return;
    }
    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }

    startTransition(async () => {
      const result = await updatePassword(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  if (stage === 'exchanging') {
    return (
      <div className="auth-form-wrap">
        <div className="skel" style={{ height: 32, width: 240, marginBottom: 12 }} />
        <div className="skel" style={{ height: 16, width: 320 }} />
      </div>
    );
  }

  if (stage === 'error') {
    return (
      <div className="auth-form-wrap">
        <h1 className="auth-title">Ссылка недействительна</h1>
        <p className="auth-sub" style={{ color: 'var(--crit)' }}>
          {exchangeError ?? 'Запросите сброс пароля повторно'}
        </p>
        <Link href="/forgot-password" className="btn btn-primary btn-lg auth-submit" style={{ marginTop: 24 }}>
          Запросить новую ссылку
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-form-wrap">
      <h1 className="auth-title">Новый пароль</h1>
      <p className="auth-sub">Придумайте надёжный пароль для вашего аккаунта</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span className="auth-field-label">Новый пароль</span>
          <div className="auth-input-wrap">
            <Icon name="shield" size={15} className="auth-input-ico" />
            <input
              className="auth-input"
              name="password"
              type="password"
              placeholder="••••••••••"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
        </label>

        <label className="auth-field">
          <span className="auth-field-label">Подтвердите пароль</span>
          <div className="auth-input-wrap">
            <Icon name="shield" size={15} className="auth-input-ico" />
            <input
              className="auth-input"
              name="confirm_password"
              type="password"
              placeholder="••••••••••"
              autoComplete="new-password"
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
          {isPending ? 'Сохранение…' : 'Установить новый пароль'}
          {!isPending && <Icon name="chevR" size={16} />}
        </button>
      </form>
    </div>
  );
}
