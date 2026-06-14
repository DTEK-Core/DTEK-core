import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Вход — DTEK Core',
};

export default function LoginPage() {
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

      <div className="auth-form">
        <div className="auth-field">
          <span className="auth-field-label">Рабочий email</span>
          <div className="auth-input-wrap">
            <input className="auth-input" placeholder="name@company.ru" type="email" disabled />
          </div>
        </div>
        <div className="auth-field">
          <span className="auth-field-label">Пароль</span>
          <div className="auth-input-wrap">
            <input className="auth-input" placeholder="••••••••••" type="password" disabled />
          </div>
        </div>
        <button className="btn btn-primary btn-lg auth-submit" disabled>
          Войти в платформу — реализуется в S02-T004
        </button>
      </div>

      <div className="auth-divider">
        <span>или</span>
      </div>
      <div className="auth-sso">
        <button className="btn btn-ghost auth-sso-btn" disabled>
          Корпоративный SSO
        </button>
        <button className="btn btn-ghost auth-sso-btn" disabled>
          ЕСИА / Госуслуги
        </button>
      </div>

      <p className="auth-foot">
        Нет аккаунта?{' '}
        <Link href="/register" className="link-inline">
          Запросить доступ
        </Link>
      </p>
    </div>
  );
}
