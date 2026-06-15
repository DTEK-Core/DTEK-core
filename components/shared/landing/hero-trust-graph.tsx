'use client';

import { useEffect, useRef, useState } from 'react';
import { COLORS, getTrustBand } from '@/lib/design-tokens';

// ---- canvas helpers ----
function hexA(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}

interface HeroNode {
  id: string;
  x: number;
  y: number;
  trust: number;
  size: number;
  kind: string;
  order?: number;
  appear?: number;
  ph?: number;
  amp?: number;
  spd?: number;
  // runtime
  sx?: number;
  sy?: number;
  scale?: number;
  fill?: number;
}

interface HeroEdge { a: string; b: string; i: number; }

interface HeroModel {
  nodes: HeroNode[];
  edges: HeroEdge[];
  byId: Record<string, HeroNode>;
  riskId: string;
  path: string[];
}

function buildHeroModel(): HeroModel {
  const N = (id: string, x: number, y: number, trust: number, size: number, kind: string): HeroNode =>
    ({ id, x, y, trust, size, kind });
  const nodes: HeroNode[] = [
    N('core', 50, 50.5, 74, 0, 'org'),
    N('n1',  73, 24,   88, 10, 'server'), N('n2',  86, 38, 82, 9, 'db'),
    N('n3',  80, 60,   71, 9, 'cloud'),  N('n4',  66, 71, 64, 8, 'network'),
    N('n5',  22, 28,   79, 9, 'user'),   N('n6',  14, 47, 67, 8, 'app'),
    N('n7',  26, 65,   58, 8, 'monitor'),N('n8',  37, 78, 49, 7, 'chip'),
    N('n9',  50, 15,   84, 9, 'server'), N('n10', 39, 35, 73, 8, 'db'),
    N('n11', 62, 39,   77, 9, 'app'),    N('n12', 47, 67, 61, 8, 'db'),
    N('n13', 59, 83,   38, 9, 'cloud'),  N('n14', 31, 51, 70, 8, 'network'),
  ];
  const E = (a: string, b: string) => [a, b] as const;
  const edgePairs = [
    E('core','n10'), E('core','n11'), E('core','n14'), E('core','n9'),
    E('n10','n5'),   E('n10','n9'),   E('n14','n6'),   E('n14','n7'),
    E('n5','n6'),    E('n7','n8'),    E('n11','n1'),   E('n11','n2'),
    E('n1','n9'),    E('n2','n3'),    E('n3','n4'),    E('n4','n12'),
    E('n11','n12'),  E('n12','n13'),  E('n10','n12'),  E('n11','n3'),
    E('n14','n12'),  E('n7','n12'),
  ];
  const edges: HeroEdge[] = edgePairs.map(([a, b], i) => ({ a, b, i }));
  const byId: Record<string, HeroNode> = Object.fromEntries(nodes.map(n => [n.id, n]));
  const core = byId.core;
  const ranked = nodes.slice().sort((p, q) => {
    const dp = (p.x - core.x) ** 2 + (p.y - core.y) ** 2;
    const dq = (q.x - core.x) ** 2 + (q.y - core.y) ** 2;
    return dp - dq;
  });
  ranked.forEach((n, r) => {
    n.order  = r;
    n.appear = 0.12 + r * 0.085;
    n.ph     = (n.x * 1.7 + n.y * 0.9) % (Math.PI * 2);
    n.amp    = 1.5 + (r % 3) * 0.55;
    n.spd    = 0.45 + ((r * 7) % 5) * 0.06;
  });
  return { nodes, edges, byId, riskId: 'n13', path: ['n13', 'n12', 'core'] };
}

const C = {
  text:    COLORS.text,
  dim:     COLORS.textDim,
  mute:    COLORS.textMute,
  teal:    COLORS.teal,
  crit:    COLORS.crit,
  amber:   COLORS.amber,
  lime:    COLORS.lime,
  orange:  COLORS.orange,
  surface: COLORS.surface2,
};

export function HeroTrustGraph() {
  const wrapRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const model     = useRef<HeroModel | null>(null);
  if (!model.current) model.current = buildHeroModel();

  const [dims, setDims]     = useState({ w: 560, h: 540 });
  const [risk, setRisk]     = useState(false);
  const [coreVal, setCoreVal] = useState(74);

  const ptr    = useRef({ tx: 0, ty: 0, x: 0, y: 0 });
  const uiRef  = useRef({ risk: false, core: 74 });
  const reduced = useRef(
    typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  // responsive sizing
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width) setDims({ w: Math.round(rect.width), h: Math.round(rect.height) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // pointer parallax
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || reduced.current) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      ptr.current.tx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      ptr.current.ty = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    };
    const onLeave = () => { ptr.current.tx = 0; ptr.current.ty = 0; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, []);

  // main draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { w, h } = dims;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width        = w * dpr;
    canvas.height       = h * dpr;
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';

    const M = model.current!;
    const padX = w * 0.12, padY = h * 0.10;
    const mapX = (nx: number) => padX + (nx / 100) * (w - padX * 2);
    const mapY = (ny: number) => padY + (ny / 100) * (h - padY * 2);

    const bandColor = (t: number) => getTrustBand(t).color;

    const smooth = (a: number, b: number, x: number) => {
      const p = Math.max(0, Math.min(1, (x - a) / (b - a)));
      return p * p * (3 - 2 * p);
    };
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const ctrl = (ax: number, ay: number, bx: number, by: number, id: number) => {
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      const dx = bx - ax, dy = by - ay;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len;
      const sgn = id % 2 === 0 ? 1 : -1;
      const off = len * 0.10 * sgn;
      return [mx + nx * off, my + ny * off];
    };
    const bez = (a: number, cv: number, b: number, p: number) =>
      (1 - p) * (1 - p) * a + 2 * (1 - p) * p * cv + p * p * b;

    interface Pulse {
      edge?: number;
      pair?: [string, string];
      t0: number;
      dur: number;
      color: string;
    }
    let pulses: Pulse[] = [];
    let lastPulse = 0, pulseEdge = -1;
    let nextRisk = 6.0;
    const RISK_PERIOD = 12.5, RISK_DUR = 5.4;
    let scenarioStart = -100;
    let lastRiskKey = '';

    const start = performance.now();
    let raf: number;

    const frame = (now: number) => {
      try {
        const t = (now - start) / 1000;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        ptr.current.x = lerp(ptr.current.x, ptr.current.tx, 0.06);
        ptr.current.y = lerp(ptr.current.y, ptr.current.ty, 0.06);
        const par = reduced.current ? 0 : 1;
        const driftAmp = reduced.current ? 0 : smooth(0.4, 2.4, t);

        // risk scenario scheduling
        if (!reduced.current && t >= nextRisk) { scenarioStart = nextRisk; nextRisk += RISK_PERIOD; }
        const lt = t - scenarioStart;
        const inScenario = lt >= 0 && lt <= RISK_DUR;
        const riskRamp = inScenario ? smooth(0, 0.7, lt) - smooth(3.4, 4.7, lt) : 0;
        const wantRiskCard = inScenario && lt > 0.45 && lt < 4.6;
        const wantCore = Math.round(lerp(74, 71, riskRamp));
        if (uiRef.current.risk !== wantRiskCard) { uiRef.current.risk = wantRiskCard; setRisk(wantRiskCard); }
        if (uiRef.current.core !== wantCore)     { uiRef.current.core = wantCore;     setCoreVal(wantCore); }

        // compute live node positions
        for (const n of M.nodes) {
          const dx = driftAmp * (n.amp ?? 1) * Math.sin(t * (n.spd ?? 0.5) + (n.ph ?? 0));
          const dy = driftAmp * (n.amp ?? 1) * Math.cos(t * (n.spd ?? 0.5) * 0.8 + (n.ph ?? 0));
          const pz = (n.id === 'core' ? 0 : 1) * 6 * par;
          n.sx    = mapX(n.x) + dx + ptr.current.x * pz;
          n.sy    = mapY(n.y) + dy + ptr.current.y * pz;
          n.scale = reduced.current ? 1 : smooth(n.appear ?? 0, (n.appear ?? 0) + 0.7, t);
          n.fill  = smooth((n.appear ?? 0) + 0.2, (n.appear ?? 0) + 1.2, t);
        }

        // ambient trust pulses
        if (!reduced.current && t > 3.0 && t - lastPulse > 0.8) {
          lastPulse = t;
          let e = -1, guard = 0;
          do { e = (Math.random() * M.edges.length) | 0; guard++; } while (e === pulseEdge && guard < 5);
          pulseEdge = e;
          pulses.push({ edge: e, t0: t, dur: 1.15, color: C.teal });
        }
        // risk path pulses
        if (inScenario && lt > 0.4 && lt < 3.2) {
          const slot = Math.floor((lt - 0.4) / 0.55);
          const riskKey = scenarioStart + ':' + slot;
          if (lastRiskKey !== riskKey) {
            lastRiskKey = riskKey;
            for (let k = 0; k < M.path.length - 1; k++) {
              pulses.push({ pair: [M.path[k], M.path[k + 1]], t0: t + k * 0.18, dur: 0.9, color: C.crit });
            }
          }
        }

        // draw edges
        for (const ed of M.edges) {
          const a = M.byId[ed.a], b = M.byId[ed.b];
          const av = Math.min(a.scale ?? 0, b.scale ?? 0);
          if (av <= 0.02) continue;
          const ea = Math.max(a.appear ?? 0, b.appear ?? 0) + 0.15;
          const prog = reduced.current ? 1 : smooth(ea, ea + 0.6, t);
          if (prog <= 0) continue;
          const [cx, cy] = ctrl(a.sx!, a.sy!, b.sx!, b.sy!, ed.i);
          const isRiskEdge = inScenario && riskRamp > 0.15 &&
            (ed.a === 'n13' || ed.b === 'n13' || ed.a === 'n12' || ed.b === 'n12');
          ctx.beginPath();
          ctx.moveTo(a.sx!, a.sy!);
          const steps = 22, end = Math.floor(steps * prog);
          for (let s = 1; s <= end; s++) {
            const p = s / steps;
            ctx.lineTo(bez(a.sx!, cx, b.sx!, p), bez(a.sy!, cy, b.sy!, p));
          }
          ctx.strokeStyle = isRiskEdge
            ? hexA(C.crit, 0.28 + 0.25 * riskRamp)
            : hexA(C.text, 0.085 * av);
          ctx.lineWidth = isRiskEdge ? 1.5 : 1;
          ctx.stroke();
        }

        // draw pulses
        pulses = pulses.filter(pu => t - pu.t0 < pu.dur + 0.05);
        for (const pu of pulses) {
          const p = (t - pu.t0) / pu.dur;
          if (p < 0 || p > 1) continue;
          let a: HeroNode, b: HeroNode;
          if (pu.pair) { a = M.byId[pu.pair[0]]; b = M.byId[pu.pair[1]]; }
          else { const ed = M.edges[pu.edge!]; a = M.byId[ed.a]; b = M.byId[ed.b]; }
          if (!a || !b) continue;
          const id = pu.pair ? ((a.x + b.x) | 0) : pu.edge!;
          const [cx, cy] = ctrl(a.sx!, a.sy!, b.sx!, b.sy!, id);
          const px = bez(a.sx!, cx, b.sx!, p), py = bez(a.sy!, cy, b.sy!, p);
          const fade = Math.sin(p * Math.PI);
          const g = ctx.createRadialGradient(px, py, 0, px, py, 13);
          g.addColorStop(0, hexA(pu.color, 0.9 * fade));
          g.addColorStop(1, hexA(pu.color, 0));
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(px, py, 13, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = hexA(pu.color, fade);
          ctx.beginPath(); ctx.arc(px, py, 2.6, 0, Math.PI * 2); ctx.fill();
        }

        // draw nodes
        for (const n of M.nodes) {
          if (n.id === 'core' || (n.scale ?? 0) <= 0.02) continue;
          let col = bandColor(n.trust);
          let glow = 0;
          if (n.id === M.riskId && riskRamp > 0) {
            col = getTrustBand(Math.round(lerp(n.trust, 16, riskRamp))).color;
            glow = riskRamp;
          }
          const sc = n.scale!;
          const size = n.size * sc;
          ctx.save();
          ctx.globalAlpha = sc;
          // outer aura
          ctx.beginPath(); ctx.arc(n.sx!, n.sy!, size + 6, 0, Math.PI * 2);
          ctx.fillStyle = hexA(col, 0.10 + 0.12 * glow); ctx.fill();
          // risk halo
          if (glow > 0) {
            const hr = size + 10 + Math.sin(t * 6) * 3;
            ctx.beginPath(); ctx.arc(n.sx!, n.sy!, hr, 0, Math.PI * 2);
            ctx.strokeStyle = hexA(C.crit, 0.35 * glow); ctx.lineWidth = 1.4; ctx.stroke();
          }
          // body
          ctx.beginPath(); ctx.arc(n.sx!, n.sy!, size, 0, Math.PI * 2);
          ctx.fillStyle = hexA(col, 0.2); ctx.fill();
          // trust mini-ring fill
          const sweep = Math.PI * 2 * (n.trust / 100) * (n.fill ?? 0);
          ctx.beginPath();
          ctx.arc(n.sx!, n.sy!, size, -Math.PI / 2, -Math.PI / 2 + sweep);
          ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke();
          // ring track
          ctx.beginPath(); ctx.arc(n.sx!, n.sy!, size, 0, Math.PI * 2);
          ctx.strokeStyle = hexA(col, 0.18); ctx.lineWidth = 1; ctx.stroke();
          // centre dot
          ctx.beginPath(); ctx.arc(n.sx!, n.sy!, 1.6, 0, Math.PI * 2);
          ctx.fillStyle = col; ctx.fill();
          ctx.restore();
        }

        // draw org core
        const core = M.byId.core;
        const cscale = reduced.current ? 1 : smooth(0.05, 0.8, t);
        if (cscale > 0.05) {
          const breath = reduced.current ? 0 : Math.sin(t * 1.4) * 1.2;
          const R  = Math.max(12, 44 * cscale + breath);
          const Rg = Math.max(2,  R - 7);
          ctx.save();
          // soft field
          const fg = ctx.createRadialGradient(core.sx!, core.sy!, 0, core.sx!, core.sy!, R * 2.4);
          fg.addColorStop(0, hexA(C.teal, 0.10 * cscale));
          fg.addColorStop(1, hexA(C.teal, 0));
          ctx.fillStyle = fg;
          ctx.beginPath(); ctx.arc(core.sx!, core.sy!, R * 2.4, 0, Math.PI * 2); ctx.fill();
          // disc
          ctx.beginPath(); ctx.arc(core.sx!, core.sy!, R, 0, Math.PI * 2);
          ctx.fillStyle = '#0c121b'; ctx.fill();
          ctx.lineWidth = 1; ctx.strokeStyle = hexA(C.text, 0.10); ctx.stroke();
          // gauge track + arc
          const gv   = uiRef.current.core / 100;
          const gcol = getTrustBand(uiRef.current.core).color;
          ctx.beginPath(); ctx.arc(core.sx!, core.sy!, Rg, 0, Math.PI * 2);
          ctx.strokeStyle = hexA(C.text, 0.07); ctx.lineWidth = 5; ctx.stroke();
          ctx.beginPath();
          ctx.arc(core.sx!, core.sy!, Rg, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * gv * cscale);
          ctx.strokeStyle = gcol; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
          ctx.shadowColor = hexA(gcol, 0.5); ctx.shadowBlur = 10;
          ctx.stroke(); ctx.shadowBlur = 0;
          // score number
          ctx.fillStyle = gcol;
          ctx.font = '700 28px "JetBrains Mono", monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.globalAlpha = cscale;
          ctx.fillText(String(uiRef.current.core), core.sx!, core.sy! - 4);
          ctx.fillStyle = C.mute;
          ctx.font = '600 8px "JetBrains Mono", monospace';
          ctx.fillText('ИНДЕКС', core.sx!, core.sy! + 13);
          ctx.restore();
        }
      } catch { /* keep loop alive */ }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims]);

  // suppress unused warning — setCoreVal drives canvas state via uiRef
  void coreVal;

  return (
    <div className="hero-graph" ref={wrapRef}>
      <canvas ref={canvasRef} className="hero-graph-canvas" />

      {/* healthy object card (persistent) */}
      <figure className="hg-card hg-card-ok" aria-hidden="true">
        <div className="hg-card-top">
          <span className="hg-card-id mono">SRV‑CORE‑04</span>
          <span className="trust-chip sm" style={{ '--c': 'var(--teal)' } as React.CSSProperties}>
            <span className="mono trust-chip-val">88</span>
          </span>
        </div>
        <div className="hg-card-row mono">Высокое доверие · 0 рисков</div>
      </figure>

      {/* risk object card (visible during risk scenario) */}
      <figure className={`hg-card hg-card-risk${risk ? ' is-on' : ''}`} aria-hidden="true">
        <div className="hg-card-top">
          <span className="hg-card-id mono">STOR‑ARCH‑11</span>
          <span className="hg-pulse-dot" />
        </div>
        <div className="hg-card-row hg-card-risk-row mono">Критический риск выявлен</div>
        <div className="hg-card-meta mono">доверие 38 → 16 · влияет на индекс</div>
      </figure>

      {/* live status line */}
      <div className="hg-status mono">
        <span className={`hg-status-dot${risk ? ' crit' : ''}`} />
        {risk ? 'Перерасчёт индекса · распространение риска' : 'Цифровая модель · live'}
      </div>
    </div>
  );
}
