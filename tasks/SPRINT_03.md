# SPRINT 03 — Объекты, Паспорт доверия и Реестр рисков

`Проект: DTEK Core`
`Спринт: 03`
`Дата создания: 16.06.2026`
`Статус: Готов к старту`

---

## Содержание

1. [Цель спринта](#1-цель-спринта)
2. [Контекст и охват](#2-контекст-и-охват)
3. [Ёмкость и оценка](#3-ёмкость-и-оценка)
4. [Порядок выполнения](#4-порядок-выполнения)
5. [Обзор задач](#5-обзор-задач)
6. [S03-T001 — Shared компоненты Sprint 03](#6-s03-t001--shared-компоненты-sprint-03)
7. [S03-T002 — Список объектов](#7-s03-t002--список-объектов)
8. [S03-T003 — CRUD объектов](#8-s03-t003--crud-объектов)
9. [S03-T004 — Детали объекта](#9-s03-t004--детали-объекта)
10. [S03-T005 — Trust Passport](#10-s03-t005--trust-passport)
11. [S03-T006 — Реестр рисков](#11-s03-t006--реестр-рисков)
12. [S03-T007 — CRUD рисков и Risk Drawer](#12-s03-t007--crud-рисков-и-risk-drawer)
13. [Definition of Done спринта](#13-definition-of-done-спринта)

---

## 1. Цель спринта

**Наполнить платформу данными** — превратить «пустую платформу» Sprint 02 в рабочий инструмент аналитика ИБ.

По завершении спринта пользователь может: создавать объекты цифровой модели организации (серверы, приложения, учётные записи и др.), открывать Trust Passport каждого объекта с факторной разбивкой, регистрировать риски и привязывать их к объектам. Trust Score отображается на основе базовых значений по критичности — автоматический пересчёт по формуле появится в Sprint 05 (Trust Score Engine).

Это Release 2 «Цифровая модель данных» согласно `tasks/MVP_RELEASE_PLAN.md`.

---

## 2. Контекст и охват

| Параметр | Значение |
|---|---|
| Покрываемый релиз | Release 2 — Цифровая модель данных |
| Покрываемые Epics | Epic 5 — Object Management, Epic 6 — Trust Passport, Epic 7 — Risk Registry |
| Ключевые документы | `docs/Database_Design_Full.md`, `docs/Trust_Score_Model_v2.md`, `ARCHITECTURE_DECISIONS.md` (ADR-001) |
| Дизайн-источники | `design/src/screens_objects.jsx`, `design/src/screens_trust.jsx`, `design/src/screens_risks.jsx`, `design/src/screens.css` |
| Скриншоты дизайна | `design/screens/objects.png`, `objects2.png`, `detail.png`, `passport.png`, `01-risks.png`, `02-risks.png`, `risks-loaded.png` |

**Входящие условия (спринт не начинается без них):**

- Sprint 02 завершён: Auth, организации, App Shell, пользователи, настройки работают стабильно
- В Supabase Cloud применены миграции 005–012 (таблицы `objects`, `trust_passports`, `risks`, `object_risks`, `relations`, `trust_score_history` уже существуют)
- Триггер `tr_create_passport` автоматически создаёт `trust_passports` запись при INSERT в `objects`
- `.env.local` настроен с корректными Supabase ключами

**Что НЕ входит в Sprint 03:**

- Автоматический пересчёт Trust Score по формуле (Sprint 05)
- Trust Graph — визуализация графа связей (Sprint 04)
- PDF-экспорт паспорта (Sprint 07)
- CSV-экспорт реестра рисков (Sprint 07)
- Dashboard (Sprint 06)

---

## 3. Ёмкость и оценка

| | |
|---|---|
| Задач | 7 |
| Суммарная оценка | 30 часов |
| Длительность (1 разработчик) | 4–5 рабочих дней |

**Критический путь:**
```
T001 → T002 → T003 → T004 → T005
                └──→ T006 → T007
```

T001 (Shared компоненты) — единственная точка блокировки: все остальные задачи зависят от него.

---

## 4. Порядок выполнения

```
T001: Shared компоненты (независим, фундамент спринта)
    ├── T002: Список объектов
    │       └── T003: CRUD объектов
    │               ├── T004: Детали объекта
    │               │       └── T005: Trust Passport
    │               └── T006: Реестр рисков
    │                       └── T007: CRUD рисков + Risk Drawer
    └── (T002 и T006 можно начать параллельно после T003)
```

**Примечание:** T006 (Реестр рисков) требует T003 потому что в форме создания риска нужен список объектов организации для привязки.

---

## 5. Обзор задач

| ID | Название | Приоритет | Оценка | Зависит от |
|---|---|---|---|---|
| S03-T001 | Shared компоненты Sprint 03 | P1 | 3 ч | — |
| S03-T002 | Список объектов `/objects` | P1 | 4 ч | T001 |
| S03-T003 | CRUD объектов | P1 | 5 ч | T002 |
| S03-T004 | Детали объекта `/objects/[id]` | P1 | 5 ч | T003 |
| S03-T005 | Trust Passport `/objects/[id]/passport` | P1 | 4 ч | T004 |
| S03-T006 | Реестр рисков `/risks` | P1 | 4 ч | T003 |
| S03-T007 | CRUD рисков и Risk Drawer | P1 | 5 ч | T006 |
| | **Итого** | | **30 ч** | |

---

## 6. S03-T001 — Shared компоненты Sprint 03

**Приоритет:** P1 | **Оценка:** 3 часа | **Зависит от:** —

### Описание

Создать переиспользуемые компоненты и утилиты, которые используются в нескольких задачах спринта. Выполняется первым — без него нельзя начать T002–T007.

### Что нужно создать

**1. Функция `typeGlyph(type: string): string`**

Маппинг типа объекта на имя иконки. Добавить в `lib/design-tokens.ts`:

```typescript
export function typeGlyph(type: string): string {
  const map: Record<string, string> = {
    server:      'server',
    workstation: 'monitor',
    laptop:      'laptop',
    network:     'network',
    app:         'app',
    database:    'db',
    service:     'cloud',
    identity:    'user',
    ot:          'chip',
    policy:      'doc',
    other:       'layers',
  };
  return map[type] ?? 'layers';
}
```

**2. Компонент `CritTag`** — `components/shared/crit-tag.tsx`

Badge критичности объекта. Берёт ключ ('low'/'medium'/'high'/'critical') или русскую метку.

```tsx
import { Badge } from '@/components/ui/badge';

const CRIT_TONE: Record<string, string> = {
  critical: 'crit', high: 'orange', medium: 'amber', low: 'neutral',
};

export function CritTag({ value }: { value: string }) {
  const tone = CRIT_TONE[value] ?? 'neutral';
  const labels: Record<string, string> = {
    critical: 'Критическая', high: 'Высокая', medium: 'Средняя', low: 'Низкая',
  };
  return <Badge tone={tone}>{labels[value] ?? value}</Badge>;
}
```

**3. Компонент `SeverityTag`** — `components/shared/severity-tag.tsx`

Badge серьёзности риска. Аналогичен CritTag, но для рисков.

**4. Компонент `Meter`** — `components/shared/meter.tsx`

Прогрессбар для факторных оценок и CVSS.

```tsx
interface MeterProps { value: number; color: string; h?: number; }

export function Meter({ value, color, h = 8 }: MeterProps) {
  return (
    <div className="meter" style={{ height: h }}>
      <div className="meter-fill" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}
```

**5. Компонент `TrustChip`** — `components/shared/trust-chip.tsx`

Маленький цветной чип с числовым значением Trust Score. Используется в таблицах.

```tsx
import { getTrustBand } from '@/lib/design-tokens';

interface TrustChipProps { value: number; size?: 'sm' | 'md'; }

export function TrustChip({ value, size = 'md' }: TrustChipProps) {
  const band = getTrustBand(value);
  return (
    <span className={`trust-chip ${size}`} style={{ '--c': band.color } as React.CSSProperties}>
      {value}
    </span>
  );
}
```

**6. Компонент `FilterSelect`** — `components/shared/filter-select.tsx`

Кастомный dropdown-фильтр с иконкой. Используется в Objects и Risks.

```tsx
'use client';
interface FilterOption { value: string; label: string; }
interface FilterSelectProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (v: string) => void;
}
export function FilterSelect({ label, value, options, onChange }: FilterSelectProps) { ... }
```

Дизайн: кнопка `.fsel-btn` → `.fsel-menu.pop` с `.fsel-item`.

**7. Компонент `SortCaret`** — `components/shared/sort-caret.tsx`

Индикатор сортировки для заголовков таблиц.

**8. CSS файлы**

Создать три CSS файла, портируя из `design/src/screens.css`:

- `app/objects.css` — стили для объектов: `.otable-*`, `.ocard*`, `.detail-*`, `.dstrip-*`, `.fact`, `.tabs`, `.tab`, `.factors`, `.factor`, `.ov-grid`, `.rmini*`, `.conn-*`, `.timeline`, `.tl-*`, `.fsel*`, `.sort-caret`
- `app/passport.css` — стили паспорта: `.passport-screen`, `.passport-bar*`, `.passport`, `.passport-grain`, `.pp-*`, `.ppf*`, `.back-link`
- `app/risks.css` — стили рисков: `.risk-summary`, `.rsum*`, `.rtable*`, `.rt-*`, `.sla-over`, `.drawer*`, `.drawer-steps`

**Критическое правило при портировании CSS:** Все `var(--border)` из дизайна заменять на `var(--border-subtle)`. Причина: Shadcn/UI резервирует `--border` как HSL-значение, а дизайнный `--border` соответствует нашему `--border-subtle` (`rgba(255,255,255,0.06)`).

### Критерии готовности

- [ ] `typeGlyph()` экспортируется из `lib/design-tokens.ts`
- [ ] `CritTag`, `SeverityTag`, `Meter`, `TrustChip`, `FilterSelect`, `SortCaret` созданы в `components/shared/`
- [ ] `app/objects.css`, `app/passport.css`, `app/risks.css` созданы с полными стилями из дизайна
- [ ] Все `var(--border)` в новых CSS заменены на `var(--border-subtle)`
- [ ] `npm run type-check` без ошибок

---

## 7. S03-T002 — Список объектов

**Приоритет:** P1 | **Оценка:** 4 часа | **Зависит от:** S03-T001

### Описание

Реализовать страницу списка объектов `/objects` по дизайну `ObjectsScreen` из `design/src/screens_objects.jsx`. Заменить текущую заглушку `app/(app)/objects/page.tsx`.

### Что нужно создать

```
app/(app)/objects/page.tsx                        — Server Component: загружает объекты
components/shared/objects/
  objects-list-client.tsx                         — Client Component: таблица/карточки с состоянием
```

**`app/(app)/objects/page.tsx`** — Server Component:

```typescript
import '@/app/objects.css';

export default async function ObjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: objectsRaw } = await supabase
    .from('objects')
    .select(`
      id, name, type, criticality, status, trust_score, trust_level,
      ip_address, os_platform, segment, exposure, updated_at,
      trust_passports(risk_count, open_risk_count, connection_count)
    `)
    .neq('status', 'archived')
    .order('trust_score', { ascending: true });

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single();

  return <ObjectsListClient objects={objects} userRole={profile.role} />;
}
```

**`components/shared/objects/objects-list-client.tsx`** — Client Component:

Состояние: `q` (поиск), `typeF` (фильтр типа), `bandF` (фильтр уровня доверия), `view` ('table' | 'cards'), `sort` (`{ key, dir }`).

**Таблица (`view === 'table'`):**

Колонки по дизайну (`otable-head`, 7 колонок):
- **Объект**: иконка типа + название + `{id} · {exposure}` серым
- **Тип**: текст из `OBJECT_TYPES`
- **Сегмент**: текст
- **Критичность**: `<CritTag />`
- **Риски**: иконка + число (или `0` серым если нет)
- **Доверие**: `<TrustChip />`
- **Обновлён**: относительное время `{n} ч назад`

Клик по строке → `router.push('/objects/${id}')`.

Сортировка по названию, рискам, доверию через `<SortCaret />`.

**Карточки (`view === 'cards'`):**

По дизайну `ocard`: иконка типа + `<TrustRing size={56} stroke={5} animate={false} />`, название, ID, `<CritTag />`, сегмент, риски, связи.

**Фильтры и поиск:**

```
Поиск: по name и id (toLowerCase)
Тип:   FilterSelect — «Все типы» + все из OBJECT_TYPES
Уровень: FilterSelect — «Любой» + 5 уровней доверия
Вид:   Segment (☰ таблица / ▦ карточки)
```

**Skeleton loading:** `<LoadingRows rows={8} cols={7} />` во время загрузки.

**Empty state:** иконка + «Объекты не найдены» + кнопка «Добавить объект».

**Шапка экрана:**
- Заголовок «Объекты» + подзаголовок «{total} объектов в цифровой модели · {shown} показано»
- Кнопки: «Экспорт» (заглушка disabled) + «Добавить объект» (открывает диалог из T003)

### Критерии готовности

- [ ] Страница `/objects` отображает список объектов организации
- [ ] Таблица содержит 7 колонок согласно дизайну
- [ ] Карточный вид переключается кнопкой Segment
- [ ] Поиск фильтрует по названию и ID в реальном времени
- [ ] Фильтры по типу и уровню доверия работают
- [ ] Сортировка по названию, рискам, доверию работает
- [ ] Пустой список показывает empty state
- [ ] Клик по строке/карточке переходит на `/objects/[id]`
- [ ] `npm run type-check` без ошибок

---

## 8. S03-T003 — CRUD объектов

**Приоритет:** P1 | **Оценка:** 5 часов | **Зависит от:** S03-T002

### Описание

Реализовать полный CRUD объектов: форма создания/редактирования, удаление и архивирование. Форма открывается в `Dialog` из кнопок «Добавить объект» (в списке) и «Редактировать» (в деталях). При создании объекта триггер БД автоматически создаёт Trust Passport.

### Что нужно создать

```
components/shared/objects/
  object-form.tsx                                 — Client Component: форма с полями
  object-form-dialog.tsx                          — Client Component: Dialog-обёртка
lib/actions/objects.ts                            — Server Actions: CRUD
```

**`lib/actions/objects.ts`:**

```typescript
'use server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function createObject(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role, organization_id').eq('id', user.id).single();

  if (!['owner', 'analyst', 'admin'].includes(profile?.role ?? ''))
    return { error: 'Недостаточно прав' };

  const type = formData.get('type') as string;

  // admin может создавать только инфраструктурные типы
  const infraTypes = ['server', 'workstation', 'laptop', 'network', 'ot'];
  if (profile?.role === 'admin' && !infraTypes.includes(type))
    return { error: 'Администратор может создавать только инфраструктурные объекты' };

  const criticality = formData.get('criticality') as string;
  // Базовый Trust Score по критичности (Engine в Sprint 05)
  const initialScore = { critical: 65, high: 70, medium: 75, low: 80 }[criticality] ?? 75;
  const initialLevel = { critical: 'low', high: 'medium', medium: 'good', low: 'good' }[criticality] ?? 'medium';

  const { error } = await supabase.from('objects').insert({
    organization_id: profile!.organization_id!,
    name:          formData.get('name') as string,
    type,
    description:   formData.get('description') as string || null,
    criticality,
    ip_address:    formData.get('ip_address') as string || null,
    os_platform:   formData.get('os_platform') as string || null,
    segment:       formData.get('segment') as string || null,
    exposure:      formData.get('exposure') as string || null,
    trust_score:   initialScore,
    trust_level:   initialLevel,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function updateObject(id: string, formData: FormData) { ... }

export async function deleteObject(id: string) {
  // проверить роль owner/analyst
  // DELETE из objects (каскадно удаляет trust_passport, object_risks, relations)
}

export async function archiveObject(id: string) {
  // UPDATE objects SET status = 'archived'
}
```

**Поля формы создания/редактирования:**

| Поле | Тип | Обязательно |
|---|---|---|
| Название | text input | ✅ |
| Тип | Select (11 типов из `OBJECT_TYPES`) | ✅ |
| Описание | textarea | — |
| Критичность | Select: Критическая / Высокая / Средняя / Низкая | ✅ |
| IP-адрес | text input | — |
| Платформа / ОС | text input | — |
| Сегмент | text input | — |
| Экспозиция | Select: Внутренний / Внешний / Изолированный | — |

**RBAC на создание:**
- `owner`, `analyst` — все типы объектов
- `admin` — только инфраструктурные: server, workstation, laptop, network, ot
- `viewer` — создание запрещено (кнопка скрыта)

**Trust Score при создании** (до Sprint 05):
- `critical` → score=65, level='low'
- `high`     → score=70, level='medium'
- `medium`   → score=75, level='good'
- `low`      → score=80, level='good'

**Диалог удаления:** `AlertDialog` из Shadcn с предупреждением «Объект и все связанные данные (паспорт, риски, связи) будут удалены безвозвратно».

### Критерии готовности

- [ ] Диалог «Добавить объект» открывается и содержит все поля
- [ ] После создания объект появляется в списке без перезагрузки страницы
- [ ] Триггер БД автоматически создаёт `trust_passports` запись при создании объекта
- [ ] Trust Score устанавливается по критичности (critical=65, high=70, medium=75, low=80)
- [ ] Admin не может создать объект типа app/database/service/identity/policy (ошибка на сервере)
- [ ] Редактирование изменяет данные, не сбрасывает Trust Score
- [ ] Диалог подтверждения при удалении
- [ ] Удаление каскадно удаляет паспорт, связи и привязки рисков
- [ ] Архивирование скрывает объект из основного списка
- [ ] `npm run type-check` без ошибок

---

## 9. S03-T004 — Детали объекта

**Приоритет:** P1 | **Оценка:** 5 часов | **Зависит от:** S03-T003

### Описание

Реализовать экран деталей объекта `/objects/[id]` по дизайну `ObjectDetail` из `design/src/screens_objects.jsx`. Экран содержит шапку, стрип с TrustRing и 5 табов.

### Что нужно создать

```
app/(app)/objects/[id]/page.tsx                   — Server Component
components/shared/objects/
  object-detail-client.tsx                        — Client Component (управление табами)
  factor-breakdown.tsx                            — Client Component (переиспользуется в паспорте)
  risk-mini-table.tsx                             — Server/Client Component
  conn-list.tsx                                   — Client Component
  history-timeline.tsx                            — Client Component
```

**`app/(app)/objects/[id]/page.tsx`:**

```typescript
import '@/app/objects.css';

export default async function ObjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  // Загрузить объект с паспортом
  const { data: objectRaw } = await supabase
    .from('objects')
    .select(`
      id, name, type, description, criticality, status, trust_score, trust_level,
      ip_address, os_platform, segment, exposure, created_at, updated_at,
      owner:profiles(full_name),
      trust_passports(
        trust_score, trust_level,
        vuln_score, config_score, access_score, network_score, compliance_score, incident_score,
        risk_count, open_risk_count, critical_risk_count, connection_count,
        completeness_pct, calculated_at
      )
    `)
    .eq('id', params.id)
    .single();

  if (!objectRaw) notFound();

  // Загрузить риски объекта
  const { data: risksRaw } = await supabase
    .from('object_risks')
    .select('risks(id, title, severity, status, category, cvss_score, due_date)')
    .eq('object_id', params.id);

  // Загрузить связи объекта
  const { data: relationsRaw } = await supabase
    .from('relations')
    .select(`
      id, relation_type,
      source:objects!source_object_id(id, name, type, trust_score, trust_level),
      target:objects!target_object_id(id, name, type, trust_score, trust_level)
    `)
    .or(`source_object_id.eq.${params.id},target_object_id.eq.${params.id}`);

  return <ObjectDetailClient object={...} passport={...} risks={...} relations={...} userRole={...} />;
}
```

**Структура `ObjectDetailClient`:**

**Шапка (`detail-head`):**
- Иконка типа в круге с цветом уровня доверия (`--c: band.color`)
- Название объекта + `<CritTag />`
- ID · тип · сегмент · IP (`detail-meta`)
- Кнопки: «Переоценить» (disabled, Sprint 05), «Паспорт доверия» (→ `/objects/${id}/passport`)

**Detail strip (`detail-strip`):**
- `<TrustRing value={trustScore} size={96} stroke={7} sub="доверие" />`
- 8 фактов: Уровень (Badge) / Изменение (Delta) / Открытых рисков / Связей / Экспозиция / Владелец / Платформа / Обновлён

**Табы (5 штук):**

1. **Обзор** — `ov-grid`:
   - `<FactorBreakdown compact />` — 2 колонки
   - Активные риски (первые 4)
   - Связанные объекты (`conn-grid`)

2. **Факторы доверия** — `<FactorBreakdown />` полный:
   - 6 факторов из `trust_passports` (vuln_score, config_score, access_score, network_score, compliance_score, incident_score)
   - Каждый: label + вес + Meter + score (цветом уровня доверия)

3. **Риски · N** — `<RiskMiniTable />`:
   - Список рисков: цветная полоска severity + название + ID·категория + Badge статус + CVSS score
   - Empty state «Рисков нет» если рисков нет

4. **Связи · N** — `<ConnList />`:
   - Сетка карточек `conn-card`: иконка типа + название + ID + `<TrustChip />`
   - Empty state «Связей нет. Добавьте в Trust Graph» если связей нет

5. **История** — `<HistoryTimeline />`:
   - Лента событий из `trust_score_history` (в Sprint 03 — статичная заглушка с 3-5 событиями)
   - Формат: dot + время + текст события

**Компонент `FactorBreakdown`:**

```tsx
interface Factor {
  key: string;
  label: string;
  weight: number;
  score: number;
}

interface FactorBreakdownProps {
  factors: Factor[];
  compact?: boolean;
}
```

Берёт факторные оценки из `trust_passports` и сопоставляет с `TRUST_FACTORS` из `design-tokens`.

### Критерии готовности

- [ ] `/objects/[id]` отображает корректные данные объекта
- [ ] Detail strip показывает TrustRing с правильным цветом уровня доверия
- [ ] Все 5 табов переключаются без перезагрузки страницы
- [ ] FactorBreakdown отображает 6 факторов с весами и прогрессбарами
- [ ] Вкладка «Риски» показывает привязанные риски (или empty state)
- [ ] Вкладка «Связи» показывает связанные объекты (или empty state)
- [ ] Кнопка «Паспорт доверия» ведёт на `/objects/[id]/passport`
- [ ] Кнопка «Переоценить» disabled с tooltip «Доступно в Sprint 05»
- [ ] `notFound()` при несуществующем ID
- [ ] `npm run type-check` без ошибок

---

## 10. S03-T005 — Trust Passport

**Приоритет:** P1 | **Оценка:** 4 часа | **Зависит от:** S03-T004

### Описание

Реализовать экран Trust Passport — основного артефакта платформы — по дизайну `TrustPassport` из `design/src/screens_trust.jsx`. Страница доступна по маршруту `/objects/[id]/passport`.

### Что нужно создать

```
app/(app)/objects/[id]/passport/page.tsx          — Server Component
components/shared/objects/trust-passport-client.tsx — Client Component (для анимаций ppf-fill)
```

**`app/(app)/objects/[id]/passport/page.tsx`:**

Загружает тот же набор данных что и ObjectDetailPage (объект + паспорт + риски + связи) и рендерит `TrustPassportClient`.

Импортирует `@/app/passport.css`.

**Структура `TrustPassportClient`:**

**Верхняя панель (`passport-bar`):**
- `← К деталям объекта` (back-link)
- Кнопки: «Поделиться» (заглушка), «PDF» (заглушка с tooltip «Доступно в Sprint 07»), «Переоценить» (заглушка)

**Карточка паспорта (`article.passport`):**

CSS-переменная `--band: band.color` устанавливает цвет акцентной полоски вверху паспорта.

1. **Шапка (`pp-head`):**
   - `pp-kicker`: Logo(18) + «ЦИФРОВОЙ ПАСПОРТ ДОВЕРИЯ»
   - `pp-name`: название объекта
   - `pp-sub`: `{id} · {type} · {orgName}`
   - `pp-tags`: `<CritTag />` + Badge сегмент + Badge экспозиция
   - `pp-head-ring`: `<TrustRing size={168} stroke={12} sub="из 100" />` + `pp-band-tag` (уровень доверия)

2. **Сводка (`pp-summary`, 5 статов):**
   - Изменение за 30 дн (пока заглушка «+0 п.»)
   - Открытых рисков (из `trust_passports.open_risk_count`)
   - Связей в графе (из `trust_passports.connection_count`)
   - Покрытие ПБ (`compliance_score`%)
   - Оценка (`calculated_at` в формате даты)

3. **Секция «Расчёт оценки» (`pp-section`):**
   - Заголовок + `pp-formula mono`: «Trust = Σ (фактор × вес)»
   - `pp-factors` (2-колоночная сетка): каждый фактор = ppf с ppf-head/ppf-bar/ppf-foot
   - `pp-total`: label + составная полоса + итоговое число

   Составная полоса: для каждого фактора сегмент `pp-total-seg` с `flex: contribution`, цвет `trustBand(f.score).color`.

4. **Двухколонная секция (`pp-two-col`):**
   - Левая: «Риски объекта» — список pp-risk (полоска severity + название + meta + score)
   - Правая: «Реквизиты объекта» — pp-meta-grid (8 пар: Идентификатор / Тип / Сетевой адрес / Платформа / Сегмент / Экспозиция / Владелец / Критичность)

5. **Подвал паспорта (`pp-foot`):**
   - `pp-seal`: дашкратный круг с иконкой shield + «Подтверждено DTEK Core» + «SHA-256: …» (декоративный)
   - `pp-qr`: декоративный QR-паттерн 7×7 (49 span'ов с рандомной прозрачностью)

**Passport grain:** `<div className="passport-grain" />` — CSS-текстура, абсолютно позиционирована внутри passport.

### Критерии готовности

- [ ] `/objects/[id]/passport` отображает полный паспорт
- [ ] Trust Ring размером 168px с правильным цветом
- [ ] Акцентная полоска цвета уровня доверия вверху паспорта
- [ ] Все 6 факторов с прогрессбарами и весами
- [ ] Составная полоса Trust Score корректно делится по вкладу факторов
- [ ] Двухколонная секция: риски + реквизиты
- [ ] Декоративная «Печать» и QR-паттерн в подвале
- [ ] Кнопка «PDF» — disabled с tooltip «Доступно в Sprint 07»
- [ ] Back-link ведёт на `/objects/[id]`
- [ ] `npm run type-check` без ошибок

---

## 11. S03-T006 — Реестр рисков

**Приоритет:** P1 | **Оценка:** 4 часа | **Зависит от:** S03-T003

### Описание

Реализовать страницу реестра рисков `/risks` по дизайну `RiskRegister` из `design/src/screens_risks.jsx`. Заменить текущую заглушку `app/(app)/risks/page.tsx`.

### Что нужно создать

```
app/(app)/risks/page.tsx                          — Server Component
components/shared/risks/
  risks-page-client.tsx                           — Client Component: таблица, фильтры, drawer
```

**`app/(app)/risks/page.tsx`:**

```typescript
import '@/app/risks.css';

export default async function RisksPage() {
  const supabase = await createClient();

  // Загрузить риски с привязанным объектом
  const { data: risksRaw } = await supabase
    .from('risks')
    .select(`
      id, title, description, category, severity, probability,
      cvss_score, status, impact, due_date, created_at,
      author:profiles!author_id(full_name),
      owner:profiles!owner_id(full_name),
      object_risks(
        objects(id, name)
      )
    `)
    .order('created_at', { ascending: false });

  return <RisksPageClient risks={risks} userRole={profile.role} objects={objects} />;
}
```

**`components/shared/risks/risks-page-client.tsx`:**

**Шапка:**
- «Реестр рисков» + «{activeCount} активных рисков · приоритизация по влиянию на доверие»
- Кнопки: «Экспорт» (заглушка), «Зарегистрировать риск» (открывает диалог из T007)

**4 счётчика-фильтра (`risk-summary`):**

```
Критические · rsum[severity=critical]
Высокие     · rsum[severity=high]
Средние     · rsum[severity=medium]
Низкие      · rsum[severity=low]
```

Клик по счётчику — фильтрация таблицы по severity. Повторный клик — сброс.

**Поиск и фильтры:**
- `search-box`: поиск по title, id, объекту
- `FilterSelect` «Статус»: Все / Открыт / В работе / Принят / Закрыт / Устранён

**Таблица рисков (`rtable`):**

6 колонок по дизайну:
- **Риск**: цветная полоска severity + название + ID (mono)
- **Объект**: кнопка-ссылка с именем объекта → `/objects/[id]`
- **Категория**: текст на русском
- **Статус**: `<Badge dot tone={...}>` (orange=Открыт, info=В работе, neutral=остальные)
- **SLA**: дата или «Просрочен» красным (`sla-over`)
- **Оценка**: CVSS score цветом severity

Клик по строке → открывает `<RiskDrawer />`.

**Маппинг категорий на русский:**

```typescript
const CATEGORY_LABELS: Record<string, string> = {
  vulnerability: 'Уязвимость', configuration: 'Конфигурация', access: 'Доступ',
  network: 'Сеть', compliance: 'Соответствие', incident: 'Инцидент',
  monitoring: 'Мониторинг', organizational: 'Организационный',
  physical: 'Физический', human: 'Человеческий', other: 'Прочее',
};
```

**SLA отображение:**
- `due_date` < `now()` → «Просрочен» с классом `sla-over`
- `due_date` = null → «—»
- иначе → форматированная дата

**Loading skeleton:** `<LoadingRows rows={8} cols={6} />`.

**Empty state:** «Рисков не найдено» при пустом списке.

**State риска выделяется** классом `rtable-row sel` при выборе.

### Критерии готовности

- [ ] `/risks` отображает все риски организации
- [ ] 4 счётчика-фильтра показывают корректные числа
- [ ] Клик по счётчику фильтрует таблицу по severity
- [ ] Поиск фильтрует по названию, ID, объекту
- [ ] Фильтр по статусу работает
- [ ] Просроченные риски отображаются красным «Просрочен»
- [ ] Клик по строке открывает Risk Drawer
- [ ] Клик по названию объекта переходит в `/objects/[id]`
- [ ] `npm run type-check` без ошибок

---

## 12. S03-T007 — CRUD рисков и Risk Drawer

**Приоритет:** P1 | **Оценка:** 5 часов | **Зависит от:** S03-T006

### Описание

Реализовать создание/редактирование рисков и боковую панель деталей (`RiskDrawer`) по дизайну `design/src/screens_risks.jsx`. Только `owner` и `analyst` могут создавать и редактировать риски.

### Что нужно создать

```
components/shared/risks/
  risk-form-dialog.tsx                            — Client Component: форма создания/редактирования
  risk-drawer.tsx                                 — Client Component: боковая панель деталей
lib/actions/risks.ts                              — Server Actions
```

**`lib/actions/risks.ts`:**

```typescript
'use server';

export async function createRisk(formData: FormData) {
  // проверить роль: только owner, analyst
  // INSERT в risks + INSERT в object_risks если объект выбран
  // SLA: если sla_days задан, due_date = now() + sla_days days
}

export async function updateRisk(id: string, formData: FormData) {
  // проверить роль: только owner, analyst
  // UPDATE risks
}

export async function deleteRisk(id: string) {
  // проверить роль: только owner, analyst
  // DELETE risks (каскадно удаляет object_risks)
}

export async function updateRiskStatus(id: string, status: string) {
  // проверить роль
  // UPDATE risks SET status = $1
  // если status = 'mitigated' | 'closed': resolved_at = now()
}

export async function linkRiskToObject(riskId: string, objectId: string) {
  // INSERT в object_risks (UNIQUE constraint предотвращает дублирование)
  // проверить роль: owner, analyst, admin
}
```

**Форма создания/редактирования (`risk-form-dialog.tsx`):**

| Поле | Тип | Обязательно |
|---|---|---|
| Название | text input | ✅ |
| Описание | textarea | — |
| Категория | Select (11 категорий на русском) | ✅ |
| Серьёзность | Select: Критический / Высокий / Средний / Низкий | ✅ |
| Вероятность | Select: Высокая / Средняя / Низкая | — |
| CVSS Score | number input (0–10, step 0.1) | — |
| Привязать к объекту | Select объектов организации | — |
| SLA (дней) | number input | — |

После создания: закрыть диалог, обновить список рисков (revalidatePath).

**Risk Drawer (`risk-drawer.tsx`):**

Боковая панель, открывающаяся поверх контента.

```tsx
// drawer-overlay + aside.drawer
// Анимации: fade (overlay), slidein (drawer) — CSS keyframes из design
```

Структура по дизайну:

1. **`drawer-head`:**
   - `<SeverityTag />` + кнопка закрытия (X)
   - Название риска (drawer-title)
   - ID риска (drawer-id mono)

2. **`drawer-body`:**
   - `drawer-score`: CVSS score (40px mono) + label + `<Meter />`
   - `drawer-meta` (2-колонка): Объект / Категория / Статус / Владелец / Возраст / SLA / Влияние
   - Секция «Влияние на доверие»: текст «Устранение повысит доверие объекта на ~{N} пунктов»
   - Секция «Рекомендуемые действия»: нумерованный список `drawer-steps`

3. **`drawer-foot`:**
   - «Принять риск» (ghost) → `updateRiskStatus(id, 'accepted')`
   - «Взять в работу» (primary) → `updateRiskStatus(id, 'in_progress')`
   - Если статус `in_progress`: кнопка «Устранить» → `updateRiskStatus(id, 'mitigated')`

**Влияние на доверие (приближение в Sprint 03):**
Рассчитывается приближённо по CVSS score:
```
impact ≈ CVSS × 2  (округлить до целого)
```
Точный расчёт появится в Sprint 05 когда будет Trust Score Engine.

**Привязка риска к объекту из Drawer:**
Кнопка «Привязать к объекту» (если риск не привязан) → inline Select объектов → `linkRiskToObject`.

### Критерии готовности

- [ ] Диалог «Зарегистрировать риск» содержит все поля
- [ ] Созданный риск появляется в реестре без перезагрузки
- [ ] Risk Drawer открывается при клике на строку таблицы
- [ ] Drawer содержит все секции из дизайна: score, meta, влияние, рекомендации
- [ ] Кнопки «Принять риск» и «Взять в работу» меняют статус
- [ ] SLA рассчитывается от даты создания + sla_days
- [ ] Просрочка SLA отображается красным
- [ ] RBAC: viewer не видит кнопку «Зарегистрировать риск»; admin не может создавать риски
- [ ] `npm run type-check` без ошибок
- [ ] `npm run build` успешно

---

## 13. Definition of Done спринта

Спринт считается завершённым, когда выполнены **все** следующие условия:

### Продуктовые

- [ ] Аналитик может создать объект любого типа с заполнением всех полей
- [ ] При создании объекта автоматически создаётся Trust Passport с базовым Trust Score
- [ ] Trust Passport открывается для каждого объекта с полной факторной разбивкой
- [ ] Аналитик может зарегистрировать риск и привязать его к объекту
- [ ] Реестр рисков отображает все риски с фильтрацией и поиском
- [ ] Risk Drawer открывается по клику и показывает полные детали риска
- [ ] Статус риска можно сменить из Drawer

### Технические

- [ ] Все страницы `/objects`, `/objects/[id]`, `/objects/[id]/passport`, `/risks` рендерятся без ошибок
- [ ] RLS: пользователь видит только объекты и риски своей организации
- [ ] Триггер `tr_create_passport` работает: Trust Passport создаётся автоматически
- [ ] RBAC: admin не может создавать объекты не инфраструктурных типов
- [ ] RBAC: viewer и admin не могут создавать риски
- [ ] `npm run type-check` завершается с кодом 0
- [ ] `npm run lint` без ошибок
- [ ] `npm run build` успешно
- [ ] Все изменения закоммичены в `develop`, запушены в `origin/develop`
- [ ] `.env.local` не закоммичен

### UX

- [ ] Loading skeleton отображается при загрузке таблиц
- [ ] Empty state отображается при пустых списках
- [ ] Toast-уведомления при создании объекта, риска, смене статуса
- [ ] CSS скопирован точно из `design/src/screens.css` без изменения визуала
- [ ] Все `var(--border)` из дизайна заменены на `var(--border-subtle)` в новых CSS файлах

---

## Риски

| Риск | Вероятность | Влияние | Митигация |
|---|---|---|---|
| `var(--border)` конфликт с Shadcn в новых CSS | Высокая | Визуальный баг | Правило: заменять на `--border-subtle` при портировании. Проверять в review |
| `trust_passports` таблица readonly (RLS: только SELECT) | Известно | — | Паспорт создаётся триггером `tr_create_passport` автоматически. Прямые INSERT/UPDATE клиентом запрещены |
| Тип данных `as unknown as Type` в Supabase запросах | Средняя | TypeScript error | Использовать тот же паттерн что в Sprint 02 (`as unknown as Type | null`) |
| Risk Drawer + mobile viewport | Низкая | UX | `width: min(440px, 92vw)` из дизайна покрывает мобильные |
| Большие списки объектов (500+) | Низкая | Производительность | Pagination в Sprint 03 не требуется (MVP scope), добавить в backlog |

---

## Зависимости для Sprint 04

Sprint 04 (Trust Graph) стартует после завершения Sprint 03. Требования:

- Объекты существуют в БД — узлы графа = объекты
- Таблица `relations` готова к заполнению (схема из миграции 011)
- Trust Passport реализован — боковая панель в графе открывает паспорт
- App Shell работает — Trust Graph добавляется как страница `/graph` в существующий layout

---

*SPRINT 03 — Digital Trust Management Platform*
*Создан: 16.06.2026 | Статус: Готов к старту*
