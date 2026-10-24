# SPRINT 24 — Business Remediation & Pilot Release

`Статус: PLANNED / NOT STARTED`
`Milestone: Business MVP`
`Зависимость: Sprint 23`

## Goal

Собрать Business flow Discovery → Finding → Impact → Remediation → Verification
и подготовить его к измеряемому pilot release.

## Why

Отдельные engines не доказывают коммерческую ценность без end-to-end workflow.

## Scope

Business remediation queue, ownership/SLA, verification runs, reports,
operational readiness, authenticated QA and pilot metrics.

## Out Of Scope

Home/Personal, autonomous remediation, multiple connectors, enterprise SSO,
on-prem и procurement certification.

## Tasks

| ID | Название | Описание | Зависимости | Ожидаемый результат |
|---|---|---|---|---|
| S24-T001 | Business Journey Integration | Join source, asset, finding, risk and remediation UX | S23 | Coherent workflow |
| S24-T002 | Remediation Queue & SLA | Priorities, owner, status and overdue states | T001 | Operational worklist |
| S24-T003 | Verification & Reopen | Recheck evidence, close/reopen and history | T001–T002 | Demonstrable risk reduction |
| S24-T004 | Executive/Technical Reports | Impact, progress, evidence coverage and limitations | T001–T003 | Pilot deliverables |
| S24-T005 | Operations Readiness | Monitoring, backup, incident and connector recovery | T001–T004 | Supportable pilot |
| S24-T006 | Authenticated Multi-role QA | Business roles, mobile and two-tenant regression | T001–T005 | Release evidence |
| S24-T007 | Pilot Metrics & Feedback | Time-to-value, finding quality, remediation outcome | T006 | Measurable hypothesis |
| S24-T008 | Business MVP GO/NO-GO | Security/performance/privacy review and release record | T001–T007 | Business MVP decision |

## Technical Notes

Existing pilot documentation is updated, not duplicated. `GO` requires actual
evidence, not completed checklists alone.

## Security Requirements

Full Gate invariants, connector/source isolation, report RBAC, audit, backup and
incident rehearsal.

## Testing

End-to-end authenticated pilot dataset, failure recovery, revoked source,
stale findings, report access, mobile and performance baseline.

## Acceptance Criteria

A pilot user can load/connect data, understand priority, assign remediation and
prove improvement without cross-tenant leakage.

## Definition Of Done

T001–T008 and all release gates PASS; explicit Business MVP GO/NO-GO recorded.

## Documentation

Pilot pack, user/admin guides, operations, metrics, release notes and Roadmap.

## Git

Release candidate commits remain reviewable; final docs commit and push follow policy.
