import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Онбординг — DTEK Core',
};

// Onboarding wizard — implemented in S02-T007
export default function WizardPage() {
  return (
    <div className="ob-page">
      <div className="ob-head">
        <h1 className="ob-title">Организация создана!</h1>
        <p className="ob-sub">Мастер настройки будет доступен в следующем обновлении</p>
      </div>
    </div>
  );
}
