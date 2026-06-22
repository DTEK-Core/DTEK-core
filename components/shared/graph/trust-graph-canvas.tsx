'use client';

import { useRef, useEffect } from 'react';
import { getTrustBand } from '@/lib/design-tokens';
import type { GraphNode, RawLink } from '@/lib/trust/graph-types';
import { useForceGraph } from './use-force-graph';

export interface TrustGraphCanvasProps {
  nodes: GraphNode[];
  links: RawLink[];
  width: number;
  height: number;
  selectedId?: string | null;
  highlightType?: string | null;
  onSelect?: (node: GraphNode) => void;
}

type DragState =
  | { kind: 'node'; node: GraphNode; moved: boolean }
  | { kind: 'pan'; sx: number; sy: number; ox: number; oy: number }
  | null;

interface ViewRef {
  scale: number;
  ox: number;
  oy: number;
  drag: DragState;
  hover: string | null;
}

function hexA(hex: string, alpha: number): string {
  if (hex.startsWith('#')) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return hex;
}

export function TrustGraphCanvas({
  nodes, links, width, height, selectedId, highlightType, onSelect,
}: TrustGraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state, tick } = useForceGraph(nodes, links, { width, height });
  const view = useRef<ViewRef>({ scale: 1, ox: 0, oy: 0, drag: null, hover: null });

  // Drawing loop — reruns when size, tick, or selection changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = width  * dpr;
    canvas.height = height * dpr;
    canvas.style.width  = `${width}px`;
    canvas.style.height = `${height}px`;

    const textDim = getComputedStyle(document.documentElement)
      .getPropertyValue('--text-dim').trim() || '#8899b0';

    let raf: number;
    const draw = () => {
      tick();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const v = view.current;
      ctx.save();
      ctx.translate(v.ox, v.oy);
      ctx.scale(v.scale, v.scale);
      const s = state.current;

      // ── Links ──
      for (const l of s.links) {
        const dim = !!(highlightType &&
          l.source.type !== highlightType && l.target.type !== highlightType);
        const active = !!(selectedId &&
          (l.source.id === selectedId || l.target.id === selectedId));
        ctx.beginPath();
        ctx.moveTo(l.source.x, l.source.y);
        const mx = (l.source.x + l.target.x) / 2;
        const my = (l.source.y + l.target.y) / 2 - 8;
        ctx.quadraticCurveTo(mx, my, l.target.x, l.target.y);
        ctx.strokeStyle = active
          ? 'rgba(45,212,191,.55)'
          : dim
          ? 'rgba(255,255,255,.03)'
          : 'rgba(255,255,255,.09)';
        ctx.lineWidth = active ? 1.6 : 1;
        ctx.stroke();
      }

      // ── Nodes ──
      for (const n of s.nodes) {
        const col   = n.type === 'org' ? '#e6edf3' : getTrustBand(n.trust_score).color;
        const dim   = !!(highlightType && n.type !== highlightType && n.type !== 'org');
        const sel   = selectedId === n.id;
        const hov   = v.hover === n.id;
        ctx.globalAlpha = dim ? 0.25 : 1;

        // Halo
        if (sel || hov) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.size + 8, 0, Math.PI * 2);
          ctx.fillStyle = hexA(col, 0.14);
          ctx.fill();
        }

        // Body
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fillStyle = n.type === 'org' ? '#0d1219' : hexA(col, 0.18);
        ctx.fill();
        ctx.lineWidth   = sel ? 2.4 : 1.6;
        ctx.strokeStyle = col;
        ctx.stroke();

        // Org center dot
        if (n.type === 'org') {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#2dd4bf';
          ctx.fill();
        }

        // Label
        if (n.size > 10 || sel || hov || n.type === 'org') {
          ctx.globalAlpha    = dim ? 0.25 : 0.9;
          ctx.fillStyle      = textDim;
          ctx.font           = '600 11px Manrope, sans-serif';
          ctx.textAlign      = 'center';
          const label = n.name.length > 18 ? n.name.slice(0, 17) + '…' : n.name;
          ctx.fillText(label, n.x, n.y + n.size + 14);
        }
        ctx.globalAlpha = 1;
      }

      ctx.restore();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [width, height, tick, state, selectedId, highlightType]);

  // Passive:false wheel handler (React synthetic wheel is passive in newer browsers)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const v = view.current;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.08 : 0.92;
      const ns = Math.min(2.4, Math.max(0.5, v.scale * factor));
      v.ox = mx - (mx - v.ox) * (ns / v.scale);
      v.oy = my - (my - v.oy) * (ns / v.scale);
      v.scale = ns;
    };
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  // ── Interaction ────────────────────────────────────────────────────────────

  function pick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { hit: null as GraphNode | null, x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const v    = view.current;
    const x    = (e.clientX - rect.left - v.ox) / v.scale;
    const y    = (e.clientY - rect.top  - v.oy) / v.scale;
    let hit: GraphNode | null = null;
    for (const n of state.current.nodes) {
      if ((n.x - x) ** 2 + (n.y - y) ** 2 <= (n.size + 4) ** 2) { hit = n; break; }
    }
    return { hit, x, y };
  }

  function onDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const { hit } = pick(e);
    if (hit) {
      view.current.drag = { kind: 'node', node: hit, moved: false };
    } else {
      view.current.drag = {
        kind: 'pan', sx: e.clientX, sy: e.clientY,
        ox: view.current.ox, oy: view.current.oy,
      };
    }
  }

  function onMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const v    = view.current;
    const drag = v.drag;
    if (drag?.kind === 'node') {
      const { x, y } = pick(e);
      drag.node.fx  = x;
      drag.node.fy  = y;
      drag.moved    = true;
      state.current.alpha = Math.max(state.current.alpha, 0.4);
    } else if (drag?.kind === 'pan') {
      v.ox = drag.ox + (e.clientX - drag.sx);
      v.oy = drag.oy + (e.clientY - drag.sy);
    } else {
      const { hit } = pick(e);
      const id = hit ? hit.id : null;
      if (v.hover !== id) {
        v.hover = id;
        const canvas = canvasRef.current;
        if (canvas) canvas.style.cursor = hit ? 'pointer' : 'grab';
      }
    }
  }

  function onUp() {
    const drag = view.current.drag;
    if (drag?.kind === 'node') {
      if (!drag.moved && onSelect) onSelect(drag.node);
      if (drag.node.type !== 'org') { drag.node.fx = null; drag.node.fy = null; }
    }
    view.current.drag = null;
  }

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={onDown}
      onMouseMove={onMove}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      style={{ display: 'block', cursor: 'grab', touchAction: 'none' }}
    />
  );
}
