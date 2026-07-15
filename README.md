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

**v0.11.0 — Sprint 11 в работе: CSV/XLSX import объектов и рисков реализован.**

Функциональный MVP реализован и отполирован для первой демонстрации. Sprint 09 завершил упаковку Market MVP, Sprint 10 — Reporting Ready milestone. В Sprint 11 уже доступны загрузка объектов и рисков из CSV/XLSX, source metadata, validation preview, CSV-отчёт проверки, шаблоны и import audit events; следующий шаг — пользовательская документация и onboarding smoke test.

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
```

---

## Основные Документы

| Документ | Назначение |
|---|---|
| [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) | Навигация по всей документации |
| [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) | ADR — приоритетный источник архитектурных решений |
| [docs/product/PRODUCT_STRATEGY.md](docs/product/PRODUCT_STRATEGY.md) | Новая продуктовая стратегия и позиционирование |
| [docs/product/EVIDENCE_FIRST_STRATEGY.md](docs/product/EVIDENCE_FIRST_STRATEGY.md) | Evidence-first стратегия и новая роль автоматического наполнения |
| [docs/architecture/Evidence_First_Architecture.md](docs/architecture/Evidence_First_Architecture.md) | Целевая архитектура Discovery, Connector и Evidence layers |
| [docs/architecture/Evidence_Import_Schema.md](docs/architecture/Evidence_Import_Schema.md) | Контракт CSV/XLSX импорта объектов и рисков Sprint 11 |
| [docs/product/PRODUCT_ONE_PAGER.md](docs/product/PRODUCT_ONE_PAGER.md) | One-pager DTEK Core для CISO и первых пилотов |
| [docs/product/PILOT_OFFER.md](docs/product/PILOT_OFFER.md) | 14-дневный pilot offer для первых CISO-пилотов |
| [docs/product/SPRINT09_DOCUMENTATION_SYNC.md](docs/product/SPRINT09_DOCUMENTATION_SYNC.md) | Итоговая синхронизация Sprint 09 |
| [docs/user/REPORTS_AND_EXPORT_GUIDE.md](docs/user/REPORTS_AND_EXPORT_GUIDE.md) | Пользовательское руководство по отчётам и экспорту |
| [docs/roadmap/ROADMAP.md](docs/roadmap/ROADMAP.md) | Roadmap от текущего MVP к Market MVP |
| [docs/roadmap/SPRINT_ROADMAP.md](docs/roadmap/SPRINT_ROADMAP.md) | План Sprint 09–15 до коммерческого MVP |
| [docs/architecture/TECHNICAL_DEBT.md](docs/architecture/TECHNICAL_DEBT.md) | Технический долг и архитектурные риски |
| [docs/security/SECURITY_OVERVIEW.md](docs/security/SECURITY_OVERVIEW.md) | Обзор безопасности |
| [AI_DEVELOPMENT_GUIDE.md](AI_DEVELOPMENT_GUIDE.md) | Инженерный регламент для AI-разработки |
| [AGENTS.md](AGENTS.md) | Постоянный контекст Codex/AI-агента |

---

## Roadmap

Следующий фокус:

1. Sprint 11 — Evidence Import & Data Onboarding.
2. Sprint 12 — Evidence-backed Trust Explainability.
3. Sprint 13 — Evidence-aware Risk Workflow.
4. Sprint 14 — Pilot Readiness.
5. Sprint 15 — Connector Framework Foundation.

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

`DTEK Core` · Evidence-first Trust Intelligence Platform · **v0.11.0 / Sprint 11 in progress**
