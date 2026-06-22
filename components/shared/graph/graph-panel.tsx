'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TrustRing } from '@/components/shared/trust-ring';
import { CritTag } from '@/components/shared/crit-tag';
import { Icon } from '@/components/shared/icon';
import { getTrustBand } from '@/lib/design-tokens';
import { deleteRelation } from '@/lib/actions/relations';
import type { GraphNode, RawLink } from '@/lib/trust/graph-types';

interface GraphPanelProps {
  selectedNode: GraphNode | null;
  nodes: GraphNode[];
  links: RawLink[];
  orgTrustScore: number;
  riskCounts: Record<string, number>;
  canEdit: boolean;
  onAddRelation: () => void;
}

const TYPE_LABEL: Record<string, string> = {
  server: 'Сервер', workstation: 'АРМ', laptop: 'Ноутбук',
  app: 'Приложение', database: 'База данных', network: 'Сетевое устройство',
  cloud: 'Облачный сервис', user: 'Учётная запись', ot: 'ОТ-актив', other: 'Прочее',
};

const TYPE_ICON: Record<string, string> = {
  server: 'server', workstation: 'monitor', laptop: 'monitor',
  app: 'app', database: 'db', network: 'network',
  cloud: 'cloud', user: 'user', ot: 'chip',
};

const RELATION_LABEL: Record<string, string> = {
  uses:           'Использует',
  depends_on:     'Зависит от',
  connected_to:   'Подключён к',
  managed_by:     'Управляется',
  owns:           'Владеет',
  interacts_with: 'Взаимодействует',
};

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="gp-fact">
      <span className="gp-fact-l">{label}</span>
      <span className="gp-fact-v">{value}</span>
    </div>
  );
}

export function GraphPanel({
  selectedNode, nodes, links, orgTrustScore, riskCounts, canEdit, onAddRelation,
}: GraphPanelProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteRelation(deleteId);
      if (result.error) {
        setDeleteError(result.error);
      } else {
        setDeleteId(null);
        router.refresh();
      }
    });
  }

  // ── Empty state ─────────────────────────────────────────────────────────
  if (!selectedNode) {
    const objCount  = nodes.filter(n => n.type !== 'org').length;
    const linkCount = links.filter(l => !l.id.startsWith('org-')).length;
    const critCount = nodes.filter(n => n.type !== 'org' && n.trust_score < 20).length;
    return (
      <div className="gp-empty">
        <div className="gp-empty-title">
          <Icon name="graph" size={22} />
          Выберите узел
        </div>
        <p className="gp-note">
          Кликните по объекту на графе, чтобы увидеть его уровень доверия, риски и связи.
        </p>
        <div className="gp-stats">
          <div className="gp-stat">
            <span className="mono gp-stat-v">{objCount}</span>
            <span className="gp-stat-l">объектов</span>
          </div>
          <div className="gp-stat">
            <span className="mono gp-stat-v">{linkCount}</span>
            <span className="gp-stat-l">связей</span>
          </div>
          <div className="gp-stat">
            <span className="mono gp-stat-v" style={{ color: critCount > 0 ? 'var(--crit)' : undefined }}>
              {critCount}
            </span>
            <span className="gp-stat-l">критич. узлов</span>
          </div>
        </div>
        {canEdit && (
          <button className="btn btn-line btn-sm" style={{ width: '100%', marginTop: 12 }} onClick={onAddRelation}>
            <Icon name="link" size={14} />
            Добавить связь
          </button>
        )}
      </div>
    );
  }

  // ── Org node ─────────────────────────────────────────────────────────────
  if (selectedNode.type === 'org') {
    const objCount = nodes.filter(n => n.type !== 'org').length;
    return (
      <div className="gp-inner">
        <div className="gp-head">
          <span className="gp-ico org"><Icon name="org" size={20} /></span>
          <div>
            <div className="gp-name">{selectedNode.name}</div>
            <div className="gp-id mono">Организация · корень модели</div>
          </div>
        </div>
        <div className="gp-ring">
          <TrustRing value={orgTrustScore} size={110} stroke={8} sub="индекс" />
        </div>
        <p className="gp-note">
          Корневой узел цифровой модели. Индекс доверия агрегирует оценки всех {objCount} объектов.
        </p>
        <Link href="/dashboard" className="btn btn-line btn-sm" style={{ textAlign: 'center' }}>
          <Icon name="grid" size={14} />
          Центр управления
        </Link>
      </div>
    );
  }

  // ── Object node ──────────────────────────────────────────────────────────
  const band     = getTrustBand(selectedNode.trust_score);
  const iconName = TYPE_ICON[selectedNode.type] ?? 'objects';
  const typeLabel = TYPE_LABEL[selectedNode.type] ?? selectedNode.type;
  const risks    = riskCounts[selectedNode.id] ?? 0;

  // Links connected to this node
  const nodeLinks = links.filter(
    l => l.source === selectedNode.id || l.target === selectedNode.id,
  );
  const connCount = nodeLinks.length;

  return (
    <>
      <div className="gp-inner">
        {/* Header */}
        <div className="gp-head">
          <span className="gp-ico" style={{ '--c': band.color } as React.CSSProperties}>
            <Icon name={iconName} size={20} />
          </span>
          <div>
            <div className="gp-name">{selectedNode.name}</div>
            <div className="gp-id mono">{selectedNode.id.slice(0, 16)}…</div>
          </div>
        </div>

        {/* TrustRing */}
        <div className="gp-ring">
          <TrustRing value={selectedNode.trust_score} size={110} stroke={8} sub="доверие" />
        </div>

        {/* Facts */}
        <div className="gp-facts">
          <Fact label="Тип"          value={typeLabel} />
          <Fact label="Критичность"  value={<CritTag value={selectedNode.criticality} />} />
          <Fact label="Рисков"       value={<span className="mono">{risks}</span>} />
          <Fact label="Связей"       value={<span className="mono">{connCount}</span>} />
        </div>

        {/* Connections list */}
        {nodeLinks.length > 0 && (
          <div className="gp-links">
            <div className="gp-links-title">Связи</div>
            {nodeLinks.map(l => {
              const peerId  = l.source === selectedNode.id ? l.target  : l.source;
              const peerNode = nodes.find(n => n.id === peerId);
              const isOut   = l.source === selectedNode.id;
              return (
                <div key={l.id} className="gp-link-row">
                  <Icon name={isOut ? 'chevR' : 'chevL'} size={12} />
                  <span className="gp-link-peer">{peerNode?.name ?? peerId.slice(0, 8)}</span>
                  <span className="gp-link-type">{RELATION_LABEL[l.relation_type] ?? l.relation_type}</span>
                  {canEdit && (
                    <button
                      className="gp-link-del"
                      onClick={() => { setDeleteId(l.id); setDeleteError(null); }}
                      title="Удалить связь"
                    >
                      <Icon name="x" size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="gp-actions">
          <Link href={`/objects/${selectedNode.id}/passport`} className="btn btn-line btn-sm">
            <Icon name="passport" size={14} />
            Паспорт
          </Link>
          <Link href={`/objects/${selectedNode.id}`} className="btn btn-ghost btn-sm">
            <Icon name="eye" size={14} />
            Детали
          </Link>
        </div>

        {canEdit && (
          <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={onAddRelation}>
            <Icon name="link" size={14} />
            Добавить связь
          </button>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить связь?</AlertDialogTitle>
            <AlertDialogDescription>
              Связь будет удалена из графа доверия. Это действие необратимо.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p style={{ color: 'var(--crit)', fontSize: 13, marginTop: 4 }}>{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              style={{ background: 'var(--crit)' }}
            >
              {isPending ? 'Удаление…' : 'Удалить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
