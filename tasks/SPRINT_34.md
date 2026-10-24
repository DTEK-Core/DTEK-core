# SPRINT 34 — Unified Platform Experience & Governance

`Статус: PLANNED / NOT STARTED`
`Milestone: Platform MVP`
`Зависимость: Sprint 33`

## Goal

Собрать Business, Home, Personal и Knowledge в единый понятный продукт без
смешивания данных, ролей и terminology.

## Why

Общее ядро должно ощущаться единой платформой, но mode context обязан быть
очевидным и безопасным.

## Scope

Workspace switcher/navigation, mode dashboards, account/privacy center, shared
search boundaries, audit/support model, accessibility, responsive consistency.

## Out Of Scope

Cross-workspace data aggregation, unified public score, billing redesign,
native apps, custom themes and enterprise role builder.

## Tasks

| ID | Название | Описание | Зависимости | Ожидаемый результат |
|---|---|---|---|---|
| S34-T001 | Information Architecture Review | Mode boundaries, naming and navigation | S33 | Approved platform IA |
| S34-T002 | Workspace Switcher Finalization | Clear context, safe deep links and recovery | T001 | Reliable mode switching |
| S34-T003 | Mode Dashboard Alignment | Shared patterns with mode-specific metrics | T001–T002 | Coherent overview |
| S34-T004 | Account & Privacy Center | Memberships, consent, export/delete and collectors | T002 | Unified control surface |
| S34-T005 | Search & Link Boundaries | Tenant-safe mode-local search/deep links | T001–T004 | No context leakage |
| S34-T006 | Support & Audit Governance | Privileged support, audit views and escalation | T004–T005 | Operable governance |
| S34-T007 | Accessibility/Mobile Polish | Keyboard, screen reader, responsive and reduced motion | T002–T006 | Professional UX |
| S34-T008 | Cross-mode Regression | Business/Home/Personal/Knowledge authenticated matrix | T001–T007 | Platform RC baseline |

## Technical Notes

Shared components do not imply shared data queries. Every route derives active
workspace server-side and presents a visible mode label.

## Security Requirements

No cross-workspace search, safe return URLs, support least privilege, privacy
controls and complete audit for context changes.

## Testing

Deep links after switch, stale tabs, concurrent sessions, keyboard/mobile,
support role, deletion, blocked membership and cross-mode UUIDs.

## Acceptance Criteria

Mode is always visible; switch cannot leak prior data; all key journeys are
usable on desktop/mobile and accessible.

## Definition Of Done

T001–T008 complete; authenticated cross-mode regression and accessibility gates PASS.

## Documentation

Platform workflow, navigation, privacy/account, support, design and Roadmap.

## Git

Scoped UX commits with visual regression evidence; push after checks.
