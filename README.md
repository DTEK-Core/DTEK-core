# DTEK Core

**Evidence-first Trust Intelligence Platform**

DTEK Core — B2B SaaS-платформа управления цифровым доверием активов. Она собирает цифровые доказательства из инфраструктуры организации, строит цифровую модель доверия и помогает CISO, аналитикам ИБ и IT-администраторам видеть, каким объектам можно доверять, какие риски снижают доверие и какие действия важнее выполнить первыми.

Платформа не заменяет SIEM, EDR, DLP, VM, CMDB или GRC. DTEK Core работает как Trust Intelligence layer поверх существующих процессов, выгрузок и инструментов безопасности.

---

## Продуктовое Ядро

| Сущность | Назначение |
|---|---|
| **Trust Passport** | Evidence-backed цифровой паспорт доверия каждого объекта |
| **Trust Score** | 6-факторная оценка доверия объекта от 0 до 100 на основе рисков, атрибутов и evidence |
| **Trust Graph** | Граф связей и зависимостей между объектами, ручной в текущем MVP и автоматизируемый в следующих версиях |
| **Risk Registry** | Реестр ручных, импортированных и автоматически предложенных рисков с влиянием на Trust Score |
| **Configurator** | Настройка весов Trust Score под отрасль и организацию |
| **Dashboard** | Управленческий обзор доверия, рисков и событий организации |

---

## Текущий Статус

**v0.12.0-dev — Sprint 12 implementation complete: manual QA pending.**

Функциональный MVP реализован и отполирован для первой демонстрации. Sprint 09 завершил упаковку Market MVP, Sprint 10 — Reporting Ready milestone, Sprint 11 — Evidence Onboarding Ready. В Sprint 12 утверждена Evidence-backed Explainability model, реализованы Top Score Drivers, Factor Reason Cards, counterfactual Risk Impact Hint, Score Delta Explanation и Dashboard Explainability Summary. Пользовательская документация и воспроизводимый QA checklist готовы; до закрытия milestone требуется ручная приёмка владельцем проекта.

Консолидация от 03.08.2026 завершила dependency hardening, включила contract-тесты в CI и синхронизировала эксплуатационную документацию. Новый Sprint не начат. Единственный обязательный gate текущего этапа — authenticated manual QA Sprint 12 в отдельной тестовой организации.

### Реализованные Маршруты

| Страница | Маршрут |
|---|---|
| Лендинг | `/` |
| Вход / регистрация | `/login`, `/register` |
| Сброс пароля | `/forgot-password`, `/reset-password` |
| Принятие приглашения | `/invite/[token]` |
| Создание организации | `/onboarding/create` |
| Онбординг wizard | `/onboarding/wizard` |
| Центр управления | `/dashboard` |
| Объекты | `/objects`, `/objects/[id]` |
| Trust Passport | `/objects/[id]/passport` |
| Trust Passport report | `/reports/passport/[id]` |
| Реестр рисков | `/risks` |
| Executive Report | `/reports/executive` |
| Trust Graph | `/graph` |
| Конфигуратор | `/configurator` |
| Пользователи и роли | `/users` |
| Настройки и аудит | `/settings` |

---

## Стек

| Слой | Технология |
|---|---|
| Frontend | Next.js App Router 15.x |
| UI | React 18, Tailwind CSS, Shadcn/UI |
| Язык | TypeScript strict mode |
| Backend / BaaS | Supabase Cloud |
| База данных | PostgreSQL 15 |
| Auth | Supabase Auth |
| Security | PostgreSQL RLS + RBAC + Server Actions |
| Deploy | Vercel |

---

## Быстрый Старт

```bash
git clone https://github.com/DTEK-Core/DTEK-core.git
cd DTEK-core
npm install
cp .env.example .env.local
npm run dev
```

Локальный адрес:

```text
http://localhost:3000
```

Обязательные переменные:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
SUPABASE_FETCH_TIMEOUT_MS=4000
```

Если Supabase недоступен, см. [docs/development/TROUBLESHOOTING.md](docs/development/TROUBLESHOOTING.md).

---

## Команды

```bash
npm run dev
npm run type-check
npm run lint
npm run build
npm run test:import
npm run test:trust-explainability
npm audit
```

---

## Структура

```text
app/                 Next.js App Router routes
components/ui/       Shadcn/UI components
components/shared/   Project components
lib/actions/         Server Actions
lib/supabase/        Supabase clients and config
lib/trust/           Trust Score calculation engine
lib/security/        Audit/security helpers
lib/validation/      Zod schemas
types/               TypeScript DB types
supabase/migrations/ PostgreSQL schema and RLS
design/              Approved visual prototype
docs/                Product, architecture, security, user docs
tasks/               Backlog and sprint history
diploma/             Учебная база автора и подготовка к защите
```

---

## Основные Документы

| Документ | Назначение |
|---|---|
| [diploma/README.md](diploma/README.md) | Полная учебная документация проекта: от основ до защиты диплома |
| [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) | Навигация по всей документации |
| [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) | ADR — приоритетный источник архитектурных решений |
| [docs/product/PRODUCT_STRATEGY.md](docs/product/PRODUCT_STRATEGY.md) | Новая продуктовая стратегия и позиционирование |
| [docs/product/EVIDENCE_FIRST_STRATEGY.md](docs/product/EVIDENCE_FIRST_STRATEGY.md) | Evidence-first стратегия и новая роль автоматического наполнения |
| [docs/architecture/Evidence_First_Architecture.md](docs/architecture/Evidence_First_Architecture.md) | Целевая архитектура Discovery, Connector и Evidence layers |
| [docs/architecture/Evidence_Import_Schema.md](docs/architecture/Evidence_Import_Schema.md) | Контракт CSV/XLSX импорта объектов и рисков Sprint 11 |
| [docs/architecture/Evidence_Explainability_Model.md](docs/architecture/Evidence_Explainability_Model.md) | Спецификация объяснимости Trust Score Sprint 12 |
| [docs/user/TRUST_SCORE_GUIDE.md](docs/user/TRUST_SCORE_GUIDE.md) | Пользовательское объяснение Trust Score, reason cards, impact hints и Dashboard summary |
| [docs/user/IMPORT_GUIDE.md](docs/user/IMPORT_GUIDE.md) | Руководство по импорту, preview, source metadata и ошибкам |
| [docs/product/PRODUCT_ONE_PAGER.md](docs/product/PRODUCT_ONE_PAGER.md) | One-pager DTEK Core для CISO и первых пилотов |
| [docs/product/PILOT_OFFER.md](docs/product/PILOT_OFFER.md) | 14-дневный pilot offer для первых CISO-пилотов |
| [docs/product/SPRINT09_DOCUMENTATION_SYNC.md](docs/product/SPRINT09_DOCUMENTATION_SYNC.md) | Итоговая синхронизация Sprint 09 |
| [docs/user/REPORTS_AND_EXPORT_GUIDE.md](docs/user/REPORTS_AND_EXPORT_GUIDE.md) | Пользовательское руководство по отчётам и экспорту |
| [docs/testing/DATA_ONBOARDING_SMOKE_TEST_CHECKLIST.md](docs/testing/DATA_ONBOARDING_SMOKE_TEST_CHECKLIST.md) | Ручная приёмка Data Onboarding Sprint 11 |
| [docs/testing/EXPLAINABILITY_QA_CHECKLIST.md](docs/testing/EXPLAINABILITY_QA_CHECKLIST.md) | Ручная приёмка Evidence-backed Explainability Sprint 12 |
| [docs/roadmap/ROADMAP.md](docs/roadmap/ROADMAP.md) | Roadmap от текущего MVP к Market MVP |
| [docs/roadmap/SPRINT_ROADMAP.md](docs/roadmap/SPRINT_ROADMAP.md) | План Sprint 09–15 до коммерческого MVP |
| [docs/architecture/TECHNICAL_DEBT.md](docs/architecture/TECHNICAL_DEBT.md) | Технический долг и архитектурные риски |
| [docs/security/SECURITY_OVERVIEW.md](docs/security/SECURITY_OVERVIEW.md) | Обзор безопасности |
| [AI_DEVELOPMENT_GUIDE.md](AI_DEVELOPMENT_GUIDE.md) | Инженерный регламент для AI-разработки |
| [AGENTS.md](AGENTS.md) | Постоянный контекст Codex/AI-агента |

---

## Handoff Текущего Этапа

| Область | Состояние |
|---|---|
| Активная ветка | `develop` |
| Последний полностью закрытый Sprint | Sprint 11 — Evidence Import & Data Onboarding |
| Последняя реализация | Sprint 12 — Evidence-backed Trust Explainability |
| Gate перед следующей разработкой | Ручная приёмка `docs/testing/EXPLAINABILITY_QA_CHECKLIST.md` |
| Схема БД | Локальная цепочка миграций `001–017`; Cloud state сверяется через Supabase CLI |
| Автоматический baseline | type-check, ESLint, build, import и explainability contract tests, npm audit |
| Стабильное ядро | Auth, organizations, RBAC/RLS, Objects, Passport, Score, Graph, Configurator, Dashboard, import/export/reporting |
| Частичные области | Risk workflow, source metadata как text block, audit coverage, автоматизация ручного QA |
| Будущая архитектура | Evidence Layer, Discovery Layer, Identity Resolution, Discovery Inbox и Connector Framework не реализованы |

Перед продолжением разработки обязательно прочитать `AGENTS.md`, `AI_DEVELOPMENT_GUIDE.md`, `ARCHITECTURE_DECISIONS.md`, `docs/product/PRODUCT_STRATEGY.md`, `docs/roadmap/ROADMAP.md`, текущий Sprint-документ и `docs/architecture/TECHNICAL_DEBT.md`.

Без нового ADR или решения владельца нельзя менять формулу Trust Score, product boundary, стек, RBAC/RLS, multi-tenant модель или начинать Connector Runtime. Проект готов принять следующую задачу после фиксации результата ручной приёмки Sprint 12.

---

## Roadmap

Текущий gate и утверждённая последовательность:

1. Завершить ручную приёмку Sprint 12 по Explainability QA Checklist.
2. После отдельного решения владельца: Sprint 13 — Evidence-aware Risk Workflow.
3. Sprint 14 — Pilot Readiness.
4. Sprint 15 — Connector Framework Foundation.

Агенты, marketplace, SIEM/EDR replacement, SSO, on-prem и расширенный GRC остаются Post-MVP/Enterprise. Коннекторы развиваются поэтапно через evidence-first архитектуру и пилотные сигналы.

Полный план: [docs/roadmap/SPRINT_ROADMAP.md](docs/roadmap/SPRINT_ROADMAP.md).

---

## Безопасность

DTEK Core хранит чувствительную информацию об инфраструктуре и рисках, поэтому безопасность является частью архитектуры:

- RBAC: `owner`, `analyst`, `admin`, `viewer`
- RLS на таблицах Supabase
- Server Action authorization
- Zod validation
- Security headers
- Rate limiting
- Security Audit Log
- no secrets in repository

Подробнее: [docs/security/SECURITY_OVERVIEW.md](docs/security/SECURITY_OVERVIEW.md).

---

`DTEK Core` · Evidence-first Trust Intelligence Platform · **v0.12.0-dev / Sprint 12 manual QA pending**
