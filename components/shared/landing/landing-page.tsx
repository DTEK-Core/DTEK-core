'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import { Icon } from '@/components/shared/icon';
import { HeroTrustGraph } from '@/components/shared/landing/hero-trust-graph';

// ---- scroll reveal ----
function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.landing [data-reveal]'));
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(el => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      }),
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ---- animated counter ----
interface CountUpProps { end: number; suffix?: string; sep?: boolean; dur?: number; }
function CountUp({ end, suffix = '', sep = false, dur = 1100 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setVal(end); return; }
    let raf: number;
    let started = false;
    const run = () => {
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(end * e));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting && !started) { started = true; run(); io.disconnect(); } });
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [end, dur]);
  const txt = sep ? val.toLocaleString('ru-RU') : String(val);
  return <span ref={ref} className="mono">{txt}{suffix}</span>;
}

// ---- features data ----
const FEATURES: [string, string, string, string][] = [
  ['passport', '01', 'Паспорт доверия',  'Цифровой паспорт каждого объекта: уровень доверия, риски, связи и история в едином артефакте.'],
  ['pulse',    '02', 'Оценка доверия',   'Прозрачная формула: факторы × веса. Видно, что снижает доверие и как именно его поднять.'],
  ['graph',    '03', 'Граф доверия',     'Карта зависимостей. Видно, как риск одного актива влияет на критичные системы и команды.'],
  ['config',   '04', 'Конфигуратор',     'Отраслевые веса Trust Score адаптируют модель доверия под промышленность, ИТ или сервисную организацию.'],
];

const STATS = [
  { end: 200, sep: true, label: 'активов в 14-дневном пилоте' },
  { end: 6,              label: 'факторов оценки доверия' },
  { end: 4,              label: 'ключевых модуля платформы' },
  { end: 10,             label: 'приоритетных рисков для CISO' },
] as const;

export function LandingPage() {
  useReveal();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const root = (document.querySelector('.app-scroll') as HTMLElement | null) ?? window;
    const onScroll = () => {
      const y = root === window ? window.scrollY : (root as HTMLElement).scrollTop;
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

      {/* ---- nav ---- */}
      <header className={`lp-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="lp-brand">
          <Logo size={30} />
          <span className="brand-name">DTEK<span className="brand-core">Core</span></span>
        </div>
        <nav className="lp-links" aria-label="Разделы">
          <a>Платформа</a>
          <a>Trust Graph</a>
          <a>Решения</a>
          <a>Документация</a>
        </nav>
        <div className="lp-nav-cta">
          <Link href="/login"    className="btn btn-ghost btn-sm">Войти</Link>
          <Link href="/register" className="btn btn-primary btn-sm">Запросить доступ</Link>
        </div>
      </header>

      {/* ---- hero ---- */}
      <section className="lp-hero">
        <div className="lp-hero-text">
          <div className="lp-eyebrow" style={{ '--i': 0 } as React.CSSProperties}>
            <span className="lp-eyebrow-mark mono">DTMP</span>
            <span className="lp-eyebrow-text">Digital Trust &amp; Cyber Risk Management</span>
          </div>
          <h1 className="lp-title">
            <span className="lp-line lp-title-single" style={{ '--i': 1 } as React.CSSProperties}>
              <span>Цифровое доверие и киберриски активов</span>
            </span>
          </h1>
          <p className="lp-lead" style={{ '--i': 4 } as React.CSSProperties}>
            DTEK Core связывает активы, риски, <span className="hl">Trust Score</span> и
            зависимости в единую управленческую картину для CISO — чтобы быстро понять,
            где доверие ниже нормы и что исправлять первым.
          </p>
          <div className="lp-cta" style={{ '--i': 5 } as React.CSSProperties}>
            <Link href="/register" className="btn btn-primary btn-lg">
              <Icon name="shield" size={17} />
              Запросить пилот
            </Link>
            <Link href="/dashboard" className="btn btn-line btn-lg">
              <Icon name="eye" size={17} />
              Демо центра управления
            </Link>
          </div>
          <div className="lp-cat" style={{ '--i': 6 } as React.CSSProperties}>
            <span className="lp-cat-x mono">не&nbsp;SIEM</span>
            <span className="lp-cat-x mono">не&nbsp;EDR</span>
            <span className="lp-cat-x mono">не&nbsp;CMDB</span>
            <span className="lp-cat-x mono">не&nbsp;GRC</span>
            <span className="lp-cat-eq mono">trust/risk layer</span>
          </div>
        </div>

        <div className="lp-hero-visual">
          <HeroTrustGraph />
        </div>
      </section>

      {/* ---- features ---- */}
      <section className="lp-features">
        <div className="lp-sec-head" data-reveal>
          <span className="lp-sec-kicker mono">ЧЕТЫРЕ ОПОРЫ ПЛАТФОРМЫ</span>
          <h2 className="lp-sec-title">От активов к executive insight</h2>
        </div>
        <div className="lp-feature-grid">
          {FEATURES.map(([icon, num, title, text], i) => (
            <article
              key={title}
              className="lp-feature"
              data-reveal
              style={{ '--d': `${i * 80}ms` } as React.CSSProperties}
            >
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

      {/* ---- stats ---- */}
      <section
        className="lp-stats"
        data-reveal
        style={{ '--d': '0ms' } as React.CSSProperties}
      >
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className="lp-stat"
            style={{ '--d': `${i * 70}ms` } as React.CSSProperties}
          >
            <span className="lp-stat-v">
              <CountUp end={s.end} sep={'sep' in s && s.sep} />
            </span>
            <span className="lp-stat-l">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ---- footer ---- */}
      <footer className="lp-foot">
        <div className="lp-brand">
          <Logo size={22} />
          <span className="brand-name">DTEK<span className="brand-core">Core</span></span>
        </div>
        <span className="lp-foot-copy mono">© 2026 DTEK Core · Digital Trust &amp; Cyber Risk Management Platform</span>
      </footer>
    </div>
  );
}
