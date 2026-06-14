import type { Metadata } from 'next';
import { LoginForm } from '@/components/shared/auth/login-form';

export const metadata: Metadata = {
  title: 'Вход — DTEK Core',
};

export default function LoginPage() {
  return <LoginForm />;
}
