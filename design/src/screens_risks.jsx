// ============================================================
// DTEK Core — Реестр рисков
// ============================================================

function RiskRegister({ nav }) {
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [sevF, setSevF] = useState('all');
  const [statusF, setStatusF] = useState('all');
  const [selected, setSelected] = useState(null);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 550); return () => clearTimeout(t); }, []);

  let rows = RISKS.filter(r => {
    if (q && !(r.title.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase()) || r.obj.toLowerCase().includes(q.toLowerCase()))) return false;
    if (sevF !== 'all' && r.severity !== sevF) return false;
    if (statusF !== 'all' && r.status !== statusF) return false;
    return true;
  }).sort((a, b) => b.score - a.score);

  const counts = {
    critical: RISKS.filter(r => r.severity === 'critical').length,
    high: RISKS.filter(r => r.severity === 'high').length,
    medium: RISKS.filter(r => r.severity === 'medium').length,
    low: RISKS.filter(r => r.severity === 'low').length,
  };
  const sel = selected && RISKS.find(r => r.id === selected);

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Реестр рисков</h1>
          <p className="screen-sub">{RISKS.filter(r=>r.status!=='Принят').length} активных рисков · приоритизация по влиянию на доверие</p>
        </div>
        <div className="screen-head-actions">
          <Btn variant="ghost" icon="download" size="sm">Экспорт</Btn>
          <Btn variant="primary" icon="plus" size="sm">Зарегистрировать риск</Btn>
        </div>
      </div>

      <div className="risk-summary">
        {[['critical','Критические'],['high','Высокие'],['medium','Средние'],['low','Низкие']].map(([k, label]) => {
          const c = SEVERITY[k];
          return (
            <button key={k} className={`rsum ${sevF === k ? 'active' : ''}`} style={{ '--c': c.color }} onClick={() => setSevF(sevF === k ? 'all' : k)}>
              <span className="rsum-bar" />
              <span className="rsum-count mono">{counts[k]}</span>
              <span className="rsum-label">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Icon name="search" size={16} style={{ opacity: .5 }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Поиск по риску, объекту или ID…" />
        </div>
        <div className="toolbar-filters">
          <FilterSelect label="Статус" value={statusF} onChange={setStatusF}
            options={[{ value: 'all', label: 'Все статусы' }, { value: 'Открыт', label: 'Открыт' }, { value: 'В работе', label: 'В работе' }, { value: 'Принят', label: 'Принят' }]} />
        </div>
      </div>

      {loading ? <Card><LoadingRows rows={8} cols={5} /></Card>
       : rows.length === 0 ? (
        <Card><EmptyState icon="shield" title="Рисков не найдено" text="По заданным фильтрам активных рисков нет." /></Card>
       ) : (
        <Card pad={false}>
          <div className="rtable">
            <div className="rtable-head">
              <span className="rth">Риск</span>
              <span className="rth">Объект</span>
              <span className="rth">Категория</span>
              <span className="rth">Статус</span>
              <span className="rth rth-c">SLA</span>
              <span className="rth rth-c">Оценка</span>
            </div>
            {rows.map(r => (
              <button className={`rtable-row ${selected === r.id ? 'sel' : ''}`} key={r.id} onClick={() => setSelected(r.id)}>
                <span className="rt-title">
                  <span className={`rt-sev sev-${r.severity}`} />
                  <span className="rt-title-text">
                    <span className="rt-title-main">{r.title}</span>
                    <span className="rt-title-sub mono">{r.id}</span>
                  </span>
                </span>
                <button className="rt-obj mono" onClick={(e) => { e.stopPropagation(); nav('passport', { id: r.objId }); }}>{r.obj}</button>
                <span className="rt-cell ot-dim">{r.cat}</span>
                <span className="rt-cell"><Badge tone={r.status === 'Открыт' ? 'orange' : r.status === 'В работе' ? 'info' : 'neutral'} dot>{r.status}</Badge></span>
                <span className={`rt-cell rt-c mono ${r.sla === 'Просрочен' ? 'sla-over' : ''}`}>{r.sla}</span>
                <span className="rt-cell rt-c"><span className="rt-score mono" style={{ color: SEVERITY[r.severity].color }}>{r.score}</span></span>
              </button>
            ))}
          </div>
        </Card>
       )}

      {sel && <RiskDrawer risk={sel} onClose={() => setSelected(null)} nav={nav} />}
    </div>
  );
}

function RiskDrawer({ risk, onClose, nav }) {
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="drawer">
        <div className="drawer-head">
          <div className="drawer-head-top">
            <SeverityTag sev={risk.severity} />
            <button className="icon-btn sm" onClick={onClose}><Icon name="x" size={16} /></button>
          </div>
          <h2 className="drawer-title">{risk.title}</h2>
          <div className="drawer-id mono">{risk.id}</div>
        </div>
        <div className="drawer-body">
          <div className="drawer-score">
            <div className="drawer-score-val mono" style={{ color: SEVERITY[risk.severity].color }}>{risk.score}</div>
            <div className="drawer-score-info">
              <span className="drawer-score-label">Оценка риска (CVSS-подобная)</span>
              <Meter value={risk.score * 10} color={SEVERITY[risk.severity].color} h={6} />
            </div>
          </div>
          <div className="drawer-meta">
            <Fact label="Объект" value={<button className="link-inline mono" onClick={() => nav('passport', { id: risk.objId })}>{risk.obj}</button>} />
            <Fact label="Категория" value={risk.cat} />
            <Fact label="Статус" value={<Badge tone={risk.status === 'Открыт' ? 'orange' : risk.status === 'В работе' ? 'info' : 'neutral'} dot>{risk.status}</Badge>} />
            <Fact label="Владелец" value={risk.owner} />
            <Fact label="Возраст" value={risk.age} />
            <Fact label="SLA" value={<span className={risk.sla === 'Просрочен' ? 'sla-over' : ''}>{risk.sla}</span>} />
            <Fact label="Влияние" value={risk.impact} />
          </div>
          <div className="drawer-section">
            <h3 className="drawer-sec-title">Влияние на доверие</h3>
            <p className="drawer-text">Устранение этого риска повысит индекс доверия объекта ориентировочно на <span className="mono" style={{ color: 'var(--teal)' }}>+{Math.round(risk.score)}</span> пунктов и снимет ограничение по сегменту.</p>
          </div>
          <div className="drawer-section">
            <h3 className="drawer-sec-title">Рекомендуемые действия</h3>
            <ul className="drawer-steps">
              <li><span className="step-n mono">01</span>Назначить ответственного и срок устранения</li>
              <li><span className="step-n mono">02</span>Применить компенсирующие меры (изоляция / патч)</li>
              <li><span className="step-n mono">03</span>Запустить переоценку доверия объекта</li>
            </ul>
          </div>
        </div>
        <div className="drawer-foot">
          <Btn variant="ghost" size="sm">Принять риск</Btn>
          <Btn variant="primary" size="sm" icon="check">Взять в работу</Btn>
        </div>
      </aside>
    </>
  );
}

Object.assign(window, { RiskRegister, RiskDrawer });
