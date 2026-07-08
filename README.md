# DTEK Core

**Digital Trust & Cyber Risk Management Platform**

DTEK Core — B2B SaaS-платформа управления цифровым доверием активов. Она помогает CISO, аналитикам ИБ и IT-администраторам видеть, каким объектам организации можно доверять, какие риски снижают доверие и какие действия важнее выполнить первыми.

Платформа не заменяет SIEM, EDR, DLP, VM, CMDB или GRC. DTEK Core работает как управленческий слой поверх существующих процессов и инструментов безопасности.

---

## Продуктовое Ядро

| Сущность | Назначение |
|---|---|
| **Trust Passport** | Цифровой паспорт доверия каждого объекта |
| **Trust Score** | 6-факторная оценка доверия объекта от 0 до 100 |
| **Trust Graph** | Граф связей и зависимостей между объектами |
| **Risk Registry** | Реестр рисков с привязкой к объектам и влиянием на Trust Score |
| **Configurator** | Настройка весов Trust Score под отрасль и организацию |
| **Dashboard** | Управленческий обзор доверия, рисков и событий организации |

---

## Текущий Статус

**v0.8.0 — Sprint 08 завершён, проект готов к Market MVP консолидации.**

Функциональный MVP реализован и отполирован для первой демонстрации. Следующий этап — не новый UI-функционал, а Market MVP: демо-данные, импорт/экспорт, отчёты, объяснимость Trust Score и пилотный сценарий для первых пользователей.

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
| Реестр рисков | `/risks` |
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
| [docs/roadmap/ROADMAP.md](docs/roadmap/ROADMAP.md) | Roadmap от текущего MVP к Market MVP |
| [docs/roadmap/SPRINT_ROADMAP.md](docs/roadmap/SPRINT_ROADMAP.md) | План будущих спринтов без создания Sprint 09 |
| [docs/architecture/TECHNICAL_DEBT.md](docs/architecture/TECHNICAL_DEBT.md) | Технический долг и архитектурные риски |
| [docs/security/SECURITY_OVERVIEW.md](docs/security/SECURITY_OVERVIEW.md) | Обзор безопасности |
| [AI_DEVELOPMENT_GUIDE.md](AI_DEVELOPMENT_GUIDE.md) | Инженерный регламент для AI-разработки |
| [AGENTS.md](AGENTS.md) | Постоянный контекст Codex/AI-агента |

---

## Roadmap

Текущий фокус:

1. Market MVP packaging.
2. Demo data и пилотный сценарий.
3. CSV import/export.
4. PDF/Executive reporting.
5. Trust Score explainability.
6. Risk workflow и evidence.
7. Pilot readiness.

Интеграции, SSO, on-prem, расширенный GRC, агенты и marketplace остаются Post-MVP/Enterprise.

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

`DTEK Core` · Digital Trust & Cyber Risk Management Platform · **v0.8.0**
