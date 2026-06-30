# SPRINT 08 — UX Refinement & Platform Polish

`Проект: DTEK Core`  
`Спринт: 08`  
`Тип: Implementation Sprint`  
`Основа: tasks/SPRINT_08.md (Product Review, 30.06.2026)`  
`Дата создания: 30.06.2026`  
`Статус: 🔜 Активный`

---

## Содержание

1. [Цель спринта](#1-цель-спринта)
2. [Контекст и охват](#2-контекст-и-охват)
3. [Задачи спринта](#3-задачи-спринта)
4. [Ограничения и принятые решения](#4-ограничения-и-принятые-решения)
5. [Порядок выполнения и зависимости](#5-порядок-выполнения-и-зависимости)
6. [S08-T001 — Sidebar: Settings в footer-зону](#6-s08-t001--sidebar-settings-в-footer-зону)
7. [S08-T002 — Users: выравнивание таблицы участников](#7-s08-t002--users-выравнивание-таблицы-участников)
8. [S08-T003 — Invitation: показ invite-ссылки в UI](#8-s08-t003--invitation-показ-invite-ссылки-в-ui)
9. [S08-T004 — Configurator: иконка + отраслевые пресеты](#9-s08-t004--configurator-иконка--отраслевые-пресеты)
10. [S08-T005 — Audit Log: визуальная модернизация](#10-s08-t005--audit-log-визуальная-модернизация)
11. [S08-T006 — Dashboard: реструктуризация layout](#11-s08-t006--dashboard-реструктуризация-layout)
12. [S08-T007 — Loading States: skeleton-экраны](#12-s08-t007--loading-states-skeleton-экраны)
13. [S08-T008 — Settings: полировка кнопок и профиля](#13-s08-t008--settings-полировка-кнопок-и-профиля)
14. [S08-T009 — Users: Role Info Card](#14-s08-t009--users-role-info-card)
15. [Definition of Done](#15-definition-of-done)
16. [Риски](#16-риски)

---

## 1. Цель спринта

**Довести интерфейс DTEK Core до профессионального уровня** по итогам Product Review команды (Sprint 08 Product Review, 30.06.2026).

Конкретные цели:
- Устранить критические UX-проблемы: кривая таблица участников, Settings в основном меню, неработающий поток приглашений
- Улучшить ключевые разделы: Audit Log, Dashboard, Configurator
- Добиться ощущения «это сделала реальная команда», а не AI
- Улучшить воспринимаемую скорость переходов через skeleton loading states
- Не добавлять новый функционал — только полировка существующего

**Целевое состояние по итогам Sprint 08:** готовность продукта к первой демонстрации поднимается с 4/10 до 7/10.

---

## 2. Контекст и охват

| Параметр | Значение |
|---|---|
| Основа | Sprint 07 (QA, стабилизация, v0.7.0) |
| Тип работ | UX-полировка, bug fix, визуальная модернизация |
| Новый функционал | Не добавляется |
| Изменение архитектуры | Нет |
| Изменение бизнес-логики Trust Score | Нет |
| Новые миграции БД | Нет |
| Изменение ролевой модели | Нет (ADR-003) |
| Новые зависимости npm | Нет |

**Принцип Sprint 08:** все изменения максимально локальные. Каждая задача затрагивает минимальное число файлов. Рефакторинг вне рамок задачи не производится.

**Что ОСТАЁТСЯ НЕИЗМЕННЫМ:**
- Trust Score формула и логика расчёта (`lib/trust/`)
- Все Server Actions (только `sendInvitation` расширяется возвращаемым значением)
- Схема БД и RLS-политики
- Структура маршрутов Next.js
- Компоненты `components/ui/` (не редактировать напрямую)
- Роли и матрица прав (ADR-003: ровно 4 роли)

---

## 3. Задачи спринта

| ID | Задача | Приоритет | Оценка | Зависимости |
|---|---|---|---|---|
| S08-T001 | Sidebar: Settings из основного меню в footer-зону | P1 | 2ч | — | ✅ |
| S08-T002 | Users: выравнивание таблицы участников | P1 | 3ч | — | ✅ |
| S08-T003 | Invitation: показ invite-ссылки в UI (устранение блокера с почтой) | P1 | 3ч | — |
| S08-T004 | Configurator: смена иконки + отраслевые пресеты | P2 | 5ч | T001 |
| S08-T005 | Audit Log: визуальная модернизация | P2 | 4ч | — |
| S08-T006 | Dashboard: реструктуризация layout | P2 | 4ч | — |
| S08-T007 | Loading States: skeleton-экраны для основных страниц | P2 | 3ч | — |
| S08-T008 | Settings: полировка кнопок, profile tab | P3 | 3ч | — |
| S08-T009 | Users: Role Info Card (описание прав ролей) | P3 | 2ч | T002 |

**Итого:** ~29 часов / 4–5 рабочих дней

---

## 4. Ограничения и принятые решения

### 4.1 Медленная навигация (2–5 секунд)

**Корень проблемы:** каждая страница — Server Component, который выполняет запросы к Supabase Cloud (Франкфурт) в момент навигации. Это архитектурная характеристика Next.js App Router + Supabase, а не баг в коде. Сам серверный рендеринг занимает 800–2000 мс на холодном соединении.

**Что делаем в Sprint 08:** добавляем `loading.tsx` файлы с skeleton-экранами (S08-T007). Это не ускоряет запросы, но устраняет ощущение «завис» — пользователь видит что переход начался. Если «нужно нажать 5 раз» — это отдельная проблема (возможно, клиентский link-обработчик блокируется pending state). Проверяем и фиксируем в T007.

**Что НЕ делаем в Sprint 08:** React Router cache, ISR, prefetching — требуют архитектурных изменений → Sprint 09+.

### 4.2 Приглашение на почту не приходит

**Корень проблемы:** `lib/actions/invitations.ts:75` содержит `console.log(...)` вместо вызова email-сервиса. Интеграция с email-провайдером (Resend, SendGrid, Supabase SMTP) в MVP не реализована — это архитектурное упущение, не баг.

**Что делаем в Sprint 08:** изменяем `sendInvitation()` чтобы возвращать `{ inviteUrl }` при успехе. В диалоге приглашения показываем ссылку с кнопкой «Скопировать» — администратор может отправить её вручную по любому каналу (email, Telegram, Slack). UX промышленного уровня: большинство enterprise-систем предоставляют share-link параллельно с email.

**Что НЕ делаем в Sprint 08:** интеграция email-провайдера → Sprint 09 (требует nового env var, SMTP-конфигурации, template системы).

### 4.3 Запрос на добавление новых ролей

**Решение:** ADR-003 определяет ровно 4 роли: `owner`, `analyst`, `admin`, `viewer`. Добавление новых ролей требует:
1. Миграции CHECK-ограничений в БД
2. Изменения всех RLS-политик
3. Изменения всех Server Actions с RBAC-проверками
4. Изменения матрицы прав в `docs/security/RBAC_MODEL.md`

Это архитектурное изменение, не UX-полировка. **Вместо этого в Sprint 08:** улучшаем описание существующих ролей в UI (S08-T009 — Role Info Card).

### 4.4 Загрузка аватара в настройках

Требует Supabase Storage (не используется в MVP). В рамках Sprint 08 добавляем UI-заготовку (кликабельная область в `profile-tab.tsx`) с сообщением «Функция в разработке». Полная реализация → Sprint 09.

---

## 5. Порядок выполнения и зависимости

```
День 1
  S08-T001  Sidebar restructure              (2ч — быстрый win, сразу виден результат)
  S08-T002  Users table alignment            (3ч — изолирована, CSS + компонент)

День 2
  S08-T003  Invitation link в UI             (3ч — Backend + Dialog)
  S08-T005  Audit Log visual redesign        (4ч — изолированный компонент)

День 3
  S08-T004  Configurator icon + presets      (5ч — после T001: sidebar icon уже знаем)
  S08-T007  Loading states (skeleton)        (3ч — параллельно, отдельные файлы)

День 4
  S08-T006  Dashboard layout                 (4ч — сложнее всего, CSS + layout)
  S08-T008  Settings polish                  (3ч — изолирован)

День 5
  S08-T009  Role Info Card                   (2ч — после T002: users page уже готова)
  Финальная проверка: type-check, lint, build, тест в браузере
  Коммит и push в develop
```

**Строгие зависимости:**
- T004 после T001: меняем icon в sidebar — нужно видеть результат T001 сначала
- T009 после T002: добавляем Role Info Card на страницу users — базовый layout должен быть выровнен

---

## 6. S08-T001 — Sidebar: Settings в footer-зону

### Контекст

Пользователь: «настройки должны быть вместе с профилем в самом низу, а основные функции платформы на одном уровне».

Текущий sidebar: группа «Управление» содержит Users, Configurator, **Settings** — все на одном уровне с Dashboard и Objects.

Целевая структура:
```
DTEK Core [logo]
[Org name]
─── Обзор ───
  Dashboard
  Graf
─── Цифровая модель ───
  Objects
  Risks
─── Управление ───
  Users
  Configurator
─── [Footer] ───
  ⚙ Настройки          ← перемещено сюда
  [Avatar] Name / Email
  [Logout]
```

### Затронутые файлы

- `components/shared/shell/app-sidebar.tsx`

### План реализации

1. Убрать `{ href: '/settings', icon: 'settings', label: 'Настройки' }` из группы «Управление»
2. В блоке `sidebar-foot` добавить Settings-ссылку **над** блоком `.user-menu`:
   ```tsx
   <Link
     href="/settings"
     className={`nav-item${pathname.startsWith('/settings') ? ' active' : ''}`}
   >
     <Icon name="settings" size={18} />
     <span className="nav-label">Настройки</span>
     {pathname.startsWith('/settings') && <span className="nav-active-bar" />}
   </Link>
   ```
3. Убедиться что `sidebar-foot` добавляет небольшой разделитель (`border-top: 1px solid var(--border-subtle); padding-top: 8px; margin-top: 8px`) перед Settings-ссылкой

### Критерии готовности

- [ ] Settings отсутствует в группе «Управление»
- [ ] Settings-ссылка отображается в footer-зоне, над блоком профиля
- [ ] Active-состояние Settings работает корректно при нахождении на `/settings`
- [ ] Logout-кнопка остаётся последним элементом sidebar
- [ ] Визуальное разделение между Settings и user-info блоком

---

## 7. S08-T002 — Users: выравнивание таблицы участников

### Контекст

Пользователь: «таблица пользователей не ровная, не на одном уровне, все в разброс».

Анализ кода: CSS-сетка таблицы определена правильно (`grid-template-columns: 2.2fr 1.2fr 1.2fr 1.2fr 1fr`), но есть проблемы:
1. Последняя ячейка строки (активность + action button) использует `inline style: display: flex` — это переопределяет поведение grid-cell
2. Для приглашённых пользователей (invited) ячейка «Участник» показывает только email (без имени), что меняет высоту строки
3. Нет `min-width: 0` на ячейках — содержимое может переполнять grid-колонки

### Затронутые файлы

- `app/globals.css` (секция `.utable`)
- `components/shared/users/user-row.tsx`

### Plan реализации

**В `app/globals.css` (около строки 1830):**

1. Добавить `min-width: 0` к `.utable-head > *, .utable-row > *` чтобы grid-ячейки не переполнялись
2. Убедиться что `align-items: center` применяется корректно — текущее значение верное
3. Добавить `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;` к `.uth` и `.ut-cell` для длинных строк

**В `user-row.tsx`:**

1. Убрать `inline style={{ display: 'flex', ... }}` из последней ячейки — перенести в CSS-класс
2. Добавить CSS-класс `.ut-actions` в `globals.css` с нужными стилями
3. Убедиться что для invited-строк (где нет имени, только email) ячейка показывает `member.email` с тем же стилем что и `ut-name` — без двух строк (name + email), только email

**Дополнительно:** проверить на разных разрешениях экрана (1280px и 1440px).

### Критерии готовности

- [ ] Заголовки «Участник», «Роль», «Команда», «Статус», «Активность» строго выровнены с данными строк
- [ ] Строки активных пользователей (с двумя строками name + email) и приглашённых (с одной строкой email) имеют одинаковую высоту 64px
- [ ] Длинные email не выходят за пределы своей колонки
- [ ] Action dropdown в последней колонке не смещает выравнивание

---

## 8. S08-T003 — Invitation: показ invite-ссылки в UI

### Контекст

Пользователь: «не работает приглашение пользователей, точнее не приходит приглашение на почту».

**Диагностика:** `lib/actions/invitations.ts:75` строит ссылку и выводит её только в `console.log`. Email-провайдер не интегрирован. Ссылка вида `${NEXT_PUBLIC_APP_URL}/invite/${token}` существует и работает — приглашённый может пройти по ней и зарегистрироваться. Проблема только в том, что ссылка не доставляется приглашённому.

**Решение Sprint 08:** изменить `sendInvitation()` чтобы возвращать `{ inviteUrl }`, показать ссылку в диалоге с кнопкой «Скопировать».

### Затронутые файлы

- `lib/actions/invitations.ts`
- `components/shared/users/invite-dialog.tsx`

### План реализации

**`lib/actions/invitations.ts`:**

1. Изменить тип возврата `sendInvitation` с `Promise<{ error?: string }>` на `Promise<{ error?: string; inviteUrl?: string }>`
2. При успехе добавить к возврату `inviteUrl`:
   ```typescript
   const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
   const inviteUrl = `${appUrl}/invite/${inv.token}`;
   // console.log остаётся для debugging
   console.log(`[INVITE] ${email} → ${inviteUrl}`);
   return { inviteUrl };
   ```

**`components/shared/users/invite-dialog.tsx`:**

1. Добавить state `inviteUrl: string | null`
2. При успешном ответе НЕ закрывать диалог, а переходить в «success state»: показываем ссылку
3. Success UI (внутри того же `<Dialog>`):
   ```
   ✓ Приглашение создано
   Отправьте эту ссылку пользователю:

   [https://dtek-core.vercel.app/invite/xxx...] [Скопировать]

   ⓘ Ссылка действительна 7 дней
   
   [Пригласить ещё одного]    [Закрыть]
   ```
4. Кнопка «Скопировать»: `navigator.clipboard.writeText(inviteUrl)` + visual feedback «Скопировано ✓»
5. Кнопка «Пригласить ещё одного» сбрасывает форму к начальному состоянию
6. Toast «Приглашение отправлено на {email}» убрать — вместо него инструкция в UI достаточна

### Критерии готовности

- [ ] После успешного создания приглашения диалог переходит в success-state с видимой ссылкой
- [ ] Кнопка «Скопировать» копирует полный URL в буфер обмена
- [ ] Кнопка «Пригласить ещё» сбрасывает форму
- [ ] Кнопка «Закрыть» закрывает диалог
- [ ] Ссылка `/invite/{token}` открывается в браузере и показывает форму регистрации
- [ ] TypeScript строгий режим: тип возврата `sendInvitation` обновлён

---

## 9. S08-T004 — Configurator: иконка + отраслевые пресеты

### Контекст

**Иконка:** пользователь: «у конфигуратора и настроек одинаковый значок». Анализ `components/shared/icon.tsx`: иконки `config` и `settings` имеют ИДЕНТИЧНЫЙ SVG-путь (gear icon). Нужно добавить различимую иконку для Configurator.

**Пресеты:** пользователь: «хочу более продвинутый, профессиональный инструмент, что-то высчитывать под свою организацию». В рамках Sprint 08 (без изменения архитектуры): отраслевые профили весов (Banking, Industrial, IT, Retail) которые можно применить одним кликом. Данные пресетов уже задокументированы в `docs/user/CONFIGURATOR_GUIDE.md`.

### Затронутые файлы

- `components/shared/icon.tsx`
- `components/shared/shell/app-sidebar.tsx`
- `components/shared/configurator/weights-editor.tsx`
- `app/globals.css` (добавить CSS для кнопок пресетов)

### План реализации

**1. Новая иконка для Configurator (`icon.tsx`):**

Переименовать `config` на `config` с новым SVG — использовать иконку «слои» (layers), которая визуально отражает «взвешенные уровни»:
```typescript
// Заменить SVG path у ключа 'config' на иконку весов / настройки формулы:
config: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h18M8 14v7M16 14v7',
```
Или использовать уже существующий `layers` icon (`M12 2l9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5`) — переключить `config` key на `layers`-путь.

Ключ `config` в sidebar уже используется для Configurator (`{ href: '/configurator', icon: 'config', ... }`). Меняем SVG в icon set — sidebar подхватит автоматически.

**2. Отраслевые пресеты (`weights-editor.tsx`):**

Добавить константу с пресетами (данные из `docs/user/CONFIGURATOR_GUIDE.md`):
```typescript
const PRESETS: Array<{
  id: string;
  label: string;
  desc: string;
  weights: FactorWeights;
}> = [
  {
    id: 'finance',
    label: 'Финансы',
    desc: 'Банки, ФЗ-152, ЦБ РФ — акцент на compliance и access',
    weights: { vuln_weight: 20, config_weight: 15, access_weight: 25,
               network_weight: 12, compliance_weight: 28, incident_weight: 0 },
    // NB: incident = 100 - сумма остальных = 0 → скорректировать на 1 min
    // Реальные значения: incident: 0→1, compliance: 28→27 → итого 100
  },
  // ... другие пресеты
];
```

Добавить UI: блок «Отраслевые профили» **над** слайдерами:
```
───── Отраслевые профили ─────
[Финансы]  [Промышленность]  [IT/SaaS]  [Ритейл]
```
Клик на кнопку пресета → `setWeights(preset.weights)` → слайдеры обновляются → пользователь может дополнительно скорректировать → «Сохранить».

Добавить badge «Текущий профиль: {presetLabel}» если веса точно соответствуют одному из пресетов (сравниваем по значениям).

**3. CSS для пресет-кнопок:**

Добавить в `globals.css` стили для группы кнопок пресетов — небольшие `btn btn-ghost` с `active`-состоянием при совпадении весов.

### Критерии готовности

- [ ] Иконка Configurator в sidebar визуально отличается от иконки Settings
- [ ] Блок «Отраслевые профили» отображается на странице `/configurator`
- [ ] Клик на пресет обновляет все 6 слайдеров корректными значениями
- [ ] Сумма весов после применения пресета ровно 100
- [ ] Пользователь может применить пресет и затем вручную скорректировать значения
- [ ] «Сохранить» работает после применения пресета

---

## 10. S08-T005 — Audit Log: визуальная модернизация

### Контекст

Пользователь: «журнал аудита слишком просто, просто текстом, хотелось бы более визуально, профессионально, как реальный журнал аудита для команды кибербезопасности».

Текущий `security-log.tsx`: простая HTML-таблица с 4 колонками (дата, событие, кто, детали), inline-стили, текст без иконок.

Целевое состояние:
- Каждый тип события имеет иконку и цветовую категорию
- Шапка с общим счётчиком и кнопкой фильтра по категории
- Строки с визуальным разделением типов событий
- «Кто» показывается с мини-аватаром (инициалы)

### Затронутые файлы

- `components/shared/settings/security-log.tsx`
- `app/globals.css` (добавить CSS для `.slog-*` классов)

### План реализации

**Категоризация событий по типу:**

```typescript
const EVENT_CONFIG: Record<string, {
  label: string;
  icon: string;       // из icon.tsx
  category: 'access' | 'config' | 'user' | 'system';
  tone: string;       // CSS var для цвета
}> = {
  'role.changed':           { label: 'Изменение роли',   icon: 'users',   category: 'access', tone: 'var(--amber)' },
  'user.blocked':           { label: 'Блокировка',        icon: 'shield',  category: 'access', tone: 'var(--crit)' },
  'user.removed':           { label: 'Удаление',          icon: 'x',       category: 'access', tone: 'var(--crit)' },
  'invitation.sent':        { label: 'Приглашение',       icon: 'users',   category: 'user',   tone: 'var(--teal)' },
  'invitation.accepted':    { label: 'Вход по приглашению', icon: 'check', category: 'user',   tone: 'var(--teal)' },
  'invitation.cancelled':   { label: 'Отзыв приглашения', icon: 'x',      category: 'user',   tone: 'var(--text-dim)' },
  'org.updated':            { label: 'Данные организации', icon: 'building', category: 'system', tone: 'var(--text-dim)' },
  'config.weights_changed': { label: 'Веса Trust Score',  icon: 'config',  category: 'config', tone: 'var(--amber)' },
  'object.created':         { label: 'Объект создан',     icon: 'objects', category: 'system', tone: 'var(--teal)' },
  'object.deleted':         { label: 'Объект удалён',     icon: 'objects', category: 'system', tone: 'var(--crit)' },
  'risk.created':           { label: 'Риск добавлен',     icon: 'risk',    category: 'config', tone: 'var(--amber)' },
  'risk.deleted':           { label: 'Риск удалён',       icon: 'risk',    category: 'config', tone: 'var(--crit)' },
};
```

**Новый layout строки журнала:**

```
[Icon●] [Event Label]                      [Date]
         Детали: actor@email.com · детали  [Category Badge]
```

Или в виде списка карточек:
```
┌─────────────────────────────────────────────────────────┐
│ 🛡 [Изменение роли]  [ACCESS]           16 июн 14:32   │
│    admin@company.ru  →  viewer → analyst                │
└─────────────────────────────────────────────────────────┘
```

**Шапка с фильтрами:**

Добавить строку над журналом:
```
Журнал аудита   47 событий   [Все] [Доступ] [Конфиг] [Пользователи] [Система]
```
Фильтр реализуется через `useState` на клиенте (не серверный запрос).

### Критерии готовности

- [ ] Каждый тип события имеет уникальную иконку (из существующего set в `icon.tsx`)
- [ ] События визуально разделены по категории (цвет иконки или badge)
- [ ] Email актора отображается с инициалами (мини-аватар)
- [ ] Работает клиентский фильтр по категории
- [ ] Компонент корректно рендерит 0 событий (empty state)
- [ ] TypeScript strict: нет новых `any`

---

## 11. S08-T006 — Dashboard: реструктуризация layout

### Контекст

Пользователь: «лента событий слишком в низ идёт и из-за этого объекты тоже — нужно более структурировано; также график динамики индекса доверия — добавить больше периодов, сделать интереснее».

Анализ `dashboard-client.tsx`: текущий layout предположительно двухколоночный (Trust Ring / chart слева, event feed справа), где event feed занимает узкую колонку и «тянется вниз» при наличии событий, выталкивая «Топ рисковых объектов» за fold.

**Целевой layout:**

```
┌─────────────────┬─────────────────────────────────────┐
│   Trust Ring    │  KPI-карточки (4 штуки)             │
│  (org index)   │                                     │
├─────────────────┴─────────────────────────────────────┤
│         Trust Index Trend Chart                      │
│         [7д] [30д] [90д] [6м] — переключатель       │
├──────────────────────────┬────────────────────────────┤
│  Распределение (dist)   │  Топ рисковых объектов    │
├──────────────────────────┴────────────────────────────┤
│              Лента событий (полная ширина, 8 строк)  │
└───────────────────────────────────────────────────────┘
```

Ключевые изменения:
1. Event Feed — полная ширина внизу, фиксированная высота (8 строк, scroll)
2. Топ рисковых объектов и Распределение — рядом, не зависят от длины Event Feed
3. Chart с переключателем периода (7д / 30д / 90д / 6м)

### Затронутые файлы

- `components/shared/dashboard/dashboard-client.tsx`
- `components/shared/dashboard/trust-trend-chart.tsx`
- `app/globals.css` (классы `.dash-*`)

### План реализации

**`dashboard-client.tsx`:**

1. Реструктурировать JSX: перенести `<EventFeed>` в отдельный `<section>` с `className="dash-feed-row"` — полная ширина, внизу
2. `<TopRiskyObjects>` и `<TrustDistribution>` перенести в `<div className="dash-mid-row">` — CSS Grid 2 колонки

**`trust-trend-chart.tsx`:**

1. Добавить `activeRange: '7d' | '30d' | '90d' | '180d'` state
2. Фильтровать `history` по диапазону на клиенте (данные уже загружены — просто slice)
3. Отображать переключатель периода кнопками над графиком
4. По умолчанию: `'30d'`

**CSS (`globals.css`):**

1. `.dash-feed-row` — `grid-column: 1 / -1; max-height: 420px; overflow-y: auto;`
2. `.dash-mid-row` — `display: grid; grid-template-columns: 1fr 1fr; gap: 20px;`
3. Убедиться что `top-risky` не тянется на высоту event feed

### Критерии готовности

- [ ] Event Feed занимает полную ширину страницы, располагается после KPI/chart секции
- [ ] Event Feed имеет ограниченную высоту (~420px) со внутренним scroll при переполнении
- [ ] Топ рисковых объектов и Распределение не зависят от количества событий
- [ ] Chart имеет переключатель периода (минимум: 7д, 30д, 90д)
- [ ] При 0 объектах (empty state) layout не ломается

---

## 12. S08-T007 — Loading States: skeleton-экраны

### Контекст

Пользователь: «очень медленное переключение, 2–3 секунды, иногда нужно нажать 5 раз».

**Анализ:** Next.js App Router показывает blank/frozen страницу во время SSR. Добавление `loading.tsx` файлов включает Suspense-based streaming: пользователь немедленно видит skeleton-анимацию при переходе.

«Нажать 5 раз» — возможно, Link-компонент блокируется двойным pending state или router.push вызывается несколько раз. Проверить `dashboard-client.tsx:handleRecalcAll` — там `startTransition` + `router.refresh()` в связке. Убедиться что кнопки получают `disabled={isPending}`.

### Затронутые файлы

- `app/(app)/dashboard/loading.tsx` (создать)
- `app/(app)/objects/loading.tsx` (создать)
- `app/(app)/risks/loading.tsx` (создать)
- `app/(app)/users/loading.tsx` (создать)
- `app/(app)/settings/loading.tsx` (создать)
- `app/(app)/graph/loading.tsx` (создать)
- `app/(app)/configurator/loading.tsx` (создать)

### План реализации

**Паттерн skeleton для каждой страницы:**

`loading.tsx` — Server Component без `'use client'`, возвращает HTML-скелет:

```tsx
// app/(app)/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="screen">
      <div className="screen-head">
        <div className="skeleton" style={{ width: 200, height: 28 }} />
        <div className="skeleton" style={{ width: 120, height: 20, marginTop: 6 }} />
      </div>
      <div className="dash-kpi-row">
        {[1,2,3,4].map(i => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div className="skeleton" style={{ width: 80, height: 14 }} />
            <div className="skeleton" style={{ width: 60, height: 32, marginTop: 8 }} />
          </div>
        ))}
      </div>
      <div className="skeleton" style={{ height: 200, borderRadius: 8, marginTop: 20 }} />
    </div>
  );
}
```

**CSS для `.skeleton`** (добавить в `globals.css`):
```css
.skeleton {
  background: linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
  border-radius: 4px;
}
@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Дополнительно:** проверить что все кнопки с async-действиями имеют `disabled={isPending}`:
- `dashboard-client.tsx` — кнопка «Пересчитать»
- `weights-editor.tsx` — кнопка «Сохранить»
- `invite-dialog.tsx` — кнопка «Отправить приглашение»

### Критерии готовности

- [ ] Все 7 основных страниц имеют `loading.tsx` с визуально корректным skeleton
- [ ] Skeleton отображается при переходе между страницами (видно в Chrome DevTools → Network Throttling)
- [ ] CSS `.skeleton` с shimmer-анимацией работает корректно в тёмной теме
- [ ] Нет дублирования `loading.tsx` с `page.tsx` content
- [ ] Все кнопки с async-действиями заблокированы во время ожидания

---

## 13. S08-T008 — Settings: полировка кнопок и профиля

### Контекст

Пользователь: «кнопки какие-то кривые + видно что ИИ сделало, как будто браузерные кнопки».

Анализ `settings-layout.tsx` и settings tabs: tabs-переключатель возможно использует браузерные `<button>` без custom styling. Также кнопки «Сохранить» в profile-tab могут использовать базовые стили.

### Затронутые файлы

- `components/shared/settings/settings-layout.tsx`
- `components/shared/settings/profile-tab.tsx`
- `components/shared/settings/security-tab.tsx`
- `app/globals.css` (`.set-*` секция)

### План реализации

1. **Tabs-переключатель** (`settings-layout.tsx`): проверить что используются CSS-классы `.tab-btn` или аналогичные из design system. Если используются Shadcn `Tabs` — обернуть в стандартный `.tabs-bar` стиль проекта.

2. **Кнопки в settings**: аудит всех `<button>` в settings-компонентах. Каждая кнопка должна использовать класс `btn btn-primary` / `btn btn-ghost` / `btn btn-destructive` из design system. Убрать все inline button styles.

3. **Profile tab — Avatar заглушка**: добавить в `profile-tab.tsx` кликабельную область для аватара:
   ```tsx
   <div className="set-avatar-wrap" title="Загрузка фото — скоро">
     <div className="set-avatar">{initials}</div>
     <span className="set-avatar-hint">Скоро</span>
   </div>
   ```
   CSS: `.set-avatar-wrap { position: relative; cursor: not-allowed; opacity: 0.7; }`

4. **Общий осмотр**: проверить все `<select>` в settings — должны использовать `.set-input`, не браузерный default.

### Критерии готовности

- [ ] Все кнопки в `/settings` используют классы из design system
- [ ] Tabs-переключатель (Профиль / Организация / Безопасность / ...) стилизован консистентно
- [ ] Avatar-заглушка отображается в Profile tab
- [ ] `<select>` элементы стилизованы (не браузерный default)

---

## 14. S08-T009 — Users: Role Info Card

### Контекст

Пользователь: «хотел бы в разделе пользователи добавить информативности по правам, чтоб можно было прочитать какие права и за что отвечают и какие возможности».

`components/shared/users/roles-info-card.tsx` уже существует в проекте — нужно убедиться что он показывается на странице `/users`.

### Затронутые файлы

- `components/shared/users/roles-info-card.tsx` (проверить/доработать контент)
- `components/shared/users/users-page-client.tsx` (интегрировать карточку)
- `app/(app)/users/page.tsx` (если нужно передать дополнительные данные)

### План реализации

1. Прочитать текущее содержимое `roles-info-card.tsx` — проверить полноту описания прав
2. Если карточка уже содержит информацию по всем 4 ролям — только интегрировать в `users-page-client.tsx`
3. Если карточка неполная — обновить согласно `docs/architecture/User_Roles.md`

**Формат контента Role Info Card:**

```
Роли и права
┌──────────────┬───────────────────────────────────────────────────┐
│ Владелец     │ Полный доступ: управление ролями, настройки,      │
│              │ все объекты и риски, конфигуратор                  │
├──────────────┼───────────────────────────────────────────────────┤
│ Аналитик ИБ  │ Создание/редактирование объектов, рисков, графа,  │
│              │ конфигуратора. Только чтение: настройки            │
├──────────────┼───────────────────────────────────────────────────┤
│ Администратор│ Управление пользователями, создание объектов.      │
│              │ Нет доступа: конфигуратор, граф, риски             │
├──────────────┼───────────────────────────────────────────────────┤
│ Наблюдатель  │ Только чтение всех разделов. Без изменений        │
└──────────────┴───────────────────────────────────────────────────┘
```

**Где разместить:** под заголовком страницы «Участники организации», в виде коллапсируемой секции (раскрыта по умолчанию).

### Критерии готовности

- [ ] Role Info Card отображается на странице `/users`
- [ ] Описаны все 4 роли с кратким и точным описанием прав
- [ ] Информация соответствует фактической реализации RBAC (ADR-003)
- [ ] Карточка не перекрывает таблицу участников

---

## 15. Definition of Done

### Технические критерии (для каждой задачи)

- [ ] `npm run type-check` — 0 ошибок
- [ ] `npm run lint` — 0 предупреждений
- [ ] `npm run build` — успешная сборка без ошибок
- [ ] Нет новых `any` в TypeScript
- [ ] Нет inline-стилей там, где должен быть CSS-класс (кроме динамических значений)
- [ ] Нет коммитов с `console.log` в production paths (logging в server actions допустимо для `[INVITE]`)

### Продуктовые критерии (Sprint 08 в целом)

- [ ] **T001:** Settings в footer sidebar, основное меню содержит только платформенные разделы
- [ ] **T002:** Таблица участников визуально выровнена по всем колонкам
- [ ] **T003:** Приглашённый коллега получает ссылку (copy из UI) и может зарегистрироваться
- [ ] **T004:** Иконки Configurator и Settings различимы; можно применить отраслевой пресет
- [ ] **T005:** Audit Log выглядит как профессиональный журнал безопасности, не как plain text таблица
- [ ] **T006:** Event Feed не выталкивает другие блоки Dashboard, chart имеет переключатель периода
- [ ] **T007:** Переходы между страницами показывают skeleton вместо blank/frozen экрана
- [ ] **T008:** Кнопки Settings не выглядят «браузерными», profile имеет avatar-заглушку
- [ ] **T009:** Пользователь может прочитать права каждой роли прямо в `/users`

### Git

- [ ] Все изменения влиты в `develop`
- [ ] Коммиты следуют conventional commits format
- [ ] CI (`lint → type-check → build`) проходит зелёным

---

## 16. Риски

| Риск | Вероятность | Влияние | Митигация |
|---|---|---|---|
| Dashboard layout ломает existing tests или edge cases (0 объектов) | Средняя | Высокое | Проверить empty state до и после рефакторинга layout |
| `loading.tsx` конфликтует с `page.tsx` при Suspense boundaries | Низкая | Среднее | Тестировать в режиме Chrome Network Throttling |
| Пресеты в Configurator дают неверную сумму 100 | Средняя | Высокое | Добавить runtime assert: `sum !== 100 → throw` + unit проверка всех пресетов |
| Изменение `sendInvitation()` типа сломает callers | Низкая | Среднее | Проверить все imports после изменения: только `invite-dialog.tsx` вызывает эту функцию |
| Sidebar restructure ломает active-state для `/settings` | Низкая | Низкое | Проверить `pathname.startsWith('/settings')` в footer-ссылке |

---

*Источник требований: [tasks/SPRINT_08.md](SPRINT_08.md) (Product Review, 30.06.2026)*  
*Документ создан: 30.06.2026*  
*Sprint 08 реализует полировку без изменения архитектуры, бизнес-логики и схемы БД*
