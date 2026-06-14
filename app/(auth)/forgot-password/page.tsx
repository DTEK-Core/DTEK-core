import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Восстановление пароля — DTEK Core',
};

export default function ForgotPasswordPage() {
  return (
    <div className="auth-form-wrap">
      <h1 className="auth-title">Забыли пароль?</h1>
      <p className="auth-sub">Введите email — пришлём ссылку для сброса</p>

      <div className="auth-form">
        <div className="auth-field">
          <span className="auth-field-label">Рабочий email</span>
          <input className="auth-input" placeholder="name@company.ru" type="email" disabled />
        </div>
        <button className="btn btn-primary btn-lg auth-submit" disabled>
          Отправить ссылку — реализуется в S02-T004
        </button>
      </div>

      <p className="auth-foot">
        <Link href="/login" className="link-inline">
          ← Вернуться ко входу
        </Link>
      </p>
    </div>
  );
}
