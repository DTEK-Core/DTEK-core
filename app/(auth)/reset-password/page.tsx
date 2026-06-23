import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/shared/auth/reset-password-form';

export const metadata: Metadata = {
  title: 'Новый пароль — DTEK Core',
};

// Supabase PKCE recovery flow passes ?code= as a query param.
// We forward it to the Client Component which exchanges it for a session.
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  return <ResetPasswordForm code={code} />;
}
