# SPRINT 20 — Connector Runtime & Discovery Inbox

`Статус: PLANNED / NOT STARTED`
`Milestone: Business Automation Foundation`
`Зависимость: Sprint 19 GO + Sprint 15 specifications`

## Goal

Реализовать общий Connector Runtime и Discovery Inbox сначала на безопасном
file-source adapter, без преждевременного vendor commitment.

## Why

S15 определил contracts, но runtime отсутствует. File import позволяет
проверить pipeline до доступа к внешним системам.

## Scope

Definitions/installations/runs, secret references, adapter SDK, file source
adapter, normalization/identity/confidence runtime и Discovery Inbox actions.

## Out Of Scope

Marketplace, multiple vendors, realtime streaming, endpoint agent, direct writes
to Assets/Risks/Score и automatic merge of ambiguous identities.

## Tasks

| ID | Название | Описание | Зависимости | Ожидаемый результат |
|---|---|---|---|---|
| S20-T001 | Runtime Admission Review | Revalidate S15 contracts and S19 GO evidence | S19 | Approved bounded scope |
| S20-T002 | Installation & Run Schema | Tenant tables, lifecycle, cursor and constraints | T001 | Runtime persistence |
| S20-T003 | Secret Reference Boundary | Vault/approved backend, write-only rotation | T002 | No credentials in app tables |
| S20-T004 | Adapter SDK & Ingestion Gateway | Versioned code-owned interface and safe errors | T002–T003 | Shared runtime contract |
| S20-T005 | File Source Adapter | Route CSV/XLSX through runtime/evidence | T004 | Production-proven adapter |
| S20-T006 | Resolver & Confidence Runtime | Deterministic normalization and conflict outcomes | T004–T005 | Candidate generation |
| S20-T007 | Discovery Inbox UX | Confirm/link/merge/reject/archive with audit | T006 | Human-controlled projection |
| S20-T008 | Contract/Security Tests & Handoff | Replay, retries, secrets, two tenants, recovery | T001–T007 | Connector Runtime Ready |

## Technical Notes

Scheduler choice remains minimal and provider-compatible. Connector adapter
never receives unrestricted database client.

## Security Requirements

Opaque secrets, SSRF policy, tenant-fixed run context, hostile payload
validation, safe audit, idempotency and manual authority over source data.

## Testing

Adapter contract suite, cursor/retry/replay, secret rotation, conflict review,
cross-tenant run, source deletion and current import regression.

## Acceptance Criteria

- File source produces evidence/candidates through common runtime.
- Candidate cannot silently overwrite manual asset.
- Secret is never returned to client or audit.
- Runtime passes two-tenant and recovery tests.

## Definition Of Done

T001–T008 complete; Connector Runtime Ready milestone documented; vendor remains
unselected until Sprint 21 admission.

## Documentation

Connector/Evidence specs, developer SDK guide, operations, user import guide,
Roadmap and Changelog.

## Git

Conventional Commits by schema/runtime/UI/tests/docs; push after checks.
