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
| Frontend | Next.js (App Router) | 14.x |
| Язык | TypeScript (strict) | 5.x |
| Стили | Tailwind CSS + CSS-модули | 3.x |
| Компоненты | Shadcn/UI (new-york, zinc) | latest |
| Backend / БД | Supabase (PostgreSQL 15 + Auth) | Cloud |
| Деплой | Vercel | Cloud |

**Шрифты:** Manrope + JetBrains Mono · **Тема:** только тёмная · **Фон:** `#07090d` · **Акцент:** `#2dd4bf`

---

## Текущее состояние

**Sprint 04 завершён (21.06.2026).** Платформа стабилизирована — Release 2.

### Реализованные маршруты

| Страница | Маршрут | Статус |
|---|---|---|
| Лендинг | `/` | ✅ Sprint 02 |
| Вход | `/login` | ✅ Sprint 01 |
| Регистрация | `/register` | ✅ Sprint 01 |
| Сброс пароля | `/forgot-password`, `/reset-password` | ✅ Sprint 01 |
| Принятие приглашения | `/invite/[token]` | ✅ Sprint 02 |
| Создание организации | `/onboarding/create` | ✅ Sprint 02 |
| Онбординг wizard | `/onboarding/wizard` | ✅ Sprint 02 |
| Пользователи и роли | `/users` | ✅ Sprint 02 |
| Настройки | `/settings` | ✅ Sprint 02 |
| Список объектов | `/objects` | ✅ Sprint 03 |
| Детали объекта | `/objects/[id]` | ✅ Sprint 03 |
| Trust Passport | `/objects/[id]/passport` | ✅ Sprint 03 |
| Реестр рисков | `/risks` | ✅ Sprint 03 |
| Центр управления | `/dashboard` | 🔧 Заглушка (Sprint 05) |
| Trust Graph | `/graph` | 🔧 Заглушка (Sprint 05) |
| Конфигуратор | `/configurator` | 🔧 Заглушка (Sprint 06) |

### История спринтов

| Sprint | Название | Дата | Статус |
|---|---|---|---|
| Sprint 01 | Foundation & Authentication | 09–13.06.2026 | ✅ Завершён |
| Sprint 02 | Organization Management & Platform Setup | 13–15.06.2026 | ✅ Завершён |
| Sprint 03 | Digital Asset Management & Trust Risk Registry | 16–20.06.2026 | ✅ Завершён |
| Sprint 04 | Testing, Bug Fixing & Stabilization | 21.06.2026 | ✅ Завершён |
| Sprint 05 | Dashboard & Trust Graph | — | 🔜 Следующий |

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
SUPABASE_SERVICE_ROLE_KEY=      # Service Role — только сервер, не коммитить!
NEXT_PUBLIC_APP_URL=            # http://localhost:3000 / https://your-domain.com
```

### Команды разработки

```bash
npm run dev          # локальный сервер
npm run type-check   # TypeScript проверка
npm run lint         # ESLint
npm run build        # production сборка
```

---

## Архитектура

```
app/                    — Next.js App Router (page.tsx, layout.tsx)
├── (app)/              — защищённые маршруты (middleware: org required)
│   ├── objects/        — список и детали объектов, Trust Passport
│   ├── risks/          — реестр рисков, Risk Drawer
│   ├── users/          — управление пользователями
│   ├── settings/       — настройки организации и профиля
│   ├── dashboard/      — центр управления (заглушка)
│   └── graph/          — Trust Graph (заглушка)
├── (auth)/             — публичные страницы (login, register, etc.)
└── (landing)/          — лендинг

components/
├── ui/                 — Shadcn/UI компоненты (не редактировать)
└── shared/             — проектные компоненты

lib/
├── actions/            — Server Actions (createObject, createRisk, etc.)
├── supabase/           — client.ts (браузер) и server.ts (сервер)
└── utils/              — cn(), dates.ts (форматирование), design-tokens.ts

supabase/
├── migrations/         — 001–014 SQL-миграции (применены на Cloud)
└── functions/          — Edge Functions (Sprint 08+)

types/
└── database.ts         — TypeScript-типы схемы БД
```

**Supabase project ref:** `ehqpijmbtavfacqogtoe` (EU West, Frankfurt)

---

## Ветковая модель

```
main          ← продакшн, защищена (только через PR + CI)
  └── develop ← основная рабочая ветка
```

CI пайплайн: `lint` → `type-check` → `build` (Node.js 20)

---

## Документация

| Документ | Назначение |
|---|---|
| `ARCHITECTURE_DECISIONS.md` | 5 ADR — приоритетный источник истины |
| `docs/Database_Design_Full.md` | Полная схема БД: 10 таблиц, RLS, индексы |
| `docs/Trust_Score_Model_v2.md` | Формула и расчёт Trust Score |
| `docs/Configurator_Concept_Final.md` | Концепция Конфигуратора MVP |
| `docs/testing/` | Стратегия, план, отчёт тестирования |
| `tasks/MVP_RELEASE_PLAN.md` | План MVP по релизам и спринтам |
| `tasks/EPIC_BACKLOG.md` | Полный список эпиков и задач |
| `CHANGELOG.md` | История изменений по версиям |

---

`DTEK Core` · Digital Trust Management Platform · **v0.4.0**
