# Evidence_Explainability_Model.md — DTEK Core

`Статус: утверждённая спецификация Sprint 12`  
`Дата: 16.07.2026`  
`Sprint: S12-T001 — Evidence-backed Explainability Model Specification`  
`Основа: ADR-001, ADR-007, Trust_Score_Model_v2.md, Evidence_Import_Schema.md`

---

## 1. Назначение

Документ определяет единый explainability contract для Trust Score: какие причины показываются пользователю, как они выводятся из существующей формулы и как source/evidence context связывается с объяснением.

Спецификация является основой для S12-T002–S12-T006 и не меняет:

- формулу ADR-001;
- шесть факторов Trust Score;
- веса по умолчанию;
- текущую схему БД;
- RBAC/RLS;
- продуктовую границу DTEK Core.

Explainability не является отдельным score engine. Это детерминированное представление тех же входных данных и промежуточных результатов, которые использует `lib/trust/calculate.ts`.

---

## 2. Решение

Для Market MVP принимается четырёхуровневая модель объяснимости:

```text
Trust Score
  -> Top Score Drivers
      -> Factor Reason Cards
          -> Risks / Completeness / Criticality
              -> Source Context / Future Evidence
```

Пользователь должен последовательно получить ответы:

1. Каков итоговый Trust Score и уровень доверия?
2. Какие факторы сильнее всего отклоняют оценку от нейтрального уровня?
3. Из каких base, penalties и bonus получена оценка каждого фактора?
4. Какие риски и данные создали эти penalties и bonus?
5. Откуда пришли исходные данные и насколько источник подтверждён?

Все числовые объяснения должны воспроизводиться теми же pure functions, что и итоговый Trust Score. UI не рассчитывает собственную альтернативную формулу.

---

## 3. Термины И Граница Достоверности

| Термин | Значение в Sprint 12 |
|---|---|
| `source context` | Метаданные происхождения ручной или импортированной записи |
| `evidence record` | Будущая самостоятельная запись Evidence Layer; в текущей схеме отсутствует |
| `driver` | Фактор, который повышает или снижает итог относительно нейтрального уровня 70 |
| `reason` | Детерминированная причина факторной оценки: criticality base, risk penalty или completeness bonus |
| `impact hint` | Контрфактическая оценка результата без одного активного риска |
| `score delta` | Фактическая разница между двумя записями Trust Score history |

Импортированная запись со `source_name`, `source_type`, `source_collected_at` и `confidence` является source-aware, но не должна называться полноценным evidence record до реализации Evidence Layer.

`confidence` в Sprint 12:

- показывается как metadata источника;
- не влияет на Trust Score;
- не является независимо проверенной вероятностью;
- не используется для автоматической фильтрации причин.

---

## 4. Источники Данных Market MVP

| Explainability block | Текущий источник |
|---|---|
| Итоговый Score и уровень | `objects`, `trust_passports` |
| Факторные оценки | `trust_passports.*_score` или повторный расчёт текущим engine |
| Веса факторов | `trust_factor_config` |
| Criticality base | `objects.criticality` |
| Completeness | поля `objects`, алгоритм `calcCompleteness` |
| Risk penalties | `object_risks` + активные `risks` |
| Source context объекта | trailing `[Import Source]` block в `objects.description` |
| Source context риска | trailing `[Import Source]` block в `risks.description` |
| История изменения | `trust_score_history` |
| Полноценные evidence records | недоступны до Evidence Layer |

Explainability query всегда ограничивается текущей организацией. Связь риска и объекта считается допустимой только после tenant-scoped проверки обеих сущностей.

---

## 5. Канонический Доменный Контракт

Ниже приведён логический TypeScript contract для задач реализации. Названия могут быть адаптированы к существующему коду, но семантика полей должна сохраняться.

```ts
type TrustFactorKey =
  | 'vuln'
  | 'config'
  | 'access'
  | 'network'
  | 'compliance'
  | 'incident';

type DriverDirection = 'negative' | 'positive' | 'neutral';
type ProvenanceKind = 'manual' | 'import' | 'system_derived' | 'evidence';

interface SourceContext {
  kind: ProvenanceKind;
  sourceName: string;
  sourceType: string | null;
  sourceRecordId: string | null;
  collectedAt: string | null;
  confidence: 'low' | 'medium' | 'high' | null;
  isEvidenceRecord: boolean;
}

interface RiskReason {
  riskId: string;
  title: string;
  severity: string;
  status: string;
  rawPenalty: number;
  appliedPenalty: number;
  source: SourceContext;
}

interface FactorExplanation {
  key: TrustFactorKey;
  score: number;
  weight: number;
  base: number;
  appliedPenalty: number;
  completenessBonus: number;
  wasClamped: boolean;
  weightedContribution: number;
  neutralDelta: number;
  direction: DriverDirection;
  risks: RiskReason[];
  sources: SourceContext[];
}

interface TrustScoreExplanation {
  score: number;
  level: string;
  neutralReference: 70;
  completenessPct: number;
  factors: FactorExplanation[];
  topDrivers: FactorExplanation[];
  limitations: string[];
  calculatedAt: string | null;
}
```

Этот contract является read model. Он не требует новой таблицы и не должен сохраняться как второй источник истины.

---

## 6. Каноническая Математика Объяснения

### 6.1 Factor Base

Base полностью совпадает с ADR-001:

| Criticality | Base |
|---|---:|
| `low` | 80 |
| `medium` | 75 |
| `high` | 70 |
| `critical` | 65 |

Criticality base является контекстом модели, а не отдельным риском.

### 6.2 Risk Penalty

Учитываются только риски в статусе `open` или `in_progress`.

| Severity | Raw penalty |
|---|---:|
| `low` | 5 |
| `medium` | 15 |
| `high` | 25 |
| `critical` | 40 |

Риск с factor-specific category даёт полный penalty соответствующему фактору. Категории `organizational`, `physical`, `human`, `other` и неизвестная категория распределяются по всем факторам согласно фактическому engine:

```text
applied_penalty_per_factor = round(raw_penalty / 6)
```

Это правило должно переиспользовать общую модель, а не дублироваться в UI.

### 6.3 Completeness Bonus

Bonus применяется только к `compliance`:

| Completeness | Bonus |
|---|---:|
| `< 80%` | 0 |
| `80–94%` | 10 |
| `>= 95%` | 20 |

Незаполненные поля не создают отдельный штраф. Они только не позволяют получить bonus. UI не должен формулировать отсутствие bonus как штраф.

### 6.4 Factor Score

```text
unclamped_factor = base - applied_penalty + completeness_bonus
factor_score = clamp(unclamped_factor, 0, 100)
```

Если сработал clamp, карточка показывает:

- фактический суммарный applied penalty фактора;
- исходные severity penalties связанных рисков в раскрытых причинах;
- итоговую оценку 0 или 100;
- примечание, что часть арифметического воздействия не меняет Score из-за границы модели.

### 6.5 Weighted Contribution

```text
weighted_contribution = factor_score * factor_weight / 100
trust_score = round(sum(weighted_contribution))
```

В деталях допускается один знак после запятой. Итоговый Trust Score отображается целым числом. Разница до 0.5 между суммой отображаемых вкладов и целым итогом объясняется финальным округлением.

### 6.6 Neutral Delta

Для ранжирования top drivers используется единая нейтральная точка ADR-001 — 70:

```text
neutral_delta = (factor_score - 70) * factor_weight / 100
```

| Значение | Direction | Смысл |
|---|---|---|
| `< -0.05` | `negative` | фактор тянет Score ниже нейтрального уровня |
| `> 0.05` | `positive` | фактор поднимает Score выше нейтрального уровня |
| иначе | `neutral` | материального отклонения нет |

`neutral_delta` объясняет вклад относительно reference 70. Это не прогноз изменения после исправления конкретного риска.

---

## 7. Factor Reason Card

Для каждого из шести факторов карточка показывает:

1. Название, оценку и вес.
2. Взвешенный вклад в итоговый Score.
3. Base по criticality объекта.
4. Активные риски, вошедшие в penalty.
5. Суммарный applied penalty фактора.
6. Completeness bonus для `compliance`.
7. Source context объекта и влияющих рисков.
8. Состояние clamp, если оно применилось.

Обязательная арифметическая строка:

```text
70 base - 25 penalties + 0 bonus = 45 factor score
45 × 22% = 9.9 contribution
```

Если активных рисков нет:

```text
Активные риски этого фактора не зарегистрированы.
```

Формулировка не должна означать, что у объекта гарантированно нет проблем: отсутствие зарегистрированных рисков может отражать отсутствие данных.

---

## 8. Top Score Drivers

Top drivers строятся на уровне факторов, а причины каждого фактора раскрываются внутри reason card.

Алгоритм:

1. Рассчитать `neutral_delta` для всех шести факторов.
2. Исключить материально нейтральные факторы с `abs(neutral_delta) <= 0.05`.
3. Отсортировать по `abs(neutral_delta)` по убыванию.
4. При равенстве использовать стабильный порядок: `vuln`, `config`, `access`, `network`, `compliance`, `incident`.
5. Показать не более пяти факторов.
6. Не придумывать минимум из трёх: если значимых факторов меньше, показать фактическое количество.

Для каждого driver показываются:

- factor score;
- weight;
- направление;
- `neutral_delta` с одним знаком после запятой;
- краткая главная причина: active risk с наибольшим applied penalty, completeness bonus или criticality base.

Если все факторы нейтральны:

```text
Материальных отклонений от нейтрального уровня не обнаружено.
```

---

## 9. Risk Impact Hint

Impact одного риска рассчитывается counterfactual способом через тот же Trust Score Engine:

```text
current = calcTrustScore(object, allCurrentRisks, weights)
withoutRisk = calcTrustScore(object, allCurrentRisksExceptTarget, weights)
potentialGain = max(0, withoutRisk.trust_score - current.trust_score)
```

Удаление риска из набора эквивалентно переводу в неактивный статус для расчёта. Counterfactual автоматически учитывает:

- category mapping;
- distributed penalties;
- factor weights;
- clamp;
- финальное округление;
- взаимодействие с другими рисками.

Правила отображения:

| Состояние | Copy |
|---|---|
| Активный риск, gain > 0 | `Закрытие риска может повысить Trust Score объекта примерно на N` |
| Активный риск, gain = 0 | `В текущей конфигурации закрытие риска не изменит округлённый Trust Score` |
| Неактивный риск | `Риск сейчас не влияет на Trust Score` |
| Нет связи с объектом | Impact не рассчитывается |

Impact является ориентиром, а не гарантией: до фактического закрытия могут измениться другие риски, поля объекта и веса факторов.

Если риск связан с несколькими объектами, результат рассчитывается отдельно для каждого объекта. Значения разных объектов не суммируются в единый «общий прирост», поскольку у них независимые Trust Score.

---

## 10. Score Delta Explanation

Базовая формула:

```text
score_delta = history.new_score - history.old_score
```

Explainability timeline использует только подтверждённые данные:

- фактический overall delta берётся из одной записи `trust_score_history`;
- factor delta рассчитывается только при наличии текущего и предыдущего `factors_snapshot`;
- `reason`, `changed_by` и `created_at` показываются как metadata события;
- source context может показываться как текущий контекст данных, но не как доказанная причина события без явной связи history -> evidence.

Текущие ограничения истории:

- первая запись может не иметь предыдущего factor snapshot;
- фактический engine сохраняет factor scores, но не snapshot весов;
- `reason` является текстом и не содержит структурированную ссылку на риск/import/evidence;
- import source timestamp не связан напрямую с history event.

Поэтому S12-T005 должен иметь честный fallback:

```text
Score изменился с 58 до 63 (+5). Детализация причин для этой записи ограничена историческими данными.
```

Нельзя реконструировать точную причинность предположением или связывать события только по близкому времени.

---

## 11. Source И Evidence Context

### 11.1 Current Import Source

Sprint 11 добавляет trailing block:

```text
[Import Source]
source_name: MaxPatrol VM
source_type: vulnerability_export
source_record_id: vm-1001
source_collected_at: 2026-07-15
confidence: high
```

Для Explainability этот блок читается как source context. Парсер должен:

- распознавать только последний отдельный `[Import Source]` block;
- принимать только известные ключи;
- не менять пользовательское описание;
- безопасно обрабатывать отсутствующие и malformed поля;
- возвращать manual/unknown fallback вместо ошибки страницы;
- не интерпретировать содержимое как HTML.

`source_record_id` является идентификатором внешнего источника, а не внутренним DTEK Core ID. В компактном UI он скрыт и доступен только в раскрытых технических деталях.

### 11.2 Manual Data

Если source block отсутствует:

```text
Источник: ручные данные DTEK Core
```

Ручные данные являются допустимым источником Market MVP, но не должны маркироваться как автоматически подтверждённые.

### 11.3 Future Evidence Layer

После реализации Evidence Layer `SourceContext` может ссылаться на immutable evidence record с:

- source identity;
- observed/collected time;
- confidence;
- freshness;
- raw evidence reference;
- normalized assertion;
- связь с object/risk/factor/history event.

Расширение должно сохранить текущий explainability contract и заменить источник данных, а не переписать UI-модель.

---

## 12. User-facing Copy Contract

Копирайтинг должен:

- объяснять причину простым русским языком;
- показывать числовую основу рядом с выводом;
- использовать «может повысить» и «примерно» для counterfactual impact;
- различать «нет зарегистрированных рисков» и «рисков нет»;
- различать source context и evidence;
- не использовать формулировки абсолютной безопасности.

Запрещённые формулировки:

- `Объект безопасен`;
- `Риск гарантированно повысит Score на N`;
- `Источник подтверждает отсутствие уязвимостей` при отсутствии evidence coverage;
- `AI определил причину`, поскольку ML/LLM не участвует в модели.

---

## 13. Empty, Partial И Error States

| Состояние | Поведение |
|---|---|
| Паспорт существует, рисков нет | Показать base, completeness и отсутствие зарегистрированных активных рисков |
| Source context отсутствует | Показать manual source fallback |
| Source block malformed | Не ломать страницу; показать unknown/manual source и ограничение |
| Factor config отсутствует | Использовать утверждённые default weights |
| History отсутствует | Скрыть delta timeline и показать нейтральное empty state |
| Первый history snapshot | Показать overall delta без выдуманной factor causality |
| Explainability query failed | Безопасное error state без SQL/internal details |
| Данные Score и повторный расчёт расходятся | Показать сохранённый Score и зафиксировать diagnostic event; не смешивать значения |

---

## 14. Security И Multi-tenant Требования

- Explainability доступна всем ролям, имеющим read access к объекту и Trust Passport: `owner`, `analyst`, `admin`, `viewer`.
- Все запросы выполняются в tenant context текущей организации и сохраняют действующие RLS policies.
- Для read model не требуется `service_role` на клиенте.
- Внутренние organization/profile IDs, service keys и raw ошибки не попадают в UI.
- Source metadata выводится как plain text с безопасным escaping.
- Explainability не расширяет права на просмотр рисков, объектов или истории.
- Counterfactual calculation является read-only и не изменяет риск, Score или history.
- Будущая ссылка на raw evidence должна проходить отдельную authorization проверку.

---

## 15. Контракт Для Задач Sprint 12

| Задача | Используемая часть спецификации |
|---|---|
| S12-T002 | `neutral_delta`, stable ranking, top drivers, empty state |
| S12-T003 | factor arithmetic, risk reasons, source context, clamp state |
| S12-T004 | counterfactual risk impact через текущий engine |
| S12-T005 | history delta, adjacent snapshots, honest causality fallback |
| S12-T006 | агрегирование уже рассчитанных object drivers без новой формулы |
| S12-T007 | user-facing copy и граница достоверности |
| S12-T008 | сверка UI с engine, rounding, clamp, source и RBAC cases |

Dashboard summary в S12-T006 должен агрегировать object-level explanations. Он не вводит отдельный организационный scoring algorithm.

---

## 16. Worked Example

Объект `srv-db-01`:

- criticality `high`, base 70;
- completeness 85%, compliance bonus +10;
- risk A: `vulnerability/high`, penalty 25;
- risk B: `configuration/medium`, penalty 15;
- default weights.

| Factor | Base | Penalty | Bonus | Score | Weight | Contribution | Neutral delta |
|---|---:|---:|---:|---:|---:|---:|---:|
| `vuln` | 70 | 25 | 0 | 45 | 22% | 9.9 | -5.5 |
| `config` | 70 | 15 | 0 | 55 | 18% | 9.9 | -2.7 |
| `access` | 70 | 0 | 0 | 70 | 18% | 12.6 | 0.0 |
| `network` | 70 | 0 | 0 | 70 | 14% | 9.8 | 0.0 |
| `compliance` | 70 | 0 | 10 | 80 | 16% | 12.8 | +1.6 |
| `incident` | 70 | 0 | 0 | 70 | 12% | 8.4 | 0.0 |

```text
Trust Score = round(63.4) = 63
```

Top drivers:

1. Уязвимости: -5.5 относительно neutral reference, причина — high risk.
2. Конфигурация: -2.7, причина — medium risk.
3. Соответствие: +1.6, причина — completeness bonus.

Counterfactual без risk A:

```text
current = 63
without risk A = 69
potential gain = +6
```

Корректный текст: `Закрытие риска может повысить Trust Score объекта примерно на 6`.

---

## 17. Non-scope И Известные Ограничения

В S12-T001 не входят:

- изменение `lib/trust/calculate.ts`;
- DB migration или новая evidence table;
- влияние `confidence`/freshness на Score;
- ML/LLM explanation generation;
- remediation playbooks;
- rule engine;
- causal inference по timestamps;
- сохранение отдельного explainability snapshot;
- автоматическое изменение risks или factor weights.

Известные ограничения для следующих задач:

1. Source metadata временно находится в text description block.
2. History не хранит структурированную причину и snapshot весов.
3. Current source context не доказывает coverage или freshness.
4. Clamp может сделать impact отдельного риска равным нулю, даже если raw penalty существует.
5. Итоговый integer Score скрывает изменения меньше одного пункта после округления.

Эти ограничения должны быть видны в UX там, где они влияют на интерпретацию, и не требуют преждевременного изменения архитектуры в Sprint 12.

---

## 18. Acceptance Criteria S12-T001

- [x] Определены уровни explainability.
- [x] Зафиксирован единый read model для Score, factors, reasons и sources.
- [x] Математика полностью соответствует ADR-001 и текущему engine.
- [x] Определён алгоритм top drivers.
- [x] Определён counterfactual risk impact.
- [x] Определён score delta contract и fallback при неполной истории.
- [x] Разделены source context и future evidence record.
- [x] Зафиксировано, что confidence не влияет на Score.
- [x] Описаны empty/error states, RBAC и tenant isolation.
- [x] Зафиксирован non-scope без миграций и изменения формулы.

---

## 19. Связанные Документы

- [ARCHITECTURE_DECISIONS.md](../../ARCHITECTURE_DECISIONS.md) — ADR-001 и ADR-007.
- [Trust_Score_Model_v2.md](Trust_Score_Model_v2.md) — утверждённая формула Trust Score.
- [Evidence_First_Architecture.md](Evidence_First_Architecture.md) — целевая Evidence Layer и Evidence Timeline.
- [Evidence_Import_Schema.md](Evidence_Import_Schema.md) — текущий source metadata contract.
- [Confidence_Engine_Discovery_Inbox.md](Confidence_Engine_Discovery_Inbox.md) — будущий engine confidence, decisions и Trust effect boundary.
- [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md) — ограничения MVP и Pilot readiness.
- [EXPLAINABILITY_QA_CHECKLIST.md](../testing/EXPLAINABILITY_QA_CHECKLIST.md) — ручная сверка UI, формулы, sources, RBAC и responsive states.
- [tasks/SPRINT_12.md](../../tasks/SPRINT_12.md) — задачи реализации explainability.
