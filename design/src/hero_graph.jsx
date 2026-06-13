// ============================================================
// DTEK Core — Hero "Digital Twin" Trust Graph
// Bespoke, scripted motion. Not a generic network diagram.
// Timeline: build → trust-scan → ambient life → risk event → recovery (loops)
// ============================================================

function buildHeroModel() {
  const N = (id, x, y, trust, size, kind) => ({ id, x, y, trust, size, kind });
  // Hand-placed, asymmetric layout — three loose zones around an org core.
  const nodes = [
    N('core', 50, 50.5, 74, 0, 'org'),
    // infra zone (right)
    N('n1', 73, 24, 88, 10, 'server'), N('n2', 86, 38, 82, 9, 'db'),
    N('n3', 80, 60, 71, 9, 'cloud'), N('n4', 66, 71, 64, 8, 'network'),
    // identity zone (left)
    N('n5', 22, 28, 79, 9, 'user'), N('n6', 14, 47, 67, 8, 'app'),
    N('n7', 26, 65, 58, 8, 'monitor'), N('n8', 37, 78, 49, 7, 'chip'),
    // data / spine
    N('n9', 50, 15, 84, 9, 'server'), N('n10', 39, 35, 73, 8, 'db'),
    N('n11', 62, 39, 77, 9, 'app'), N('n12', 47, 67, 61, 8, 'db'),
    N('n13', 59, 83, 38, 9, 'cloud'), N('n14', 31, 51, 70, 8, 'network'),
  ];
  const E = (a, b) => [a, b];
  const edges = [
    E('core', 'n10'), E('core', 'n11'), E('core', 'n14'), E('core', 'n9'),
    E('n10', 'n5'), E('n10', 'n9'), E('n14', 'n6'), E('n14', 'n7'), E('n5', 'n6'), E('n7', 'n8'),
    E('n11', 'n1'), E('n11', 'n2'), E('n1', 'n9'), E('n2', 'n3'), E('n3', 'n4'), E('n4', 'n12'),
    E('n11', 'n12'), E('n12', 'n13'), E('n10', 'n12'), E('n11', 'n3'), E('n14', 'n12'), E('n7', 'n12'),
  ].map(([a, b], i) => ({ a, b, i }));

  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  const core = byId.core;
  // entrance order grows outward from the core
  const ranked = nodes.slice().sort((p, q) => {
    const dp = (p.x - core.x) ** 2 + (p.y - core.y) ** 2;
    const dq = (q.x - core.x) ** 2 + (q.y - core.y) ** 2;
    return dp - dq;
  });
  ranked.forEach((n, r) => {
    n.order = r;
    n.appear = 0.12 + r * 0.085;
    n.ph = (n.x * 1.7 + n.y * 0.9) % (Math.PI * 2);
    n.amp = 1.5 + (r % 3) * 0.55;
    n.spd = 0.45 + ((r * 7) % 5) * 0.06;
  });
  return { nodes, edges, byId, riskId: 'n13', path: ['n13', 'n12', 'core'] };
}

function HeroTrustGraph() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const model = useRef(null);
  if (!model.current) model.current = buildHeroModel();

  const [dims, setDims] = useState({ w: 560, h: 540 });
  const [risk, setRisk] = useState(false);
  const [coreVal, setCoreVal] = useState(74);
  const ptr = useRef({ tx: 0, ty: 0, x: 0, y: 0 });
  const uiRef = useRef({ risk: false, core: 74 });
  const reduced = useRef(
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // ---- responsive sizing ----
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width) setDims({ w: Math.round(r.width), h: Math.round(r.height) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---- pointer parallax ----
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || reduced.current) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      ptr.current.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ptr.current.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const onLeave = () => { ptr.current.tx = 0; ptr.current.ty = 0; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, []);

  // ---- main draw loop ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { w, h } = dims;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';

    const M = model.current;
    const padX = w * 0.12, padY = h * 0.10;
    const mapX = (nx) => padX + (nx / 100) * (w - padX * 2);
    const mapY = (ny) => padY + (ny / 100) * (h - padY * 2);

    // theme colors (resolved once per effect run)
    const C = {
      text: getCSS('--text'), dim: getCSS('--text-dim'), mute: getCSS('--text-mute'),
      teal: getCSS('--teal'), crit: getCSS('--crit'), amber: getCSS('--amber'),
      lime: getCSS('--lime'), orange: getCSS('--orange'), surface: getCSS('--surface-2'),
    };
    const bandColor = (t) => cssVar(trustBand(t).color);

    const smooth = (a, b, x) => {
      const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };
    const lerp = (a, b, t) => a + (b - a) * t;

    // deterministic curve control point between two screen points
    const ctrl = (ax, ay, bx, by, id) => {
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      let dx = bx - ax, dy = by - ay;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len;
      const sgn = (id % 2 === 0) ? 1 : -1;
      const off = len * 0.10 * sgn;
      return [mx + nx * off, my + ny * off];
    };
    const bez = (a, c, b, p) => {
      const u = 1 - p;
      return u * u * a + 2 * u * p * c + p * p * b;
    };

    // active trust pulses along edges
    let pulses = [];
    let lastPulse = 0, pulseEdge = -1;
    let nextRisk = 6.0;
    const RISK_PERIOD = 12.5, RISK_DUR = 5.4;
    let scenarioStart = -100;

    const start = performance.now();
    let raf;

    const frame = (now) => {
     try {
      const t = (now - start) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // ease pointer parallax
      ptr.current.x = lerp(ptr.current.x, ptr.current.tx, 0.06);
      ptr.current.y = lerp(ptr.current.y, ptr.current.ty, 0.06);
      const par = reduced.current ? 0 : 1;

      const driftAmp = reduced.current ? 0 : smooth(0.4, 2.4, t);

      // ---- risk scenario scheduling ----
      if (!reduced.current && t >= nextRisk) { scenarioStart = nextRisk; nextRisk += RISK_PERIOD; }
      const lt = t - scenarioStart; // local scenario time
      const inScenario = lt >= 0 && lt <= RISK_DUR;
      const riskRamp = inScenario ? smooth(0, 0.7, lt) - smooth(3.4, 4.7, lt) : 0; // 0→1→0
      const wantRiskCard = inScenario && lt > 0.45 && lt < 4.6;
      const wantCore = Math.round(lerp(74, 71, riskRamp));
      if (uiRef.current.risk !== wantRiskCard) { uiRef.current.risk = wantRiskCard; setRisk(wantRiskCard); }
      if (uiRef.current.core !== wantCore) { uiRef.current.core = wantCore; setCoreVal(wantCore); }

      // ---- compute live node positions ----
      const depth = (n) => {
        const dz = (n.id === 'core') ? 0 : 1;
        return dz;
      };
      for (const n of M.nodes) {
        const dx = driftAmp * n.amp * Math.sin(t * n.spd + n.ph);
        const dy = driftAmp * n.amp * Math.cos(t * n.spd * 0.8 + n.ph);
        const pz = depth(n) * 6 * par;
        n.sx = mapX(n.x) + dx + ptr.current.x * pz;
        n.sy = mapY(n.y) + dy + ptr.current.y * pz;
        n.scale = reduced.current ? 1 : smooth(n.appear, n.appear + 0.7, t);
        n.fill = smooth(n.appear + 0.2, n.appear + 1.2, t); // trust-ring fill progress
      }

      // ---- spawn ambient trust pulses ----
      if (!reduced.current && t > 3.0 && t - lastPulse > 0.8) {
        lastPulse = t;
        let e = -1, guard = 0;
        do { e = (Math.random() * M.edges.length) | 0; guard++; } while (e === pulseEdge && guard < 5);
        pulseEdge = e;
        pulses.push({ edge: e, t0: t, dur: 1.15, color: C.teal });
      }
      // ---- risk pulses along the path to core ----
      if (inScenario && lt > 0.4 && lt < 3.2) {
        const slot = Math.floor((lt - 0.4) / 0.55);
        if (!frame._lastRisk || frame._lastRisk !== scenarioStart + ':' + slot) {
          frame._lastRisk = scenarioStart + ':' + slot;
          for (let k = 0; k < M.path.length - 1; k++) {
            pulses.push({ pair: [M.path[k], M.path[k + 1]], t0: t + k * 0.18, dur: 0.9, color: C.crit });
          }
        }
      }

      // ---- draw edges ----
      for (const ed of M.edges) {
        const a = M.byId[ed.a], b = M.byId[ed.b];
        const av = Math.min(a.scale, b.scale);
        if (av <= 0.02) continue;
        const ea = Math.max(a.appear, b.appear) + 0.15;
        const prog = reduced.current ? 1 : smooth(ea, ea + 0.6, t);
        if (prog <= 0) continue;
        const [cx, cy] = ctrl(a.sx, a.sy, b.sx, b.sy, ed.i);
        const isRiskEdge = inScenario && (
          (ed.a === 'n13' || ed.b === 'n13' || ed.a === 'n12' || ed.b === 'n12') && riskRamp > 0.15
        );
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        // partial draw via sampling
        const steps = 22, end = Math.floor(steps * prog);
        for (let s = 1; s <= end; s++) {
          const p = s / steps;
          ctx.lineTo(bez(a.sx, cx, b.sx, p), bez(a.sy, cy, b.sy, p));
        }
        ctx.strokeStyle = isRiskEdge
          ? hexA(C.crit, 0.28 + 0.25 * riskRamp)
          : hexA(C.text, 0.085 * av);
        ctx.lineWidth = isRiskEdge ? 1.5 : 1;
        ctx.stroke();
      }

      // ---- draw pulses ----
      pulses = pulses.filter(pu => t - pu.t0 < pu.dur + 0.05);
      for (const pu of pulses) {
        const p = (t - pu.t0) / pu.dur;
        if (p < 0 || p > 1) continue;
        let a, b;
        if (pu.pair) { a = M.byId[pu.pair[0]]; b = M.byId[pu.pair[1]]; }
        else { const ed = M.edges[pu.edge]; a = M.byId[ed.a]; b = M.byId[ed.b]; }
        if (!a || !b) continue;
        const id = pu.pair ? (a.x + b.x) | 0 : pu.edge;
        const [cx, cy] = ctrl(a.sx, a.sy, b.sx, b.sy, id);
        const px = bez(a.sx, cx, b.sx, p), py = bez(a.sy, cy, b.sy, p);
        const fade = Math.sin(p * Math.PI);
        const r = 2.6;
        const g = ctx.createRadialGradient(px, py, 0, px, py, 13);
        g.addColorStop(0, hexA(pu.color, 0.9 * fade));
        g.addColorStop(1, hexA(pu.color, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px, py, 13, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = hexA(pu.color, fade);
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
      }

      // ---- draw nodes ----
      for (const n of M.nodes) {
        if (n.id === 'core' || n.scale <= 0.02) continue;
        let col = bandColor(n.trust);
        let glow = 0;
        if (n.id === M.riskId && riskRamp > 0) {
          col = cssVar(trustBand(lerp(n.trust, 16, riskRamp)).color);
          glow = riskRamp;
        }
        const sc = n.scale;
        const size = n.size * sc;
        ctx.save();
        // outer aura
        ctx.globalAlpha = sc;
        ctx.beginPath(); ctx.arc(n.sx, n.sy, size + 6, 0, Math.PI * 2);
        ctx.fillStyle = hexA(col, 0.10 + 0.12 * glow); ctx.fill();
        // risk halo pulse
        if (glow > 0) {
          const hr = size + 10 + Math.sin(t * 6) * 3;
          ctx.beginPath(); ctx.arc(n.sx, n.sy, hr, 0, Math.PI * 2);
          ctx.strokeStyle = hexA(C.crit, 0.35 * glow); ctx.lineWidth = 1.4; ctx.stroke();
        }
        // body
        ctx.beginPath(); ctx.arc(n.sx, n.sy, size, 0, Math.PI * 2);
        ctx.fillStyle = hexA(col, 0.2); ctx.fill();
        // trust mini-ring
        const sweep = (Math.PI * 2) * (n.trust / 100) * n.fill;
        ctx.beginPath();
        ctx.arc(n.sx, n.sy, size, -Math.PI / 2, -Math.PI / 2 + sweep);
        ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke();
        // remaining ring track
        ctx.beginPath(); ctx.arc(n.sx, n.sy, size, 0, Math.PI * 2);
        ctx.strokeStyle = hexA(col, 0.18); ctx.lineWidth = 1; ctx.stroke();
        // core dot
        ctx.beginPath(); ctx.arc(n.sx, n.sy, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = col; ctx.fill();
        ctx.restore();
      }

      // ---- draw org core ----
      const core = M.byId.core;
      const cscale = reduced.current ? 1 : smooth(0.05, 0.8, t);
      if (cscale > 0.05) {
        const breath = reduced.current ? 0 : Math.sin(t * 1.4) * 1.2;
        const R = Math.max(12, 44 * cscale + breath);
        const Rg = Math.max(2, R - 7);
        ctx.save();
        // soft field
        const fg = ctx.createRadialGradient(core.sx, core.sy, 0, core.sx, core.sy, R * 2.4);
        fg.addColorStop(0, hexA(C.teal, 0.10 * cscale));
        fg.addColorStop(1, hexA(C.teal, 0));
        ctx.fillStyle = fg;
        ctx.beginPath(); ctx.arc(core.sx, core.sy, R * 2.4, 0, Math.PI * 2); ctx.fill();
        // disc
        ctx.beginPath(); ctx.arc(core.sx, core.sy, R, 0, Math.PI * 2);
        ctx.fillStyle = hexA('#0c121b', 0.92); ctx.fill();
        ctx.lineWidth = 1; ctx.strokeStyle = hexA(C.text, 0.10); ctx.stroke();
        // track + gauge
        const gv = uiRef.current.core / 100;
        const gcol = cssVar(trustBand(uiRef.current.core).color);
        ctx.beginPath(); ctx.arc(core.sx, core.sy, Rg, 0, Math.PI * 2);
        ctx.strokeStyle = hexA(C.text, 0.07); ctx.lineWidth = 5; ctx.stroke();
        ctx.beginPath();
        ctx.arc(core.sx, core.sy, Rg, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * gv * cscale);
        ctx.strokeStyle = gcol; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
        ctx.shadowColor = hexA(gcol, 0.5); ctx.shadowBlur = 10;
        ctx.stroke(); ctx.shadowBlur = 0;
        // number
        ctx.fillStyle = gcol;
        ctx.font = '700 28px "JetBrains Mono", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.globalAlpha = cscale;
        ctx.fillText(String(uiRef.current.core), core.sx, core.sy - 4);
        ctx.fillStyle = C.mute;
        ctx.font = '600 8px "JetBrains Mono", monospace';
        ctx.fillText('ИНДЕКС', core.sx, core.sy + 13);
        ctx.restore();
      }

      } catch (err) { /* keep the loop alive */ }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [dims]);

  const riskNode = model.current.byId[model.current.riskId];

  return (
    <div className="hero-graph" ref={wrapRef}>
      <canvas ref={canvasRef} className="hero-graph-canvas" />

      {/* floating passport — healthy object (persistent) */}
      <figure className="hg-card hg-card-ok" aria-hidden="true">
        <div className="hg-card-top">
          <span className="hg-card-id mono">SRV‑CORE‑04</span>
          <span className="trust-chip trust-chip-sm" style={{ '--c': 'var(--teal)' }}>
            <span className="mono trust-chip-val">88</span>
          </span>
        </div>
        <div className="hg-card-row mono">Высокое доверие · 0 рисков</div>
      </figure>

      {/* floating passport — risk object (appears during risk scenario) */}
      <figure className={`hg-card hg-card-risk ${risk ? 'is-on' : ''}`} aria-hidden="true">
        <div className="hg-card-top">
          <span className="hg-card-id mono">STOR‑ARCH‑11</span>
          <span className="hg-pulse-dot" />
        </div>
        <div className="hg-card-row hg-card-risk-row mono">Критический риск выявлен</div>
        <div className="hg-card-meta mono">доверие 38 → 16 · влияет на индекс</div>
      </figure>

      {/* live status line */}
      <div className="hg-status mono">
        <span className={`hg-status-dot ${risk ? 'crit' : ''}`} />
        {risk ? 'Перерасчёт индекса · распространение риска' : 'Цифровая модель · live'}
      </div>
    </div>
  );
}

Object.assign(window, { HeroTrustGraph });
