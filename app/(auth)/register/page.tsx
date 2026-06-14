import type { Metadata } from 'next';
import { RegisterForm } from '@/components/shared/auth/register-form';

export const metadata: Metadata = {
  title: 'Регистрация — DTEK Core',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
