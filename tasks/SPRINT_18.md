# SPRINT 18 — Recommendation, Remediation & Knowledge Core

`Статус: PLANNED / NOT STARTED`
`Milestone: Platform Foundation`
`Зависимость: Sprint 17`

## Goal

Создать общий contract «что делать и как доказать исправление» для всех modes.

## Why

Finding без проверяемого remediation оставляет DTEK наблюдателем, а не
платформой снижения цифрового риска.

## Scope

Recommendation templates, Knowledge taxonomy, Remediation instances, owner,
status, verification evidence, links to Finding/Risk/Asset.

## Out Of Scope

Autonomous fixes, exploit instructions, broad article catalog, workflow engine,
AI-generated approved guidance и external ticketing integrations.

## Tasks

| ID | Название | Описание | Зависимости | Ожидаемый результат |
|---|---|---|---|---|
| S18-T001 | Remediation Domain ADR | Разделить recommendation template, action instance и verification | S17 | Stable domain contract |
| S18-T002 | Knowledge Taxonomy | Finding kind, platform, audience, severity, applicability | T001 | Shared content taxonomy |
| S18-T003 | Recommendation Schema | Versioned safe guidance and mappings | T001–T002 | Reusable recommendations |
| S18-T004 | Remediation Workflow | Owner, due date, status, evidence and audit | T003 | Actionable workflow |
| S18-T005 | Verification Contract | Manual/automated recheck result and evidence binding | T003–T004 | Closure proof |
| S18-T006 | Business Compatibility | Связать с текущим Risk workflow без дублирования | T004–T005 | Existing risks reusable |
| S18-T007 | Remediation UI & RBAC | Finding action panel, lifecycle and permissions | T004–T006 | Usable core UX |
| S18-T008 | Safety Tests & Documentation | Content safety, tenant tests, authoring rules | T001–T007 | Auditable foundation |

## Technical Notes

Risk comments/activity переиспользуются где уместно; generic workflow engine не
добавляется. Knowledge content versioned and reviewable.

## Security Requirements

No cross-workspace mappings, destructive-step warnings, safe links, immutable
verification evidence, author/reviewer audit and no secret-bearing content.

## Testing

RBAC, state transitions, concurrent update, stale article, verification reopen,
tenant isolation, accessibility and Risk workflow regression.

## Acceptance Criteria

- Finding открывает релевантную безопасную recommendation.
- Remediation можно назначить, завершить и подтвердить evidence.
- Closing action не удаляет finding history.
- Existing Risk workflow не раздваивается.

## Definition Of Done

T001–T008 complete; tests and quality gates PASS; first reviewed knowledge set
and user documentation exist.

## Documentation

Domain model, authoring policy, Risk/Trust guides, RBAC, Roadmap and Changelog.

## Git

Conventional Commits; schema/UI/content separated; push after Terminal Health Gate.
