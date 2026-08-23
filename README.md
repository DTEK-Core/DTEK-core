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
| **Risk Registry** | Workflow ручных и импортированных рисков: owner, SLA, comments, origin, history и влияние на Trust Score |
| **Configurator** | Настройка весов Trust Score под отрасль и организацию |
| **Dashboard** | Управленческий обзор доверия, рисков и событий организации |

---

## Текущий Статус

**v0.15.0-dev — Sprint 15 Connector Framework Foundation; S15-T001–T002 завершены.**

Функциональный MVP реализован и отполирован для первой демонстрации. Sprint 09 завершил упаковку Market MVP, Sprint 10 — Reporting Ready milestone, Sprint 11 — Evidence Onboarding Ready. Реализация Sprint 12 и Sprint 13 завершена вместе с пользовательской документацией и воспроизводимыми QA checklists; до закрытия milestones требуется ручная authenticated приёмка владельцем проекта.

Консолидация от 03.08.2026 завершила dependency hardening, включила contract-тесты в CI и синхронизировала эксплуатационную документацию. Cloud migrations `001–019` применены и сверены; migration 018 добавляет risk comments/activity foundation, а 019 ограничивает Audit Log ролями owner/admin на уровне RLS. Реализация Sprint 13 и Sprint 14 завершена; authenticated QA Sprint 12/13 и остальные Pilot GO gates остаются `PENDING`. Sprint 15 зафиксировал ADR-009 и будущую Evidence Layer data model: adapter/ingestion contract, immutable raw observations, normalized assertions, tenant bindings и staged migration plan определены без преждевременного runtime, SQL migration или выбора vendor.

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
SUPABASE_FETCH_TIMEOUT_MS=2000
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
npm run test:risk-workflow
npm run test:smoke
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
| [docs/architecture/Connector_Framework_Architecture.md](docs/architecture/Connector_Framework_Architecture.md) | ADR-009 и единый adapter/ingestion contract Sprint 15 |
| [docs/architecture/Evidence_Layer_Data_Model.md](docs/architecture/Evidence_Layer_Data_Model.md) | Спецификация Evidence Layer и план будущей migration Sprint 15 |
| [docs/architecture/Evidence_Import_Schema.md](docs/architecture/Evidence_Import_Schema.md) | Контракт CSV/XLSX импорта объектов и рисков Sprint 11 |
| [docs/architecture/Evidence_Explainability_Model.md](docs/architecture/Evidence_Explainability_Model.md) | Спецификация объяснимости Trust Score Sprint 12 |
| [docs/architecture/Risk_Workflow_Data_Model.md](docs/architecture/Risk_Workflow_Data_Model.md) | Минимальная модель Pilot Risk Workflow Sprint 13 |
| [docs/user/TRUST_SCORE_GUIDE.md](docs/user/TRUST_SCORE_GUIDE.md) | Пользовательское объяснение Trust Score, reason cards, impact hints и Dashboard summary |
| [docs/user/IMPORT_GUIDE.md](docs/user/IMPORT_GUIDE.md) | Руководство по импорту, preview, source metadata и ошибкам |
| [docs/product/PRODUCT_ONE_PAGER.md](docs/product/PRODUCT_ONE_PAGER.md) | One-pager DTEK Core для CISO и первых пилотов |
| [docs/product/PILOT_OFFER.md](docs/product/PILOT_OFFER.md) | 14-дневный pilot offer для первых CISO-пилотов |
| [docs/product/PILOT_METRICS_FEEDBACK_LOOP.md](docs/product/PILOT_METRICS_FEEDBACK_LOOP.md) | Pilot scorecard, feedback cadence, WTP и connector demand evidence |
| [docs/product/SPRINT09_DOCUMENTATION_SYNC.md](docs/product/SPRINT09_DOCUMENTATION_SYNC.md) | Итоговая синхронизация Sprint 09 |
| [docs/user/REPORTS_AND_EXPORT_GUIDE.md](docs/user/REPORTS_AND_EXPORT_GUIDE.md) | Пользовательское руководство по отчётам и экспорту |
| [docs/testing/DATA_ONBOARDING_SMOKE_TEST_CHECKLIST.md](docs/testing/DATA_ONBOARDING_SMOKE_TEST_CHECKLIST.md) | Ручная приёмка Data Onboarding Sprint 11 |
| [docs/testing/EXPLAINABILITY_QA_CHECKLIST.md](docs/testing/EXPLAINABILITY_QA_CHECKLIST.md) | Ручная приёмка Evidence-backed Explainability Sprint 12 |
| [docs/testing/RISK_WORKFLOW_QA_CHECKLIST.md](docs/testing/RISK_WORKFLOW_QA_CHECKLIST.md) | Ручная authenticated приёмка Pilot Risk Workflow Sprint 13 |
| [docs/operations/BACKUP_RESTORE_RUNBOOK.md](docs/operations/BACKUP_RESTORE_RUNBOOK.md) | Backup/restore процедура Supabase, rehearsal и pilot RPO/RTO |
| [docs/operations/MONITORING_ERROR_HANDLING_PLAN.md](docs/operations/MONITORING_ERROR_HANDLING_PLAN.md) | Monitoring baseline, safe error handling, severity и incident response для пилота |
| [docs/roadmap/ROADMAP.md](docs/roadmap/ROADMAP.md) | Зафиксированный Roadmap до коммерческого MVP и Post-MVP |
| [docs/roadmap/SPRINT_ROADMAP.md](docs/roadmap/SPRINT_ROADMAP.md) | План Sprint 09–14 до MVP; Sprint 15 — Post-MVP |
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
| Текущая разработка | Sprint 15 — S15-T001–T002 завершены; следующая S15-T003 Normalization & Identity Resolution |
| Gate перед pilot release | Master Pilot Readiness Checklist, включая ручную приёмку Sprint 12/13 |
| Production HTTP smoke | `npm run test:smoke` после `npm run build`; 18 public/protected route contracts |
| Monitoring baseline | GitHub/Vercel/Supabase signals, Health UI, severity/triage plan; provider activation pending |
| Pilot measurement | Scorecard, feedback loop и source inventory готовы; фактические pilot data pending |
| Pilot documentation | [Единый client/internal pack](docs/pilot/PILOT_DOCUMENTATION_PACK.md) готов; контакты и release evidence заполняются для кандидата |
| Схема БД | Локальная и Cloud-цепочки миграций `001–019` синхронизированы |
| Автоматический baseline | type-check, ESLint, build, import, explainability и risk workflow contract tests |
| Стабильное ядро | Auth, organizations, RBAC/RLS, Objects, Passport, Score, Graph, Configurator, Dashboard, import/export/reporting, Environment Health Check |
| Частичные области | Sprint 12/13 manual QA, source metadata как text block, автоматизация authenticated QA |
| Будущая архитектура | Connector Framework и Evidence Layer специфицированы, но runtime/migrations не реализованы; Identity Resolution и Discovery Inbox ещё проектируются |

Перед продолжением разработки обязательно прочитать `AGENTS.md`, `AI_DEVELOPMENT_GUIDE.md`, `ARCHITECTURE_DECISIONS.md`, `docs/product/PRODUCT_STRATEGY.md`, `docs/roadmap/ROADMAP.md`, текущий Sprint-документ и `docs/architecture/TECHNICAL_DEBT.md`.

Без нового ADR или решения владельца нельзя менять формулу Trust Score, product boundary, стек, RBAC/RLS, multi-tenant модель или начинать Connector Runtime. По явному решению владельца Sprint 13 начат до ручной приёмки Sprint 12; эта приёмка остаётся обязательным gate перед pilot release.

---

## Roadmap

Текущие обязательства и утверждённая последовательность:

1. Продолжить Sprint 15 — Evidence Layer, normalization, Discovery и connector security specifications.
2. До решения Pilot `GO` выполнить ручную приёмку Sprint 12 по Explainability QA Checklist.
3. До решения Pilot `GO` выполнить ручную приёмку Sprint 13 по Risk Workflow QA Checklist.
4. Закрыть остальные release gates Sprint 14 и зафиксировать Pilot Ready отдельно от Post-MVP разработки.
5. Выбирать первый connector только после подтверждённых pilot source signals.

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

`DTEK Core` · Evidence-first Trust Intelligence Platform · **v0.15.0-dev / Sprint 15 Connector Foundation**
