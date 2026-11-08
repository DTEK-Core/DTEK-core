import type { Metadata } from 'next';
import { LoginForm } from '@/components/shared/auth/login-form';

export const metadata: Metadata = {
  title: 'Вход — DTEK Core',
};

const ACCOUNT_BLOCKED_MESSAGE =
  'Доступ к аккаунту приостановлен. Обратитесь к администратору организации.';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const initialError = error === 'account_blocked' ? ACCOUNT_BLOCKED_MESSAGE : undefined;

  return <LoginForm initialError={initialError} />;
}
