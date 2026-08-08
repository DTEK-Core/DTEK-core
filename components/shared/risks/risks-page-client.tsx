'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/shared/icon';
import { FilterSelect } from '@/components/shared/filter-select';
import { RiskDrawer } from './risk-drawer';
import { RiskFormDialog, type EditableRisk } from './risk-form-dialog';
import { RiskImportDialog } from './risk-import-dialog';
import { formatSla } from '@/lib/utils/dates';
import type { RiskImpactHint } from '@/lib/trust/explainability';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface LinkedObj {
  id: string;
  name: string;
  impactHint: RiskImpactHint | null;
}

export interface SimpleObj {
  id: string;
  name: string;
  type: string;
}

export interface RiskAssignee {
  id: string;
  full_name: string;
  role: string;
}

export interface RiskRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  severity: string;
  probability: string | null;
  cvss_score: number | null;
  status: string;
  impact: string | null;
  sla_days: number | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  owner_id: string | null;
  owner_name: string | null;
  owner_is_active: boolean;
  author_name: string | null;
  linked_objects: LinkedObj[];
}

interface RisksPageClientProps {
  risks: RiskRow[];
  userRole: string;
  objects: SimpleObj[];
  assignees: RiskAssignee[];
  initialImportOpen?: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'var(--crit)',
  high:     'var(--orange)',
  medium:   'var(--amber)',
  low:      'var(--info)',
};

const SEVERITY_CARDS = [
  { key: 'critical', label: 'Критические' },
  { key: 'high',     label: 'Высокие'     },
  { key: 'medium',   label: 'Средние'     },
  { key: 'low',      label: 'Низкие'      },
] as const;

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

const STATUS_OPTIONS = [
  { value: 'all',         label: 'Все статусы' },
  { value: 'open',        label: 'Открыт'      },
  { value: 'in_progress', label: 'В работе'    },
  { value: 'accepted',    label: 'Принят'      },
  { value: 'mitigated',   label: 'Устранён'    },
  { value: 'closed',      label: 'Закрыт'      },
];

function toEditable(r: RiskRow): EditableRisk {
  return {
    id:          r.id,
    title:       r.title,
    description: r.description,
    category:    r.category,
    severity:    r.severity,
    probability: r.probability,
    cvss_score:  r.cvss_score,
    impact:      r.impact,
    sla_days:    r.sla_days,
    due_date:    r.due_date,
    owner_id:    r.owner_id,
    owner_name:  r.owner_name,
    owner_is_active: r.owner_is_active,
  };
}

// ── Component ──────────────────────────────────────────────────────────────────

export function RisksPageClient({ risks, userRole, objects, assignees, initialImportOpen = false }: RisksPageClientProps) {
  const router = useRouter();
  const canCreate = ['owner', 'analyst'].includes(userRole);
  const [q, setQ]             = useState('');
  const [sevFilter, setSev]   = useState('all');
  const [statFilter, setStat] = useState('all');
  const [selectedId, setSelectedId]       = useState<string | null>(null);
  const [showCreateDialog, setShowCreate] = useState(false);
  const [showImportDialog, setShowImport] = useState(initialImportOpen && canCreate);
  const [editRisk, setEditRisk]           = useState<EditableRisk | null>(null);

  const canExport = ['owner', 'analyst'].includes(userRole);

  const activeCount = risks.filter(r => r.status === 'open' || r.status === 'in_progress').length;

  const counts = {
    critical: risks.filter(r => r.severity === 'critical').length,
    high:     risks.filter(r => r.severity === 'high').length,
    medium:   risks.filter(r => r.severity === 'medium').length,
    low:      risks.filter(r => r.severity === 'low').length,
  };

  const rows = risks
    .filter(r => {
      if (q) {
        const lq = q.toLowerCase();
        const titleMatch = r.title.toLowerCase().includes(lq);
        const idMatch    = r.id.toLowerCase().includes(lq);
        const objMatch   = r.linked_objects.some(o => o.name.toLowerCase().includes(lq));
        if (!titleMatch && !idMatch && !objMatch) return false;
      }
      if (sevFilter  !== 'all' && r.severity !== sevFilter)  return false;
      if (statFilter !== 'all' && r.status   !== statFilter) return false;
      return true;
    })
    .sort((a, b) => (b.cvss_score ?? 0) - (a.cvss_score ?? 0));

  const selected = selectedId ? (risks.find(r => r.id === selectedId) ?? null) : null;
  const exportParams = new URLSearchParams();
  if (q.trim()) exportParams.set('q', q.trim());
  if (sevFilter !== 'all') exportParams.set('severity', sevFilter);
  if (statFilter !== 'all') exportParams.set('status', statFilter);
  const exportHref = `/api/reports/risks${exportParams.size > 0 ? `?${exportParams.toString()}` : ''}`;

  return (
    <div className="screen">
      {/* ── Head ── */}
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Реестр рисков</h1>
          <p className="screen-sub">
            {activeCount} активных рисков · приоритизация по влиянию на доверие
          </p>
        </div>
        <div className="screen-head-actions">
          {canExport ? (
            <Link className="btn btn-ghost btn-sm" href={exportHref}>
              <Icon name="download" size={14} />
              CSV
            </Link>
          ) : (
            <button className="btn btn-ghost btn-sm" disabled title="Экспорт доступен владельцу и аналитику ИБ">
              <Icon name="download" size={14} />
              CSV
            </button>
          )}
          {canCreate && (
            <>
              <button className="btn btn-line btn-sm" onClick={() => setShowImport(true)}>
                <Icon name="upload" size={14} />
                Импорт
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowCreate(true)}
              >
                <Icon name="plus" size={14} />
                Зарегистрировать риск
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="risk-summary">
        {SEVERITY_CARDS.map(({ key, label }) => (
          <button
            key={key}
            className={`rsum${sevFilter === key ? ' active' : ''}`}
            style={{ '--c': SEVERITY_COLORS[key] } as React.CSSProperties}
            onClick={() => setSev(sevFilter === key ? 'all' : key)}
          >
            <span className="rsum-bar" />
            <span className="rsum-count mono">{counts[key]}</span>
            <span className="rsum-label">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="toolbar">
        <div className="search-box">
          <span style={{ opacity: 0.5, display: 'flex' }}><Icon name="search" size={16} /></span>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Поиск по риску, объекту или ID…"
          />
        </div>
        <div className="toolbar-filters">
          <FilterSelect
            label="Статус"
            value={statFilter}
            onChange={setStat}
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      {/* ── Table or empty state ── */}
      {rows.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-ico"><Icon name="shield" size={28} /></div>
            <div className="empty-title">Рисков не найдено</div>
            <p className="empty-text">По заданным фильтрам активных рисков нет.</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="rtable">
            <div className="rtable-head">
              <span className="rth">Риск</span>
              <span className="rth">Объект</span>
              <span className="rth">Ответственный</span>
              <span className="rth">Категория</span>
              <span className="rth">Статус</span>
              <span className="rth rth-c">SLA</span>
              <span className="rth rth-c">Оценка</span>
            </div>

            {rows.map(r => {
              const sla        = formatSla(r.due_date, r.status);
              const statusTone = STATUS_TONE[r.status] ?? 'neutral';
              const statusLbl  = STATUS_LABELS[r.status] ?? r.status;
              const catLbl     = CATEGORY_LABELS[r.category] ?? r.category;
              const linkedObj  = r.linked_objects[0] ?? null;
              const scoreColor = SEVERITY_COLORS[r.severity] ?? 'var(--teal)';

              return (
                <div
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  className={`rtable-row${selectedId === r.id ? ' sel' : ''}`}
                  onClick={() => setSelectedId(r.id)}
                  onKeyDown={e => e.key === 'Enter' && setSelectedId(r.id)}
                >
                  {/* Title + ID */}
                  <span className="rt-title">
                    <span
                      className={`rt-sev sev-${r.severity}`}
                      style={{ background: SEVERITY_COLORS[r.severity] ?? undefined }}
                    />
                    <span className="rt-title-text">
                      <span className="rt-title-main">{r.title}</span>
                      <span className="rt-title-sub mono">{r.id.slice(0, 8).toUpperCase()}</span>
                    </span>
                  </span>

                  {/* Object name */}
                  {linkedObj ? (
                    <button
                      className="rt-obj mono"
                      onClick={e => {
                        e.stopPropagation();
                        router.push(`/objects/${linkedObj.id}`);
                      }}
                    >
                      {linkedObj.name}
                    </button>
                  ) : (
                    <span className="rt-cell ot-dim">—</span>
                  )}

                  {/* Assigned owner */}
                  <span className={`rt-cell rt-owner${r.owner_name ? '' : ' ot-dim'}`}>
                    {r.owner_name ?? 'Не назначен'}
                  </span>

                  {/* Category */}
                  <span className="rt-cell ot-dim">{catLbl}</span>

                  {/* Status badge */}
                  <span className="rt-cell">
                    <span className={`badge badge-${statusTone} soft`}>
                      <span className="badge-dot" />
                      {statusLbl}
                    </span>
                  </span>

                  {/* SLA */}
                  <span className={`rt-cell rt-c sla-indicator sla-${sla.state}`}>
                    <span className="sla-state">{sla.label}</span>
                    {sla.dateLabel && <span className="sla-date mono">{sla.dateLabel}</span>}
                  </span>

                  {/* CVSS score */}
                  <span className="rt-cell rt-c">
                    <span className="rt-score mono" style={{ color: scoreColor }}>
                      {r.cvss_score != null ? r.cvss_score.toFixed(1) : '—'}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Drawer ── */}
      {selected && (
        <RiskDrawer
          risk={selected}
          objects={objects}
          onClose={() => setSelectedId(null)}
          onEdit={canCreate ? () => { setEditRisk(toEditable(selected)); setSelectedId(null); } : undefined}
        />
      )}

      {/* ── Create dialog ── */}
      <RiskFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreate}
        objects={objects}
        assignees={assignees}
      />

      <RiskImportDialog open={showImportDialog} onOpenChange={setShowImport} />

      {/* ── Edit dialog ── */}
      <RiskFormDialog
        open={editRisk !== null}
        onOpenChange={v => { if (!v) setEditRisk(null); }}
        editRisk={editRisk}
        objects={objects}
        assignees={assignees}
        onDeleted={() => { setEditRisk(null); setSelectedId(null); }}
      />
    </div>
  );
}
