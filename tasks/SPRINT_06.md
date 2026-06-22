# SPRINT 06 — Security Hardening, Access Control & Production Readiness

`Проект: DTEK Core`
`Спринт: 06`
`Дата создания: 22.06.2026`
`Статус: Готов к старту 🔜`

---

## Содержание

1. [Цель спринта](#1-цель-спринта)
2. [Место в MVP Release Plan](#2-место-в-mvp-release-plan)
3. [Контекст и результаты предварительного аудита](#3-контекст-и-результаты-предварительного-аудита)
4. [Архитектурные решения](#4-архитектурные-решения)
5. [Ёмкость и оценка](#5-ёмкость-и-оценка)
6. [Порядок выполнения](#6-порядок-выполнения)
7. [S06-T001 — RLS: Полный аудит и устранение пробелов](#7-s06-t001--rls-полный-аудит-и-устранение-пробелов)
8. [S06-T002 — RBAC: Аудит и исправление Server Actions](#8-s06-t002--rbac-аудит-и-исправление-server-actions)
9. [S06-T003 — Валидация входных данных (Zod-схемы)](#9-s06-t003--валидация-входных-данных-zod-схемы)
10. [S06-T004 — Security Headers в next.config.ts](#10-s06-t004--security-headers-в-nextconfigts)
11. [S06-T005 — Rate Limiting: Middleware защита от злоупотреблений](#11-s06-t005--rate-limiting-middleware-защита-от-злоупотреблений)
12. [S06-T006 — Аудит и обновление зависимостей](#12-s06-t006--аудит-и-обновление-зависимостей)
13. [S06-T007 — Система аудита безопасности: журнал событий](#13-s06-t007--система-аудита-безопасности-журнал-событий)
14. [Definition of Done](#14-definition-of-done)
15. [Риски и митигация](#15-риски-и-митигация)
16. [Подготовка к Sprint 07](#16-подготовка-к-sprint-07)

---

## 1. Цель спринта

**Сделать DTEK Core безопасной платформой, пригодной для эксплуатации в реальном окружении.**

После Sprint 06 платформа будет:
- иметь полностью корректные RLS-политики на всех 10 таблицах без дыр и пробелов;
- иметь явную проверку RBAC в каждом Server Action, которая не зависит от случайной защиты RLS;
- не передавать внутренние ошибки БД на клиент ни при каких условиях;
- принимать только валидированные данные строгой формы на всех мутирующих путях;
- отдавать Security Headers при каждом ответе (CSP, X-Frame-Options, HSTS и др.);
- иметь защиту от простых злоупотреблений на критичных маршрутах;
- работать на зависимостях без известных High-CVE уязвимостей;
- вести журнал событий безопасности, достаточный для расследования инцидентов.

Sprint 06 — это Release 5 «MVP Security Hardening». Новый пользовательский функционал не добавляется.

---

## 2. Место в MVP Release Plan

| Release | Название | Sprint | Статус |
|---|---|---|---|
| R0 | Техническая база | Sprint 01 | ✅ Завершён |
| R1 | Пустая платформа | Sprint 02 | ✅ Завершён |
| R2 | Цифровая модель данных | Sprint 03 | ✅ Завершён |
| R2.1 | Стабилизация | Sprint 04 | ✅ Завершён |
| R3+R4 | Trust Score Engine + Visual Model | Sprint 05 | ✅ Завершён |
| **R5** | **MVP Security Hardening** | **Sprint 06** | 🔜 Текущий |
| R6 | Полное тестирование | Sprint 07 | 🔜 Следующий |

---

## 3. Контекст и результаты предварительного аудита

Перед составлением Sprint 06 проведён технический анализ кодовой базы. Ниже — конкретные находки по каждому направлению.

### 3.1 Находки RLS-аудита

| Таблица | SELECT | INSERT | UPDATE | DELETE | Оценка |
|---|---|---|---|---|---|
| `profiles` | ✅ org | ❌ нет политики | ✅ self/owner | ❌ нет политики | Приемлемо: INSERT через SECURITY DEFINER триггер; DELETE каскадирует из auth.users |
| `organizations` | ✅ org | ✅ owner_id | ✅ owner role | ✅ owner role | ✅ |
| `objects` | ✅ org | ✅ org | ✅ org | ✅ org | ✅ Роли — на уровне SA |
| `trust_passports` | ✅ org | ❌ нет политики | ❌ нет политики | ❌ нет политики | Приемлемо: пишется только триггером/engine через admin-клиент |
| `trust_factor_config` | ✅ org | ❌ нет политики | ✅ org + role | ❌ нет политики | ⚠️ Нет защиты от INSERT через user-клиент |
| `risks` | ✅ org | ✅ org | ✅ org | ✅ org | ✅ Роли — на уровне SA |
| `object_risks` | ✅ org via object | ✅ org | ❌ нет политики | ✅ org | Приемлемо: UPDATE не используется |
| `relations` | ✅ org | ✅ org + role | ❌ нет политики | ✅ org + role | Приемлемо: UPDATE не используется |
| `trust_score_history` | ✅ org | ❌ нет политики | ❌ нет политики | ❌ нет политики | Приемлемо: пишется только engine через admin-клиент |
| `invitations` | ✅ org | ✅ owner | ❌ нет политики | ❌ нет политики | ⚠️ cancelInvitation без RLS UPDATE-политики |

**Критических дыр нет** — все мутации через admin-клиент bypasses RLS корректно. Но есть пробелы, которые создают риск при рефакторинге или при прямых вызовах через user-клиент.

Задача: добавить `DENY`-by-default политики там, где их нет, и задокументировать каждое осознанное исключение.

### 3.2 Находки RBAC-аудита Server Actions

| Файл | Действие | Auth | Роль | Находка |
|---|---|---|---|---|
| `settings.ts` | `updateOrganization` | ✅ | ❌ | **Критично:** `orgId` принимается с клиента; роль не проверяется — защита только RLS |
| `settings.ts` | `updateProfile` | ✅ | — | ⚠️ `return { error: error.message }` — утечка внутренних ошибок Supabase |
| `settings.ts` | `updateOrganization` | ✅ | ❌ | ⚠️ `return { error: error.message }` — утечка внутренних ошибок Supabase |
| `organizations.ts` | `createOrganization` | ✅ | — | ⚠️ Нет ограничений длины полей (name, inn, region) |
| `trust.ts` | `triggerRecalculate` | ✅ | ✅ | ✅ owner/analyst/admin |
| `trust.ts` | `triggerRecalculateAll` | ✅ | ✅ | ✅ owner/analyst |
| `risks.ts` | все 5 действий | ✅ | ✅ | ✅ |
| `objects.ts` | все 4 действия | ✅ | ✅ | ✅ |
| `relations.ts` | create/delete | ✅ | ✅ | ✅ |
| `configurator.ts` | `saveFactorWeights` | ✅ | ✅ | ✅ owner/analyst + серверная валидация |
| `users.ts` | role/block/remove | ✅ | ✅ | ✅ owner/admin |
| `invitations.ts` | send/cancel/accept | ✅ | ✅ | ✅ owner |

### 3.3 Находки Input Validation

| Место | Проблема |
|---|---|
| `organizations.ts::createOrganization` | Нет ограничений длины: name, short_name, inn, region могут быть произвольно длинными |
| `settings.ts::updateOrganization` | То же — name, inn, region без ограничений |
| `settings.ts::updateProfile` | full_name, team без ограничений длины |
| `objects.ts::createObject` | Поля name, ip_address, description, location без ограничений |
| `risks.ts::createRisk` | title, description, recommendation без ограничений |
| Все SA | Нет проверки формата email при создании приглашения |

### 3.4 Находки Security Headers

`next.config.js` содержит только пустой объект `{}`. Нет ни одного HTTP security header.

Браузерная проверка (simulationed Security Headers grade): **F**.

### 3.5 Находки npm audit

```
5 уязвимостей: 0 critical / 4 high / 1 moderate
```

| Пакет | Серьёзность | CVE-тип | Затронутые версии |
|---|---|---|---|
| `next` | High (×многократно) | DoS, Cache Poisoning, SSRF, HTTP Smuggling | 9.3.4-canary.0 – 16.3.0-canary.5 |
| `glob` (через eslint-config-next) | High | Command injection via CLI | 10.2.0 – 10.4.5 |
| `postcss` | Moderate | XSS via unescaped `</style>` | < 8.5.10 |

Все CVE устраняются обновлением зависимостей, но Next.js требует оценки breaking changes.

### 3.6 Что работает корректно (не требует изменений)

- Все Server Actions используют `supabase.auth.getUser()` для проверки сессии — корректно
- admin-клиент (`createAdminClient`) нигде не импортируется в клиентских компонентах — корректно
- `.env.local` в `.gitignore`, `SUPABASE_SERVICE_ROLE_KEY` не присутствует в git-истории — корректно
- `trust_factor_config` имеет DB-level CHECK `weights_sum_100` как последний рубеж защиты — корректно
- `invitations` имеют проверку `expires_at` и `status = 'pending'` на уровне приёма — нужно верифицировать в T002

---

## 4. Архитектурные решения

### ADR-S06-001: Zod как единственный инструмент валидации входных данных

**Проблема:** Текущие проверки (`if (!name) ...`, `Math.max(0, Math.min(100, ...))`) разбросаны по файлам и непоследовательны.

**Решение:** Ввести `zod` как стандарт валидации для Server Actions. Каждый мутирующий SA должен иметь `z.object({...}).safeParse(input)` до любой логики. Схемы определяются в `lib/validation/schemas.ts`.

**Почему:** Zod уже является транзитивной зависимостью через shadcn/ui. Это не добавляет нового пакета в bundle. Единообразие: все ошибки валидации возвращаются в одном формате `{ error: string }`.

**Последствие:** Небольшой рефакторинг всех мутирующих SA. Размер bundle не изменится.

---

### ADR-S06-002: Rate Limiting через Next.js Middleware с in-memory счётчиком

**Проблема:** Нет защиты от злоупотреблений. Supabase Auth уже применяет встроенный rate limit для `/auth/v1/token` (5 попыток/час по умолчанию). Нужно дополнительно защитить мутирующие маршруты приложения.

**Решение:** Реализовать `middleware.ts` с IP-based rate limiting через `Map<string, {count, resetAt}>`. Лимиты: инвайты (5/час/IP), мутации объектов/рисков (100/15мин/IP).

**Почему:** Upstash Redis — дополнительный платный сервис, нецелесообразен для MVP. In-memory счётчик работает корректно для однопоточного Vercel Serverless деплоя. Для multi-instance production потребуется Redis (Sprint 09+).

**Ограничение:** In-memory не переживает cold start. Это приемлемо для MVP.

---

### ADR-S06-003: Журнал аудита — таблица `security_events`, не отдельный сервис

**Проблема:** Нет возможности расследовать инциденты — неизвестно кто, когда и что изменял.

**Решение:** Добавить таблицу `security_events` с полями: `event_type`, `actor_id`, `organization_id`, `target_type`, `target_id`, `metadata` (JSONB), `ip_address`, `created_at`. Записи создаются через helper `createSecurityEvent()` в критичных Server Actions. RLS: только SELECT, только в пределах org.

**Почему:** Supabase Edge Functions (Sprint 08) в будущем могут стримить события в SIEM. Пока — достаточно хранить в той же БД и показывать во вкладке Настроек.

**Что логируется в MVP:** смена роли, блокировка/удаление пользователя, изменение весов Trust Score, создание/отзыв приглашения, изменение данных организации.

---

## 5. Ёмкость и оценка

| Задача | Тип | Сложность | Оценка | Статус |
|---|---|---|---|---|
| S06-T001 | RLS: Аудит и устранение пробелов | Migration | S | 1 день | 🔜 |
| S06-T002 | RBAC: Аудит и исправление SA | Рефакторинг | S | 1 день | 🔜 |
| S06-T003 | Валидация входных данных (Zod) | Рефакторинг | M | 1.5 дня | 🔜 |
| S06-T004 | Security Headers | Config | XS | 0.5 дня | 🔜 |
| S06-T005 | Rate Limiting Middleware | Feature | S | 1 день | 🔜 |
| S06-T006 | Аудит и обновление зависимостей | Maintenance | S | 0.5 дня | 🔜 |
| S06-T007 | Система аудита безопасности | Feature+Migration | L | 2 дня | 🔜 |
| **Итого** | | | | **~7.5 дней** | |

---

## 6. Порядок выполнения

```
T001 (RLS Migration)
    └── независима, выполняется первой (основа безопасности данных)

T002 (RBAC SA Fix)
    └── независима, критичный быстрый выигрыш

T003 (Zod Validation)
    └── зависит от T002 (нужно знать финальные контракты SA)

T004 (Security Headers)
    └── независима, может выполняться параллельно с любой задачей

T005 (Rate Limiting)
    └── зависит от T004 (middleware.ts уже будет существовать)

T006 (Deps Update)
    └── независима; выполнять после T003 — обновление может изменить сигнатуры

T007 (Audit Log)
    └── зависит от T001 (миграция БД) и T002 (знаем, какие SA надо логировать)
```

**Критический путь:** T001 → T002 → T003 → T007  
**Можно параллельно:** T004 + T006

---

## 7. S06-T001 — RLS: Полный аудит и устранение пробелов

**Оценка:** 1 день | **Зависит от:** — | **Блокирует:** T007

### Цель

Создать миграцию `016_rls_hardening.sql`, которая:
- добавляет явные DENY-политики там, где их нет и возможен нежелательный доступ;
- добавляет комментарии к каждому намеренному отсутствию политики (документирует почему);
- не нарушает существующую логику (все операции через admin-клиент продолжают работать).

### Что необходимо реализовать

**Файл: `supabase/migrations/016_rls_hardening.sql`**

```sql
-- ── 1. trust_factor_config: блокировать INSERT через user-клиент ────────────
-- Config создаётся только при онбординге через admin-клиент (service_role).
-- Без этой политики любой аутентифицированный пользователь мог бы создать
-- дублирующую строку конфигурации через user-клиент (UNIQUE ловит, но лучше явно).
CREATE POLICY "tfc_insert_deny" ON trust_factor_config FOR INSERT
    WITH CHECK (false);

-- ── 2. trust_factor_config: блокировать DELETE через user-клиент ────────────
CREATE POLICY "tfc_delete_deny" ON trust_factor_config FOR DELETE
    USING (false);

-- ── 3. trust_passports: явно блокировать все мутации через user-клиент ───────
-- trust_passports создаются триггером create_trust_passport() (SECURITY DEFINER).
-- Обновляются только engine через admin-клиент. Удаляются каскадом из objects.
CREATE POLICY "passports_insert_deny" ON trust_passports FOR INSERT
    WITH CHECK (false);

CREATE POLICY "passports_update_deny" ON trust_passports FOR UPDATE
    USING (false);

CREATE POLICY "passports_delete_deny" ON trust_passports FOR DELETE
    USING (false);

-- ── 4. trust_score_history: явно блокировать все мутации ─────────────────────
-- Записи создаются только engine через admin-клиент. Никогда не обновляются.
-- Удаляются каскадом при удалении объекта.
CREATE POLICY "tsh_insert_deny" ON trust_score_history FOR INSERT
    WITH CHECK (false);

CREATE POLICY "tsh_update_deny" ON trust_score_history FOR UPDATE
    USING (false);

CREATE POLICY "tsh_delete_deny" ON trust_score_history FOR DELETE
    USING (false);

-- ── 5. invitations: UPDATE запрещён через user-клиент ────────────────────────
-- cancelInvitation использует admin-клиент (обходит RLS корректно).
-- Прямое UPDATE от user-клиента не должно быть возможным.
CREATE POLICY "invitations_update_deny" ON invitations FOR UPDATE
    USING (false);

-- ── 6. invitations: DELETE запрещён через user-клиент ────────────────────────
-- Удаление invitation → только через admin-клиент в Server Action.
CREATE POLICY "invitations_delete_deny" ON invitations FOR DELETE
    USING (false);

-- ── 7. profiles: явный запрет DELETE через user-клиент ───────────────────────
-- Профиль удаляется только каскадом при удалении auth.users.
-- Никакой пользователь (в т.ч. owner) не должен удалять профили напрямую.
CREATE POLICY "profiles_delete_deny" ON profiles FOR DELETE
    USING (false);

-- ── 8. profiles: исправить SELECT для пользователей без организации ───────────
-- Текущая политика "profiles_select" использует current_org_id().
-- Новый пользователь, не завершивший онбординг, получает NULL и не может
-- прочитать свой собственный профиль через user-клиент.
-- Все страницы используют admin-клиент, но это лучше исправить явно.
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT
    USING (
        id = auth.uid()  -- пользователь всегда видит свой профиль
        OR organization_id = current_org_id()  -- члены одной орг видят друг друга
    );

-- ── 9. object_risks: добавить UPDATE_DENY ────────────────────────────────────
-- object_risks — связующая таблица, не обновляется (только INSERT/DELETE).
CREATE POLICY "object_risks_update_deny" ON object_risks FOR UPDATE
    USING (false);

-- ── 10. relations: добавить UPDATE_DENY ──────────────────────────────────────
-- Связи между объектами не редактируются, только создаются и удаляются.
CREATE POLICY "relations_update_deny" ON relations FOR UPDATE
    USING (false);
```

После применения миграции: провести smoke-тест — попытка INSERT в `trust_factor_config` через user-клиент должна вернуть RLS error.

### Критерии готовности

- [ ] Миграция применена (`npx supabase db push --include-all`)
- [ ] Типы БД регенерированы (`npx supabase gen types typescript ...`)
- [ ] `npm run type-check` — 0 ошибок
- [ ] `npm run build` — успешно
- [ ] Все существующие функции платформы работают корректно после миграции

---

## 8. S06-T002 — RBAC: Аудит и исправление Server Actions

**Оценка:** 1 день | **Зависит от:** — | **Блокирует:** T003, T007

### Цель

Устранить критические RBAC-пробелы, найденные в аудите. Гарантировать, что каждый мутирующий Server Action:
1. проверяет аутентификацию (`auth.getUser()`);
2. дополнительно проверяет роль пользователя явно в коде SA (не полагается только на RLS);
3. не возвращает внутренние ошибки Supabase на клиент.

### Что необходимо исправить

#### 8.1 `lib/actions/settings.ts` — критичные исправления

**Проблема 1: `updateOrganization` принимает `orgId` с клиента**

Текущий код:
```typescript
export async function updateOrganization(orgId: string, data: OrgData)
```
Вызов через клиент может передать любой `orgId`. Хотя RLS блокирует доступ к чужим организациям, правильное решение — получать `orgId` исключительно из профиля аутентифицированного пользователя.

Исправление — изменить сигнатуру: убрать `orgId` из параметров, получать из профиля через admin-клиент. Добавить явную проверку роли `owner` (только владелец меняет реквизиты организации).

**Проблема 2: утечка внутренних ошибок**

```typescript
// БЫЛО:
if (error) return { error: error.message };

// ДОЛЖНО БЫТЬ:
if (error) return { error: 'Не удалось обновить данные. Попробуйте ещё раз.' };
```

Применить ко всем `error.message` в `settings.ts`.

**Итоговый вид `lib/actions/settings.ts`:**

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function updateProfile(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const fullName = (formData.get('full_name') as string | null)?.trim();
  const team     = (formData.get('team') as string | null)?.trim() ?? null;

  if (!fullName) return { error: 'Имя не может быть пустым' };
  // Ограничения длины добавляются в T003 (Zod)

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, team } as never)
    .eq('id', user.id);

  if (error) return { error: 'Не удалось обновить профиль. Попробуйте ещё раз.' };

  revalidatePath('/settings');
  revalidatePath('/');
  return {};
}

export async function updateOrganization(data: OrgData): Promise<{ error?: string }> {
  // orgId берётся из сессии, не из параметра
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();
  const { data: profileRaw } = await admin
    .from('profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single() as unknown as { data: { role: string; organization_id: string } | null };

  if (!profileRaw?.organization_id) redirect('/onboarding/create');
  if (profileRaw.role !== 'owner') {
    return { error: 'Только владелец организации может изменять её данные' };
  }

  if (!data.name?.trim()) return { error: 'Наименование не может быть пустым' };
  // Остальная валидация в T003 (Zod)

  const { error } = await admin
    .from('organizations')
    .update({
      name:     data.name.trim(),
      inn:      data.inn?.trim() || null,
      industry: data.industry || null,
      region:   data.region?.trim() || null,
      size:     data.size || null,
    } as never)
    .eq('id', profileRaw.organization_id);

  if (error) return { error: 'Не удалось обновить данные организации. Попробуйте ещё раз.' };

  revalidatePath('/settings');
  return {};
}
```

> **Важно:** все вызовы `updateOrganization` в компонентах Settings нужно обновить — убрать передачу `orgId` первым аргументом.

#### 8.2 Проверка `lib/actions/invitations.ts` — принятие приглашения

Функция `acceptInvitation(token)` должна проверять:
- `status = 'pending'` (не принятое и не просроченное)
- `expires_at > now()` (токен не истёк)
- Не позволять пользователю, уже состоящему в организации, принять чужое приглашение

Проверить код, при необходимости добавить все три проверки явно в SA (не полагаться только на DB).

#### 8.3 Унифицировать паттерн ошибок

Правило: **никакой SA никогда не возвращает `error.message` из Supabase** — только человекочитаемые строки на русском языке. Провести grep по всем файлам в `lib/actions/`:

```bash
grep -n "error.message" lib/actions/*.ts
```

Заменить все вхождения.

### Критерии готовности

- [ ] `updateOrganization` не принимает `orgId` как параметр — получает из профиля
- [ ] `updateOrganization` явно проверяет роль `owner` перед обновлением
- [ ] Все вызовы `updateOrganization` в клиентских компонентах обновлены
- [ ] `grep -rn "error.message" lib/actions/` — 0 результатов (только `{ error: 'human readable' }`)
- [ ] `acceptInvitation` проверяет `status`, `expires_at` явно в коде SA
- [ ] `npm run type-check` — 0 ошибок
- [ ] `npm run lint` — 0 предупреждений

---

## 9. S06-T003 — Валидация входных данных (Zod-схемы)

**Оценка:** 1.5 дня | **Зависит от:** T002 | **Блокирует:** —

### Цель

Ввести строгую типизированную валидацию входных данных через Zod во всех мутирующих Server Actions. Защита от: произвольно длинных строк, невалидных enum-значений, неверных форматов.

### Что необходимо реализовать

**Файл: `lib/validation/schemas.ts`**

```typescript
import { z } from 'zod';

// ── Переиспользуемые примитивы ────────────────────────────────────────────────
const shortText  = z.string().min(1).max(100).trim();
const mediumText = z.string().min(1).max(500).trim();
const longText   = z.string().max(2000).trim();
const optShort   = z.string().max(100).trim().nullable().optional();
const uuidField  = z.string().uuid();

// ── Организация ───────────────────────────────────────────────────────────────
export const CreateOrgSchema = z.object({
  name:       shortText,
  short_name: shortText.max(50),
  industry:   z.enum(['finance', 'government', 'healthcare', 'education',
                      'retail', 'manufacturing', 'telecom', 'energy', 'other']),
  size:       z.enum(['micro', 'small', 'medium', 'large', 'enterprise']),
  inn:        z.string().max(12).regex(/^\d*$/, 'ИНН должен содержать только цифры').optional().nullable(),
  region:     optShort,
});

export const UpdateOrgSchema = CreateOrgSchema.pick({
  name: true, inn: true, industry: true, region: true, size: true,
}).partial({ inn: true, industry: true, region: true, size: true });

// ── Профиль ───────────────────────────────────────────────────────────────────
export const UpdateProfileSchema = z.object({
  full_name: shortText,
  team:      optShort,
});

// ── Объекты ───────────────────────────────────────────────────────────────────
const OBJECT_TYPES       = ['server', 'workstation', 'network_device', 'application',
                            'database', 'cloud_service', 'iot_device', 'account', 'other'] as const;
const CRITICALITY_LEVELS = ['critical', 'high', 'medium', 'low'] as const;

export const CreateObjectSchema = z.object({
  name:        shortText,
  type:        z.enum(OBJECT_TYPES),
  criticality: z.enum(CRITICALITY_LEVELS),
  ip_address:  z.string().max(45).optional().nullable(),  // IPv4/IPv6
  hostname:    optShort,
  os:          optShort,
  description: longText.optional().nullable(),
  location:    optShort,
  owner_name:  optShort,
});

export const UpdateObjectSchema = CreateObjectSchema.partial();

// ── Риски ─────────────────────────────────────────────────────────────────────
const RISK_CATEGORIES  = ['vulnerability', 'configuration', 'access',
                          'network', 'compliance', 'incident'] as const;
const RISK_CRITICALITY = ['critical', 'high', 'medium', 'low'] as const;
const RISK_STATUSES    = ['open', 'in_progress', 'accepted', 'mitigated', 'closed'] as const;

export const CreateRiskSchema = z.object({
  title:          shortText,
  description:    longText.optional().nullable(),
  category:       z.enum(RISK_CATEGORIES),
  criticality:    z.enum(RISK_CRITICALITY),
  recommendation: longText.optional().nullable(),
});

export const UpdateRiskSchema = CreateRiskSchema.partial().extend({
  status: z.enum(RISK_STATUSES).optional(),
});

// ── Приглашения ───────────────────────────────────────────────────────────────
export const InviteSchema = z.object({
  email: z.string().email('Некорректный email').max(254),
  role:  z.enum(['analyst', 'admin', 'viewer']),
});

// ── Связи (Relations) ─────────────────────────────────────────────────────────
const RELATION_TYPES = ['uses', 'depends_on', 'connected_to',
                        'managed_by', 'owns', 'interacts_with'] as const;

export const CreateRelationSchema = z.object({
  sourceObjectId: uuidField,
  targetObjectId: uuidField,
  relationType:   z.enum(RELATION_TYPES),
});
```

**Паттерн применения в Server Actions:**

```typescript
import { CreateRiskSchema } from '@/lib/validation/schemas';

export async function createRisk(input: unknown): Promise<{ error?: string }> {
  // ... auth check ...

  const parsed = CreateRiskSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? 'Некорректные данные';
    return { error: msg };
  }
  const data = parsed.data;
  // data теперь типизирован и валидирован
  // ...
}
```

**Файлы для обновления:**

| Server Action | Схема |
|---|---|
| `organizations.ts::createOrganization` | `CreateOrgSchema` |
| `settings.ts::updateOrganization` | `UpdateOrgSchema` |
| `settings.ts::updateProfile` | `UpdateProfileSchema` |
| `objects.ts::createObject` | `CreateObjectSchema` |
| `objects.ts::updateObject` | `UpdateObjectSchema` |
| `risks.ts::createRisk` | `CreateRiskSchema` |
| `risks.ts::updateRisk` | `UpdateRiskSchema` |
| `invitations.ts::sendInvitation` | `InviteSchema` |
| `relations.ts::createRelation` | `CreateRelationSchema` |

> **Примечание:** `configurator.ts` уже имеет ручную валидацию (integer ranges + sum=100). В T003 заменить на Zod-схему `FactorWeightsSchema` с рефайном.

### Критерии готовности

- [ ] `lib/validation/schemas.ts` создан и экспортирует все схемы
- [ ] Все 9 мутирующих SA используют `safeParse` перед любой логикой
- [ ] Длинная строка (>10000 символов) в любом текстовом поле возвращает ошибку валидации
- [ ] Некорректный enum (например, `criticality: "ultra"`) возвращает ошибку валидации
- [ ] `npm run type-check` — 0 ошибок
- [ ] `npm run lint` — 0 предупреждений
- [ ] `npm run build` — успешно

---

## 10. S06-T004 — Security Headers в next.config.ts

**Оценка:** 0.5 дня | **Зависит от:** — | **Блокирует:** T005 (middleware.ts)

### Цель

Настроить HTTP Security Headers через `next.config.ts`. Цель — получить оценку A или A+ при проверке через [securityheaders.com](https://securityheaders.com).

### Что необходимо реализовать

**Файл: `next.config.ts`** (переименовать из `next.config.js`)

```typescript
import type { NextConfig } from 'next';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
// Извлечь hostname из URL для CSP connect-src
const supabaseHost = SUPABASE_URL ? new URL(SUPABASE_URL).hostname : '*.supabase.co';

const securityHeaders = [
  // Запрет встраивания платформы во фреймы
  { key: 'X-Frame-Options', value: 'DENY' },
  // Запрет MIME-sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Отправлять только origin в Referrer
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Ограничить опасные браузерные API
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  // HSTS: только для HTTPS в production
  ...(process.env.NODE_ENV === 'production'
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
    : []),
  // Content Security Policy
  // 'unsafe-inline' и 'unsafe-eval' требуются для Next.js App Router
  // и Tailwind CSS в текущей конфигурации.
  // Nonce-based CSP — Sprint 09 (полный security assessment).
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      `connect-src 'self' https://${supabaseHost} wss://${supabaseHost}`,
      "img-src 'self' data: blob: https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Применить ко всем маршрутам
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

> **Примечание по CSP:** `'unsafe-inline'` и `'unsafe-eval'` — известное ограничение Next.js 14 App Router. Более строгий CSP с nonces требует значительного рефакторинга и запланирован на Sprint 09 (Security Assessment).

### Критерии готовности

- [ ] `next.config.ts` создан, `next.config.js` удалён
- [ ] `X-Frame-Options: DENY` присутствует во всех ответах
- [ ] `X-Content-Type-Options: nosniff` присутствует
- [ ] `Content-Security-Policy` присутствует
- [ ] `Strict-Transport-Security` присутствует в production-сборке
- [ ] `npm run build` — успешно (TypeScript конфиг работает)
- [ ] Приложение работает корректно — нет CSP-блокировок в браузере (проверить консоль)

---

## 11. S06-T005 — Rate Limiting: Middleware защита от злоупотреблений

**Оценка:** 1 день | **Зависит от:** T004 | **Блокирует:** —

### Цель

Добавить IP-based rate limiting через Next.js Middleware для защиты от:
- массового создания объектов/рисков через автоматизированные скрипты;
- перебора токенов приглашений;
- спам-рассылки приглашений.

> **Предварительное замечание:** Supabase Auth уже имеет встроенный rate limit на `/auth/v1/token` (5 попыток входа в 60 секунд по умолчанию). Дополнительный rate limiting для страниц `/login` и `/signup` не требуется — Supabase его обеспечивает.

### Что необходимо реализовать

**Файл: `middleware.ts`** (в корне проекта)

```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// In-memory rate limiter — приемлемо для single-instance MVP
// При multi-instance (Enterprise) заменить на Upstash Redis
const rateLimits = new Map<string, { count: number; resetAt: number }>();

interface RateLimitRule {
  windowMs: number;   // окно в мс
  maxRequests: number;
}

const RULES: Record<string, RateLimitRule> = {
  // Перебор токенов приглашений
  '/join':            { windowMs: 60_000, maxRequests: 10 },
  // Мутации через API-маршруты (если появятся)
  '/api/':            { windowMs: 60_000, maxRequests: 60 },
};

function getRuleForPath(pathname: string): RateLimitRule | null {
  for (const [prefix, rule] of Object.entries(RULES)) {
    if (pathname.startsWith(prefix)) return rule;
  }
  return null;
}

function checkRateLimit(key: string, rule: RateLimitRule): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + rule.windowMs });
    return true; // allowed
  }

  if (entry.count >= rule.maxRequests) return false; // blocked

  entry.count++;
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rule = getRuleForPath(pathname);

  if (rule) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown';
    const key = `${ip}:${pathname.split('/').slice(0, 2).join('/')}`;

    if (!checkRateLimit(key, rule)) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: { 'Retry-After': '60' },
      });
    }
  }

  // Supabase session refresh (существующая логика)
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

**Дополнительно — защита крупных запросов:**

В `middleware.ts` добавить проверку `Content-Length`:

```typescript
// Блокировать аномально большие тела запросов (> 100KB для обычных форм)
const contentLength = request.headers.get('content-length');
if (contentLength && parseInt(contentLength) > 102_400) {
  return new NextResponse('Payload Too Large', { status: 413 });
}
```

### Критерии готовности

- [ ] `middleware.ts` создан и не нарушает существующую логику Supabase-сессий
- [ ] `/join` маршрут ограничен 10 запросами/минуту на IP
- [ ] Превышение лимита возвращает 429 с заголовком `Retry-After`
- [ ] Запросы > 100KB блокируются с 413
- [ ] `npm run type-check` — 0 ошибок
- [ ] Обычная работа с платформой не затронута (лимиты не срабатывают при нормальном использовании)

---

## 12. S06-T006 — Аудит и обновление зависимостей

**Оценка:** 0.5 дня | **Зависит от:** — | **Блокирует:** —

### Цель

Устранить известные CVE в зависимостях. Минимизировать поверхность атаки через устаревшие библиотеки.

### Что необходимо выполнить

#### 12.1 Анализ npm audit (текущее состояние)

```bash
npm audit
# 5 уязвимостей: 4 high (next.js, glob), 1 moderate (postcss)
```

#### 12.2 Стратегия обновления

**`postcss` (moderate XSS):**
```bash
# Обновляется через npm audit fix (не breaking change)
npm audit fix
```

**`next.js` (4 high CVE):**

Уязвимости затрагивают `next 9.3.4-canary.0 – 16.3.0-canary.5`. Доступное исправление — переход на `next@16.2.9` (major bump).

Порядок действий:
1. Проверить наличие Next.js 15 LTS в стабильной версии: `npm show next@15 dist-tags`
2. Если Next.js 15 стабилен — обновить на него (менее breaking, чем 16): `npm install next@15`
3. Исправить breaking changes: Next.js 15 изменил async/sync поведение `cookies()`, `headers()`, параметры `params` в page.tsx (стали `Promise<>`)
4. Запустить `npm run build` для выявления всех breaking changes
5. Исправить до прохождения `type-check` и `build`
6. Если Next.js 15 приносит неоправданный объём изменений — задокументировать CVE как known risk и обновить в Sprint 09 (Security Assessment)

**`glob` via eslint-config-next (high):**

Эта уязвимость — в CLI-режиме `glob`, который используется только в dev-зависимостях ESLint. В production bundle не попадает. Риск: только среда разработки.
```bash
# Обновить eslint-config-next (следует за next.js)
# Устраняется автоматически при обновлении next.js
```

#### 12.3 Проверка устаревших зависимостей

```bash
npm outdated
```

Обновить только те пакеты, которые имеют CVE или явно устарели. Не обновлять без причины — стабильность важнее.

#### 12.4 Документирование результата

После обновления создать краткий отчёт в `docs/security/DEPENDENCY_AUDIT_S06.md`:
- Дата аудита
- Что обновлено
- Что не обновлено и почему (known risk)
- Следующий аудит — Sprint 09

### Критерии готовности

- [ ] `npm audit` — 0 critical, 0 high (или задокументировано как known risk с обоснованием)
- [ ] `npm run type-check` — 0 ошибок
- [ ] `npm run lint` — 0 предупреждений
- [ ] `npm run build` — успешно
- [ ] `docs/security/DEPENDENCY_AUDIT_S06.md` создан

---

## 13. S06-T007 — Система аудита безопасности: журнал событий

**Оценка:** 2 дня | **Зависит от:** T001 (миграции), T002 (финальные SA) | **Блокирует:** —

### Цель

Создать трассируемый журнал критичных событий безопасности. После выполнения T007 каждое изменение ролей, конфигурации и состава организации будет зафиксировано и доступно для аудита.

### Что необходимо реализовать

#### 13.1 `supabase/migrations/017_security_events.sql`

```sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 017: security_events — журнал аудита безопасности
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE security_events (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,

    -- Кто выполнил действие
    actor_id        uuid REFERENCES profiles(id) ON DELETE SET NULL,
    actor_email     text,   -- денормализован на случай удаления профиля

    -- Что произошло
    event_type      text NOT NULL,
    -- Виды событий:
    --   auth.login, auth.logout, auth.signup, auth.password_reset
    --   role.changed, user.blocked, user.removed
    --   invitation.sent, invitation.accepted, invitation.cancelled
    --   org.updated
    --   config.weights_changed
    --   object.created, object.deleted
    --   risk.created, risk.deleted

    -- Цель действия (если применимо)
    target_type     text,   -- 'user', 'object', 'risk', 'invitation', 'organization', 'config'
    target_id       text,   -- uuid или другой идентификатор цели

    -- Дополнительный контекст
    metadata        jsonb,  -- до/после значения, причины, имена и т.п.
    ip_address      text,

    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_security_events_org       ON security_events(organization_id, created_at DESC);
CREATE INDEX idx_security_events_actor     ON security_events(actor_id, created_at DESC);
CREATE INDEX idx_security_events_type      ON security_events(event_type, created_at DESC);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Только чтение событий своей организации
CREATE POLICY "sec_events_select" ON security_events FOR SELECT
    USING (organization_id = current_org_id());

-- Запись только через admin-клиент (Engine)
CREATE POLICY "sec_events_insert_deny" ON security_events FOR INSERT
    WITH CHECK (false);

CREATE POLICY "sec_events_update_deny" ON security_events FOR UPDATE
    USING (false);

CREATE POLICY "sec_events_delete_deny" ON security_events FOR DELETE
    USING (false);
```

#### 13.2 `lib/security/audit.ts`

```typescript
import { createAdminClient } from '@/lib/supabase/admin';
import { headers } from 'next/headers';

export type SecurityEventType =
  | 'role.changed'
  | 'user.blocked'
  | 'user.removed'
  | 'invitation.sent'
  | 'invitation.accepted'
  | 'invitation.cancelled'
  | 'org.updated'
  | 'config.weights_changed'
  | 'object.created'
  | 'object.deleted'
  | 'risk.created'
  | 'risk.deleted';

interface SecurityEventPayload {
  organizationId: string;
  actorId:        string;
  actorEmail?:    string;
  eventType:      SecurityEventType;
  targetType?:    string;
  targetId?:      string;
  metadata?:      Record<string, unknown>;
}

export async function createSecurityEvent(payload: SecurityEventPayload): Promise<void> {
  const admin = createAdminClient();
  const hdrs  = await headers();
  const ip    = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim()
             ?? hdrs.get('x-real-ip')
             ?? null;

  // fire-and-forget: не блокировать основной SA при ошибке логирования
  await admin.from('security_events').insert({
    organization_id: payload.organizationId,
    actor_id:        payload.actorId,
    actor_email:     payload.actorEmail,
    event_type:      payload.eventType,
    target_type:     payload.targetType,
    target_id:       payload.targetId,
    metadata:        payload.metadata ?? null,
    ip_address:      ip,
  } as never).then(({ error }) => {
    if (error) console.error('[audit] failed to write security event:', error.message);
  });
}
```

#### 13.3 Интеграция в Server Actions

Добавить вызов `createSecurityEvent()` в следующие SA:

| Server Action | Событие | Metadata |
|---|---|---|
| `users.ts::changeUserRole` | `role.changed` | `{ targetUserId, fromRole, toRole }` |
| `users.ts::blockUser` | `user.blocked` | `{ targetUserId, targetEmail }` |
| `users.ts::removeUser` | `user.removed` | `{ targetUserId, targetEmail }` |
| `invitations.ts::sendInvitation` | `invitation.sent` | `{ email, role }` |
| `invitations.ts::acceptInvitation` | `invitation.accepted` | `{ email, role }` |
| `invitations.ts::cancelInvitation` | `invitation.cancelled` | `{ invitationId, email }` |
| `settings.ts::updateOrganization` | `org.updated` | `{ changedFields }` |
| `configurator.ts::saveFactorWeights` | `config.weights_changed` | `{ before: oldWeights, after: newWeights }` |

> **Приоритет логирования:** смена роли, блокировка/удаление пользователя и изменение весов конфигурации — самые важные. Остальные — по возможности.

#### 13.4 UI: вкладка «Журнал аудита» в Настройках

Добавить новую вкладку в существующий экран `/settings`. Только для ролей `owner` и `admin`.

**Компонент: `components/shared/settings/security-log.tsx`**

Простая таблица с колонками: Дата и время / Событие / Действие совершил / Детали.

Отображать последние 100 событий (`ORDER BY created_at DESC LIMIT 100`).

Локализация типов событий (русские метки):

```typescript
const EVENT_LABELS: Record<string, string> = {
  'role.changed':            'Изменение роли',
  'user.blocked':            'Блокировка пользователя',
  'user.removed':            'Удаление пользователя',
  'invitation.sent':         'Отправка приглашения',
  'invitation.accepted':     'Принятие приглашения',
  'invitation.cancelled':    'Отмена приглашения',
  'org.updated':             'Обновление данных организации',
  'config.weights_changed':  'Изменение весов Trust Score',
  'object.created':          'Создание объекта',
  'object.deleted':          'Удаление объекта',
  'risk.created':            'Создание риска',
  'risk.deleted':            'Удаление риска',
};
```

### Критерии готовности

- [ ] Миграция 017 применена, таблица `security_events` создана
- [ ] `createSecurityEvent()` реализован в `lib/security/audit.ts`
- [ ] 8 Server Actions интегрируют логирование
- [ ] Ошибка записи события не блокирует основную операцию
- [ ] UI: вкладка «Журнал аудита» в `/settings` (owner и admin)
- [ ] Таблица показывает последние 100 событий
- [ ] Типы событий отображаются на русском языке
- [ ] `npm run type-check` — 0 ошибок
- [ ] `npm run lint` — 0 предупреждений
- [ ] `npm run build` — успешно

---

## 14. Definition of Done

### Продуктовые критерии

#### RLS (T001)
- [ ] Все 10 таблиц имеют явные политики или задокументированное обоснование их отсутствия
- [ ] `trust_factor_config`: INSERT и DELETE через user-клиент блокируются с ошибкой RLS
- [ ] `trust_passports`: INSERT, UPDATE, DELETE через user-клиент блокируются
- [ ] `trust_score_history`: INSERT, UPDATE, DELETE через user-клиент блокируются
- [ ] `invitations`: UPDATE и DELETE через user-клиент блокируются
- [ ] Новый пользователь без организации видит свой собственный профиль через user-клиент

#### RBAC (T002)
- [ ] `updateOrganization` не принимает `orgId` с клиента; проверяет роль `owner` явно
- [ ] Ни один Server Action не возвращает внутреннее `error.message` от Supabase
- [ ] `acceptInvitation` проверяет `status = 'pending'` и `expires_at > now()` явно в коде

#### Валидация (T003)
- [ ] Каждый мутирующий SA использует Zod-схему перед любой логикой
- [ ] Строки ограничены по длине (`max` параметр в схеме)
- [ ] Enum-поля принимают только допустимые значения

#### Security Headers (T004)
- [ ] Все ответы содержат: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`
- [ ] В production: `Strict-Transport-Security` присутствует
- [ ] Платформа работает без CSP-нарушений в браузерной консоли

#### Rate Limiting (T005)
- [ ] `/join` маршрут: блокировка после 10 запросов/минуту с одного IP
- [ ] Запросы > 100KB блокируются с 413
- [ ] Нормальная работа платформы не затронута

#### Зависимости (T006)
- [ ] `npm audit` — 0 high-severity в production-зависимостях
- [ ] Зависимости, которые не удалось обновить, задокументированы с обоснованием

#### Журнал аудита (T007)
- [ ] 8 критичных событий записываются в `security_events`
- [ ] UI-вкладка «Журнал аудита» доступна для owner и admin
- [ ] Ошибка записи события не блокирует основную операцию SA

### Технические критерии
- [ ] `npm run type-check` — 0 ошибок
- [ ] `npm run lint` — 0 предупреждений
- [ ] `npm run build` — успешно
- [ ] Все существующие функции платформы работают после всех изменений Sprint 06
- [ ] Все новые миграции применены (`npx supabase db push --include-all`)
- [ ] Типы БД регенерированы после каждой миграции

---

## 15. Риски и митигация

| # | Риск | Вероятность | Влияние | Митигация |
|---|---|---|---|---|
| R1 | Next.js 15 breaking changes: `params` в `page.tsx` стали `Promise<PageProps>`, `cookies()` стал async — много файлов требуют обновления | Высокая | Большой объём изменений в T006 | Если объём > 1 дня — обновить только patch-версию Next.js 14, задокументировать CVE как known risk; запланировать обновление в Sprint 09 |
| R2 | CSP блокирует Google Fonts или Supabase WebSocket | Средняя | Шрифты/Realtime не работают | Проверить консоль сразу после настройки T004; корректировать `connect-src` и `font-src` по необходимости |
| R3 | `profiles_select` рефакторинг (T001): новая политика (`id = auth.uid() OR org`) — может сломать onboarding flow | Низкая | Ошибки на странице онбординга | Тестировать с чистым пользователем без организации |
| R4 | Rate limiting в middleware ломает Supabase session refresh | Средняя | Выход из системы при превышении лимита | Rate limiting применяется ДО или ПОСЛЕ `updateSession()` — проверить порядок вызовов; лимиты не применять к `/auth/*` путям |
| R5 | `createSecurityEvent()` fire-and-forget: потеря событий при краше | Низкая | Неполный аудит | Для MVP — приемлемо. Sprint 08 — Edge Function с очередью событий; Sprint 09 — audit completeness check |
| R6 | Zod-валидация (T003) ломает существующие клиентские компоненты, если они передают данные не в той форме | Средняя | UI-ошибки при мутациях | Обновлять SA и соответствующие клиентские компоненты вместе; немедленно запускать `npm run type-check` после каждого файла |
| R7 | `updateOrganization` сигнатура изменяется (T002) — клиентский компонент Settings ещё передаёт `orgId` первым аргументом | Высокая | TypeScript error, сломанный Settings | Обновить Settings-компонент в том же коммите, что и Server Action |

---

## 16. Подготовка к Sprint 07

После Sprint 06 платформа будет иметь:
- Закрытые RLS пробелы на уровне БД
- Явный RBAC без зависимости от случайной защиты
- Строгую валидацию всех входных данных
- HTTP Security Headers
- Базовую защиту от злоупотреблений
- Чистый npm audit
- Журнал аудита безопасности

**Sprint 07 — Полное тестирование платформы** начнётся с:
- Использования `docs/testing/TEST_PLAN_SPRINT_01_03.md` как основы для расширения до полного покрытия
- Тестирования всех RBAC-изменений Sprint 06 специальными тест-кейсами
- Ручного тестирования всех пользовательских сценариев по `docs/testing/MANUAL_TESTING_GUIDE.md`
- Написания автоматизированных E2E-тестов (Playwright) для критичных путей
- Фиксации найденных дефектов по шаблону `docs/testing/BUG_REPORT_TEMPLATE.md`

**Sprint 08** — Product Review & Improvement (UX/UI, недостающие мелкие фичи).

**Sprint 09** — Security Assessment (специализированные инструменты, nonce-based CSP, penetration testing).

По завершении Sprint 09 дальнейший roadmap должен формироваться на основании:
- технического долга, выявленного тестированием (Sprint 07);
- UX-дефектов, найденных при product review (Sprint 08);
- уязвимостей, обнаруженных security assessment (Sprint 09);
- стратегических приоритетов DTEK Core v2.0 (on-premise Enterprise Runtime, ADR-004).

---

*SPRINT 06 — Digital Trust Management Platform*
*Создан: 22.06.2026 | Статус: Готов к старту*
