# CONNECTOR_SECURITY_MODEL.md — DTEK Core

`Версия: 1.0`
`Дата: 23.08.2026`
`Статус: Утверждённая спецификация S15-T005`
`Основа: ADR-007, ADR-009, Sprint 15, Evidence Layer, Identity Resolution, Confidence Engine`

---

## 1. Назначение И Граница Решения

Документ определяет обязательную модель безопасности Connector Framework до
реализации первого runtime или production connector. Он является дополнением к
`SECURITY_OVERVIEW.md`, `RBAC_MODEL.md`, `RLS_MODEL.md` и ADR-009.

S15-T005 фиксирует:

- хранение и жизненный цикл tenant connector credentials;
- итоговую RBAC-матрицу connector и evidence operations;
- RLS, grants и service-credential boundary;
- защиту outbound connector runtime от SSRF и hostile sources;
- safe errors, audit, monitoring и incident response;
- security acceptance gates для будущей migration и первого connector.

Задача не включает SQL migration, Vault provisioning, UI, scheduler, worker,
adapter implementation, новые зависимости или выбор первого vendor. Текущий
CSV/XLSX import и Commercial MVP не изменяются.

---

## 2. Security Principles

1. **Fail closed.** Ошибка authorization, tenant context, Vault, TLS, schema
   validation или network policy останавливает operation/run.
2. **Server-only credentials.** Credential никогда не возвращается в browser,
   Client Component, Server Component props, URL, audit или application log.
3. **No direct business writes.** Connector пишет только через Orchestrator и
   Ingestion Gateway; Objects, Relations, Risks и Trust model обновляются через
   review/projection contract.
4. **Tenant context is immutable.** `organization_id` устанавливается из
   авторизованного server context, а не из доверенного client input.
5. **RLS is necessary, not sufficient.** Server credential может обходить RLS,
   поэтому application authorization, explicit grants и composite tenant FKs
   являются независимыми обязательными controls.
6. **Least privilege at both ends.** DTEK Core role и внешний service account
   получают минимальные права для read-only collection.
7. **Evidence is untrusted input.** Даже authenticated source может быть
   скомпрометирован или возвращать ошибочные/вредоносные данные.
8. **No silent authority.** Low/ambiguous evidence не влияет на Trust model;
   merge, Risk creation и business-context decisions остаются human-controlled.
9. **Bound every run.** Время, retries, redirects, pages, records и payload size
   ограничены connector definition и platform ceiling.
10. **Audit without disclosure.** События доказывают действие и результат, но не
    содержат secrets, raw evidence или инфраструктурные identifiers.

---

## 3. Assets, Actors И Trust Boundaries

### 3.1. Защищаемые Assets

- API tokens, passwords, OAuth client/refresh secrets и private key material;
- platform-level Supabase secret/service credential;
- tenant topology, hostnames, IP, identities, vulnerabilities и raw evidence;
- connector configuration, source identity, cursor и run history;
- object/risk/relation bindings и Trust interpretation;
- tenant isolation, manual overrides и audit trail.

### 3.2. Threat Actors

| Actor | Возможность |
|---|---|
| Malicious tenant user | Подменяет IDs/config, пытается повысить роль или прочитать соседний tenant |
| Compromised source | Возвращает poisoned, oversized, replayed или malformed payload |
| External attacker | Использует connector endpoint для SSRF, credential theft или denial of service |
| Compromised adapter/dependency | Обходит validation, логирует secret или выполняет лишние requests |
| Privileged operator | Ошибочно раскрывает Vault, service credential, backup или raw evidence |
| Background job fault | Теряет tenant context, повторяет run или продвигает cursor до durable write |

### 3.3. Trust Boundaries

```text
Browser
  -> authenticated Next.js Server Action / Route Handler
  -> application authorization + immutable tenant context
  -> connector repository / private secret accessor
  -> outbound network policy
  -> external source (untrusted response)
  -> adapter schema validation
  -> Ingestion Gateway
  -> tenant-scoped Evidence Layer
  -> Confidence / Discovery Inbox
  -> reviewed business projection
```

Переход через каждую стрелку требует собственной проверки. Наличие успешной
проверки на предыдущей границе не заменяет проверку на следующей.

---

## 4. Secret Storage Decision

### 4.1. Выбранный Backend

Для динамических per-tenant connector credentials в Supabase-hosted deployment
выбран **Supabase Vault**. Connector installation хранит только opaque
`secret_ref`, credential kind и безопасные timestamps/status metadata.

Environment variables/Vercel secrets остаются только для platform-level
credentials, например Supabase server secret. Они не подходят для динамических
секретов множества организаций и installations.

Выбор Vault является частью ADR-009 security detail, а не разрешением включить
extension без отдельной migration/release task. Если конкретный deployment не
поддерживает Vault, требуется новый ADR для provider secret store; plaintext или
самодельное шифрование в tenant JSON запрещено.

### 4.2. Private Access Boundary

- Vault и secret helper functions находятся в non-exposed private schema;
- `anon`, `authenticated` и `PUBLIC` не получают direct `SELECT` decrypted view
  или `EXECUTE` secret functions;
- `SECURITY DEFINER` functions используют `SET search_path = ''` и полностью
  schema-qualified object names;
- функция принимает installation context, а не произвольный secret name;
- secret value доступно только `ConnectorSecretAccessor` внутри server runtime;
- accessor предоставляет use-once value для outbound call и не реализует reveal;
- browser/client API получает только `configured`, `rotated_at`, expiry bucket и
  safe status;
- platform server secret хранится только в server environment и никогда не
  импортируется в client bundle.

### 4.3. Credential Bundle

Каждый connector definition содержит versioned Zod schema для одного из
allowlisted auth kinds:

| Kind | Правило |
|---|---|
| API token | Только header-based; token в URL/query запрещён |
| OAuth 2 client credentials | Минимальные read scopes; client secret в Vault |
| OAuth refresh credential | Refresh/access values в Vault; rotation атомарна |
| Basic auth | Только если источник не поддерживает более сильный способ и прошёл security review |
| mTLS | Private key material в secret backend; certificate metadata отдельно |

Credential не должен принадлежать человеку или иметь domain/global admin права,
если source поддерживает dedicated read-only service account.

### 4.4. Create, Replace, Rotate, Revoke

```text
authorize write-only operation
  -> validate connector-specific credential shape in memory
  -> create pending Vault secret
  -> test connection through outbound policy
  -> atomically switch installation secret_ref on success
  -> revoke/delete previous secret
  -> emit safe audit event
```

При failed test pending secret удаляется, active reference не меняется. Secret
history по умолчанию не сохраняется. Disconnect удаляет/revokes secret и очищает
reference, но не удаляет уже собранное evidence или business model.

Rotation выполняется при expiry, provider revocation, suspected compromise,
изменении service account или по deployment policy. UI не показывает предыдущее
значение и не поддерживает download/export credentials.

### 4.5. Backup И Restore

Vault root encryption key является частью recovery boundary. Same-project
managed restore должен быть проверен rehearsal. При logical restore в новый
Supabase project encrypted Vault values не считаются переносимыми без
утверждённой процедуры переноса root key.

Безопасный default для нового project: восстановить connector installations в
`credentials_required/paused`, повторно ввести credentials и выполнить test
connection. Backup не должен содержать decrypted secret values.

---

## 5. Final RBAC Matrix

RBAC проверяется server-side перед каждым action и повторно в repository/use
case boundary. UI visibility не считается authorization.

| Operation | owner | analyst | admin | viewer |
|---|:---:|:---:|:---:|:---:|
| Видеть installation и safe health/status | Да | Да | Да | Нет |
| Создать draft / изменить non-secret config | Да | Да | Только technical Object scope | Нет |
| Записать/заменить credential (write-only) | Да | Да | Нет | Нет |
| Test connection / manual run | Да | Да | Только technical Object scope | Нет |
| Pause/resume active installation | Да | Да | Только technical Object scope | Нет |
| First activation / schedule / source authority | Да | Нет | Нет | Нет |
| Auto-policy / retention override / legal hold | Да | Нет | Нет | Нет |
| Disconnect/delete installation | Да | Нет | Нет | Нет |
| Читать normalized evidence/source context | Да | Да | Safe technical context | Нет |
| Читать raw evidence detail | Да | Да | Redacted diagnostics only | Нет |
| Discovery Object candidate actions | Да | Да | Только technical Object scope | Нет |
| Confirm/create Relation или Risk candidate | Да | Да | Нет | Нет |
| Merge/alias Objects | Да | Нет | Нет | Нет |
| Читать Connector Audit Log | Да | Нет | Да | Нет |

Ограничения:

- analyst может настроить и проверить источник по US-104, но owner утверждает
  первое включение, schedule, authority, retention и destructive actions;
- admin действует только для connector definition с capability
  `technical_objects`; доступ к identity/vulnerability/raw business evidence не
  выводится из общего права редактирования инфраструктурных Objects;
- viewer получает только уже подтверждённые business projections и агрегированное
  source coverage в существующих read-only экранах;
- custom roles/scopes требуют отдельного enterprise ADR.

---

## 6. Tenant Isolation, RLS И Database Grants

### 6.1. Required Data Controls

Для каждой future connector/evidence/candidate table обязательны:

- `organization_id UUID NOT NULL`;
- RLS enabled до выдачи grants;
- tenant-scoped `SELECT` policy в соответствии с матрицей выше;
- запрет direct `INSERT/UPDATE/DELETE` для `anon` и `authenticated` там, где
  mutation должна идти через Server Action/repository;
- composite foreign keys `(organization_id, referenced_id)` для всех tenant
  relations;
- unique/idempotency constraints включают `organization_id`;
- repository mutation всегда фильтрует и ID, и `organization_id`;
- ни один client input не может назначить системный actor или другой tenant.

Grants и RLS являются отдельными слоями. Future migration явно выполняет
`REVOKE` default privileges и выдаёт минимальные table/function permissions.
Internal tables/functions размещаются в non-exposed schema, если PostgREST
доступ к ним не требуется.

### 6.2. Service Credential Boundary

Supabase server secret/legacy `service_role` bypasses RLS. Поэтому:

- он используется только в отдельном server-only repository/runtime module;
- request-bound user client остаётся источником AuthN и tenant role;
- admin client не принимает `organization_id`, role или actor из browser body;
- use case получает immutable `ExecutionContext` после authorization;
- background actor создаётся из installation/run row и подписанного internal
  trigger, а не имитирует profile UUID;
- каждая privileged mutation проверяет tenant consistency до и после write;
- two-tenant repository tests обязательны даже при наличии RLS;
- server secret никогда не передаётся в adapter или внешнему source.

Переход с legacy `SUPABASE_SERVICE_ROLE_KEY` на новый Supabase server secret
может быть выполнен отдельной deployment compatibility task. T005 не меняет
текущую environment contract.

### 6.3. Existing Helper Hardening Gate

До connector migration существующие `SECURITY DEFINER` helpers должны пройти
отдельную migration review: pin `search_path = ''`, schema-qualify references и
проверить `EXECUTE` grants. T005 фиксирует gate, но не переписывает применённые
migrations `001-019`.

`FORCE ROW LEVEL SECURITY` оценивается per table с repository tests. Оно не
заменяет controls для server credential, который может bypass RLS.

---

## 7. Outbound Network And SSRF Policy

### 7.1. Foundation Default

Первый SaaS runtime поддерживает только code-owned allowlisted public vendor
endpoints или connector-specific hostname patterns. Произвольный tenant URL,
private IP, локальная сеть и custom webhook в foundation запрещены.

On-prem/private network integration требует отдельного outbound-only collector
или controlled egress gateway ADR: signed enrollment, mTLS, no inbound open
port, tenant-bound identity, remote revocation и independent update policy.

### 7.2. URL И DNS Validation

- только `https`, default port `443`; иные порты только в definition allowlist;
- userinfo, fragment, embedded credentials и credential query parameters
  запрещены;
- IP literals, `localhost`, loopback, private, link-local, multicast, reserved и
  cloud metadata ranges запрещены для SaaS runtime;
- DNS A/AAAA ответы проверяются перед каждым connection; любой blocked address
  отклоняет request;
- redirects выключены по умолчанию; разрешённый redirect ограничен по числу
  hops, повторно проходит policy, а authorization headers не переносятся между
  origins;
- TLS certificate/hostname verification обязательна; опции `insecure` или
  `rejectUnauthorized: false` запрещены;
- если runtime не может надёжно контролировать resolved destination, connector
  использует managed egress proxy или не выпускается.

Тесты включают IPv4/IPv6, decimal/hex/octal encodings, mixed case/punycode,
redirect chain, DNS rebinding и metadata endpoints.

### 7.3. Runtime Bounds

Platform ceiling не может быть повышен tenant config:

- connect, read и total timeout;
- максимум redirects, retries и retry elapsed time;
- максимум pages, records/page и records/run;
- compressed и uncompressed response size;
- decompression ratio;
- allowlisted content types;
- concurrency per tenant/installation и global circuit breaker.

Retries разрешены только для классифицированных transient ошибок, используют
bounded exponential backoff с jitter и не повторяют invalid credentials или
non-idempotent mutation. Connector collection должен быть read-only.

---

## 8. Hostile Source And Data Poisoning Controls

External response всегда имеет тип `unknown` до adapter validation.

- versioned Zod/structured schema и allowlist fields;
- запрет `eval`, dynamic code/module loading и template execution из payload;
- unknown/prototype-related keys игнорируются или quarantine;
- string/array/nesting/record limits применяются до normalization;
- source timestamp, source identity и pagination cursor валидируются отдельно;
- replay не создаёт duplicate observation; conflicting revision сохраняется как
  новая immutable observation;
- cursor продвигается только после durable batch/evidence write;
- source-declared confidence не становится Trust Score;
- low quality, conflict и anomalous volume отправляются в quarantine/review;
- manual override и rejection suppression не перезаписываются connector run.

Adapter dependencies проходят dependency review, version pinning и fixture-based
tests. Dynamic marketplace plugins и customer-uploaded connector code запрещены.

---

## 9. Execution And Concurrency Controls

- один active run на installation; lease имеет bounded expiry и fencing token;
- run context содержит immutable organization, installation, run и actor;
- external request не выполняется внутри долгой database transaction;
- page записывается атомарно через Ingestion Gateway;
- cancellation закрывает network resources и не меняет последний durable cursor;
- scheduled trigger подписан/авторизован и вызывает тот же use case, что manual;
- paused/disconnected installation не запускает новые jobs;
- revoked credential немедленно инвалидирует queued/retry work;
- run failure не удаляет последнее valid evidence и не откатывает manual model.

---

## 10. Safe Errors, Logs И Audit

### 10.1. Safe Error Contract

UI получает только category, retryability, safe message и correlation ID:

| Category | Safe UI result |
|---|---|
| `authorization` | Недостаточно прав |
| `configuration` | Проверьте настройки подключения |
| `authentication` | Учётные данные отклонены; замените их |
| `network_policy` | Адрес подключения не разрешён |
| `source_unavailable` | Источник временно недоступен |
| `rate_limited` | Источник ограничил запросы; повторите позже |
| `invalid_response` | Ответ источника не прошёл проверку |
| `limit_exceeded` | Синхронизация остановлена лимитом безопасности |
| `internal` | Операция не выполнена; используйте correlation ID |

Raw provider body, headers, URL/query, stack, SQL details, secret/reference,
tenant UUID, source record ID и evidence payload не попадают в client error.

### 10.2. Operational Logs

Разрешены connector key/version, lifecycle state, trigger kind, duration bucket,
aggregate counts, retry count, safe category и correlation ID. Запрещены:

- credentials и authorization headers;
- endpoint/account/tenant names;
- raw hostname, IP, email, vulnerability or payload;
- secret reference, full cursor и internal UUID;
- provider response body и unredacted exception.

### 10.3. Audit Events

Обязательные events:

```text
connector.created
connector.config_changed
connector.credential_set
connector.credential_replaced
connector.credential_rotation_failed
connector.connection_tested
connector.activated
connector.paused
connector.resumed
connector.disconnected
connector.sync_started
connector.sync_completed
connector.sync_partially_completed
connector.sync_failed
connector.limit_triggered
```

Discovery decisions используют events T004: candidate confirmed, linked,
rejected, archived, merge proposed/executed и policy changed.

Audit metadata содержит actor kind/role, connector definition/version, action,
safe before/after state, trigger, result, duration bucket и aggregate counts.
Secret age/expiry записываются bucket, но secret value/ref и raw data запрещены.

Текущий `lib/security/audit.ts` request-bound. Background connector требует
отдельный context-independent adapter поверх той же `security_events` policy;
системный actor не должен подменять пользователя.

---

## 11. Retention And Legal Hold

- default evidence/candidate retention остаётся определённым в S15-T002/T004;
- deployment может увеличить срок по договору, но не ослабить tenant isolation;
- retention override и legal hold доступны только owner через server operation;
- raw evidence purge выполняет system actor, фиксирует aggregate audit и не
  удаляет business entity, binding history или active legal hold;
- connector disconnect не равен data deletion;
- удаление tenant/source требует отдельной reviewed data lifecycle procedure;
- raw evidence export не входит в foundation и требует отдельного security ADR.

---

## 12. Incident Response

### Suspected Connector Credential Compromise

1. Pause installation и invalidate queued runs.
2. Revoke external credential у source.
3. Replace/delete Vault secret; не пытаться reveal старое значение.
4. Проверить audit/run history по safe correlation data.
5. Оценить tenant isolation и evidence integrity.
6. Выпустить новый least-privilege credential и test connection.
7. Возобновить sync только после owner/security approval.

### Platform Server Credential Compromise

1. Считать затронутыми все tenants и остановить privileged connector runtime.
2. Rotate Supabase server secret/legacy service role key и redeploy.
3. Проверить privileged database/audit activity и deployment logs.
4. Следовать P0/P1 process из Monitoring & Error Handling Plan.

### Compromised Or Poisoned Source

1. Pause connector; новые observations пометить untrusted/quarantined.
2. Не выполнять автоматический rollback business model.
3. Сравнить последнее trusted evidence и manual overrides.
4. Возобновить только после revalidation source account и adapter fixtures.

Vault/network failure всегда fail closed. Plaintext fallback запрещён.

---

## 13. Security Acceptance Gates

До первой connector migration/runtime обязательны:

### Authorization And Isolation

- [ ] RBAC tests для owner/analyst/admin/viewer на каждую operation.
- [ ] Two-tenant tests на installation, run, source, raw, assertion, binding и candidate.
- [ ] Direct PostgREST grants и RLS policies проверены отдельно.
- [ ] Composite tenant FKs и tenant-scoped unique constraints существуют.
- [ ] Service credential repository не принимает tenant/role из client input.
- [ ] `SECURITY DEFINER` functions private, schema-qualified, с pinned search path.

### Secrets

- [ ] Vault provisioned migration/release task прошла review.
- [ ] `anon`, `authenticated`, `PUBLIC` не читают decrypted Vault data.
- [ ] Create/replace/revoke flow не имеет reveal path.
- [ ] Secret не появляется в HTML, RSC payload, logs, audit, error и backup evidence.
- [ ] Failed rotation сохраняет active credential и удаляет pending secret.
- [ ] Restore rehearsal проверяет Vault/root-key strategy.

### Network And Runtime

- [ ] Allowlist и HTTPS/TLS policy протестированы.
- [ ] SSRF corpus покрывает private/metadata/IP encodings/IPv6/redirect/DNS rebinding.
- [ ] Timeouts, retries, page/record/size/decompression ceilings протестированы.
- [ ] One-run lease, cancellation, cursor-after-durable-write и replay проверены.
- [ ] Paused/revoked connector не запускается из queue/schedule.

### Source And Observability

- [ ] Malformed, oversized, conflicting и poisoned fixtures fail closed/quarantine.
- [ ] Safe error categories не раскрывают provider/internal details.
- [ ] Log/audit redaction имеет automated tests.
- [ ] Background system actor не подменяет user profile.
- [ ] Dependency/SAST scan не обнаруживает client-side server secret usage.

Любой незакрытый P1 gate блокирует production connector. Checklist нельзя
отмечать `PASS` по документации без фактического runtime test evidence.

---

## 14. Implementation Sequence

1. Пересмотреть S15-T007 `DEFER` и выбрать source только после pilot admission evidence.
2. Зафиксировать connector-specific endpoints, scopes, auth и payload limits.
3. Создать reviewed migration для private schema/Vault, connector/evidence
   tables, composite FKs, explicit grants и RLS.
4. Реализовать server-only authorization/repository/secret accessor.
5. Реализовать outbound policy и bounded manual-pull adapter.
6. Добавить two-tenant, Vault, SSRF, hostile-source и redaction tests.
7. Провести restore rehearsal и security review.
8. Только после gates разрешить owner activation; scheduled pull добавлять
   отдельно после manual runtime validation.

---

## 15. External Security Baseline

Решение опирается на актуальные официальные источники:

- [Supabase Vault](https://supabase.com/docs/guides/database/vault) — encrypted
  secret storage и root-key recovery boundary;
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — RLS, server-key bypass и безопасные
  `SECURITY DEFINER` functions;
- [Supabase API Security](https://supabase.com/docs/guides/api/securing-your-api) — независимые grants/RLS и private schemas;
- [Supabase Edge Function Secrets](https://supabase.com/docs/guides/functions/secrets) — server-only environment secrets;
- [OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) — allowlist, URL/IP/DNS и redirect controls.

External docs используются как baseline, но security contract DTEK Core выше
остаётся нормативным источником для будущей реализации.

---

## 16. Decision Summary

S15-T005 утверждает Supabase Vault для dynamic tenant credentials, write-only
credential UX, owner-controlled activation/destructive policy, role-limited
operations, explicit RLS/grants/composite tenant boundaries, allowlisted public
egress, strict SSRF/runtime limits, hostile-source validation, redacted audit и
обязательные security tests.

Connector Foundation теперь имеет полный security contract. Это не означает,
что Vault, runtime или первый connector уже реализованы: они остаются
заблокированы решением S15-T007 до pilot admission evidence, отдельной
migration/runtime task и фактического прохождения acceptance gates.

Единый порядок будущей реализации и документационный handoff:
[CONNECTOR_FOUNDATION_HANDOFF.md](../development/CONNECTOR_FOUNDATION_HANDOFF.md).
