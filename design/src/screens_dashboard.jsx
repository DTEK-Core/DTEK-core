// ============================================================
// DTEK Core — Центр управления (Dashboard)
// ============================================================

function KpiCard({ label, value, unit, delta, deltaInvert, spark, sparkColor, icon, onClick }) {
  return (
    <button className="kpi" onClick={onClick}>
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        <span className="kpi-ico"><Icon name={icon} size={16} /></span>
      </div>
      <div className="kpi-val mono">{value}<span className="kpi-unit">{unit}</span></div>
      <div className="kpi-foot">
        {delta != null && <Delta value={delta} invert={deltaInvert} />}
        {spark && <Sparkline data={spark} w={84} h={28} color={sparkColor} />}
      </div>
    </button>
  );
}

function Dashboard({ nav }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 650); return () => clearTimeout(t); }, []);

  const openRisks = RISKS.filter(r => r.status !== 'Принят');
  const critical = RISKS.filter(r => r.severity === 'critical').length;
  const topRisky = [...OBJECTS].sort((a, b) => a.trust - b.trust).slice(0, 5);
  const coverage = Math.round((ORG.monitored / ORG.objects) * 100);
  const maxDist = Math.max(...TRUST_DIST.map(d => d.count));

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Центр управления</h1>
          <p className="screen-sub">Цифровая модель · {ORG.name} · обновлено в реальном времени</p>
        </div>
        <div className="screen-head-actions">
          <div className="live-pill"><StatusDot tone="teal" pulse />Онлайн · 6 коннекторов</div>
          <Btn variant="ghost" icon="refresh" size="sm">Переоценить</Btn>
          <Btn variant="primary" icon="download" size="sm">Отчёт</Btn>
        </div>
      </div>

      {/* Героическая полоса */}
      <div className="dash-hero">
        <div className="hero-trust card">
          <div className="hero-trust-ring">
            <TrustRing value={ORG.trust} size={150} stroke={11} sub="из 100" />
          </div>
          <div className="hero-trust-info">
            <div className="hero-trust-label">Индекс доверия организации</div>
            <div className="hero-trust-band">
              <Badge tone="amber" dot soft={false}>{trustBand(ORG.trust).label}</Badge>
              <Delta value={ORG.trustTrend} suffix=" за 30 дн" />
            </div>
            <p className="hero-trust-note">Совокупная оценка по {ORG.objects.toLocaleString('ru')} объектам цифровой модели. Снижают индекс 2 критических объекта в технологическом сегменте.</p>
            <div className="hero-trust-cta">
              <Btn variant="line" icon="graph" size="sm" onClick={() => nav('graph')}>Открыть граф доверия</Btn>
              <Btn variant="ghost" icon="eye" size="sm" onClick={() => nav('objects')}>К объектам</Btn>
            </div>
          </div>
        </div>

        <div className="kpi-grid">
          <KpiCard label="Объектов в модели" value={ORG.objects.toLocaleString('ru')} delta={null}
            icon="objects" spark={[1180,1192,1201,1210,1224,1231,1240,1248]} sparkColor="var(--info)" onClick={() => nav('objects')} />
          <KpiCard label="Под мониторингом" value={coverage} unit="%" delta={+2} icon="pulse"
            spark={[88,89,90,91,92,93,94,95]} sparkColor="var(--teal)" />
          <KpiCard label="Открытых рисков" value={openRisks.length} delta={-3} deltaInvert
            icon="risk" spark={RISK_HISTORY} sparkColor="var(--orange)" onClick={() => nav('risks')} />
          <KpiCard label="Критических" value={critical} delta={+1} deltaInvert
            icon="shield" spark={[1,1,2,1,2,2,1,2]} sparkColor="var(--crit)" onClick={() => nav('risks')} />
        </div>
      </div>

      {/* Основная сетка */}
      <div className="dash-grid">
        <Card title="Динамика индекса доверия" className="span-7"
          action={<Segment options={[{value:'30',label:'30 дн'},{value:'90',label:'90 дн'},{value:'1y',label:'1 год'}]} value="30" onChange={()=>{}} />}>
          {loading ? <Skeleton h={180} /> : <TrendChart data={TRUST_HISTORY} />}
        </Card>

        <Card title="Распределение по уровню доверия" className="span-5">
          {loading ? <LoadingRows rows={5} cols={2} /> : (
            <div className="dist-list">
              {TRUST_DIST.map(d => (
                <div className="dist-row" key={d.band}>
                  <div className="dist-meta">
                    <span className="dist-dot" style={{ background: d.color }} />
                    <span className="dist-band">{d.band}</span>
                    <span className="dist-range mono">{d.range}</span>
                  </div>
                  <div className="dist-bar-wrap">
                    <div className="dist-bar" style={{ width: `${(d.count/maxDist)*100}%`, background: d.color }} />
                  </div>
                  <span className="dist-count mono">{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Объекты с наименьшим доверием" className="span-7"
          action={<button className="card-link" onClick={() => nav('objects')}>Все объекты<Icon name="chevR" size={13} /></button>}>
          {loading ? <LoadingRows rows={5} cols={4} /> : (
            <div className="mini-table">
              {topRisky.map(o => (
                <button className="mini-row" key={o.id} onClick={() => nav('passport', { id: o.id })}>
                  <span className="mini-type"><Icon name={typeGlyph(o.type)} size={15} /></span>
                  <span className="mini-name">
                    <span className="mini-name-main">{o.name}</span>
                    <span className="mini-name-sub mono">{o.id} · {o.segment}</span>
                  </span>
                  <span className={`mini-crit crit-${o.criticality === 'Критичный' ? 'high' : 'mid'}`}>{o.criticality}</span>
                  <span className="mini-risks"><Icon name="risk" size={13} />{o.risks}</span>
                  <TrustChip value={o.trust} />
                  <Icon name="chevR" size={15} className="mini-arrow" />
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card title="Лента событий" className="span-5"
          action={<div className="live-mini"><StatusDot tone="teal" pulse />live</div>}>
          {loading ? <LoadingRows rows={6} cols={2} /> : (
            <div className="feed">
              {EVENTS.map((e, i) => {
                const tone = e.sev === 'critical' ? 'crit' : e.sev === 'high' ? 'orange' : e.sev === 'low' ? 'teal' : 'info';
                return (
                  <div className="feed-item" key={i}>
                    <span className="feed-time mono">{e.time}</span>
                    <span className={`feed-rail feed-${tone}`} />
                    <div className="feed-body">
                      <span className="feed-text">{e.text}</span>
                      {e.obj && <button className="feed-obj mono" onClick={() => nav('passport', { id: e.obj })}>{e.obj}</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Простой линейный график-тренд
function TrendChart({ data }) {
  const w = 640, h = 190, pad = 28;
  const min = Math.min(...data) - 4, max = Math.max(...data) + 4;
  const rng = max - min || 1;
  const X = i => pad + (i / (data.length - 1)) * (w - pad * 2);
  const Y = v => h - pad - ((v - min) / rng) * (h - pad * 2);
  const path = data.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
  const area = `${path} L${X(data.length-1)} ${h-pad} L${X(0)} ${h-pad} Z`;
  const ticks = [max, (max+min)/2, min].map(Math.round);
  return (
    <div className="trend">
      <svg viewBox={`0 0 ${w} ${h}`} className="trend-svg" preserveAspectRatio="none">
        <defs><linearGradient id="trendg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--teal)" stopOpacity="0.22" />
          <stop offset="1" stopColor="var(--teal)" stopOpacity="0" />
        </linearGradient></defs>
        {ticks.map((t, i) => (
          <line key={i} x1={pad} x2={w-pad} y1={pad + i*(h-pad*2)/2} y2={pad + i*(h-pad*2)/2}
            stroke="rgba(255,255,255,.05)" />
        ))}
        <path d={area} fill="url(#trendg)" />
        <path d={path} fill="none" stroke="var(--teal)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((v, i) => i === data.length-1 && (
          <g key={i}>
            <circle cx={X(i)} cy={Y(v)} r="9" fill="var(--teal)" opacity="0.16" />
            <circle cx={X(i)} cy={Y(v)} r="3.4" fill="var(--teal)" />
          </g>
        ))}
      </svg>
      <div className="trend-axis">
        {ticks.map((t,i) => <span key={i} className="mono">{t}</span>)}
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
