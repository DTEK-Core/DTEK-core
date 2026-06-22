'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { TRUST_BANDS } from '@/lib/design-tokens';
import type { GraphNode, RawLink } from '@/lib/trust/graph-types';
import { TrustGraphCanvas } from '@/components/shared/graph/trust-graph-canvas';
import { GraphPanel } from '@/components/shared/graph/graph-panel';
import { RelationDialog } from '@/components/shared/graph/relation-dialog';

interface GraphPageClientProps {
  nodes: GraphNode[];
  links: RawLink[];
  orgName: string;
  orgTrustScore: number;
  riskCounts: Record<string, number>;
  canEdit: boolean;
}

export function GraphPageClient({
  nodes, links, orgName, orgTrustScore, riskCounts, canEdit,
}: GraphPageClientProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize]               = useState({ width: 900, height: 560 });
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [highlightType, setHighlightType] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen]   = useState(false);

  // Stable memoization keyed on actual content (not reference identity).
  // This prevents useForceGraph from reinitializing on selectedId state changes,
  // while still updating when router.refresh() delivers new nodes/links.
  const nodesKey = useMemo(() => nodes.map(n => n.id).join(','), [nodes]);
  const linksKey = useMemo(() => links.map(l => l.id).join(','), [links]);
  const stableNodes = useMemo(() => nodes, [nodesKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const stableLinks = useMemo(() => links, [linksKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Measure canvas stage
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const selectedNode = selectedId
    ? stableNodes.find(n => n.id === selectedId) ?? null
    : null;

  const OBJ_TYPES = [
    { key: 'server',      label: 'Серверы' },
    { key: 'workstation', label: 'АРМ' },
    { key: 'app',         label: 'Приложения' },
    { key: 'database',    label: 'БД' },
    { key: 'network',     label: 'Сеть' },
    { key: 'cloud',       label: 'Cloud' },
    { key: 'user',        label: 'Учётные записи' },
    { key: 'ot',          label: 'ОТ' },
  ];
  const presentTypes = useMemo(
    () => OBJ_TYPES.filter(t => stableNodes.some(n => n.type === t.key)),
    [stableNodes], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className="screen graph-screen">
      {/* ── Header ── */}
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Граф доверия</h1>
          <p className="screen-sub">
            {orgName} · {stableNodes.filter(n => n.type !== 'org').length} объектов ·&nbsp;
            {stableLinks.filter(l => !l.id.startsWith('org-')).length} связей
          </p>
        </div>
        <div className="screen-head-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {canEdit && (
            <button className="btn btn-line btn-sm" onClick={() => setDialogOpen(true)}>
              + Добавить связь
            </button>
          )}
          {presentTypes.length > 0 && (
            <div className="graph-type-filter">
              <button
                className={`gtf${highlightType === null ? ' active' : ''}`}
                onClick={() => setHighlightType(null)}
              >
                Все
              </button>
              {presentTypes.map(t => (
                <button
                  key={t.key}
                  className={`gtf${highlightType === t.key ? ' active' : ''}`}
                  onClick={() => setHighlightType(prev => prev === t.key ? null : t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="graph-layout">
        {/* Stage */}
        <div className="graph-stage" ref={stageRef}>
          {size.width > 0 && (
            <TrustGraphCanvas
              nodes={stableNodes}
              links={stableLinks}
              width={size.width}
              height={size.height}
              selectedId={selectedId}
              highlightType={highlightType}
              onSelect={node => setSelectedId(prev => prev === node.id ? null : node.id)}
            />
          )}

          {/* Legend */}
          <div className="graph-legend">
            <div className="graph-legend-title">Уровень доверия</div>
            {[...TRUST_BANDS].reverse().map(band => (
              <div className="gl-item" key={band.key}>
                <span className="gl-dot" style={{ background: band.color }} />
                <span>{band.label}</span>
                <span style={{ marginLeft: 'auto', color: 'var(--text-mute)', fontSize: 10 }}>
                  {band.range[0]}–{band.range[1]}
                </span>
              </div>
            ))}
          </div>

          {/* Hint */}
          <div className="graph-hint">
            Скролл — масштаб · Пустое место — панорама · Клик — детали
          </div>
        </div>

        {/* Panel */}
        <aside className="graph-panel">
          <GraphPanel
            selectedNode={selectedNode}
            nodes={stableNodes}
            links={stableLinks}
            orgTrustScore={orgTrustScore}
            riskCounts={riskCounts}
            canEdit={canEdit}
            onAddRelation={() => setDialogOpen(true)}
          />
        </aside>
      </div>

      {/* Relation creation dialog */}
      <RelationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        nodes={stableNodes}
        defaultSourceId={selectedNode?.type !== 'org' ? selectedNode?.id : undefined}
      />
    </div>
  );
}
