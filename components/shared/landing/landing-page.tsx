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
          <a href="#platform">Платформа</a>
          <a href="#trust-graph">Trust Graph</a>
          <a href="#solutions">Решения</a>
          <a
            href="https://github.com/DTEK-Core/DTEK-core/tree/develop/docs"
            target="_blank"
            rel="noreferrer"
          >
            Документация
          </a>
        </nav>
        <div className="lp-nav-cta">
          <Link href="/login"    className="btn btn-ghost btn-sm">Войти</Link>
          <Link href="/register" className="btn btn-primary btn-sm">Запросить доступ</Link>
        </div>
      </header>

      {/* ---- hero ---- */}
      <section className="lp-hero" id="trust-graph">
        <div className="lp-hero-text">
          <div className="lp-eyebrow" style={{ '--i': 0 } as React.CSSProperties}>
            <span className="lp-eyebrow-mark mono">DTMP</span>
            <span className="lp-eyebrow-text">Digital Trust &amp; Cyber Risk Management</span>
          </div>
          <h1 className="lp-title">
            <span className="lp-line lp-title-balanced" style={{ '--i': 1 } as React.CSSProperties}>
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

      {/* ---- trust model ---- */}
      <section className="lp-features" id="platform">
        <div className="lp-model-head" data-reveal>
          <div>
            <span className="lp-sec-kicker mono">TRUST INTELLIGENCE MODEL</span>
            <h2 className="lp-model-title">Доверие — это связанная система, а не отдельная метрика</h2>
          </div>
          <p className="lp-model-intro">
            DTEK Core собирает контекст объекта, объясняет его состояние и показывает,
            как риск распространяется по зависимостям инфраструктуры.
          </p>
        </div>

        <div className="lp-model" data-reveal>
          <div className="lp-model-flow" aria-label="Связь механизмов платформы">
            <article className="lp-model-stage">
              <div className="lp-model-stage-head">
                <span className="lp-model-ico"><Icon name="passport" size={20} /></span>
                <span className="lp-model-role mono">КОНТЕКСТ ОБЪЕКТА</span>
              </div>
              <h3>Паспорт доверия</h3>
              <p>Объединяет уровень доверия, риски, связи и историю объекта в одном представлении, подтверждённом данными.</p>
            </article>

            <span className="lp-model-link" aria-hidden="true"><i /></span>

            <article className="lp-model-stage lp-model-stage-score">
              <div className="lp-model-stage-head">
                <span className="lp-model-ico"><Icon name="pulse" size={20} /></span>
                <span className="lp-model-role mono">ОБЪЯСНИМОЕ СОСТОЯНИЕ</span>
              </div>
              <h3>Оценка доверия</h3>
              <p>Показывает состояние численно и раскрывает факторы, которые снижают или усиливают Trust Score.</p>
              <div className="lp-model-score" aria-hidden="true">
                <span className="mono">TRUST SCORE</span>
                <strong>74</strong>
                <span className="lp-model-score-line"><i /></span>
              </div>
            </article>

            <span className="lp-model-link" aria-hidden="true"><i /></span>

            <article className="lp-model-stage">
              <div className="lp-model-stage-head">
                <span className="lp-model-ico"><Icon name="graph" size={20} /></span>
                <span className="lp-model-role mono">КОНТЕКСТ ЗАВИСИМОСТЕЙ</span>
              </div>
              <h3>Граф доверия</h3>
              <p>Связывает объекты и показывает, как локальный риск влияет на критичные системы и команды.</p>
            </article>
          </div>

          <aside className="lp-model-control">
            <div className="lp-model-control-mark" aria-hidden="true"><span /></div>
            <span className="lp-model-ico"><Icon name="config" size={20} /></span>
            <div className="lp-model-control-copy">
              <span className="lp-model-role mono">УПРАВЛЯЮЩИЙ СЛОЙ МОДЕЛИ</span>
              <h3>Конфигуратор</h3>
            </div>
            <p>Настраивает отраслевые веса факторов Trust Score под контекст организации — без разрыва общей модели.</p>
            <span className="lp-model-tune mono" aria-hidden="true">FACTORS × WEIGHTS</span>
          </aside>
        </div>
      </section>

      {/* ---- stats ---- */}
      <section
        id="solutions"
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
