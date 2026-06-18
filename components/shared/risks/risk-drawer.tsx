'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/shared/icon';
import { SeverityTag } from '@/components/shared/severity-tag';
import { Meter } from '@/components/shared/meter';
import type { RiskRow } from './risks-page-client';

// ── Constants ──────────────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'var(--crit)',
  high:     'var(--orange)',
  medium:   'var(--amber)',
  low:      'var(--info)',
};

const STATUS_LABELS: Record<string, string> = {
  open:        'Открыт',
  in_progress: 'В работе',
  accepted:    'Принят',
  mitigated:   'Устранён',
  closed:      'Закрыт',
};

const STATUS_TONE: Record<string, string> = {
  open:        'orange',
  in_progress: 'info',
  accepted:    'neutral',
  mitigated:   'teal',
  closed:      'neutral',
};

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

// ── Helpers ────────────────────────────────────────────────────────────────────

function riskAge(createdAt: string): string {
  const diffDays = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return '1 день';
  if (diffDays < 7)  return `${diffDays} дн`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед`;
  return `${Math.floor(diffDays / 30)} мес`;
}

function formatSla(dueDate: string | null): { label: string; overdue: boolean } {
  if (!dueDate) return { label: '—', overdue: false };
  const due = new Date(dueDate);
  if (due < new Date()) return { label: 'Просрочен', overdue: true };
  return {
    label: due.toLocaleDateString('ru', { day: 'numeric', month: 'short' }),
    overdue: false,
  };
}

// ── Component ──────────────────────────────────────────────────────────────────

interface RiskDrawerProps {
  risk: RiskRow;
  onClose: () => void;
}

export function RiskDrawer({ risk, onClose }: RiskDrawerProps) {
  const router     = useRouter();
  const sla        = formatSla(risk.due_date);
  const color      = SEVERITY_COLORS[risk.severity] ?? 'var(--teal)';
  const linkedObj  = risk.linked_objects[0] ?? null;
  const trustImpact = Math.round((risk.cvss_score ?? 5) * 2);
  const statusTone  = STATUS_TONE[risk.status] ?? 'neutral';
  const statusLabel = STATUS_LABELS[risk.status] ?? risk.status;
  const catLabel    = CATEGORY_LABELS[risk.category] ?? risk.category;
  const cvssValue   = risk.cvss_score != null ? risk.cvss_score * 10 : 0;
  const cvssDisplay = risk.cvss_score != null ? risk.cvss_score.toFixed(1) : '—';

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="drawer">

        {/* ── Head ── */}
        <div className="drawer-head">
          <div className="drawer-head-top">
            <SeverityTag value={risk.severity} />
            <button className="icon-btn sm" onClick={onClose} aria-label="Закрыть">
              <Icon name="x" size={16} />
            </button>
          </div>
          <h2 className="drawer-title">{risk.title}</h2>
          <div className="drawer-id mono">{risk.id.slice(0, 8).toUpperCase()}</div>
        </div>

        {/* ── Body ── */}
        <div className="drawer-body">

          {/* CVSS score */}
          <div className="drawer-score">
            <div className="drawer-score-val mono" style={{ color }}>
              {cvssDisplay}
            </div>
            <div className="drawer-score-info">
              <span className="drawer-score-label">Оценка риска (CVSS-подобная)</span>
              <Meter value={cvssValue} color={color} h={6} />
            </div>
          </div>

          {/* Meta grid */}
          <div className="drawer-meta">
            <Fact
              label="Объект"
              value={
                linkedObj ? (
                  <button
                    className="link-inline mono"
                    onClick={() => router.push(`/objects/${linkedObj.id}`)}
                  >
                    {linkedObj.name}
                  </button>
                ) : (
                  <span className="ot-dim">—</span>
                )
              }
            />
            <Fact label="Категория" value={catLabel} />
            <Fact
              label="Статус"
              value={
                <span className={`badge badge-${statusTone} soft`}>
                  <span className="badge-dot" />
                  {statusLabel}
                </span>
              }
            />
            <Fact label="Владелец" value={risk.owner_name ?? '—'} />
            <Fact label="Возраст"  value={riskAge(risk.created_at)} />
            <Fact
              label="SLA"
              value={
                <span className={sla.overdue ? 'sla-over' : ''}>{sla.label}</span>
              }
            />
            {risk.impact && <Fact label="Влияние" value={risk.impact} />}
          </div>

          {/* Trust impact */}
          <div>
            <h3 className="drawer-sec-title">Влияние на доверие</h3>
            <p className="drawer-text">
              Устранение этого риска повысит индекс доверия объекта ориентировочно на{' '}
              <span className="mono" style={{ color: 'var(--teal)' }}>+{trustImpact}</span>{' '}
              пунктов и снимет ограничение по сегменту.
            </p>
          </div>

          {/* Recommended actions */}
          <div>
            <h3 className="drawer-sec-title">Рекомендуемые действия</h3>
            <ul className="drawer-steps">
              <li>
                <span className="step-n mono">01</span>
                Назначить ответственного и срок устранения
              </li>
              <li>
                <span className="step-n mono">02</span>
                Применить компенсирующие меры (изоляция / патч)
              </li>
              <li>
                <span className="step-n mono">03</span>
                Запустить переоценку доверия объекта
              </li>
            </ul>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="drawer-foot">
          <button className="btn btn-ghost btn-sm" disabled title="Доступно в Sprint 07">
            Принять риск
          </button>
          <button className="btn btn-line btn-sm" disabled title="Доступно в Sprint 07">
            <Icon name="check" size={14} />
            Взять в работу
          </button>
        </div>

      </aside>
    </>
  );
}

// ── Sub-component ──────────────────────────────────────────────────────────────

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="fact">
      <span className="fact-label">{label}</span>
      <span className="fact-value">{value}</span>
    </div>
  );
}
