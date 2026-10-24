# SPRINT 19 — Scoped Assessment Execution Foundation

`Статус: PLANNED / NOT STARTED`
`Milestone: Platform Foundation Ready`
`Зависимость: Sprint 18`

## Goal

Создать безопасный общий contract выполнения проверок до любого network scan,
Home collector или public-intelligence request.

## Why

Без consent/scope, isolation и resource limits scanner capabilities превращают
DTEK в SSRF/RCE/abuse surface.

## Scope

Assessment intent, consent/scope grants, bounded run/job lifecycle, execution
policy, cancellation, audit, resource budget и isolated runner decision.

## Out Of Scope

Full scanner, arbitrary commands, broad port scanning, Home collector,
continuous monitoring и конкретный vendor connector.

## Tasks

| ID | Название | Описание | Зависимости | Ожидаемый результат |
|---|---|---|---|---|
| S19-T001 | Assessment Threat Model & ADR | Определить trust boundaries и runner architecture | S18 | Approved execution boundary |
| S19-T002 | Consent & Scope Model | Purpose, target, proof, expiry, revoke | T001 | Auditable authorization |
| S19-T003 | Assessment/Run Schema | State, budget, idempotency, cancellation and result refs | T001–T002 | Durable execution contract |
| S19-T004 | Policy & Orchestrator | Server-only validation and allowlisted check dispatch | T002–T003 | No client-controlled execution |
| S19-T005 | Isolated Runner Spike | Проверить sandbox, egress and resource controls | T001–T004 | GO/NO-GO evidence |
| S19-T006 | Audit, Rate & Cost Limits | Per-user/workspace/target controls | T003–T005 | Abuse-resistant baseline |
| S19-T007 | Adversarial Tests | SSRF, command injection, replay, DoS and tenant cases | T004–T006 | Security acceptance evidence |
| S19-T008 | Operations & Developer Handoff | Incident, cancellation, cleanup and rollback runbook | T001–T007 | Foundation ready decision |

## Technical Notes

If isolation cannot meet acceptance, Sprint closes `NO-GO` without shipping
active checks. Passive/import paths remain available.

## Security Requirements

Code-owned checks, structured process API, signed jobs, destination validation,
redirect recheck, no metadata/loopback access, strict timeout/output limits.

## Testing

Hostile targets, DNS rebinding simulation, redirect chain, shell metacharacters,
oversized output, cancellation, retries, concurrent runs and two-workspace tests.

## Acceptance Criteria

- User cannot submit arbitrary command or unrestricted destination.
- Run cannot exceed policy budget.
- Revoked/expired scope blocks dispatch.
- Runner failure does not expose network or secret details.

## Definition Of Done

T001–T008 complete with explicit GO/NO-GO; security tests and incident runbook
PASS; no active scanner is implied by foundation alone.

## Documentation

ADR, threat model, Security Principles, operations, API contract and Roadmap.

## Git

Conventional Commits; security-sensitive changes isolated; push only after full gates.
