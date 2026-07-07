# DTEK Core

**Digital Trust Management Platform (DTMP)**

Платформа создаёт цифровую модель доверия организации как слой над существующими инструментами безопасности (SIEM, DLP, EDR). Помогает CISO и аналитикам ИБ понять реальный уровень киберзащищённости через единый показатель — Trust Score.

## Ключевые сущности

- **Trust Passport** — цифровой паспорт каждого объекта инфраструктуры
- **Trust Score** — взвешенная 6-факторная оценка доверия (0–100)
- **Trust Graph** — граф зависимостей между объектами
- **Risk Registry** — реестр рисков с привязкой к объектам

## Технологический стек

| Слой | Технология | Версия |
|---|---|---|
| Frontend | Next.js (App Router) | 15.x |
| Язык | TypeScript (strict) | 5.x |
| Стили | Tailwind CSS + CSS-модули | 3.x |
| Компоненты | Shadcn/UI (new-york, zinc) | latest |
| Backend / БД | Supabase (PostgreSQL 15 + Auth) | Cloud |
| Деплой | Vercel | Cloud |

**Шрифты:** Manrope + JetBrains Mono · **Тема:** только тёмная · **Фон:** `#07090d` · **Акцент:** `#2dd4bf`

---

## Текущее состояние

**v0.7.0 — MVP функционально завершён (25.06.2026)**

Спринты 01–07 выполнены. Все маршруты реализованы и работают с реальными данными. Платформа прошла QA-тестирование (Sprint 07).

### Реализованные маршруты

| Страница | Маршрут | Sprint |
|---|---|---|
| Лендинг | `/` | Sprint 02 |
| Вход | `/login` | Sprint 01 |
| Регистрация | `/register` | Sprint 01 |
| Сброс пароля | `/forgot-password`, `/reset-password` | Sprint 01 |
| Принятие приглашения | `/invite/[token]` | Sprint 02 |
| Создание организации | `/onboarding/create` | Sprint 02 |
| Онбординг wizard | `/onboarding/wizard` | Sprint 02 |
| Пользователи и роли | `/users` | Sprint 02 |
| Настройки | `/settings` | Sprint 02 |
| Список объектов | `/objects` | Sprint 03 |
| Детали объекта | `/objects/[id]` | Sprint 03 |
| Trust Passport | `/objects/[id]/passport` | Sprint 03 |
| Реестр рисков | `/risks` | Sprint 03 |
| Центр управления | `/dashboard` | Sprint 05 |
| Trust Graph | `/graph` | Sprint 05 |
| Конфигуратор | `/configurator` | Sprint 05 |

### История спринтов

| Sprint | Название | Дата | Версия |
|---|---|---|---|
| Sprint 01 | Foundation & Authentication | 09–13.06.2026 | v0.1.0 |
| Sprint 02 | Organization Management & Platform Setup | 13–15.06.2026 | v0.2.0 |
| Sprint 03 | Digital Asset Management & Trust Risk Registry | 16–20.06.2026 | v0.3.0 |
| Sprint 04 | Testing, Bug Fixing & Stabilization | 21.06.2026 | v0.4.0 |
| Sprint 05 | Trust Score Engine, Dashboard, Trust Graph, Configurator | 22.06.2026 | v0.5.0 |
| Sprint 06 | Security Hardening (next@15, RLS, RBAC, Rate Limiting, Audit) | 23.06.2026 | v0.6.0 |
| Sprint 07 | QA & Platform Testing | 23–25.06.2026 | v0.7.0 |

### Следующие шаги

| Sprint | Название | Содержание |
|---|---|---|
| Sprint 08 | UX Polish | Финальная полировка UI, edge cases |
| Sprint 09 | Security Sprint | ФСТЭК, Secure SDLC, SAST в CI, penetration testing |
| Sprint 10 | MVP Release | Production-деплой, экспорт PDF/CSV |

---

## Быстрый старт

```bash
git clone https://github.com/DTEK-Core/DTEK-core.git
cd DTEK-core
npm install
cp .env.example .env.local
# Заполнить .env.local значениями из Supabase Dashboard
npm run dev          # http://localhost:3000
```

### Переменные окружения

```
NEXT_PUBLIC_SUPABASE_URL=       # Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anon key (безопасен для клиента)
SUPABASE_SERVICE_ROLE_KEY=      # Service Role — только сервер, НИКОГДА не коммитить!
NEXT_PUBLIC_APP_URL=            # http://localhost:3000 / https://your-domain.com
SUPABASE_FETCH_TIMEOUT_MS=4000  # опционально: fail-fast таймаут запросов к Supabase
```

Если страницы долго открываются, появляются `getaddrinfo ENOTFOUND`,
`AuthRetryableFetchError` или `fetch failed`, сначала проверьте DNS, доступность
Supabase project ref и `.env.local` по runbook:
[docs/development/TROUBLESHOOTING.md](docs/development/TROUBLESHOOTING.md).

### Команды разработки

```bash
npm run dev          # локальный сервер http://localhost:3000
npm run type-check   # TypeScript проверка (0 ошибок)
npm run lint         # ESLint (0 предупреждений)
npm run build        # production сборка
```

---

## Архитектура

```
app/                    — Next.js 15 App Router (page.tsx, layout.tsx)
├── (app)/              — защищённые маршруты (middleware: org required)
│   ├── dashboard/      — Центр управления: KPI, Trust Ring, Event Feed
│   ├── graph/          — Trust Graph: интерактивный граф связей
│   ├── configurator/   — Редактор весов факторов Trust Score
│   ├── objects/        — Список объектов + детали + Trust Passport
│   ├── risks/          — Реестр рисков + Risk Drawer
│   ├── users/          — Управление командой и ролями
│   └── settings/       — Настройки организации, профиль, аудит
├── (auth)/             — публичные страницы (login, register, invite, reset)
└── page.tsx            — лендинг

components/
├── ui/                 — Shadcn/UI (не редактировать напрямую)
└── shared/             — проектные компоненты

lib/
├── actions/            — Server Actions (createObject, createRisk, saveFactorWeights...)
├── supabase/           — client.ts, server.ts, admin.ts, service.ts
├── trust/              — calculate.ts, engine.ts (Trust Score logic)
├── security/           — audit.ts (security event logging)
├── validation/         — schemas.ts (Zod schemas)
└── utils/              — cn(), dates.ts, design-tokens.ts

supabase/
├── migrations/         — 001–017 SQL-миграции (применены на Supabase Cloud)
└── functions/          — Edge Functions (Sprint 08+)

types/
└── database.ts         — TypeScript-типы схемы БД (auto-generated)
```

**Supabase project ref:** `ehqpijmbtavfacqogtoe` (EU West, Frankfurt)

---

## Безопасность

- **4 роли RBAC** с проверкой на сервере (owner / analyst / admin / viewer)
- **RLS** на всех 10 таблицах — изоляция данных организаций
- **Security Headers** — CSP, X-Frame-Options, X-Content-Type-Options
- **Rate Limiting** — IP: 60 req/60s (API), 10 req/60s (invite)
- **Zod-валидация** всех входящих данных
- **Audit Log** — журнал безопасности (`/settings` → «Журнал аудита»)

Подробнее: [docs/security/SECURITY_OVERVIEW.md](docs/security/SECURITY_OVERVIEW.md)

---

## Ветковая модель

```
main     ← продакшн; только через PR из develop после CI
  └── develop ← основная рабочая ветка (прямые коммиты)
```

CI пайплайн: `lint` → `type-check` → `build` (Node.js 20)

---

## Документация

| Документ | Назначение |
|---|---|
| [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) | Полный навигационный индекс документации |
| [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) | ADR-001–005 — приоритетный источник истины |
| [docs/architecture/Database_Design_Full.md](docs/architecture/Database_Design_Full.md) | Полная схема БД: 10 таблиц, RLS, индексы |
| [docs/architecture/Trust_Score_Model_v2.md](docs/architecture/Trust_Score_Model_v2.md) | Формула и расчёт Trust Score |
| [docs/architecture/Configurator_Concept_Final.md](docs/architecture/Configurator_Concept_Final.md) | Концепция Конфигуратора MVP |
| [docs/security/SECURITY_OVERVIEW.md](docs/security/SECURITY_OVERVIEW.md) | Обзор безопасности платформы |
| [docs/testing/RBAC_TESTING_GUIDE.md](docs/testing/RBAC_TESTING_GUIDE.md) | Руководство тестирования ролей |
| [tasks/MVP_RELEASE_PLAN.md](tasks/MVP_RELEASE_PLAN.md) | План MVP по релизам и спринтам |
| [CHANGELOG.md](CHANGELOG.md) | История изменений по версиям |

---

`DTEK Core` · Digital Trust Management Platform · **v0.7.0** · MVP функционально завершён
