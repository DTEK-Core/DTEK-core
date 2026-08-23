# SPRINT 15 — Connector Framework Foundation

`Проект: DTEK Core`  
`Спринт: 15`  
`Тип: Post-MVP Architecture Sprint`<br>
`Основа: Sprint 14, ADR-007, Evidence_First_Architecture.md, pilot feedback`  
`Статус: 🚧 В работе — S15-T001–T004 завершены; Post-MVP, не входит в коммерческий MVP`

---

## 1. Цель Спринта

Создать архитектурную и продуктовую основу для автоматического наполнения DTEK Core без превращения платформы в SIEM, EDR, VM-сканер или CMDB.

Sprint 15 не должен реализовывать много коннекторов сразу. Его задача — подготовить безопасный Connector Framework, Evidence Layer, Normalization, Identity Resolution и Discovery Inbox, чтобы первый коннектор появился на правильной архитектуре.

---

## 2. Место В Roadmap

| Параметр | Значение |
|---|---|
| Фаза | Post-MVP / Connector Foundation |
| Предыдущий Sprint | Sprint 14 — Pilot Readiness |
| Следующий этап | First connector prototype после pilot feedback |
| Milestone | Connector Foundation Ready |

---

## 3. Бизнес-Ценность

Первые пилоты покажут, какие источники реально есть у клиентов. Sprint 15 превращает этот feedback в архитектуру автоматического наполнения для следующей версии продукта; он не является условием первого коммерческого релиза.

---

## 4. Scope / Non-Scope

### Входит

- Connector Framework architecture;
- Evidence Layer data model specification;
- Normalization rules;
- Identity Resolution strategy;
- Confidence model;
- Discovery Inbox UX specification;
- connector security model;
- shortlist первых источников для РФ.

### Не входит

- marketplace коннекторов;
- несколько production-коннекторов;
- endpoint agent;
- realtime ingestion;
- SIEM replacement;
- vulnerability scanner;
- heavy ETL platform.

---

## 5. Приоритетные Источники

Shortlist для первых connector candidates:

1. CSV/XLSX structured import.
2. Active Directory / LDAP / FreeIPA.
3. Zabbix.
4. MaxPatrol VM.
5. Kaspersky Security Center.
6. Wazuh.
7. UserGate / firewall export.
8. OpenSearch / ELK.
9. VMware / Proxmox.
10. Kubernetes / cloud APIs.

Первым production/prototype connector становится источник, подтверждённый pilot feedback.

---

## 6. Задачи Спринта

| ID | Задача | Приоритет | Оценка | Зависимости | Статус |
|---|---|---|---|---|---|
| S15-T001 | Connector Framework Architecture Decision | P1 | M | S14 + ADR-007 | ✅ Завершено |
| S15-T002 | Evidence Layer Data Model Specification | P1 | L | T001 | ✅ Завершено |
| S15-T003 | Normalization & Identity Resolution Specification | P1 | M | T001, T002 | ✅ Завершено |
| S15-T004 | Confidence Engine & Discovery Inbox Specification | P1 | M | T002, T003 | ✅ Завершено |
| S15-T005 | Connector Security Model | P1 | M | T001–T004 | ⬜ Запланировано |
| S15-T006 | Russian Market Connector Shortlist | P1 | S | S14 feedback | ⬜ Ожидает pilot signals |
| S15-T007 | First Connector Candidate Decision | P1 | S | T006 | ⬜ Ожидает T006 |
| S15-T008 | Connector Foundation Documentation Sync | P1 | S | T001–T007 | ⬜ Запланировано |

---

## 7. Порядок Выполнения

```text
День 1
  S15-T001 Connector Framework Architecture Decision

День 2
  S15-T002 Evidence Layer Data Model Specification

День 3
  S15-T003 Normalization & Identity Resolution Specification
  S15-T004 Confidence Engine & Discovery Inbox Specification

День 4
  S15-T005 Connector Security Model

После подтверждённых pilot signals
  S15-T006 Russian Market Connector Shortlist
  S15-T007 First Connector Candidate Decision
  S15-T008 Documentation Sync
```

---

## 8. Детализация Задач

### S15-T001 — Connector Framework Architecture Decision

**Описание:** определить единый контракт коннектора: source type, auth, sync mode, mapping, status, errors, audit events, tenant isolation.

**Ожидаемый результат:** ADR/architecture document описывает, как подключать источники без хаотичных интеграций.

**Решение:** принят ADR-009 и создан
`docs/architecture/Connector_Framework_Architecture.md`. Framework определён
как versioned allowlisted adapter layer внутри текущего Next.js + Supabase
приложения. Зафиксированы Connector Definition/Installation/Adapter,
server-only Orchestrator и Ingestion Gateway, manual/scheduled bounded pull,
installation/run lifecycle, cursor/idempotency/freshness, safe errors, audit,
tenant isolation, secret-reference и SSRF gates. Connector не может напрямую
писать в Objects/Relations/Risks или Trust model. Runtime, миграции, vault,
scheduler и первый vendor не реализованы преждевременно.

### S15-T002 — Evidence Layer Data Model Specification

**Описание:** спроектировать таблицы/типы для raw evidence, normalized evidence, source metadata, confidence, last_seen_at и relation to objects/risks/factors.

**Ожидаемый результат:** готова спецификация будущей миграции с RLS и audit requirements.

**Решение:** создан
`docs/architecture/Evidence_Layer_Data_Model.md`. Модель разделяет tenant
source, ingestion batch, stable source record, immutable raw observation,
versioned normalized assertion и binding к Objects/Risks/Relations/Trust
factors. Зафиксированы replay/revision/freshness/tombstone semantics,
confidence storage без преждевременного влияния на Trust Score, composite
tenant FKs, RLS/RBAC baseline, safe audit metadata, retention defaults,
индексы, transaction boundaries и staged migration plan. SQL migration,
runtime, backfill и изменение текущего CSV/XLSX path не выполнялись.

### S15-T003 — Normalization & Identity Resolution Specification

**Описание:** определить правила нормализации и сопоставления объектов из разных источников.

**Ожидаемый результат:** есть стратегия deduplication: hostname/FQDN/IP/MAC/agent id/cloud id/manual external id.

**Решение:** создан
`docs/architecture/Normalization_Identity_Resolution.md`. Зафиксированы
versioned deterministic normalization, canonical assertion/identity keys,
tenant-scoped resolver outcomes, strength и conflict semantics без подмены
будущего Confidence Engine. IP/short hostname/name не выполняют auto-merge;
strong identifiers учитывают provider/account, directory, product/deployment и
source namespaces. Определены field authority, manual override, source
priority, non-destructive merge plan, relation/risk boundaries, safe audit и
runtime acceptance tests. SQL migration, resolver runtime, Discovery Inbox и
business projection не создавались.

### S15-T004 — Confidence Engine & Discovery Inbox Specification

**Описание:** определить шкалу confidence и UX очереди неподтверждённых объектов, связей и рисков.

**Ожидаемый результат:** пользователь может подтверждать, объединять, отклонять и архивировать candidates.

**Решение:** создан
`docs/architecture/Confidence_Engine_Discovery_Inbox.md`. Разделены
source-declared confidence, вычисленный score и user/policy decision.
Зафиксирована versioned formula 0–100 из identity/source/corroboration/
freshness/quality, penalties, conservative caps и hard gates. Описаны Object,
Relation и Risk candidates, fingerprint/suppression, lifecycle, projection
status, confirm/create/link/merge/reject/archive actions, RBAC/RLS, audit,
retention, concurrency, performance и Inbox UX. High означает eligibility для
узкой allowlisted policy, но merge, Risk и destructive/business-context actions
остаются human-only. Runtime, UI, migration и Trust integration не создавались.

### S15-T005 — Connector Security Model

**Описание:** описать хранение секретов, RBAC, RLS, audit events, safe error handling и tenant isolation для коннекторов.

**Ожидаемый результат:** connector foundation не создаёт риск утечки инфраструктурных данных.

### S15-T006 — Russian Market Connector Shortlist

**Описание:** на основе пилотов и ICP подтвердить приоритеты источников для российского рынка.

**Ожидаемый результат:** shortlist ранжирован по коммерческой ценности и сложности.

### S15-T007 — First Connector Candidate Decision

**Описание:** выбрать первый connector prototype или принять решение продолжить через CSV/XLSX evidence import.

**Ожидаемый результат:** следующий Sprint получает конкретный источник и обоснование.

### S15-T008 — Connector Foundation Documentation Sync

**Описание:** синхронизировать architecture, product, roadmap, user/dev docs.

**Ожидаемый результат:** документация не противоречит ADR-007 и готова к первой интеграционной задаче.

---

## 9. Definition Of Done

- [x] Connector Framework architecture зафиксирована в ADR-009.
- [x] Evidence Layer data model specification готова.
- [x] Normalization и Identity Resolution описаны.
- [x] Confidence Engine и Discovery Inbox описаны.
- [ ] Connector security model готова.
- [ ] Российский connector shortlist утверждён.
- [ ] Первый connector candidate выбран или явно отложен.
- [ ] Документация обновлена.
- [x] `npm run type-check` проходит.
- [x] `npm run lint` проходит.
- [x] `npm run build` проходит.

---

## 10. Риски

| Риск | Вероятность | Влияние | Митигирование |
|---|---|---|---|
| Connector Framework станет слишком тяжёлым | Средняя | Высокое | Foundation только под первые 1–2 источника |
| Коннектор выбран без рыночного сигнала | Средняя | Высокое | Использовать pilot source inventory |
| Evidence Layer нарушит tenant isolation | Низкая | Критическое | RLS, org_id, audit и security review до миграции |
| Пользователь потеряет контроль над моделью | Средняя | Среднее | Discovery Inbox и manual override обязательны |
