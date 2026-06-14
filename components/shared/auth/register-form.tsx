'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { register } from '@/lib/actions/auth';
import { Icon } from '@/components/shared/icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = (formData.get('first_name') as string).trim();
    const lastName = (formData.get('last_name') as string).trim();

    if (!firstName) {
      setError('Введите имя');
      return;
    }
    if (!lastName) {
      setError('Введите фамилию');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Введите корректный email-адрес');
      return;
    }
    if (password.length < 8) {
      setError('Пароль должен содержать не менее 8 символов');
      return;
    }

    startTransition(async () => {
      const result = await register(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="auth-form-wrap">
      <div className="auth-switch">
        <Link href="/login">Вход</Link>
        <Link href="/register" className="active">
          Регистрация
        </Link>
      </div>

      <h1 className="auth-title">Создать аккаунт</h1>
      <p className="auth-sub">Запросите доступ к платформе DTEK Core</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-row">
          <label className="auth-field">
            <span className="auth-field-label">Имя</span>
            <input
              className="auth-input"
              name="first_name"
              placeholder="Анна"
              autoComplete="given-name"
              required
            />
          </label>
          <label className="auth-field">
            <span className="auth-field-label">Фамилия</span>
            <input
              className="auth-input"
              name="last_name"
              placeholder="Соколова"
              autoComplete="family-name"
              required
            />
          </label>
        </div>

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

        <label className="auth-field">
          <span className="auth-field-label">Пароль</span>
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

        {error && (
          <p className="auth-error">{error}</p>
        )}

        <button
          className="btn btn-primary btn-lg auth-submit"
          type="submit"
          disabled={isPending}
        >
          {isPending ? 'Создание аккаунта…' : 'Создать аккаунт'}
          {!isPending && <Icon name="chevR" size={16} />}
        </button>
      </form>

      <div className="auth-divider">
        <span>или</span>
      </div>

      <TooltipProvider>
        <div className="auth-sso">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="btn btn-ghost auth-sso-btn" disabled type="button">
                <Icon name="command" size={16} />
                Корпоративный SSO
              </button>
            </TooltipTrigger>
            <TooltipContent>Доступно в Enterprise</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="btn btn-ghost auth-sso-btn" disabled type="button">
                <Icon name="shield" size={16} />
                ЕСИА / Госуслуги
              </button>
            </TooltipTrigger>
            <TooltipContent>Доступно в Enterprise</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <p className="auth-foot">
        Уже зарегистрированы?{' '}
        <Link href="/login" className="link-inline">
          Войти
        </Link>
      </p>
    </div>
  );
}
