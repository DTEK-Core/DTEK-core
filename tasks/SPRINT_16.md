# SPRINT 16 — Workspace & Account Foundation

`Статус: PLANNED / NOT STARTED`
`Milestone: Platform Foundation`
`Зависимость: Security & Stabilization Gate — PASS`

## Goal

Безопасно обобщить текущий Organization tenant до Workspace model для
Business, Home и Personal, сохранив полную совместимость DTEK Business.

## Why

Один `profiles.organization_id` не поддерживает несколько режимов и безопасное
переключение. Изменение tenant boundary до закрытия Gate запрещено.

## Scope

- Account/Profile и Workspace/Workspace Membership contracts;
- Business workspace backfill без потери organization data;
- server-selected workspace context;
- mode-aware permissions и navigation foundation;
- RLS migration и two-workspace tests.

## Out Of Scope

Home/Personal features, connector runtime, новые score formulas, billing,
custom roles и destructive rename существующих Business tables.

## Tasks

| ID | Название | Описание | Зависимости | Ожидаемый результат |
|---|---|---|---|---|
| S16-T001 | Current Tenant Contract & ADR | Зафиксировать compatibility invariants и выбрать mapping Organization ↔ Workspace | Gate | ADR и migration decision |
| S16-T002 | Workspace Schema | Спроектировать и применить `workspaces`/`workspace_memberships` с constraints | T001 | Tenant foundation |
| S16-T003 | Business Backfill | Идемпотентно создать Business workspaces для organizations | T002 | Existing tenants сохранены |
| S16-T004 | Active Workspace Context | Реализовать server-side selected context без client trust | T002–T003 | Безопасный request context |
| S16-T005 | Workspace RLS/RBAC | Ввести active-membership helpers и mode policies | T004 | Deny-by-default isolation |
| S16-T006 | Compatibility & Switcher UX | Сохранить текущие routes и добавить безопасный switcher baseline | T004–T005 | Business UX без regression |
| S16-T007 | Workspace Security Tests | Два Business tenant и cross-mode fixture, negative direct API cases | T005–T006 | Automated isolation evidence |
| S16-T008 | Migration & User Documentation | Runbook, rollback, diagrams и user context | T001–T007 | Reproducible handoff |

## Technical Notes

Existing organization IDs сохраняются либо получают immutable 1:1 mapping.
Номер migration выбирается после linked parity. Generated DB types Gate должны
обновляться после schema changes.

## Security Requirements

No role/tenant mass assignment, composite tenant FKs, active membership,
blocked/revoked access deny, service-role authorization checks, audit events.

## Testing

Migration from current fixture, rollback rehearsal, owner/admin/analyst/viewer,
two tenants, Business regression, session switch and concurrent membership tests.

## Acceptance Criteria

- Existing Business organization работает без data loss.
- User-controlled workspace ID не даёт foreign access.
- Personal/Home mode нельзя подделать client payload.
- Direct API negative matrix проходит.

## Definition Of Done

Tasks T001–T008 complete; type-check/lint/build and existing suites PASS;
workspace integration tests PASS; docs and migration evidence updated.

## Documentation

ADR, System Architecture, RBAC/RLS, Database Design, User Guide, Roadmap,
Sprint status и Changelog.

## Git

Отдельные Conventional Commits по migration, context/UI, tests и docs; push в
`develop` только после Terminal Health Gate.
