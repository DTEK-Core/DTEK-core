import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Настройки — DTEK Core',
};

export default function SettingsPage() {
  return (
    <div className="screen">
      <div className="screen-head">
        <h1 className="screen-title">Настройки</h1>
        <p className="screen-sub">Раздел в разработке</p>
      </div>
    </div>
  );
}
