# Normalization & Identity Resolution — DTEK Core

`Статус: утверждённая спецификация, runtime не реализован`
`Дата: 23.08.2026`
`Sprint: S15-T003 — Normalization & Identity Resolution Specification`
`Основа: ADR-007, ADR-009, Evidence_Layer_Data_Model.md`

---

## 1. Назначение

Документ определяет, как DTEK Core преобразует evidence разных источников в
единые canonical assertions, ищет один и тот же объект по независимым identity
keys, обрабатывает конфликты и сохраняет приоритет ручных решений.

Спецификация готовит будущий Normalization Engine и Identity Resolver, но
S15-T003 не:

- создаёт SQL migration или новые runtime-модули;
- меняет текущий create-only CSV/XLSX import;
- выполняет автоматический merge существующих Objects;
- задаёт числовые confidence thresholds и Discovery Inbox UX;
- выбирает первый connector или vendor-specific mapping;
- разрешает connector напрямую менять Objects, Relations, Risks или Trust Score.

---

## 2. Главные Принципы

1. **Raw сохраняется, normalized воспроизводится.** Нормализация никогда не
   переписывает исходную observation.
2. **Tenant является частью identity.** Сопоставление между организациями
   запрещено даже при полном совпадении идентификаторов.
3. **Source record ID не равен object identity.** Он обеспечивает idempotency
   внутри источника, но не доказывает совпадение между источниками.
4. **Match не равен merge.** Resolver предлагает binding/decision; business
   object меняется только projector после policy или решения пользователя.
5. **Нет last-write-wins.** Freshness используется только после authority,
   identity strength и conflict checks.
6. **Manual authority сохраняется.** Автоматизация может показать более свежий
   факт, но не перезаписывает явную ручную корректировку.
7. **Отсутствие не является NULL.** Missing field не очищает существующее
   значение; explicit tombstone обрабатывается отдельно.
8. **Слабые сигналы не объединяют объекты.** IP, короткое имя и fuzzy name сами
   по себе создают candidate, а не confirmed identity.

---

## 3. Место В Pipeline

```text
Raw Evidence Observation
  -> adapter/schema validation
  -> canonical value normalization
  -> normalized assertions
  -> identity key extraction
  -> tenant-scoped candidate generation
  -> deterministic conflict/match evaluation
  -> confidence policy (S15-T004)
  -> Discovery Inbox or policy-approved binding
  -> controlled business projection
```

Каждый этап versioned и детерминирован. Normalizer не обращается к UI, Trust
Engine или внешней системе. Identity Resolver читает normalized assertions и
safe business identity projection, но не пишет business tables.

---

## 4. Versioned Normalization Contract

Минимальный логический контракт:

```ts
interface NormalizationContext {
  organizationId: string;
  sourceId: string;
  observationId: string;
  entityKind: EvidenceEntityKind;
  sourceSchemaVersion: string;
  normalizerKey: string;
  normalizerVersion: string;
  collectedAt: string | null;
}

interface NormalizedAssertionDraft {
  assertionKey: string;
  normalizedValue: unknown;
  valueHash: string;
  identityKeys: IdentityKeyDraft[];
  reasonCodes: string[];
}
```

Требования:

- `normalizerKey` и version принадлежат code-owned allowlist;
- один raw payload + одна version всегда дают одинаковые assertions и hashes;
- locale, timezone, порядок JSON keys и окружение не меняют результат;
- новая mapping logic получает новую version, а не изменяет историю in-place;
- unknown field не попадает в business model автоматически;
- parsing error создаёт safe validation code и не раскрывает raw value в audit;
- normalizer имеет лимит assertion count и canonical value size;
- повторная normalization не требует повторного fetch источника.

---

## 5. Общие Правила Нормализации

### 5.1 Text

- Unicode приводится к NFC;
- leading/trailing whitespace удаляется;
- последовательности display whitespace схлопываются до одного пробела;
- control characters удаляются или отклоняются по field contract;
- исходный регистр сохраняется в display assertion, lookup key использует
  field-specific case normalization;
- пустая строка становится `missing`, но не explicit `null`;
- строки ограничиваются утверждённой длиной до hashing/indexing.

Глобальный lowercase для всех полей запрещён: Linux username, vendor ID и
case-sensitive resource path могут иметь другой контракт.

### 5.2 Date/Time

- ISO 8601 преобразуется в UTC `timestamptz`;
- date-only сохраняет семантику даты и не получает выдуманное локальное время;
- source timezone применяется только если явно задан adapter contract;
- невалидная дата отклоняется, а не заменяется `now()`;
- future timestamp за допустимым clock-skew получает validation code;
- ingestion time не подменяет source collection time.

### 5.3 Numbers И Boolean

- decimal separator и unit определяются mapping contract, не locale runtime;
- значение конвертируется только при однозначном типе и диапазоне;
- `0`, `false` и empty не смешиваются;
- percentage, bytes и duration получают canonical unit;
- overflow/NaN/infinite отклоняются.

### 5.4 Enumerations

- aliases являются code-owned и versioned;
- canonical object types сохраняют фактический MVP allowlist:
  `server`, `workstation`, `laptop`, `network`, `app`, `database`, `service`,
  `identity`, `ot`, `policy`, `other`;
- неизвестное значение не молча становится `other`, если это влияет на identity
  или Trust model: оно создаёт warning/candidate;
- риск category и Trust factor — разные namespaces;
- vendor-specific enum не добавляется в global model без подтверждённой
  межисточниковой семантики.

### 5.5 Null, Missing И Tombstone

Canonical envelope различает:

| Состояние | Значение |
|---|---|
| `present` | Источник явно передал валидное значение |
| `missing` | Поля нет; существующее значение не очищается |
| `explicit_null` | Источник явно сообщает отсутствие, но очистка зависит от policy |
| `tombstone` | Источник явно сообщает удаление entity/relationship |
| `invalid` | Значение получено, но не прошло contract |

Только authoritative source policy может преобразовать `explicit_null` в
очистку automated field. Manual field автоматически не очищается никогда.

---

## 6. Canonical Assertion Namespaces

Foundation использует стабильные semantic keys, не названия vendor columns.

### Asset

```text
asset.identity.hostname
asset.identity.fqdn
asset.identity.ip
asset.identity.mac
asset.identity.agent_id
asset.identity.cloud_resource_id
asset.identity.directory_id
asset.identity.hardware_serial
asset.identity.manual_external_id
asset.attribute.display_name
asset.attribute.type
asset.attribute.os_platform
asset.attribute.segment
asset.attribute.exposure
asset.attribute.criticality
asset.lifecycle.state
```

### Identity, Vulnerability И Control

```text
identity.principal.directory_id
identity.principal.upn
identity.principal.sid
vulnerability.finding.source_id
vulnerability.finding.cve
vulnerability.finding.asset_ref
control.state.key
control.state.result
coverage.product.agent_id
coverage.product.state
```

### Relation

```text
relation.source_ref
relation.target_ref
relation.type
relation.direction
```

Risk candidate generation из vulnerability/control assertions относится к
Auto Risk Mapper, а не к T003. CVE без resolved asset не является уникальным
риском и не создаёт Risk автоматически.

---

## 7. Identity Key Contract

```ts
type IdentityStrength = 'authoritative' | 'strong' | 'supporting' | 'weak';

interface IdentityKeyDraft {
  kind:
    | 'cloud_resource_id'
    | 'directory_object_id'
    | 'agent_id'
    | 'hardware_uuid'
    | 'hardware_serial'
    | 'fqdn'
    | 'hostname'
    | 'mac'
    | 'ip'
    | 'manual_external_id'
    | 'display_name_type';
  namespace: string;
  normalizedValue: string;
  lookupHash: string;
  strength: IdentityStrength;
  activeFrom: string | null;
  activeUntil: string | null;
}
```

Identity tuple всегда равен:

```text
organization_id + kind + namespace + normalized_value
```

`lookupHash` ускоряет exact lookup и не заменяет tenant/RLS check. Простое
неперчёное хеширование низкоэнтропийных hostname/IP не считается защитой от
раскрытия; raw/normalized value доступно только authorized server path.

---

## 8. Нормализация Identity Keys

### 8.1 Hostname

- trim, NFC, lowercase для lookup;
- trailing dot удаляется;
- short hostname и FQDN хранятся разными keys;
- `host01.corp.local` не сокращается автоматически до identity `host01`;
- namespace: confirmed DNS suffix/environment; при отсутствии — source scope;
- standalone short hostname имеет strength `weak`;
- hostname + confirmed domain/type может стать `supporting`, но не
  authoritative.

### 8.2 FQDN

- lowercase, trailing dot removed;
- Unicode domain проходит IDNA normalization;
- labels и полная длина валидируются;
- namespace: normalized DNS zone/forest context;
- split DNS и повторное имя в разных environment учитываются namespace;
- exact FQDN обычно `supporting`, не единственное основание auto-merge.

### 8.3 IP Address

- парсится как IPv4/IPv6, текст приводится к canonical representation;
- IPv4-mapped IPv6 нормализуется по утверждённому network contract;
- CIDR, host IP и network range являются разными semantic types;
- loopback, link-local, multicast и unspecified помечаются reason code;
- namespace включает network/VRF/segment, если он известен;
- IP всегда `weak`: DHCP, NAT, VIP, container и reuse исключают merge по одному
  IP;
- overlapping observation windows усиливают candidate, но не превращают IP в
  authoritative key.

### 8.4 MAC Address

- separators удаляются, hex lowercase, output `aa:bb:cc:dd:ee:ff`;
- broadcast, multicast и all-zero отклоняются;
- locally administered/randomized MAC помечается weak;
- namespace включает network/virtualization context при наличии;
- MAC обычно `supporting`; cloned VM, bonded interface и multiple NIC не дают
  auto-merge по одному MAC.

### 8.5 Agent ID

- normalization case sensitivity задаёт конкретный adapter;
- namespace включает product key и deployment/management-server identity;
- exact active ID в одном namespace — `strong`;
- agent reinstallation/reuse не переносит identity без lifecycle evidence;
- одинаковая строка ID из разных products/deployments не совпадает.

### 8.6 Cloud Resource ID

Canonical compound value:

```text
provider + account/subscription/project + region/scope + full resource id
```

- provider aliases versioned;
- provider-specific case/path rules не обобщаются;
- account scope обязателен;
- exact active compound ID — `authoritative`;
- display name, private IP и instance name не заменяют resource ID;
- deleted/recreated resource с новым immutable ID является новым identity.

### 8.7 Directory Object ID

- AD `objectGUID` приводится к canonical UUID representation;
- SID нормализуется отдельно и не смешивается с GUID;
- FreeIPA/LDAP `entryUUID` использует собственный key kind/namespace metadata;
- namespace включает directory/forest instance;
- exact immutable directory ID — `authoritative` для identity entity и strong
  evidence для asset binding;
- UPN/email/`sAMAccountName` являются supporting/weak и могут меняться.

### 8.8 Hardware UUID И Serial

- trim, uppercase/lowercase по vendor contract, placeholder values удаляются;
- manufacturer/model добавляются в namespace/context serial;
- duplicate/default serial и cloned UUID переводят match в conflict;
- validated SMBIOS/virtual machine UUID может быть `strong`;
- serial без manufacturer/context — `supporting`.

### 8.9 Manual External ID

- current `source_record_id` является authoritative только для continuity
  записи в **том же source**;
- cross-source match разрешён лишь для явно утверждённого shared namespace;
- arbitrary spreadsheet external ID не становится global identity;
- ручное подтверждение namespace и binding имеет audit event;
- значение не показывается в URL или audit metadata.

### 8.10 Display Name + Type

- применяется normalized lowercase display name + canonical object type;
- используется для compatibility с текущим import preview;
- всегда `weak` и только создаёт duplicate warning/candidate;
- fuzzy/substring/Levenshtein match не выполняет auto-binding.

---

## 9. Strength И Evidence Signals

T003 определяет классы identity evidence, но не числовой confidence score.

| Strength | Пример | Допустимый результат T003 |
|---|---|---|
| `authoritative` | cloud resource ID с account scope | deterministic match при единственном непротиворечивом target |
| `strong` | agent ID в deployment namespace, validated hardware UUID | deterministic match или conflict |
| `supporting` | FQDN, MAC, serial+manufacturer | усиливает candidate; два независимых сигнала могут дать strong proposal |
| `weak` | IP, short hostname, display name+type | только candidate/context |

Правило «два supporting сигнала» не является числовым threshold. Оно создаёт
`strong_proposal`, который S15-T004 направляет в policy/Discovery Inbox.
Автоматическое подтверждение остаётся запрещено до утверждения confidence и
candidate policy.

Независимыми считаются сигналы разных semantic families и, желательно, разных
sources. `hostname` + производный от него `fqdn` одного source не являются
двумя независимыми доказательствами.

---

## 10. Candidate Generation

Resolver не сканирует все Objects. Для каждой active identity key он выполняет
tenant-scoped exact lookup по `(organization, kind, namespace, lookupHash)`.

Порядок:

1. Найти target по authoritative keys.
2. Найти target по strong keys.
3. Собрать supporting candidates.
4. Добавить weak context только к уже найденным candidates.
5. Проверить negative/conflicting keys.
6. Проверить lifecycle overlap и freshness.
7. Вернуть решение без изменения business model.

```ts
type ResolutionOutcome =
  | 'new_candidate'
  | 'deterministic_match'
  | 'strong_proposal'
  | 'ambiguous'
  | 'conflict'
  | 'insufficient_identity';

interface ResolutionResult {
  outcome: ResolutionOutcome;
  candidateObjectIds: string[];
  matchedKeyKinds: string[];
  conflictingKeyKinds: string[];
  reasonCodes: string[];
  resolverVersion: string;
}
```

Internal object IDs доступны только authorized server/UI read model и не
попадают в connector error/audit payload.

---

## 11. Deterministic Resolution Matrix

| Ситуация | Outcome |
|---|---|
| Один authoritative key указывает на один target, конфликтов нет | `deterministic_match` |
| Один strong key указывает на один target, supporting keys согласованы | `deterministic_match` |
| Два независимых supporting key указывают на один target | `strong_proposal` |
| Только IP/hostname/name совпадают | `ambiguous` или `new_candidate` |
| Разные strong keys указывают на разные Objects | `conflict` |
| Один strong key найден у нескольких Objects | `conflict` |
| Нет usable identity key | `insufficient_identity` |
| Source record повторён с тем же source identity | существующий evidence record, resolver не создаёт новый Object |

`deterministic_match` означает технически однозначное сопоставление. До
S15-T004 оно всё равно создаёт proposed binding и не выполняет silent merge.

---

## 12. Conflict Policy

Conflict имеет приоритет над freshness и source priority.

Обязательные reason codes:

```text
identity.authoritative_keys_disagree
identity.strong_key_not_unique
identity.type_incompatible
identity.lifecycle_overlap_conflict
identity.namespace_missing
identity.reused_ip
identity.cloned_mac_or_uuid
identity.target_archived_or_merged
```

При conflict:

- новая business entity автоматически не создаётся, если это увеличит дубль;
- существующие Objects не объединяются и не перезаписываются;
- evidence/assertions сохраняются;
- candidate попадает в future Discovery Inbox;
- пользователю показываются safe labels и причины, не raw secret/internal IDs;
- последующий source replay не закрывает conflict без нового evidence или
  явного решения.

---

## 13. Field Authority И Manual Override

Identity binding и field projection разделены. Совпадение объекта не означает,
что все его поля можно обновить.

Приоритет значения поля:

1. `manual_override` — пользователь явно изменил/зафиксировал поле;
2. `user_confirmed` — значение подтверждено в Discovery Inbox;
3. `user_confirmed_import` — принято через текущий import preview/commit;
4. `policy_approved_evidence` — authoritative source для конкретного поля;
5. `automated_evidence` — ранее спроецированное значение;
6. `default_or_inferred`.

Внутри одного authority level используются:

1. field-specific source priority;
2. confidence policy S15-T004;
3. source collection time;
4. stable deterministic tie-breaker.

Глобальный «источник A всегда важнее B» запрещён. Например, AD может быть
authoritative для owner/directory identity, cloud API — для resource lifecycle,
а VM scanner — для vulnerability state.

### Manual Rules

- manual edit создаёт field-level override, а не удаляет contradictory evidence;
- automated update сохраняется как proposed/current evidence рядом с override;
- пользователь может явно снять override и вернуть поле под source policy;
- missing/explicit null не снимает override;
- manual object не может быть hard-deleted из-за source tombstone;
- непустые поля current legacy manual object считаются manual authority до
  появления явной field provenance migration; missing fields могут получать
  proposed evidence values;
- current imported object считается `user_confirmed_import`, потому что commit
  выполняется пользователем после preview.

Current schema не хранит field-level authority. Future projection migration
должна добавить отдельный provenance/override ledger; прятать это состояние в
`objects.description` запрещено.

---

## 14. Projection Rules

Projector является отдельным server-only компонентом после resolver/policy.

- normalizer и resolver не импортируют repositories business tables для write;
- projector принимает confirmed binding, assertion set и authority context;
- update выполняется field-by-field, не заменой всей строки;
- missing field не участвует в update;
- type/criticality/exposure проходят текущие validation schemas;
- Trust Score recalculation запускается только после committed business change;
- failure business projection не меняет evidence batch history;
- retry idempotent по decision/projection key;
- every applied field сохраняет source/assertion/version provenance;
- rejected proposal не удаляет evidence.

До реализации provenance ledger automated projection отключён.

---

## 15. Merge Policy

System **никогда не выполняет hard merge автоматически**. Resolver может
предложить merge только при совпадении identity; подтверждение и RBAC
определяются S15-T004/T005.

### Survivor Selection

Recommended order:

1. Object, явно выбранный пользователем;
2. manual-created Object с ручными overrides;
3. Object с большим числом user-confirmed fields/workflow links;
4. более ранний active Object;
5. deterministic UUID tie-break только для plan, не как пользовательское
   решение.

### Merge Plan

До commit UI/API должен показать:

- survivor и duplicate;
- identity signals/conflicts;
- field conflicts и выбранные значения;
- Risks/Object Risks;
- Relations, включая будущие self-edge/deduplication;
- Trust Passport/Score history consequences;
- manual overrides и source bindings.

### Commit Semantics

- duplicate не удаляется: он становится archived alias/redirect на survivor;
- confirmed evidence bindings переводятся на survivor с audit trail;
- `object_risks` переносятся idempotently, duplicates пропускаются;
- relations перенаправляются, identical edges deduplicated, self-relations не
  создаются;
- Trust Score history duplicate не переписывается задним числом и остаётся
  связанной с archived identity;
- survivor Trust Score пересчитывается после transaction;
- manual field conflicts разрешает пользователь, не freshness;
- merge получает immutable decision ID и correlation ID.

Current `objects` schema не имеет `merged_into_id`/alias ledger и reversible
merge history. Поэтому merge implementation запрещён до отдельной migration,
acceptance tests и restore procedure.

### Unmerge

One-click unmerge не обещается foundation. Пока нет immutable merge ledger и
проверенного reverse plan, ошибочный merge восстанавливается только через
контролируемую операционную процедуру. Это ещё одна причина не auto-merge.

---

## 16. Relation Resolution

Relation assertion может стать candidate только после resolution обоих
endpoints.

- source и target resolving выполняются независимо;
- один unresolved/ambiguous endpoint блокирует business relation;
- direction и relation type нормализуются versioned mapping;
- existing uniqueness `(source_object_id, target_object_id, relation_type)`
  сохраняется;
- reverse edge не считается тем же edge для directional type;
- self-relation после merge отклоняется;
- manual relation имеет приоритет и не удаляется из-за missing source edge;
- source tombstone помечает automated relation stale, но не удаляет manual edge.

---

## 17. Vulnerability И Risk Identity Boundary

Vulnerability finding и business Risk — разные сущности.

- scanner finding identity:
  `organization + source + finding ID`, либо versioned compound
  `scanner namespace + asset identity + vulnerability identity`;
- CVE может повторяться на многих assets и не является unique Risk key;
- один finding может поддерживать существующий Risk или создать risk candidate;
- Risk title/category/severity matching текущего import остаётся compatibility
  heuristic, не global identity;
- risk workflow owner/status/due date/comments являются manual business context
  и не перезаписываются scanner evidence;
- Auto Risk Mapper и candidate grouping не входят в T003.

---

## 18. Freshness И Identity Lifecycle

- active identity key имеет observation window;
- expired/stale key остаётся provenance, но не используется как единственное
  основание нового deterministic match;
- IP/hostname reuse проверяется по non-overlapping lifecycle windows;
- rename добавляет новый active hostname/FQDN и закрывает старый key, не меняя
  immutable object identity;
- source disconnect не завершает lifecycle автоматически;
- completed authoritative full snapshot может закрыть source key по policy;
- reappeared stable strong key может восстановить binding после conflict check;
- system time, source time и ingestion time не смешиваются.

---

## 19. Security И Multi-Tenant Requirements

- каждый lookup начинается с immutable `organization_id` context;
- query без tenant predicate запрещён repository contract test;
- cross-tenant candidate/merge невозможен на RLS и service layer;
- identity values считаются infrastructure-sensitive;
- raw hostname, IP, MAC, GUID, agent/cloud ID не попадают в audit metadata;
- UI получает masked/safe value только по authorized detail action;
- viewer не видит raw identity evidence;
- system actor не подменяется user profile;
- source priority и namespace configuration изменяются только по RBAC и audit;
- poisoned source не может повысить собственную authority;
- normalizer mapping и resolver version принадлежат code, не tenant JSON/code;
- fuzzy matching ограничено candidate generation и защищено size/time limits.

---

## 20. Audit Contract

Минимальные aggregate/decision events:

```text
identity.resolution_completed
identity.conflict_detected
identity.binding_confirmed
identity.binding_rejected
identity.manual_override_set
identity.manual_override_cleared
identity.merge_requested
identity.merge_completed
identity.merge_failed
```

Safe metadata:

- resolver/normalizer version;
- outcome/reason codes;
- identity key kinds, но не значения;
- candidate count;
- source type/origin kind;
- merge aggregate counts;
- actor/trigger context по существующему safe audit contract.

Запрещены source record ID, hostname, IP, MAC, FQDN, cloud/directory/agent ID,
field values, internal tenant/object UUID и raw conflict payload.

---

## 21. Совместимость С Current Import

До controlled migration:

- current duplicate key `name + type` и unique IP остаётся preview warning;
- current import остаётся create-only и не выполняет update/merge;
- `source_record_id` остаётся source metadata, не DB identity key;
- current user-confirmed import rows не переоцениваются задним числом;
- legacy `[Import Source]` block остаётся explainability fallback;
- новая taxonomy может применяться shadow-mode только после Evidence Layer
  migration и не меняет import result;
- backfill создаёт только keys, которые можно доказуемо нормализовать из
  сохранённых данных; он не выдумывает FQDN/MAC/agent/cloud ID;
- low-quality legacy `name + type` не создаёт confirmed binding.

---

## 22. Примеры Решений

### AD + Zabbix

AD сообщает `srv-01.corp.local` и directory GUID, Zabbix — short hostname,
management IP и agent ID. Directory GUID и Zabbix agent ID не совпадают по
namespace, FQDN + hostname/IP дают supporting proposal. До подтверждения или
дополнительного strong mapping объекты не auto-merge.

### DHCP Reuse

Старый laptop и новый laptop наблюдались на `10.20.1.15` в разные периоды.
Разные agent IDs и serials создают два Objects; IP остаётся weak historical
context и не объединяет их.

### Cloud VM Rename

Имя VM изменилось, но provider/account/resource ID совпадает. Resolver выдаёт
deterministic match; новое имя становится proposed field update. Явный manual
display name остаётся без изменений.

### Cloned VM

Две active VM имеют одинаковый SMBIOS UUID/MAC, но разные hypervisor IDs.
Resolver возвращает conflict `identity.cloned_mac_or_uuid`; merge запрещён.

### Manual External ID

Два CSV содержат `asset-42`, но source namespaces различаются. Совпадение не
создаётся. После явного утверждения общего namespace тот же key может стать
supporting/strong proposal с audit trail.

---

## 23. Runtime Implementation Plan

1. Реализовать pure normalizer contract и synthetic vendor-neutral fixtures.
2. Добавить canonical assertion/identity key validation.
3. Реализовать tenant-scoped exact candidate index/read model.
4. Запустить resolver в shadow mode без business writes.
5. Сравнить результаты с ручной разметкой двух tenant datasets.
6. После S15-T004 сохранять candidates/decisions в Discovery Inbox.
7. После выполнения S15-T005 gates включить authorized confirmed bindings.
8. Реализовать field provenance/override ledger до projection.
9. Реализовать alias/merge ledger и restore test до merge action.
10. Только затем рассматривать policy-approved automated projection.

---

## 24. Acceptance Tests Будущего Runtime

- normalizer детерминирован для одинакового raw payload/version;
- Unicode, whitespace, date, enum, IPv4/IPv6, MAC и FQDN fixtures canonical;
- missing, explicit null, invalid и tombstone различаются;
- source record replay не создаёт новый Object;
- tenant A никогда не получает candidate из tenant B;
- cloud resource ID учитывает account/provider scope;
- agent ID учитывает product/deployment namespace;
- directory ID учитывает forest/directory namespace;
- short hostname, IP и display name не дают auto-match поодиночке;
- DHCP reuse не объединяет разные strong identities;
- cloned MAC/UUID создаёт conflict;
- conflicting strong keys блокируют freshness/source priority;
- two supporting signals одного derived family не считаются независимыми;
- stale identity не является единственным deterministic key;
- manual override не перезаписывается newer evidence;
- user-confirmed import имеет приоритет над automated evidence;
- object merge невозможен без explicit decision и RBAC;
- merge plan deduplicates risks/relations и не создаёт self-edge;
- Trust history не переписывается задним числом;
- relation не создаётся с unresolved endpoint;
- CVE без asset не становится unique business Risk;
- audit содержит reason/key kinds и не содержит identity values/UUID;
- resolver имеет bounded candidate count/time и idempotent result.

---

## 25. Отложенные Решения

| Решение | Владелец |
|---|---|
| Числовая confidence formula и thresholds | S15-T004 |
| Candidate persistence, states, actions и Discovery Inbox UX | S15-T004 |
| Final resolver/merge RBAC и raw identity access | Определены в S15-T005 |
| Secret/endpoint namespaces и connector security | Определены в S15-T005 |
| Vendor-specific aliases, IDs и authoritative field matrix | First connector task |
| Field provenance, alias/merge ledger SQL | Future implementation migration |
| Automated business projection/Trust effect | Separate ADR/task after validation |

---

## 26. Acceptance Criteria S15-T003

- [x] Определён versioned deterministic normalization contract.
- [x] Зафиксированы canonical assertion namespaces и null semantics.
- [x] Описаны hostname, FQDN, IP, MAC, agent, cloud, directory, hardware и
  manual external identity keys.
- [x] Определены strength classes без преждевременной confidence formula.
- [x] Зафиксированы candidate generation, outcomes и conflict rules.
- [x] Определены field authority, source priority и manual override semantics.
- [x] Описан non-destructive merge plan и обязательный alias/audit boundary.
- [x] Зафиксированы relation и vulnerability/risk identity boundaries.
- [x] Сохранена совместимость с текущим create-only import.
- [x] Подготовлены security requirements, examples и runtime acceptance tests.

---

## 27. Связанные Документы

- [ARCHITECTURE_DECISIONS.md](../../ARCHITECTURE_DECISIONS.md) — ADR-007 и
  ADR-009.
- [Connector_Framework_Architecture.md](Connector_Framework_Architecture.md) —
  adapter/orchestrator/ingestion boundaries.
- [Evidence_Layer_Data_Model.md](Evidence_Layer_Data_Model.md) — source,
  observation, assertion и binding schema.
- [Confidence_Engine_Discovery_Inbox.md](Confidence_Engine_Discovery_Inbox.md)
  — score bands, hard gates, candidate states/actions и Inbox UX.
- [Evidence_Import_Schema.md](Evidence_Import_Schema.md) — текущий import и
  compatibility duplicate rules.
- [Evidence_First_Architecture.md](Evidence_First_Architecture.md) — целевая
  Discovery/Trust architecture.
- [Trust_Score_Model_v2.md](Trust_Score_Model_v2.md) — canonical factor keys и
  Trust boundaries.
- [SECURITY_OVERVIEW.md](../security/SECURITY_OVERVIEW.md) — RBAC/RLS baseline.
- [SPRINT_15.md](../../tasks/SPRINT_15.md) — порядок Connector Foundation.
- [CONNECTOR_FOUNDATION_HANDOFF.md](../development/CONNECTOR_FOUNDATION_HANDOFF.md)
  — итоговый implementation order и gates Sprint 15.
