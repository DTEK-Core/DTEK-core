# SPRINT 02 — Аутентификация, организации, пользователи

`Проект: DTEK Core`
`Спринт: 02`
`Дата начала: 14.06.2026`
`Дата завершения: 15.06.2026`
`Статус: Завершён ✅`

---

## Содержание

1. [Цель спринта](#1-цель-спринта)
2. [Контекст и охват](#2-контекст-и-охват)
3. [Ёмкость и оценка](#3-ёмкость-и-оценка)
4. [Порядок выполнения](#4-порядок-выполнения)
5. [Обзор задач](#5-обзор-задач)
6. [S02-T001 — Лендинг: публичная страница платформы](#6-s02-t001--лендинг-публичная-страница-платформы)
7. [S02-T002 — Auth инфраструктура: route groups, Supabase SSR, middleware](#7-s02-t002--auth-инфраструктура-route-groups-supabase-ssr-middleware)
8. [S02-T003 — Регистрация: форма и Server Action](#8-s02-t003--регистрация-форма-и-server-action)
9. [S02-T004 — Вход, выход и сброс пароля](#9-s02-t004--вход-выход-и-сброс-пароля)
10. [S02-T005 — App Shell: боковая навигация и layout](#10-s02-t005--app-shell-боковая-навигация-и-layout)
11. [S02-T006 — Создание организации](#11-s02-t006--создание-организации)
12. [S02-T007 — Онбординг мастер: 5-шаговый wizard](#12-s02-t007--онбординг-мастер-5-шаговый-wizard)
13. [S02-T008 — Страница пользователей](#13-s02-t008--страница-пользователей)
14. [S02-T009 — Поток приглашений: отправка и принятие](#14-s02-t009--поток-приглашений-отправка-и-принятие)
15. [S02-T010 — Настройки: профиль и организация](#15-s02-t010--настройки-профиль-и-организация)
16. [Definition of Done спринта](#16-definition-of-done-спринта)

---

## 1. Цель спринта

**Собрать «пустую платформу»** — первый результат, который можно передать пользователю.

По завершении спринта пользователь может: открыть лендинг платформы, создать аккаунт, войти, создать организацию, пройти онбординг мастер, пригласить коллег и управлять ролями. Данные в организации ещё отсутствуют — это следующий спринт. Но вся инфраструктура идентичности, мультиарендность через RLS и навигационный шаблон приложения уже работают.

Это Release 1 «Пустая платформа» согласно `tasks/MVP_RELEASE_PLAN.md`.

---

## 2. Контекст и охват

| Параметр | Значение |
|---|---|
| Покрываемый релиз | Release 1 — Пустая платформа (`tasks/MVP_RELEASE_PLAN.md`) |
| Покрываемые Epics | Epic 2 — Authentication, Epic 3 — Organizations, Epic 4 — User Management (`tasks/EPIC_BACKLOG.md`) |
| Ключевые документы | `docs/Database_Design_Full.md`, `ARCHITECTURE_DECISIONS.md` (ADR-002, ADR-003) |
| Дизайн-источники | `design/src/screens_auth.jsx` (лендинг + auth), `design/src/screens_admin.jsx` (org, users, settings), `design/src/shell.jsx` (app shell) |

**Входящие условия (спринт не начинается без них):**

- Sprint 01 завершён: репозиторий, Next.js 14, Tailwind, Shadcn/UI, Supabase Cloud (14 миграций), CI/CD
- В Supabase Cloud применены миграции 001–014 (таблицы `profiles`, `organizations`, `invitations` уже существуют)
- Секреты `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY` в `.env.local` и в GitHub Secrets

---

## 3. Ёмкость и оценка

| | |
|---|---|
| Задач | 10 |
| Суммарная оценка | 38 часов |
| Длительность (1 разработчик) | 5–6 рабочих дней |
| Длительность (2 разработчика) | 3–3.5 рабочих дня |

**Параллельные треки при наличии 2 разработчиков:**
- Разработчик 1: T001 → T002 → T003 → T004 → T009
- Разработчик 2: (после T002) T005 → T006 → T007 → T008 → T010

---

## 4. Порядок выполнения

```
T001: Лендинг (независим)
T002: Auth инфраструктура (независим)
    ├── T003: Регистрация
    ├── T004: Вход + выход + пароль
    └── T005: App Shell
            ├── T006: Создание организации
            │       └── T007: Онбординг мастер
            ├── T008: Страница пользователей
            │       └── T009: Приглашения
            └── T010: Настройки
```

**Критический путь:** T002 → T003 → T005 → T006 → T007

**Примечание:** T001 (Лендинг) не зависит от T002 и может выполняться параллельно с любой другой задачей. T004 (Вход) может начаться одновременно с T003 — они используют одни и те же паттерны.

---

## 5. Обзор задач

| ID | Название | Приоритет | Оценка | Зависит от |
|---|---|---|---|---|
| S02-T001 | Лендинг: публичная страница платформы | P2 | 4 ч | — |
| S02-T002 | Auth инфраструктура: route groups, Supabase SSR, middleware | P1 | 3 ч | — |
| S02-T003 | Регистрация: форма и Server Action | P1 | 3 ч | T002 |
| S02-T004 | Вход, выход и сброс пароля | P1 | 4 ч | T002 |
| S02-T005 | App Shell: боковая навигация и layout | P1 | 5 ч | T002 |
| S02-T006 | Создание организации | P1 | 3 ч | T002, T005 |
| S02-T007 | Онбординг мастер: 5-шаговый wizard | P1 | 5 ч | T006 |
| S02-T008 | Страница пользователей | P1 | 4 ч | T005 |
| S02-T009 | Поток приглашений: отправка и принятие | P1 | 4 ч | T008 |
| S02-T010 | Настройки: профиль и организация | P2 | 3 ч | T005 |
| | **Итого** | | **38 ч** | |

---

## 6. S02-T001 — Лендинг: публичная страница платформы

**Приоритет:** P2 | **Оценка:** 4 часа | **Зависит от:** —

### Описание

Реализовать публичную страницу платформы по дизайну `design/src/screens_auth.jsx` (компонент `Landing`). Страница является точкой входа для незарегистрированных пользователей: представляет платформу, ведёт к регистрации и демо.

Лендинг полностью статичен и отрисовывается на сервере. Анимации и scroll-reveal реализованы на клиенте как отдельный Client Component.

### Что нужно сделать

Установить необходимые пакеты, если не установлены. Для анимации фоновой сетки и графа — Client Component.

Создать следующие файлы:

```
app/page.tsx                                  — Server Component: если авторизован → redirect '/dashboard', иначе рендерит Landing
components/shared/landing/
  hero-trust-graph.tsx                        — Client Component: анимированный граф из design/src/hero_graph.jsx
  landing-stats.tsx                           — Client Component: CountUp анимация статистики
  landing-reveal.tsx                          — Client Component: IntersectionObserver scroll-reveal
components/shared/logo.tsx                    — SVG логотип DTEK Core (переиспользуется во всём приложении)
```

Секции лендинга реализовать согласно дизайну:

1. **Навигация** (`lp-nav`): логотип слева, ссылки в центре, кнопки «Войти» и «Запросить доступ» справа. При скролле навигация получает стилизованный фон.
2. **Hero** (`lp-hero`): заголовок, подзаголовок, две CTA-кнопки («Начать работу» → `/register`, «Демо» → `/dashboard`), анимированный граф доверия справа.
3. **Четыре опоры** (`lp-features`): карточки Паспорт / Оценка / Граф / Конфигуратор с номерами.
4. **Статистика** (`lp-stats`): 4 счётчика с анимацией CountUp при появлении в viewport.
5. **Футер**: логотип, год, копирайт.

CSS для лендинга взять из `design/src/landing.css` как основу, адаптировав под CSS-переменные из `app/globals.css`. Все классы `.landing*`, `.lp-*` добавить в `app/landing.css` и импортировать в `app/page.tsx`.

Кнопка «Демо центра управления» на лендинге в MVP ведёт на `/dashboard` — если пользователь не авторизован, middleware перенаправит на `/login`.

### Критерии готовности

- [ ] Страница `http://localhost:3000/` отображается без ошибок
- [ ] Навигация содержит кнопки «Войти» и «Запросить доступ», ссылающиеся на `/login` и `/register`
- [ ] Секция Hero отображает анимированный граф или статическую заглушку
- [ ] Секция «Четыре опоры» показывает 4 карточки с иконками и текстом
- [ ] Счётчики статистики анимируются при скролле до секции
- [ ] Авторизованный пользователь на `/` автоматически перенаправляется на `/dashboard`
- [ ] `npm run build` проходит без ошибок
- [ ] Используются только CSS-переменные из `globals.css`; нет hardcoded hex-цветов вне переменных

### Зависимости

— (нет входящих, задача независима)

---

## 7. S02-T002 — Auth инфраструктура: route groups, Supabase SSR, middleware

**Приоритет:** P1 | **Оценка:** 3 часа | **Зависит от:** —

### Описание

Создать полную инфраструктуру аутентификации: группы маршрутов Next.js App Router, Supabase SSR-клиенты с cookie-сессиями и middleware для защиты роутов. Это фундамент для всех последующих задач спринта — без него нельзя начать T003–T010.

Supabase предоставляет пакет `@supabase/ssr` для работы с сессиями в Next.js через cookies. Именно он, а не `@supabase/auth-helpers-nextjs` (устаревший), используется с Next.js 14 App Router.

### Что нужно сделать

**1. Установить пакет:**
```bash
npm install @supabase/ssr
```

**2. Обновить Supabase-клиенты:**

Перезаписать `lib/supabase/client.ts` (браузерный клиент):
```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

Перезаписать `lib/supabase/server.ts` (серверный клиент, читает cookies):
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options))
        },
      },
    }
  )
}
```

**3. Создать middleware:**

```
middleware.ts                                 — корень проекта (рядом с package.json)
lib/supabase/middleware.ts                    — updateSession helper
```

`lib/supabase/middleware.ts` — refreshes the Supabase session cookie при каждом запросе (обязательно для работы SSR-сессий):
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return { supabaseResponse, user }
}
```

`middleware.ts` — логика редиректов:
- Неавторизованный на `/dashboard`, `/users`, `/settings`, `/onboarding`, `/objects`, `/risks`, `/graph` → редирект `/login`
- Авторизованный на `/login`, `/register`, `/forgot-password` → редирект `/dashboard`
- Авторизованный на `/dashboard` и выше, но без `organization_id` в профиле → редирект `/onboarding`
- `matcher` исключает `_next`, `favicon.ico`, статические ресурсы

**4. Создать структуру route groups:**

```
app/
  (public)/                                   — лендинг и публичные страницы
    layout.tsx                                — минимальный layout без навигации
  (auth)/                                     — страницы аутентификации
    layout.tsx                                — двухколоночный layout (aside + main) из дизайна
    login/
      page.tsx
    register/
      page.tsx
    forgot-password/
      page.tsx
    reset-password/
      page.tsx
    invite/
      [token]/
        page.tsx
  (app)/                                      — защищённые страницы приложения
    layout.tsx                                — layout с App Shell (sidebar + header)
    dashboard/
      page.tsx                               — заглушка «Центр управления» (реализуется в Sprint 5+)
    onboarding/
      page.tsx
      wizard/
        page.tsx
```

`app/(auth)/layout.tsx` — двухколоночный layout согласно `AuthScreen` из `design/src/screens_auth.jsx`: левая колонка `auth-aside` с TrustRing и описанием платформы, правая `auth-main` с формой.

`app/(app)/dashboard/page.tsx` — временная заглушка (`<h1>Центр управления</h1>`) для проверки работы middleware. Будет заменена в Sprint 5.

### Критерии готовности

- [ ] `@supabase/ssr` установлен в `package.json`
- [ ] `lib/supabase/client.ts` и `lib/supabase/server.ts` используют `@supabase/ssr`
- [ ] `middleware.ts` создан и подключён; неавторизованный пользователь на `/dashboard` получает редирект на `/login`
- [ ] Авторизованный пользователь на `/login` получает редирект на `/dashboard`
- [ ] Route groups `(auth)`, `(app)` созданы с соответствующими `layout.tsx`
- [ ] Заглушка `/dashboard` доступна только авторизованным пользователям
- [ ] `npm run type-check` проходит без ошибок
- [ ] `npm run build` завершается успешно

### Зависимости

— (нет входящих; выполняется параллельно с T001)

---

## 8. S02-T003 — Регистрация: форма и Server Action

**Приоритет:** P1 | **Оценка:** 3 часа | **Зависит от:** S02-T002

### Описание

Реализовать экран регистрации по дизайну `AuthScreen` (режим `register`) из `design/src/screens_auth.jsx`. Пользователь вводит имя, фамилию, рабочий email и пароль. После успешной регистрации Supabase Auth создаёт пользователя, триггер `handle_new_user()` (миграция 002) автоматически создаёт строку в `profiles`, пользователь перенаправляется на `/onboarding`.

Поля «Организация» в форме регистрации нет — организация создаётся отдельно в онбординге. Поле «Имя организации» из дизайна заменяется полем «Фамилия».

### Что нужно сделать

Создать файлы:

```
app/(auth)/register/page.tsx                  — Server Component, передаёт searchParams в форму
components/shared/auth/register-form.tsx      — Client Component с формой и состоянием
lib/actions/auth.ts                           — Server Actions: register, login, logout, resetPassword
```

`lib/actions/auth.ts` — `register` Server Action:
```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function register(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: `${formData.get('first_name')} ${formData.get('last_name')}`.trim(),
      },
    },
  })
  if (error) return { error: error.message }
  redirect('/onboarding')
}
```

`components/shared/auth/register-form.tsx` — Client Component:
- Поля: Имя, Фамилия (в одну строку — `auth-row`), Рабочий email, Пароль
- Валидация на клиенте: email формат, пароль минимум 8 символов
- Кнопка «Создать аккаунт» с loading-состоянием через `useTransition`
- При ошибке — отображение сообщения под кнопкой
- Ссылка «Уже зарегистрированы? Войти» → `/login`
- Кнопки SSO («Корпоративный SSO», «ЕСИА / Госуслуги») — заглушки для MVP, disabled с tooltip «Доступно в Enterprise»

Дизайн формы строго по `AuthScreen` из `design/src/screens_auth.jsx`:
- Переключатель «Вход / Регистрация» над заголовком
- Заголовок «Создать аккаунт», подзаголовок «Запросите доступ к платформе DTEK Core»
- Кнопка «Создать аккаунт» с иконкой chevron

### Критерии готовности

- [ ] Страница `/register` отображается с корректным двухколоночным layout
- [ ] Форма содержит все поля: Имя, Фамилия, Email, Пароль
- [ ] После успешной регистрации происходит редирект на `/onboarding`
- [ ] Неверный email или слишком короткий пароль показывают сообщение об ошибке без перезагрузки страницы
- [ ] Строка в таблице `profiles` автоматически создаётся триггером `handle_new_user()`
- [ ] В `profiles.full_name` сохраняется `{имя} {фамилия}`
- [ ] Переключатель «Вход / Регистрация» навигирует между `/login` и `/register`
- [ ] Кнопки SSO отображаются disabled с tooltip «Доступно в Enterprise»
- [ ] `npm run type-check` проходит без ошибок

### Зависимости

S02-T002 (Auth инфраструктура, Server Action использует `createClient` из `lib/supabase/server.ts`)

---

## 9. S02-T004 — Вход, выход и сброс пароля

**Приоритет:** P1 | **Оценка:** 4 часа | **Зависит от:** S02-T002

### Описание

Реализовать полный цикл управления сессией: вход по email+пароль, выход, и двухшаговый сброс пароля (запрос письма → установка нового пароля по ссылке). Все Server Actions уже подготовлены файлом `lib/actions/auth.ts` из T003 — здесь добавляем `login`, `logout`, `forgotPassword`, `updatePassword`.

Дизайн-источник: `AuthScreen` (режим `login`) из `design/src/screens_auth.jsx`.

### Что нужно сделать

**1. Добавить Server Actions в `lib/actions/auth.ts`:**

```typescript
export async function login(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(
    formData.get('email') as string,
    { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password` }
  )
  if (error) return { error: error.message }
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}
```

**2. Добавить переменную окружения:**
- Добавить `NEXT_PUBLIC_APP_URL=http://localhost:3000` в `.env.local`
- Добавить `NEXT_PUBLIC_APP_URL` в `next.config.ts` как разрешённую env-переменную

**3. Создать компоненты и страницы:**

```
app/(auth)/login/page.tsx                     — Server Component
components/shared/auth/login-form.tsx         — Client Component
app/(auth)/forgot-password/page.tsx           — Server Component
components/shared/auth/forgot-password-form.tsx  — Client Component
app/(auth)/reset-password/page.tsx            — Client Component (работает с #access_token в URL)
components/shared/auth/reset-password-form.tsx   — Client Component
```

`login-form.tsx` по дизайну `AuthScreen` (режим `login`):
- Поля: Рабочий email, Пароль
- Чекбокс «Запомнить меня» (при отсутствии чекбокса Supabase по умолчанию хранит сессию — оставить декоративным в MVP)
- Ссылка «Забыли пароль?» → `/forgot-password`
- Кнопка «Войти в платформу» с chevron-иконкой и loading-состоянием

`forgot-password-form.tsx`:
- Одно поле: Email
- После отправки: скрыть форму, показать сообщение «Письмо отправлено. Проверьте почту.»
- Ссылка «← Вернуться к входу» → `/login`

`reset-password-form.tsx`:
- Два поля: «Новый пароль», «Подтвердите пароль»
- Валидация совпадения паролей на клиенте
- После успеха → redirect `/dashboard`

**4. Кнопка выхода:**
- Добавить в компонент App Shell (T005) кнопку «Выйти» в нижней части sidebar
- Кнопка вызывает Server Action `logout` через `<form action={logout}>`

### Критерии готовности

- [ ] Страница `/login` отображается с корректным layout
- [ ] Успешный вход перенаправляет на `/dashboard`
- [ ] Неверный пароль показывает ошибку «Неверный email или пароль»
- [ ] Страница `/forgot-password` отправляет письмо через Supabase Auth
- [ ] После отправки письма на `/forgot-password` отображается подтверждение без перезагрузки
- [ ] Страница `/reset-password` позволяет установить новый пароль по ссылке из письма
- [ ] Кнопка «Выйти» (добавляется в T005) завершает сессию и перенаправляет на `/login`
- [ ] `NEXT_PUBLIC_APP_URL` добавлен в `.env.local`
- [ ] `npm run type-check` проходит без ошибок

### Зависимости

S02-T002 (Auth инфраструктура), S02-T003 (создан файл `lib/actions/auth.ts`)

---

## 10. S02-T005 — App Shell: боковая навигация и layout

**Приоритет:** P1 | **Оценка:** 5 часов | **Зависит от:** S02-T002

### Описание

Реализовать навигационный шаблон приложения — App Shell — по дизайну `design/src/shell.jsx`. Это layout для всех страниц в `app/(app)/`: боковая панель с навигацией, логотип, переключатель организаций, аватар пользователя и кнопка выхода.

App Shell используется на каждой странице приложения начиная с этого спринта: `/dashboard`, `/users`, `/settings`, `/onboarding`. Все страницы Sprint 03+ наследуют этот layout.

### Что нужно сделать

**1. Прочитать дизайн:** `design/src/shell.jsx` — содержит sidebar с навигационными ссылками, шапку, иконки.

**2. Создать файлы:**

```
app/(app)/layout.tsx                          — Server Component: читает профиль пользователя, рендерит AppShell
components/shared/shell/
  app-sidebar.tsx                             — Client Component: sidebar с навигацией
  nav-item.tsx                                — Client Component: один пункт меню с активным состоянием
  org-switcher.tsx                            — Client Component: кнопка-переключатель текущей организации
  user-menu.tsx                               — Client Component: аватар пользователя + имя + выход
```

**3. Структура sidebar согласно дизайну:**

Верхняя часть:
- Логотип DTEK Core (из `components/shared/logo.tsx` созданного в T001)
- `org-switcher`: название текущей организации, иконка chevron для смены (в MVP — просто название без дропдауна)

Навигационные ссылки (с иконками):
```
Центр управления       /dashboard      (иконка: grid)
Объекты                /objects        (иконка: layers)
Trust Graph            /graph          (иконка: graph)
Риски                  /risks          (иконка: shield)
─────────────────────────
Пользователи           /users          (иконка: users)
Конфигуратор           /configurator   (иконка: config)
Настройки              /settings       (иконка: gear)
```

Нижняя часть sidebar:
- `user-menu`: аватар (инициалы), полное имя, email
- Кнопка «Выйти» → `<form action={logout}><button>Выйти</button></form>`

**4. Активное состояние:**
- `nav-item.tsx` использует `usePathname()` из `next/navigation`
- Текущий роут получает класс `active`

**5. `app/(app)/layout.tsx`** — загружает профиль пользователя из Supabase:
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role, avatar_url, organization_id')
    .eq('id', user.id)
    .single()

  return (
    <div className="app-layout">
      <AppSidebar profile={profile} />
      <main className="app-main">{children}</main>
    </div>
  )
}
```

**6. Стили:** добавить `.app-layout`, `.app-main`, `.sidebar`, `.nav-item`, `.nav-item.active` в `app/globals.css`. Точно следовать пропорциям и цветам из `design/src/shell.jsx` и `design/src/screens.css`.

Страницы, которых ещё нет (`/objects`, `/graph`, `/risks`, `/configurator`), отображают временную заглушку «Раздел в разработке» — добавить их как `page.tsx` с одной строкой текста, чтобы навигация не вызывала 404.

### Критерии готовности

- [ ] Sidebar отображается на `/dashboard`, `/users`, `/settings`
- [ ] Все 7 навигационных ссылок кликабельны (заглушки для пока не реализованных разделов)
- [ ] Текущая страница выделена в навигации (активное состояние)
- [ ] Аватар пользователя и имя отображаются в нижней части sidebar
- [ ] Кнопка «Выйти» завершает сессию
- [ ] `org-switcher` показывает название текущей организации (или «Нет организации» если не задана)
- [ ] На заглушках `/objects`, `/graph`, `/risks`, `/configurator` нет 404-ошибок
- [ ] `npm run type-check` проходит без ошибок
- [ ] `npm run build` завершается успешно

### Зависимости

S02-T002 (Auth инфраструктура и route groups), S02-T004 (Server Action `logout`)

---

## 11. S02-T006 — Создание организации

**Приоритет:** P1 | **Оценка:** 3 часа | **Зависит от:** S02-T002, S02-T005

### Описание

Реализовать первый шаг онбординга: форму создания организации. Открывается автоматически при первом входе (middleware проверяет `organization_id` в профиле) и вручную через кнопку «Создать организацию» на странице организаций.

После создания организации:
1. Создаётся строка в `organizations` с `owner_id = auth.uid()`
2. Обновляется `profiles.organization_id` = новый org_id
3. Создаётся строка в `trust_factor_config` с весами по умолчанию
4. Пользователь перенаправляется на `/onboarding/wizard`

### Что нужно сделать

**1. Создать файлы:**

```
app/(app)/onboarding/page.tsx                 — Server Component: заглушка-редирект на /wizard если org уже есть
app/(app)/onboarding/create/page.tsx          — Server Component: рендерит форму
components/shared/onboarding/
  create-org-form.tsx                         — Client Component: форма создания организации
lib/actions/organizations.ts                  — Server Actions: createOrganization, updateOrganization
```

**2. `lib/actions/organizations.ts`** — createOrganization:
```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createOrganization(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Создать организацию
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: formData.get('name') as string,
      short_name: formData.get('short_name') as string,
      industry: formData.get('industry') as string,
      size: formData.get('size') as string,
      inn: formData.get('inn') as string || null,
      region: formData.get('region') as string,
      owner_id: user.id,
    })
    .select('id')
    .single()

  if (orgError) return { error: orgError.message }

  // Привязать пользователя к организации и назначить роль owner
  await supabase
    .from('profiles')
    .update({ organization_id: org.id, role: 'owner' })
    .eq('id', user.id)

  // Создать конфигурацию весов с дефолтными значениями
  await supabase
    .from('trust_factor_config')
    .insert({ organization_id: org.id })

  redirect('/onboarding/wizard')
}
```

**3. Форма создания организации** (`create-org-form.tsx`):

Поля формы:
- **Полное наименование** — обязательное, text (placeholder: «АО "Меридиан-Энерго"»)
- **Краткое наименование** — обязательное, text (placeholder: «Меридиан»)
- **Отрасль** — Select: Энергетика / Финансы / Здравоохранение / IT и телеком / Государственный сектор / Промышленность / Транспорт / Другое
- **Размер** — Select: Микро (<15) / Малое (15–100) / Среднее (100–500) / Крупное (500–5000) / Предприятие (>5000)
- **ИНН** — необязательное, text с маской (10 или 12 цифр)
- **Регион** — text, необязательное

Верхняя часть страницы — заголовок «Давайте настроим вашу организацию» и подзаголовок «Вы сможете изменить эти данные позже в настройках».

Кнопка «Продолжить →» с loading-состоянием.

**4. Обновить middleware:**
- Если пользователь авторизован, на `/onboarding/wizard` или `/dashboard`, и `profile.organization_id IS NULL` → redirect на `/onboarding/create`
- Если на `/onboarding/create` и `organization_id` уже есть → redirect на `/dashboard`

### Критерии готовности

- [ ] Новый пользователь после регистрации автоматически попадает на `/onboarding/create`
- [ ] Форма содержит все 6 полей с корректными типами (Select для отрасли и размера)
- [ ] После отправки формы создаётся строка в `organizations` с `owner_id = user.id`
- [ ] В `profiles` обновляется `organization_id` и `role = 'owner'`
- [ ] Создаётся строка в `trust_factor_config` с весами по умолчанию (22/18/18/14/16/12)
- [ ] Пользователь перенаправляется на `/onboarding/wizard`
- [ ] Пользователь с уже существующей организацией, открывающий `/onboarding/create`, перенаправляется на `/dashboard`
- [ ] `npm run type-check` проходит без ошибок

### Зависимости

S02-T002 (Auth инфраструктура), S02-T005 (App Shell layout)

---

## 12. S02-T007 — Онбординг мастер: 5-шаговый wizard

**Приоритет:** P1 | **Оценка:** 5 часов | **Зависит от:** S02-T006

### Описание

Реализовать пятишаговый онбординг мастер согласно ADR-002 («онбординговый мастер при создании орг, Фаза 1»). Дизайн шаговой навигации взять из компонента `Configurator` в `design/src/screens_admin.jsx` (степ-бар с чекбоксами-завершёнными шагами).

Мастер выполняется однократно сразу после создания организации. После завершения пользователь попадает на `/dashboard`. Все изменения сохраняются за один финальный Server Action на шаге 5.

### Что нужно сделать

**1. Создать файлы:**

```
app/(app)/onboarding/wizard/page.tsx          — Server Component: загружает данные org, рендерит Wizard
components/shared/onboarding/
  wizard.tsx                                   — Client Component: управляет состоянием шагов
  wizard-step-bar.tsx                          — Client Component: progress bar шагов (дизайн из Configurator)
  steps/
    step-1-org-details.tsx                     — Детали организации (описание, контакт, сайт)
    step-2-object-types.tsx                    — Типы объектов для отслеживания
    step-3-trust-weights.tsx                   — Веса факторов доверия
    step-4-invite-team.tsx                     — Пригласить первых участников
    step-5-complete.tsx                        — Готово: итоги и запуск
lib/actions/onboarding.ts                      — Server Action: completeOnboarding
```

**2. Шаги мастера:**

**Шаг 1 — Детали организации:**
- Поля: Описание деятельности (textarea), Контактный email, Веб-сайт (необязательно)
- Данные хранятся в клиентском состоянии wizard, не сохраняются до шага 5

**Шаг 2 — Типы объектов:**
- Чекбоксы для включения/отключения типов объектов (из CHECK-ограничения `objects.type`):
  - Серверы / Рабочие станции / Ноутбуки / Сетевое оборудование / Приложения / Базы данных / Сервисы / Учётные записи / АСУ ТП / Политики
- По умолчанию: «Серверы», «Приложения», «Учётные записи» выбраны
- Сохраняется в `organizations.metadata` (JSONB, если поле добавлено) или просто в состоянии для будущего использования
- Если JSONB-поля в `organizations` нет — просто показываем чекбоксы, данные не сохраняем (MVP-заглушка)

**Шаг 3 — Веса факторов:**
- Слайдеры для 6 факторов по дизайну `WeightEditor` из `design/src/screens_admin.jsx`
- Отображается сумма весов; при сумме ≠ 100 кнопка «Далее» заблокирована
- Дефолтные значения: vuln 22, config 18, access 18, network 14, compliance 16, incident 12
- Лейблы на русском: Уязвимости / Конфигурация / Доступ / Сеть / Соответствие / Инциденты

**Шаг 4 — Пригласить команду:**
- Три поля для email + роль (Select) — возможность добавить ещё через «+ Добавить участника»
- Кнопка «Пропустить» — переходит к шагу 5 без приглашений
- Роли в Select: Аналитик ИБ / Администратор / Наблюдатель (owner исключён согласно ADR-003)
- Приглашения создаются в `invitations` в Server Action шага 5

**Шаг 5 — Готово:**
- Итоги настройки: название орг, выбранные типы объектов, веса, кол-во приглашений
- Кнопка «Запустить платформу →» — вызывает `completeOnboarding` Server Action
- После завершения → redirect `/dashboard`

**3. `lib/actions/onboarding.ts`** — `completeOnboarding`:
```typescript
'use server'
export async function completeOnboarding(data: OnboardingData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Обновить trust_factor_config с выбранными весами
  await supabase.from('trust_factor_config').update({
    vuln_weight: data.weights.vuln,
    config_weight: data.weights.config,
    access_weight: data.weights.access,
    network_weight: data.weights.network,
    compliance_weight: data.weights.compliance,
    incident_weight: data.weights.incident,
  }).eq('organization_id', data.orgId)

  // Создать приглашения
  if (data.invites.length > 0) {
    await supabase.from('invitations').insert(
      data.invites.map(inv => ({
        organization_id: data.orgId,
        email: inv.email,
        role: inv.role,
        invited_by: user.id,
      }))
    )
  }

  redirect('/dashboard')
}
```

### Критерии готовности

- [ ] Страница `/onboarding/wizard` отображает 5 шагов с progress bar в стиле дизайна
- [ ] Навигация «Назад / Далее» переключает шаги без перезагрузки страницы
- [ ] Шаг 3: сумма весов отображается в реальном времени; кнопка «Далее» заблокирована при сумме ≠ 100
- [ ] Шаг 4: можно пропустить приглашения
- [ ] Шаг 5: нажатие «Запустить платформу» сохраняет веса в `trust_factor_config` и создаёт записи в `invitations` (если есть)
- [ ] После завершения wizard пользователь попадает на `/dashboard`
- [ ] Если пользователь уже прошёл wizard и у него есть орг, `/onboarding/wizard` редиректит на `/dashboard`
- [ ] `npm run type-check` проходит без ошибок

### Зависимости

S02-T006 (Создание организации, данные org_id нужны wizard)

---

## 13. S02-T008 — Страница пользователей

**Приоритет:** P1 | **Оценка:** 4 часа | **Зависит от:** S02-T005

### Описание

Реализовать страницу управления пользователями организации по дизайну `UsersScreen` из `design/src/screens_admin.jsx`. Страница доступна только пользователям с ролями `owner` и `admin`.

Страница содержит: таблицу участников слева и панель «Роли и права» справа. Кнопка «Пригласить» открывает модальное окно (реализуется в T009).

### Что нужно сделать

**1. Создать файлы:**

```
app/(app)/users/page.tsx                      — Server Component: загружает список пользователей, проверяет роль
components/shared/users/
  users-table.tsx                             — Client Component: таблица участников
  roles-info-card.tsx                         — Server Component: панель «Роли и права»
  user-row.tsx                                — Client Component: строка таблицы с действиями
  change-role-dropdown.tsx                    — Client Component: выпадающий список смены роли
lib/actions/users.ts                          — Server Actions: changeUserRole, removeUser, blockUser
```

**2. `app/(app)/users/page.tsx`:**

```typescript
export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single()

  // Только owner и admin видят страницу
  if (!['owner', 'admin'].includes(currentProfile?.role ?? '')) {
    redirect('/dashboard')
  }

  const { data: members } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, team, status, last_seen_at')
    .eq('organization_id', currentProfile!.organization_id!)
    .order('created_at')

  return <UsersPageClient members={members ?? []} currentUserRole={currentProfile!.role} />
}
```

**3. Таблица пользователей** по дизайну `UsersScreen`:

Колонки:
- **Участник**: аватар (инициалы из имени) + имя + email
- **Роль**: Badge с цветами — owner → teal, admin → info, analyst → neutral, viewer → neutral
- **Команда**: текст
- **Статус**: StatusDot + текст (Активен → teal, Приглашён → amber, Заблокирован → crit)
- **Активность**: `last_seen_at` в формате «2 дня назад» (относительное время)

Действия в строке (три точки `DropdownMenu`):
- Сменить роль → `change-role-dropdown.tsx` (только owner/admin)
- Заблокировать / Разблокировать → `blockUser` Server Action
- Удалить из организации → `removeUser` Server Action с подтверждением (Dialog)

Смена роли: owner не может быть назначен, нельзя сменить роль самому себе, нельзя сменить роль другого owner (только один owner в org).

**4. Панель «Роли и права»** (`roles-info-card.tsx`):

Статическая карточка с описанием 4 ролей согласно ADR-003:
- **Владелец** (owner): полный доступ, управление организацией и тарифом
- **Аналитик ИБ** (analyst): создание/редактирование объектов, рисков, пассортов
- **Администратор** (admin): управление пользователями и приглашениями
- **Наблюдатель** (viewer): только просмотр, без права изменений

**5. `lib/actions/users.ts`:**
```typescript
export async function changeUserRole(userId: string, role: 'analyst' | 'admin' | 'viewer') { ... }
export async function blockUser(userId: string) { ... }  // status → 'blocked'
export async function unblockUser(userId: string) { ... } // status → 'active'
export async function removeUser(userId: string) { ... }  // organization_id → NULL
```

Каждый Server Action проверяет роль вызывающего (только owner/admin) и не позволяет изменить самого себя или другого owner.

**6. Пустое состояние:**

Если в организации только 1 пользователь, в таблице показать карточку-подсказку «Пригласите коллег для совместной работы» с кнопкой «Пригласить» (открывает модальное окно из T009).

**7. Скелетон загрузки:**

Пока данные загружаются — использовать `<Skeleton>` компонент Shadcn/UI для строк таблицы.

### Критерии готовности

- [ ] Страница `/users` доступна только owner и admin; viewer/analyst получает редирект на `/dashboard`
- [ ] Таблица отображает всех участников организации текущего пользователя (RLS гарантирует изоляцию)
- [ ] Роль каждого пользователя отображается с правильным цветом Badge
- [ ] Статус отображается с цветным индикатором (teal / amber / crit)
- [ ] Дропдаун действий позволяет сменить роль (кроме owner); изменение сразу отражается в таблице
- [ ] Owner не может изменить или удалить себя через интерфейс
- [ ] При отсутствии участников показывается пустое состояние с кнопкой «Пригласить»
- [ ] `npm run type-check` проходит без ошибок

### Зависимости

S02-T005 (App Shell layout для страницы)

---

## 14. S02-T009 — Поток приглашений: отправка и принятие

**Приоритет:** P1 | **Оценка:** 4 часа | **Зависит от:** S02-T008

### Описание

Реализовать полный поток приглашения: модальное окно приглашения на странице `/users` и публичная страница принятия приглашения по токену.

Токен приглашения хранится в таблице `invitations` (миграция 013). Письмо с ссылкой отправляется через Supabase Auth Email (временный stub — настройка SMTP выходит за рамки MVP). Для тестирования токен берётся напрямую из таблицы.

### Что нужно сделать

**1. Создать файлы:**

```
components/shared/users/
  invite-dialog.tsx                           — Client Component: модальное окно приглашения
lib/actions/invitations.ts                    — Server Actions: sendInvitation, acceptInvitation, revokeInvitation
app/(auth)/invite/[token]/page.tsx            — Server Component: принятие приглашения
components/shared/auth/
  accept-invite-form.tsx                      — Client Component: форма принятия
```

**2. Модальное окно приглашения** (`invite-dialog.tsx`):

- Открывается кнопкой «Пригласить» на странице `/users`
- Использует `Dialog` из Shadcn/UI
- Поля:
  - Email адрес
  - Роль: Select (Аналитик ИБ / Администратор / Наблюдатель)
- Кнопки: «Отмена» / «Отправить приглашение»
- После успешной отправки — toast «Приглашение отправлено на {email}»
- Создаётся строка в `invitations` со статусом `pending` и токеном

**3. `lib/actions/invitations.ts`** — sendInvitation:
```typescript
export async function sendInvitation(formData: FormData) {
  const supabase = await createClient()
  // Проверить роль (только owner)
  // INSERT в invitations: email, role, organization_id, invited_by, token (auto)
  // Отправить ссылку: ${NEXT_PUBLIC_APP_URL}/invite/${token}
  // В MVP — логировать ссылку в консоль, SMTP-интеграция в Sprint 08
}
```

**4. Страница принятия приглашения** (`app/(auth)/invite/[token]/page.tsx`):

```typescript
export default async function InvitePage({ params }: { params: { token: string } }) {
  const supabase = await createClient()

  // Найти приглашение по токену
  const { data: invitation } = await supabase
    .from('invitations')
    .select('email, role, organization_id, status, expires_at')
    .eq('token', params.token)
    .single()

  // Если токен не найден → "Приглашение не найдено"
  if (!invitation) return <InviteError message="Приглашение не найдено или уже использовано" />

  // Если истёк → "Срок действия приглашения истёк"
  if (invitation.status !== 'pending' || new Date(invitation.expires_at) < new Date()) {
    return <InviteError message="Срок действия приглашения истёк" />
  }

  return <AcceptInviteForm invitation={invitation} token={params.token} />
}
```

**5. Форма принятия** (`accept-invite-form.tsx`):

- Email уже заполнен из приглашения (readonly)
- Роль отображается (readonly)
- Поля: Имя, Фамилия, Пароль
- Кнопка «Принять приглашение и войти»
- Server Action `acceptInvitation`:
  1. `supabase.auth.signUp` с email и паролем
  2. Обновить `profiles`: `full_name`, `organization_id`, `role`, `status = 'active'`
  3. Обновить `invitations`: `status = 'accepted'`
  4. redirect `/dashboard`

Если пользователь с таким email уже зарегистрирован:
- Вместо формы регистрации — форма входа (только пароль)
- После входа: обновить профиль и принять приглашение

**6. Отозвать приглашение:**

На странице `/users` в таблице (строки со статусом «Приглашён») — дропдаун действий содержит «Отозвать приглашение» → `revokeInvitation` Server Action (статус → `expired`).

### Критерии готовности

- [ ] Кнопка «Пригласить» на `/users` открывает модальное окно
- [ ] После отправки создаётся строка в `invitations` со статусом `pending`
- [ ] Ссылка вида `/invite/{token}` выводится в консоль сервера (SMTP в Sprint 08)
- [ ] Страница `/invite/{token}` отображает имя организации и роль для принятия
- [ ] После принятия: пользователь создан в Supabase Auth, профиль обновлён, `invitations.status = 'accepted'`
- [ ] Истёкший токен показывает ошибку, а не форму
- [ ] Участник со статусом «Приглашён» появляется в таблице на странице `/users`
- [ ] `npm run type-check` проходит без ошибок

### Зависимости

S02-T008 (Страница пользователей, кнопка «Пригласить» добавляется туда)

---

## 15. S02-T010 — Настройки: профиль и организация

**Приоритет:** P2 | **Оценка:** 3 часа | **Зависит от:** S02-T005

### Описание

Реализовать страницу настроек по дизайну `SettingsScreen` из `design/src/screens_admin.jsx`. MVP включает 4 вкладки: Профиль, Организация, Уведомления (заглушка), Безопасность (заглушка).

Вкладки «Тариф» и SMTP-настройки — вне MVP.

### Что нужно сделать

**1. Создать файлы:**

```
app/(app)/settings/page.tsx                   — Server Component: загружает профиль и организацию
components/shared/settings/
  settings-layout.tsx                         — Client Component: вертикальный таб-навигатор
  profile-tab.tsx                             — Client Component: форма редактирования профиля
  org-tab.tsx                                 — Client Component: форма редактирования организации (только owner)
  notifications-tab.tsx                       — Client Component: заглушка с toggles
  security-tab.tsx                            — Client Component: заглушка с toggles
lib/actions/settings.ts                       — Server Actions: updateProfile, updateOrganization
```

**2. Вкладка «Профиль»** (`profile-tab.tsx`):

- Аватар: инициалы в круге (загрузка изображения — вне MVP)
- Поля: Полное имя, Email (readonly — нельзя менять email без Supabase Auth flow), Должность (team), Телефон (необязательно)
- Кнопка «Сохранить изменения»
- Server Action `updateProfile`:
  ```typescript
  await supabase.from('profiles').update({
    full_name: formData.get('full_name'),
    team: formData.get('team'),
  }).eq('id', user.id)
  ```
- Toast «Профиль обновлён» после успешного сохранения

**3. Вкладка «Организация»** (`org-tab.tsx`):

- Видна всем, редактируется только owner (остальные видят данные в readonly)
- Поля: Наименование, ИНН, Отрасль (Select), Регион, Количество сотрудников
- Server Action `updateOrganization`:
  ```typescript
  // Проверить роль = 'owner'
  await supabase.from('organizations').update({
    name, inn, industry, region, employee_count
  }).eq('id', orgId).eq('owner_id', user.id)
  ```

**4. Вкладки «Уведомления» и «Безопасность»:**

- Отображают UI-заглушки из дизайна (Toggle компоненты) без реальной функциональности
- При изменении любого toggle — toast «Настройки уведомлений будут доступны в следующих версиях»
- Визуально соответствуют дизайну `SettingsScreen`

**5. Навигатор вкладок** (`settings-layout.tsx`):

- Вертикальный список кнопок слева
- Активная вкладка выделена (класс `active`)
- URL не меняется при переключении (состояние в React useState)

### Критерии готовности

- [ ] Страница `/settings` отображается с 4 вкладками в вертикальном навигаторе
- [ ] Вкладка «Профиль»: изменение имени сохраняется в `profiles` и отображается в sidebar
- [ ] Вкладка «Организация»: viewer видит данные readonly; owner может редактировать
- [ ] Вкладки «Уведомления» и «Безопасность»: toggle-элементы отображаются, при изменении — toast-заглушка
- [ ] Email в профиле отображается как readonly
- [ ] `npm run type-check` проходит без ошибок

### Зависимости

S02-T005 (App Shell layout)

---

## 16. Definition of Done спринта

Спринт считается завершённым, когда выполнены **все** следующие условия:

### Продуктовые

- [x] Новый пользователь может зарегистрироваться, создать организацию и пройти онбординг мастер без технических ошибок
- [x] Существующий пользователь может войти, выйти, сбросить пароль
- [x] Owner может пригласить участника по email; приглашённый может принять приглашение и войти
- [x] Owner/Admin может видеть список участников и менять роли
- [x] Настройки профиля и организации сохраняются корректно

### Технические

- [x] Все маршруты `(app)/` защищены middleware: неавторизованный получает редирект на `/login`
- [x] RLS работает: пользователь видит только данные своей организации (проверено в Supabase Studio)
- [x] `npm run type-check` завершается с кодом 0 без ошибок TypeScript
- [x] `npm run lint` завершается без ошибок ESLint
- [x] `npm run build` завершается успешно
- [x] CI-пайплайн (lint → type-check → build) проходит на ветке `feature/S02-*`
- [x] Код влит в `develop`; `.env.local` не закоммичен
- [x] `SUPABASE_SERVICE_ROLE_KEY` нигде не используется в клиентском коде; `.env.local` не закоммичен

### UX

- [x] Все загрузки сопровождаются Skeleton-заглушками или disabled-кнопками; нет «пустых экранов»
- [x] Ошибки форм отображаются inline, без перезагрузки страницы
- [x] Toast-уведомления подтверждают успешные действия (сохранение, приглашение, смена роли)
- [x] Цветовая схема, шрифты и компоненты соответствуют дизайн-прототипу `design/`

---

## Sprint 02 Review — Результаты (15.06.2026)

### QA

| Проверка | Результат |
|---|---|
| `npm run type-check` | ✅ Без ошибок |
| `npm run lint` | ✅ Без ошибок |
| `npm run build` | ✅ Успешно (Next.js static/SSR build) |

### Найденные и исправленные дефекты

1. **CSS: `var(--border)` конфликт с Shadcn/UI** — В `app/globals.css` переменная `--border` зарезервирована Shadcn/UI (формат HSL `220 15% 10%`). Исправлено: 5 вхождений в секциях Users/Settings заменены на `var(--border-subtle)` (`rgba(255,255,255,0.06)`).

2. **CSS: Дублирующееся определение `.brand-name`** — Второе определение (font-size: 15px) перекрывало первое (17px) в sidebar. Дублирующийся блок удалён.

3. **ESLint: `prefer-const` в hero-trust-graph.tsx** — `let dx, dy` в функции `ctrl()` не переприсваивались. Заменено на `const`.

### Реализованные компоненты Sprint 02

| Задача | Статус | Ключевые файлы |
|---|---|---|
| S02-T001 Лендинг | ✅ | `app/page.tsx`, `app/landing.css`, `components/shared/landing/` |
| S02-T002 Auth инфраструктура | ✅ | `middleware.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts` |
| S02-T003 Регистрация | ✅ | `app/(auth)/register/`, `components/shared/auth/register-form.tsx` |
| S02-T004 Вход/Выход/Сброс | ✅ | `app/(auth)/login/`, `forgot-password/`, `reset-password/`, `lib/actions/auth.ts` |
| S02-T005 App Shell | ✅ | `app/(app)/layout.tsx`, `components/shared/shell/` |
| S02-T006 Создание орг | ✅ | `app/(app)/onboarding/create/`, `lib/actions/organizations.ts` |
| S02-T007 Онбординг wizard | ✅ | `app/(app)/onboarding/wizard/`, `components/shared/onboarding/` |
| S02-T008 Страница пользователей | ✅ | `app/(app)/users/`, `components/shared/users/`, `lib/actions/users.ts` |
| S02-T009 Приглашения | ✅ | `app/(auth)/invite/[token]/`, `lib/actions/invitations.ts` |
| S02-T010 Настройки | ✅ | `app/(app)/settings/`, `components/shared/settings/`, `lib/actions/settings.ts` |

### Известные ограничения MVP

- SMTP не настроен: ссылки приглашений логируются в консоль сервера (Sprint 08)
- Страницы `/objects`, `/graph`, `/risks`, `/configurator` — заглушки «Раздел в разработке»
- Avatar upload не реализован (только инициалы)
- Org switcher в sidebar — статический (одна организация на пользователя в MVP)

---

## Риски

| Риск | Вероятность | Влияние | Митигация |
|---|---|---|---|
| Supabase Auth email не настроен — ссылки приглашений не отправляются | Высокая | Низкое | В MVP логировать ссылку в консоль, SMTP в Sprint 08 |
| Middleware конфликт с защищёнными роутами вызывает redirect-петли | Средняя | Высокое | Тщательно тестировать все сценарии (авт/неавт/без-орг) до мержа T002 |
| RLS-политики блокируют `handle_new_user()` триггер при регистрации | Низкая | Высокое | Функция SECURITY DEFINER — обходит RLS; проверить в миграции 002 |
| Сложность Server Actions с `redirect()` внутри try/catch | Средняя | Низкое | `redirect()` бросает исключение — не оборачивать в try/catch |

---

## Зависимости для Sprint 03

Sprint 03 (Объекты и Trust Passport) стартует после завершения Sprint 02. Требования:

- Аутентификация, организации и пользователи работают стабильно
- App Shell реализован — Sprint 03 добавляет страницы `/objects` и `/objects/[id]` в существующий layout
- Приглашения работают — аналитики смогут управлять объектами с Sprint 03
- `trust_factor_config` содержит корректные веса — Trust Score Engine Sprint 04+ будет их использовать

---

*SPRINT 02 — Digital Trust Management Platform*
*Создан: 14.06.2026 | Статус: Готов к старту*
