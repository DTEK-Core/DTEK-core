'use client';

import { useRouter } from 'next/navigation';

const CATEGORY_LABELS: Record<string, string> = {
  vulnerability:  'Уязвимость',
  configuration:  'Конфигурация',
  access:         'Доступ',
  network:        'Сеть',
  compliance:     'Соответствие',
  incident:       'Инцидент',
  monitoring:     'Мониторинг',
  organizational: 'Организационный',
  physical:       'Физический',
  human:          'Человеческий',
  other:          'Прочее',
};

const STATUS_TONE: Record<string, string> = {
  open:        'orange',
  in_progress: 'info',
  accepted:    'neutral',
  mitigated:   'teal',
  closed:      'neutral',
};

const STATUS_LABELS: Record<string, string> = {
  open:        'Открыт',
  in_progress: 'В работе',
  accepted:    'Принят',
  mitigated:   'Устранён',
  closed:      'Закрыт',
};

export interface RiskItem {
  id: string;
  title: string;
  severity: string;
  status: string;
  category: string;
  cvss_score: number | null;
  due_date: string | null;
}

interface RiskMiniTableProps {
  risks: RiskItem[];
  bare?: boolean;
}

export function RiskMiniTable({ risks, bare }: RiskMiniTableProps) {
  const router = useRouter();

  const body = (
    <div className="rmini">
      {risks.map(r => (
        <button
          key={r.id}
          className="rmini-row"
          onClick={() => router.push('/risks')}
        >
          <span className={`rmini-sev sev-${r.severity}`} />
          <span className="rmini-info">
            <span className="rmini-title">{r.title}</span>
            <span className="rmini-meta mono">
              {r.id.slice(0, 8)} · {CATEGORY_LABELS[r.category] ?? r.category}
            </span>
          </span>
          <span className={`badge badge-${STATUS_TONE[r.status] ?? 'neutral'} soft`}>
            {STATUS_LABELS[r.status] ?? r.status}
          </span>
          {r.cvss_score != null && (
            <span className="rmini-score mono">{r.cvss_score}</span>
          )}
        </button>
      ))}
    </div>
  );

  return bare ? body : (
    <div className="card" style={{ padding: 8 }}>{body}</div>
  );
}
