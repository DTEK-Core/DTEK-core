# DTEK Platform Sprint Roadmap

`Статус: PLANNED / NOT STARTED`
`Дата: 24.10.2026`
`Точка продолжения: после завершённого Sprint 15`

---

## 1. Статусы

| Класс | Значение |
|---|---|
| `COMPLETED` | Функциональная работа исторического Sprint завершена |
| `REFERENCE` | Исторический документ; незакрытая ручная приёмка перенесена в Gate |
| `ACTIVE GATE` | Обязательный blocking stage, подготовлен, но не начат |
| `PLANNED` | Scope описан; реализация не начиналась |
| `FUTURE` | За границей первого Platform MVP |

Sprint 01–15 находятся в [архиве](../../tasks/archive/README.md). Их содержание
не переписано. Активным остаётся только
[Security & Stabilization Gate](../../tasks/SECURITY_STABILIZATION_GATE.md).

---

## 2. Полная Цепочка

```text
CURRENT: DTEK Business Functional pre-pilot MVP
  -> SECURITY & STABILIZATION GATE
  -> S16 Workspace & Account Foundation
  -> S17 Unified Evidence & Finding Layer
  -> S18 Recommendation, Remediation & Knowledge Core
  -> S19 Scoped Assessment Execution Foundation
  -> FOUNDATION READY
  -> S20 Connector Runtime & Discovery Inbox
  -> S21 Business Source Admission & Infrastructure Discovery
  -> S22 Business Security Findings & Trust Impact
  -> S23 Dependency, Exposure Path & Resilience Analysis
  -> S24 Business Remediation & Pilot Release
  -> BUSINESS MVP
  -> S25 Home Workspace & Privacy Foundation
  -> S26 Paired Home Collector & Device Discovery
  -> S27 Home Trust Model & Safe Recommendations
  -> HOME MVP
  -> S28 Personal Workspace, Consent & Privacy
  -> S29 Personal Trust Passport & Score
  -> S30 DTEK Exposure: Breach & Digital Footprint
  -> S31 Safe Public Intelligence Toolkit
  -> PERSONAL MVP
  -> S32 Knowledge & Remediation Center
  -> S33 Continuous Trust, History & Notifications
  -> S34 Unified Platform Experience & Governance
  -> S35 DTEK Platform MVP Validation & Release
  -> PLATFORM MVP GO / NO-GO
```

---

## 3. Blocking Gate

| Этап | Статус | Цель |
|---|---|---|
| [Security & Stabilization Gate](../../tasks/SECURITY_STABILIZATION_GATE.md) | `PREPARED / NOT STARTED` | Закрыть известные security/stability blockers и подтвердить Business baseline |

Gate включает profile privilege boundary, blocked-user enforcement,
cross-tenant Object/Risk и Graph constraints, atomic flows, generated database
types, DB-level RLS tests, authenticated role QA и release evidence. Он не
помечается выполненным до фактических проверок.

---

## 4. Platform Foundation

| Sprint | Документ | Одна Цель |
|---:|---|---|
| 16 | [Workspace & Account Foundation](../../tasks/SPRINT_16.md) | Ввести additive Workspace boundary без разрушения Organization/RLS |
| 17 | [Unified Evidence & Finding Layer](../../tasks/SPRINT_17.md) | Разделить raw observations, assertions, findings и business risks |
| 18 | [Recommendation, Remediation & Knowledge Core](../../tasks/SPRINT_18.md) | Связать finding с безопасным действием и verification result |
| 19 | [Scoped Assessment Execution Foundation](../../tasks/SPRINT_19.md) | Создать bounded, authorized, auditable execution contract |

Milestone: **Foundation Ready**. Техническое ядро поддерживает новые mode, но
Home/Personal user-facing functionality ещё отсутствует.

---

## 5. Business Evolution

| Sprint | Документ | Одна Цель |
|---:|---|---|
| 20 | [Connector Runtime & Discovery Inbox](../../tasks/SPRINT_20.md) | Реализовать ADR-009 runtime через ingestion и human review |
| 21 | [Business Source Admission & Infrastructure Discovery](../../tasks/SPRINT_21.md) | Допустить первый подтверждённый source и построить asset discovery |
| 22 | [Business Security Findings & Trust Impact](../../tasks/SPRINT_22.md) | Превратить evidence в explainable findings и score impact |
| 23 | [Dependency, Exposure Path & Resilience Analysis](../../tasks/SPRINT_23.md) | Выявлять dangerous paths, SPOF и cascade consequences |
| 24 | [Business Remediation & Pilot Release](../../tasks/SPRINT_24.md) | Закрыть remediation workflow и Business release gate |

Milestone: **Business MVP**. DTEK Business становится evidence-driven, но не
пытается заменить исходные sensors или автоматически исправлять инфраструктуру.

---

## 6. Home MVP

| Sprint | Документ | Одна Цель |
|---:|---|---|
| 25 | [Home Workspace & Privacy Foundation](../../tasks/SPRINT_25.md) | Создать household tenant/consent model и безопасный onboarding |
| 26 | [Paired Home Collector & Device Discovery](../../tasks/SPRINT_26.md) | Обнаруживать устройства только из локального явно разрешённого scope |
| 27 | [Home Trust Model & Safe Recommendations](../../tasks/SPRINT_27.md) | Дать device passports, Home Trust Score и practical safe actions |

Milestone: **Home MVP**. Mobile app, continuous broad agent и remote arbitrary
scanner остаются `FUTURE`.

---

## 7. Personal MVP

| Sprint | Документ | Одна Цель |
|---:|---|---|
| 28 | [Personal Workspace, Consent & Privacy](../../tasks/SPRINT_28.md) | Изолировать personal data и lifecycle verified identifiers |
| 29 | [Personal Trust Passport & Score](../../tasks/SPRINT_29.md) | Объяснимо оценивать identity/account/device/network posture |
| 30 | [DTEK Exposure: Breach & Digital Footprint](../../tasks/SPRINT_30.md) | Показывать безопасные breach/exposure результаты без раскрытия секретов |
| 31 | [Safe Public Intelligence Toolkit](../../tasks/SPRINT_31.md) | Дать bounded defensive checks для собственных domains/URLs/hashes/metadata |

Milestone: **Personal MVP**. People search, phone/address lookup, face
recognition, private-profile scraping и bulk enumeration запрещены.

---

## 8. Shared Platform

| Sprint | Документ | Одна Цель |
|---:|---|---|
| 32 | [Knowledge & Remediation Center](../../tasks/SPRINT_32.md) | Дать единый verified explanation/remediation/verification experience |
| 33 | [Continuous Trust, History & Notifications](../../tasks/SPRINT_33.md) | Показывать изменения и полезные bounded alerts без dark patterns |
| 34 | [Unified Platform Experience & Governance](../../tasks/SPRINT_34.md) | Объединить modes без смешивания данных, ролей и score semantics |
| 35 | [DTEK Platform MVP Validation & Release](../../tasks/SPRINT_35.md) | Провести security/privacy/operations GO/NO-GO |

Milestone: **DTEK Platform MVP**.

---

## 9. Общий Definition Of Done

Каждый Sprint:

- сохраняет существующую архитектуру или имеет ADR;
- включает RBAC/RLS/tenant/privacy threat analysis;
- не помечает документацию как evidence фактического теста;
- имеет unit/contract/integration/E2E tests соразмерно риску;
- проверяет two-tenant или two-workspace isolation;
- обновляет Sprint, Architecture, Security, User docs и Changelog;
- проходит `npm run type-check`, `npm run lint`, `npm run build` и релевантные tests;
- завершается Conventional Commit и push в `develop`;
- не начинает следующий Sprint автоматически.

---

## 10. Future После Platform MVP

Отдельного решения потребуют native mobile app, desktop/general-purpose agent,
always-on Home agent, on-prem/private cloud, SSO/SAML, custom roles,
marketplace, advanced policy packs, autonomous remediation и enterprise-scale
streaming. Они не являются скрытыми задачами Sprint 16–35.
