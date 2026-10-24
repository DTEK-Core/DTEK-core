# SPRINT 27 — Home Trust Model & Safe Recommendations

`Статус: PLANNED / NOT STARTED`
`Milestone: Home MVP`
`Зависимость: Sprint 26`

## Goal

Создать Device Trust Passports, versioned Home Trust Score и понятные безопасные
recommendations на основе подтверждённых Home evidence.

## Why

Список устройств полезен только если пользователь понимает неизвестные,
устаревшие и небезопасно настроенные элементы и знает следующий шаг.

## Scope

Home score ADR, device/network findings, Device Passport, Home Graph, aggregate
Home Trust Score, recommendation/remediation and change history.

## Out Of Scope

Business formula reuse, guaranteed CVE detection without version evidence,
automatic router changes, parental control и public leaderboards.

## Tasks

| ID | Название | Описание | Зависимости | Ожидаемый результат |
|---|---|---|---|---|
| S27-T001 | Home Trust Score ADR | Factors, coverage, neutral state and versioning | S26 | Mode-specific model |
| S27-T002 | Home Finding Rules | Unknown device, exposed service, weak config and stale evidence | T001 | Safe finding baseline |
| S27-T003 | Device Trust Passport | Evidence, findings, score, history and actions | T001–T002 | Per-device understanding |
| S27-T004 | Home Trust Graph | Router/network/device relations with provenance | T002–T003 | Explainable topology |
| S27-T005 | Home Trust Score | Aggregate device/network score and confidence | T001–T004 | Household overview |
| S27-T006 | Safe Recommendations | Router/device instructions with rollback/verification | T002–T005 | Actionable guidance |
| S27-T007 | Change & Unknown Alerts | Meaningful new device/finding changes, deduplicated | T003–T006 | Retention value |
| S27-T008 | Home MVP QA & GO/NO-GO | Privacy, mobile, collector, score and remediation E2E | T001–T007 | Home MVP decision |

## Technical Notes

Unknown OS/version produces uncertainty, not vulnerability claim. Score shows
coverage and never compares directly with Business score.

## Security Requirements

Private topology, safe notifications, no raw banner leakage, recommendation
review and collector revocation.

## Testing

Unknown/duplicate devices, stale evidence, router loss, partial coverage,
recommendation verification, mobile and deletion regression.

## Acceptance Criteria

User understands Home state and can complete at least one safe verified action;
uncertain data is labeled, not overstated.

## Definition Of Done

T001–T008 and Home privacy/security gates PASS; explicit Home MVP decision recorded.

## Documentation

Home Trust model, user guide, finding catalog, collector and release record.

## Git

Model, UI, content/tests and release docs use separate Conventional Commits.
