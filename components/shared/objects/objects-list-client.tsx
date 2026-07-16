'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/shared/icon';
import { TrustRing } from '@/components/shared/trust-ring';
import { CritTag } from '@/components/shared/crit-tag';
import { TrustChip } from '@/components/shared/trust-chip';
import { FilterSelect } from '@/components/shared/filter-select';
import { SortCaret } from '@/components/shared/sort-caret';
import { ObjectFormDialog } from '@/components/shared/objects/object-form-dialog';
import { ObjectImportDialog } from '@/components/shared/objects/object-import-dialog';
import { getTrustBand, OBJECT_TYPES, TRUST_BANDS, typeGlyph } from '@/lib/design-tokens';
import { relativeTime } from '@/lib/utils/dates';

interface TrustPassportSummary {
  risk_count: number | null;
  open_risk_count: number | null;
  connection_count: number | null;
}

export interface ObjItem {
  id: string;
  name: string;
  type: string;
  criticality: string;
  status: string;
  trust_score: number;
  trust_level: string;
  ip_address: string | null;
  os_platform: string | null;
  segment: string | null;
  exposure: string | null;
  updated_at: string;
  trust_passports: TrustPassportSummary | null;
}

const TYPE_OPTIONS = [
  { value: 'all', label: 'Все типы' },
  ...OBJECT_TYPES.map(t => ({ value: t.key, label: t.label })),
];

const BAND_OPTIONS = [
  { value: 'all', label: 'Любой' },
  ...TRUST_BANDS.slice().reverse().map(b => ({ value: b.key, label: b.label })),
];

const EXPOSURE_LABELS: Record<string, string> = {
  internal: 'Внутренний',
  external: 'Внешний',
  isolated: 'Изолированный',
};


function typeLabel(type: string): string {
  return OBJECT_TYPES.find(t => t.key === type)?.label ?? type;
}

interface ObjectsListClientProps {
  objects: ObjItem[];
  userRole: string;
  totalInOrg: number;
  initialImportOpen?: boolean;
}

type SortKey = 'name' | 'risks' | 'trust';

export function ObjectsListClient({ objects, userRole, totalInOrg, initialImportOpen = false }: ObjectsListClientProps) {
  const router = useRouter();
  const canCreate = userRole === 'owner' || userRole === 'analyst' || userRole === 'admin';
  const [q, setQ] = useState('');
  const [typeF, setTypeF] = useState('all');
  const [bandF, setBandF] = useState('all');
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'trust', dir: 'asc' });

  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(initialImportOpen && canCreate);

  const setSortKey = (key: SortKey) => {
    setSort(s => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));
  };

  let rows = objects.filter(o => {
    if (q) {
      const lq = q.toLowerCase();
      if (!o.name.toLowerCase().includes(lq) && !o.id.toLowerCase().includes(lq)) return false;
    }
    if (typeF !== 'all' && o.type !== typeF) return false;
    if (bandF !== 'all' && getTrustBand(o.trust_score).key !== bandF) return false;
    return true;
  });

  rows = [...rows].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    if (sort.key === 'name') return a.name.localeCompare(b.name, 'ru') * dir;
    if (sort.key === 'risks') return ((a.trust_passports?.open_risk_count ?? 0) - (b.trust_passports?.open_risk_count ?? 0)) * dir;
    return (a.trust_score - b.trust_score) * dir;
  });

  return (
    <div className="screen">
      {/* Header */}
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Объекты</h1>
          <p className="screen-sub">
            {totalInOrg.toLocaleString('ru')} объектов в цифровой модели · {rows.length} показано
          </p>
        </div>
        <div className="screen-head-actions">
          <button className="btn btn-ghost btn-sm" disabled>
            <Icon name="download" size={14} />
            Экспорт
          </button>
          {canCreate && (
            <>
              <button className="btn btn-line btn-sm" onClick={() => setShowImport(true)}>
                <Icon name="upload" size={14} />
                Импорт
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowAdd(true)}
              >
                <Icon name="plus" size={14} />
                Добавить объект
              </button>
            </>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <Icon name="search" size={16} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Поиск по имени или ID…"
          />
        </div>
        <div className="toolbar-filters">
          <FilterSelect label="Тип" value={typeF} options={TYPE_OPTIONS} onChange={setTypeF} />
          <FilterSelect label="Уровень" value={bandF} options={BAND_OPTIONS} onChange={setBandF} />
          <div className="segment">
            <button
              type="button"
              className={`segment-btn${view === 'table' ? ' active' : ''}`}
              onClick={() => setView('table')}
              title="Таблица"
            >
              ☰
            </button>
            <button
              type="button"
              className={`segment-btn${view === 'cards' ? ' active' : ''}`}
              onClick={() => setView('cards')}
              title="Карточки"
            >
              ▦
            </button>
          </div>
        </div>
      </div>

      <ObjectFormDialog
        open={showAdd}
        onOpenChange={setShowAdd}
        userRole={userRole}
      />
      <ObjectImportDialog
        open={showImport}
        onOpenChange={setShowImport}
        canImportRisks={userRole === 'owner' || userRole === 'analyst'}
      />

      {/* Content */}
      {rows.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-ico">
              <Icon name="objects" size={24} />
            </div>
            <div className="empty-title">Объекты не найдены</div>
            <p className="empty-text">Измените фильтры или добавьте объект в цифровую модель организации.</p>
            {canCreate && (
              <button
                className="btn btn-line btn-sm"
                style={{ marginTop: 8 }}
                onClick={() => setShowAdd(true)}
              >
                <Icon name="plus" size={14} />
                Добавить объект
              </button>
            )}
          </div>
        </div>
      ) : view === 'table' ? (
        <ObjectsTable rows={rows} sort={sort} setSortKey={setSortKey} onRow={id => router.push(`/objects/${id}`)} />
      ) : (
        <ObjectsCards rows={rows} onCard={id => router.push(`/objects/${id}`)} />
      )}
    </div>
  );
}

/* ---------- Table view ---------- */

interface TableProps {
  rows: ObjItem[];
  sort: { key: SortKey; dir: 'asc' | 'desc' };
  setSortKey: (k: SortKey) => void;
  onRow: (id: string) => void;
}

function ObjectsTable({ rows, sort, setSortKey, onRow }: TableProps) {
  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="otable">
        <div className="otable-head">
          <button className="oth" onClick={() => setSortKey('name')}>
            Объект <SortCaret active={sort.key === 'name'} dir={sort.dir} />
          </button>
          <span className="oth">Тип</span>
          <span className="oth">Сегмент</span>
          <span className="oth">Критичность</span>
          <button className="oth oth-c" onClick={() => setSortKey('risks')}>
            Риски <SortCaret active={sort.key === 'risks'} dir={sort.dir} />
          </button>
          <button className="oth oth-c" onClick={() => setSortKey('trust')}>
            Доверие <SortCaret active={sort.key === 'trust'} dir={sort.dir} />
          </button>
          <span className="oth oth-c">Обновлён</span>
        </div>

        {rows.map(o => {
          const riskCount = o.trust_passports?.open_risk_count ?? 0;
          return (
            <button
              key={o.id}
              className="otable-row"
              onClick={() => onRow(o.id)}
            >
              <span className="ot-name">
                <span className="ot-type-ico">
                  <Icon name={typeGlyph(o.type)} size={16} />
                </span>
                <span className="ot-name-text">
                  <span className="ot-name-main">{o.name}</span>
                  <span className="ot-name-sub mono">
                    {o.id.slice(0, 8)} · {EXPOSURE_LABELS[o.exposure ?? ''] ?? '—'}
                  </span>
                </span>
              </span>
              <span className="ot-cell ot-dim">{typeLabel(o.type)}</span>
              <span className="ot-cell ot-dim">{o.segment ?? '—'}</span>
              <span className="ot-cell">
                <CritTag value={o.criticality} />
              </span>
              <span className="ot-cell ot-c">
                {riskCount > 0 ? (
                  <span className="ot-risks">
                    <Icon name="risk" size={12} />{riskCount}
                  </span>
                ) : (
                  <span className="ot-zero mono">0</span>
                )}
              </span>
              <span className="ot-cell ot-c">
                <TrustChip value={o.trust_score} />
              </span>
              <span className="ot-cell ot-c ot-dim mono">
                {relativeTime(o.updated_at)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Cards view ---------- */

interface CardsProps {
  rows: ObjItem[];
  onCard: (id: string) => void;
}

function ObjectsCards({ rows, onCard }: CardsProps) {
  return (
    <div className="ocards">
      {rows.map(o => {
        const band = getTrustBand(o.trust_score);
        const riskCount = o.trust_passports?.open_risk_count ?? 0;
        const connCount = o.trust_passports?.connection_count ?? 0;
        return (
          <button
            key={o.id}
            className="ocard"
            style={{ '--c': band.color } as React.CSSProperties}
            onClick={() => onCard(o.id)}
          >
            <div className="ocard-top">
              <span className="ocard-type">
                <Icon name={typeGlyph(o.type)} size={18} />
              </span>
              <TrustRing value={o.trust_score} size={56} stroke={5} label sub="" animate={false} />
            </div>
            <div className="ocard-name">{o.name}</div>
            <div className="ocard-id mono">{o.id.slice(0, 8)}</div>
            <div className="ocard-meta">
              <CritTag value={o.criticality} />
              {o.segment && <span className="ocard-seg">{o.segment}</span>}
            </div>
            <div className="ocard-foot">
              <span className="ocard-risks">
                {riskCount > 0 ? (
                  <><Icon name="risk" size={12} />{riskCount} риск(ов)</>
                ) : (
                  'Без рисков'
                )}
              </span>
              <span className="ocard-conns mono">
                <Icon name="link" size={12} />{connCount}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
