# SPRINT 32 — Knowledge & Remediation Center

`Статус: PLANNED / NOT STARTED`
`Milestone: Shared Platform`
`Зависимость: Business/Home/Personal finding catalogs`

## Goal

Превратить Sprint 18 Knowledge Core в полноценный cross-mode Remediation Center.

## Why

Пользователь должен понимать проблему и безопасно исправлять её, а не получать
только severity и общий совет.

## Scope

Reviewed articles, finding mappings, mode/platform applicability, remediation
steps, verification, rollback, search/filter and content governance.

## Out Of Scope

Exploit tutorials, autonomous changes, unreviewed generated content, full GRC
policy management and vendor certification.

## Tasks

| ID | Название | Описание | Зависимости | Ожидаемый результат |
|---|---|---|---|---|
| S32-T001 | Content Governance | Author/reviewer/version/stale/retire contract | S18 | Safe publishing lifecycle |
| S32-T002 | Knowledge Schema Extension | Applicability, prerequisites, rollback and verification | T001 | Complete article model |
| S32-T003 | Business Content Set | Findings, hardening and verification for admitted scope | T001–T002 | Business guidance |
| S32-T004 | Home Content Set | Router/device/network safe instructions | T001–T002 | Home guidance |
| S32-T005 | Personal Content Set | Accounts, MFA, exposure and privacy actions | T001–T002 | Personal guidance |
| S32-T006 | Knowledge Center UX | Search, filters, finding context and progress | T002–T005 | Shared user experience |
| S32-T007 | Content Safety/Accessibility QA | Destructive steps, links, stale content and mobile | T003–T006 | Reviewed catalog |
| S32-T008 | Editorial Runbook | Contribution, review, emergency correction and metrics | T001–T007 | Maintainable center |

## Technical Notes

Content is data with review/versioning, not code execution. Recommendations map
to articles but retain mode-specific language and prerequisites.

## Security Requirements

Sanitized content, allowlisted links, no secrets, warnings/rollback for risky
steps, author audit and no automatic publish from AI/provider text.

## Testing

Mapping correctness, permissions, XSS/link safety, version fallback, stale
article state, accessibility and search performance.

## Acceptance Criteria

Each pilot finding class has reviewed explanation, remediation and verification;
unsafe/stale content is clearly blocked or labeled.

## Definition Of Done

T001–T008 complete; reviewed minimum catalog and editorial operations ready.

## Documentation

Editorial policy, contributor guide, user guide, security and Roadmap.

## Git

Schema/UX and reviewed content commits separated; push after content QA.
