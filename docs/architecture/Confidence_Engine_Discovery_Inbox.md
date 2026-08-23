# Confidence Engine & Discovery Inbox — DTEK Core

`Статус: утверждённая спецификация, runtime/UI не реализованы`
`Дата: 23.08.2026`
`Sprint: S15-T004 — Confidence Engine & Discovery Inbox Specification`
`Основа: ADR-007, ADR-009, Evidence Layer, Identity Resolution`

---

## 1. Назначение

Документ определяет:

- воспроизводимый Confidence Engine для proposed evidence actions;
- границы `low`, `medium`, `high`;
- hard gates, запрещающие опасную автоматизацию независимо от score;
- модель Discovery Candidate и её lifecycle;
- UX очереди Objects, Relations и Risks;
- действия `confirm`, `create`, `link`, `merge`, `reject`, `archive`;
- RBAC, audit, suppression, retention и acceptance tests.

S15-T004 является спецификацией. Задача не создаёт SQL migration, route,
компоненты, Server Actions, background worker или Trust Score integration.

---

## 2. Три Разных Понятия Confidence

Следующие значения нельзя смешивать:

| Понятие | Смысл | Влияние |
|---|---|---|
| `source_declared_confidence` | Ручное `low/medium/high` из CSV/XLSX или source metadata | Только conservative cap, не доказательство |
| `engine_confidence_score` | Вычисленная уверенность 0–100 в конкретном proposed action | Определяет review/eligibility |
| `decision_state` | Решение пользователя или утверждённой policy | Разрешает/запрещает projection |

Confidence также не является:

- Trust Score объекта;
- вероятностью отсутствия компрометации;
- рейтингом vendor/product;
- гарантией истинности source;
- заменой ручного решения при конфликте;
- причиной прямого изменения бизнес-таблиц.

User confirmation не переписывает score в `100`. Оно создаёт отдельное
decision event с actor, time, reason и использованным confidence snapshot.

---

## 3. Единица Оценки

Engine оценивает **candidate action**, а не источник целиком.

```ts
type DiscoveryEntityKind = 'object' | 'relation' | 'risk';

type DiscoveryActionKind =
  | 'create'
  | 'match'
  | 'update'
  | 'merge'
  | 'archive';

interface ConfidenceInput {
  organizationId: string;
  entityKind: DiscoveryEntityKind;
  actionKind: DiscoveryActionKind;
  assertionIds: string[];
  resolverOutcome: string;
  identitySignals: IdentitySignal[];
  sourceSignals: SourceSignal[];
  freshness: FreshnessSignal;
  validation: ValidationSignal;
  conflicts: ConflictSignal[];
  formulaVersion: string;
}
```

Одинаковое evidence может давать разные scores:

- высокий для `object.match` по cloud resource ID;
- средний для изменения `os_platform`;
- низкий для создания relation, если второй endpoint найден только по IP;
- blocked для merge при конфликтующих agent IDs.

---

## 4. Formula v1

```text
raw_score =
    identity_or_subject_resolution  (0..45)
  + source_assurance                (0..20)
  + independent_corroboration       (0..15)
  + freshness                       (0..10)
  + data_quality                    (0..10)
  - penalties                       (0..100)

score = clamp(raw_score, 0, 100)
score = apply_caps(score)
decision = apply_hard_gates(score, action)
```

Каждый компонент и reason code сохраняется в candidate snapshot. UI не
пересчитывает score и не содержит альтернативную формулу.

### 4.1 Identity / Subject Resolution — 0..45

| Сигнал | Баллы |
|---|---:|
| Authoritative key, один непротиворечивый target | 45 |
| Strong key, один target, supporting signals согласованы | 38 |
| Два и более независимых supporting signals | 30 |
| Один supporting signal | 20 |
| Только weak signals | 8 |
| Usable identity отсутствует | 0 |

Применение по типам:

- Object create/match/update/merge — результат Identity Resolver;
- Relation — более слабый из resolution обоих endpoints;
- Risk — resolution affected Object плюс finding/rule identity;
- unresolved relation endpoint даёт hard gate независимо от суммы.

### 4.2 Source Assurance — 0..20

| Source assurance | Баллы |
|---|---:|
| Authenticated read-only connector, tested contract и stable source namespace | 20 |
| Structured import, подтверждённый пользователем после preview | 15 |
| Validated structured source без подтверждённой authority policy | 10 |
| Legacy/backfilled source context | 5 |
| Unknown/unverified origin | 0 |

Source не назначает себе assurance через payload. Уровень задаётся code-owned
source policy и меняется только authorized audited action.

### 4.3 Independent Corroboration — 0..15

| Подтверждение | Баллы |
|---|---:|
| Три и более независимых sources/families | 15 |
| Два независимых sources/families | 10 |
| Один source | 0 |

`hostname` и производный `fqdn` одного observation не независимы. Несколько
connectors к одной management system также не считаются независимыми без
отдельной source lineage policy.

### 4.4 Freshness — 0..10

Каждый source/entity contract задаёт `max_age`.

| Возраст на момент оценки | Баллы |
|---|---:|
| `age <= max_age` | 10 |
| `max_age < age <= 2 * max_age` | 5 |
| `age > 2 * max_age` или timestamp недостоверен | 0 |

Единого фиксированного срока для AD, VM scanner и cloud API нет. Ingestion time
не подменяет source collection time.

### 4.5 Data Quality — 0..10

| Результат validation | Баллы |
|---|---:|
| Все required canonical fields валидны, warnings отсутствуют | 10 |
| Required fields валидны, есть non-blocking warnings/optional gaps | 5 |
| Только минимальный usable identity | 0 |
| Rejected/quarantined observation | hard gate |

---

## 5. Penalties И Caps

### Penalties

| Причина | Penalty |
|---|---:|
| Scoped key без подтверждённого namespace | -15 |
| Shared/unstable identifier: DHCP IP, local MAC, reused hostname | -10 |
| Supporting evidence расходится по type/lifecycle | -15 |
| Все evidence старше `2 * max_age` | -20 |
| Source schema degraded/contract warning | -10 |

Один reason code применяется один раз. Penalty не заменяет hard gate для
authoritative/strong conflict.

### Conservative Caps

| Условие | Максимальный score |
|---|---:|
| `source_declared_confidence = low` | 39 |
| `source_declared_confidence = medium` | 69 |
| `source_declared_confidence = high` | cap отсутствует, bonus не даётся |
| Только weak identity signals | 39 |
| Scoped strong ID без namespace | 39 |
| Только stale evidence | 39 |
| Legacy source context без raw observation | 39 |

CSV `high` не повышает score. CSV `low/medium` ограничивает его, потому что
пользователь явно сообщил о сомнении.

---

## 6. Confidence Bands

| Band | Score | Поведение |
|---|---:|---|
| `low` | 0–39 | Candidate only; review required; Trust effect отсутствует |
| `medium` | 40–69 | Review required; показывается evidence/diff |
| `high` | 70–100 | Eligible для allowlisted policy, если hard gates пройдены |

`high` означает «достаточно evidence для рассматриваемого действия», а не
«истина гарантирована». Default tenant policy остаётся review-first.

`confidence_level` в `evidence_assertions` является snapshot рассчитанного
band. Source-declared level хранится отдельно и не должен записываться в это
поле как engine result.

---

## 7. Hard Gates

Hard gate всегда сильнее score:

```text
tenant_mismatch
raw_validation_rejected
authoritative_identity_conflict
strong_identity_not_unique
unresolved_relation_endpoint
manual_override_conflict
unsupported_projection_field
candidate_superseded
source_not_active
rbac_denied
merge_requires_human
risk_requires_human
destructive_action_requires_human
```

При hard gate:

- score и breakdown сохраняются для объяснения;
- candidate получает `blocked` либо остаётся review-only;
- auto-confirm/project запрещён;
- evidence не удаляется;
- пользователю показывается safe причина и доступное следующее действие.

Tenant mismatch является security failure и не создаёт видимый candidate в
чужой организации.

---

## 8. Auto-Action Policy

High confidence только **разрешает рассмотреть** автоматическое действие.

| Action | Auto-policy v1 |
|---|---|
| Match evidence к существующему Object | Допустимо при high, deterministic match и отсутствии конфликтов |
| Update allowlisted technical field | Допустимо при high, active source и отсутствии manual override |
| Create technical Object | Default OFF; допустимо только при authoritative identity и явной org policy |
| Create Relation | Default OFF; оба endpoints confirmed, source/type allowlisted |
| Create/accept Risk | Никогда автоматически в v1 |
| Merge Objects | Никогда автоматически |
| Archive/delete Object или Relation | Никогда автоматически |
| Owner, criticality, risk owner/status/due date | Никогда автоматически |
| Изменить Trust weights или прямой Trust Score | Никогда |

Любая auto-policy:

- versioned и code-owned;
- включается owner для конкретного action/source/field scope;
- проверяется server-side;
- имеет audit event;
- не может повышать confidence;
- не обходит T003 field authority;
- может быть отключена без удаления evidence.

До runtime validation все policies фактически `review-only`.

---

## 9. Candidate Kinds

### Object

```text
object.create
object.match
object.update
object.merge
object.archive
```

### Relation

```text
relation.create
relation.update
relation.archive
```

### Risk

```text
risk.create
risk.link
risk.update_evidence
```

`archive` в lifecycle Discovery Candidate и proposed `object.archive` /
`relation.archive` — разные действия. Первое только скрывает предложение из
active queue и обратимо; второе меняет business model и является destructive
human-only action.

Risk workflow fields (`owner_id`, `status`, `due_date`, `sla_days`, comments)
не являются automated candidate updates. Они сохраняют ручную ownership model.

---

## 10. Discovery Candidate Data Contract

Future persistence дополняет Evidence Layer тремя таблицами:

1. `discovery_candidates` — current candidate/action snapshot;
2. `discovery_candidate_assertions` — many-to-many provenance links;
3. `discovery_candidate_events` — immutable lifecycle/decision history.

### `discovery_candidates`

| Поле | Назначение |
|---|---|
| `id`, `organization_id` | UUID и tenant boundary |
| `candidate_key` | Opaque deterministic fingerprint, уникальный в tenant |
| `entity_kind`, `action_kind` | Object/Relation/Risk и proposed action |
| `state` | Lifecycle state |
| `target_object_id`, `target_relation_id`, `target_risk_id` | Nullable tenant-safe target |
| `proposed_changes` | Allowlisted typed JSON, не raw payload |
| `confidence_score`, `confidence_level` | Snapshot 0–100 + band |
| `confidence_breakdown` | Five components, penalties, caps, hard gates |
| `formula_version`, `resolver_version`, `mapping_version` | Reproducibility |
| `first_seen_at`, `last_seen_at` | Candidate freshness |
| `assigned_to` | Nullable reviewer profile |
| `decision_by`, `decision_at`, `decision_reason_code` | Structured decision context |
| `projection_status`, `projection_error_code` | Отдельно от decision state |
| `version` | Optimistic concurrency |
| `created_at`, `updated_at`, `retention_until` | Lifecycle/retention |

`proposed_changes` проходит schema per candidate kind. Произвольный connector
JSON в candidate table запрещён.

### `discovery_candidate_assertions`

- composite tenant FK к candidate и evidence assertion;
- role: `primary`, `supporting`, `conflicting`;
- assertion values не дублируются;
- UNIQUE candidate/assertion;
- removal запрещён после terminal decision.

### `discovery_candidate_events`

- immutable state transition;
- actor nullable для system event;
- from/to state;
- action/reason code;
- confidence/formula snapshot;
- safe structured metadata;
- user note хранится отдельно от Security Audit Log и ограничивается 500
  символами.

`evidence_bindings` остаётся assertion-to-business-target relation.
Discovery Candidate группирует evidence и proposed action, а не дублирует raw
observation или binding.

---

## 11. Candidate Fingerprint И Idempotency

Fingerprint строится server-side из canonical tuple:

```text
organization
+ entity kind
+ action kind
+ normalized subject identity
+ target identity (если есть)
+ proposed field/action key
+ policy version
```

Он не содержит plaintext hostname/IP/UUID в UI/audit.

Правила:

- replay того же evidence обновляет `last_seen_at`, не создаёт candidate copy;
- material change создаёт новую revision/event и пересчитывает confidence;
- terminal candidate не переписывается in-place новым смыслом;
- rejected fingerprint подавляется до material new evidence/policy version;
- archived candidate скрывается, но может быть восстановлен;
- superseded candidate не возвращается в pending;
- batch retry использует тот же candidate key.

Material change:

- новый authoritative/strong identity signal;
- исчезновение прежнего hard conflict;
- новый независимый source;
- изменение proposed business value;
- новая policy/formula version, влияющая на decision;
- freshness recovery после нового observation.

Простой replay или новый ingestion timestamp не является material change.

---

## 12. State Machine

```text
pending
  -> in_review
  -> blocked
  -> confirmed
  -> merged
  -> rejected
  -> archived
  -> superseded

in_review
  -> pending
  -> blocked
  -> confirmed / merged / rejected / archived / superseded

blocked
  -> pending       (material evidence resolves gate)
  -> in_review     (human resolution available)
  -> rejected / archived / superseded

archived
  -> pending       (explicit restore + still current)
  -> superseded
```

Terminal states: `confirmed`, `merged`, `rejected`, `superseded`.
`archived` является reversible housekeeping state, не semantic rejection.

`confirmed` означает принятое решение, но projection может быть
`pending`, `applied`, `failed` или `not_applicable`. Projection failure не
возвращает candidate молча в pending и не теряет decision.

Открытие drawer само по себе не переводит candidate в `in_review`. Состояние
меняется только явным действием «Взять в работу» или assignment.

---

## 13. User Actions

### Confirm

- принимает proposed create/update/relation/risk action;
- повторно проверяет version, confidence snapshot, RBAC и hard gates server-side;
- требует preview diff;
- запускает idempotent projector;
- создаёт candidate event и security audit event.

### Create As New

- только Object candidate без conflict, блокирующего создание;
- пользователь задаёт обязательные business fields;
- source evidence binding сохраняется;
- не объявляет слабые identity keys authoritative.

### Link To Existing

- пользователь выбирает Object только текущей организации;
- server повторно проверяет target tenant/type;
- создаётся confirmed binding, но field updates проходят authority policy.

### Merge

- применяется только Object duplicate candidate;
- всегда human-only;
- использует T003 merge plan/alias ledger;
- доступно только после отдельной migration и restore tests;
- до этого UI показывает действие disabled с безопасным пояснением либо не
  показывает его.

### Reject

- semantic decision «это не должно попадать в модель»;
- требует allowlisted reason code, optional note;
- подавляет тот же fingerprint;
- не удаляет evidence;
- material new evidence может создать новую revision для review.

Reason codes:

```text
not_same_entity
false_positive
out_of_scope
duplicate_evidence
source_mapping_error
business_exception
insufficient_evidence
other
```

### Archive

- скрывает candidate из active queue без semantic verdict;
- reversible;
- не влияет на business model/evidence;
- подходит для postponed/low-value candidates;
- массовое archive не входит в первый runtime без отдельной UX-задачи.

### Assign Business Context

Owner/analyst может до confirm задать owner/criticality для нового Object или
risk owner/SLA после создания Risk. Эти значения являются manual input и не
увеличивают engine confidence.

---

## 14. RBAC Baseline

Окончательная security matrix подтверждена S15-T005. T004 не расширяет текущие
business permissions.

| Действие | owner | analyst | admin | viewer |
|---|:---:|:---:|:---:|:---:|
| Открыть Discovery Inbox | Да | Да | Только technical Object scope | Нет |
| Confirm Object create/update/match | Да | Да | Только разрешённые infrastructure types | Нет |
| Confirm Relation | Да | Да | Нет | Нет |
| Confirm/Create Risk | Да | Да | Нет | Нет |
| Reject/Archive доступный candidate | Да | Да | Только technical Object scope | Нет |
| Merge/alias Objects | Да | Нет | Нет | Нет |
| Назначить business owner/criticality | Да | Да | Нет | Нет |
| Настроить auto-policy | Да | Нет | Нет | Нет |
| Просмотреть raw evidence | Да | Да | Redacted diagnostics | Нет |

Merge и business `object.archive` являются structural mutations и в baseline
доступны owner. Архивирование самого candidate остаётся доступно reviewer в
разрешённом ему scope.
Analyst может предложить merge или назначить owner reviewer, но не выполнить
его до отдельного RBAC решения.

UI visibility не заменяет Server Action authorization и RLS.

---

## 15. Discovery Inbox Information Architecture

Предлагаемый route: `/discovery`. Route не создаётся в T004.

### Navigation

- пункт `Discovery` доступен owner/analyst и scoped admin;
- badge показывает active `pending + blocked`, а не все historical candidates;
- viewer не видит route/nav item;
- badge query не читает raw evidence.

### Header

- title и active count;
- tabs: `Объекты`, `Связи`, `Риски`;
- filters: state, confidence band, source, action, freshness, assigned reviewer;
- search по safe display fields;
- refresh запускает read refresh, не connector sync.

### List/Table

Каждая строка показывает:

- safe candidate name/type;
- proposed action;
- confidence score + band;
- 1–2 ключевых reason labels;
- source count и last seen;
- conflict/stale indicator;
- assigned reviewer;
- state.

Raw IDs, IP/MAC/cloud ID и source record ID в list не показываются.

### Detail Drawer / Mobile Page

- proposed action и current target;
- side-by-side field diff;
- confidence breakdown 5 components + penalties/caps/gates;
- sources and freshness;
- matched/conflicting identity key **kinds**, masked values по permission;
- evidence timeline;
- manual override warnings;
- related Object/Passport/Risk links;
- decision history;
- разрешённые role/action buttons.

На mobile detail открывается как отдельная full-width view; action bar не
перекрывает diff и имеет stable height.

### UI States

- skeleton сохраняет размеры tabs/list/drawer;
- empty state учитывает filters и тип candidate;
- error state показывает safe code, retry read и correlation ID;
- stale page version вызывает reload prompt до mutation;
- projection failure виден отдельно от confidence/decision;
- revoked role/organization context закрывает actions немедленно.

Первый runtime не поддерживает bulk confirm, bulk merge или bulk reject.

---

## 16. Explainability И Trust Effect

| Candidate | До decision | После approved projection |
|---|---|---|
| Low | Нет business/Trust effect | Только после explicit human confirm |
| Medium | Нет business/Trust effect | После human confirm |
| High review-only | Нет business/Trust effect | После human confirm |
| High auto-policy eligible | Нет до committed projector | После policy decision + projection |
| Rejected/archived/blocked | Нет | Нет |

Даже confirmed evidence не пишет Trust Score напрямую. Оно изменяет allowlisted
business facts через projector; существующий Trust Engine затем выполняет
обычный пересчёт и создаёт history/explainability context.

Trust Passport должен показывать:

- source;
- engine confidence и formula version;
- decision kind: manual, user-confirmed, policy-confirmed;
- last seen;
- manual override;
- related evidence/candidate timeline.

Legacy import `confidence` продолжает отображаться как source metadata, пока
controlled migration явно не разделит его с engine confidence.

---

## 17. Recalculation И Drift

Confidence пересчитывается при:

- новой evidence observation;
- material identity/source change;
- freshness boundary transition;
- source status/assurance change;
- mapping/resolver/formula policy version change;
- conflict resolution.

Правила:

- каждый recalculation сохраняет previous/new breakdown event;
- confirmed business change не откатывается автоматически при снижении score;
- снижение после projection создаёт drift/review candidate;
- formula migration запускается bounded batch и не меняет user decisions;
- score timestamp отличается от source `last_seen_at`;
- scheduled recalculation не использует request-bound audit helper.

---

## 18. Concurrency И Mutations

Каждая decision mutation принимает:

```text
candidate_id
expected_version
expected_state
expected_confidence_hash
action
reason_code
optional_note
```

Server Action повторно:

1. получает auth/profile/org context;
2. проверяет RBAC для entity/action;
3. читает candidate по tenant;
4. проверяет optimistic version/state;
5. пересчитывает/валидирует hard gates при необходимости;
6. фиксирует decision/event;
7. запускает idempotent projection;
8. создаёт safe audit event;
9. revalidate только затронутые routes/read models.

Double click/retry не создаёт два Objects/Risks/Relations. Conflict возвращает
safe `candidate_changed`, UI обновляет detail.

---

## 19. RLS И Data Access

- все candidate/link/event rows имеют `organization_id`;
- composite tenant FKs обязательны;
- direct client INSERT/UPDATE/DELETE запрещены;
- list read model не содержит raw identity/evidence values;
- detail read проверяет role и candidate scope server-side;
- admin policy ограничивается infrastructure Object candidates;
- viewer не имеет SELECT candidate tables;
- service role выполняет repository operation только после explicit auth/system
  context;
- background context immutable на весь batch;
- candidate decision note не попадает в Security Audit Log;
- tenant deletion cascade допускается, обычный candidate cleanup controlled.

---

## 20. Audit Events

```text
discovery.candidate_assigned
discovery.candidate_confirmed
discovery.candidate_linked
discovery.candidate_merged
discovery.candidate_rejected
discovery.candidate_archived
discovery.candidate_restored
discovery.auto_policy_changed
discovery.auto_action_applied
discovery.projection_failed
```

Safe metadata:

- entity/action kind;
- previous/new state;
- confidence band и bounded score;
- formula/policy version;
- reason code;
- source type/count;
- duration/result category;
- aggregate projection counts.

Запрещены candidate/tenant/object UUID, raw evidence, proposed field values,
hostname/IP/MAC/cloud/agent/source IDs, user note, stack и connector endpoint.

High-volume recalculation создаёт aggregate operational event, не audit event на
каждый unchanged candidate.

---

## 21. Retention И Suppression

| Data | Default retention |
|---|---|
| Active candidate | Пока active/relevant |
| Confirmed/merged candidate + events | Пока binding/business entity существует + 365 дней |
| Rejected suppression fingerprint | 365 дней после last material evidence |
| Archived candidate | 365 дней после archive |
| Superseded candidate/events | 365 дней |

Retention override и legal hold определены S15-T005. Purge:

- не удаляет business entity/evidence binding;
- сохраняет минимальный audited suppression digest, если срок suppression ещё
  действует;
- не выполняется client role;
- имеет dry-run, counts и safe audit;
- не раскрывает terminal decisions другому tenant.

---

## 22. Performance Contract

- server-side pagination, default 50, hard maximum 100;
- filters применяются database-side;
- list query не загружает raw observations/assertion JSON;
- counters не выполняют N+1 queries;
- candidate key, org/state/kind/score/last_seen/assignee индексируются;
- detail evidence загружается по требованию и bounded limit;
- score вычисляется pure server function, не React render;
- recalculation выполняется bounded batches с checkpoint;
- badge использует lightweight count/read model;
- list сохраняет filter/cursor state при возврате из detail.

---

## 23. Error Contract

| Code | Пользовательский смысл |
|---|---|
| `candidate_changed` | Данные обновились, откройте актуальную версию |
| `candidate_blocked` | Требуется разрешить конфликт |
| `candidate_superseded` | Предложение заменено новой версией |
| `action_not_allowed` | Роль не может выполнить действие |
| `projection_failed` | Решение сохранено, применение требует повтора/диагностики |
| `evidence_unavailable` | Детали evidence временно недоступны |
| `source_stale` | Источник давно не подтверждал данные |

UI не получает raw database/connector errors. Internal log использует
correlation ID и redacted context.

---

## 24. Примеры Расчёта

### Cloud VM Match

```text
Authoritative cloud resource ID        45
Authenticated connector               20
One source                              0
Fresh                                  10
Complete                               10
Penalties                               0
Total                                  85 HIGH
```

Outcome: eligible для policy match. Rename proposed field не перезаписывает
manual display name.

### Zabbix Candidate По Hostname + IP

```text
One supporting/weak combination        20
Authenticated connector               20
One source                              0
Fresh                                  10
Partial                                 5
Unstable IP penalty                   -10
Total                                  45 MEDIUM
```

Outcome: review required; merge/Trust effect отсутствуют.

### CSV С Declared Low

```text
Two supporting identities              30
User-confirmed import                  15
One source                              0
Fresh                                  10
Complete                               10
Raw total                              65
Declared low cap                       39 LOW
```

Outcome: candidate only; explicit human confirmation required.

### Conflicting Agent IDs

Два strong IDs указывают на разные active Objects. Score может быть высоким,
но `authoritative_identity_conflict`/`strong_identity_not_unique` переводит
candidate в `blocked`. Freshness не разрешает конфликт.

### Critical Vulnerability

Даже score 92 не создаёт активный Risk автоматически в v1. Candidate показывает
CVE, affected Object, source, reason и impact context; owner/analyst принимает
его в Risk Registry.

---

## 25. Future Persistence Migration

Migration выполняется после S15-T005 security review и не объединяется с
connector prototype:

1. создать candidate/assertion/event tables с composite tenant FKs;
2. включить RLS и запрет direct mutations;
3. добавить formula/policy version и immutable events;
4. запустить shadow candidate generation без business projection;
5. проверить two-tenant, suppression и score fixtures;
6. добавить read-only Discovery Inbox;
7. включить human decisions;
8. реализовать field provenance/projector;
9. только затем включать отдельные high-confidence auto-policies.

Rollback отключает generation/read/action paths и сохраняет evidence/candidate
history. DROP или откат business data автоматически не выполняется.

---

## 26. Acceptance Tests Будущего Runtime

### Confidence

- все five components и penalties воспроизводятся pure function;
- score ограничен 0–100;
- declared high не даёт bonus;
- declared low/medium применяет cap;
- weak-only и stale-only не становятся medium/high;
- derived signals одного family не считаются independent;
- hard conflict блокирует high score;
- formula version сохраняется в snapshot/event;
- recalculation не изменяет historical decision.

### Candidate Lifecycle

- replay не создаёт duplicate candidate;
- rejected fingerprint не reopens без material evidence;
- archive/restore работает отдельно от reject;
- superseded candidate нельзя подтвердить;
- optimistic version отклоняет stale decision;
- double submit создаёт один projection;
- projection failure не теряет confirmed decision;
- new evidence after confirmation создаёт drift, не silent rollback.

### RBAC/RLS

- tenant A не читает/решает candidates tenant B;
- viewer не открывает Inbox/API/table;
- admin ограничен infrastructure Object scope;
- analyst не выполняет merge/archive structural Object action;
- owner merge всё равно требует explicit preview;
- direct table mutation authenticated role отклоняется;
- list/detail/audit не раскрывают raw identity/internal IDs.

### Product Safety

- low/medium не влияет на Trust Score до confirmation;
- Risk и merge никогда не auto-confirm;
- manual override блокирует automated field projection;
- relation с unresolved endpoint не создаётся;
- confirmed projection использует current Trust Engine, не альтернативную
  формулу;
- current CSV/XLSX import сохраняет прежний result до controlled migration.

### UX

- filters/tabs/counts consistent;
- loading/empty/error/stale-version states работают;
- confidence breakdown объясняет score/cap/gate;
- mobile detail/action bar не перекрывает content;
- disabled/hidden actions соответствуют server RBAC;
- keyboard/focus semantics доступны для всех decision actions.

---

## 27. Отложенные Решения

| Решение | Владелец |
|---|---|
| Secret backend, final raw access/RLS, connector operation RBAC | Определены в S15-T005 |
| Deployment-specific retention/legal hold | Owner-controlled contract определён в S15-T005; срок задаётся deployment/customer policy |
| Source-specific `max_age`, assurance и authoritative fields | First connector task |
| Final visual design и route implementation | Future Discovery UI task |
| Field provenance/projector SQL | Future implementation migration |
| Merge alias ledger/restore implementation | Separate implementation task |
| Auto Risk Mapper rules | Post-foundation task |
| First enabled auto-policy | Separate ADR/task after shadow validation |

---

## 28. Acceptance Criteria S15-T004

- [x] Разделены source-declared, engine confidence и user/policy decision.
- [x] Определена воспроизводимая formula 0–100 с breakdown.
- [x] Зафиксированы bands, penalties, caps и hard gates.
- [x] Определена безопасная allowlisted auto-action policy.
- [x] Описаны Object, Relation и Risk candidate kinds.
- [x] Определены candidate persistence contract, fingerprint и state machine.
- [x] Описаны confirm/create/link/merge/reject/archive semantics.
- [x] Зафиксированы RBAC/RLS и safe audit baseline.
- [x] Описаны Inbox list/detail/mobile/loading/error states.
- [x] Зафиксированы Trust effect, retention, concurrency и performance.
- [x] Подготовлены examples, migration order и acceptance tests.

---

## 29. Связанные Документы

- [ARCHITECTURE_DECISIONS.md](../../ARCHITECTURE_DECISIONS.md) — ADR-007 и
  ADR-009.
- [Evidence_Layer_Data_Model.md](Evidence_Layer_Data_Model.md) — source,
  assertions и bindings.
- [Normalization_Identity_Resolution.md](Normalization_Identity_Resolution.md)
  — identity strengths, resolver, manual authority и merge policy.
- [Connector_Framework_Architecture.md](Connector_Framework_Architecture.md) —
  connector lifecycle и ingestion boundary.
- [Evidence_Explainability_Model.md](Evidence_Explainability_Model.md) — текущий
  source context и Trust explanation.
- [Evidence_First_Architecture.md](Evidence_First_Architecture.md) — целевая
  Discovery Layer.
- [User_Roles.md](User_Roles.md) — текущая бизнес-матрица ролей.
- [SECURITY_OVERVIEW.md](../security/SECURITY_OVERVIEW.md) — security baseline.
- [SPRINT_15.md](../../tasks/SPRINT_15.md) — порядок foundation.
