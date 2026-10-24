# SPRINT 25 — Home Workspace & Privacy Foundation

`Статус: PLANNED / NOT STARTED`
`Milestone: Home MVP`
`Зависимость: Business MVP GO + Sprint 16 workspace foundation`

## Goal

Добавить изолированный Home workspace, безопасный onboarding и manual household
inventory до автоматического discovery.

## Why

Home data нельзя хранить как фиктивную organization; нужны отдельные policy,
roles, consent и понятный consumer UX.

## Scope

Home workspace policy, owner/household membership, privacy settings, network
scope intent, manual router/device inventory and Home dashboard empty states.

## Out Of Scope

Network scanning, Home collector, Home Trust Score, native mobile app,
parental monitoring и surveillance features.

## Tasks

| ID | Название | Описание | Зависимости | Ожидаемый результат |
|---|---|---|---|---|
| S25-T001 | Home Product/Threat Review | User journeys, abuse cases and data boundary | S24 | Approved Home MVP scope |
| S25-T002 | Home Workspace Policy | Roles, membership, ownership and isolation | T001 | Mode-specific RBAC |
| S25-T003 | Home Data Model | Network context and device asset specialization | T001–T002 | Minimal Home schema |
| S25-T004 | Consent & Privacy Controls | Purpose, retention, delete/export and withdrawal | T001–T003 | Consumer privacy baseline |
| S25-T005 | Home Onboarding | Create workspace, describe network and router safely | T002–T004 | Guided first run |
| S25-T006 | Manual Device Inventory | Add/edit/archive own devices with clear provenance | T003–T005 | Useful pre-discovery baseline |
| S25-T007 | Home Dashboard Foundation | Empty/manual state and next safe action | T005–T006 | Coherent Home UX |
| S25-T008 | Isolation/Privacy QA | Business/Home separation, mobile and deletion tests | T001–T007 | Home Foundation Ready |

## Technical Notes

Home reuses Asset contract but not Business organization metadata or role names.
Routes and navigation expose mode explicitly.

## Security Requirements

No cross-mode links, least-privilege household role, explicit consent, delete
workflow, sensitive network data minimization and safe support logs.

## Testing

Business/Home memberships, owner transfer constraints, deletion/export,
mobile onboarding, foreign workspace UUID and blocked member cases.

## Acceptance Criteria

User can create a private Home workspace and inventory devices without exposing
them to Business members or starting a scan.

## Definition Of Done

T001–T008 complete; privacy/isolation and regression gates PASS; discovery remains off.

## Documentation

Home privacy notice, user guide, RBAC/RLS, architecture, Roadmap and Changelog.

## Git

Schema/policy, UX and docs separated; push after full checks.
