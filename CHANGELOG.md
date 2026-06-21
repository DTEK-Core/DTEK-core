# CHANGELOG — DTEK Core

Все значимые изменения фиксируются в этом документе.  
Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/).

---

## [v0.4.0] — 2026-06-21

### Sprint 04 — Testing, Bug Fixing & Stabilization

#### Исправлено

- **BUG-001** — Выравнивание колонок в таблице объектов
  - `.oth` (button): добавлен `padding: 0` — устраняет смещение от браузерного padding по умолчанию
  - `.otable-row`: добавлены `width: 100%` и `overflow: hidden` — строки всегда одинаковой ширины
  - `.ot-c`: исправлена правостороннее выравнивание через `display: flex; justify-content: flex-end`
  - `.ot-cell`: добавлены `min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis`

- **BUG-002** — Кнопка «Редактировать» в Risk Drawer
  - Добавлен проп `onEdit?: () => void` в `RiskDrawerProps`
  - Кнопка «Редактировать» отображается в footer drawer для owner/analyst
  - Открывает `RiskFormDialog` в режиме редактирования с предзаполненными данными

- **BUG-003** — Медленный UX после действий с рисками
  - `RiskFormDialog`: диалог закрывается до `router.refresh()` — реакция мгновенная
  - `RiskDrawer`: оптимистичное обновление статуса через `optimisticStatus` state

- **BUG-004** — React hydration mismatch в форматировании дат
  - Создан `lib/utils/dates.ts` с фиксированным массивом `MONTHS_SHORT`
  - Устраняет расхождение Node.js ICU («21 июл.») и браузера («21 июля»)
  - Функции `relativeTime()`, `formatSla()`, `fmtDateShort()` вынесены в единый модуль

- **BUG-005** — Краш страницы при ошибке смены статуса риска
  - `changeStatus()` обёрнута в `try/catch` внутри `startTransition`
  - При ошибке: откат `optimisticStatus`, сообщение в footer — без краша

- **BUG-006** — Risk Drawer не закрывался при открытии редактирования
  - `onEdit` теперь вызывает `setSelectedId(null)` и `setEditRisk()` в одном батче

#### Добавлено

- `docs/testing/TEST_STRATEGY.md` — стратегия тестирования
- `docs/testing/TEST_PLAN_SPRINT_01_03.md` — 27 тест-кейсов по 6 модулям
- `docs/testing/BUG_REPORT_TEMPLATE.md` — шаблон отчёта об ошибке
- `docs/testing/TEST_REPORT_SPRINT_01_03.md` — результаты quality gate
- `docs/testing/MANUAL_TESTING_GUIDE.md` — руководство ручного тестирования (20 шагов)
- `tasks/SPRINT_04.md` — документация Sprint 04
- `CHANGELOG.md` — этот файл

---

## [v0.3.0] — 2026-06-20

### Sprint 03 — Digital Asset Management & Trust Risk Registry

#### Добавлено

- **Список объектов** (`/objects`) — таблица и карточки с сортировкой, фильтрацией, поиском
- **Детали объекта** (`/objects/[id]`) — 4 вкладки: факторы Trust Score, риски, связи, история
- **Trust Passport** (`/objects/[id]/passport`) — цифровой паспорт с 6-факторной разбивкой
- **Реестр рисков** (`/risks`) — таблица рисков с фильтрацией по статусу, серьёзности, категории
- **Risk Drawer** — боковая панель с деталями риска, CVSS-оценкой, привязкой к объекту
- **RiskFormDialog** — создание и редактирование рисков (CRUD)
- Shared компоненты: `TrustRing`, `SeverityTag`, `CritTag`, `TrustChip`, `Meter`, `FilterSelect`, `SortCaret`, `Icon`
- Server Actions: `createObject`, `updateObject`, `deleteObject`, `createRisk`, `updateRisk`, `deleteRisk`, `updateRiskStatus`, `linkRiskToObject`

#### Исправлено

- `app/landing.css`: `var(--border)` → `var(--border-subtle)` (4 вхождения) — устраняет невидимые границы

---

## [v0.2.0] — 2026-06-15

### Sprint 02 — Organization Management & Platform Setup

#### Добавлено

- **Лендинг** (`/`) — hero-секция с анимацией Trust Graph, ключевые блоки
- **Управление пользователями** (`/users`) — таблица участников, смена ролей
- **Настройки организации** (`/settings`) — профиль пользователя, настройки организации
- **Онбординг wizard** (`/onboarding/wizard`) — 5-шаговый мастер создания организации
- **Создание организации** (`/onboarding/create`) — форма регистрации первой организации
- **Приглашения** (`/invite/[token]`) — отправка приглашений, принятие по токену, отзыв
- Middleware — защита маршрутов, редирект при отсутствии организации
- 4 роли: `owner`, `analyst`, `admin`, `viewer`

---

## [v0.1.0] — 2026-06-13

### Sprint 01 — Foundation & Authentication

#### Добавлено

- **Аутентификация** — регистрация, вход, выход, сброс пароля
- **Supabase** — настройка Cloud проекта (EU West), 14 миграций БД
- **CI/CD** — GitHub Actions (lint → type-check → build), Vercel деплой
- **App Shell** — layout с навигацией, тёмная тема, CSS-переменные, шрифты
- **TypeScript strict** — конфигурация, псевдоним `@/`, типы БД
- **Базовые страницы**: `/login`, `/register`, `/forgot-password`, `/reset-password`

---

[v0.4.0]: https://github.com/DTEK-Core/DTEK-core/compare/v0.3.0...develop
[v0.3.0]: https://github.com/DTEK-Core/DTEK-core/compare/v0.2.0...v0.3.0
[v0.2.0]: https://github.com/DTEK-Core/DTEK-core/compare/v0.1.0...v0.2.0
[v0.1.0]: https://github.com/DTEK-Core/DTEK-core/releases/tag/v0.1.0
