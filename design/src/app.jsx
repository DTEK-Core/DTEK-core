// ============================================================
// DTEK Core — App Router
// ============================================================

const APP_ROUTES = ['dashboard', 'graph', 'objects', 'object', 'passport', 'risks', 'orgs', 'configurator', 'users', 'settings'];

const TITLES = {
  dashboard: ['Центр управления', 'Цифровая модель организации'],
  graph: ['Граф доверия', 'Связи объектов'],
  objects: ['Объекты', null],
  risks: ['Реестр рисков', null],
  orgs: ['Организации', null],
  configurator: ['Конфигуратор', null],
  users: ['Пользователи', null],
  settings: ['Настройки', null],
};

function App() {
  const [state, setState] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('dtek_route') || 'null');
      if (saved && saved.route) return saved;
    } catch (e) {}
    return { route: 'landing', params: {} };
  });
  const [collapsed, setCollapsed] = useState(false);
  const [palette, setPalette] = useState(false);
  const scrollRef = useRef(null);

  const nav = useCallback((route, params = {}) => {
    setState({ route, params });
    try { localStorage.setItem('dtek_route', JSON.stringify({ route, params })); } catch (e) {}
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(p => !p); }
      if (e.key === 'Escape') setPalette(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [state.route, state.params.id]);

  const { route, params } = state;

  // Экраны без оболочки
  if (route === 'landing') return <Landing nav={nav} />;
  if (route === 'login' || route === 'register') return <AuthScreen nav={nav} mode={route} />;

  // Хлебные крошки для вложенных экранов
  let crumbs = null;
  if (route === 'object' || route === 'passport') {
    const o = OBJECTS.find(x => x.id === params.id);
    crumbs = [
      { label: 'Объекты', route: 'objects' },
      ...(route === 'passport' ? [{ label: o ? o.name : params.id, route: 'object', params }] : []),
      { label: route === 'passport' ? 'Паспорт доверия' : (o ? o.name : params.id) },
    ];
  }
  const [title, sub] = TITLES[route] || ['', null];
  if (!crumbs) crumbs = [{ label: title }];

  return (
    <div className={`app ${collapsed ? 'collapsed' : ''}`}>
      <Sidebar route={route} nav={nav} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="app-main">
        <Topbar title={title} sub={sub} crumbs={crumbs} nav={nav} onOpenPalette={() => setPalette(true)} />
        <main className="app-scroll" ref={scrollRef}>
          {route === 'dashboard' && <Dashboard nav={nav} />}
          {route === 'graph' && <TrustGraphScreen nav={nav} />}
          {route === 'objects' && <ObjectsScreen nav={nav} />}
          {route === 'object' && <ObjectDetail nav={nav} params={params} />}
          {route === 'passport' && <TrustPassport nav={nav} params={params} />}
          {route === 'risks' && <RiskRegister nav={nav} />}
          {route === 'orgs' && <OrgsScreen nav={nav} />}
          {route === 'configurator' && <Configurator nav={nav} />}
          {route === 'users' && <UsersScreen nav={nav} />}
          {route === 'settings' && <SettingsScreen nav={nav} />}
        </main>
      </div>
      <CommandPalette open={palette} onClose={() => setPalette(false)} nav={nav} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
