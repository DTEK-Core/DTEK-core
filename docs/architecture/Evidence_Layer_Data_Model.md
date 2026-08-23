# Evidence Layer Data Model — DTEK Core

`Статус: утверждённая спецификация, runtime не реализован`
`Дата: 23.08.2026`
`Sprint: S15-T002 — Evidence Layer Data Model Specification`
`Основа: ADR-007, ADR-009, Connector_Framework_Architecture.md`

---

## 1. Назначение

Документ определяет будущую PostgreSQL-модель Evidence Layer: источники,
ingestion batches, стабильные source records, неизменяемые raw observations,
нормализованные assertions и их связи с Objects, Risks, Relations и факторами
Trust Score.

Спецификация готовит миграцию, но **не является миграцией**. S15-T002 не:

- создаёт SQL-таблицы;
- меняет текущий CSV/XLSX import;
- запускает Connector Runtime;
- переводит Trust Score Engine на evidence;
- реализует match/merge runtime, confidence thresholds или Discovery Inbox;
- выбирает secret backend и окончательную connector RBAC policy.

Эти границы сохраняют рабочий Market MVP и последовательность Sprint 15.

---

## 2. Архитектурное Решение

Evidence Layer использует шесть tenant-scoped таблиц:

1. `evidence_sources` — безопасная идентичность и metadata источника;
2. `evidence_batches` — ограниченная единица импорта или sync;
3. `evidence_records` — стабильная идентичность записи внутри источника;
4. `evidence_observations` — append-only raw revisions при изменении payload;
5. `evidence_assertions` — versioned normalized facts;
6. `evidence_bindings` — связь assertions с текущей business model.

```text
evidence_sources
  1 ── N evidence_batches
  1 ── N evidence_records
             1 ── N evidence_observations
                         1 ── N evidence_assertions
                                     1 ── N evidence_bindings
                                                ├── objects
                                                ├── risks
                                                ├── relations
                                                └── object + trust factor
```

Connector Installation и Connector Sync Run относятся к Connector Framework,
а не дублируются в Evidence Layer. Будущая installation ссылается на один
`evidence_sources.id`, а sync run — на созданный `evidence_batches.id`. File
import создаёт source/batch без connector installation.

### Почему Record И Observation Разделены

Повторное получение неизменившейся записи должно обновить freshness, но не
создавать копию raw payload. Поэтому:

- `evidence_records` хранит `first_seen_at`, `last_seen_at` и текущую revision;
- новый `evidence_observations` создаётся только при новом content hash или
  explicit tombstone;
- replay того же payload обновляет `last_seen_at` и `last_seen_batch_id`;
- partial/failed batch никогда не означает исчезновение записи.

---

## 3. Общие Типы

PostgreSQL `CHECK`, а не native ENUM, сохраняет текущий migration style.

| Type | Значения S15 foundation |
|---|---|
| `evidence_origin_kind` | `manual`, `file_import`, `connector`, `system_derived` |
| `evidence_source_status` | `active`, `paused`, `disconnected`, `retired` |
| `evidence_entity_kind` | `asset`, `identity`, `vulnerability`, `relation`, `control_state`, `coverage` |
| `evidence_batch_kind` | `manual_import`, `incremental`, `full_snapshot`, `reprocess` |
| `evidence_batch_status` | `pending`, `running`, `partial`, `completed`, `failed`, `cancelled` |
| `evidence_record_state` | `active`, `stale`, `tombstoned` |
| `evidence_validation_status` | `accepted`, `rejected`, `quarantined` |
| `evidence_assertion_state` | `active`, `superseded`, `invalid` |
| `evidence_confidence_level` | `low`, `medium`, `high` |
| `evidence_target_kind` | `object`, `risk`, `relation`, `trust_factor` |
| `evidence_binding_state` | `proposed`, `confirmed`, `rejected` |

`source_type` сохраняет совместимость с Sprint 11:
`manual_csv`, `asset_inventory`, `vulnerability_export`,
`monitoring_export`, `directory_export`, `security_tool_export`,
`network_export`, `other`. Расширение списка выполняется миграцией при появлении
подтверждённого source category, а vendor не кодируется как новый `source_type`.

`confidence_level` является display snapshot. `confidence_score` хранится как
целое `0–100`, но правила расчёта, thresholds и автоматические действия
утверждаются только в S15-T004. До этого score остаётся nullable и не влияет на
Trust Score.

---

## 4. `evidence_sources`

Одна строка описывает логический tenant source: конкретный файл/регулярный
file-feed, connector installation, manual evidence channel или системный вывод.
Credentials, customer endpoint и raw configuration здесь запрещены.

| Поле | Тип | Ограничение / назначение |
|---|---|---|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `organization_id` | `uuid` | NOT NULL, FK organizations, tenant boundary |
| `source_key` | `text` | NOT NULL, server-generated stable opaque key, max 120 |
| `display_name` | `text` | NOT NULL, trimmed 1–200 |
| `origin_kind` | `text` | NOT NULL, `evidence_origin_kind` CHECK |
| `source_type` | `text` | NOT NULL, compatible source type CHECK |
| `status` | `text` | NOT NULL DEFAULT `active` |
| `default_confidence_level` | `text` | nullable source claim, не verified probability |
| `safe_metadata` | `jsonb` | NOT NULL DEFAULT `{}`, только allowlisted display metadata |
| `created_by` | `uuid` | nullable FK profiles, actor может быть system |
| `created_at` | `timestamptz` | NOT NULL DEFAULT `now()` |
| `updated_at` | `timestamptz` | NOT NULL DEFAULT `now()` |
| `retired_at` | `timestamptz` | nullable; обязателен при `retired` |

Ограничения:

- `UNIQUE (organization_id, id)` — основа composite tenant FKs;
- `UNIQUE (organization_id, source_key)`;
- `source_key` не содержит vendor record ID, tenant UUID или secret;
- `safe_metadata` не содержит hostnames, IP, account names, tokens или full
  connector config;
- disconnect/retire не удаляет evidence и business entities.

File import не обязан создавать новый source для каждого повторного файла.
Source identity определяется сервером из tenant, origin, approved source name и
type; точный reuse contract входит в S15-T003.

---

## 5. `evidence_batches`

Batch является idempotent commit boundary для одного файла, manual pull,
scheduled pull или controlled reprocessing.

| Поле | Тип | Ограничение / назначение |
|---|---|---|
| `id` | `uuid` | PK |
| `organization_id` | `uuid` | NOT NULL |
| `source_id` | `uuid` | NOT NULL, composite FK к source той же организации |
| `batch_kind` | `text` | NOT NULL |
| `status` | `text` | NOT NULL DEFAULT `pending` |
| `idempotency_key` | `text` | NOT NULL, opaque, max 200 |
| `source_schema_version` | `text` | NOT NULL, max 80 |
| `mapping_version` | `text` | nullable до normalization |
| `collection_started_at` | `timestamptz` | nullable source window |
| `collection_ended_at` | `timestamptz` | nullable source window |
| `started_at` | `timestamptz` | nullable runtime timestamp |
| `finished_at` | `timestamptz` | nullable terminal timestamp |
| `initiated_by` | `uuid` | nullable FK profiles; NULL для system actor |
| `records_received` | `integer` | NOT NULL DEFAULT 0, `>= 0` |
| `records_accepted` | `integer` | NOT NULL DEFAULT 0, `>= 0` |
| `records_rejected` | `integer` | NOT NULL DEFAULT 0, `>= 0` |
| `records_unchanged` | `integer` | NOT NULL DEFAULT 0, `>= 0` |
| `safe_error_code` | `text` | nullable allowlisted code ADR-009 |
| `created_at` | `timestamptz` | NOT NULL DEFAULT `now()` |
| `retention_until` | `timestamptz` | NOT NULL, по batch retention policy |

Ограничения:

- `UNIQUE (organization_id, id)`;
- `UNIQUE (organization_id, source_id, idempotency_key)`;
- source FK: `(organization_id, source_id)`;
- terminal status требует `finished_at`;
- `records_accepted + records_rejected <= records_received`;
- `full_snapshot` считается authoritative только после `completed`, никогда
  после `partial`, `failed` или `cancelled`;
- cursor/checkpoint хранится в Connector Sync Run, не в raw batch metadata.

---

## 6. `evidence_records`

Record представляет одну стабильную source identity. Например, один asset с
agent ID, одна vulnerability finding или одна source relation.

| Поле | Тип | Ограничение / назначение |
|---|---|---|
| `id` | `uuid` | PK |
| `organization_id` | `uuid` | NOT NULL |
| `source_id` | `uuid` | NOT NULL, tenant composite FK |
| `entity_kind` | `text` | NOT NULL |
| `source_record_id` | `text` | NOT NULL, trimmed 1–500, sensitive |
| `state` | `text` | NOT NULL DEFAULT `active` |
| `first_seen_at` | `timestamptz` | NOT NULL |
| `last_seen_at` | `timestamptz` | NOT NULL |
| `last_seen_batch_id` | `uuid` | NOT NULL, tenant composite FK |
| `current_observation_id` | `uuid` | nullable, FK добавляется после observations |
| `tombstoned_at` | `timestamptz` | nullable |
| `created_at` | `timestamptz` | NOT NULL DEFAULT `now()` |
| `updated_at` | `timestamptz` | NOT NULL DEFAULT `now()` |

Ограничения:

- `UNIQUE (organization_id, id)`;
- `UNIQUE (organization_id, source_id, entity_kind, source_record_id)` —
  idempotency source record;
- `last_seen_at >= first_seen_at`;
- `tombstoned_at` допускается только для `tombstoned`;
- source record ID не возвращается в list UI, URL, logs или audit metadata;
- отсутствие record в incomplete batch не меняет state;
- verified completed full snapshot может пометить unseen records как `stale`,
  но не удаляет их; правила tombstone утверждаются в S15-T003.

`last_seen_at` означает момент, когда источник подтвердил существование записи,
а не момент последнего UI-просмотра или изменения business object.

---

## 7. `evidence_observations`

Observation — immutable raw revision. UPDATE и DELETE обычным application role
запрещены. Повтор того же content hash не создаёт revision.

| Поле | Тип | Ограничение / назначение |
|---|---|---|
| `id` | `uuid` | PK |
| `organization_id` | `uuid` | NOT NULL |
| `record_id` | `uuid` | NOT NULL, tenant composite FK |
| `batch_id` | `uuid` | NOT NULL, tenant composite FK |
| `revision` | `integer` | NOT NULL, `> 0` |
| `payload` | `jsonb` | NOT NULL, allowlisted normalized JSON envelope |
| `content_hash` | `text` | NOT NULL, lowercase SHA-256 hex |
| `validation_status` | `text` | NOT NULL |
| `validation_codes` | `jsonb` | NOT NULL DEFAULT `[]`, safe codes only |
| `source_collected_at` | `timestamptz` | nullable source timestamp |
| `ingested_at` | `timestamptz` | NOT NULL DEFAULT `now()` |
| `is_tombstone` | `boolean` | NOT NULL DEFAULT false |
| `retention_until` | `timestamptz` | NOT NULL |

Ограничения:

- `UNIQUE (organization_id, id)`;
- `UNIQUE (organization_id, record_id, revision)`;
- `UNIQUE (organization_id, record_id, content_hash)`;
- immutable trigger отклоняет UPDATE; controlled retention function является
  единственным delete path;
- максимальный canonical JSON payload — 256 KiB после serialization; binaries,
  attachments, secrets, auth headers и full log streams запрещены;
- `rejected`/`quarantined` observation не создаёт active assertion;
- future-dated `source_collected_at` выше допустимого clock skew получает safe
  validation code, а не молча становится freshness timestamp.

Raw payload сохраняет только поля, разрешённые adapter/import contract. Полный
HTTP response и исходный файл не являются evidence observation.

---

## 8. `evidence_assertions`

Assertion — один нормализованный факт, воспроизводимо полученный из observation:
например hostname, CVE finding, control state или relation endpoint.

| Поле | Тип | Ограничение / назначение |
|---|---|---|
| `id` | `uuid` | PK |
| `organization_id` | `uuid` | NOT NULL |
| `source_id` | `uuid` | NOT NULL, provenance после raw retention |
| `observation_id` | `uuid` | nullable; `SET NULL` при controlled raw purge |
| `observation_hash` | `text` | NOT NULL, неизменяемый provenance digest |
| `entity_kind` | `text` | NOT NULL |
| `assertion_key` | `text` | NOT NULL, canonical field/fact key, max 160 |
| `normalized_value` | `jsonb` | NOT NULL |
| `value_hash` | `text` | NOT NULL, lowercase SHA-256 hex |
| `normalizer_key` | `text` | NOT NULL, code-owned allowlisted normalizer |
| `normalizer_version` | `text` | NOT NULL |
| `confidence_score` | `smallint` | nullable, CHECK `0–100` |
| `confidence_level` | `text` | nullable display snapshot |
| `confidence_reasons` | `jsonb` | NOT NULL DEFAULT `[]`, codes, не prose/payload |
| `state` | `text` | NOT NULL DEFAULT `active` |
| `effective_at` | `timestamptz` | NOT NULL |
| `superseded_at` | `timestamptz` | nullable |
| `created_at` | `timestamptz` | NOT NULL DEFAULT `now()` |
| `retention_until` | `timestamptz` | nullable для superseded assertion |

Ограничения:

- `UNIQUE (organization_id, id)`;
- source и observation должны принадлежать той же организации;
- уникальность derivation:
  `(organization_id, observation_id, normalizer_key, normalizer_version,
  assertion_key, value_hash)` для non-null observation;
- active assertion не изменяется in-place: новая normalization revision
  supersedes старую;
- raw `confidence` источника может быть входным сигналом, но не копируется как
  автоматически подтверждённая вероятность;
- assertion без confirmed binding не изменяет Objects, Risks, Relations или
  Trust Score.

Nullable `observation_id` позволяет удалить raw payload по retention. Source,
observation/value hashes, normalizer version и binding сохраняют проверяемую
линию происхождения без хранения чувствительного payload бессрочно.

---

## 9. `evidence_bindings`

Binding связывает normalized assertion с существующей business entity. Он не
является самой entity и не даёт connector права обновлять business table.

| Поле | Тип | Ограничение / назначение |
|---|---|---|
| `id` | `uuid` | PK |
| `organization_id` | `uuid` | NOT NULL |
| `assertion_id` | `uuid` | NOT NULL, tenant composite FK |
| `target_kind` | `text` | NOT NULL |
| `object_id` | `uuid` | nullable composite FK |
| `risk_id` | `uuid` | nullable composite FK |
| `relation_id` | `uuid` | nullable composite FK |
| `factor_key` | `text` | nullable, six Trust Score factors |
| `binding_state` | `text` | NOT NULL DEFAULT `proposed` |
| `match_method` | `text` | nullable code-owned reason key |
| `bound_by` | `uuid` | nullable profile; NULL для policy-approved system action |
| `bound_at` | `timestamptz` | nullable |
| `rejected_at` | `timestamptz` | nullable |
| `created_at` | `timestamptz` | NOT NULL DEFAULT `now()` |

Target shape CHECK:

| `target_kind` | Обязательные поля | Остальные target fields |
|---|---|---|
| `object` | `object_id` | NULL |
| `risk` | `risk_id` | NULL |
| `relation` | `relation_id` | NULL |
| `trust_factor` | `object_id`, `factor_key` | `risk_id`, `relation_id` NULL |

`factor_key` допускает только `vuln`, `config`, `access`, `network`,
`compliance`, `incident`, то есть фактические ключи Trust Score Engine, а не
расширенный список risk categories.

Для tenant-safe FK будущая migration добавляет `UNIQUE (organization_id, id)`
к `objects`, `risks` и `relations`, затем использует composite references.
Удаление target удаляет binding, но не source evidence. Удаление assertion при
наличии binding запрещено до retention decision.

`proposed`, `confirmed`, `rejected`, match priority, merge и manual override
semantics окончательно описываются в S15-T003/T004. До этого единственный
допустимый эффект `proposed` binding — отображение в future review read model.

---

## 10. Freshness, Revision И Deletion Semantics

### Unchanged Replay

1. Gateway находит record по tenant/source/entity/source record ID.
2. Canonical payload hash совпадает с current observation.
3. Новая observation не создаётся.
4. Record получает новый `last_seen_at` и `last_seen_batch_id`.
5. Batch увеличивает `records_unchanged`.

### Changed Record

1. Создаётся следующая immutable observation revision.
2. Record переключает `current_observation_id` только после durable insert.
3. Normalizer создаёт новые assertions.
4. Старые assertions помечаются `superseded`, не переписываются.
5. Business model меняется только через approved binding/projection policy.

### Missing И Tombstone

- missing в incremental, partial или failed batch ничего не меняет;
- missing в verified completed full snapshot может перевести record в `stale`;
- только explicit source tombstone или утверждённая repeated-absence policy
  переводит record в `tombstoned`;
- stale/tombstone не удаляет Object, Risk, Relation или manual override;
- восстановленная запись возвращается в `active` новой observation revision.

---

## 11. Retention И Data Minimization

Foundation defaults:

| Данные | Default retention |
|---|---|
| Accepted raw observations | 90 дней после ingestion |
| Rejected/quarantined raw observations | 30 дней |
| Batch operational metadata | 365 дней после terminal state |
| Superseded normalized assertions | 365 дней |
| Active assertions и bindings | Пока используются active business model |
| Source/record identity | Пока source активен; после retire минимум 365 дней |

Retention является server-side policy. Tenant UI не получает произвольный
DELETE raw evidence. Конкретные deployment overrides и право legal hold
утверждаются в S15-T005; они могут увеличивать сроки, но не обходить isolation.

Первоначальная migration только записывает `retention_until` и индексы. Purge
job не включается, пока не реализованы:

- audit события retention;
- dry-run и aggregate count;
- защита active binding;
- controlled function с tenant scope;
- backup/restore проверка.

Удаление организации остаётся единственным допустимым cascade delete всей
tenant evidence chain.

---

## 12. RLS И RBAC Requirements

Окончательная policy matrix проходит security review в S15-T005. Следующие
требования уже обязательны и не могут быть ослаблены:

| Data | owner | analyst | admin | viewer |
|---|:---:|:---:|:---:|:---:|
| Safe source metadata | read | read | read | read |
| Batch summary | read | read | read | read |
| Normalized assertions/confirmed bindings | read | read | read | read |
| Raw observations/source record IDs | read | read | read for diagnostics | no access |
| Connector operational configuration | read/manage | read/use by policy | manage | no access |
| Direct table mutation | denied | denied | denied | denied |

Правила:

- RLS включена на всех шести таблицах;
- каждый SELECT проверяет `organization_id = current_org_id()`;
- все cross-table references включают `organization_id`;
- authenticated roles не получают INSERT/UPDATE/DELETE policies на ingestion
  tables; запись выполняет только server-side Ingestion Gateway после RBAC;
- service role не является авторизацией: gateway фиксирует immutable tenant и
  actor context до обращения к repository;
- viewer видит только safe projection, а не raw table;
- background system actor не подменяется profile ID;
- raw payload никогда не попадает в client props без отдельного authorized
  detail action и redaction.

`FORCE ROW LEVEL SECURITY` рассматривается для repository tests, но применение
к service-role execution согласуется в S15-T005 с выбранным runtime.

---

## 13. Audit Requirements

Security Audit Log хранит агрегированные события, а не событие на каждую строку:

```text
evidence.source_created
evidence.source_updated
evidence.source_paused
evidence.source_retired
evidence.batch_started
evidence.batch_completed
evidence.batch_partial
evidence.batch_failed
evidence.binding_confirmed
evidence.binding_rejected
evidence.retention_completed
```

Safe metadata:

- source key/type и origin kind;
- batch kind/status;
- duration bucket;
- received/accepted/rejected/unchanged counts;
- assertion/binding aggregate counts;
- allowlisted error/reason code;
- correlation ID.

Запрещены raw payload, source record ID, normalized value, hostname/IP, customer
endpoint, secret/config, description, stack и internal tenant UUID. Background
events требуют context-independent audit adapter; текущий request-bound
`createSecurityEvent()` напрямую не используется.

Audit failure не должен превращать частично записанный batch в `completed`.
Точный transaction/outbox contract утверждается перед runtime implementation.

---

## 14. Индексы И Query Paths

Минимальные индексы будущей migration:

```text
evidence_sources       (organization_id, status, origin_kind)
evidence_batches       (organization_id, source_id, created_at desc)
evidence_batches       (organization_id, status, started_at)
evidence_records       (organization_id, source_id, entity_kind, last_seen_at desc)
evidence_records       (organization_id, state, last_seen_at)
evidence_observations  (organization_id, record_id, revision desc)
evidence_observations  (retention_until) where retention_until is not null
evidence_assertions    (organization_id, source_id, entity_kind, state)
evidence_assertions    (organization_id, assertion_key, value_hash)
evidence_bindings      (organization_id, assertion_id, binding_state)
evidence_bindings      (organization_id, object_id) where object_id is not null
evidence_bindings      (organization_id, risk_id) where risk_id is not null
evidence_bindings      (organization_id, relation_id) where relation_id is not null
```

GIN по всему raw `payload` не создаётся: он увеличит стоимость ingestion и
расширит произвольный query surface. Поиск выполняется по нормализованным
assertions и allowlisted expression indexes, добавленным только по измеренному
query pattern.

---

## 15. Transaction И Concurrency Contract

Один active batch на source/installation обеспечивается connector orchestrator
и partial unique lock в runtime migration. Внутри batch:

- source lookup, record upsert, observation insert и record pointer update
  выполняются одной tenant-scoped transaction/RPC;
- record блокируется по stable identity, чтобы параллельный replay не создал
  две revision с одним номером;
- batch получает terminal status только после обработки всех bounded pages;
- cursor продвигается Connector Runtime только после durable batch commit;
- retry использует тот же idempotency key;
- normalization может повторяться новой version без повторного fetch raw data;
- rejected row не блокирует safe partial success, но aggregate result точен.

Server Action не выполняет длинную открытую transaction через внешний network
request. Fetch завершается до database commit boundary.

---

## 16. Совместимость С Текущим MVP

До отдельной implementation task:

- CSV/XLSX import продолжает direct create-only запись Objects/Risks;
- `[Import Source]` block остаётся текущим source context;
- explainability читает существующий block;
- Trust Engine читает Objects, Risks, Trust Passports и history;
- никакой raw/assertion record не влияет на Score;
- manual edits имеют приоритет над будущими automated projections.

Переход выполняется через dual-read, а не destructive cutover:

1. создать Evidence Layer schema и security policies;
2. включить shadow evidence write для новых imports без Trust effect;
3. сверить counts, idempotency и two-tenant isolation;
4. backfill только доказуемую metadata из legacy source blocks с
   `origin_kind = file_import` и safe migration marker
   `legacy_import_context`, без выдуманного raw payload;
5. explainability читает Evidence Layer first и legacy block fallback;
6. перевод business projection выполняется отдельной утверждённой задачей;
7. legacy blocks удаляются только после regression/restore gate.

Backfill не повышает confidence и не объявляет старую строку полноценным raw
evidence, если исходный файл/record не сохранился.

---

## 17. План Будущей Миграции

Предлагаемое имя первой migration:
`020_evidence_layer_foundation.sql`. Номер подтверждается перед созданием, если
к тому моменту появились другие migrations.

### Gate 0 — До SQL

- завершить S15-T003 normalization/identity;
- завершить S15-T004 confidence/Discovery states;
- завершить S15-T005 connector security review;
- согласовать raw retention для deployment;
- определить runtime transaction и audit adapter.

### Migration A — Structural Foundation

- создать шесть таблиц и CHECK constraints;
- добавить `(organization_id, id)` unique keys к target tables;
- создать composite tenant FKs;
- включить RLS и deny direct mutations;
- создать indexes без connector runtime;
- не выполнять backfill и не менять Trust Engine.

### Migration B — Controlled Ingestion

- добавить server-only repository/RPC;
- shadow-write новых CSV/XLSX imports;
- включить audit и retention timestamps;
- проверить partial success и rollback semantics.

### Migration C — Read Compatibility

- добавить safe evidence read models;
- включить explainability dual-read;
- выполнить optional legacy metadata backfill;
- оставить manual/import business rows source of truth.

### Migration D — Approved Projection

Только после pilot evidence и Discovery acceptance: confirmed bindings могут
создавать/обновлять business model через отдельный projector. Connector и
normalizer по-прежнему не пишут business tables напрямую.

Rollback отключает new write/read paths и сохраняет evidence tables для
диагностики. Автоматический DROP или удаление business data запрещены.

---

## 18. Migration Acceptance Tests

До production применения обязательны:

- два tenant не видят sources, batches, records, observations, assertions и
  bindings друг друга;
- forged `organization_id` и cross-tenant FK отклоняются database;
- owner/analyst/admin/viewer не могут напрямую мутировать ingestion tables;
- viewer не может читать raw observation/source record ID;
- replay batch и replay payload не создают duplicate observation;
- changed payload создаёт следующую revision;
- partial/failed batch не помечает missing records stale/tombstoned;
- invalid target shape и неизвестный factor key отклоняются;
- raw purge сохраняет assertion digest и confirmed binding;
- disconnect source не удаляет business entities;
- audit metadata проходит redaction contract;
- migration rollback path проверен на копии/локальном Supabase;
- type generation и application build проходят после migration.

Cloud migration не запускается без backup/restore gate из Sprint 14.

---

## 19. Отложенные Решения

| Решение | Владелец |
|---|---|
| Canonical fields, identity keys, match/merge/manual override | Определены в S15-T003 |
| Confidence formula, thresholds, candidate transitions, Inbox UX | S15-T004 |
| Secret backend, final RBAC matrix, FORCE RLS/runtime, SSRF controls | S15-T005 |
| Первый vendor/source и connector-specific schema | S15-T006/T007 |
| Scheduler/queue and retention worker implementation | Future runtime task |
| Trust Score projection from confirmed evidence | Separate post-foundation ADR/task |

Эти решения не должны менять базовые гарантии: tenant ownership, immutable raw
revision, explicit provenance, idempotency и отсутствие direct connector writes
в business model.

---

## 20. Acceptance Criteria S15-T002

- [x] Определены source metadata и lifecycle.
- [x] Разделены stable record, raw observation и normalized assertion.
- [x] Зафиксированы confidence storage и отсутствие Trust effect до approval.
- [x] Определены `last_seen_at`, replay, revision, stale и tombstone semantics.
- [x] Определены tenant-safe связи с Objects, Risks, Relations и Trust factors.
- [x] Зафиксированы RLS/RBAC baseline и safe audit metadata.
- [x] Определены retention defaults и controlled purge boundary.
- [x] Описаны indexes, transaction/idempotency и migration acceptance tests.
- [x] Подготовлен staged migration plan без изменения текущего MVP.

---

## 21. Связанные Документы

- [ARCHITECTURE_DECISIONS.md](../../ARCHITECTURE_DECISIONS.md) — ADR-007 и
  ADR-009.
- [Connector_Framework_Architecture.md](Connector_Framework_Architecture.md) —
  adapter, orchestrator и ingestion boundaries.
- [Normalization_Identity_Resolution.md](Normalization_Identity_Resolution.md)
  — canonical normalization, identity keys, resolver и merge policy.
- [Evidence_First_Architecture.md](Evidence_First_Architecture.md) — целевая
  Evidence-first архитектура.
- [Evidence_Import_Schema.md](Evidence_Import_Schema.md) — текущий CSV/XLSX
  source metadata contract.
- [Evidence_Explainability_Model.md](Evidence_Explainability_Model.md) —
  compatibility explainability/source contract.
- [Database_Design_Full.md](Database_Design_Full.md) — фактическая схема MVP.
- [SECURITY_OVERVIEW.md](../security/SECURITY_OVERVIEW.md) — security baseline.
- [SPRINT_15.md](../../tasks/SPRINT_15.md) — порядок Connector Foundation.
