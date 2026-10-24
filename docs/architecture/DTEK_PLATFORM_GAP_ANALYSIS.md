# DTEK Platform Gap Analysis

`Статус: planning baseline`
`Дата: 24.10.2026`
`Основа: фактический код, migrations 001–019, Sprint 01–15 и audit 24.08.2026`

---

## 1. Статусы

- `DONE` — реализовано в текущем DTEK Core.
- `PARTIAL` — полезный baseline есть, требуется расширение.
- `SPEC` — подробно спроектировано, runtime отсутствует.
- `PLANNED` — включено в Sprint 16+.
- `FUTURE` — сознательно за пределами Platform MVP.

---

## 2. Capability Matrix

| Capability | Current State | Reusable | Needs Extension | New Module / Target |
|---|---|:---:|---|---|
| Authentication | PARTIAL | YES | blocked enforcement, workspace sessions | Gate + Workspace context |
| Organization tenant | PARTIAL | YES | generalize without breaking RLS | Workspace + membership |
| Multi-workspace switching | NOT IMPLEMENTED | PARTIAL | new selected-workspace context | Sprint 16 |
| RBAC/RLS | PARTIAL | YES | close SEC-01–04 first | Security Gate |
| Objects / Assets | DONE for Business | YES | generalized asset kinds/provenance | Shared Asset contract |
| Trust Passport | DONE for Business | YES | versioned mode-specific passports | Business/Home/Personal projections |
| Trust Score | DONE for Business | YES | scoring framework by mode | Preserve ADR-001 formula |
| Trust Graph | PARTIAL | YES | evidence relations, scale, impact | Graph analytics |
| Risk Registry | DONE for Business | YES | finding-to-risk boundary | Shared Finding + Risk mapping |
| Risk workflow | DONE | YES | remediation verification linkage | Remediation workflow |
| Dashboard | DONE for Business | YES | mode-specific summaries | Workspace dashboards |
| Configurator | DONE for Business | YES | model/version awareness later | No global consumer weights in MVP |
| CSV/XLSX import | DONE | YES | route through Evidence Layer | File source adapter |
| Source metadata | PARTIAL | YES | move from text block to records | Evidence provenance |
| Evidence Layer | SPEC | YES | migrations/runtime/UI | Sprint 17 |
| Normalization | SPEC | YES | runtime and tests | Sprint 17/20 |
| Identity Resolution | SPEC | YES | runtime, review conflicts | Sprint 20 |
| Confidence Engine | SPEC | YES | runtime and thresholds | Sprint 20 |
| Discovery Inbox | SPEC | YES | UI/actions/audit | Sprint 20 |
| Connector Framework | SPEC | YES | runtime, secrets, scheduler | Sprint 20 |
| First business connector | DEFERRED | YES | admission evidence required | Sprint 21 |
| Unified Finding | NOT IMPLEMENTED | PARTIAL | new domain model | Sprint 17 |
| Recommendation | NOT IMPLEMENTED | PARTIAL | shared templates and generation | Sprint 18 |
| Remediation | NOT IMPLEMENTED | PARTIAL | action instance, owner, verify | Sprint 18/24 |
| Assessment / Scan | NOT IMPLEMENTED | NO | scope, consent, execution, isolation | Sprint 19 |
| Infrastructure discovery | PLANNED | PARTIAL | connector/collector path | Sprint 21 |
| Vulnerability ingestion | PLANNED | PARTIAL | finding adapter, not scanner first | Sprint 22 |
| Configuration findings | PLANNED | PARTIAL | rules and evidence | Sprint 22 |
| Dependency/SPOF analysis | NOT IMPLEMENTED | YES | typed graph analytics | Sprint 23 |
| Cascade/impact analysis | NOT IMPLEMENTED | YES | bounded explainable simulation | Sprint 23 |
| Home Workspace | NOT IMPLEMENTED | PARTIAL | new policy and UX | Sprint 25 |
| Home device discovery | NOT IMPLEMENTED | NO | paired local collector | Sprint 26 |
| Device Trust Passport | NOT IMPLEMENTED | YES | Home score model | Sprint 27 |
| Home Trust Score | NOT IMPLEMENTED | YES | network aggregation model | Sprint 27 |
| Personal Workspace | NOT IMPLEMENTED | PARTIAL | strict private tenant | Sprint 28 |
| Identity / Accounts | NOT IMPLEMENTED | NO | verified identifiers | Sprint 29 |
| Personal Trust Passport | NOT IMPLEMENTED | YES | privacy-aware factors | Sprint 29 |
| Personal Trust Score | NOT IMPLEMENTED | YES | versioned personal model | Sprint 29 |
| Breach exposure | NOT IMPLEMENTED | NO | provider contract, no raw secrets | Sprint 30 |
| Digital Footprint | NOT IMPLEMENTED | NO | consent/ownership/abuse controls | Sprint 30/31 |
| Domain/URL/hash intelligence | NOT IMPLEMENTED | PARTIAL | safe provider adapters | Sprint 31 |
| Metadata inspection | NOT IMPLEMENTED | NO | local-first/sandboxed parser | Sprint 31 |
| Knowledge Center | NOT IMPLEMENTED | PARTIAL | content/model/UI | Sprint 18/32 |
| Change history | PARTIAL | YES | shared events/freshness | Sprint 33 |
| Notifications | UI PLACEHOLDER | PARTIAL | preferences, delivery, dedupe | Sprint 33 |
| Native Mobile App | FUTURE | NO | separate client/API maturity | Post-Platform MVP |
| General Desktop/Home Agent | FUTURE | PARTIAL | signed updates, attestation | Post-Platform MVP |
| On-prem runtime | FUTURE | PARTIAL | deployment/security program | Enterprise |

---

## 3. Фактическая Точка Остановки

1. Sprint 15 завершил только specifications и handoff Connector Foundation.
2. Security Gate подготовлен, но SEC/STAB tasks не реализованы.
3. Production schema заканчивается на migration 019 и не содержит Workspace,
   Evidence, Finding, Recommendation, Scan, Home или Personal entities.
4. Existing import напрямую создаёт Business objects/risks; source context
   хранится в description text block.
5. Authenticated Sprint 12/13 QA и Pilot GO evidence остаются pending.

Следовательно, первая реализация после этой planning-консолидации — Security &
Stabilization Gate, а не Workspace, connector или consumer feature.

---

## 4. Главные Архитектурные Разрывы

| Разрыв | Почему нельзя обойти | Закрывается |
|---|---|---|
| Unsafe profile/tenant boundaries | Workspace расширит blast radius | Security Gate |
| Один `profiles.organization_id` | Не поддерживает безопасный Business/Home/Personal context | Sprint 16 |
| Evidence только как metadata | Нельзя доказать finding и freshness | Sprint 17 |
| Risk смешивает observation и decision | Автоматизация создаст ложные бизнес-риски | Sprint 17 |
| Нет remediation entity | Recommendation нельзя назначить/проверить | Sprint 18 |
| Нет scoped execution contract | Scanning создаёт abuse/SSRF/RCE риск | Sprint 19 |
| Нет runtime adapter boundary | Vendor integrations станут ad hoc | Sprint 20 |
| Нет privacy/consent domain | Personal/Home данные нельзя безопасно хранить | Sprint 25/28 |
