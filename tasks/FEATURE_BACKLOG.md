# FEATURE BACKLOG — DTEK Core MVP

`Проект: DTEK Core`
`Версия: 1.0`
`Дата: 09.06.2026`
`Статус: Утверждён`

---

## Содержание

1. [Соглашения](#1-соглашения)
2. [Сводная таблица Features](#2-сводная-таблица-features)
3. [Epic 1 — Foundation](#3-epic-1--foundation)
4. [Epic 2 — Authentication](#4-epic-2--authentication)
5. [Epic 3 — Organizations](#5-epic-3--organizations)
6. [Epic 4 — User Management](#6-epic-4--user-management)
7. [Epic 5 — Object Management](#7-epic-5--object-management)
8. [Epic 6 — Trust Passport](#8-epic-6--trust-passport)
9. [Epic 7 — Risk Registry](#9-epic-7--risk-registry)
10. [Epic 8 — Trust Score Engine](#10-epic-8--trust-score-engine)
11. [Epic 9 — Trust Graph](#11-epic-9--trust-graph)
12. [Epic 10 — Dashboard](#12-epic-10--dashboard)
13. [Epic 11 — Configurator](#13-epic-11--configurator)

---

## 1. Соглашения

### Приоритет

| Уровень | Значение |
|---|---|
| **P1** | Критический. Feature на критическом пути Epic; без неё Epic не завершён |
| **P2** | Важный. Epic может быть отгружен без неё, но это нежелательно |
| **P3** | Желательный. Может быть отложено без ущерба для ядра |

### Сложность

| Размер | Оценка | Описание |
|---|---|---|
| **S** | ~0.5 дня | Простая задача, минимальное число компонентов |
| **M** | 1–2 дня | Несколько экранов или логических блоков |
| **L** | 3–4 дня | Многокомпонентная логика, нетривиальный алгоритм или внешняя интеграция |

### Зависимости

- `F-NNN` — зависимость внутри того же Epic
- `F-NNN (Epic N)` — зависимость от фичи из другого Epic
- `—` — нет зависимостей

> **Примечание о кросс-Epic зависимостях:** Ряд фич (F-026, F-027, F-031, F-033) частично реализуется в своём Epic с заглушками/нулевыми значениями, а полные данные становятся доступны после завершения Epic 8 (Trust Score Engine). Это отражено в их зависимостях.

---

## 2. Сводная таблица Features

| ID | Epic | Feature | Приоритет | Размер | Зависит от |
|---|---|---|---|---|---|
| F-001 | Foundation | Git & Project Setup | P1 | S | — |
| F-002 | Foundation | UI Framework Setup | P1 | S | F-001 |
| F-003 | Foundation | Supabase DB Schema & Migrations | P1 | L | F-001 |
| F-004 | Foundation | CI/CD Pipeline | P2 | M | F-001, F-002 |
| F-005 | Foundation | CLAUDE.md | P2 | S | F-001 |
| F-006 | Authentication | Register Flow | P1 | M | F-003 (E1) |
| F-007 | Authentication | Login & Session Management | P1 | S | F-006 |
| F-008 | Authentication | Password Reset | P2 | S | F-006 |
| F-009 | Authentication | Auth Middleware & Route Guards | P1 | M | F-007 |
| F-010 | Organizations | Organization Creation | P1 | S | F-009 (E2) |
| F-011 | Organizations | Onboarding Wizard | P1 | L | F-010 |
| F-012 | Organizations | Organization Profile | P2 | S | F-010 |
| F-013 | Organizations | Multi-org Switcher | P2 | M | F-010 |
| F-014 | User Management | Users List Screen | P1 | S | F-010 (E3) |
| F-015 | User Management | Invite & Accept Flow | P1 | M | F-014 |
| F-016 | User Management | Role Management | P1 | S | F-015 |
| F-017 | User Management | Block & Remove Users | P2 | S | F-016 |
| F-018 | User Management | RBAC Enforcement | P1 | M | F-016 |
| F-019 | Object Management | Objects List Screen | P1 | M | F-018 (E4) |
| F-020 | Object Management | Object CRUD | P1 | M | F-019 |
| F-021 | Object Management | Object Detail Screen | P1 | L | F-020 |
| F-022 | Object Management | Object Type System & Archive | P2 | S | F-020 |
| F-023 | Object Management | Object RBAC Enforcement | P1 | S | F-018 (E4), F-020 |
| F-024 | Trust Passport | Passport Screen Layout | P1 | M | F-021 (E5) |
| F-025 | Trust Passport | Trust Ring Component | P1 | S | F-024 |
| F-026 | Trust Passport | Factor Breakdown Section | P1 | M | F-024, F-036 (E8) |
| F-027 | Trust Passport | Change History Section | P2 | S | F-024, F-038 (E8) |
| F-028 | Trust Passport | PDF Export | P3 | L | F-024 |
| F-029 | Risk Registry | Risk Registry Screen | P1 | M | F-021 (E5) |
| F-030 | Risk Registry | Risk CRUD | P1 | M | F-029 |
| F-031 | Risk Registry | Risk-Object Linking | P1 | M | F-030, F-037 (E8) |
| F-032 | Risk Registry | Risk Status Flow | P1 | S | F-030 |
| F-033 | Risk Registry | Risk Drawer | P2 | M | F-032, F-036 (E8) |
| F-034 | Risk Registry | SLA Tracking | P2 | S | F-030 |
| F-035 | Risk Registry | CSV Export | P3 | S | F-029 |
| F-036 | Trust Score Engine | Score Calculation Engine | P1 | L | F-026 (E6), F-031 (E7) |
| F-037 | Trust Score Engine | Recalculation Triggers | P1 | M | F-036 |
| F-038 | Trust Score Engine | Score History Storage | P1 | S | F-037 |
| F-039 | Trust Score Engine | Org Trust Index | P1 | S | F-037 |
| F-040 | Trust Score Engine | Score Trend Chart | P2 | M | F-038 |
| F-041 | Trust Graph | Graph Library & Rendering Engine | P1 | L | F-023 (E5) |
| F-042 | Trust Graph | Node Styling & Layout | P1 | M | F-041 |
| F-043 | Trust Graph | Relation Management UI | P1 | M | F-041, F-021 (E5) |
| F-044 | Trust Graph | Node Detail Panel | P2 | M | F-042, F-025 (E6) |
| F-045 | Trust Graph | Graph Filters & Legend | P2 | S | F-042 |
| F-046 | Dashboard | Dashboard Layout & KPI Cards | P1 | M | F-039 (E8) |
| F-047 | Dashboard | Org Trust Ring & Trend Chart | P1 | M | F-046, F-040 (E8) |
| F-048 | Dashboard | Top Risky Objects | P2 | S | F-046 |
| F-049 | Dashboard | Event Feed with Realtime | P2 | M | F-046, F-038 (E8) |
| F-050 | Dashboard | Trust Distribution Chart | P2 | S | F-046 |
| F-051 | Configurator | Weights Editor Screen | P1 | M | F-013 (E3) |
| F-052 | Configurator | Weights Validation & Save | P1 | S | F-051, F-037 (E8) |
| F-053 | Configurator | Mass Recalculation & Notification | P1 | M | F-052, F-037 (E8) |

**Итого: 53 features** | P1: 35 · P2: 16 · P3: 2 | S: 23 · M: 24 · L: 6

---

## Evidence-first Market MVP Feature Backlog После Sprint 08

Этот раздел дополняет исходный MVP backlog и соответствует Sprint 09–15 после ADR-007.

| ID | Sprint | Feature | Приоритет | Размер |
|---|---|---|---|---|
| M-001 | S09 | Demo Narrative | P1 | M |
| M-002 | S09 | Demo Dataset Specification | P1 | M |
| M-003 | S09 | Demo Seed Plan | P1 | M |
| M-004 | S09 | ICP & Interview Script | P1 | S |
| M-005 | S09 | Product One-Pager | P1 | S |
| M-006 | S09 | Pilot Offer | P1 | S |
| M-010 | S10 | Trust Passport PDF Export | P1 | L |
| M-011 | S10 | Risk Registry CSV Export | P1 | M |
| M-012 | S10 | Executive Organization Report | P1 | L |
| M-013 | S10 | Report RBAC & Audit | P1 | M |
| M-020 | S11 | Evidence Import Schema Specification | P1 | M |
| M-021 | S11 | Objects CSV/XLSX Import | P1 | L |
| M-022 | S11 | Risks CSV/XLSX Import | P1 | L |
| M-023 | S11 | Import Preview, Validation & Source Metadata | P1 | M |
| M-024 | S11 | Import Templates | P1 | S |
| M-025 | S11 | Import Audit Events | P1 | S |
| M-026 | S11 | Import Documentation | P1 | S |
| M-027 | S11 | Data Onboarding Smoke Test | P1 | S |
| M-030 | S12 | Evidence-backed Trust Score Top Drivers | P1 | M |
| M-031 | S12 | Factor Reason Cards With Sources | P1 | M |
| M-032 | S12 | Risk Impact Hint | P1 | M |
| M-033 | S12 | Score Delta Explanation With Evidence Timeline | P2 | M |
| M-040 | S13 | Risk Owner & Assignment | P1 | M |
| M-041 | S13 | Due Date & SLA Warnings | P1 | M |
| M-042 | S13 | Risk Comments | P1 | M |
| M-043 | S13 | Manual/Imported/Auto Risk Evidence UI | P1 | M |
| M-044 | S13 | Risk Activity Timeline | P2 | M |
| M-050 | S14 | Pilot Readiness Checklist | P1 | S |
| M-051 | S14 | Environment Health Check | P1 | M |
| M-052 | S14 | Invitation Delivery Finalization | P1 | M |
| M-053 | S14 | Smoke Test Automation Baseline | P1 | M |
| M-054 | S14 | Backup & Restore Runbook | P1 | S |
| M-055 | S14 | Pilot Metrics & Feedback Loop | P1 | S |
| M-060 | S15 | Connector Framework Architecture Decision | P1 | M |
| M-061 | S15 | Evidence Layer Data Model Specification | P1 | L |
| M-062 | S15 | Normalization & Identity Resolution Specification | P1 | M |
| M-063 | S15 | Discovery Inbox UX Specification | P1 | M |
| M-064 | S15 | Connector Shortlist & First-source Selection Report | P1 | S |
| M-065 | S15 | Connector Security Model | P1 | M |

---

## 3. Epic 1 — Foundation

| ID | Feature | Приоритет | Размер | Зависит от |
|---|---|---|---|---|
| F-001 | Git & Project Setup | P1 | S | — |
| F-002 | UI Framework Setup | P1 | S | F-001 |
| F-003 | Supabase DB Schema & Migrations | P1 | L | F-001 |
| F-004 | CI/CD Pipeline | P2 | M | F-001, F-002 |
| F-005 | CLAUDE.md | P2 | S | F-001 |

---

### F-001 — Git & Project Setup
**Приоритет:** P1 | **Размер:** S | **Зависит от:** —

Инициализация репозитория GitHub, создание веток `main` и `develop`, настройка `.gitignore`. Инициализация проекта Next.js 14 с App Router, TypeScript strict mode, ESLint. Создание базовой структуры папок: `app/`, `components/`, `lib/`, `types/`, `supabase/`. Настройка `.env.local` и `.env.example`.

---

### F-002 — UI Framework Setup
**Приоритет:** P1 | **Размер:** S | **Зависит от:** F-001

Установка и настройка Tailwind CSS. Инициализация Shadcn/UI с базовыми компонентами (Button, Input, Dialog, Table, Card, Tabs). Создание глобальных CSS-переменных и цветовой темы.

---

### F-003 — Supabase DB Schema & Migrations
**Приоритет:** P1 | **Размер:** L | **Зависит от:** F-001

Создание проекта Supabase Cloud. Написание и применение миграций для всех 10 таблиц согласно `Database_Design_Full.md`: профили, организации, объекты, паспорта, риски, связи между объектами, связи рисков с объектами, история Trust Score, конфигурация весов, приглашения. Создание RLS-политик и вспомогательных функций `current_org_id()` / `current_user_role()`. Индексы и ограничения (включая `weights_sum_100`).

---

### F-004 — CI/CD Pipeline
**Приоритет:** P2 | **Размер:** M | **Зависит от:** F-001, F-002

Настройка GitHub Actions: шаги lint → type-check → build → deploy to Vercel. Деплой на Vercel при push в `develop`. Настройка preview-окружений для Pull Requests. Хранение секретов в GitHub Secrets.

---

### F-005 — CLAUDE.md
**Приоритет:** P2 | **Размер:** S | **Зависит от:** F-001

Создание корневого файла `CLAUDE.md` с контекстом проекта для AI-разработки: стек, структура проекта, ссылки на ключевые документы (ADR, схема БД, User Stories), ограничения и принципы.

---

## 4. Epic 2 — Authentication

| ID | Feature | Приоритет | Размер | Зависит от |
|---|---|---|---|---|
| F-006 | Register Flow | P1 | M | F-003 (E1) |
| F-007 | Login & Session Management | P1 | S | F-006 |
| F-008 | Password Reset | P2 | S | F-006 |
| F-009 | Auth Middleware & Route Guards | P1 | M | F-007 |

---

### F-006 — Register Flow
**Приоритет:** P1 | **Размер:** M | **Зависит от:** F-003 (Foundation)

Страница `/register` с формой (имя, фамилия, email, пароль). Валидация полей (пароль ≥ 8 символов, корректный email). Отправка письма подтверждения через Supabase Auth. Блокировка входа до подтверждения email. Обработка дублирующегося email. После подтверждения — создание записи в `profiles`, редирект на создание организации. Публичная лендинг-страница с CTA-кнопками.

---

### F-007 — Login & Session Management
**Приоритет:** P1 | **Размер:** S | **Зависит от:** F-006

Страница `/login` с формой (email, пароль). JWT-сессия через Supabase Auth. Редирект на Dashboard при успехе. Опция "Запомнить меня" для persistent-сессии. Корректные сообщения об ошибках без раскрытия, что именно неверно.

---

### F-008 — Password Reset
**Приоритет:** P2 | **Размер:** S | **Зависит от:** F-006

Ссылка "Забыли пароль?" на странице входа. Форма ввода email → письмо со ссылкой. Ссылка действительна 1 час. Страница с формой нового пароля (с подтверждением). После сброса — редирект на `/login`. Сообщение об ошибке не раскрывает факт существования аккаунта.

---

### F-009 — Auth Middleware & Route Guards
**Приоритет:** P1 | **Размер:** M | **Зависит от:** F-007

Next.js Middleware: защита всех `/app/*` маршрутов, редирект неавторизованных на `/login`. Client-side хук `useUser()` для защиты компонентов. Кнопка выхода в меню профиля с аннулированием refresh token. Сообщение о заблокированном аккаунте.

---

## 5. Epic 3 — Organizations

| ID | Feature | Приоритет | Размер | Зависит от |
|---|---|---|---|---|
| F-010 | Organization Creation | P1 | S | F-009 (E2) |
| F-011 | Onboarding Wizard | P1 | L | F-010 |
| F-012 | Organization Profile | P2 | S | F-010 |
| F-013 | Multi-org Switcher | P2 | M | F-010 |

---

### F-010 — Organization Creation
**Приоритет:** P1 | **Размер:** S | **Зависит от:** F-009 (Authentication)

Экран создания организации при первом входе. Форма: полное название, краткое название, отрасль (из справочника), ИНН, регион. После создания: автоматическое назначение роли `owner`, создание записи `trust_factor_config` с весами по умолчанию (22/18/18/14/16/12), создание центрального узла организации в графе. React Context для хранения активной организации.

---

### F-011 — Onboarding Wizard
**Приоритет:** P1 | **Размер:** L | **Зависит от:** F-010

5-шаговый мастер согласно `Configurator_Concept_Final.md`:
- Шаг 1: Профиль организации (данные уже введены — отображение с возможностью дополнить)
- Шаг 2: Инфраструктурный профиль (чекбоксы категорий объектов)
- Шаг 3: Масштаб (количество объектов по категориям)
- Шаг 4: Предпросмотр (что будет создано автоматически)
- Шаг 5: Активация (подтверждение, создание структуры)

Кнопка "Назад" на каждом шаге. Шаги 2–4 можно пропустить. После завершения — мастер не запускается повторно. Редирект на Dashboard.

---

### F-012 — Organization Profile
**Приоритет:** P2 | **Размер:** S | **Зависит от:** F-010

Страница профиля организации: все поля + индекс доверия + статистика (объектов, участников, рисков). Форма редактирования доступна только Владельцу. Обновления видны другим участникам без перезагрузки.

---

### F-013 — Multi-org Switcher
**Приоритет:** P2 | **Размер:** M | **Зависит от:** F-010

Компонент переключения организаций в навигации. Список организаций пользователя: название, роль, индекс доверия. Переключение без повторной авторизации. Обновление Organization Context при смене. Активная организация визуально выделена.

---

## 6. Epic 4 — User Management

| ID | Feature | Приоритет | Размер | Зависит от |
|---|---|---|---|---|
| F-014 | Users List Screen | P1 | S | F-010 (E3) |
| F-015 | Invite & Accept Flow | P1 | M | F-014 |
| F-016 | Role Management | P1 | S | F-015 |
| F-017 | Block & Remove Users | P2 | S | F-016 |
| F-018 | RBAC Enforcement | P1 | M | F-016 |

---

### F-014 — Users List Screen
**Приоритет:** P1 | **Размер:** S | **Зависит от:** F-010 (Organizations)

Страница участников организации (доступна только Владельцу). Таблица: имя, email, роль, команда, статус (active/invited/blocked), последняя активность. Сортировка по имени, роли, статусу. Визуальное выделение приглашённых и заблокированных.

---

### F-015 — Invite & Accept Flow
**Приоритет:** P1 | **Размер:** M | **Зависит от:** F-014

Форма приглашения: email + роль (analyst/admin/viewer). Запись в таблицу `invitations`. Отправка письма с токеном. Статус "Приглашён" в списке участников. Страница `/invite?token=...`: предложение регистрации или входа. Принятие приглашения — добавление в `profiles` с указанной ролью. Обработка истёкшего приглашения (7 дней). Запрет на приглашение с ролью `owner`.

---

### F-016 — Role Management
**Приоритет:** P1 | **Размер:** S | **Зависит от:** F-015

Изменение роли участника через выпадающий список в таблице. Защита: нельзя снять роль `owner` с последнего Владельца. Нельзя повысить до Владельца через этот интерфейс. Изменение применяется немедленно.

---

### F-017 — Block & Remove Users
**Приоритет:** P2 | **Размер:** S | **Зависит от:** F-016

Блокировка: аннулирование активных сессий, запрет входа. Удаление: объекты и риски пользователя сохраняются (owner_id = NULL). Оба действия требуют подтверждения. Владелец не может заблокировать себя. Нельзя удалить последнего Владельца.

---

### F-018 — RBAC Enforcement
**Приоритет:** P1 | **Размер:** M | **Зависит от:** F-016

Server-side RBAC-middleware для всех защищённых операций. Хелпер `requireRole(roles[])` для Server Actions и API Routes. Матрица доступа согласно ADR-003. Supabase RLS через `current_user_role()`. Клиентская сторона: скрытие недоступных UI-элементов. Ошибка 403 при попытке обойти ограничения через API.

---

## 7. Epic 5 — Object Management

| ID | Feature | Приоритет | Размер | Зависит от |
|---|---|---|---|---|
| F-019 | Objects List Screen | P1 | M | F-018 (E4) |
| F-020 | Object CRUD | P1 | M | F-019 |
| F-021 | Object Detail Screen | P1 | L | F-020 |
| F-022 | Object Type System & Archive | P2 | S | F-020 |
| F-023 | Object RBAC Enforcement | P1 | S | F-018 (E4), F-020 |

---

### F-019 — Objects List Screen
**Приоритет:** P1 | **Размер:** M | **Зависит от:** F-018 (User Management)

Страница со списком объектов. Таблица: название, тип (с иконкой), сегмент, критичность, количество рисков, Trust Score (с цветовым индикатором), время обновления. Карточный вид (переключатель). Фильтрация по типу объекта и уровню доверия. Поиск по названию и ID. Сортировка по Trust Score и количеству рисков.

---

### F-020 — Object CRUD
**Приоритет:** P1 | **Размер:** M | **Зависит от:** F-019

Форма создания: название (обяз.), тип (обяз.), описание, владелец, критичность, IP-адрес, платформа, сегмент, экспозиция. Автоматическое создание записи `trust_passports` при сохранении (DB trigger или Server Action). Форма редактирования — все поля кроме ID и даты создания. Удаление с подтверждением: каскадное удаление паспорта, связей, истории Trust Score; записи `object_risks` удаляются, сами риски нет.

---

### F-021 — Object Detail Screen
**Приоритет:** P1 | **Размер:** L | **Зависит от:** F-020

Экран деталей объекта с 5 вкладками:
- **Обзор:** Trust Ring, ключевые метрики, краткий список рисков, связанные объекты
- **Факторы доверия:** 6 факторов с прогрессбарами, весами, оценками
- **Риски:** список рисков объекта с критичностью и статусом
- **Связи:** список связанных объектов с Trust Score
- **История:** хронологическая лента изменений

Переход из списка объектов, паспорта, графа.

---

### F-022 — Object Type System & Archive
**Приоритет:** P2 | **Размер:** S | **Зависит от:** F-020

Иконки и цветовые метки для 11 типов объектов (server, workstation, laptop, network, database, application, cloud, identity, contractor, ot, physical). Действие "Архивировать" на экране объекта. Архивированные объекты скрыты по умолчанию (фильтр). Разархивирование доступно. Архивированный объект не участвует в расчёте орг. индекса.

---

### F-023 — Object RBAC Enforcement
**Приоритет:** P1 | **Размер:** S | **Зависит от:** F-018 (User Management), F-020

Server-side проверка: Администратор (`admin`) может создавать только инфраструктурные типы (server, workstation, laptop, network, ot). Попытка создать другой тип — ошибка 403. Клиентская сторона: недоступные типы скрыты в форме создания для роли `admin`. Аналитик ИБ — все типы без ограничений.

---

## 8. Epic 6 — Trust Passport

| ID | Feature | Приоритет | Размер | Зависит от |
|---|---|---|---|---|
| F-024 | Passport Screen Layout | P1 | M | F-021 (E5) |
| F-025 | Trust Ring Component | P1 | S | F-024 |
| F-026 | Factor Breakdown Section | P1 | M | F-024, F-036 (E8) |
| F-027 | Change History Section | P2 | S | F-024, F-038 (E8) |
| F-028 | PDF Export | P3 | L | F-024 |

---

### F-024 — Passport Screen Layout
**Приоритет:** P1 | **Размер:** M | **Зависит от:** F-021 (Object Management)

Полный экран паспорта согласно дизайн-прототипу. Заголовок: название, ID, тип, теги критичности/сегмента/экспозиции. Блок краткой статистики: изменение за 30 дней, открытые риски, связи, полнота. Раздел рисков объекта с критичностью и SLA. Блок реквизитов: IP, платформа, сегмент, экспозиция, владелец. "Печать подтверждения" с датой расчёта. На этапе Epic 6 — структура с заглушками, реальные данные факторов появляются после F-036.

---

### F-025 — Trust Ring Component
**Приоритет:** P1 | **Размер:** S | **Зависит от:** F-024

Переиспользуемый компонент кольцевого индикатора Trust Score. Числовое значение (0–100), цветовая индикация по уровню доверия (5 цветов: зелёный/синий/жёлтый/оранжевый/красный). Анимация при появлении. Версии разных размеров (для паспорта, боковой панели, дашборда). Цветовая схема соответствует уровням: High/Good/Medium/Low/Critical.

---

### F-026 — Factor Breakdown Section
**Приоритет:** P1 | **Размер:** M | **Зависит от:** F-024, F-036 (Trust Score Engine)

Секция с 6 факторами Trust Score в паспорте. Для каждого фактора: название, вес (%), текущая оценка, прогрессбар, вклад в итоговый Score, описание. Цвет прогрессбара соответствует уровню. Составная полоса (Composite Bar): визуализация итогового Trust Score как суммы вкладов всех факторов. Данные берутся из `trust_passports` (поля vuln_score, config_score и др.) — заполняются Engine в F-036.

---

### F-027 — Change History Section
**Приоритет:** P2 | **Размер:** S | **Зависит от:** F-024, F-038 (Trust Score Engine)

Лента изменений Trust Score в хронологическом порядке (новые первые). Для каждой записи: дата, событие, изменение Score (старое → новое, дельта со знаком). Причина изменения в читаемом виде (из поля `reason` в `trust_score_history`). Данные появляются после реализации F-038.

---

### F-028 — PDF Export
**Приоритет:** P3 | **Размер:** L | **Зависит от:** F-024

Кнопка "Экспорт PDF" на экране паспорта. Генерация PDF через Supabase Edge Function (react-pdf или puppeteer). PDF содержит: все блоки паспорта, логотип, название платформы, дату и время генерации. Файл скачивается по нажатию кнопки.

---

## 9. Epic 7 — Risk Registry

| ID | Feature | Приоритет | Размер | Зависит от |
|---|---|---|---|---|
| F-029 | Risk Registry Screen | P1 | M | F-021 (E5) |
| F-030 | Risk CRUD | P1 | M | F-029 |
| F-031 | Risk-Object Linking | P1 | M | F-030, F-037 (E8) |
| F-032 | Risk Status Flow | P1 | S | F-030 |
| F-033 | Risk Drawer | P2 | M | F-032, F-036 (E8) |
| F-034 | SLA Tracking | P2 | S | F-030 |
| F-035 | CSV Export | P3 | S | F-029 |

---

### F-029 — Risk Registry Screen
**Приоритет:** P1 | **Размер:** M | **Зависит от:** F-021 (Object Management)

Страница реестра рисков. Таблица: название, привязанный объект, категория, статус, SLA, оценка (severity). Счётчики-фильтры по критичности (Критические / Высокие / Средние / Низкие), кликабельны. Фильтрация по критичности и статусу. Поиск по названию, объекту, ID. Сортировка по убыванию оценки по умолчанию.

---

### F-030 — Risk CRUD
**Приоритет:** P1 | **Размер:** M | **Зависит от:** F-029

Форма создания риска: название (обяз.), описание, категория (из 11 значений), критичность (обяз.), вероятность, влияние, ответственный, SLA. CVSS-оценка. Привязка к объекту при создании (опционально). Администратор не имеет права создавать риски (проверка на сервере). Форма редактирования — все поля. История изменений фиксируется.

---

### F-031 — Risk-Object Linking
**Приоритет:** P1 | **Размер:** M | **Зависит от:** F-030, F-037 (Trust Score Engine)

Multiselect-привязка риска к объектам из формы создания и из деталей риска. Запись в `object_risks`. Один риск → несколько объектов. Отображение рисков на странице объекта (вкладка "Риски"). Отвязывание риска. Пересчёт Trust Score при привязке/отвязке — через триггер F-037. До реализации F-037: базовая привязка без автоматического пересчёта.

---

### F-032 — Risk Status Flow
**Приоритет:** P1 | **Размер:** S | **Зависит от:** F-030

Переходы между статусами: `open` → `in_progress` → `mitigated` / `accepted` / `closed`. Смена статуса из таблицы реестра и из боковой панели. Риски в статусе `mitigated`, `accepted`, `closed` не влияют на Trust Score. Пересчёт Trust Score при изменении статуса (через F-037). SLA-таймер останавливается при закрытии риска.

---

### F-033 — Risk Drawer
**Приоритет:** P2 | **Размер:** M | **Зависит от:** F-032, F-036 (Trust Score Engine)

Боковая панель (drawer) с деталями риска при клике на строку. Содержание: оценка риска (шкала), категория, статус, владелец, возраст, SLA, влияние на Trust Score. Влияние: "устранение повысит доверие объекта на ~N пунктов" — из расчёта F-036. Список рекомендуемых действий. Кнопки быстрого действия: "Взять в работу", "Принять риск".

---

### F-034 — SLA Tracking
**Приоритет:** P2 | **Размер:** S | **Зависит от:** F-030

Расчёт `due_date` на основе `sla_days` и даты создания риска. Отображение дедлайна в таблице и деталях. Цветовая индикация: красный (просрочен), жёлтый (менее 3 дней), зелёный (в срок). Значок просрочки в списке объектов и паспорте.

---

### F-035 — CSV Export
**Приоритет:** P3 | **Размер:** S | **Зависит от:** F-029

Кнопка "Экспорт CSV" на странице реестра рисков. Экспорт применённых фильтров (только отфильтрованные записи). В CSV: все поля риска включая категорию, статус, CVSS, SLA, привязанные объекты.

---

## 10. Epic 8 — Trust Score Engine

| ID | Feature | Приоритет | Размер | Зависит от |
|---|---|---|---|---|
| F-036 | Score Calculation Engine | P1 | L | F-026 (E6), F-031 (E7) |
| F-037 | Recalculation Triggers | P1 | M | F-036 |
| F-038 | Score History Storage | P1 | S | F-037 |
| F-039 | Org Trust Index | P1 | S | F-037 |
| F-040 | Score Trend Chart | P2 | M | F-038 |

---

### F-036 — Score Calculation Engine
**Приоритет:** P1 | **Размер:** L | **Зависит от:** F-026 (Trust Passport), F-031 (Risk Registry)

Supabase Edge Function реализующая формулу из `Trust_Score_Model_v2.md`:
- Базовые значения по критичности: Low=80, Med=75, High=70, Critical=65
- Штрафы по рискам: Low=-5, Med=-15, High=-25, Crit=-40, применяются к соответствующему фактору по категории риска
- Бонус за полноту паспорта: ≥80% → +10, ≥95% → +20 к фактору `compliance`
- Итог: `Trust Score = Σ(factor_score_i × weight_i) / 100`
- Запись результатов в `trust_passports` (6 факторных полей + trust_score + trust_level)

---

### F-037 — Recalculation Triggers
**Приоритет:** P1 | **Размер:** M | **Зависит от:** F-036

PostgreSQL DB Triggers на таблицах `objects`, `risks`, `object_risks`, `trust_factor_config` → `pg_notify` → Edge Function пересчёта. Пересчёт при: изменении критичности объекта, привязке/отвязке риска, изменении критичности риска, смене статуса риска, изменении весов в `trust_factor_config`. Риски в статусе `mitigated/accepted/closed` исключаются из расчёта.

---

### F-038 — Score History Storage
**Приоритет:** P1 | **Размер:** S | **Зависит от:** F-037

После каждого пересчёта: запись в `trust_score_history` (object_id, organization_id, old_score, new_score, factors_snapshot в JSON, reason, changed_by). API-endpoint для получения истории объекта за период. История поставляет данные для F-027 (паспорт), F-040 (тренд-чарт), F-049 (лента событий).

---

### F-039 — Org Trust Index
**Приоритет:** P1 | **Размер:** S | **Зависит от:** F-037

Расчёт агрегированного индекса доверия организации: взвешенное среднее Trust Score объектов с учётом критичности (Critical=4, High=3, Medium=2, Low=1). Архивированные объекты исключаются. Запись результата в `organizations.trust_score` и `organizations.trust_level`. Пересчёт при любом изменении Trust Score отдельного объекта.

---

### F-040 — Score Trend Chart
**Приоритет:** P2 | **Размер:** M | **Зависит от:** F-038

Линейный график динамики Trust Score объекта на экране деталей (вкладка "Обзор"). Выбор периода: 30 / 90 / 365 дней. Данные из `trust_score_history`. Ключевые события на графике (тултипы с причиной изменения). Используется также на Dashboard (F-047) для орг. индекса.

---

## 11. Epic 9 — Trust Graph

| ID | Feature | Приоритет | Размер | Зависит от |
|---|---|---|---|---|
| F-041 | Graph Library & Rendering Engine | P1 | L | F-023 (E5) |
| F-042 | Node Styling & Layout | P1 | M | F-041 |
| F-043 | Relation Management UI | P1 | M | F-041, F-021 (E5) |
| F-044 | Node Detail Panel | P2 | M | F-042, F-025 (E6) |
| F-045 | Graph Filters & Legend | P2 | S | F-042 |

---

### F-041 — Graph Library & Rendering Engine
**Приоритет:** P1 | **Размер:** L | **Зависит от:** F-023 (Object Management)

Выбор и интеграция библиотеки (React Flow приоритет, альтернатива — sigma.js / d3-force). Force-directed layout. Загрузка объектов организации как узлов. Загрузка связей из таблицы `relations` как рёбер. Zoom (колесо мыши), pan, drag-n-drop узлов. Центральный узел организации визуально выделен. Производительность: исследование на 100+ объектах, решение по кластеризации если нужно.

---

### F-042 — Node Styling & Layout
**Приоритет:** P1 | **Размер:** M | **Зависит от:** F-041

Цвет узла по уровню доверия: 5 цветов (зелёный/синий/жёлтый/оранжевый/красный). Размер узла по критичности объекта. Иконка типа объекта внутри узла. Подпись: название объекта. Стиль рёбер с типами связей. Визуальное выделение выбранного узла.

---

### F-043 — Relation Management UI
**Приоритет:** P1 | **Размер:** M | **Зависит от:** F-041, F-021 (Object Management)

Диалог создания связи: выбор исходного объекта, типа (6 вариантов: использует/зависит от/подключён к/управляется/владеет/взаимодействует), целевого объекта. Запрет самосвязи и дублей (проверяется через UNIQUE constraint). Новая связь мгновенно появляется на графе. Удаление связи через контекстное меню ребра. Подтверждение удаления. Обновление счётчика связей объектов.

---

### F-044 — Node Detail Panel
**Приоритет:** P2 | **Размер:** M | **Зависит от:** F-042, F-025 (Trust Passport)

Боковая панель при клике на узел. Содержание: Trust Ring компонент (F-025), тип объекта, сегмент, критичность, количество рисков и связей. Кнопки: "Паспорт доверия" → переход на F-024, "Детали объекта" → переход на F-021. Закрытие панели при клике на пустое место.

---

### F-045 — Graph Filters & Legend
**Приоритет:** P2 | **Размер:** S | **Зависит от:** F-042

Панель фильтров по типу объекта: выделение узлов выбранных типов, приглушение остальных. Множественный выбор типов. Сброс фильтра в одно нажатие. Легенда уровней доверия (5 цветов). Подсказки управления (drag, zoom, click).

---

## 12. Epic 10 — Dashboard

| ID | Feature | Приоритет | Размер | Зависит от |
|---|---|---|---|---|
| F-046 | Dashboard Layout & KPI Cards | P1 | M | F-039 (E8) |
| F-047 | Org Trust Ring & Trend Chart | P1 | M | F-046, F-040 (E8) |
| F-048 | Top Risky Objects | P2 | S | F-046 |
| F-049 | Event Feed with Realtime | P2 | M | F-046, F-038 (E8) |
| F-050 | Trust Distribution Chart | P2 | S | F-046 |

---

### F-046 — Dashboard Layout & KPI Cards
**Приоритет:** P1 | **Размер:** M | **Зависит от:** F-039 (Trust Score Engine)

Двухколонная адаптивная сетка Dashboard. 4 KPI-карточки: объектов в модели, под мониторингом (%), открытых рисков, критических рисков. Каждая карточка: значение, динамика за период (дельта), клик → переход в соответствующий раздел. Скелетоны для всех блоков при загрузке. Навигационные кнопки: к Графу, к Объектам, к Рискам.

---

### F-047 — Org Trust Ring & Trend Chart
**Приоритет:** P1 | **Размер:** M | **Зависит от:** F-046, F-040 (Trust Score Engine)

Главный Trust Ring с индексом организации, уровнем (High/Good/Medium/Low/Critical) и динамикой за 30 дней. Пояснение что снижает индекс. Линейный тренд-чарт (переиспользует логику F-040) с выбором периода 30/90/365 дней. Данные из `organizations.trust_score` и `trust_score_history`.

---

### F-048 — Top Risky Objects
**Приоритет:** P2 | **Размер:** S | **Зависит от:** F-046

Список 5 объектов с наименьшим Trust Score. Для каждого: название, тип, критичность, количество рисков, Trust Score с цветом уровня. Клик по объекту → переход на его паспорт (F-024). Ссылка "Все объекты" → реестр объектов.

---

### F-049 — Event Feed with Realtime
**Приоритет:** P2 | **Размер:** M | **Зависит от:** F-046, F-038 (Trust Score Engine)

Лента последних событий (10–20 записей): изменения Trust Score, новые риски, смены статусов. Для каждого события: время, описание, ссылка на объект. Цветовая кодировка по типу (критическое/предупреждение/информация/позитивное). Supabase Realtime: обновление без перезагрузки страницы при новых событиях из `trust_score_history`.

---

### F-050 — Trust Distribution Chart
**Приоритет:** P2 | **Размер:** S | **Зависит от:** F-046

Горизонтальные полосы для 5 уровней доверия: цвет, диапазон значений, количество объектов, пропорциональная полоса. Клик по уровню → отфильтрованный список объектов с данным уровнем.

---

## 13. Epic 11 — Configurator

| ID | Feature | Приоритет | Размер | Зависит от |
|---|---|---|---|---|
| F-051 | Weights Editor Screen | P1 | M | F-013 (E3) |
| F-052 | Weights Validation & Save | P1 | S | F-051, F-037 (E8) |
| F-053 | Mass Recalculation & Notification | P1 | M | F-052, F-037 (E8) |

---

### F-051 — Weights Editor Screen
**Приоритет:** P1 | **Размер:** M | **Зависит от:** F-013 (Organizations)

Раздел "Конфигуратор" в навигации (доступен Владельцу и Аналитику ИБ). Экран редактора весов: 6 факторов с текущими значениями и интерактивными слайдерами (диапазон 0–100). Счётчик суммы весов в реальном времени. Цветовая индикация счётчика: красный при сумме ≠ 100, зелёный при сумме = 100.

---

### F-052 — Weights Validation & Save
**Приоритет:** P1 | **Размер:** S | **Зависит от:** F-051, F-037 (Trust Score Engine)

Кнопка "Применить" заблокирована при сумме ≠ 100. Предупреждение с подсказкой: "Необходимо перераспределить ещё N%". Кнопка "Сбросить к умолчаниям" (22/18/18/14/16/12) с диалогом подтверждения. Сохранение в `trust_factor_config` через UPDATE. Валидация на сервере: `weights_sum_100` constraint.

---

### F-053 — Mass Recalculation & Notification
**Приоритет:** P1 | **Размер:** M | **Зависит от:** F-052, F-037 (Trust Score Engine)

После сохранения весов: запуск массового пересчёта Trust Score для всех активных объектов организации через F-037. Toast-уведомление о начале пересчёта. Уведомление о завершении (Supabase Realtime или polling). Пересчёт затрагивает все объекты организации и обновляет орг. индекс (F-039).

---

## Итоговая статистика

### По Epic

| Epic | Features | P1 | P2 | P3 | S | M | L |
|---|---|---|---|---|---|---|---|
| 1. Foundation | 5 | 3 | 2 | — | 3 | 1 | 1 |
| 2. Authentication | 4 | 3 | 1 | — | 1 | 2 | — |
| 3. Organizations | 4 | 2 | 2 | — | 2 | 1 | 1 |
| 4. User Management | 5 | 4 | 1 | — | 2 | 2 | — |
| 5. Object Management | 5 | 4 | 1 | — | 1 | 2 | 1 |
| 6. Trust Passport | 5 | 3 | 1 | 1 | 2 | 2 | 1 |
| 7. Risk Registry | 7 | 4 | 2 | 1 | 2 | 3 | — |
| 8. Trust Score Engine | 5 | 4 | 1 | — | 2 | 1 | 1 |
| 9. Trust Graph | 5 | 3 | 2 | — | 1 | 3 | 1 |
| 10. Dashboard | 5 | 2 | 3 | — | 2 | 3 | — |
| 11. Configurator | 3 | 3 | — | — | 1 | 2 | — |
| **Итого** | **53** | **35** | **16** | **2** | **23** | **22** | **6** |

### P3-фичи (кандидаты на откладывание)

| ID | Feature | Epic | Обоснование |
|---|---|---|---|
| F-028 | PDF Export | Trust Passport | Высокая сложность (L), нет готовой инфраструктуры |
| F-035 | CSV Export | Risk Registry | Простая (S), но не блокирует работу аналитика |

---

*Документ создан на основе: `tasks/EPIC_BACKLOG.md`, `docs/product/User_Stories.md`, `ARCHITECTURE_DECISIONS.md`, `docs/architecture/Database_Design_Full.md`*
