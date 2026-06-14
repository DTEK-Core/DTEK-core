import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Настройка организации — DTEK Core',
};

// Placeholder — replaced in S02-T006 (create-org form + redirect logic)
export default function OnboardingPage() {
  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Добро пожаловать в DTEK Core</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 14, marginTop: 4 }}>
            Настройка организации будет доступна в S02-T006
          </p>
        </div>
      </div>
    </div>
  );
}
