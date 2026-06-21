# SPRINT 05 — Trust Score Engine, Dashboard & Trust Graph

`Проект: DTEK Core`
`Спринт: 05`
`Дата создания: 21.06.2026`
`Статус: Готов к старту`

---

## Содержание

1. [Цель спринта](#1-цель-спринта)
2. [Место в MVP Release Plan](#2-место-в-mvp-release-plan)
3. [Контекст и анализ](#3-контекст-и-анализ)
4. [Архитектурные решения](#4-архитектурные-решения)
5. [Ёмкость и оценка](#5-ёмкость-и-оценка)
6. [Порядок выполнения](#6-порядок-выполнения)
7. [S05-T001 — Trust Score Calculation Library](#7-s05-t001--trust-score-calculation-library)
8. [S05-T002 — Recalculation Engine: Server Action + Trust Passport Update](#8-s05-t002--recalculation-engine-server-action--trust-passport-update)
9. [S05-T003 — Интеграция Engine в существующие модули](#9-s05-t003--интеграция-engine-в-существующие-модули)
10. [S05-T004 — Dashboard: Центр управления](#10-s05-t004--dashboard-центр-управления)
11. [S05-T005 — Trust Graph: Canvas Engine](#11-s05-t005--trust-graph-canvas-engine)
12. [S05-T006 — Trust Graph: UI, боковая панель, управление связями](#12-s05-t006--trust-graph-ui-боковая-панель-управление-связями)
13. [S05-T007 — Конфигуратор: редактор весов факторов](#13-s05-t007--конфигуратор-редактор-весов-факторов)
14. [Definition of Done](#14-definition-of-done)
15. [Риски и митигация](#15-риски-и-митигация)

---

## 1. Цель спринта

**Превратить DTEK Core из платформы хранения данных в интеллектуальную систему управления цифровым доверием.**

После Sprint 05 платформа будет:
- автоматически рассчитывать Trust Score каждого объекта по 6-факторной формуле из `docs/Trust_Score_Model_v2.md`;
- пересчитывать доверие при каждом изменении рисков или данных объекта;
- хранить полную историю изменений Trust Score с разбивкой по факторам;
- отображать реальный индекс доверия организации на Dashboard;
- визуализировать структуру цифровой инфраструктуры в интерактивном Trust Graph;
- позволять владельцу настраивать веса факторов через Конфигуратор.

Sprint 05 — последний крупный функциональный спринт перед этапом аудита и усиления безопасности платформы.

---

## 2. Место в MVP Release Plan

| Release | Название | Sprint | Статус |
|---|---|---|---|
| R0 | Техническая база | Sprint 01 | ✅ Завершён |
| R1 | Пустая платформа | Sprint 02 | ✅ Завершён |
| R2 | Цифровая модель данных | Sprint 03 | ✅ Завершён |
| R2.1 | Стабилизация | Sprint 04 | ✅ Завершён |
| **R3+R4** | **Trust Score Engine + Visual Model** | **Sprint 05** | 🔜 Текущий |
| R5 | MVP Security Hardening | Sprint 06+ | 🔜 Следующий |

Sprint 05 объединяет Release 3 (Trust Graph) и Release 4 (Trust Score Engine + Dashboard + Configurator) в один спринт, поскольку является финальным этапом функциональной разработки.

**Закрываемые Epic:**
- Epic 8: Trust Score Engine (F-036–F-040)
- Epic 9: Trust Graph (F-041–F-045)
- Epic 10: Dashboard (F-046–F-050)
- Epic 11: Configurator, Phase 2 (F-051–F-053)

---

## 3. Контекст и анализ

### 3.1 Что сейчас работает как временная заглушка

| Элемент | Текущее состояние | Нужно в Sprint 05 |
|---|---|---|
| `objects.trust_score` | Статическое значение из `INITIAL_SCORE[criticality]` при создании, никогда не меняется | Автоматический пересчёт при каждой мутации |
| `trust_passports.*_score` | Все 6 факторных оценок = 70 (дефолт `create_trust_passport()` триггера) | Реальные оценки по формуле из `Trust_Score_Model_v2.md` |
| `trust_passports.completeness_pct` | Всегда 0 | Расчёт по 9 полям объекта |
| `organizations.trust_score` | 70 (дефолт, никогда не обновляется) | Взвешенное среднее по объектам организации |
| `trust_score_history` | Пустая таблица | История изменений при каждом пересчёте |
| `/dashboard` | "Раздел в разработке" | Полноценный Центр управления с реальными данными |
| `/graph` | "Раздел в разработке" | Интерактивный граф с force-layout |
| `/configurator` | "Раздел в разработке" | Редактор весов факторов |
| "Переоценить" в Trust Passport | Кнопка отсутствует | Кнопка → ручной запуск пересчёта |
| "История" в Trust Passport | Секция существует, список пуст | Отображение реальной истории |
| Trust Graph DB | Таблица `relations` готова (schema + RLS + UNIQUE constraint) | Заполнение через UI |

### 3.2 Что уже готово и не требует изменений

- Схема БД: все нужные таблицы существуют (`trust_passports`, `trust_score_history`, `trust_factor_config`, `relations`, `object_risks`)
- `organizations.trust_score` — поле существует
- `notify_trust_recalc` — DB-триггеры подключены к `objects`, `risks`, `relations`; `pg_notify` работает (Edge Function подписчик — Sprint 08)
- `trust_factor_config` — создаётся при онбординге с весами по умолчанию (22/18/18/14/16/12)
- Дизайн Trust Graph: полный canvas-алгоритм написан в `design/src/graph.jsx` (214 строк, без внешних библиотек)
- Дизайн Dashboard: полный дизайн в `design/src/screens_dashboard.jsx`
- Дизайн Trust Passport история: задизайнен в `design/src/screens_trust.jsx`

### 3.3 Ключевой технический вывод

Trust Score Engine в MVP НЕ использует Edge Functions (Sprint 08). Расчёт выполняется как чистая TypeScript-функция, вызываемая из Server Actions синхронно. Это упрощает реализацию, тестирование и деплой, при этом корректно работает для MVP-масштаба организации.

---

## 4. Архитектурные решения

### ADR-S05-001: Trust Score рассчитывается в TypeScript Server Actions (не Edge Functions)

**Проблема:** Триггеры `notify_trust_recalc` отправляют `pg_notify` событие, но нет подписчика. Edge Function требует отдельного деплоя и инфраструктуры Realtime.

**Решение:** Реализовать расчёт как чистую TypeScript-функцию в `lib/trust/calculate.ts`. Вызывать из Server Actions синхронно после каждой мутации. Существующие `pg_notify` триггеры сохраняются — они будут использованы когда в Sprint 08 добавится Edge Function-подписчик для production-масштаба.

**Почему:** Для MVP-количества объектов (<1000) синхронный расчёт в Server Action достаточен и занимает <100ms. Это исключает зависимость от Realtime-инфраструктуры.

**Последствие:** При каждом вызове Server Action (createRisk, updateRisk, updateObject и др.) будет выполняться 3–5 дополнительных SQL-запросов для пересчёта.

---

### ADR-S05-002: Trust Graph реализован на Canvas API без внешних библиотек

**Проблема:** Библиотеки React Flow / sigma.js / D3 добавляют 100–400kb к bundle, имеют свои абстракции, нет гарантии совместимости с Canvas-стилем дизайна.

**Решение:** Портировать custom force-directed алгоритм из `design/src/graph.jsx` в TypeScript. Рендеринг — Canvas API через `<canvas>`. Физика — собственный force simulation: repulsion + spring + gravity.

**Почему:** Алгоритм ПОЛНОСТЬЮ разработан и задокументирован в дизайн-прототипе (функция `useForceGraph` + `TrustGraphCanvas`). Это не разработка с нуля, а портирование готового кода. Zero npm зависимостей.

---

### ADR-S05-003: Recalculation scope — объект-per-мутация, org-index — после каждого объекта

**Проблема:** Изменение одного риска может влиять на несколько объектов (через `object_risks`). Пересчитывать всю организацию при каждой мутации избыточно.

**Решение:**
- При мутации риска → найти все объекты, к которым риск привязан → пересчитать каждый объект → обновить org-индекс.
- При мутации объекта → пересчитать один объект → обновить org-индекс.
- При изменении весов организации → пересчитать ВСЕ объекты → обновить org-индекс.

**Батчинг:** При пересчёте всей организации (изменение весов) — все объекты обрабатываются в одном Server Action последовательно.

---

## 5. Ёмкость и оценка

| Задача | Тип | Сложность | Оценка |
|---|---|---|---|
| S05-T001 | Trust Score Calculation Library | S | 0.5 дня |
| S05-T002 | Recalculation Engine + Trust Passport Update | L | 3 дня |
| S05-T003 | Интеграция Engine в риски и объекты | M | 1.5 дня |
| S05-T004 | Dashboard: Центр управления | M | 2 дня |
| S05-T005 | Trust Graph: Canvas Engine | L | 2.5 дня |
| S05-T006 | Trust Graph: UI + Relation Management | M | 2 дня |
| S05-T007 | Конфигуратор: редактор весов | S | 1 день |
| **Итого** | | | **~12.5 дней** |

---

## 6. Порядок выполнения

```
T001 (Calculation Library)
    └── T002 (Recalculation Engine)
            ├── T003 (Интеграция в риски/объекты)
            │       └── T004 (Dashboard) ← читает обновлённые данные
            └── T007 (Конфигуратор)     ← вызывает массовый пересчёт

T005 (Graph Canvas Engine)             ← независим от Engine
    └── T006 (Graph UI + Relations)
```

**Критический путь:** T001 → T002 → T003 → T004

T005/T006 (Trust Graph) можно начинать параллельно с T002/T003 — они независимы.

---

## 7. S05-T001 — Trust Score Calculation Library

**Оценка:** 0.5 дня | **Зависит от:** — | **Блокирует:** T002, T007

### Цель

Реализовать чистые TypeScript-функции расчёта Trust Score по формуле из `docs/Trust_Score_Model_v2.md`. Никаких обращений к БД — только математика.

### Что необходимо реализовать

**Файл: `lib/trust/calculate.ts`**

```typescript
// Базовые значения по критичности
const BASE: Record<string, number> = {
  critical: 65, high: 70, medium: 75, low: 80,
};

// Штрафы за риски по критичности
const PENALTY: Record<string, number> = {
  critical: 40, high: 25, medium: 15, low: 5,
};

// Маппинг категорий рисков на факторы
const CATEGORY_FACTOR: Record<string, string | null> = {
  vulnerability:  'vuln',
  configuration:  'config',
  access:         'access',
  network:        'network',
  compliance:     'compliance',
  incident:       'incident',
  monitoring:     'incident',
  // organizational, physical, human → null → все факторы равномерно
};

export interface RiskForCalc {
  category: string;
  severity: string;
  status: string;
}

export interface ObjectForCalc {
  criticality: string;
  name: string;
  type: string;
  description: string | null;
  ip_address: string | null;
  os_platform: string | null;
  segment: string | null;
  exposure: string | null;
  owner_id: string | null;
}

export interface FactorWeights {
  vuln_weight: number;
  config_weight: number;
  access_weight: number;
  network_weight: number;
  compliance_weight: number;
  incident_weight: number;
}

export interface FactorScores {
  vuln: number;
  config: number;
  access: number;
  network: number;
  compliance: number;
  incident: number;
}

export interface CalcResult {
  trust_score: number;
  trust_level: string;
  factors: FactorScores;
  completeness_pct: number;
}

// Рассчитать процент заполненности паспорта (9 полей, по весам из документа)
export function calcCompleteness(obj: ObjectForCalc): number {
  let score = 0;
  if (obj.name?.trim())        score += 15; // Название
  if (obj.type?.trim())        score += 10; // Тип
  if (obj.owner_id)            score += 10; // Владелец
  // criticality всегда задана (default medium), считается заполненной
  score += 10;                              // Критичность
  if (obj.description?.trim()) score += 15; // Описание
  if (obj.ip_address?.trim())  score += 10; // IP
  if (obj.os_platform?.trim()) score += 10; // Платформа
  if (obj.segment?.trim())     score += 10; // Сегмент
  if (obj.exposure?.trim())    score += 10; // Экспозиция
  return Math.min(score, 100);
}

// Рассчитать оценку одного фактора
export function calcFactorScore(
  factorKey: string,
  base: number,
  risks: RiskForCalc[],
  completeness: number,
): number {
  // Только активные риски влияют на оценку
  const activeRisks = risks.filter(
    r => r.status === 'open' || r.status === 'in_progress',
  );

  let penalty = 0;
  for (const risk of activeRisks) {
    const mapped = CATEGORY_FACTOR[risk.category] ?? null;
    const affectsThis = mapped === factorKey || mapped === null;
    if (affectsThis) {
      const p = PENALTY[risk.severity] ?? 0;
      penalty += mapped === null ? Math.round(p / 6) : p; // равномерно по 6 факторам
    }
  }

  let bonus = 0;
  if (factorKey === 'compliance') {
    if (completeness >= 95) bonus = 20;
    else if (completeness >= 80) bonus = 10;
  }

  return Math.max(0, Math.min(100, base - penalty + bonus));
}

// Главная функция расчёта Trust Score объекта
export function calcTrustScore(
  obj: ObjectForCalc,
  risks: RiskForCalc[],
  weights: FactorWeights,
): CalcResult {
  const base = BASE[obj.criticality] ?? 75;
  const completeness = calcCompleteness(obj);

  const factors: FactorScores = {
    vuln:       calcFactorScore('vuln',       base, risks, completeness),
    config:     calcFactorScore('config',     base, risks, completeness),
    access:     calcFactorScore('access',     base, risks, completeness),
    network:    calcFactorScore('network',    base, risks, completeness),
    compliance: calcFactorScore('compliance', base, risks, completeness),
    incident:   calcFactorScore('incident',   base, risks, completeness),
  };

  const trust_score = Math.round(
    (factors.vuln       * weights.vuln_weight +
     factors.config     * weights.config_weight +
     factors.access     * weights.access_weight +
     factors.network    * weights.network_weight +
     factors.compliance * weights.compliance_weight +
     factors.incident   * weights.incident_weight) / 100,
  );

  const clamped = Math.max(0, Math.min(100, trust_score));
  const trust_level = scoreTolevel(clamped);

  return { trust_score: clamped, trust_level, factors, completeness_pct: completeness };
}

// Рассчитать организационный индекс доверия (взвешенное среднее по критичности)
export function calcOrgIndex(
  objects: Array<{ trust_score: number; criticality: string }>,
): { trust_score: number; trust_level: string } {
  const CRIT_WEIGHT: Record<string, number> = {
    critical: 4, high: 3, medium: 2, low: 1,
  };
  if (objects.length === 0) return { trust_score: 70, trust_level: 'medium' };

  let weightedSum = 0;
  let totalWeight = 0;
  for (const o of objects) {
    const w = CRIT_WEIGHT[o.criticality] ?? 1;
    weightedSum += o.trust_score * w;
    totalWeight += w;
  }
  const score = Math.round(weightedSum / totalWeight);
  return { trust_score: score, trust_level: scoreTolevel(score) };
}

function scoreTolevel(score: number): string {
  if (score >= 80) return 'high';
  if (score >= 60) return 'good';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'critical';
}
```

### Критерии готовности T001

- [ ] `lib/trust/calculate.ts` создан, все функции экспортированы
- [ ] `calcTrustScore` реализует формулу из `Trust_Score_Model_v2.md` точно
- [ ] `calcCompleteness` считает 9 полей с весами из документа
- [ ] `calcOrgIndex` реализует взвешенное среднее по критичности (4/3/2/1)
- [ ] Функции не делают SQL-запросов — чистая математика
- [ ] `npm run type-check` без ошибок

---

## 8. S05-T002 — Recalculation Engine: Server Action + Trust Passport Update

**Оценка:** 3 дня | **Зависит от:** T001 | **Блокирует:** T003, T004, T007

### Цель

Создать Server Action `recalculateObjectTrust`, который:
1. Загружает объект, его риски и веса факторов организации из БД.
2. Вызывает `calcTrustScore` из T001.
3. Атомарно обновляет `trust_passports`, `objects` и `trust_score_history`.
4. Обновляет `organizations.trust_score`.

### Изменения в базе данных

Новая миграция **`016_trust_passport_update_policy.sql`**:

```sql
-- Разрешить UPDATE trust_passports через service_role (Engine пишет через admin-клиент)
-- INSERT через service_role уже возможен (нет политики ограничивающей INSERT через RLS bypass)
-- Для UPDATE нужно явное разрешение через admin клиент (обходит RLS — это корректно)
-- Добавить UPDATE на organizations для engine
CREATE POLICY "orgs_engine_update" ON organizations FOR UPDATE
    USING (id = current_org_id());
-- Note: фактически пишем через admin (service_role, bypasses RLS), политика для completeness
```

> **Примечание:** На практике все обновления выполняются через `createAdminClient()` (service_role), который обходит RLS. Новая миграция не обязательна если `admin` уже используется — но добавить явную политику для документации архитектуры.

### Что необходимо реализовать

**Файл: `lib/trust/engine.ts`** (Server-only, используется из Server Actions)

```typescript
'use server';
// Движок пересчёта — НЕ экспортировать напрямую в клиент

import { createAdminClient } from '@/lib/supabase/admin';
import { calcTrustScore, calcOrgIndex } from './calculate';
import type { RiskForCalc, ObjectForCalc, FactorWeights } from './calculate';

export async function recalculateObjectTrust(
  objectId: string,
  orgId: string,
): Promise<void> {
  const admin = createAdminClient();

  // 1. Загрузить объект
  const { data: objRaw } = await admin
    .from('objects')
    .select('criticality, name, type, description, ip_address, os_platform, segment, exposure, owner_id, trust_score')
    .eq('id', objectId)
    .eq('organization_id', orgId)
    .single();

  if (!objRaw) return;
  const obj = objRaw as ObjectForCalc & { trust_score: number };

  // 2. Загрузить активные риски объекта
  const { data: riskLinks } = await admin
    .from('object_risks')
    .select('risk:risks(category, severity, status)')
    .eq('object_id', objectId);

  const risks: RiskForCalc[] = (riskLinks ?? [])
    .map((l: unknown) => (l as { risk: RiskForCalc }).risk)
    .filter(Boolean);

  // 3. Загрузить веса факторов организации
  const { data: weightsRaw } = await admin
    .from('trust_factor_config')
    .select('vuln_weight, config_weight, access_weight, network_weight, compliance_weight, incident_weight')
    .eq('organization_id', orgId)
    .single();

  const weights = weightsRaw as FactorWeights ?? {
    vuln_weight: 22, config_weight: 18, access_weight: 18,
    network_weight: 14, compliance_weight: 16, incident_weight: 12,
  };

  // 4. Рассчитать
  const result = calcTrustScore(obj, risks, weights);

  // 5. Обновить trust_passports
  await admin
    .from('trust_passports')
    .update({
      trust_score:      result.trust_score,
      trust_level:      result.trust_level,
      vuln_score:       result.factors.vuln,
      config_score:     result.factors.config,
      access_score:     result.factors.access,
      network_score:    result.factors.network,
      compliance_score: result.factors.compliance,
      incident_score:   result.factors.incident,
      completeness_pct: result.completeness_pct,
      calculated_at:    new Date().toISOString(),
    } as never)
    .eq('object_id', objectId);

  // 6. Обновить objects.trust_score и trust_level
  await admin
    .from('objects')
    .update({
      trust_score: result.trust_score,
      trust_level: result.trust_level,
    } as never)
    .eq('id', objectId)
    .eq('organization_id', orgId);

  // 7. Записать в историю (только если score изменился)
  if (result.trust_score !== obj.trust_score) {
    await admin
      .from('trust_score_history')
      .insert({
        object_id:       objectId,
        organization_id: orgId,
        old_score:       obj.trust_score,
        new_score:       result.trust_score,
        factors_snapshot: result.factors,
        reason:          'recalculation',
        changed_by:      'system',
      } as never);
  }

  // 8. Пересчитать org-индекс
  await recalculateOrgIndex(orgId);
}

export async function recalculateOrgIndex(orgId: string): Promise<void> {
  const admin = createAdminClient();

  const { data } = await admin
    .from('objects')
    .select('trust_score, criticality')
    .eq('organization_id', orgId)
    .eq('status', 'active') // исключаем архивные
    .not('status', 'eq', 'archived');

  const objects = (data ?? []) as Array<{ trust_score: number; criticality: string }>;
  const { trust_score, trust_level } = calcOrgIndex(objects);

  await admin
    .from('organizations')
    .update({ trust_score, trust_level } as never)
    .eq('id', orgId);
}

export async function recalculateAllOrgObjects(orgId: string): Promise<void> {
  const admin = createAdminClient();

  const { data } = await admin
    .from('objects')
    .select('id')
    .eq('organization_id', orgId)
    .neq('status', 'archived');

  const ids = (data ?? []) as Array<{ id: string }>;
  for (const { id } of ids) {
    await recalculateObjectTrust(id, orgId);
  }
}
```

### Trust Passport — обновление UI

Файл `app/(app)/objects/[id]/passport/page.tsx`:
- Данные теперь читаются из `trust_passports` с реальными факторными оценками
- Добавить кнопку **«Переоценить»** → Server Action `triggerRecalculate(objectId)`
- Показывать `calculated_at` — дата последнего расчёта
- Показывать дельту Trust Score (сравнение с предыдущей записью в `trust_score_history`)

**Файл: `lib/actions/trust.ts`** (публичные Server Actions):

```typescript
'use server';
export async function triggerRecalculate(objectId: string) {
  // getAuthCtx → verify ownership → call recalculateObjectTrust
}
```

**Вкладка "История" в деталях объекта** (`/objects/[id]`):
- Реальные данные из `trust_score_history` (последние 20 записей)
- Показывать: дату, old_score → new_score, delta (±), factors_snapshot

### Критерии готовности T002

- [ ] `lib/trust/calculate.ts` импортируется в `lib/trust/engine.ts` без ошибок
- [ ] `recalculateObjectTrust` обновляет `trust_passports`, `objects`, `trust_score_history`
- [ ] `recalculateOrgIndex` обновляет `organizations.trust_score`
- [ ] История записывается только при реальном изменении score
- [ ] `trust_passports.completeness_pct` рассчитывается корректно
- [ ] Кнопка «Переоценить» в Trust Passport работает и показывает новые значения
- [ ] Вкладка «История» в `/objects/[id]` отображает реальную историю
- [ ] `npm run type-check` без ошибок

---

## 9. S05-T003 — Интеграция Engine в существующие модули

**Оценка:** 1.5 дня | **Зависит от:** T002 | **Блокирует:** T004

### Цель

Подключить `recalculateObjectTrust` к существующим Server Actions так, чтобы Trust Score автоматически обновлялся при каждом изменении данных.

### Что необходимо реализовать

**Файл: `lib/actions/risks.ts`** — добавить вызовы пересчёта:

```typescript
import { recalculateObjectTrust } from '@/lib/trust/engine';

export async function createRisk(formData: FormData) {
  // ... существующий код ...
  // После successful insert в object_risks:
  if (objectId && risk) {
    await admin.from('object_risks').insert({ ... });
    await recalculateObjectTrust(objectId, orgId);  // ← НОВОЕ
  }
  revalidatePath('/risks');
}

export async function updateRisk(id: string, formData: FormData) {
  // ... существующий код ...
  // После update: найти все связанные объекты → пересчитать каждый
  const { data: links } = await admin
    .from('object_risks')
    .select('object_id')
    .eq('risk_id', id);
  for (const link of (links ?? [])) {
    await recalculateObjectTrust(link.object_id, orgId);  // ← НОВОЕ
  }
}

export async function updateRiskStatus(id: string, status: string) {
  // ... существующий код ...
  // Пересчитать связанные объекты — статус влияет на активность риска
  const { data: links } = await admin
    .from('object_risks')
    .select('object_id')
    .eq('risk_id', id);
  for (const link of (links ?? [])) {
    await recalculateObjectTrust(link.object_id, orgId);  // ← НОВОЕ
  }
}

export async function deleteRisk(id: string) {
  // Сначала получить связанные объекты ДО удаления
  const { data: links } = await admin
    .from('object_risks')
    .select('object_id')
    .eq('risk_id', id);
  // ... существующий код удаления ...
  // После удаления:
  for (const link of (links ?? [])) {
    await recalculateObjectTrust(link.object_id, orgId);  // ← НОВОЕ
  }
}

export async function linkRiskToObject(riskId, objectId) {
  // ... существующий код ...
  await recalculateObjectTrust(objectId, orgId);  // ← НОВОЕ
}
```

**Файл: `lib/actions/objects.ts`** — добавить пересчёт при обновлении:

```typescript
export async function updateObject(id: string, formData: FormData) {
  // ... обновление полей объекта ...
  await recalculateObjectTrust(id, orgId);  // ← НОВОЕ
  revalidatePath(`/objects/${id}`);
}
```

> Функция `updateObject` уже существует (Sprint 03). Проверить её наличие — если нет, добавить как часть T003.

### Критерии готовности T003

- [ ] После создания риска с привязкой к объекту → `trust_passports.vuln_score` и `objects.trust_score` обновились
- [ ] После изменения статуса риска (open → mitigated) → Trust Score объекта вырос
- [ ] После изменения критичности объекта → Trust Score пересчитан
- [ ] Привязка риска к объекту → немедленный пересчёт
- [ ] Удаление риска → Trust Score объекта восстанавливается

---

## 10. S05-T004 — Dashboard: Центр управления

**Оценка:** 2 дня | **Зависит от:** T003 | **Блокирует:** —

### Цель

Реализовать полноценный Dashboard с реальными данными из Supabase. Дизайн-источник: `design/src/screens_dashboard.jsx`.

### Изменения в БД

Миграция не требуется. Все данные берутся из существующих таблиц.

### Что необходимо реализовать

**Файл: `app/(app)/dashboard/page.tsx`** — Server Component, загружает все данные:

**Запросы к Supabase:**
```typescript
// 1. Профиль организации с Trust Score
const org = await supabase.from('organizations').select('name, short_name, trust_score, trust_level').eq(...).single();

// 2. KPI метрики
const { count: totalObjects } = await supabase.from('objects').select('*', { count: 'exact' }).eq('organization_id', orgId).neq('status', 'archived');
const { count: openRisks } = await supabase.from('risks').select('*', { count: 'exact' }).eq('organization_id', orgId).in('status', ['open', 'in_progress']);
const { count: critRisks } = await supabase.from('risks').select('*', { count: 'exact' }).eq('organization_id', orgId).eq('severity', 'critical').in('status', ['open', 'in_progress']);

// 3. Топ-5 объектов с наименьшим Trust Score
const topRisky = await supabase.from('objects').select('id, name, type, trust_score, trust_level, criticality').eq(...).neq('status', 'archived').order('trust_score', { ascending: true }).limit(5);

// 4. Распределение по уровням доверия (group by trust_level)
// Реализовать через 5 отдельных COUNT запросов или через агрегацию

// 5. История Trust Score организации (последние 30 записей из trust_score_history)
// Для тренда: агрегировать по объектам → последнее значение в день
const history = await supabase.from('trust_score_history').select('new_score, created_at').eq('organization_id', orgId).order('created_at', { ascending: true }).limit(30);

// 6. Последние события (15 записей из trust_score_history)
const events = await supabase.from('trust_score_history').select('object_id, old_score, new_score, reason, created_at, objects(name, type)').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(15);
```

**Компоненты для создания:**

| Компонент | Файл | Описание |
|---|---|---|
| `DashboardPage` | `app/(app)/dashboard/page.tsx` | Server Component, загружает данные |
| `DashboardClient` | `components/shared/dashboard/dashboard-client.tsx` | `'use client'`, интерактивность |
| `KpiCard` | `components/shared/dashboard/kpi-card.tsx` | Карточка метрики (label, value, unit, delta, icon) |
| `TrustTrendChart` | `components/shared/dashboard/trust-trend-chart.tsx` | Линейный SVG-график (без внешних библиотек) |
| `TrustDistribution` | `components/shared/dashboard/trust-distribution.tsx` | Горизонтальные бары по уровням |
| `TopRiskyObjects` | `components/shared/dashboard/top-risky-objects.tsx` | Список 5 объектов с TrustChip |
| `EventFeed` | `components/shared/dashboard/event-feed.tsx` | Лента последних изменений Trust Score |

**CSS:** `app/dashboard.css` — скопировать из `design/src/screens.css` секцию `.dash-*`, `.kpi`, `.hero-trust`, `.dist-*`

**Дизайн Dashboard (из `design/src/screens_dashboard.jsx`):**

```
┌─────────────────────────────────────────────────────┐
│ Центр управления                    [Переоценить]    │
├────────────────────────┬────────────────────────────┤
│ HERO TRUST RING        │ KPI-GRID (2×2):            │
│ TrustRing(150px)       │ - Объектов в модели        │
│ Индекс организации     │ - Открытых рисков          │
│ Уровень + дельта       │ - Критических рисков        │
│ [К графу] [К объектам] │ - % под мониторингом       │
├──────────────────┬─────┴────────────────────────────┤
│ ДИНАМИКА         │ РАСПРЕДЕЛЕНИЕ ПО УРОВНЯМ         │
│ SVG-тренд 30 дн  │ 5 горизонтальных баров           │
│ (за 30/90/1г)    │ Высокое / Достаточное / ... /    │
│                  │ Критическое (count)               │
├──────────────────┼─────────────────────────────────-┤
│ ТОП-5 ОБЪЕКТОВ   │ ЛЕНТА СОБЫТИЙ                    │
│ (низкий Trust)   │ История пересчётов Trust Score   │
│ TrustChip + link │ с объектом и датой               │
└──────────────────┴──────────────────────────────────┘
```

**TrustTrendChart без внешних библиотек:**
- SVG-полилиния с данными из `trust_score_history`
- Нормализация: minScore → maxScore → viewport
- Цвет линии: `var(--teal)`
- Ось X: даты; ось Y: 0–100

### Критерии готовности T004

- [ ] Dashboard отображает реальный `organizations.trust_score` (TrustRing)
- [ ] 4 KPI карточки с реальными данными из Supabase
- [ ] Топ-5 объектов с наименьшим Trust Score (кликабельные — переход в детали)
- [ ] График тренда показывает историю из `trust_score_history`
- [ ] Распределение по уровням доверия (5 уровней)
- [ ] Лента событий (последние изменения Trust Score)
- [ ] CSS соответствует дизайну из `screens_dashboard.jsx`
- [ ] При пустом состоянии (нет объектов) — empty state с подсказкой

---

## 11. S05-T005 — Trust Graph: Canvas Engine

**Оценка:** 2.5 дня | **Зависит от:** — | **Блокирует:** T006

### Цель

Портировать custom force-directed граф из `design/src/graph.jsx` в TypeScript React-компонент. Подключить реальные данные из Supabase. Дизайн-источник: `design/src/graph.jsx` + `design/src/screens_trust.jsx`.

### Что необходимо реализовать

**Файл: `lib/trust/graph-types.ts`** — типы для графа:

```typescript
export interface GraphNode {
  id: string;
  name: string;
  type: string;        // тип объекта или 'org'
  trust_score: number;
  criticality: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx: number | null;
  fy: number | null;
  size: number;        // радиус узла (зависит от критичности)
}

export interface GraphLink {
  id: string;
  source: GraphNode;
  target: GraphNode;
  relation_type: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
```

**Файл: `components/shared/graph/use-force-graph.ts`** — портирование `useForceGraph` из `design/src/graph.jsx`:

```typescript
'use client';
// Точное портирование useForceGraph из дизайна в TypeScript
// Алгоритм: repulsion (кулоновское отталкивание) + spring (пружины) + gravity (к центру)
export function useForceGraph(nodes: GraphNode[], links: GraphLink[], size: { width: number; height: number })
```

**Файл: `components/shared/graph/trust-graph-canvas.tsx`** — портирование `TrustGraphCanvas` из `design/src/graph.jsx`:

```typescript
'use client';
// Canvas-компонент с requestAnimationFrame loop
// Входные данные: nodes, links, selectedId, highlightType, onSelect
// Рендер: ребра (quadraticCurve) → узлы (arc + text) → ореол выбранного
// Взаимодействие: drag-n-drop узлов, pan (drag пустого пространства), wheel zoom, hover, click
```

**Вспомогательные функции:**
```typescript
// Цвет узла по trust_score → trustBand().color
function nodeColor(node: GraphNode): string

// Размер узла по критичности
const NODE_SIZE: Record<string, number> = {
  critical: 22, high: 18, medium: 15, low: 12,
};
// Центральный узел организации: 28px
```

**Файл: `app/(app)/graph/page.tsx`** — Server Component:

```typescript
// Загружает objects (id, name, type, trust_score, criticality) для узлов
// Загружает relations (id, source_object_id, target_object_id, relation_type) для рёбер
// Добавляет центральный узел организации (type: 'org')
// Передаёт в Client Component
```

**Файл: `app/(app)/graph/graph-page-client.tsx`** — `'use client'`:
- Замер размера области (`ResizeObserver` или `useEffect` + `getBoundingClientRect`)
- Рендер `TrustGraphCanvas` с актуальными размерами
- Управление `selectedId` и `highlightType` состоянием

**CSS: `app/graph.css`** — из `design/src/screens.css` секция `.graph-*`:
```css
.graph-screen    /* screen layout */
.graph-layout    /* graph-stage + graph-panel */
.graph-stage     /* flex:1, position:relative */
.graph-panel     /* фиксированная ширина 300px, боковая панель */
.graph-hint      /* подсказки управления */
.graph-legend    /* легенда уровней */
.graph-type-filter /* фильтр по типу */
.gtf             /* кнопка фильтра */
```

### Критерии готовности T005

- [ ] Граф отображает все объекты организации как узлы
- [ ] Центральный узел организации в центре, не перетаскивается
- [ ] Цвет узла соответствует уровню доверия (5 цветов из `TRUST_BANDS`)
- [ ] Размер узла зависит от критичности объекта
- [ ] Force simulation: узлы не накладываются, граф сходится за 2–3 секунды
- [ ] Drag-n-drop узлов работает, после отпускания узел возобновляет симуляцию
- [ ] Zoom (колесо мыши) работает, диапазон 0.5x–2.4x
- [ ] Pan (перетаскивание пустого пространства) работает
- [ ] Hover: подсветка ореола, курсор pointer
- [ ] Ребра из `relations` отображаются как кривые линии

---

## 12. S05-T006 — Trust Graph: UI, боковая панель, управление связями

**Оценка:** 2 дня | **Зависит от:** T005 | **Блокирует:** —

### Цель

Добавить к Canvas-графу: боковую панель выбранного объекта, фильтры по типу, легенду, диалог создания/удаления связей между объектами.

### Изменения в БД

Миграция не требуется. Таблица `relations` готова (Sprint 01).

### Что необходимо реализовать

**Боковая панель (`components/shared/graph/graph-panel.tsx`):**

Состояние: `selected === null` → пустой экран с подсказкой и статистикой.  
Состояние: `selected.type === 'org'` → информация об организации + TrustRing.  
Состояние: `selected` = объект → карточка объекта:

```
┌─────────────────────────┐
│ [иконка]                │
│  Название объекта       │
│  id (mono, усечённый)   │
├─────────────────────────┤
│   TrustRing(110px)      │
│       score / 100       │
├─────────────────────────┤
│ Тип:       Сервер       │
│ Сегмент:   DMZ          │
│ Критичность: [tag]      │
│ Рисков:    3            │
│ Связей:    5            │
├─────────────────────────┤
│ [Паспорт] [Детали]      │
└─────────────────────────┘
```

Кнопки:
- «Паспорт доверия» → `router.push('/objects/[id]/passport')`
- «Детали объекта» → `router.push('/objects/[id]')`

**Управление связями:**

Кнопка «+ Добавить связь» в toolbar (только owner/analyst):
- Диалог: `components/shared/graph/relation-dialog.tsx`
- Форма: Источник (выпадающий список объектов), Тип связи (6 вариантов), Цель
- Server Action: `createRelation(sourceId, targetId, relationType)`
- После сохранения → `router.refresh()` (граф перезагружается с новой связью)

Удаление связи:
- Правый клик по ребру или кнопка в боковой панели (если выбран узел — показать его связи)
- Server Action: `deleteRelation(relationId)`
- Подтверждение через AlertDialog

**Файл: `lib/actions/relations.ts`** — Server Actions для связей:

```typescript
'use server';
export async function createRelation(
  sourceObjectId: string,
  targetObjectId: string,
  relationType: string,
) { /* RBAC: owner/analyst only; verify objects in org; insert into relations */ }

export async function deleteRelation(
  relationId: string,
) { /* RBAC: owner/analyst only; verify relation in org; delete */ }
```

**Фильтры по типу объекта (в toolbar):**
```typescript
// Кнопки для каждого типа из OBJECT_TYPES
// active → highlightType = type, остальные узлы приглушены (opacity 0.25)
// Кнопка "Все" → highlightType = null
```

### Критерии готовности T006

- [ ] Клик по узлу открывает боковую панель с TrustRing и метриками
- [ ] Клик по центральному узлу (org) показывает панель организации
- [ ] Клик по пустому месту → деселект, панель показывает статистику
- [ ] Кнопки «Паспорт» и «Детали» работают (навигация)
- [ ] Диалог создания связи: все 6 типов, проверка на дубли (23505 error), self-link
- [ ] Созданная связь мгновенно появляется на графе после refresh
- [ ] Удаление связи с подтверждением работает
- [ ] Фильтр по типу: приглушение/выделение узлов
- [ ] Легенда уровней доверия отображается
- [ ] Подсказки управления (text overlay на canvas)
- [ ] RBAC: viewer видит граф, но не может создавать/удалять связи

---

## 13. S05-T007 — Конфигуратор: редактор весов факторов

**Оценка:** 1 день | **Зависит от:** T002 | **Блокирует:** —

### Цель

Реализовать страницу Конфигуратора с редактором весов 6 факторов Trust Score. При сохранении — массовый пересчёт всех объектов организации. Дизайн: `docs/Configurator_Concept_Final.md`, ADR-002.

### Что необходимо реализовать

**Файл: `app/(app)/configurator/page.tsx`** — Server Component:
```typescript
// Загрузить trust_factor_config для организации
// Передать в client-компонент
```

**Файл: `components/shared/configurator/weights-editor.tsx`** — `'use client'`:

```
┌────────────────────────────────────────────────────┐
│ Конфигуратор                                       │
│ Настройка весов факторов Trust Score               │
├────────────────────────────────────────────────────┤
│                                                    │
│  Уязвимости       [====|=====] 22%  [input]        │
│  Конфигурация     [====|====]  18%  [input]        │
│  Доступы          [====|====]  18%  [input]        │
│  Сегментация      [===|=====]  14%  [input]        │
│  Соответствие     [====|====]  16%  [input]        │
│  Инциденты        [===|=====]  12%  [input]        │
│                                                    │
│  Сумма: 100 / 100  ✅                               │
│                                                    │
│  [Сбросить по умолчанию]  [Сохранить и пересчитать]│
└────────────────────────────────────────────────────┘
```

- Слайдеры или числовые поля для каждого из 6 факторов
- Live-валидация суммы: показывать `Σ = N / 100`, подсветка красным если N ≠ 100
- Кнопка «Сохранить» активна только при сумме = 100

**Файл: `lib/actions/configurator.ts`** — Server Action:

```typescript
'use server';
export async function saveFactorWeights(formData: FormData) {
  // RBAC: только owner и analyst
  // Валидация: сумма = 100 (дублировать client-side валидацию на сервере)
  // UPDATE trust_factor_config SET vuln_weight=..., ...
  // Вызвать recalculateAllOrgObjects(orgId) из lib/trust/engine.ts
  // revalidatePath('/configurator')
  // revalidatePath('/dashboard')
  // revalidatePath('/objects')
}
```

**CSS:** Переиспользовать существующие классы `.set-field`, `.set-input`, `.set-field-label` из `app/settings.css`.

### Критерии готовности T007

- [ ] Конфигуратор отображает текущие веса организации из `trust_factor_config`
- [ ] Live-счётчик суммы весов, кнопка сохранения неактивна при ≠ 100
- [ ] Сохранение обновляет `trust_factor_config` в БД
- [ ] После сохранения — массовый пересчёт ВСЕХ объектов организации
- [ ] Trust Score объектов обновляется после смены весов
- [ ] RBAC: только owner и analyst видят форму (viewer — только чтение)
- [ ] Кнопка «Сбросить» восстанавливает значения по умолчанию (22/18/18/14/16/12)

---

## 14. Definition of Done

### Продуктовые критерии

#### Trust Score Engine
- [ ] Trust Score объекта рассчитывается автоматически по 6-факторной формуле из `Trust_Score_Model_v2.md`
- [ ] Базовые значения факторов: critical=65, high=70, medium=75, low=80
- [ ] Штрафы за активные риски применяются корректно по категории
- [ ] Бонус completeness (+10/+20) применяется к фактору `compliance`
- [ ] Риски в статусе accepted/mitigated/closed НЕ влияют на Trust Score
- [ ] При добавлении риска → Trust Score снижается, при устранении → восстанавливается
- [ ] `trust_score_history` пополняется при каждом реальном изменении score
- [ ] Организационный индекс пересчитывается с учётом критичности объектов (4/3/2/1)

#### Trust Passport (улучшения)
- [ ] Кнопка «Переоценить» работает и обновляет факторные оценки на странице
- [ ] Вкладка «История» показывает реальные записи из `trust_score_history`
- [ ] `completeness_pct` отображается с реальным значением

#### Dashboard
- [ ] Trust Ring показывает реальный `organizations.trust_score`
- [ ] 4 KPI карточки отображают реальные данные
- [ ] Топ-5 объектов с наименьшим Trust Score
- [ ] Распределение объектов по 5 уровням доверия

#### Trust Graph
- [ ] Граф отображает все объекты организации и их связи из `relations`
- [ ] Force-directed layout: узлы не накладываются
- [ ] Клик по узлу → боковая панель с деталями
- [ ] Аналитик может создать и удалить связь между объектами
- [ ] Фильтр по типу объекта работает

#### Конфигуратор
- [ ] Редактор весов факторов работает
- [ ] После изменения весов → все объекты пересчитываются
- [ ] RBAC: только owner и analyst могут изменять веса

### Технические критерии
- [ ] `npm run type-check` — 0 ошибок
- [ ] `npm run lint` — 0 предупреждений
- [ ] `npm run build` — успешно
- [ ] Все новые таблицы/обновления через admin-клиент (service_role)
- [ ] `calcTrustScore` является чистой функцией без побочных эффектов
- [ ] Canvas-компонент корректно очищает `requestAnimationFrame` при unmount
- [ ] Пересчёт trust_score не падает при отсутствии рисков или весов в БД

---

## 15. Риски и митигация

| # | Риск | Вероятность | Влияние | Митигация |
|---|---|---|---|---|
| R1 | Производительность: пересчёт N объектов при изменении весов | Средняя | UX задержка | Для MVP — последовательный цикл. Добавить индикатор "Пересчёт..." в UI. При >50 объектов — показать предупреждение о времени ожидания |
| R2 | Canvas-граф: производительность на 200+ объектах | Средняя | Низкий FPS | Alpha decay алгоритма `0.985` — симуляция останавливается после ~300 тиков. Тестировать на реальных данных; при необходимости добавить `requestIdleCallback` |
| R3 | `as unknown as Type` в Supabase joins (object_risks → risks) | Высокая | TypeScript error | Использовать тот же паттерн что в Sprint 03: `(data as unknown as TypeName)`. Не использовать `any` |
| R4 | Recalculation loop: updateObject → recalculateObjectTrust → UPDATE objects → updateObject trigger | Средняя | Бесконечный цикл | Engine обновляет `trust_passports` и `objects` через admin напрямую (не через Server Action). Нет рекурсии. DB-триггер `tr_objects_notify_recalc` только шлёт pg_notify, не вызывает recalc |
| R5 | Canvas DPR: размытый граф на Retina-дисплеях | Высокая | Визуальный дефект | Использовать тот же паттерн что в дизайне: `const dpr = Math.min(window.devicePixelRatio \|\| 1, 2)` для canvas.width/height |
| R6 | Dashboard SVG тренд-график при пустой истории | Средняя | Краш UI | Добавить guard: если `history.length < 2` → показать empty state вместо графика |
| R7 | `trust_factor_config` может отсутствовать для старых организаций | Низкая | Engine падает | В `recalculateObjectTrust`: добавить fallback на дефолтные веса (22/18/18/14/16/12) если конфиг не найден |

---

## Дополнительные зависимости для Sprint 06 (Security Hardening)

По завершении Sprint 05 будут готовы:
- Все 4 ключевых экрана платформы с реальными данными
- Engine пересчёта Trust Score (Server Actions)
- Trust Graph с управлением связями
- Конфигуратор с валидацией весов

Sprint 06 может начаться немедленно и сосредоточиться на:
- Аудите RLS политик во всех таблицах
- Усилении RBAC в Server Actions (проверить все пути)
- CSP Headers и Security Headers в `next.config.js`
- Rate limiting на авторизацию и мутации
- Аудите зависимостей (`npm audit`)
- Логировании ошибок и событий безопасности

---

*SPRINT 05 — Digital Trust Management Platform*
*Создан: 21.06.2026 | Статус: Готов к старту*
