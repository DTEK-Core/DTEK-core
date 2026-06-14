import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/shared/auth/forgot-password-form';

export const metadata: Metadata = {
  title: 'Сброс пароля — DTEK Core',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
