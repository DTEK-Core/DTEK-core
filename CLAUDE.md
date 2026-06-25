# CLAUDE.md — DTEK Core

> Этот файл читается AI-агентом при каждом запуске в директории проекта.
> Содержит всё необходимое для работы без дополнительных объяснений.

---

## Обзор проекта

**DTEK Core** — Digital Trust Management Platform (DTMP).

Платформа создаёт цифровую модель доверия организации как слой над существующими инструментами безопасности. Помогает CISO и аналитикам ИБ понять реальный уровень киберзащищённости организации через единый показатель — Trust Score.

**Четыре неизменяемые сущности:**
- **Trust Passport** — цифровой паспорт каждого объекта (сервера, приложения, учётной записи и др.)
- **Trust Score** — взвешенная оценка доверия (0–100) по 6 факторам
- **Trust Graph** — граф связей между объектами организации
- **Risk Registry** — реестр рисков с привязкой к объектам

**Целевая аудитория:** CISO, аналитики ИБ, IT-администраторы российских средних и крупных организаций.

---

## Технологический стек

| Слой | Технология | Версия |
|---|---|---|
| Фронтенд | Next.js (App Router) | 15.x |
| Язык | TypeScript (strict mode) | 5.x |
| Стили | Tailwind CSS | 3.x |
| Компоненты | Shadcn/UI (new-york, zinc) | latest |
| Бэкенд / БД | Supabase (PostgreSQL 15 + Auth + Edge Functions) | Cloud |
| Деплой | Vercel | Cloud |

**Шрифты:** Manrope (основной) + JetBrains Mono (код/числа) через `next/font/google`.  
**Тема:** только тёмная. Фон `#07090d`, акцент `#2dd4bf` (teal).

---

## Структура проекта

```
/
├── app/                    — маршруты Next.js App Router (page.tsx, layout.tsx)
├── components/
│   ├── ui/                 — компоненты Shadcn/UI (не редактировать вручную)
│   └── shared/             — переиспользуемые компоненты проекта
├── lib/
│   ├── actions/            — Server Actions (createObject, createRisk, saveFactorWeights...)
│   ├── supabase/           — client.ts, server.ts, admin.ts, service.ts
│   ├── trust/              — calculate.ts, engine.ts (Trust Score логика)
│   ├── security/           — audit.ts (журнал безопасности)
│   ├── validation/         — schemas.ts (Zod-схемы валидации)
│   └── utils/              — cn(), dates.ts, design-tokens.ts
├── types/
│   └── database.ts         — TypeScript-типы схемы БД (регенерировать после миграций)
├── supabase/
│   ├── config.toml         — project_id = "ehqpijmbtavfacqogtoe", PG 15
│   ├── migrations/         — 001–017 SQL-миграции (применены на Cloud)
│   └── functions/          — Edge Functions (Sprint 08+)
├── design/                 — утверждённый дизайн-прототип (HTML + JSX + скриншоты)
├── docs/                   — вся проектная документация
├── tasks/                  — бэклоги, планы, спринты
├── ARCHITECTURE_DECISIONS.md — 5 ADR (приоритет над остальными документами)
└── CLAUDE.md               — этот файл
```

**Supabase project ref:** `ehqpijmbtavfacqogtoe`  
**GitHub repo:** `DTEK-Core/DTEK-core`  
**Vercel:** `kirills-projects-96b721f1/dtek-core`

---

## Ключевые архитектурные решения (ADR-001–005)

Полный текст: [`ARCHITECTURE_DECISIONS.md`](ARCHITECTURE_DECISIONS.md). При конфликте документов ADR имеют приоритет.

### ADR-001 — Модель Trust Score
**Решение:** взвешенная 6-факторная формула `Σ(factor_score × weight) / 100`.  
Веса по умолчанию: vuln 22%, config 18%, access 18%, network 14%, compliance 16%, incident 12%.  
Документ-источник: `docs/architecture/Trust_Score_Model_v2.md` (заменяет устаревший `docs/archive/Trust_Score_Model.md`).

### ADR-002 — Конфигуратор MVP
**Решение:** две фазы. Фаза 1 — онбординговый мастер (wizard при создании орг). Фаза 2 — редактор весов факторов (MVP). Коннекторы и редактор правил — вне MVP.  
Документ-источник: `docs/architecture/Configurator_Concept_Final.md` (заменяет `docs/archive/PRD_Configurator.md`).

### ADR-003 — Роли пользователей
**Решение:** 4 роли — `owner` / `analyst` / `admin` / `viewer`.  
В UI: Владелец / Аналитик ИБ / Администратор / Наблюдатель.  
Приглашение с ролью `owner` запрещено (только при создании организации).

### ADR-004 — Облачная архитектура MVP
**Решение:** Cloud-only. Vercel (Next.js) + Supabase Cloud (EU West / Frankfurt).  
On-premise (Enterprise Runtime) запланирован на v2.0.

### ADR-005 — Полная схема БД
**Решение:** 10 таблиц с типами PostgreSQL, CHECK-ограничениями, индексами и RLS-политиками.  
Документ-источник: `docs/architecture/Database_Design_Full.md` (заменяет устаревший `docs/archive/Database_Design.md`).

---

## Обязательные соглашения

### База данных
- **RLS обязателен для каждой новой таблицы.** `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + политики.
- Все запросы фильтруются через `current_org_id()` и `current_user_role()` (определены в `001_helper_functions.sql`).
- Имена миграций: `NNN_название.sql` (три цифры + underscore). Применение: `SUPABASE_ACCESS_TOKEN=<token> npx supabase db push --include-all`.
- Типы БД регенерировать после миграций: `npx supabase gen types typescript --project-id ehqpijmbtavfacqogtoe > types/database.ts`.

### TypeScript
- Строгий режим (`strict: true`). Запрещено использование `any`.
- Импорты через псевдоним `@/` (корень проекта).
- Server Components по умолчанию. `'use client'` только при необходимости (обработчики событий, хуки).

### Безопасность
- `SUPABASE_SERVICE_ROLE_KEY` обходит RLS — **никогда не использовать на клиенте, никогда не коммитить**.
- `.env.local` в `.gitignore` — не коммитить.

### Дизайн
- Финальный дизайн в папке `design/`. Все UI-решения должны точно соответствовать прототипу.
- Цвета: только тёмная тема. Использовать CSS-переменные из `app/globals.css`.
- Компоненты Shadcn/UI: не модифицировать файлы в `components/ui/` напрямую — обёртывать в `components/shared/`.

### Код
- Комментарии только там, где **почему** неочевидно — не объяснять что делает код.
- Не добавлять обработку ошибок для невозможных сценариев.
- Не создавать абстракции заранее — только по реальной необходимости.

---

## Рабочий процесс разработки

```
main          ← только через PR из develop, после прохождения CI
  └── develop ← основная ветка разработки
        └── feature/<task-id>  ← ветка для каждой задачи
```

**Именование задач:** `S<sprint>-T<num>` (например, `S01-T006`).  
**Именование веток:** `feature/S02-T001-auth-ui`.  
**Прямые коммиты в `main` запрещены** — только PR с прохождением CI.

**CI пайплайн** (`.github/workflows/ci.yml`):  
`lint` → `type-check` → `build` (Node.js 20, кэш npm)

**Команды разработки:**
```bash
npm run dev          # локальный сервер http://localhost:3000
npm run type-check   # проверка TypeScript
npm run build        # сборка для продакшена
npm run lint         # ESLint

# Supabase CLI (нужен SUPABASE_ACCESS_TOKEN)
npx supabase migration list
npx supabase db push --include-all
npx supabase gen types typescript --project-id ehqpijmbtavfacqogtoe > types/database.ts
```

---

## Ключевые документы

| Документ | Назначение |
|---|---|
| [`ARCHITECTURE_DECISIONS.md`](ARCHITECTURE_DECISIONS.md) | 5 ADR — приоритетный источник истины |
| [`DOCUMENTATION_INDEX.md`](DOCUMENTATION_INDEX.md) | Навигационный индекс всей документации |
| [`docs/architecture/Database_Design_Full.md`](docs/architecture/Database_Design_Full.md) | Полная схема БД: 10 таблиц, типы, индексы, RLS |
| [`docs/architecture/Trust_Score_Model_v2.md`](docs/architecture/Trust_Score_Model_v2.md) | Формула и расчёт Trust Score (актуальная версия) |
| [`docs/architecture/Configurator_Concept_Final.md`](docs/architecture/Configurator_Concept_Final.md) | Концепция Конфигуратора MVP (актуальная версия) |
| [`docs/product/User_Stories.md`](docs/product/User_Stories.md) | Пользовательские истории по всем эпикам |
| [`docs/security/SECURITY_OVERVIEW.md`](docs/security/SECURITY_OVERVIEW.md) | Обзор безопасности платформы |
| [`tasks/EPIC_BACKLOG.md`](tasks/EPIC_BACKLOG.md) | Полный список эпиков и задач |
| [`tasks/FEATURE_BACKLOG.md`](tasks/FEATURE_BACKLOG.md) | Детальный беклог фич |
| [`tasks/MVP_RELEASE_PLAN.md`](tasks/MVP_RELEASE_PLAN.md) | План релиза MVP по спринтам |
