import type { Metadata } from 'next';
import { CreateOrgForm } from '@/components/shared/onboarding/create-org-form';

export const metadata: Metadata = {
  title: 'Создание организации — DTEK Core',
};

export default function CreateOrgPage() {
  return <CreateOrgForm />;
}
