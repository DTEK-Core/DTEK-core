// ============================================================
// DTEK Core — Лендинг + Аутентификация
// ============================================================

function useReveal() {
  // Adds .is-in to [data-reveal] elements as they enter the viewport.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.landing [data-reveal]'));
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(el => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function CountUp({ end, suffix = '', sep = false, dur = 1100 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setVal(end); return; }
    let raf, started = false;
    const run = () => {
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(end * e));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((es) => {
      es.forEach(en => { if (en.isIntersecting && !started) { started = true; run(); io.disconnect(); } });
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [end]);
  const txt = sep ? val.toLocaleString('ru-RU') : String(val);
  return <span ref={ref} className="mono">{txt}{suffix}</span>;
}

function Landing({ nav }) {
  useReveal();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const root = document.querySelector('.app-scroll') || window;
    const onScroll = () => {
      const y = root === window ? window.scrollY : root.scrollTop;
      setScrolled(y > 12);
    };
    root.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => root.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing lp-enter">
      <div className="landing-grid-bg" />
      <div className="landing-aura" />
      <header className={`lp-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="lp-brand">
          <Logo size={30} />
          <span className="brand-name">DTEK<span className="brand-core">Core</span></span>
        </div>
        <nav className="lp-links">
          <a>Платформа</a><a>Trust Graph</a><a>Решения</a><a>Документация</a>
        </nav>
        <div className="lp-nav-cta">
          <button className="btn btn-ghost btn-sm" onClick={() => nav('login')}>Войти</button>
          <button className="btn btn-primary btn-sm" onClick={() => nav('register')}>Запросить доступ</button>
        </div>
      </header>

      <section className="lp-hero">
        <div className="lp-hero-text">
          <div className="lp-eyebrow" style={{ '--i': 0 }}>
            <span className="lp-eyebrow-mark mono">DTMP</span>
            <span className="lp-eyebrow-text">Операционная система цифрового доверия</span>
          </div>
          <h1 className="lp-title">
            <span className="lp-line" style={{ '--i': 1 }}><span>Цифровая модель</span></span>
            <span className="lp-line" style={{ '--i': 2 }}><span>доверия вашей</span></span>
            <span className="lp-line" style={{ '--i': 3 }}><span>организации</span></span>
          </h1>
          <p className="lp-lead" style={{ '--i': 4 }}>
            DTEK Core строит живой цифровой двойник инфраструктуры. Каждый объект получает
            <span className="hl"> паспорт доверия</span>, прозрачную оценку и место в графе связей —
            вы управляете не списком активов, а доверием всей организации.
          </p>
          <div className="lp-cta" style={{ '--i': 5 }}>
            <button className="btn btn-primary btn-lg" onClick={() => nav('register')}><Icon name="shield" size={17} />Начать работу</button>
            <button className="btn btn-line btn-lg" onClick={() => nav('dashboard')}><Icon name="eye" size={17} />Демо центра управления</button>
          </div>
          <div className="lp-cat" style={{ '--i': 6 }}>
            <span className="lp-cat-x mono">не&nbsp;SIEM</span>
            <span className="lp-cat-x mono">не&nbsp;DLP</span>
            <span className="lp-cat-x mono">не&nbsp;сканер</span>
            <span className="lp-cat-eq mono">платформа управления доверием</span>
          </div>
        </div>
        <div className="lp-hero-visual" style={{ '--i': 2 }}>
          <HeroTrustGraph />
        </div>
      </section>

      <section className="lp-features">
        <div className="lp-sec-head" data-reveal>
          <span className="lp-sec-kicker mono">ЧЕТЫРЕ ОПОРЫ ПЛАТФОРМЫ</span>
          <h2 className="lp-sec-title">Доверие как управляемый объект</h2>
        </div>
        <div className="lp-feature-grid">
          {[
            ['passport', '01', 'Паспорт доверия', 'Цифровой паспорт каждого объекта: уровень доверия, риски, связи и история в едином артефакте.'],
            ['pulse', '02', 'Оценка доверия', 'Прозрачная формула: факторы × веса. Видно, что снижает доверие и как именно его поднять.'],
            ['graph', '03', 'Граф доверия', 'Живая модель связей. Видно, как риск одного актива распространяется на всю организацию.'],
            ['config', '04', 'Конфигуратор', 'Веса, коннекторы и правила оценки настраиваются под вашу модель угроз.'],
          ].map(([icon, num, title, text], i) => (
            <article className="lp-feature" key={title} data-reveal style={{ '--d': `${i * 80}ms` }}>
              <div className="lp-feature-top">
                <span className="lp-feature-ico"><Icon name={icon} size={19} /></span>
                <span className="lp-feature-num mono">{num}</span>
              </div>
              <h3 className="lp-feature-title">{title}</h3>
              <p className="lp-feature-text">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lp-stats" data-reveal>
        {[
          { end: 1248, sep: true, l: 'объектов в демо-модели' },
          { end: 6, l: 'факторов оценки доверия' },
          { end: 5, l: 'уровней доверия' },
          { end: 74, l: 'индекс доверия организации' },
        ].map((s, i) => (
          <div className="lp-stat" key={s.l} style={{ '--d': `${i * 70}ms` }}>
            <span className="lp-stat-v"><CountUp end={s.end} sep={s.sep} /></span>
            <span className="lp-stat-l">{s.l}</span>
          </div>
        ))}
      </section>

      <footer className="lp-foot">
        <div className="lp-brand"><Logo size={22} /><span className="brand-name">DTEK<span className="brand-core">Core</span></span></div>
        <span className="lp-foot-copy mono">© 2026 DTEK Core · Digital Trust Management Platform</span>
      </footer>
    </div>
  );
}

// ---------- Аутентификация --------------------------------
function AuthScreen({ nav, mode }) {
  const isLogin = mode === 'login';
  return (
    <div className="auth">
      <div className="auth-aside">
        <div className="auth-grid-bg" />
        <button className="auth-brand" onClick={() => nav('landing')}>
          <Logo size={30} /><span className="brand-name">DTEK<span className="brand-core">Core</span></span>
        </button>
        <div className="auth-aside-body">
          <div className="auth-aside-ring"><TrustRing value={74} size={128} stroke={9} sub="доверие" /></div>
          <h2 className="auth-aside-title">Командный центр<br />цифрового доверия</h2>
          <p className="auth-aside-text">Единая модель организации: объекты, риски, связи и оценка доверия в реальном времени.</p>
          <div className="auth-aside-points">
            {['Паспорт доверия для каждого объекта', 'Прозрачная оценка по факторам', 'Граф связей и влияния рисков'].map(p => (
              <div className="auth-point" key={p}><Icon name="check" size={14} />{p}</div>
            ))}
          </div>
        </div>
        <div className="auth-aside-foot mono">ISO 27001 · ФСТЭК · Enterprise-grade</div>
      </div>

      <div className="auth-main">
        <div className="auth-form-wrap">
          <div className="auth-switch">
            <button className={isLogin ? 'active' : ''} onClick={() => nav('login')}>Вход</button>
            <button className={!isLogin ? 'active' : ''} onClick={() => nav('register')}>Регистрация</button>
          </div>

          <h1 className="auth-title">{isLogin ? 'С возвращением' : 'Создать аккаунт'}</h1>
          <p className="auth-sub">{isLogin ? 'Войдите в свою цифровую модель доверия' : 'Запросите доступ к платформе DTEK Core'}</p>

          <form className="auth-form" onSubmit={e => { e.preventDefault(); nav('dashboard'); }}>
            {!isLogin && (
              <div className="auth-row">
                <AuthField label="Имя" placeholder="Анна" />
                <AuthField label="Фамилия" placeholder="Соколова" />
              </div>
            )}
            {!isLogin && <AuthField label="Организация" placeholder="АО «Меридиан-Энерго»" icon="building" />}
            <AuthField label="Рабочий email" placeholder="name@company.ru" icon="user" type="email" />
            <AuthField label="Пароль" placeholder="••••••••••" icon="shield" type="password" />
            {isLogin && (
              <div className="auth-aux">
                <label className="auth-check"><input type="checkbox" defaultChecked /><span>Запомнить меня</span></label>
                <a className="auth-forgot">Забыли пароль?</a>
              </div>
            )}
            <button className="btn btn-primary btn-lg auth-submit" type="submit">
              {isLogin ? 'Войти в платформу' : 'Создать аккаунт'}<Icon name="chevR" size={16} />
            </button>
          </form>

          <div className="auth-divider"><span>или</span></div>
          <div className="auth-sso">
            <button className="btn btn-ghost auth-sso-btn"><Icon name="command" size={16} />Корпоративный SSO</button>
            <button className="btn btn-ghost auth-sso-btn"><Icon name="shield" size={16} />ЕСИА / Госуслуги</button>
          </div>

          <p className="auth-foot">
            {isLogin ? 'Нет аккаунта? ' : 'Уже зарегистрированы? '}
            <button className="link-inline" onClick={() => nav(isLogin ? 'register' : 'login')}>{isLogin ? 'Запросить доступ' : 'Войти'}</button>
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthField({ label, placeholder, icon, type = 'text' }) {
  return (
    <label className="auth-field">
      <span className="auth-field-label">{label}</span>
      <div className="auth-input-wrap">
        {icon && <Icon name={icon} size={15} className="auth-input-ico" />}
        <input className="auth-input" placeholder={placeholder} type={type} />
      </div>
    </label>
  );
}

Object.assign(window, { Landing, AuthScreen });
