# SPRINT 29 — Personal Trust Passport & Score

`Статус: PLANNED / NOT STARTED`
`Milestone: Personal MVP`
`Зависимость: Sprint 28`

## Goal

Дать пользователю приватную модель собственных identities, accounts and devices
с Personal Trust Passport и versioned Personal Trust Score.

## Why

Exposure result должен быть частью устойчивой trust model, а не одноразовым
поисковым экраном.

## Scope

Identity/account/device entities, Personal Passport, score factors, coverage,
private graph, manual security controls and recommendations.

## Out Of Scope

Breach/public-source calls, password storage, social graph, credit scoring,
behavioral surveillance and comparison between users.

## Tasks

| ID | Название | Описание | Зависимости | Ожидаемый результат |
|---|---|---|---|---|
| S29-T001 | Personal Trust Model ADR | Factors, evidence coverage, neutral state and ethics | S28 | Versioned score contract |
| S29-T002 | Identity/Account Model | Verified identities and account security attributes | T001 | Personal subjects |
| S29-T003 | Personal Device Links | Link owned devices without importing Home topology | T001–T002 | Device context |
| S29-T004 | Personal Trust Passport | Factors, evidence, history and recommendations | T001–T003 | User-facing passport |
| S29-T005 | Personal Trust Score | Explainable aggregation with confidence/coverage | T001–T004 | Private score |
| S29-T006 | Personal Trust Graph | Identity/account/device relations, private by default | T002–T005 | Explainable relationships |
| S29-T007 | Baseline Recommendations | MFA, recovery, updates and account hygiene | T004–T006 | Immediate safe value |
| S29-T008 | Ethics/Privacy/QA | Bias, incomplete data, deletion and mobile testing | T001–T007 | Passport-ready decision |

## Technical Notes

Score is a personal security aid, not identity worth, creditworthiness or public
rating. Missing data lowers coverage, not personal reputation.

## Security Requirements

Private-by-default, no public score, no third-party ranking, verified ownership,
data minimization and deletion propagation.

## Testing

Partial evidence, multiple identifiers, unlink/delete, score explanation,
cross-mode links, accessibility and mobile privacy states.

## Acceptance Criteria

User sees why score changed, what evidence exists and what is missing; no secret
or unrelated-person data is displayed.

## Definition Of Done

T001–T008 complete; model, privacy and quality gates PASS; documentation explicit.

## Documentation

Personal Trust model, ethics statement, user guide, privacy and Roadmap.

## Git

Conventional Commits by model/entities/UI/tests/docs; push after review.
