import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import { TrustRing } from '@/components/shared/trust-ring';

const CHECKPOINTS = [
  'Паспорт доверия для каждого объекта',
  'Прозрачная оценка по факторам',
  'Граф связей и влияния рисков',
] as const;

function CheckIcon() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth">
      <aside className="auth-aside">
        <div className="auth-grid-bg" />

        <Link href="/" className="auth-brand">
          <Logo size={30} />
          <span className="brand-name">
            DTEK<span className="brand-core">Core</span>
          </span>
        </Link>

        <div className="auth-aside-body">
          <div className="auth-aside-ring">
            <TrustRing value={74} size={128} stroke={9} sub="доверие" />
          </div>
          <h2 className="auth-aside-title">
            Командный центр
            <br />
            цифрового доверия
          </h2>
          <p className="auth-aside-text">
            Единая модель организации: объекты, риски, связи и оценка доверия в реальном времени.
          </p>
          <div className="auth-aside-points">
            {CHECKPOINTS.map((point) => (
              <div className="auth-point" key={point}>
                <CheckIcon />
                {point}
              </div>
            ))}
          </div>
        </div>

        <div className="auth-aside-foot mono">ISO 27001 · ФСТЭК · Enterprise-grade</div>
      </aside>

      <main className="auth-main">{children}</main>
    </div>
  );
}
