# SPRINT 33 — Continuous Trust, History & Notifications

`Статус: PLANNED / NOT STARTED`
`Milestone: Shared Platform`
`Зависимость: Sprint 32`

## Goal

Показывать meaningful change across modes и возвращать пользователя через
полезные summaries, а не искусственную геймификацию.

## Why

Trust имеет ценность во времени: новые devices/exposures, stale evidence и
verified remediation важнее разовой проверки.

## Scope

Shared change events, drift, score explanation history, notification
preferences, in-app inbox, weekly summary and provider decision.

## Out Of Scope

High-volume SIEM alerts, social engagement, public streaks, push/mobile app and
unbounded realtime streams.

## Tasks

| ID | Название | Описание | Зависимости | Ожидаемый результат |
|---|---|---|---|---|
| S33-T001 | Change Event Contract | Meaningful event types, source and dedupe | S32 | Shared history model |
| S33-T002 | Drift Detection | Asset/identity/finding/relation freshness changes | T001 | Explainable drift |
| S33-T003 | Score Change Explanation | Link score delta to accepted evidence events | T001–T002 | Trust timeline |
| S33-T004 | Notification Preferences | Mode, severity, channel, quiet hours and consent | T001 | User-controlled delivery |
| S33-T005 | In-app Inbox | Deduplicated actionable notifications | T002–T004 | Safe current feed |
| S33-T006 | Weekly Security Summary | Changes, progress, actions and coverage | T002–T005 | Useful retention loop |
| S33-T007 | Delivery Provider Decision | Email/push admission, privacy and retry | T004–T006 | Approved channel or in-app only |
| S33-T008 | Load/Privacy/QA | Fan-out, dedupe, unsubscribe, deletion and mobile | T001–T007 | Continuous Trust Ready |

## Technical Notes

Notification is derived from durable event and stores minimal recipient data.
Provider failure never blocks core workflow.

## Security Requirements

No sensitive payload in subject/push, per-user consent, unsubscribe, rate/fanout
limits, tenant isolation and safe provider logs.

## Testing

Duplicate events, delayed source, quiet hours, revoked consent, provider outage,
large workspace, Personal deletion and cross-mode routing.

## Acceptance Criteria

User receives only authorized meaningful changes; every notification links to a
tenant-safe action and can be disabled.

## Definition Of Done

T001–T008 complete; retention loop, privacy and load gates PASS.

## Documentation

Event catalog, notification/privacy guide, operations and Roadmap.

## Git

Event model, UX/provider and docs separated; push after checks.
