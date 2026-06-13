// ============================================================
// DTEK Core — Trust Graph (force-directed, canvas)
// ============================================================

function useForceGraph(nodes, links, { width, height }) {
  const state = useRef({ nodes: [], links: [], alpha: 1 });

  useEffect(() => {
    const cx = width / 2, cy = height / 2;
    state.current.nodes = nodes.map((n, i) => {
      const ang = (i / nodes.length) * Math.PI * 2;
      const rad = n.type === 'org' ? 0 : 120 + (i % 5) * 26;
      return { ...n, x: cx + Math.cos(ang) * rad, y: cy + Math.sin(ang) * rad, vx: 0, vy: 0, fx: n.type === 'org' ? cx : null, fy: n.type === 'org' ? cy : null };
    });
    const byId = Object.fromEntries(state.current.nodes.map(n => [n.id, n]));
    state.current.links = links.map(l => ({ source: byId[l.source], target: byId[l.target] })).filter(l => l.source && l.target);
    state.current.alpha = 1;
  }, [nodes, links, width, height]);

  const tick = useCallback(() => {
    const s = state.current;
    if (!s.nodes.length) return;
    const cx = width / 2, cy = height / 2;
    s.alpha = Math.max(s.alpha * 0.985, 0.02);
    const k = s.alpha;
    // отталкивание
    for (let i = 0; i < s.nodes.length; i++) {
      const a = s.nodes[i];
      for (let j = i + 1; j < s.nodes.length; j++) {
        const b = s.nodes[j];
        let dx = a.x - b.x, dy = a.y - b.y;
        let d2 = dx * dx + dy * dy || 0.01;
        const d = Math.sqrt(d2);
        const rep = (3000 * k) / d2;
        const fx = (dx / d) * rep, fy = (dy / d) * rep;
        a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
      }
    }
    // пружины
    for (const l of s.links) {
      let dx = l.target.x - l.source.x, dy = l.target.y - l.source.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const desired = l.source.type === 'org' || l.target.type === 'org' ? 150 : 112;
      const f = ((d - desired) / d) * 0.05 * k;
      const fx = dx * f, fy = dy * f;
      l.source.vx += fx; l.source.vy += fy; l.target.vx -= fx; l.target.vy -= fy;
    }
    // к центру + интеграция
    for (const n of s.nodes) {
      n.vx += (cx - n.x) * 0.0012 * k;
      n.vy += (cy - n.y) * 0.0012 * k;
      n.vx *= 0.86; n.vy *= 0.86;
      if (n.fx != null) { n.x = n.fx; n.y = n.fy; }
      else { n.x += n.vx; n.y += n.vy; }
    }
  }, [width, height]);

  return { state, tick };
}

function TrustGraphCanvas({ width = 900, height = 560, onSelect, selectedId, highlightType }) {
  const canvasRef = useRef(null);
  const { state, tick } = useForceGraph(GRAPH.nodes, GRAPH.links, { width, height });
  const view = useRef({ scale: 1, ox: 0, oy: 0, drag: null, hover: null });
  const [, force] = useState(0);

  // рисование
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr; canvas.height = height * dpr;
    canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
    let raf;
    const colorFor = (n) => {
      if (n.type === 'org') return getCSS('--text');
      const b = trustBand(n.trust);
      return cssVar(b.color);
    };
    const draw = () => {
      tick();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const v = view.current;
      ctx.save();
      ctx.translate(v.ox, v.oy); ctx.scale(v.scale, v.scale);
      const s = state.current;
      // связи
      for (const l of s.links) {
        const dim = highlightType && l.source.type !== highlightType && l.target.type !== highlightType;
        const active = selectedId && (l.source.id === selectedId || l.target.id === selectedId);
        ctx.beginPath();
        ctx.moveTo(l.source.x, l.source.y);
        const mx = (l.source.x + l.target.x) / 2, my = (l.source.y + l.target.y) / 2 - 8;
        ctx.quadraticCurveTo(mx, my, l.target.x, l.target.y);
        ctx.strokeStyle = active ? 'rgba(45,212,191,.55)' : dim ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.09)';
        ctx.lineWidth = active ? 1.6 : 1;
        ctx.stroke();
      }
      // узлы
      for (const n of s.nodes) {
        const col = colorFor(n);
        const dim = highlightType && n.type !== highlightType && n.type !== 'org';
        const sel = selectedId === n.id;
        const hov = v.hover === n.id;
        ctx.globalAlpha = dim ? 0.25 : 1;
        // ореол
        if (sel || hov) {
          ctx.beginPath(); ctx.arc(n.x, n.y, n.size + 8, 0, Math.PI * 2);
          ctx.fillStyle = hexA(col, 0.14); ctx.fill();
        }
        // тело
        ctx.beginPath(); ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fillStyle = n.type === 'org' ? '#0d1219' : hexA(col, 0.18);
        ctx.fill();
        ctx.lineWidth = sel ? 2.4 : 1.6;
        ctx.strokeStyle = col; ctx.stroke();
        if (n.type === 'org') {
          ctx.beginPath(); ctx.arc(n.x, n.y, 5, 0, Math.PI * 2); ctx.fillStyle = cssVar('--teal'); ctx.fill();
        }
        // подпись
        if (n.size > 10 || sel || hov || n.type === 'org') {
          ctx.globalAlpha = dim ? 0.25 : 0.9;
          ctx.fillStyle = getCSS('--text-dim');
          ctx.font = '600 11px Manrope, sans-serif';
          ctx.textAlign = 'center';
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
  }, [width, height, tick, selectedId, highlightType]);

  // взаимодействие
  const pick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const v = view.current;
    const x = (e.clientX - rect.left - v.ox) / v.scale;
    const y = (e.clientY - rect.top - v.oy) / v.scale;
    let hit = null;
    for (const n of state.current.nodes) {
      if ((n.x - x) ** 2 + (n.y - y) ** 2 <= (n.size + 4) ** 2) { hit = n; break; }
    }
    return { hit, x, y };
  };
  const onDown = (e) => {
    const { hit, x, y } = pick(e);
    if (hit) view.current.drag = { node: hit, moved: false };
    else view.current.drag = { pan: true, sx: e.clientX, sy: e.clientY, ox: view.current.ox, oy: view.current.oy };
  };
  const onMove = (e) => {
    const v = view.current;
    if (v.drag && v.drag.node) {
      const { x, y } = pick(e);
      v.drag.node.fx = x; v.drag.node.fy = y; v.drag.moved = true; state.current.alpha = Math.max(state.current.alpha, 0.4);
    } else if (v.drag && v.drag.pan) {
      v.ox = v.drag.ox + (e.clientX - v.drag.sx); v.oy = v.drag.oy + (e.clientY - v.drag.sy);
    } else {
      const { hit } = pick(e);
      const id = hit ? hit.id : null;
      if (v.hover !== id) { v.hover = id; canvasRef.current.style.cursor = hit ? 'pointer' : 'grab'; }
    }
  };
  const onUp = (e) => {
    const v = view.current;
    if (v.drag && v.drag.node) {
      if (!v.drag.moved && onSelect) onSelect(v.drag.node);
      if (v.drag.node.type !== 'org') { v.drag.node.fx = null; v.drag.node.fy = null; }
    }
    v.drag = null;
  };
  const onWheel = (e) => {
    e.preventDefault();
    const v = view.current;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    const ns = Math.min(2.4, Math.max(0.5, v.scale * factor));
    v.ox = mx - (mx - v.ox) * (ns / v.scale);
    v.oy = my - (my - v.oy) * (ns / v.scale);
    v.scale = ns;
  };

  return (
    <canvas ref={canvasRef}
      onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} onWheel={onWheel}
      style={{ display: 'block', cursor: 'grab', touchAction: 'none' }} />
  );
}

// утилиты для canvas-цветов
function getCSS(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '#e6edf3';
}
function cssVar(token) {
  if (token && token.startsWith('var(')) return getCSS(token.slice(4, -1));
  return token;
}
function hexA(hex, a) {
  hex = cssVar(hex);
  if (hex.startsWith('#')) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return `rgba(${r},${g},${b},${a})`;
  }
  return hex;
}

Object.assign(window, { TrustGraphCanvas, getCSS, cssVar, hexA });
