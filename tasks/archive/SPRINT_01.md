# SPRINT 01 — Инфраструктура

`Проект: DTEK Core`
`Спринт: 01`
`Дата: 09.06.2026`
`Статус: Готов к старту`

---

## Содержание

1. [Цель спринта](#1-цель-спринта)
2. [Контекст и охват](#2-контекст-и-охват)
3. [Ёмкость и оценка](#3-ёмкость-и-оценка)
4. [Порядок выполнения](#4-порядок-выполнения)
5. [Обзор задач](#5-обзор-задач)
6. [S01-T001 — Git-репозиторий и GitHub](#6-s01-t001--git-репозиторий-и-github)
7. [S01-T002 — Next.js 14: инициализация проекта](#7-s01-t002--nextjs-14-инициализация-проекта)
8. [S01-T003 — Tailwind CSS и Shadcn/UI](#8-s01-t003--tailwind-css-и-shadcnui)
9. [S01-T004 — Supabase Cloud: проект и клиент](#9-s01-t004--supabase-cloud-проект-и-клиент)
10. [S01-T005 — Supabase CLI и структура миграций](#10-s01-t005--supabase-cli-и-структура-миграций)
11. [S01-T006 — БД: profiles и organizations](#11-s01-t006--бд-profiles-и-organizations)
12. [S01-T007 — БД: objects, trust_passports, trust_factor_config](#12-s01-t007--бд-objects-trust_passports-trust_factor_config)
13. [S01-T008 — БД: risks, object_risks, relations](#13-s01-t008--бд-risks-object_risks-relations)
14. [S01-T009 — БД: trust_score_history, invitations и финальная проверка](#14-s01-t009--бд-trust_score_history-invitations-и-финальная-проверка)
15. [S01-T010 — CI/CD: GitHub Actions и Vercel](#15-s01-t010--cicd-github-actions-и-vercel)
16. [S01-T011 — CLAUDE.md: контекстный файл проекта](#16-s01-t011--claudemd-контекстный-файл-проекта)
17. [Definition of Done спринта](#17-definition-of-done-спринта)

---

## 1. Цель спринта

**Подготовить техническую основу проекта**, после которой любой разработчик может немедленно приступить к разработке продуктовой функциональности: клонировать репозиторий, установить зависимости, запустить проект и работать с заполненной базой данных.

По завершении спринта нет ни одного экрана для пользователя, но есть полностью работающая инфраструктура: репозиторий, стек, 10 таблиц БД с RLS, CI/CD и файл контекста для AI-разработки.

---

## 2. Контекст и охват

| Параметр | Значение |
|---|---|
| Покрываемый релиз | Release 0 — Техническая база (`tasks/MVP_RELEASE_PLAN.md`) |
| Покрываемый Epic | Epic 1 — Foundation (`tasks/EPIC_BACKLOG.md`) |
| Фичи | F-001, F-002, F-003, F-004, F-005 (`tasks/FEATURE_BACKLOG.md`) |
| Ключевые документы | `docs/Database_Design_Full.md`, `ARCHITECTURE_DECISIONS.md` |

---

## 3. Ёмкость и оценка

| | |
|---|---|
| Задач | 11 |
| Суммарная оценка | 37 часов |
| Длительность (1 разработчик) | 4–5 рабочих дней |
| Длительность (2 разработчика) | 2.5–3 рабочих дня |

**Параллельные треки при наличии 2 разработчиков:**
- Разработчик 1: T001 → T002 → T003 → T010
- Разработчик 2: (после T002) T004 → T005 → T006 → T007 → T008 → T009 → T011

---

## 4. Порядок выполнения

```
T001: Git & GitHub
    └── T002: Next.js Project
            ├── T003: Tailwind + Shadcn/UI ──────────────┐
            │                                             ├── T010: CI/CD
            ├── T004: Supabase Client ───────────────────┘
            │       └── T005: CLI & Migrations Structure
            │               └── T006: DB: profiles + organizations
            │                       └── T007: DB: objects + passports + config
            │                               └── T008: DB: risks + relations
            │                                       └── T009: DB: history + invitations
            └── T011: CLAUDE.md (независим от T004–T009)
```

**Критический путь:** T001 → T002 → T004 → T005 → T006 → T007 → T008 → T009

---

## 5. Обзор задач

| ID | Название | Приоритет | Оценка | Зависит от |
|---|---|---|---|---|
| S01-T001 | Git-репозиторий и GitHub | P1 | 2 ч | — |
| S01-T002 | Next.js 14: инициализация проекта | P1 | 3 ч | T001 |
| S01-T003 | Tailwind CSS и Shadcn/UI | P1 | 3 ч | T002 |
| S01-T004 | Supabase Cloud: проект и клиент | P1 | 3 ч | T002 |
| S01-T005 | Supabase CLI и структура миграций | P1 | 2 ч | T004 |
| S01-T006 | БД: profiles и organizations | P1 | 4 ч | T005 |
| S01-T007 | БД: objects, trust_passports, trust_factor_config | P1 | 5 ч | T006 |
| S01-T008 | БД: risks, object_risks, relations | P1 | 5 ч | T007 |
| S01-T009 | БД: trust_score_history, invitations и финальная проверка | P1 | 3 ч | T008 |
| S01-T010 | CI/CD: GitHub Actions и Vercel | P2 | 5 ч | T002, T003, T004 |
| S01-T011 | CLAUDE.md: контекстный файл проекта | P2 | 2 ч | T002 |
| | **Итого** | | **37 ч** | |

---

## 6. S01-T001 — Git-репозиторий и GitHub

**Приоритет:** P1 | **Оценка:** 2 часа | **Зависит от:** —

### Описание

Создать публичный (или приватный — по решению команды) репозиторий GitHub с именем `dtek-core`. Настроить ветковую модель с защитой ветки `main`. Инициализировать начальную структуру репозитория.

Базовые правила репозитория согласно `workflow.md`: рабочая ветка — `develop`, фичи разрабатываются в `feature/<task-id>`, прямые коммиты в `main` запрещены.

**Что нужно сделать:**

Создать репозиторий на GitHub и настроить ветки `main` и `develop`. Установить branch protection rule для `main`: запрет прямого push, обязательный PR, прохождение CI-проверок перед мерджем. Создать `.gitignore` для Node.js / Next.js, исключив: `node_modules/`, `.env.local`, `.env*.local`, `.next/`, `out/`, `supabase/.branches/`, `supabase/functions/`. Добавить начальный `README.md` с названием проекта. Сделать первый коммит и запушить в `main`.

### Критерии готовности

- [ ] Репозиторий существует на GitHub, виден и клонируется командой `git clone`
- [ ] Ветки `main` и `develop` присутствуют в репозитории
- [ ] Branch protection на `main`: прямой push запрещён, требуется PR
- [ ] `.gitignore` создан; `.env.local` и `node_modules/` не попадают в коммиты
- [ ] `README.md` содержит название проекта
- [ ] История коммитов чиста: нет случайных файлов в первом коммите

### Зависимости

— (нет входящих)

---

## 7. S01-T002 — Next.js 14: инициализация проекта

**Приоритет:** P1 | **Оценка:** 3 часа | **Зависит от:** S01-T001

### Описание

Инициализировать проект Next.js 14 с App Router и настроить TypeScript в строгом режиме. Создать базовую структуру папок, которую будет использовать весь дальнейший код проекта.

Стек согласно `ADR-004` и `docs/04 Architecture/System_Architecture.md`: Next.js 14, TypeScript strict mode, App Router.

**Что нужно сделать:**

Запустить создание проекта Next.js 14 с параметрами: App Router — да, TypeScript — да, ESLint — да, Tailwind CSS — нет (установим отдельно в T003), папка `src/` — нет, псевдонимы импортов — `@/*`. Настроить `tsconfig.json`: включить `strict: true`, добавить path mapping `@/*` на корневую папку. Создать структуру директорий:

```
app/                  — маршруты App Router
components/
  ui/                 — компоненты Shadcn/UI (будут добавлены в T003)
  shared/             — переиспользуемые компоненты
lib/
  supabase/           — клиенты Supabase (будут настроены в T004)
  utils/              — вспомогательные функции
types/                — глобальные TypeScript-типы
supabase/
  migrations/         — файлы миграций (будут добавлены в T005)
  functions/          — Supabase Edge Functions (понадобится в Epic 8)
```

Установить Prettier и добавить `.prettierrc` с настройками (одинарные кавычки, точки с запятой, ширина 100 символов). Добавить скрипт `"type-check": "tsc --noEmit"` в `package.json`. Закоммитить в ветку `develop`.

### Критерии готовности

- [ ] Команда `npm run dev` запускает проект без ошибок, доступен `http://localhost:3000`
- [ ] Команда `npm run type-check` завершается с кодом 0, без ошибок TypeScript
- [ ] `tsconfig.json` содержит `"strict": true` в опциях компилятора
- [ ] Псевдоним `@/` работает корректно: `import ... from '@/lib/utils'` разрешается
- [ ] Все 6 директорий (`app/`, `components/ui/`, `components/shared/`, `lib/supabase/`, `types/`, `supabase/migrations/`) созданы и содержат хотя бы `.gitkeep`
- [ ] `package.json` содержит скрипт `type-check`
- [ ] `.prettierrc` создан в корне репозитория
- [ ] Код запушен в ветку `develop`

### Зависимости

S01-T001 (репозиторий должен существовать)

---

## 8. S01-T003 — Tailwind CSS и Shadcn/UI

**Приоритет:** P1 | **Оценка:** 3 часа | **Зависит от:** S01-T002

### Описание

Настроить Tailwind CSS и инициализировать Shadcn/UI с базовым набором компонентов, которые понадобятся начиная с Epic 2 (Authentication). Компоненты будут переиспользоваться во всех последующих спринтах.

**Что нужно сделать:**

Установить и настроить Tailwind CSS: указать правильные пути для `content` (файлы `app/**/*.{ts,tsx}`, `components/**/*.{ts,tsx}`), добавить CSS-переменные для цветовой темы (primary, secondary, destructive, muted, accent, background, foreground, border, ring) в `globals.css`. Подключить `tailwind-animate` для анимаций.

Инициализировать Shadcn/UI с настройками: стиль — `new-york`, базовый цвет — `zinc`, CSS-переменные — да, путь компонентов — `@/components/ui`. Установить следующие компоненты Shadcn/UI:

*Базовые (ввод и форм):*
`button`, `input`, `label`, `textarea`, `select`, `checkbox`, `switch`, `slider`

*Контейнеры и раскладки:*
`card`, `badge`, `avatar`, `separator`, `skeleton`

*Диалоги и оверлеи:*
`dialog`, `sheet`, `tooltip`, `popover`, `dropdown-menu`

*Данные:*
`table`, `tabs`

*Обратная связь:*
`sonner` (toast-уведомления)

Проверить, что компоненты корректно импортируются из `@/components/ui/...` и не вызывают ошибок TypeScript.

### Критерии готовности

- [ ] Tailwind CSS применяется: тестовый элемент с классом `bg-primary text-primary-foreground` отображается с правильными цветами
- [ ] CSS-переменные для темы определены в `globals.css` и работают в `dark:` режиме
- [ ] Все 19 перечисленных компонентов Shadcn/UI установлены и находятся в `components/ui/`
- [ ] `Button` рендерится без ошибок в любом серверном и клиентском компоненте
- [ ] `Skeleton` компонент работает (используется в каждом будущем экране при загрузке)
- [ ] `Sonner` (toast) настроен и подключён в корневом layout
- [ ] `npm run type-check` продолжает проходить без ошибок
- [ ] `npm run build` завершается успешно

### Зависимости

S01-T002 (проект Next.js должен быть создан)

---

## 9. S01-T004 — Supabase Cloud: проект и клиент

**Приоритет:** P1 | **Оценка:** 3 часа | **Зависит от:** S01-T002

### Описание

Создать проект в Supabase Cloud, получить ключи API и настроить подключение в Next.js. После этой задачи приложение может делать запросы к Supabase — это основа для всех задач T005–T009.

Стек согласно `ADR-004`: Supabase Cloud (PostgreSQL 15 + Auth + Edge Functions + Storage).

**Что нужно сделать:**

Создать новый проект Supabase Cloud: регион — Europe West (Frankfurt для минимального latency), имя проекта — `dtek-core`, надёжный пароль БД (сохранить в защищённом месте). Дождаться инициализации проекта (~2 минуты).

Перейти в раздел Project Settings → API и скопировать: Project URL, `anon` public key, `service_role` secret key (хранить только на сервере).

Установить пакеты `@supabase/supabase-js` и `@supabase/ssr`. Создать два файла клиента:
- `lib/supabase/client.ts` — клиентский Supabase client (для Client Components, использует `createBrowserClient`)
- `lib/supabase/server.ts` — серверный Supabase client (для Server Components и Server Actions, использует `createServerClient` с cookies)

Создать `.env.local` с переменными: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Создать `.env.example` с теми же ключами, но пустыми значениями и описательными комментариями для каждой переменной (что это такое, где взять).

Убедиться, что `.env.local` добавлен в `.gitignore` и не попадает в историю git.

Написать минимальный smoke-тест в временном файле: подключиться к Supabase, сделать запрос и убедиться, что соединение работает. После проверки удалить временный файл.

### Критерии готовности

- [ ] Проект Supabase Cloud создан и доступен в дашборде
- [ ] `lib/supabase/client.ts` и `lib/supabase/server.ts` созданы без ошибок TypeScript
- [ ] `.env.local` содержит все три переменные с реальными значениями
- [ ] `.env.example` содержит все три переменные с пустыми значениями и комментариями
- [ ] `.env.local` не попадает в git (проверить `git status` — файл должен быть в untracked)
- [ ] Суpabase client успешно инициализируется: нет ошибок при импорте и создании клиента
- [ ] Smoke-тест подключения выполнен и удалён

### Зависимости

S01-T002 (структура проекта, path aliases должны работать)

---

## 10. S01-T005 — Supabase CLI и структура миграций

**Приоритет:** P1 | **Оценка:** 2 часа | **Зависит от:** S01-T004

### Описание

Установить Supabase CLI и подготовить инфраструктуру для работы с миграциями. Создать общие вспомогательные функции, которые используются в RLS-политиках всех таблиц. Эта задача — шлюз перед серией задач T006–T009.

**Что нужно сделать:**

Установить Supabase CLI (`npm install --save-dev supabase`). Выполнить `supabase init` в корне проекта — это создаст папку `supabase/` с `config.toml`. Настроить `supabase/config.toml`: указать project_id из Supabase Cloud, настроить локальный порт для DB.

Связать CLI с Supabase Cloud проектом командой `supabase link` (потребуется project reference ID из Supabase Dashboard).

Создать первый файл миграции `supabase/migrations/001_helper_functions.sql`. В нём должны быть объявлены:
- Функция `current_org_id()` — возвращает `organization_id` текущего авторизованного пользователя из таблицы `profiles`
- Функция `current_user_role()` — возвращает `role` текущего пользователя из таблицы `profiles`
- Функция `set_updated_at()` — триггерная функция для автоматического обновления поля `updated_at`

Обе функции должны быть `STABLE SECURITY DEFINER` согласно `Database_Design_Full.md` раздел 4.1.

Создать файл `supabase/README.md` с описанием порядка миграций (согласно разделу 6 `Database_Design_Full.md`) и инструкцией по применению: `supabase db push` для применения к облаку, `supabase db reset` для локального сброса.

### Критерии готовности

- [ ] Supabase CLI установлен как dev dependency в `package.json`
- [ ] Команда `npx supabase --version` выводит версию без ошибок
- [ ] Папка `supabase/` содержит `config.toml` с корректным `project_id`
- [ ] Файл `supabase/migrations/001_helper_functions.sql` создан с тремя функциями
- [ ] CLI связан с Supabase Cloud проектом (`supabase link` выполнен)
- [ ] `supabase/README.md` создан и содержит порядок миграций и базовые инструкции

### Зависимости

S01-T004 (Supabase Cloud проект должен существовать, project ID нужен для link)

---

## 11. S01-T006 — БД: profiles и organizations

**Приоритет:** P1 | **Оценка:** 4 часа | **Зависит от:** S01-T005

### Описание

Создать первые два файла миграций: для таблиц `profiles` и `organizations`. Это фундаментальные таблицы — все остальные ссылаются на них. Важная тонкость: `profiles` ссылается на `organizations` (через `organization_id`), а `organizations` ссылается на `profiles` (через `owner_id`). Циклическая зависимость решается через трёхшаговую миграцию.

Спецификация согласно `docs/Database_Design_Full.md` разделы 3.1 и 3.2.

**Что нужно сделать:**

Создать `supabase/migrations/002_profiles.sql`: таблица `profiles` с полями `id` (UUID, FK на `auth.users` с CASCADE DELETE), `organization_id` (UUID, изначально без FK — добавить позже), `full_name`, `email`, `role` (CHECK enum: owner/analyst/admin/viewer, DEFAULT viewer), `team`, `status` (CHECK enum: active/invited/blocked, DEFAULT active), `avatar_url`, `created_at`, `last_seen_at`. Создать три индекса: по `organization_id`, по `email`, составной `(organization_id, role)`.

Создать `supabase/migrations/003_organizations.sql`: таблица `organizations` с полями `id`, `name`, `short_name`, `description`, `industry`, `size` (CHECK: micro/small/medium/large/enterprise), `employee_count` (CHECK > 0), `inn`, `region`, `plan` (CHECK: free/starter/professional/enterprise, DEFAULT free), `trust_score` (CHECK 0–100, DEFAULT 70), `trust_level` (CHECK 5 значений, DEFAULT medium), `owner_id` (UUID FK на `profiles` с RESTRICT), `created_at`, `updated_at`. Создать индекс по `owner_id`.

Создать `supabase/migrations/004_profiles_org_fk.sql`: добавить внешний ключ `profiles.organization_id → organizations.id` с `ON DELETE SET NULL`. Этот шаг выполняется после создания `organizations`.

Для обеих таблиц добавить RLS: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` и политики SELECT, INSERT, UPDATE, DELETE согласно разделу 4.2 `Database_Design_Full.md`. Для `profiles` — пользователь видит участников своей организации; для `organizations` — пользователь видит и редактирует только свою организацию.

Применить миграции к Supabase Cloud (`supabase db push`).

### Критерии готовности

- [ ] Файлы `002_profiles.sql`, `003_organizations.sql`, `004_profiles_org_fk.sql` созданы в `supabase/migrations/`
- [ ] Таблица `profiles` видна в Supabase Dashboard → Table Editor с правильными колонками
- [ ] Таблица `organizations` видна с правильными колонками
- [ ] В `profiles` поле `organization_id` имеет FK на `organizations.id`
- [ ] В `organizations` поле `owner_id` имеет FK на `profiles.id`
- [ ] RLS включён на обеих таблицах (иконка замка в Supabase Dashboard)
- [ ] Политики RLS перечислены в разделе Authentication → Policies для каждой таблицы
- [ ] Все три индекса на `profiles` созданы (проверить в Database → Indexes)
- [ ] Индекс на `organizations.owner_id` создан

### Зависимости

S01-T005 (helper functions из 001_helper_functions.sql нужны для RLS политик)

---

## 12. S01-T007 — БД: objects, trust_passports, trust_factor_config

**Приоритет:** P1 | **Оценка:** 5 часов | **Зависит от:** S01-T006

### Описание

Самая объёмная задача спринта. Создать три таблицы, которые являются ядром продуктовой модели, плюс триггеры автоматизации. После этой задачи фундаментальная бизнес-логика БД — автосоздание паспорта и автообновление `updated_at` — работает на уровне базы данных.

Спецификация: `Database_Design_Full.md` разделы 3.3, 3.4, 3.9, раздел 5.

**Что нужно сделать:**

Создать `supabase/migrations/005_objects.sql`: таблица `objects` с полями `id`, `organization_id` (FK → organizations CASCADE), `name` (NOT NULL), `type` (CHECK 11 значений: server/workstation/laptop/network/app/database/service/identity/ot/policy/other), `description`, `owner_id` (FK → profiles SET NULL), `criticality` (CHECK 4 значения, DEFAULT medium), `status` (CHECK 5 значений: active/warning/risk/critical/archived, DEFAULT active), `ip_address`, `os_platform`, `segment`, `exposure` (CHECK: internal/external/isolated), `trust_score` (CHECK 0–100, DEFAULT 70), `trust_level` (DEFAULT medium), `created_at`, `updated_at`. Создать 6 индексов: по `organization_id`, составные `(organization_id, type)`, `(organization_id, criticality)`, `(organization_id, trust_score)`, `(organization_id, status)`, по `owner_id`.

Создать `supabase/migrations/006_trust_passports.sql`: таблица `trust_passports` с `id`, `object_id` (UNIQUE FK → objects CASCADE), `organization_id` (FK → organizations CASCADE), `trust_score` (DEFAULT 70), `trust_level` (DEFAULT medium), шесть факторных полей `vuln_score`, `config_score`, `access_score`, `network_score`, `compliance_score`, `incident_score` (все CHECK 0–100, DEFAULT 70), счётчики `risk_count`, `open_risk_count`, `critical_risk_count`, `connection_count` (все DEFAULT 0, CHECK ≥ 0), `completeness_pct` (CHECK 0–100, DEFAULT 0), `calculated_at`, `updated_at`. Создать 3 индекса.

Создать `supabase/migrations/007_trust_factor_config.sql`: таблица `trust_factor_config` с `id`, `organization_id` (UNIQUE FK → organizations CASCADE), шесть весовых полей `vuln_weight` (DEFAULT 22), `config_weight` (DEFAULT 18), `access_weight` (DEFAULT 18), `network_weight` (DEFAULT 14), `compliance_weight` (DEFAULT 16), `incident_weight` (DEFAULT 12) — все CHECK 0–100, `updated_at`, `updated_by` (FK → profiles SET NULL). Добавить constraint `weights_sum_100`: сумма всех шести весов должна равняться 100.

Создать `supabase/migrations/008_triggers.sql`:
- Триггер `tr_create_passport`: срабатывает AFTER INSERT на `objects`, вызывает функцию `create_trust_passport()` которая создаёт запись в `trust_passports`
- Триггеры `set_updated_at` на таблицах `objects`, `organizations`, `trust_passports`, `trust_factor_config`

Добавить RLS политики для `objects` (SELECT/INSERT/UPDATE/DELETE с разграничением по ролям согласно разделу 4.2), для `trust_passports` (SELECT для всех участников, INSERT/UPDATE только через систему), для `trust_factor_config` (SELECT для всех, UPDATE только owner/analyst).

Применить миграции (`supabase db push`), проверить в Dashboard.

### Критерии готовности

- [ ] Файлы `005_objects.sql`, `006_trust_passports.sql`, `007_trust_factor_config.sql`, `008_triggers.sql` созданы
- [ ] Таблица `objects` содержит все поля включая `exposure` и шесть индексов
- [ ] Таблица `trust_passports` содержит 6 факторных полей (`vuln_score` и др.) и UNIQUE constraint на `object_id`
- [ ] Таблица `trust_factor_config` содержит constraint `weights_sum_100` (видно в Database → Constraints)
- [ ] Значения весов по умолчанию: 22/18/18/14/16/12 (суммарно 100)
- [ ] Триггер `tr_create_passport` создан на таблице `objects`
- [ ] Триггеры `updated_at` работают на всех четырёх таблицах
- [ ] Тест триггера: создать запись в `objects` → в `trust_passports` автоматически появляется связанная запись с тем же `object_id`
- [ ] RLS включён на всех трёх таблицах с корректными политиками

### Зависимости

S01-T006 (`organizations` и `profiles` должны существовать как родительские таблицы)

---

## 13. S01-T008 — БД: risks, object_risks, relations

**Приоритет:** P1 | **Оценка:** 5 часов | **Зависит от:** S01-T007

### Описание

Создать три таблицы: реестр рисков, связь рисков с объектами и граф доверия (рёбра). Все три таблицы содержат специфичные бизнес-ограничения, которые нужно заложить на уровне БД.

Спецификация: `Database_Design_Full.md` разделы 3.5, 3.6, 3.7.

**Что нужно сделать:**

Создать `supabase/migrations/009_risks.sql`: таблица `risks` с `id`, `organization_id` (FK CASCADE), `title` (NOT NULL), `description`, `category` (CHECK 11 значений: vulnerability/configuration/access/network/compliance/incident/monitoring/organizational/physical/human/other, DEFAULT other), `severity` (CHECK: low/medium/high/critical, NOT NULL), `probability` (CHECK: low/medium/high), `cvss_score` (numeric(3,1), CHECK 0–10), `status` (CHECK 5 значений: open/in_progress/mitigated/accepted/closed, DEFAULT open), `impact`, `author_id` (FK → profiles SET NULL), `owner_id` (FK → profiles SET NULL), `sla_days` (CHECK > 0), `due_date`, `resolved_at`, `created_at`, `updated_at`. Создать 7 индексов: по `organization_id`, составные `(organization_id, severity)`, `(organization_id, status)`, `(organization_id, category)`, по `author_id`, по `owner_id`, частичный индекс по `due_date WHERE due_date IS NOT NULL`.

Создать `supabase/migrations/010_object_risks.sql`: таблица `object_risks` — junction table для связи объектов и рисков. Поля: `id`, `object_id` (FK → objects CASCADE), `risk_id` (FK → risks CASCADE), `linked_at` (DEFAULT now()), `linked_by` (FK → profiles SET NULL). UNIQUE constraint на `(object_id, risk_id)`. Два индекса: по `object_id` и по `risk_id`.

Создать `supabase/migrations/011_relations.sql`: таблица `relations` с `id`, `organization_id` (FK CASCADE), `source_object_id` (FK → objects CASCADE), `target_object_id` (FK → objects CASCADE), `relation_type` (CHECK 6 значений: uses/depends_on/connected_to/managed_by/owns/interacts_with), `description`, `created_by` (FK → profiles SET NULL), `created_at`. Два ограничения: `no_self_relation` (`source_object_id != target_object_id`) и UNIQUE на `(source_object_id, target_object_id, relation_type)`. Три индекса: по `organization_id`, по `source_object_id`, по `target_object_id`.

Добавить RLS для всех трёх таблиц согласно разделу 4.2 `Database_Design_Full.md`.

Применить миграции (`supabase db push`), проверить в Dashboard.

### Критерии готовности

- [ ] Файлы `009_risks.sql`, `010_object_risks.sql`, `011_relations.sql` созданы
- [ ] Таблица `risks` содержит поле `category` с 11 допустимыми значениями
- [ ] Таблица `risks` содержит поле `cvss_score` типа `numeric(3,1)`
- [ ] Таблица `object_risks` имеет UNIQUE constraint на `(object_id, risk_id)` и CASCADE delete на оба FK
- [ ] Таблица `relations` имеет constraint `no_self_relation` (видно в Database → Constraints)
- [ ] Таблица `relations` имеет UNIQUE на `(source_object_id, target_object_id, relation_type)`
- [ ] Частичный индекс на `risks.due_date WHERE due_date IS NOT NULL` создан
- [ ] RLS включён на всех трёх таблицах с корректными политиками

### Зависимости

S01-T007 (`objects` должна существовать как родительская таблица для `object_risks` и `relations`)

---

## 14. S01-T009 — БД: trust_score_history, invitations и финальная проверка

**Приоритет:** P1 | **Оценка:** 3 часа | **Зависит от:** S01-T008

### Описание

Создать последние две таблицы и провести полную верификацию всей схемы. По завершении этой задачи все 10 таблиц существуют, RLS работает, миграции можно применить с нуля. Также создать заглушку триггера пересчёта Trust Score (`pg_notify`) — она будет нужна в Sprint 08 (Epic 8: Trust Score Engine).

Спецификация: `Database_Design_Full.md` разделы 3.8, 3.10, 5.3.

**Что нужно сделать:**

Создать `supabase/migrations/012_trust_score_history.sql`: таблица `trust_score_history` с `id`, `object_id` (FK → objects CASCADE), `organization_id` (FK → organizations CASCADE), `old_score` (nullable, CHECK 0–100), `new_score` (NOT NULL, CHECK 0–100), `factors_snapshot` (JSONB), `reason`, `changed_by` (TEXT, DEFAULT 'system'), `created_at`. Формат `factors_snapshot` задокументирован в `Database_Design_Full.md` — это JSON с ключами vuln/config/access/network/compliance/incident и вложенным объектом weights. Создать 3 индекса.

Создать `supabase/migrations/013_invitations.sql`: таблица `invitations` с `id`, `organization_id` (FK CASCADE), `email`, `role` (CHECK: analyst/admin/viewer — роль owner через приглашение запрещена), `token` (UNIQUE, DEFAULT случайный hex-токен через `gen_random_bytes(32)`), `invited_by` (FK → profiles SET NULL), `status` (CHECK: pending/accepted/expired, DEFAULT pending), `expires_at` (DEFAULT `now() + interval '7 days'`), `created_at`. Создать 4 индекса: по `organization_id`, по `email`, по `token`, частичный `WHERE status = 'pending'`.

Создать `supabase/migrations/014_notify_trigger.sql`: функция `notify_trust_recalc()` и заглушка триггера `pg_notify`. Это инфраструктура для будущей Edge Function пересчёта в Epic 8. В Sprint 01 триггер создаётся, но Edge Function, которая будет его слушать, — нет.

Добавить RLS для обеих таблиц.

**Финальная проверка схемы:**
- Проверить все 10 таблиц в Supabase Dashboard → Table Editor
- Убедиться, что повторное применение всех миграций с нуля (`supabase db reset` → `supabase db push`) проходит без ошибок
- Проверить что запрос к любой таблице с анонимным ключом возвращает пустой результат (RLS блокирует неавторизованный доступ)

Применить миграции (`supabase db push`).

### Критерии готовности

- [ ] Файлы `012_trust_score_history.sql`, `013_invitations.sql`, `014_notify_trigger.sql` созданы
- [ ] Таблица `trust_score_history` содержит поле `factors_snapshot` типа JSONB
- [ ] Таблица `invitations` содержит роли только analyst/admin/viewer (роль owner недоступна)
- [ ] Поле `invitations.token` имеет DEFAULT и UNIQUE constraint
- [ ] Поле `invitations.expires_at` имеет DEFAULT на +7 дней
- [ ] Функция `notify_trust_recalc()` создана в БД
- [ ] В Supabase Dashboard → Table Editor видны все **10 таблиц**: profiles, organizations, objects, trust_passports, trust_factor_config, risks, object_risks, relations, trust_score_history, invitations
- [ ] Полный сброс и повторное применение всех 14 миграций проходит без ошибок
- [ ] Запрос к таблице `objects` с anon key возвращает `[]` (RLS работает)
- [ ] Функции `current_org_id()` и `current_user_role()` существуют в Database → Functions

### Зависимости

S01-T008 (`objects` и `organizations` нужны как родительские таблицы)

---

## 15. S01-T010 — CI/CD: GitHub Actions и Vercel

**Приоритет:** P2 | **Оценка:** 5 часов | **Зависит от:** S01-T002, S01-T003, S01-T004

### Описание

Настроить автоматическую CI/CD-пайплайн: GitHub Actions для проверки кода и Vercel для автоматических деплоев. После этой задачи каждый PR в `develop` и `main` автоматически проверяется и деплоится.

**Что нужно сделать:**

Создать файл `.github/workflows/ci.yml`. Пайплайн должен запускаться при: push в `develop`, push в `main`, открытии и обновлении PR в `develop` или `main`. Пайплайн состоит из трёх последовательных джобов:
1. **lint** — запускает `npm run lint`, падает при ESLint-ошибках
2. **type-check** — запускает `npm run type-check` (`tsc --noEmit`), падает при ошибках TypeScript
3. **build** — запускает `npm run build`, падает если Next.js не собирается

В джобах нужно использовать Node.js версии 20 (LTS), кэшировать `node_modules` для ускорения. Переменные окружения Supabase передавать из GitHub Secrets (добавить секреты в Settings → Secrets and variables → Actions).

Подключить репозиторий к Vercel: создать проект Vercel, выбрать GitHub репозиторий, фреймворк — Next.js. Настроить в Vercel:
- Production branch: `main`
- Preview deployments: все остальные ветки (включая `develop`)
- Переменные окружения: добавить `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY` для всех окружений; `SUPABASE_SERVICE_ROLE_KEY` только для Production

Добавить те же секреты в GitHub Secrets для использования в Actions.

Проверить интеграцию: сделать тестовый push в `develop` → убедиться, что Actions запустился и прошёл все три джоба → убедиться, что Vercel создал preview-деплой.

### Критерии готовности

- [ ] Файл `.github/workflows/ci.yml` создан и запушен в репозиторий
- [ ] Actions прогоняет три джоба: lint → type-check → build
- [ ] Пуш в `develop` автоматически запускает Actions — проверить на вкладке Actions в GitHub
- [ ] Все три джоба завершаются с зелёным статусом (✓)
- [ ] Vercel проект создан и подключён к GitHub репозиторию
- [ ] Пуш в `develop` создаёт Preview Deployment в Vercel (URL вида `dtek-core-git-develop-*.vercel.app`)
- [ ] Переменные окружения Supabase добавлены в Vercel для всех нужных окружений
- [ ] GitHub Secrets содержат `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] PR в `develop` показывает статус CI (✓ или ✗) прямо в интерфейсе GitHub

### Зависимости

S01-T002 (проект должен строиться), S01-T003 (компоненты не должны ломать build), S01-T004 (env vars нужны для build)

---

## 16. S01-T011 — CLAUDE.md: контекстный файл проекта

**Приоритет:** P2 | **Оценка:** 2 часа | **Зависит от:** S01-T002

### Описание

Написать корневой файл `CLAUDE.md`, который станет главным контекстным документом для AI-разработки. Когда Claude Code (или другой AI-агент) запустится в директории проекта, `CLAUDE.md` будет первым, что он прочитает. Без этого файла каждый новый контекст требует повторного объяснения структуры проекта.

**Что нужно сделать:**

Создать файл `CLAUDE.md` в корне репозитория. Документ должен содержать следующие разделы:

**Обзор проекта:** DTEK Core — Digital Trust Management Platform (DTMP). Платформа создаёт цифровую модель доверия организации как слой над существующими инструментами безопасности. Четыре неизменяемые сущности: Trust Passport, Trust Score, Trust Graph, Risk Registry.

**Технологический стек:** Next.js 14 (App Router), TypeScript (strict mode), Tailwind CSS, Shadcn/UI, Supabase (Auth + PostgreSQL 15 + Edge Functions), Vercel.

**Структура проекта:** описание каждой директории (`app/`, `components/ui/`, `components/shared/`, `lib/supabase/`, `types/`, `supabase/migrations/`, `supabase/functions/`, `docs/`, `tasks/`) с кратким объяснением назначения.

**Ключевые архитектурные решения (ADR-001–005):**
- ADR-001: Trust Score — взвешенная 6-факторная модель
- ADR-002: Конфигуратор — Фаза 1 (мастер) + Фаза 2 (настройки, MVP = только веса)
- ADR-003: Роли — owner/analyst/admin/viewer
- ADR-004: Cloud-only MVP (Vercel + Supabase Cloud)
- ADR-005: Полная схема БД с RLS для мультитенантности

**Обязательные соглашения:** RLS обязателен для всех новых таблиц; все запросы используют `current_org_id()` и `current_user_role()`; TypeScript strict mode, no `any`; Server Components по умолчанию, Client Components только при необходимости.

**Рабочий процесс разработки:** `develop` ← `feature/<task-id>` ← PR ← code review ← merge. Задачи именуются по формату `S<sprint>-T<num>`.

**Ссылки на документы:** `ARCHITECTURE_DECISIONS.md`, `docs/Database_Design_Full.md`, `docs/User_Stories.md`, `docs/Trust_Score_Model_v2.md`, `docs/Configurator_Concept_Final.md`, `tasks/EPIC_BACKLOG.md`, `tasks/FEATURE_BACKLOG.md`, `tasks/MVP_RELEASE_PLAN.md`.

### Критерии готовности

- [ ] Файл `CLAUDE.md` существует в корне репозитория
- [ ] Раздел "Технологический стек" перечисляет все 6 ключевых технологий
- [ ] Раздел "Структура проекта" описывает не менее 8 директорий
- [ ] Все 5 ADR (ADR-001 до ADR-005) упомянуты с кратким описанием решения
- [ ] Раздел "Обязательные соглашения" содержит правило об RLS
- [ ] Все 8 ключевых документов проекта перечислены со ссылками
- [ ] Файл написан на русском языке (язык проекта)
- [ ] Файл запушен в репозиторий

### Зависимости

S01-T002 (структура проекта должна быть известна для её документирования)

---

## 17. Definition of Done спринта

Sprint 01 считается завершённым, когда выполнены **все** нижеследующие условия:

### Техническая готовность

- [ ] Репозиторий клонируется чистой командой `git clone` и запускается командой `npm install && npm run dev` без дополнительных шагов
- [ ] `npm run type-check` завершается без ошибок TypeScript
- [ ] `npm run build` завершается успешно (zero error build)
- [ ] `npm run lint` завершается без ошибок ESLint

### База данных

- [ ] Все **10 таблиц** присутствуют в Supabase Cloud и соответствуют схеме из `Database_Design_Full.md`
- [ ] RLS включён на всех 10 таблицах
- [ ] Функции `current_org_id()` и `current_user_role()` созданы в БД
- [ ] Триггер автосоздания паспорта (`tr_create_passport`) работает корректно
- [ ] Полная последовательность миграций (001–014) проходит с нуля без ошибок

### CI/CD

- [ ] Push в `develop` запускает GitHub Actions и проходит все три проверки
- [ ] Vercel создаёт Preview Deployment при каждом push в `develop`

### Документация

- [ ] `.env.example` содержит все переменные окружения с описательными комментариями
- [ ] `CLAUDE.md` создан и содержит все обязательные разделы
- [ ] `supabase/README.md` содержит порядок миграций

### Готовность к Sprint 02

Разработчик, начинающий Sprint 02 (Authentication), должен иметь возможность:
- Клонировать репозиторий и запустить проект за 5 минут
- Найти всю необходимую информацию в `CLAUDE.md` без обращения к другим людям
- Начать создавать страницы Auth без каких-либо инфраструктурных блокеров

---

*Документ создан на основе: `tasks/FEATURE_BACKLOG.md` (F-001–F-005), `tasks/MVP_RELEASE_PLAN.md` (Release 0), `tasks/EPIC_BACKLOG.md` (Epic 1 — Foundation), `docs/Database_Design_Full.md`, `ARCHITECTURE_DECISIONS.md`*
