import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Пользователи — DTEK Core',
};

export default function UsersPage() {
  return (
    <div className="screen">
      <div className="screen-head">
        <h1 className="screen-title">Пользователи</h1>
        <p className="screen-sub">Раздел в разработке</p>
      </div>
    </div>
  );
}
