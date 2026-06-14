'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { login } from '@/lib/actions/auth';
import { Icon } from '@/components/shared/icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

function toRussianError(msg: string): string {
  if (msg.toLowerCase().includes('invalid login credentials')) return 'Неверный email или пароль';
  if (msg.toLowerCase().includes('email not confirmed')) return 'Email не подтверждён. Проверьте почту.';
  if (msg.toLowerCase().includes('too many requests')) return 'Слишком много попыток. Попробуйте позже.';
  return msg;
}

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email.includes('@')) {
      setError('Введите корректный email-адрес');
      return;
    }
    if (!password) {
      setError('Введите пароль');
      return;
    }

    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(toRussianError(result.error));
      }
    });
  }

  return (
    <div className="auth-form-wrap">
      <div className="auth-switch">
        <Link href="/login" className="active">
          Вход
        </Link>
        <Link href="/register">Регистрация</Link>
      </div>

      <h1 className="auth-title">С возвращением</h1>
      <p className="auth-sub">Войдите в свою цифровую модель доверия</p>

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

        <label className="auth-field">
          <span className="auth-field-label">Пароль</span>
          <div className="auth-input-wrap">
            <Icon name="shield" size={15} className="auth-input-ico" />
            <input
              className="auth-input"
              name="password"
              type="password"
              placeholder="••••••••••"
              autoComplete="current-password"
              required
            />
          </div>
        </label>

        <div className="auth-aux">
          <label className="auth-check">
            <input type="checkbox" defaultChecked readOnly />
            <span>Запомнить меня</span>
          </label>
          <Link href="/forgot-password" className="auth-forgot">
            Забыли пароль?
          </Link>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button
          className="btn btn-primary btn-lg auth-submit"
          type="submit"
          disabled={isPending}
        >
          {isPending ? 'Вход…' : 'Войти в платформу'}
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
        Нет аккаунта?{' '}
        <Link href="/register" className="link-inline">
          Запросить доступ
        </Link>
      </p>
    </div>
  );
}
