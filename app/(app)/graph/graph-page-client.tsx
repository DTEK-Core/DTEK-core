'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { TRUST_BANDS } from '@/lib/design-tokens';
import type { GraphNode, RawLink } from '@/lib/trust/graph-types';
import { TrustGraphCanvas } from '@/components/shared/graph/trust-graph-canvas';

interface GraphPageClientProps {
  nodes: GraphNode[];
  links: RawLink[];
  orgName: string;
}

export function GraphPageClient({ nodes, links, orgName }: GraphPageClientProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 900, height: 560 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [highlightType, setHighlightType] = useState<string | null>(null);

  // Stable refs — nodes/links from server never change during page lifetime
  const stableNodes = useMemo(() => nodes, []); // eslint-disable-line react-hooks/exhaustive-deps
  const stableLinks = useMemo(() => links, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Measure canvas stage size
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
          <p className="screen-sub">{orgName} · {stableNodes.filter(n => n.type !== 'org').length} объектов · {stableLinks.length} связей</p>
        </div>
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
              <div key={band.key} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: band.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{band.label}</span>
                <span style={{ fontSize: 11, color: 'var(--text-mute)', marginLeft: 'auto' }}>
                  {band.range[0]}–{band.range[1]}
                </span>
              </div>
            ))}
          </div>

          {/* Hint */}
          <div className="graph-hint">
            Скролл — масштаб · Перетяните пустое место — панорама · Клик по узлу — детали
          </div>
        </div>

        {/* Panel — placeholder until T006 */}
        <div className="graph-panel">
          {selectedNode ? (
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{selectedNode.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-mute)', marginTop: 4 }}>
                {selectedNode.type} · Trust Score: {selectedNode.trust_score}
              </div>
            </div>
          ) : (
            <div style={{ padding: 24, color: 'var(--text-mute)', fontSize: 13, textAlign: 'center', paddingTop: 48 }}>
              Выберите объект для просмотра деталей
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
