import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Регистрация — DTEK Core',
};

export default function RegisterPage() {
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

      <div className="auth-form">
        <div className="auth-row">
          <div className="auth-field">
            <span className="auth-field-label">Имя</span>
            <input className="auth-input" placeholder="Анна" disabled />
          </div>
          <div className="auth-field">
            <span className="auth-field-label">Фамилия</span>
            <input className="auth-input" placeholder="Соколова" disabled />
          </div>
        </div>
        <div className="auth-field">
          <span className="auth-field-label">Организация</span>
          <input className="auth-input" placeholder="АО «Меридиан-Энерго»" disabled />
        </div>
        <div className="auth-field">
          <span className="auth-field-label">Рабочий email</span>
          <input className="auth-input" placeholder="name@company.ru" type="email" disabled />
        </div>
        <div className="auth-field">
          <span className="auth-field-label">Пароль</span>
          <input className="auth-input" placeholder="••••••••••" type="password" disabled />
        </div>
        <button className="btn btn-primary btn-lg auth-submit" disabled>
          Создать аккаунт — реализуется в S02-T003
        </button>
      </div>

      <p className="auth-foot">
        Уже зарегистрированы?{' '}
        <Link href="/login" className="link-inline">
          Войти
        </Link>
      </p>
    </div>
  );
}
