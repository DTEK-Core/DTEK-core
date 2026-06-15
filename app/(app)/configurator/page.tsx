import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Конфигуратор — DTEK Core',
};

export default function ConfiguratorPage() {
  return (
    <div className="screen">
      <div className="screen-head">
        <h1 className="screen-title">Конфигуратор</h1>
        <p className="screen-sub">Раздел в разработке</p>
      </div>
    </div>
  );
}
