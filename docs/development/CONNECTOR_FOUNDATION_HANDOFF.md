# CONNECTOR_FOUNDATION_HANDOFF.md — DTEK Core

`Версия: 1.0`<br>
`Дата: 23.08.2026`<br>
`Задача: S15-T008 — Connector Foundation Documentation Sync`<br>
`Milestone: CONNECTOR FOUNDATION READY / RUNTIME DEFERRED`<br>
`Статус: актуальный`

---

## 1. Назначение

Документ является единой точкой входа для следующей интеграционной задачи
DTEK Core. Он связывает решения Sprint 15, отделяет утверждённые contracts от
нереализованного runtime и фиксирует условия, при которых можно начинать первый
connector prototype.

Sprint 15 завершает архитектурный foundation. Он не добавляет работающий
connector, Evidence Layer tables, Discovery Inbox UI или background sync.

```text
CURRENT: CSV/XLSX import
FOUNDATION: architecture/security/product contracts ready
FIRST CONNECTOR: deferred
RUNTIME/UI/MIGRATIONS: not implemented
REVIEW: after pilot admission evidence
```

---

## 2. Итог Sprint 15

| Task | Результат | Статус |
|---|---|---|
| S15-T001 | ADR-009 и Connector Framework contract | Готово |
| S15-T002 | Evidence Layer data model specification | Готово |
| S15-T003 | Normalization и Identity Resolution specification | Готово |
| S15-T004 | Confidence Engine и Discovery Inbox specification | Готово |
| S15-T005 | Connector Security Model | Готово |
| S15-T006 | Russian Market research shortlist и admission gate | Research готов; pilot data pending |
| S15-T007 | First Connector Candidate Decision | `DEFER / KEEP CSV-XLSX IMPORT PATH` |
| S15-T008 | Documentation sync и implementation handoff | Готово |

Milestone `Connector Foundation Ready` означает, что границы и требования
будущей реализации определены. Он не означает production readiness connector
подсистемы.

---

## 3. Источники Истины Foundation

Читать в следующем порядке:

1. [ARCHITECTURE_DECISIONS.md](../../ARCHITECTURE_DECISIONS.md), ADR-007 и
   ADR-009 — обязательные архитектурные решения.
2. [Connector Framework Architecture](../architecture/Connector_Framework_Architecture.md)
   — adapter, installation, orchestration, ingestion и run lifecycle.
3. [Evidence Layer Data Model](../architecture/Evidence_Layer_Data_Model.md) —
   source, batch, raw observation, assertion и binding contracts.
4. [Normalization & Identity Resolution](../architecture/Normalization_Identity_Resolution.md)
   — canonical fields, identity keys, resolver и merge policy.
5. [Confidence Engine & Discovery Inbox](../architecture/Confidence_Engine_Discovery_Inbox.md)
   — confidence, candidate lifecycle и human decisions.
6. [Connector Security Model](../security/CONNECTOR_SECURITY_MODEL.md) — Vault,
   tenant isolation, RBAC/RLS, SSRF, audit и acceptance gates.
7. [Russian Market Connector Shortlist](../product/RUSSIAN_MARKET_CONNECTOR_SHORTLIST.md)
   — research pool и pilot admission criteria.
8. [First Connector Candidate Decision](../product/FIRST_CONNECTOR_CANDIDATE_DECISION.md)
   — действующее решение `DEFER` и reopening triggers.

При конфликте действует приоритет источников из `AI_DEVELOPMENT_GUIDE.md`.
Этот handoff не заменяет ADR или детальные specifications.

---

## 4. Утверждённый Целевой Поток

```text
allowlisted connector definition
  -> tenant installation with opaque secret_ref
  -> server-only bounded connector run
  -> hostile-source validation
  -> Ingestion Gateway
  -> raw observation and normalized assertion
  -> tenant-scoped identity resolution
  -> confidence calculation and hard gates
  -> Discovery Inbox candidate
  -> explicit user/policy decision
  -> controlled projection to Objects / Relations / Risks
  -> Trust Passport / Trust Score / Trust Graph
```

Connector не имеет права писать напрямую в `objects`, `relations`, `risks`,
Trust Score или Trust Passport. Raw evidence и provenance не заменяются
результатом нормализации.

---

## 5. Что Реализовано Фактически

В текущем приложении работают:

- ручное создание и редактирование объектов и рисков;
- CSV/XLSX import объектов и рисков;
- validation preview, partial success и duplicate detection;
- import source metadata и audit events;
- Trust Passport, Trust Score, Trust Graph и Risk Registry;
- explainability по доступному source context;
- RBAC/RLS и multi-tenant isolation текущих business tables.

CSV/XLSX import остаётся единственным рабочим evidence onboarding path. Его
контракт описан в [Evidence Import Schema](../architecture/Evidence_Import_Schema.md)
и [Import Guide](../user/IMPORT_GUIDE.md).

---

## 6. Что Только Специфицировано

Следующие элементы не существуют в runtime:

- connector registry, installation и adapter interfaces;
- connector scheduler, queue, worker или collector;
- Supabase Vault provisioning для connector secrets;
- source, batch, raw observation, assertion и binding tables;
- normalization и identity resolver;
- Confidence Engine runtime;
- Discovery Inbox route и UI;
- automated projection в business model;
- drift detection и connector monitoring;
- vendor-specific SDK, API client или mapping;
- production connector и его acceptance environment.

Нельзя описывать эти элементы пользователю или pilot customer как доступную
функциональность.

---

## 7. Gate Перед Первой Runtime-Задачей

Первый connector review открывается только при выполнении trigger из T007:

1. два независимых pilots подтверждают одну source family; или
2. один strategic pilot предоставляет approval, product owner и test access;
   или
3. измеренный CSV/XLSX workflow блокирует critical decision из-за freshness,
   объёма или ошибок.

До планирования реализации должны быть заполнены:

- pilot aliases и source cards;
- точные product/version/deployment данные;
- решение пользователя, которое поддерживает источник;
- measured manual burden и required freshness;
- sample payload со stable external identity;
- read-only auth model и доступный test environment;
- SaaS/on-prem/isolated deployment boundary;
- customer acceptance owner и DTEK Core product owner;
- demand/feasibility/security evidence location.

Credentials, реальные endpoints, customer names и raw infrastructure data в Git
не помещаются.

---

## 8. Порядок Будущей Реализации

После прохождения gate работа разделяется на самостоятельные задачи:

1. Зафиксировать connector-specific decision: source, version, endpoints,
   scopes, limits, identity и acceptance criteria.
2. Утвердить минимальный read-only adapter contract для одной source family.
3. Подготовить reviewed SQL migration для private schema, Vault references,
   connector/evidence tables, composite tenant FKs, explicit grants и RLS.
4. Выполнить backup/restore gate до cloud migration.
5. Реализовать manual bounded pull через server-only Orchestrator и Ingestion
   Gateway.
6. Добавить normalization, identity и confidence только в объёме утверждённого
   contract.
7. Реализовать Discovery Inbox review до любой автоматической projection.
8. Пройти unit, contract, two-tenant, SSRF, hostile-payload, retry/idempotency,
   audit, performance и recovery tests.
9. Провести customer acceptance на согласованном test environment.
10. Рассматривать schedule/queue только после успешной manual runtime
    validation.

Нельзя объединять migration, generic framework runtime, vendor adapter,
Discovery UI и production rollout в одну задачу.

---

## 9. Обязательные Инварианты

- Все tenant-owned rows содержат `organization_id`.
- Cross-tenant references защищены composite foreign keys и RLS.
- Пользовательский Supabase client не получает connector secrets.
- Dynamic credentials хранятся через opaque Vault reference.
- Egress идёт только к allowlisted public targets; redirects и DNS проверяются.
- Connector input считается hostile и проходит size/schema/content limits.
- Run повторяем, idempotent и имеет явные cursor/freshness semantics.
- Missing record не удаляет business object автоматически.
- Manual correction имеет приоритет и не уничтожается source sync.
- Merge, Risk creation и destructive actions требуют human decision.
- Audit не содержит secrets, payload, internal IDs или customer infrastructure.
- Connector failure не повреждает последний подтверждённый business state.
- Confidence не влияет на Trust Score без отдельного утверждённого решения.

---

## 10. Минимальный Acceptance Набор

Future connector task не считается готовой без:

- unit tests adapter mapping и normalization;
- contract tests against synthetic/redacted fixtures;
- idempotent replay и duplicate delivery tests;
- partial-page/cursor retry tests;
- two-tenant isolation tests для всех новых tables/actions;
- RBAC tests owner/admin/analyst/viewer;
- Vault secret create/replace/rotate/revoke tests;
- SSRF, redirect, DNS rebinding и private-address rejection tests;
- hostile payload, oversize и malformed response tests;
- safe error и audit redaction tests;
- timeout/rate limit/backoff/circuit-breaker tests;
- backup/restore и failed migration recovery evidence;
- manual customer acceptance с фактической supported version.

Точные gates определяет Connector Security Model; этот список является
handoff summary.

---

## 11. Documentation Update Matrix Для Runtime

Будущая implementation task обязана проверить:

| Область | Обновление |
|---|---|
| ADR | connector-specific decisions или отклонения от ADR-009 |
| Architecture | фактические components, data flow и deployment boundary |
| Database | migration number, tables, indexes, grants и RLS |
| Security | threat model, secrets, egress, audit и incident response |
| Product | поддерживаемый source/version и подтверждённая ценность |
| User docs | setup, permissions, states, sync semantics и recovery |
| Operations | monitoring, rotation, backup/restore и rollback |
| Testing | fixtures, automated contracts и manual acceptance checklist |
| Roadmap/Sprint | scope, dependencies, status и remaining gates |
| Changelog | фактически доступная функциональность и ограничения |

---

## 12. Текущий Pilot Workflow

Пока решение `DEFER` действует:

```text
approved export
  -> CSV/XLSX template
  -> source metadata
  -> preview and validation
  -> tenant import
  -> duplicate/mapping review
  -> Passport / Score / Risks / Reports
  -> measure effort and freshness gap
  -> complete source card
  -> review connector admission
```

Этот путь является осознанным продуктовым baseline, а не временной ошибкой.

---

## 13. Открытые Ограничения

- pilot source cards и demand scores не заполнены;
- первый source/vendor не выбран;
- automatic freshness отсутствует;
- collector/on-prem boundary не определена;
- фактические vendor API versions и limits не проверены;
- Evidence Layer migration и retention не прошли implementation review;
- authenticated QA Sprint 12/13 и Pilot GO gates остаются pending.

Эти ограничения нельзя переводить в `PASS` на основании Sprint 15.

---

## 14. Финальный Статус

```text
SPRINT 15: COMPLETE
MILESTONE: CONNECTOR FOUNDATION READY
ACTIVE INGESTION: CSV/XLSX
FIRST CONNECTOR: DEFERRED
RUNTIME/UI/MIGRATIONS: NOT IMPLEMENTED
NEXT REVIEW: AFTER PILOT ADMISSION EVIDENCE
```

Документация готова к будущей интеграционной задаче, но сама задача не должна
создаваться до прохождения product, security и environment gates.
