# SPRINT 22 — Business Security Findings & Trust Impact

`Статус: PLANNED / NOT STARTED`
`Milestone: Business MVP`
`Зависимость: Sprint 21 GO or qualified file evidence`

## Goal

Преобразовать инфраструктурные evidence в explainable vulnerability,
configuration, exposure и missing-control findings.

## Why

Inventory без интерпретации не создаёт Trust Intelligence value.

## Scope

Finding rules, source mappings, risk candidates, Trust factor impact policy,
coverage/confidence and remediation links.

## Out Of Scope

Собственный vulnerability scanner, auto-accepted business risks, изменение
ADR-001 formula, exploit verification и autonomous remediation.

## Tasks

| ID | Название | Описание | Зависимости | Ожидаемый результат |
|---|---|---|---|---|
| S22-T001 | Business Finding Policy | Rule/version/confidence and review contract | S21 | Approved interpretation model |
| S22-T002 | Vulnerability Findings | Map qualified source/file records to findings | T001 | Evidence-backed vulnerabilities |
| S22-T003 | Configuration Findings | Misconfiguration and insecure-default rules | T001 | Explainable config findings |
| S22-T004 | Exposure & Missing Controls | Network exposure/control absence with evidence | T001 | Broader finding coverage |
| S22-T005 | Risk Candidate Mapping | Convert accepted findings to reviewable risk candidates | T002–T004 | No silent risk creation |
| S22-T006 | Trust Impact Policy | Factor reason/coverage impact without formula rewrite | T002–T005 | Explainable score context |
| S22-T007 | Finding UX & Priorities | Asset/Passport/Dashboard views and remediation links | T005–T006 | Actionable Business UX |
| S22-T008 | Rule/Test Documentation | Golden fixtures, false-positive review and security tests | T001–T007 | Controlled rule release |

## Technical Notes

Rules are versioned and replayable. Score impact requires accepted projection
and evidence freshness; low confidence remains informational.

## Security Requirements

Hostile source validation, rule provenance, no raw secrets, tenant bindings,
safe external references and audit for accept/reject.

## Testing

Golden datasets, false positives, stale/contradictory evidence, replay,
cross-tenant mapping and current Trust Score regression.

## Acceptance Criteria

Every finding explains source, rule, affected asset and next action; no finding
changes Business formula or accepted risk without policy.

## Definition Of Done

T001–T008 complete; rule fixtures and quality/security gates PASS; user docs updated.

## Documentation

Finding catalog, Trust Score/Passport guides, Risk model, Security and Roadmap.

## Git

Rules, UI and docs use separate Conventional Commits; push after checks.
