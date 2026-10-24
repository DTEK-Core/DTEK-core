# SPRINT 17 — Unified Evidence & Finding Layer

`Статус: PLANNED / NOT STARTED`
`Milestone: Platform Foundation`
`Зависимость: Sprint 16`

## Goal

Материализовать Evidence Layer Sprint 15 и отделить наблюдаемый `Finding` от
контекстного `Risk` без изменения текущей Business score formula.

## Why

Home, Personal и automated Business discovery нельзя строить на description
text blocks или автоматически превращать каждое наблюдение в Risk.

## Scope

Evidence source/batch/record/observation/assertion/binding runtime, unified
Finding lifecycle, provenance/freshness, controlled import compatibility.

## Out Of Scope

Vendor connectors, active scanning, auto-remediation, Home/Personal UI и
автоматическое влияние low-confidence findings на Trust Score.

## Tasks

| ID | Название | Описание | Зависимости | Ожидаемый результат |
|---|---|---|---|---|
| S17-T001 | Evidence/Finding ADR | Утвердить boundaries Evidence → Finding → Risk | S16 | Versioned domain contract |
| S17-T002 | Evidence Schema | Реализовать staged tables/constraints из S15 spec | T001 | Durable provenance layer |
| S17-T003 | Finding Schema & Lifecycle | Типы, states, severity, confidence, workspace binding | T001–T002 | Unified finding model |
| S17-T004 | File Import Compatibility Adapter | Перевести CSV/XLSX через evidence path без UX regression | T002 | First runtime source adapter |
| S17-T005 | Binding & Projection Policy | Связать evidence/findings с assets/risks/factors через review | T003–T004 | Controlled projection |
| S17-T006 | Evidence & Finding UI | Source/freshness/reason states в Passport/Risk context | T003–T005 | Explainable user surface |
| S17-T007 | Tenant/Replay Tests | Idempotency, quarantine, two-workspace and hostile input | T002–T006 | Security/runtime evidence |
| S17-T008 | Migration & User Documentation | Backfill limits, retention and rollback | T001–T007 | Safe handoff |

## Technical Notes

Use S15 Evidence/Normalization specifications. Current import result remains
stable during dual-write/read transition; no silent reinterpretation of history.

## Security Requirements

Immutable raw observations, payload size/type validation, redaction, tenant
constraints, quarantine, retention metadata and no raw payload in audit/UI.

## Testing

Replay, duplicate, revision, stale source, malformed payload, cross-tenant
binding, migration fixture and existing import/explainability suites.

## Acceptance Criteria

- Every projected Finding has source/provenance.
- Finding does not become accepted Risk without policy/review.
- Existing imports remain usable.
- Cross-workspace evidence binding is impossible.

## Definition Of Done

T001–T008 complete; migration/types/tests/docs PASS; import and Business
critical path have no regression.

## Documentation

Evidence specs, Database Design, Trust/Import guides, Security model, Roadmap,
Sprint and Changelog.

## Git

Conventional Commits split by schema, compatibility, UI/tests and docs; push to
`develop` after checks.
