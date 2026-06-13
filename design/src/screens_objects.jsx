// ============================================================
// DTEK Core — Объекты + Детали объекта
// ============================================================

function ObjectsScreen({ nav }) {
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [typeF, setTypeF] = useState('all');
  const [bandF, setBandF] = useState('all');
  const [view, setView] = useState('table');
  const [sort, setSort] = useState({ key: 'trust', dir: 'asc' });
  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);

  const types = Object.entries(OBJ_TYPES);
  let rows = OBJECTS.filter(o => {
    if (q && !(o.name.toLowerCase().includes(q.toLowerCase()) || o.id.toLowerCase().includes(q.toLowerCase()))) return false;
    if (typeF !== 'all' && o.type !== typeF) return false;
    if (bandF !== 'all' && trustBand(o.trust).key !== bandF) return false;
    return true;
  });
  rows = [...rows].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    if (sort.key === 'name') return a.name.localeCompare(b.name) * dir;
    if (sort.key === 'risks') return (a.risks - b.risks) * dir;
    return (a.trust - b.trust) * dir;
  });
  const setSortKey = (key) => setSort(s => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Объекты</h1>
          <p className="screen-sub">{ORG.objects.toLocaleString('ru')} объектов в цифровой модели · {rows.length} показано</p>
        </div>
        <div className="screen-head-actions">
          <Btn variant="ghost" icon="download" size="sm">Экспорт</Btn>
          <Btn variant="primary" icon="plus" size="sm">Добавить объект</Btn>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Icon name="search" size={16} style={{ opacity: .5 }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Поиск по имени или ID…" />
        </div>
        <div className="toolbar-filters">
          <FilterSelect label="Тип" value={typeF} onChange={setTypeF}
            options={[{ value: 'all', label: 'Все типы' }, ...types.map(([k, v]) => ({ value: k, label: v.label }))]} />
          <FilterSelect label="Уровень" value={bandF} onChange={setBandF}
            options={[{ value: 'all', label: 'Любой' }, { value: 'high', label: 'Высокое' }, { value: 'good', label: 'Достаточное' }, { value: 'medium', label: 'Среднее' }, { value: 'low', label: 'Низкое' }, { value: 'critical', label: 'Критическое' }]} />
          <Segment options={[{ value: 'table', label: '☰' }, { value: 'cards', label: '▦' }]} value={view} onChange={setView} />
        </div>
      </div>

      {loading ? <Card><LoadingRows rows={8} cols={6} /></Card>
       : rows.length === 0 ? (
        <Card><EmptyState icon="objects" title="Объекты не найдены"
          text="Измените фильтры или добавьте объект в цифровую модель организации."
          action={<Btn variant="line" icon="plus" size="sm">Добавить объект</Btn>} /></Card>
       ) : view === 'table' ? (
        <Card pad={false}>
          <div className="otable">
            <div className="otable-head">
              <button className="oth oth-name" onClick={() => setSortKey('name')}>Объект <SortCaret active={sort.key==='name'} dir={sort.dir} /></button>
              <span className="oth">Тип</span>
              <span className="oth">Сегмент</span>
              <span className="oth">Критичность</span>
              <button className="oth oth-c" onClick={() => setSortKey('risks')}>Риски <SortCaret active={sort.key==='risks'} dir={sort.dir} /></button>
              <button className="oth oth-c" onClick={() => setSortKey('trust')}>Доверие <SortCaret active={sort.key==='trust'} dir={sort.dir} /></button>
              <span className="oth oth-c">Обновлён</span>
            </div>
            {rows.map(o => (
              <button className="otable-row" key={o.id} onClick={() => nav('object', { id: o.id })}>
                <span className="ot-name">
                  <span className="ot-type-ico"><Icon name={typeGlyph(o.type)} size={16} /></span>
                  <span className="ot-name-text">
                    <span className="ot-name-main">{o.name}</span>
                    <span className="ot-name-sub mono">{o.id} · {o.exposure}</span>
                  </span>
                </span>
                <span className="ot-cell ot-dim">{OBJ_TYPES[o.type].label}</span>
                <span className="ot-cell ot-dim">{o.segment}</span>
                <span className="ot-cell"><CritTag value={o.criticality} /></span>
                <span className="ot-cell ot-c">{o.risks > 0 ? <span className="ot-risks"><Icon name="risk" size={12} />{o.risks}</span> : <span className="ot-zero mono">0</span>}</span>
                <span className="ot-cell ot-c"><TrustChip value={o.trust} /></span>
                <span className="ot-cell ot-c ot-dim mono">{o.updated}</span>
              </button>
            ))}
          </div>
        </Card>
       ) : (
        <div className="ocards">
          {rows.map(o => {
            const band = trustBand(o.trust);
            return (
              <button className="ocard" key={o.id} onClick={() => nav('object', { id: o.id })} style={{ '--c': band.color }}>
                <div className="ocard-top">
                  <span className="ocard-type"><Icon name={typeGlyph(o.type)} size={18} /></span>
                  <TrustRing value={o.trust} size={56} stroke={5} label sub="" animate={false} />
                </div>
                <div className="ocard-name">{o.name}</div>
                <div className="ocard-id mono">{o.id}</div>
                <div className="ocard-meta">
                  <CritTag value={o.criticality} />
                  <span className="ocard-seg">{o.segment}</span>
                </div>
                <div className="ocard-foot">
                  <span className="ocard-risks">{o.risks > 0 ? <><Icon name="risk" size={12} />{o.risks} риск(ов)</> : 'Без рисков'}</span>
                  <span className="ocard-conns mono"><Icon name="link" size={12} />{o.conns}</span>
                </div>
              </button>
            );
          })}
        </div>
       )}
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const cur = options.find(o => o.value === value);
  return (
    <div className="fsel">
      <button className={`fsel-btn ${value !== 'all' ? 'active' : ''}`} onClick={() => setOpen(o => !o)}>
        <Icon name="filter" size={13} /><span>{cur ? cur.label : label}</span><Icon name="chevD" size={13} style={{ opacity: .5 }} />
      </button>
      {open && <>
        <div className="overlay-soft" onClick={() => setOpen(false)} />
        <div className="fsel-menu pop">
          {options.map(o => (
            <button key={o.value} className={`fsel-item ${o.value === value ? 'active' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}>
              {o.label}{o.value === value && <Icon name="check" size={14} />}
            </button>
          ))}
        </div>
      </>}
    </div>
  );
}

function SortCaret({ active, dir }) {
  return <span className={`sort-caret ${active ? 'on' : ''}`}><Icon name={active && dir === 'desc' ? 'arrowDown' : 'arrowUp'} size={11} stroke={2.4} /></span>;
}

function CritTag({ value }) {
  const tone = value === 'Критичный' ? 'crit' : value === 'Высокий' ? 'orange' : value === 'Средний' ? 'amber' : 'neutral';
  return <Badge tone={tone}>{value}</Badge>;
}

// ---------- Детали объекта --------------------------------
function ObjectDetail({ nav, params }) {
  const o = OBJECTS.find(x => x.id === params.id) || OBJECTS[0];
  const [tab, setTab] = useState('overview');
  const band = trustBand(o.trust);
  const objRisks = RISKS.filter(r => r.objId === o.id);
  const linked = GRAPH.links
    .filter(l => l.source === o.id || l.target === o.id)
    .map(l => (l.source === o.id ? l.target : l.source))
    .map(id => OBJECTS.find(x => x.id === id) || (id === 'ORG' ? { id: 'ORG', name: ORG.short, type: 'org', trust: ORG.trust } : null))
    .filter(Boolean);
  const factors = makeFactors(o);

  const tabs = [
    { key: 'overview', label: 'Обзор' },
    { key: 'factors', label: 'Факторы доверия' },
    { key: 'risks', label: `Риски · ${objRisks.length}` },
    { key: 'conns', label: `Связи · ${linked.length}` },
    { key: 'history', label: 'История' },
  ];

  return (
    <div className="screen">
      <div className="detail-head">
        <div className="detail-id">
          <span className="detail-type-ico" style={{ '--c': band.color }}><Icon name={typeGlyph(o.type)} size={22} /></span>
          <div>
            <div className="detail-title-row">
              <h1 className="detail-title">{o.name}</h1>
              <CritTag value={o.criticality} />
            </div>
            <div className="detail-meta mono">{o.id} · {OBJ_TYPES[o.type].label} · {o.segment} · {o.ip}</div>
          </div>
        </div>
        <div className="detail-actions">
          <Btn variant="ghost" icon="refresh" size="sm">Переоценить</Btn>
          <Btn variant="line" icon="passport" size="sm" onClick={() => nav('passport', { id: o.id })}>Паспорт доверия</Btn>
        </div>
      </div>

      <div className="detail-strip">
        <div className="dstrip-ring"><TrustRing value={o.trust} size={96} stroke={7} sub="доверие" /></div>
        <div className="dstrip-facts">
          <Fact label="Уровень" value={<Badge tone={band.key==='critical'?'crit':band.key==='low'?'orange':band.key==='medium'?'amber':'teal'} dot>{band.label}</Badge>} />
          <Fact label="Изменение" value={<Delta value={o.trust - o.prevTrust} suffix=" п." />} />
          <Fact label="Открытых рисков" value={<span className="mono">{o.risks}</span>} />
          <Fact label="Связей" value={<span className="mono">{o.conns}</span>} />
          <Fact label="Экспозиция" value={o.exposure} />
          <Fact label="Владелец" value={o.owner} />
          <Fact label="Платформа" value={<span className="mono">{o.os}</span>} />
          <Fact label="Обновлён" value={<span className="mono">{o.updated}</span>} />
        </div>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      <div className="detail-body">
        {tab === 'overview' && <ObjOverview o={o} factors={factors} objRisks={objRisks} linked={linked} nav={nav} />}
        {tab === 'factors' && <FactorBreakdown factors={factors} />}
        {tab === 'risks' && (objRisks.length ? <RiskMiniTable risks={objRisks} nav={nav} /> :
          <Card><EmptyState icon="shield" title="Рисков нет" text="По объекту не зафиксировано открытых рисков. Отличный показатель." /></Card>)}
        {tab === 'conns' && <ConnList linked={linked} nav={nav} />}
        {tab === 'history' && <HistoryTimeline o={o} />}
      </div>
    </div>
  );
}

function Fact({ label, value }) {
  return <div className="fact"><span className="fact-label">{label}</span><span className="fact-value">{value}</span></div>;
}

function ObjOverview({ o, factors, objRisks, linked, nav }) {
  return (
    <div className="ov-grid">
      <Card title="Факторы доверия" className="span-7">
        <FactorBreakdown factors={factors} compact />
      </Card>
      <Card title="Активные риски" className="span-5"
        action={objRisks.length > 0 && <span className="card-count mono">{objRisks.length}</span>}>
        {objRisks.length ? <RiskMiniTable risks={objRisks.slice(0,4)} nav={nav} bare /> :
          <EmptyState icon="shield" title="Рисков нет" />}
      </Card>
      <Card title="Связанные объекты" className="span-12"
        action={<button className="card-link" onClick={() => nav('graph')}>Показать в графе<Icon name="chevR" size={13} /></button>}>
        <ConnList linked={linked} nav={nav} bare />
      </Card>
    </div>
  );
}

function makeFactors(o) {
  // детерминированные псевдо-значения из trust + ключа
  const seed = parseInt(o.id.replace(/\D/g, '')) || 7;
  return TRUST_FACTORS.map((f, i) => {
    const base = o.trust + ((seed * (i + 3)) % 30) - 14;
    const score = Math.max(8, Math.min(98, Math.round(base)));
    return { ...f, score, contribution: Math.round((score * f.weight) / 100) };
  });
}

function FactorBreakdown({ factors, compact }) {
  return (
    <div className={`factors ${compact ? 'compact' : ''}`}>
      {factors.map(f => {
        const band = trustBand(f.score);
        return (
          <div className="factor" key={f.key}>
            <div className="factor-top">
              <span className="factor-label">{f.label}</span>
              <span className="factor-weight mono">вес {f.weight}%</span>
              <span className="factor-score mono" style={{ color: band.color }}>{f.score}</span>
            </div>
            <Meter value={f.score} color={band.color} />
            {!compact && <p className="factor-desc">{f.desc}</p>}
          </div>
        );
      })}
    </div>
  );
}

function RiskMiniTable({ risks, nav, bare }) {
  const body = (
    <div className="rmini">
      {risks.map(r => (
        <button className="rmini-row" key={r.id} onClick={() => nav('risks')}>
          <span className={`rmini-sev sev-${r.severity}`} />
          <span className="rmini-info">
            <span className="rmini-title">{r.title}</span>
            <span className="rmini-meta mono">{r.id} · {r.cat}</span>
          </span>
          <Badge tone={r.status === 'Открыт' ? 'orange' : r.status === 'В работе' ? 'info' : 'neutral'}>{r.status}</Badge>
          <span className="rmini-score mono">{r.score}</span>
        </button>
      ))}
    </div>
  );
  return bare ? body : <Card pad={false}><div style={{ padding: 8 }}>{body}</div></Card>;
}

function ConnList({ linked, nav, bare }) {
  const body = (
    <div className="conn-grid">
      {linked.map(c => (
        <button className="conn-card" key={c.id} onClick={() => c.type !== 'org' && nav('object', { id: c.id })}>
          <span className="conn-ico"><Icon name={c.type === 'org' ? 'org' : typeGlyph(c.type)} size={16} /></span>
          <span className="conn-info">
            <span className="conn-name">{c.name}</span>
            <span className="conn-id mono">{c.id}</span>
          </span>
          {c.type !== 'org' && <TrustChip value={c.trust} size="sm" />}
        </button>
      ))}
    </div>
  );
  return bare ? body : <Card>{body}</Card>;
}

function HistoryTimeline({ o }) {
  const events = [
    { t: '2 ч назад', txt: `Снижение доверия до ${o.trust} (−${o.prevTrust - o.trust > 0 ? o.prevTrust - o.trust : 2})`, tone: 'orange' },
    { t: 'Сегодня, 09:14', txt: 'Завершена автоматическая переоценка факторов', tone: 'info' },
    { t: 'Вчера', txt: 'Обнаружен новый риск: устаревшая конфигурация', tone: 'crit' },
    { t: '3 дня назад', txt: 'Объект включён в технологический сегмент', tone: 'teal' },
    { t: '12 дней назад', txt: 'Объект добавлен в цифровую модель через коннектор Active Directory', tone: 'neutral' },
  ];
  return (
    <Card>
      <div className="timeline">
        {events.map((e, i) => (
          <div className="tl-item" key={i}>
            <span className={`tl-dot tl-${e.tone}`} />
            <div className="tl-body">
              <span className="tl-time mono">{e.t}</span>
              <span className="tl-text">{e.txt}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

Object.assign(window, { ObjectsScreen, ObjectDetail, FilterSelect, CritTag, FactorBreakdown, makeFactors, RiskMiniTable, ConnList });
