---
title: Current State
type: status
status: active
updated: 2026-10-26
tags:
  - dtek
  - current-state
---

# Current State

## Реализовано

- Authentication, password reset и session middleware.
- Organizations, onboarding и multi-organization switcher.
- Users, invitations и роли `owner`, `analyst`, `admin`, `viewer`.
- Objects и Trust Passport.
- Trust Score Engine и factor configuration.
- Trust Graph с ручными relations.
- Risk Registry: owner, due date, SLA, comments, origin и activity.
- Dashboard, Configurator, Settings и Audit Log.
- CSV/XLSX import объектов и рисков.
- Trust Passport/Executive reports и Risk CSV export.
- Evidence-backed explainability поверх текущего source context.
- Environment health, smoke runner, backup/monitoring/pilot runbooks.

## Частично Реализовано

| Область | Фактическое ограничение |
|---|---|
| Evidence | Source metadata хранится временным text block; Evidence tables отсутствуют |
| Discovery | Есть specifications, но нет runtime и Discovery Inbox UI |
| Connectors | Framework/security contracts готовы; vendor/runtime не выбран |
| Trust Graph | Relations создаются вручную; автоматическое построение отсутствует |
| QA | Sprint 12/13 authenticated multi-role acceptance отложена |
| Pilot readiness | Runbooks готовы, factual restore/provider/release evidence pending |

## Только В Документации

- Workspace model.
- Unified Evidence/Finding layer.
- Recommendation/Remediation entities.
- Assessment execution runtime.
- Connector Runtime и automatic discovery.
- DTEK Home, Personal, Exposure и Knowledge Center.
- Mode-specific Home/Personal Trust Score.
- Paired Home Collector.

## Известные Blockers

Все детали находятся в [[tasks/SECURITY_STABILIZATION_GATE]]. Кратко:

1. Profile privilege boundary.
2. Blocked-user enforcement.
3. Cross-tenant Object/Risk relations.
4. Cross-tenant Trust Graph relations.
5. Atomic organization/invitation flows.
6. Generated Supabase database types.
7. DB-level RLS integration tests.
8. Authenticated role QA.

## Evidence Текущего Состояния

- [[README]]
- [[docs/architecture/DTEK_PLATFORM_GAP_ANALYSIS|Platform Gap Analysis]]
- [[docs/architecture/System_Architecture|Current Architecture]]
- [[docs/architecture/TECHNICAL_DEBT|Technical Debt]]
- [[tasks/archive/README|Sprint Archive]]
- [[CHANGELOG]]
