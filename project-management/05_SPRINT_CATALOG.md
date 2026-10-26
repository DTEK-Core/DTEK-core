---
title: Sprint Catalog
type: sprint-index
status: active
updated: 2026-10-26
tags:
  - dtek
  - sprint
---

# Sprint Catalog

Этот каталог даёт единый обзор, но не копирует содержимое Sprint. Оригинальный
Sprint-документ остаётся источником scope, задач и Definition of Done.

## Current Gate

| Stage | Status | Purpose |
|---|---|---|
| [[tasks/SECURITY_STABILIZATION_GATE|Security & Stabilization Gate]] | PREPARED / NOT STARTED | Закрыть security/stability blockers до Sprint 16 |

## Исторические Sprint 01–15

| Sprint | Название / результат | Класс |
|---:|---|---|
| [[tasks/archive/SPRINT_01|01]] | Infrastructure, Supabase, schema, CI/CD | COMPLETED |
| [[tasks/archive/SPRINT_02|02]] | Auth, organizations, users, onboarding | COMPLETED |
| [[tasks/archive/SPRINT_03|03]] | Objects, Trust Passport, Risk Registry | COMPLETED |
| [[tasks/archive/SPRINT_04|04]] | Manual testing and stabilization | COMPLETED |
| [[tasks/archive/SPRINT_05|05]] | Trust Score, Graph, Dashboard, Configurator | COMPLETED |
| [[tasks/archive/SPRINT_06|06]] | Security hardening baseline | COMPLETED |
| [[tasks/archive/SPRINT_07|07]] | Historical QA cycle | REFERENCE |
| [[tasks/archive/SPRINT_08|08 Plan]] | Product review and UX source | REFERENCE |
| [[tasks/archive/SPRINT_08_IMPLEMENTATION|08 Implementation]] | UX refinement | COMPLETED |
| [[tasks/archive/SPRINT_09|09]] | Market MVP packaging | COMPLETED |
| [[tasks/archive/SPRINT_10|10]] | Reporting and export | COMPLETED |
| [[tasks/archive/SPRINT_11|11]] | CSV/XLSX evidence onboarding | COMPLETED |
| [[tasks/archive/SPRINT_12|12]] | Explainability implemented; authenticated QA pending | REFERENCE |
| [[tasks/archive/SPRINT_13|13]] | Risk workflow implemented; authenticated QA pending | REFERENCE |
| [[tasks/archive/SPRINT_14|14]] | Pilot artifacts ready; release evidence pending | REFERENCE |
| [[tasks/archive/SPRINT_15|15]] | Connector Foundation Ready / Runtime Deferred | COMPLETED |

## Platform Foundation

| Sprint | Цель | Status |
|---:|---|---|
| [[tasks/SPRINT_16|16 — Workspace & Account Foundation]] | Additive Workspace boundary без разрушения Organization/RLS | PLANNED |
| [[tasks/SPRINT_17|17 — Unified Evidence & Finding Layer]] | Разделить observations, assertions, findings и risks | PLANNED |
| [[tasks/SPRINT_18|18 — Recommendation, Remediation & Knowledge Core]] | Связать finding, action и verification | PLANNED |
| [[tasks/SPRINT_19|19 — Scoped Assessment Execution Foundation]] | Authorized bounded execution contract | PLANNED |

## Business Evolution

| Sprint | Цель | Status |
|---:|---|---|
| [[tasks/SPRINT_20|20 — Connector Runtime & Discovery Inbox]] | Безопасный ingestion и human review | PLANNED |
| [[tasks/SPRINT_21|21 — Business Source Admission & Discovery]] | Первый подтверждённый source и asset discovery | PLANNED |
| [[tasks/SPRINT_22|22 — Business Findings & Trust Impact]] | Evidence-backed findings и score impact | PLANNED |
| [[tasks/SPRINT_23|23 — Dependency & Resilience Analysis]] | Exposure paths, SPOF и cascade consequences | PLANNED |
| [[tasks/SPRINT_24|24 — Business Remediation & Pilot Release]] | Remediation workflow и Business GO/NO-GO | PLANNED |

## Home MVP

| Sprint | Цель | Status |
|---:|---|---|
| [[tasks/SPRINT_25|25 — Home Workspace & Privacy]] | Household tenant, consent и onboarding | PLANNED |
| [[tasks/SPRINT_26|26 — Paired Home Collector]] | Локальный discovery только в разрешённом scope | PLANNED |
| [[tasks/SPRINT_27|27 — Home Trust & Recommendations]] | Device passports, Home score и actions | PLANNED |

## Personal MVP

| Sprint | Цель | Status |
|---:|---|---|
| [[tasks/SPRINT_28|28 — Personal Workspace & Privacy]] | Consent и verified identifier lifecycle | PLANNED |
| [[tasks/SPRINT_29|29 — Personal Trust Passport & Score]] | Identity/account/device/network posture | PLANNED |
| [[tasks/SPRINT_30|30 — DTEK Exposure]] | Breach exposure и digital footprint | PLANNED |
| [[tasks/SPRINT_31|31 — Safe Public Intelligence Toolkit]] | Bounded domain/URL/hash/metadata checks | PLANNED |

## Shared Platform

| Sprint | Цель | Status |
|---:|---|---|
| [[tasks/SPRINT_32|32 — Knowledge & Remediation Center]] | Verified explanation and remediation content | PLANNED |
| [[tasks/SPRINT_33|33 — Continuous Trust & Notifications]] | История и полезные bounded alerts | PLANNED |
| [[tasks/SPRINT_34|34 — Unified Experience & Governance]] | Modes без смешивания данных и score semantics | PLANNED |
| [[tasks/SPRINT_35|35 — Platform MVP Validation & Release]] | Security/privacy/operations GO/NO-GO | PLANNED |

## Архивная Политика

Исторические Sprint не редактируются для отражения новой стратегии. Pending
acceptance из Sprint 12–14 контролируется активным Gate и release checklists.
