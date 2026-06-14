import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Центр управления — DTEK Core',
};

export default function DashboardPage() {
  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Центр управления</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 14, marginTop: 4 }}>
            Dashboard будет реализован в S02-T005
          </p>
        </div>
      </div>
    </div>
  );
}
