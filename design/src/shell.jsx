// ============================================================
// DTEK Core — App Shell (Sidebar, Topbar, Command Palette)
// ============================================================

const NAV = [
  { group: 'Обзор', items: [
    { route: 'dashboard', label: 'Центр управления', icon: 'grid' },
    { route: 'graph', label: 'Граф доверия', icon: 'graph' },
  ]},
  { group: 'Цифровая модель', items: [
    { route: 'objects', label: 'Объекты', icon: 'objects', badge: 'OBJECTS' },
    { route: 'risks', label: 'Реестр рисков', icon: 'risk', badge: 'RISKS' },
  ]},
  { group: 'Управление', items: [
    { route: 'orgs', label: 'Организации', icon: 'org' },
    { route: 'configurator', label: 'Конфигуратор', icon: 'config' },
    { route: 'users', label: 'Пользователи', icon: 'users' },
  ]},
];

function Logo({ size = 26 }) {
  return (
    <div className="logo" style={{ width: size, height: size }}>
      <svg viewBox="0 0 32 32" width={size} height={size}>
        <path d="M16 3 L27 8 V16 C27 23 22 27.5 16 30 C10 27.5 5 23 5 16 V8 Z"
          fill="none" stroke="var(--teal)" strokeWidth="1.7" />
        <circle cx="16" cy="16" r="4.4" fill="none" stroke="var(--teal)" strokeWidth="1.7" />
        <circle cx="16" cy="16" r="1.5" fill="var(--teal)" />
        <path d="M16 3 V11.6 M16 20.4 V30 M5 11 L11.7 14 M27 11 L20.3 14" stroke="var(--teal)" strokeWidth="1.3" opacity="0.55" />
      </svg>
    </div>
  );
}

function Sidebar({ route, nav, collapsed, onToggle }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand" onClick={() => nav('dashboard')}>
        <Logo size={28} />
        {!collapsed && <div className="brand-text">
          <span className="brand-name">DTEK<span className="brand-core">Core</span></span>
          <span className="brand-sub mono">digital trust</span>
        </div>}
      </div>

      <nav className="sidebar-nav">
        {NAV.map(g => (
          <div className="nav-group" key={g.group}>
            {!collapsed && <div className="nav-group-label">{g.group}</div>}
            {g.items.map(it => {
              const active = route === it.route || (route === 'object' && it.route === 'objects') || (route === 'passport' && it.route === 'objects');
              const count = it.badge === 'OBJECTS' ? ORG.objects : it.badge === 'RISKS' ? RISKS.filter(r => r.status !== 'Принят').length : null;
              return (
                <button key={it.route} className={`nav-item ${active ? 'active' : ''}`} onClick={() => nav(it.route)} title={it.label}>
                  <Icon name={it.icon} size={18} />
                  {!collapsed && <span className="nav-label">{it.label}</span>}
                  {!collapsed && count != null && <span className="nav-count mono">{count > 999 ? '1.2k' : count}</span>}
                  {active && <span className="nav-active-bar" />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <button className={`nav-item ${route === 'settings' ? 'active' : ''}`} onClick={() => nav('settings')}>
          <Icon name="settings" size={18} />{!collapsed && <span className="nav-label">Настройки</span>}
        </button>
        <button className="nav-item" onClick={() => nav('landing')} title="На главную">
          <Icon name="home" size={18} />{!collapsed && <span className="nav-label">На главную</span>}
        </button>
        <button className="nav-item collapse-btn" onClick={onToggle} title="Свернуть">
          <Icon name={collapsed ? 'chevR' : 'chevL'} size={18} />{!collapsed && <span className="nav-label">Свернуть</span>}
        </button>
      </div>
    </aside>
  );
}

function OrgSwitcher() {
  const [open, setOpen] = useState(false);
  const cur = ORGS_LIST.find(o => o.active);
  return (
    <div className="org-switch">
      <button className="org-switch-btn" onClick={() => setOpen(o => !o)}>
        <span className="org-mark"><Icon name="building" size={15} /></span>
        <span className="org-switch-name">{cur.name}</span>
        <Icon name="chevD" size={14} style={{ opacity: .5 }} />
      </button>
      {open && <>
        <div className="overlay-soft" onClick={() => setOpen(false)} />
        <div className="org-menu pop">
          <div className="org-menu-label">Организации</div>
          {ORGS_LIST.map(o => (
            <button key={o.id} className={`org-menu-item ${o.active ? 'active' : ''}`} onClick={() => setOpen(false)}>
              <span className="org-mark sm"><Icon name="building" size={13} /></span>
              <span className="org-menu-info">
                <span className="org-menu-name">{o.name}</span>
                <span className="org-menu-meta mono">{o.objects} объектов · {o.role}</span>
              </span>
              <TrustChip value={o.trust} size="sm" />
            </button>
          ))}
          <div className="org-menu-foot"><Icon name="plus" size={14} />Добавить организацию</div>
        </div>
      </>}
    </div>
  );
}

function Topbar({ title, sub, nav, onOpenPalette, crumbs }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        {crumbs ? (
          <div className="crumbs">
            {crumbs.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Icon name="chevR" size={13} className="crumb-sep" />}
                {c.route ? <button className="crumb-link" onClick={() => nav(c.route)}>{c.label}</button>
                         : <span className="crumb-cur">{c.label}</span>}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div>
            <h1 className="topbar-title">{title}</h1>
            {sub && <div className="topbar-sub">{sub}</div>}
          </div>
        )}
      </div>
      <div className="topbar-right">
        <button className="search-trigger" onClick={onOpenPalette}>
          <Icon name="search" size={15} />
          <span>Поиск объектов, рисков…</span>
          <kbd className="mono">⌘K</kbd>
        </button>
        <OrgSwitcher />
        <button className="icon-btn" title="Уведомления">
          <Icon name="bell" size={18} /><span className="notif-dot" />
        </button>
        <button className="user-chip" onClick={() => nav('settings')}>
          <span className="avatar">АС</span>
        </button>
      </div>
    </header>
  );
}

function CommandPalette({ open, onClose, nav }) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { if (open) { setQ(''); setTimeout(() => inputRef.current && inputRef.current.focus(), 30); } }, [open]);
  if (!open) return null;
  const ql = q.toLowerCase();
  const pages = [
    { label: 'Центр управления', route: 'dashboard', icon: 'grid', kind: 'Экран' },
    { label: 'Граф доверия', route: 'graph', icon: 'graph', kind: 'Экран' },
    { label: 'Объекты', route: 'objects', icon: 'objects', kind: 'Экран' },
    { label: 'Реестр рисков', route: 'risks', icon: 'risk', kind: 'Экран' },
    { label: 'Конфигуратор', route: 'configurator', icon: 'config', kind: 'Экран' },
    { label: 'Пользователи', route: 'users', icon: 'users', kind: 'Экран' },
  ].filter(p => p.label.toLowerCase().includes(ql));
  const objs = OBJECTS.filter(o => o.name.toLowerCase().includes(ql) || o.id.toLowerCase().includes(ql)).slice(0, 6);
  const risks = RISKS.filter(r => r.title.toLowerCase().includes(ql) || r.id.toLowerCase().includes(ql)).slice(0, 4);
  return (
    <div className="palette-wrap" onClick={onClose}>
      <div className="palette" onClick={e => e.stopPropagation()}>
        <div className="palette-input">
          <Icon name="search" size={18} style={{ opacity: .5 }} />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Перейти к объекту, риску или экрану…" />
          <kbd className="mono">ESC</kbd>
        </div>
        <div className="palette-body">
          {pages.length > 0 && <div className="palette-sec">
            <div className="palette-sec-label">Экраны</div>
            {pages.map(p => (
              <button key={p.route} className="palette-item" onClick={() => { nav(p.route); onClose(); }}>
                <Icon name={p.icon} size={16} /><span>{p.label}</span><span className="palette-kind">{p.kind}</span>
              </button>
            ))}
          </div>}
          {objs.length > 0 && <div className="palette-sec">
            <div className="palette-sec-label">Объекты</div>
            {objs.map(o => (
              <button key={o.id} className="palette-item" onClick={() => { nav('passport', { id: o.id }); onClose(); }}>
                <Icon name={typeGlyph(o.type)} size={16} />
                <span>{o.name}</span>
                <span className="mono palette-id">{o.id}</span>
                <TrustChip value={o.trust} size="sm" />
              </button>
            ))}
          </div>}
          {risks.length > 0 && <div className="palette-sec">
            <div className="palette-sec-label">Риски</div>
            {risks.map(r => (
              <button key={r.id} className="palette-item" onClick={() => { nav('risks'); onClose(); }}>
                <Icon name="risk" size={16} /><span className="palette-trunc">{r.title}</span>
                <SeverityTag sev={r.severity} />
              </button>
            ))}
          </div>}
          {pages.length + objs.length + risks.length === 0 && (
            <div className="palette-empty">Ничего не найдено по запросу «{q}»</div>
          )}
        </div>
        <div className="palette-foot">
          <span><kbd className="mono">↵</kbd> перейти</span>
          <span><kbd className="mono">⌘K</kbd> открыть / закрыть</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, OrgSwitcher, CommandPalette, Logo, NAV });
