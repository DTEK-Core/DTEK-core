'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { GraphNode, RawLink } from '@/lib/trust/graph-types';

interface SimLink {
  source: GraphNode;
  target: GraphNode;
}

interface SimState {
  nodes: GraphNode[];
  links: SimLink[];
  alpha: number;
}

export function useForceGraph(
  nodes: GraphNode[],
  links: RawLink[],
  size: { width: number; height: number },
) {
  const { width, height } = size;
  const state = useRef<SimState>({ nodes: [], links: [], alpha: 1 });

  useEffect(() => {
    const cx = width / 2, cy = height / 2;
    state.current.nodes = nodes.map((n, i) => {
      const ang = (i / Math.max(nodes.length, 1)) * Math.PI * 2;
      const rad = n.type === 'org' ? 0 : 120 + (i % 5) * 26;
      return {
        ...n,
        x:  cx + Math.cos(ang) * rad,
        y:  cy + Math.sin(ang) * rad,
        vx: 0, vy: 0,
        fx: n.type === 'org' ? cx : null,
        fy: n.type === 'org' ? cy : null,
      };
    });
    const byId = Object.fromEntries(state.current.nodes.map(n => [n.id, n]));
    state.current.links = links
      .map(l => ({ source: byId[l.source], target: byId[l.target] }))
      .filter(l => l.source && l.target);
    state.current.alpha = 1;
  }, [nodes, links, width, height]);

  const tick = useCallback(() => {
    const s = state.current;
    if (!s.nodes.length) return;
    const cx = width / 2, cy = height / 2;
    s.alpha = Math.max(s.alpha * 0.985, 0.02);
    const k = s.alpha;

    // Repulsion (Coulomb)
    for (let i = 0; i < s.nodes.length; i++) {
      const a = s.nodes[i];
      for (let j = i + 1; j < s.nodes.length; j++) {
        const b = s.nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy || 0.01;
        const d  = Math.sqrt(d2);
        const rep = (3000 * k) / d2;
        const fx = (dx / d) * rep, fy = (dy / d) * rep;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      }
    }

    // Springs
    for (const l of s.links) {
      const dx = l.target.x - l.source.x, dy = l.target.y - l.source.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const desired = l.source.type === 'org' || l.target.type === 'org' ? 150 : 112;
      const f = ((d - desired) / d) * 0.05 * k;
      const fx = dx * f, fy = dy * f;
      l.source.vx += fx; l.source.vy += fy;
      l.target.vx -= fx; l.target.vy -= fy;
    }

    // Gravity + integration
    for (const n of s.nodes) {
      n.vx += (cx - n.x) * 0.0012 * k;
      n.vy += (cy - n.y) * 0.0012 * k;
      n.vx *= 0.86; n.vy *= 0.86;
      if (n.fx != null) {
        n.x = n.fx;
        n.y = n.fy!;
      } else {
        n.x += n.vx;
        n.y += n.vy;
      }
    }
  }, [width, height]);

  return { state, tick };
}
