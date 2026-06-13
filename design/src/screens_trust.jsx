// ============================================================
// DTEK Core — Паспорт доверия + Граф доверия
// ============================================================

function TrustPassport({ nav, params }) {
  const o = OBJECTS.find(x => x.id === params.id) || OBJECTS[0];
  const band = trustBand(o.trust);
  const factors = makeFactors(o);
  const objRisks = RISKS.filter(r => r.objId === o.id);
  const linked = GRAPH.links.filter(l => l.source === o.id || l.target === o.id).length;
  const tone = band.key === 'critical' ? 'crit' : band.key === 'low' ? 'orange' : band.key === 'medium' ? 'amber' : band.key === 'good' ? 'lime' : 'teal';

  return (
    <div className="screen passport-screen">
      <div className="passport-bar">
        <button className="back-link" onClick={() => nav('object', { id: o.id })}><Icon name="chevL" size={15} />К деталям объекта</button>
        <div className="passport-bar-actions">
          <Btn variant="ghost" icon="link" size="sm">Поделиться</Btn>
          <Btn variant="ghost" icon="download" size="sm">PDF</Btn>
          <Btn variant="line" icon="refresh" size="sm">Переоценить</Btn>
        </div>
      </div>

      <article className="passport" style={{ '--band': band.color }}>
        <div className="passport-grain" />
        {/* Шапка паспорта */}
        <header className="pp-head">
          <div className="pp-head-left">
            <div className="pp-kicker mono"><Logo size={18} /> ЦИФРОВОЙ ПАСПОРТ ДОВЕРИЯ</div>
            <h1 className="pp-name">{o.name}</h1>
            <div className="pp-sub mono">{o.id} · {OBJ_TYPES[o.type].label} · {ORG.short}</div>
            <div className="pp-tags">
              <CritTag value={o.criticality} />
              <Badge tone="neutral">{o.segment}</Badge>
              <Badge tone="neutral">{o.exposure}</Badge>
            </div>
          </div>
          <div className="pp-head-ring">
            <TrustRing value={o.trust} size={168} stroke={12} sub="из 100" />
            <div className={`pp-band-tag tag-${tone}`}><StatusDot tone={tone} />{band.label} доверие</div>
          </div>
        </header>

        {/* Сводка */}
        <div className="pp-summary">
          <PpStat label="Изменение, 30 дн" value={<Delta value={o.trust - o.prevTrust} suffix=" п." />} />
          <PpStat label="Открытых рисков" value={<span className="mono">{o.risks}</span>} accent={o.risks > 0 ? 'orange' : 'teal'} />
          <PpStat label="Связей в графе" value={<span className="mono">{linked}</span>} />
          <PpStat label="Покрытие ПБ" value={<span className="mono">{factors.find(f=>f.key==='compliance').score}%</span>} />
          <PpStat label="Оценка" value={<span className="mono">{o.updated}</span>} />
        </div>

        {/* Формула оценки доверия */}
        <section className="pp-section">
          <div className="pp-section-head">
            <h2 className="pp-section-title">Расчёт оценки</h2>
            <span className="pp-formula mono">Trust = Σ (фактор × вес)</span>
          </div>
          <div className="pp-factors">
            {factors.map(f => {
              const fb = trustBand(f.score);
              return (
                <div className="ppf" key={f.key}>
                  <div className="ppf-head">
                    <span className="ppf-label">{f.label}</span>
                    <span className="ppf-contrib mono">+{f.contribution}</span>
                  </div>
                  <div className="ppf-bar"><div className="ppf-fill" style={{ width: `${f.score}%`, background: fb.color }} /></div>
                  <div className="ppf-foot">
                    <span className="ppf-weight mono">вес {f.weight}%</span>
                    <span className="ppf-score mono" style={{ color: fb.color }}>{f.score}/100</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pp-total">
            <span className="pp-total-label">Итоговый индекс доверия</span>
            <div className="pp-total-bar">
              {factors.map((f, i) => (
                <div key={i} className="pp-total-seg" style={{ flex: f.contribution, background: trustBand(f.score).color, opacity: 0.85 }} title={`${f.label}: +${f.contribution}`} />
              ))}
            </div>
            <span className="pp-total-val mono" style={{ color: band.color }}>{o.trust}</span>
          </div>
        </section>

        <div className="pp-two-col">
          {/* Риски */}
          <section className="pp-section">
            <h2 className="pp-section-title">Риски объекта</h2>
            {objRisks.length ? (
              <div className="pp-risks">
                {objRisks.map(r => (
                  <div className="pp-risk" key={r.id}>
                    <span className={`pp-risk-sev sev-${r.severity}`} />
                    <div className="pp-risk-info">
                      <span className="pp-risk-title">{r.title}</span>
                      <span className="pp-risk-meta mono">{r.id} · SLA: {r.sla}</span>
                    </div>
                    <span className="pp-risk-score mono">{r.score}</span>
                  </div>
                ))}
              </div>
            ) : <div className="pp-norisk"><Icon name="shield" size={20} /><span>Открытых рисков не зафиксировано</span></div>}
          </section>

          {/* Идентификация / реквизиты */}
          <section className="pp-section">
            <h2 className="pp-section-title">Реквизиты объекта</h2>
            <div className="pp-meta-grid">
              <PpMeta label="Идентификатор" value={o.id} />
              <PpMeta label="Тип" value={OBJ_TYPES[o.type].label} />
              <PpMeta label="Сетевой адрес" value={o.ip} />
              <PpMeta label="Платформа" value={o.os} />
              <PpMeta label="Сегмент" value={o.segment} />
              <PpMeta label="Экспозиция" value={o.exposure} />
              <PpMeta label="Владелец" value={o.owner} />
              <PpMeta label="Критичность" value={o.criticality} />
            </div>
          </section>
        </div>

        {/* Печать / аттестация */}
        <footer className="pp-foot">
          <div className="pp-seal">
            <div className="pp-seal-ring">
              <Icon name="shield" size={22} />
            </div>
            <div className="pp-seal-text">
              <span className="pp-seal-title">Подтверждено DTEK Core</span>
              <span className="pp-seal-sub mono">SHA-256: a4f9…{o.id.slice(-4)} · {new Date().toLocaleDateString('ru')}</span>
            </div>
          </div>
          <div className="pp-qr" aria-hidden="true">
            {Array.from({ length: 49 }).map((_, i) => <span key={i} className="qr-px" style={{ opacity: (i * 7 + o.trust) % 3 === 0 ? 1 : 0.12 }} />)}
          </div>
        </footer>
      </article>
    </div>
  );
}

function PpStat({ label, value, accent }) {
  return <div className={`pp-stat ${accent ? 'accent-' + accent : ''}`}><span className="pp-stat-label">{label}</span><span className="pp-stat-val">{value}</span></div>;
}
function PpMeta({ label, value }) {
  return <div className="pp-meta"><span className="pp-meta-label">{label}</span><span className="pp-meta-val mono">{value}</span></div>;
}

// ---------- Граф доверия (экран) --------------------------
function TrustGraphScreen({ nav }) {
  const wrapRef = useRef(null);
  const [size, setSize] = useState({ width: 900, height: 580 });
  const [selected, setSelected] = useState(null);
  const [highlightType, setHighlightType] = useState(null);

  useEffect(() => {
    let done = false;
    const measure = () => {
      if (done || !wrapRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      const w = Math.max(560, Math.round(r.width));
      const h = Math.max(440, Math.round(r.height));
      setSize(prev => (Math.abs(prev.width - w) > 4 || Math.abs(prev.height - h) > 4) ? { width: w, height: h } : prev);
    };
    const id = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => { done = true; cancelAnimationFrame(id); window.removeEventListener('resize', measure); };
  }, []);

  const selObj = selected && selected.id !== 'ORG' ? OBJECTS.find(o => o.id === selected.id) : null;
  const legend = [
    { label: 'Высокое', color: 'var(--teal)' },
    { label: 'Достаточное', color: 'var(--lime)' },
    { label: 'Среднее', color: 'var(--amber)' },
    { label: 'Низкое', color: 'var(--orange)' },
    { label: 'Критическое', color: 'var(--crit)' },
  ];
  const typeFilters = Object.entries(OBJ_TYPES);

  return (
    <div className="screen graph-screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Граф доверия</h1>
          <p className="screen-sub">Живая модель связей · {GRAPH.nodes.length} узлов · {GRAPH.links.length} связей</p>
        </div>
        <div className="screen-head-actions">
          <div className="graph-type-filter">
            <button className={`gtf ${!highlightType ? 'active' : ''}`} onClick={() => setHighlightType(null)}>Все</button>
            {typeFilters.slice(0, 6).map(([k, v]) => (
              <button key={k} className={`gtf ${highlightType === k ? 'active' : ''}`} onClick={() => setHighlightType(highlightType === k ? null : k)} title={v.label}>
                <Icon name={v.glyph} size={14} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="graph-layout">
        <div className="graph-stage" ref={wrapRef}>
          <TrustGraphCanvas width={size.width} height={size.height} selectedId={selected && selected.id} highlightType={highlightType}
            onSelect={(n) => setSelected(n)} />
          <div className="graph-hint mono">тащите узлы · колесо — масштаб · клик — детали</div>
          <div className="graph-legend">
            <div className="graph-legend-title">Уровень доверия</div>
            {legend.map(l => <div className="gl-item" key={l.label}><span className="gl-dot" style={{ background: l.color }} />{l.label}</div>)}
          </div>
        </div>

        <aside className="graph-panel">
          {selected ? (
            selected.id === 'ORG' ? (
              <div className="gp-inner">
                <div className="gp-head">
                  <span className="gp-ico org"><Icon name="org" size={20} /></span>
                  <div><div className="gp-name">{ORG.short}</div><div className="gp-id mono">Организация · корень модели</div></div>
                </div>
                <div className="gp-ring"><TrustRing value={ORG.trust} size={110} stroke={8} sub="индекс" /></div>
                <p className="gp-note">Корневой узел цифровой модели. Индекс доверия агрегирует оценки всех {ORG.objects.toLocaleString('ru')} объектов.</p>
                <Btn variant="line" size="sm" icon="grid" onClick={() => nav('dashboard')}>Центр управления</Btn>
              </div>
            ) : (
              <div className="gp-inner">
                <div className="gp-head">
                  <span className="gp-ico" style={{ '--c': trustBand(selObj.trust).color }}><Icon name={typeGlyph(selObj.type)} size={20} /></span>
                  <div><div className="gp-name">{selObj.name}</div><div className="gp-id mono">{selObj.id}</div></div>
                </div>
                <div className="gp-ring"><TrustRing value={selObj.trust} size={110} stroke={8} sub="доверие" /></div>
                <div className="gp-facts">
                  <Fact label="Тип" value={OBJ_TYPES[selObj.type].label} />
                  <Fact label="Сегмент" value={selObj.segment} />
                  <Fact label="Критичность" value={<CritTag value={selObj.criticality} />} />
                  <Fact label="Рисков" value={<span className="mono">{selObj.risks}</span>} />
                  <Fact label="Связей" value={<span className="mono">{selObj.conns}</span>} />
                </div>
                <div className="gp-actions">
                  <Btn variant="line" size="sm" icon="passport" onClick={() => nav('passport', { id: selObj.id })}>Паспорт</Btn>
                  <Btn variant="ghost" size="sm" icon="eye" onClick={() => nav('object', { id: selObj.id })}>Детали</Btn>
                </div>
              </div>
            )
          ) : (
            <div className="gp-empty">
              <EmptyState icon="graph" title="Выберите узел"
                text="Кликните по объекту на графе, чтобы увидеть его уровень доверия, риски и связи." />
              <div className="gp-stats">
                <div className="gp-stat"><span className="mono gp-stat-v">{GRAPH.nodes.length - 1}</span><span className="gp-stat-l">объектов</span></div>
                <div className="gp-stat"><span className="mono gp-stat-v">{GRAPH.links.length}</span><span className="gp-stat-l">связей</span></div>
                <div className="gp-stat"><span className="mono gp-stat-v" style={{ color: 'var(--crit)' }}>2</span><span className="gp-stat-l">критич. узла</span></div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { TrustPassport, TrustGraphScreen });
