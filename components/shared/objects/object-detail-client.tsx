'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/shared/icon';
import { TrustRing } from '@/components/shared/trust-ring';
import { CritTag } from '@/components/shared/crit-tag';
import { ObjectFormDialog, type EditableObject } from '@/components/shared/objects/object-form-dialog';
import { FactorBreakdown, type FactorItem } from '@/components/shared/objects/factor-breakdown';
import { RiskMiniTable, type RiskItem } from '@/components/shared/objects/risk-mini-table';
import { ConnList, type RelatedObject } from '@/components/shared/objects/conn-list';
import { HistoryTimeline, type HistoryEntry } from '@/components/shared/objects/history-timeline';
export type { HistoryEntry };
import { getTrustBand, TRUST_FACTORS, OBJECT_TYPES, typeGlyph } from '@/lib/design-tokens';

// ── Public types (re-exported for the Server Component page) ───────────────────

export interface DetailObject {
  id: string;
  name: string;
  type: string;
  description: string | null;
  criticality: string;
  status: string;
  trust_score: number;
  trust_level: string;
  ip_address: string | null;
  os_platform: string | null;
  segment: string | null;
  exposure: string | null;
  created_at: string;
  updated_at: string;
  owner_name: string | null;
}

export interface PassportData {
  trust_score: number;
  trust_level: string;
  vuln_score: number;
  config_score: number;
  access_score: number;
  network_score: number;
  compliance_score: number;
  incident_score: number;
  risk_count: number;
  open_risk_count: number;
  critical_risk_count: number;
  connection_count: number;
  completeness_pct: number;
  calculated_at: string | null;
}

export type { RiskItem, RelatedObject };

// ── Module constants ────────────────────────────────────────────────────────────

const EXPOSURE_LABELS: Record<string, string> = {
  internal: 'Внутренний',
  external: 'Внешний',
  isolated: 'Изолированный',
};

const BAND_TONE: Record<string, string> = {
  critical: 'crit',
  low:      'orange',
  medium:   'amber',
  good:     'teal',
  high:     'teal',
};

const FACTOR_DESCS: Record<string, string> = {
  vuln:       'Управление уязвимостями: сканирование, патчинг, устранение CVE',
  config:     'Соответствие конфигурации стандартам безопасности и best practices',
  access:     'Управление доступом, принцип минимальных привилегий, MFA',
  network:    'Сетевая защита, сегментация, мониторинг трафика',
  compliance: 'Соответствие регуляторным требованиям и внутренним политикам',
  incident:   'История инцидентов, скорость реагирования и устранения',
};

function relativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  if (diff < 172800) return 'Вчера';
  if (diff < 604800) return `${Math.floor(diff / 86400)} дн назад`;
  return new Date(iso).toLocaleDateString('ru', { day: 'numeric', month: 'short' });
}

function typeLabel(type: string): string {
  return OBJECT_TYPES.find(t => t.key === type)?.label ?? type;
}

function makeFactors(passport: PassportData | null): FactorItem[] {
  const scores = passport
    ? {
        vuln:       passport.vuln_score,
        config:     passport.config_score,
        access:     passport.access_score,
        network:    passport.network_score,
        compliance: passport.compliance_score,
        incident:   passport.incident_score,
      }
    : {} as Record<string, number>;

  return TRUST_FACTORS.map(f => ({
    key:    f.key,
    label:  f.label,
    weight: f.weight,
    score:  scores[f.key] ?? 70,
    desc:   FACTOR_DESCS[f.key] ?? '',
  }));
}

// ── Component ──────────────────────────────────────────────────────────────────

type TabKey = 'overview' | 'factors' | 'risks' | 'conns' | 'history';

interface ObjectDetailClientProps {
  object:         DetailObject;
  passport:       PassportData | null;
  risks:          RiskItem[];
  related:        RelatedObject[];
  historyEntries: HistoryEntry[];
  userRole:       string;
}

export function ObjectDetailClient({
  object,
  passport,
  risks,
  related,
  historyEntries,
  userRole,
}: ObjectDetailClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>('overview');
  const [showEdit, setShowEdit] = useState(false);

  const band    = getTrustBand(object.trust_score);
  const factors = makeFactors(passport);
  const canEdit = ['owner', 'analyst', 'admin'].includes(userRole);

  const tabs = [
    { key: 'overview', label: 'Обзор' },
    { key: 'factors',  label: 'Факторы доверия' },
    { key: 'risks',    label: `Риски · ${risks.length}` },
    { key: 'conns',    label: `Связи · ${related.length}` },
    { key: 'history',  label: 'История' },
  ] satisfies { key: TabKey; label: string }[];

  const editObject: EditableObject = {
    id:          object.id,
    name:        object.name,
    type:        object.type,
    description: object.description,
    criticality: object.criticality,
    ip_address:  object.ip_address,
    os_platform: object.os_platform,
    segment:     object.segment,
    exposure:    object.exposure,
    status:      object.status,
  };

  const metaParts = [
    object.id.slice(0, 8),
    typeLabel(object.type),
    object.segment,
    object.ip_address,
  ].filter(Boolean);

  return (
    <div className="screen">
      {/* ── Head ── */}
      <div className="detail-head">
        <div className="detail-id">
          <span
            className="detail-type-ico"
            style={{ '--c': band.color } as React.CSSProperties}
          >
            <Icon name={typeGlyph(object.type)} size={22} />
          </span>
          <div>
            <div className="detail-title-row">
              <h1 className="detail-title">{object.name}</h1>
              <CritTag value={object.criticality} />
            </div>
            <div className="detail-meta mono">{metaParts.join(' · ')}</div>
          </div>
        </div>

        <div className="detail-actions">
          {canEdit && (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowEdit(true)}>
              <Icon name="edit" size={14} />
              Редактировать
            </button>
          )}
          <button
            className="btn btn-ghost btn-sm"
            disabled
            title="Доступно в Sprint 05"
          >
            <Icon name="refresh" size={14} />
            Переоценить
          </button>
          <button
            className="btn btn-line btn-sm"
            onClick={() => router.push(`/objects/${object.id}/passport`)}
          >
            <Icon name="passport" size={14} />
            Паспорт доверия
          </button>
        </div>
      </div>

      {/* ── Strip ── */}
      <div className="detail-strip">
        <div className="dstrip-ring">
          <TrustRing value={object.trust_score} size={96} stroke={7} sub="доверие" />
        </div>
        <div className="dstrip-facts">
          <div className="fact">
            <span className="fact-label">Уровень</span>
            <span className="fact-value">
              <span className={`badge badge-${BAND_TONE[band.key] ?? 'neutral'} soft`}>
                {band.label}
              </span>
            </span>
          </div>
          <div className="fact">
            <span className="fact-label">Открытых рисков</span>
            <span className="fact-value mono">
              {passport?.open_risk_count ?? risks.length}
            </span>
          </div>
          <div className="fact">
            <span className="fact-label">Связей</span>
            <span className="fact-value mono">
              {passport?.connection_count ?? related.length}
            </span>
          </div>
          <div className="fact">
            <span className="fact-label">Экспозиция</span>
            <span className="fact-value">
              {EXPOSURE_LABELS[object.exposure ?? ''] ?? '—'}
            </span>
          </div>
          <div className="fact">
            <span className="fact-label">Владелец</span>
            <span className="fact-value">{object.owner_name ?? '—'}</span>
          </div>
          <div className="fact">
            <span className="fact-label">Платформа</span>
            <span className="fact-value mono">{object.os_platform ?? '—'}</span>
          </div>
          <div className="fact">
            <span className="fact-label">Сегмент</span>
            <span className="fact-value">{object.segment ?? '—'}</span>
          </div>
          <div className="fact">
            <span className="fact-label">Обновлён</span>
            <span className="fact-value mono">{relativeTime(object.updated_at)}</span>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {tab === 'overview' && (
        <OverviewTab factors={factors} risks={risks} related={related} />
      )}
      {tab === 'factors' && <FactorBreakdown factors={factors} />}
      {tab === 'risks' && (
        risks.length > 0 ? (
          <RiskMiniTable risks={risks} />
        ) : (
          <EmptyCard icon="shield" title="Рисков нет" text="По объекту не зафиксировано открытых рисков. Отличный показатель." />
        )
      )}
      {tab === 'conns' && (
        related.length > 0 ? (
          <ConnList related={related} />
        ) : (
          <EmptyCard icon="link" title="Связей нет" text="Объект не имеет связей в Trust Graph." />
        )
      )}
      {tab === 'history' && (
        <HistoryTimeline entries={historyEntries} objectName={object.name} />
      )}

      {/* ── Edit dialog ── */}
      {canEdit && (
        <ObjectFormDialog
          open={showEdit}
          onOpenChange={setShowEdit}
          userRole={userRole}
          editObject={editObject}
          onDeleted={() => router.push('/objects')}
        />
      )}
    </div>
  );
}

// ── Overview tab ───────────────────────────────────────────────────────────────

function OverviewTab({
  factors,
  risks,
  related,
}: {
  factors: FactorItem[];
  risks: RiskItem[];
  related: RelatedObject[];
}) {
  const router = useRouter();

  return (
    <div className="ov-grid">
      {/* Factors card */}
      <div className="card span-7">
        <div className="card-head">
          <span className="card-title">Факторы доверия</span>
        </div>
        <div className="card-body">
          <FactorBreakdown factors={factors} compact />
        </div>
      </div>

      {/* Risks card */}
      <div className="card span-5">
        <div className="card-head">
          <span className="card-title">Активные риски</span>
          {risks.length > 0 && (
            <span className="card-count mono">{risks.length}</span>
          )}
        </div>
        {risks.length > 0 ? (
          <div style={{ padding: '0 8px 8px' }}>
            <RiskMiniTable risks={risks.slice(0, 4)} bare />
          </div>
        ) : (
          <div className="card-body">
            <div className="empty-state" style={{ padding: '8px 0' }}>
              <div className="empty-ico"><Icon name="shield" size={20} /></div>
              <div className="empty-title" style={{ fontSize: 14 }}>Рисков нет</div>
            </div>
          </div>
        )}
      </div>

      {/* Connections card */}
      <div className="card span-12">
        <div className="card-head">
          <span className="card-title">Связанные объекты</span>
          <button className="card-link" onClick={() => router.push('/graph')}>
            Показать в графе <Icon name="chevR" size={13} />
          </button>
        </div>
        <div className="card-body">
          {related.length > 0 ? (
            <ConnList related={related.slice(0, 6)} bare />
          ) : (
            <div className="empty-state" style={{ padding: '8px 0' }}>
              <div className="empty-ico"><Icon name="link" size={20} /></div>
              <div className="empty-title" style={{ fontSize: 14 }}>Связей нет</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Shared empty card ──────────────────────────────────────────────────────────

function EmptyCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="card">
      <div className="empty-state">
        <div className="empty-ico"><Icon name={icon} size={24} /></div>
        <div className="empty-title">{title}</div>
        {text && <p className="empty-text">{text}</p>}
      </div>
    </div>
  );
}
