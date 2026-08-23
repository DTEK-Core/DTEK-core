# Connector_Framework_Architecture.md — DTEK Core

`Статус: утверждённая архитектура foundation`<br>
`Дата: 23.08.2026`<br>
`Решение: ADR-009`<br>
`Задача: S15-T001`<br>
`Область: Post-MVP Connector Framework`

---

## 1. Назначение

Документ определяет единый архитектурный контракт подключения внешних
источников к DTEK Core. Он отвечает на вопросы:

- где заканчивается vendor-specific connector и начинается DTEK Core;
- как запускается и отслеживается синхронизация;
- как данные попадают в будущий Evidence Layer;
- как обеспечиваются idempotency, tenant isolation и безопасные ошибки;
- какие действия разрешены пользователю и системе;
- как добавлять первый и последующие коннекторы без ad hoc интеграций.

S15-T001 не создаёт runtime, таблицы, миграции, UI или production connector.
Evidence data model, identity resolution, confidence, Discovery Inbox и
детальная security model уточняются в S15-T002–T005.

---

## 2. Контекст И Ограничения

Текущий import path уже поддерживает CSV/XLSX, normalization, preview,
validation, duplicate detection, source metadata, partial success и audit. При
commit он напрямую создаёт `objects` и `risks`, а source context временно
хранится в trailing `[Import Source]` text block.

Connector Framework не должен просто повторить этот direct-write подход для
каждого vendor. После появления Evidence Layer целевой поток выглядит так:

```text
External Source / Structured Import
  -> Connector Adapter
  -> Ingestion Gateway
  -> Raw Evidence Batch
  -> Normalization
  -> Identity Resolution
  -> Confidence Policy
  -> Discovery Inbox / deterministic auto-accept rule
  -> Objects / Relations / Risk Candidates
  -> Trust Passport / Trust Graph / Trust Score
```

ADR-006 и ADR-007 остаются в силе: DTEK Core не становится SIEM, EDR,
vulnerability scanner, CMDB, heavy ETL или connector marketplace.

---

## 3. Архитектурное Решение

Connector Framework реализуется как **versioned adapter layer внутри текущего
Next.js + Supabase приложения** с общим ingestion contract.

Foundation использует следующие правила:

1. Adapter знает внешний источник, но не бизнес-таблицы DTEK Core.
2. Connector не создаёт и не обновляет `objects`, `relations` или `risks`
   напрямую.
3. Каждый installation, run, batch и evidence record имеет явный
   `organization_id`.
4. Credentials доступны только server-side через secret reference.
5. Повторный run или retry не создаёт дубли.
6. Неоднозначные выводы не влияют на Trust Score до подтверждения.
7. Manual override имеет приоритет над автоматическим обновлением.
8. Foundation поддерживает bounded pull; realtime streaming и agent runtime не
   входят в решение.
9. Первый connector выбирается только после pilot evidence.

---

## 4. Компоненты Framework

### 4.1. Connector Definition

Versioned manifest, поставляемый кодом приложения. Он описывает возможности,
но не содержит tenant configuration или secrets.

Обязательные поля:

| Поле | Назначение |
|---|---|
| `key` | стабильный технический ключ adapter |
| `version` | версия контракта/mapping |
| `displayName` | безопасное имя для UI |
| `category` | directory, monitoring, vulnerability, security, network, virtualization, cloud или import |
| `authKinds` | поддержанные способы авторизации |
| `syncModes` | `manual_pull` и/или `scheduled_pull` |
| `capabilities` | assets, identities, vulnerabilities, relations, controls или coverage |
| `configSchemaVersion` | версия non-secret configuration |
| `mappingVersion` | версия преобразования raw record в canonical evidence |

Registry является allowlist: installation нельзя создать для неизвестного
`key` или неподдержанной версии. Dynamic plugins и marketplace не входят в
foundation.

### 4.2. Connector Installation

Tenant-scoped экземпляр definition. Он хранит только:

- `organization_id`;
- definition key/version;
- человекочитаемое имя;
- non-secret allowlisted configuration;
- opaque `secret_ref`;
- sync mode и schedule metadata;
- lifecycle state;
- timestamps и actor context.

Raw token, password, private key, client secret или полный connection string в
installation row, audit metadata, UI, URL или Git не сохраняются.

### 4.3. Connector Adapter

Adapter инкапсулирует только vendor/protocol-specific поведение:

- validate configuration;
- test connection;
- fetch bounded page/batch;
- return stable source identity and collection time;
- expose checkpoint/cursor;
- classify source errors;
- close network resources.

Adapter не выполняет identity merge, Trust Score calculation, risk creation,
RLS decisions или UI formatting.

Концептуальный контракт:

```ts
interface ConnectorAdapter {
  manifest: ConnectorManifest;
  validateConfig(input: unknown): ValidationResult;
  testConnection(context: ConnectorExecutionContext): Promise<TestResult>;
  pull(context: ConnectorExecutionContext): AsyncIterable<ConnectorPage>;
}

interface ConnectorExecutionContext {
  organizationId: string;
  installationId: string;
  runId: string;
  initiatedBy: UserActor | SystemActor;
  cursor: string | null;
  signal: AbortSignal;
  secrets: ConnectorSecretAccessor;
}

interface RawConnectorRecord {
  sourceRecordId: string;
  entityKind: string;
  collectedAt: string;
  payload: unknown;
}
```

Финальные TypeScript types создаются только вместе с runtime-задачей. Любой
payload повторно валидируется на server side до durable write.

### 4.4. Ingestion Gateway

Единственная точка приёма connector/import batches. Gateway:

- проверяет installation, organization и run context;
- применяет limits и schema version;
- формирует idempotency identity;
- сохраняет batch/evidence через будущий repository;
- возвращает counts и safe failures;
- передаёт durable records в normalization pipeline.

CSV/XLSX остаётся рабочим MVP path. После S15-T002 он постепенно получает
совместимый ingestion adapter; существующий import нельзя ломать или молча
переводить на новую схему без migration/backward-compatibility plan.

### 4.5. Orchestrator

Server-only application service, общий для manual и scheduled runs:

```text
authorize trigger
  -> acquire installation lease
  -> create run
  -> resolve secret through secret accessor
  -> test/pull bounded pages
  -> persist through ingestion gateway
  -> checkpoint after durable write
  -> finalize counters/status
  -> emit safe audit/operational events
```

Manual run начинается из авторизованной Server Action. Scheduled run
инициируется доверенным server-owned trigger и вызывает тот же use case.
Connector logic не выполняется в Client Component.

Vercel/Supabase scheduler, queue или отдельный worker не выбираются в T001.
Первый runtime должен доказать необходимость конкретного механизма; long-lived
process внутри обычного Next.js request запрещён.

---

## 5. Sync Modes И Execution Boundary

### Foundation Modes

| Mode | Назначение | Статус |
|---|---|---|
| `manual_pull` | bounded run по явной команде | обязательный первый runtime path |
| `scheduled_pull` | периодический bounded run через server-owned trigger | контракт предусмотрен, activation позже |
| webhook | входящие события | non-scope foundation |
| realtime stream | постоянный поток | non-scope |
| endpoint agent | локальный сборщик | non-scope |

### Execution Rules

- один installation не имеет двух активных runs одновременно;
- каждый page/batch ограничен по records, bytes и времени;
- cursor продвигается только после durable write;
- timeout завершает run безопасным terminal state;
- cancellation не откатывает уже durable evidence, но не продвигает
  неподтверждённый checkpoint;
- retries выполняются только для явно retryable errors с bounded backoff;
- scheduler не хранит credentials в payload;
- один tenant не должен исчерпывать общий concurrency budget.

Конкретные limits задаются первым connector prototype и проверяются contract
tests.

---

## 6. Lifecycle

### 6.1. Installation State

```text
draft -> configured -> active <-> paused
                     -> error -> active/paused
active/paused/error -> disconnected
```

| State | Значение |
|---|---|
| `draft` | configuration ещё не готова к test |
| `configured` | schema валидна, connection ещё не подтверждено |
| `active` | installation разрешено запускать |
| `paused` | новые scheduled runs запрещены, history сохранена |
| `error` | требуется operator action; бесконечный auto-retry запрещён |
| `disconnected` | credentials/references отозваны, новые runs запрещены |

Удаление installation не удаляет автоматически evidence или бизнес-объекты.
Retention/cleanup выполняются отдельной явной политикой.

### 6.2. Sync Run State

```text
queued -> running -> completed
                  -> partial
                  -> failed
                  -> cancelled
```

Terminal state неизменяем. Повторный запуск создаёт новый `run_id`, но
использует idempotency keys исходных records.

### 6.3. Connection Test

Connection test является отдельной bounded operation. Он:

- не импортирует records;
- не возвращает secret/endpoint details;
- проверяет только минимально необходимые permissions/capabilities;
- имеет короткий timeout;
- создаёт audit event с safe result.

---

## 7. Idempotency, Cursor И Freshness

Минимальная source identity:

```text
organization_id
  + installation_id
  + entity_kind
  + source_record_id
```

Если источник не предоставляет stable record ID, adapter создаёт
детерминированный canonical key по утверждённой mapping policy; слабый key
снижает confidence и не разрешает blind auto-merge.

Дополнительные правила:

- ingestion batch имеет уникальный `run_id` и sequence;
- одинаковый content повторно не создаёт новую бизнес-сущность;
- changed content создаёт новую evidence revision или observation, а не
  незаметно переписывает историю;
- неполный/failed run не означает исчезновение отсутствующих records;
- explicit source tombstone и absence from a verified full snapshot различны;
- stale evidence помечается через freshness policy, а не удаляется сразу;
- ручное поле/связь с manual override не перезаписывается connector data.

Точная схема keys/revisions/retention определяется в S15-T002, matching — в
S15-T003.

---

## 8. Mapping Boundary

Mapping делится на два этапа:

1. Adapter переводит vendor response в стабильный raw connector record.
2. Versioned normalizer переводит raw record в canonical evidence assertions.

Manifest фиксирует `mappingVersion`. Изменение mapping не должно задним числом
переписывать historical evidence без отдельного controlled reprocessing run.

Allowlisted canonical entity kinds на foundation:

- `asset`;
- `identity`;
- `vulnerability`;
- `relation`;
- `control_state`;
- `coverage`.

`risk` не принимается как безусловная финальная сущность: источник создаёт
evidence/risk candidate, а не активный Risk Registry record.

---

## 9. Authorization И Tenant Isolation

S15-T005 утвердил итоговую foundation matrix:

| Действие | owner | analyst | admin | viewer |
|---|:---:|:---:|:---:|:---:|
| Видеть health и safe run status | Да | Да | Да | Нет |
| Создать draft / non-secret config | Да | Да | Technical Object scope | Нет |
| Записать/заменить credential, без reveal | Да | Да | Нет | Нет |
| Test connection / manual run / pause | Да | Да | Technical Object scope | Нет |
| First activation/schedule/authority | Да | Нет | Нет | Нет |
| Disconnect/delete installation | Да | Нет | Нет | Нет |
| Видеть normalized evidence context | Да | Да | Safe technical context | Нет |
| Видеть raw evidence | Да | Да | Redacted diagnostics | Нет |

Полная матрица, secret lifecycle и runtime controls определены в
[`CONNECTOR_SECURITY_MODEL.md`](../security/CONNECTOR_SECURITY_MODEL.md).

Обязательные tenant controls:

- `organization_id NOT NULL` во всех tenant-scoped connector/evidence tables;
- RLS включена до выдачи доступа;
- Server Action повторно проверяет session, membership и role;
- service-role operation всегда получает organization из проверенного context,
  а не из client payload;
- cross-table links проверяют принадлежность одной организации;
- background run получает organization из installation и фиксирует её один раз
  в immutable run context;
- каждый repository query явно scoped по organization;
- contract tests используют минимум два tenant.

Service role является механизмом выполнения, а не авторизации.

---

## 10. Secret Handling

Connector credentials доступны только через `ConnectorSecretAccessor`.

Минимальный контракт:

- UI отправляет credential только в защищённую server mutation;
- значение валидируется и записывается в утверждённый secret backend;
- database хранит opaque `secret_ref`, type и safe timestamps;
- read path никогда не возвращает credential обратно;
- update выполняется заменой, не reveal;
- disconnect отзывает/удаляет secret reference;
- logs, audit, error metadata и test result проходят redaction;
- key rotation и access audit обязательны до production connector.

S15-T005 выбрал Supabase Vault для dynamic per-tenant credentials. Environment
secrets остаются только platform-level механизмом. Vault provisioning,
private-schema helpers и root-key restore test выполняются отдельной
migration/runtime task. Хранение plaintext/encrypted-by-application secret в
обычном tenant JSON запрещено без отдельного ADR.

---

## 11. Network И Source Safety

Любой connector, принимающий endpoint/host от tenant, создаёт SSRF-риск.
Production implementation обязана предусмотреть:

- allowlisted protocols;
- запрет credentials в URL;
- canonical host validation до запроса;
- запрет loopback, link-local, metadata endpoints и private ranges для SaaS,
  если отдельный controlled connector gateway не утверждён;
- защиту от DNS rebinding и redirect на запрещённый адрес;
- connect/read/overall timeouts;
- response size, pagination и decompression limits;
- TLS verification без пользовательского `disable verify`;
- egress и on-prem requirements как отдельное deployment decision.

Connector для private customer network нельзя имитировать из cloud runtime.
Если source недоступен извне, требуется отдельное решение о gateway/on-prem
collector, которое не входит в Sprint 15 foundation.

---

## 12. Error Contract

Adapter возвращает internal structured error, а UI получает только safe code и
короткое действие пользователя.

| Code | Retryable | Пользовательский Смысл |
|---|:---:|---|
| `AUTH_FAILED` | Нет | Проверьте учётные данные |
| `PERMISSION_DENIED` | Нет | Источнику не хватает read permissions |
| `CONFIG_INVALID` | Нет | Конфигурация неполна или некорректна |
| `NETWORK_UNREACHABLE` | Да | Источник временно недоступен |
| `SOURCE_UNAVAILABLE` | Да | Внешний сервис вернул временную ошибку |
| `RATE_LIMITED` | Да | Достигнут лимит источника |
| `TIMEOUT` | Да | Операция превысила допустимое время |
| `CONTRACT_CHANGED` | Нет | Формат источника не соответствует adapter version |
| `INGESTION_REJECTED` | Зависит | Batch не прошёл schema/tenant/size checks |
| `CANCELLED` | Нет | Run остановлен контролируемо |
| `INTERNAL_ERROR` | Нет | Требуется внутренний triage |

Raw response body, stack, endpoint, account name, token, query и tenant UUID в
UI/audit не возвращаются. Operational logs используют correlation/run ID и
redacted diagnostic context.

---

## 13. Audit И Observability

Минимальные security events:

```text
connector.created
connector.configuration_changed
connector.credential_replaced
connector.connection_tested
connector.activated
connector.paused
connector.disconnected
connector.sync_started
connector.sync_completed
connector.sync_partial
connector.sync_failed
```

Safe metadata может содержать connector key/version, trigger kind, status,
duration bucket и aggregate counts. Она не содержит secret, raw payload,
source record IDs, internal tenant UUID или customer hostnames.

Manual event имеет user actor. Scheduled event использует явный system actor и
trigger context, а не подставной пользователь. Текущий request-bound
`createSecurityEvent()` нельзя напрямую использовать в background runtime без
контекстно-независимого audit adapter.

Operational metrics foundation:

- runs by status;
- records fetched/accepted/rejected;
- duration;
- retry count;
- last successful sync;
- cursor/checkpoint age;
- stale evidence count;
- safe error category.

Новый telemetry vendor в T001 не добавляется.

---

## 14. Совместимость С Trust Model

- Raw/low-confidence evidence не влияет на Trust Score.
- Только verified или policy-approved assertions могут обновлять модель.
- Trust Score Engine продолжает работать по текущим business tables до
  отдельной задачи интеграции.
- Discovery Inbox защищает модель от ambiguous matches и data poisoning.
- Manual override и expert correction сохраняются как first-class provenance.
- Explainability должна уметь читать новый Evidence Layer и старый
  `[Import Source]` context в период совместимости.
- Удаление/отключение connector не выполняет каскадное удаление Objects, Risks
  или score history.

---

## 15. Предлагаемая Структура Будущего Кода

Структура фиксирует ownership boundaries, но не создаётся в S15-T001:

```text
lib/connectors/
  contracts.ts
  registry.ts
  orchestrator.ts
  errors.ts
  secrets.ts
  adapters/<connector-key>/

lib/evidence/
  ingestion.ts
  repository.ts
  normalization/
  identity/

lib/actions/connectors.ts
```

UI подключается к Server Actions и safe read models. Adapter не импортирует
React, Next navigation, UI components или Trust Engine.

---

## 16. Test Contract Для Будущего Runtime

Каждый adapter проходит общий contract suite:

- manifest/config schema;
- connection test success и safe failure;
- pagination/cursor;
- retry/idempotency;
- duplicate/replayed batch;
- timeout/cancellation;
- payload/response limits;
- secret redaction;
- two-tenant isolation;
- manual override preservation;
- partial/full snapshot semantics;
- audit allowlist;
- cleanup активных handles/processes.

Vendor fixtures должны быть synthetic/redacted и не содержать customer data.

---

## 17. Этапы Внедрения

| Этап | Результат |
|---|---|
| Current | CSV/XLSX import остаётся стабильным direct business-data path |
| S15-T002 | Evidence Layer schema specification и migration plan |
| S15-T003 | normalization, identity keys, merge/manual override policy |
| S15-T004 | confidence и Discovery Inbox state/actions |
| S15-T005 | Supabase Vault, RBAC/RLS, SSRF, audit и security gates утверждены |
| S15-T006 | Russian Market research shortlist и admission gates подготовлены; pilot validation pending |
| S15-T007 | первый candidate выбран по pilot evidence или явно отложен |
| Future prototype | manual pull adapter на общем contract |
| After validation | scheduled pull и controlled compatibility migration |

CSV/XLSX не переводится на новый runtime до появления Evidence Layer и
регрессионного плана.

---

## 18. Отклонённые Альтернативы

| Альтернатива | Почему Отклонена |
|---|---|
| Отдельный Server Action для каждого vendor с direct write | дублирует auth/mapping/audit и разрушает provenance |
| Прямая запись connector в Objects/Risks | нет raw evidence, review, confidence и safe retry |
| Несколько production connectors сразу | нет подтверждённого первого source и contract baseline |
| Собственный always-on microservice сейчас | новый стек и operations до подтверждения нагрузки |
| Realtime/event streaming | несоразмерно pilot needs, усложняет ordering/replay |
| Marketplace/dynamic plugin loading | supply-chain и compatibility риск без product demand |
| Хранение credentials в JSON/config table | повышает blast radius и риск раскрытия |
| Автоматическое удаление отсутствующих records | partial run может повредить цифровую модель |

---

## 19. Решения Следующих Задач

T001 намеренно не фиксирует:

- SQL tables, constraints, retention и evidence revision model — S15-T002;
- canonical fields, match priority и merge rules — S15-T003;
- confidence thresholds и Discovery Inbox UX — S15-T004;
- connector-specific endpoint/scopes/limits поверх утверждённой S15-T005
  security model — future prototype task;
- первый российский connector — S15-T007 после pilot signals и T006 admission gate;
- scheduler/queue vendor — первый runtime/prototype decision.

---

## 20. Acceptance Criteria S15-T001

- [x] Определён единый versioned adapter contract.
- [x] Connector отделён от Evidence/Normalization/Trust layers.
- [x] Описаны installation/run lifecycle и manual/scheduled boundaries.
- [x] Зафиксированы idempotency, cursor, freshness и deletion semantics.
- [x] Зафиксированы tenant isolation, secret reference и SSRF gates.
- [x] Описаны safe errors, audit events и observability.
- [x] Сохранена совместимость с CSV/XLSX и Trust model.
- [x] Runtime, миграции и первый connector не реализуются преждевременно.

---

## 21. Связанные Документы

- [ARCHITECTURE_DECISIONS.md](../../ARCHITECTURE_DECISIONS.md) — ADR-006,
  ADR-007 и ADR-009.
- [Evidence_First_Architecture.md](Evidence_First_Architecture.md) — целевая
  Evidence-first модель.
- [Evidence_Layer_Data_Model.md](Evidence_Layer_Data_Model.md) — source,
  batch, raw observation, normalized assertion и binding schema contract.
- [Normalization_Identity_Resolution.md](Normalization_Identity_Resolution.md)
  — canonical mapping, identity keys, conflict и merge policy.
- [Confidence_Engine_Discovery_Inbox.md](Confidence_Engine_Discovery_Inbox.md)
  — confidence calculation, review queue и decision boundaries.
- [Evidence_Import_Schema.md](Evidence_Import_Schema.md) — текущий import
  contract и source metadata.
- [System_Architecture.md](System_Architecture.md) — фактическая архитектура.
- [SECURITY_OVERVIEW.md](../security/SECURITY_OVERVIEW.md) — security baseline.
- [SPRINT_15.md](../../tasks/SPRINT_15.md) — последовательность foundation.
- [PILOT_METRICS_FEEDBACK_LOOP.md](../product/PILOT_METRICS_FEEDBACK_LOOP.md) —
  gates для выбора первого source.
