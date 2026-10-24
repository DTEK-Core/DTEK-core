# SPRINT 28 — Personal Workspace, Consent & Privacy

`Статус: PLANNED / NOT STARTED`
`Milestone: Personal MVP`
`Зависимость: Platform Foundation + privacy/legal review`

## Goal

Создать private Personal workspace и полный lifecycle consent, verified
identifiers, retention, export and deletion до любых exposure queries.

## Why

Personal data и breach/exposure checks резко увеличивают privacy и abuse risk.
UX без governance недопустим.

## Scope

Personal policy, privacy impact assessment, consent grants, identifier
verification, retention/deletion/export, private dashboard and audit.

## Out Of Scope

Breach lookup, username enumeration, public profile search, Personal Score,
notifications and shared family monitoring.

## Tasks

| ID | Название | Описание | Зависимости | Ожидаемый результат |
|---|---|---|---|---|
| S28-T001 | Privacy/Legal Readiness Review | Data categories, purpose, operator duties and pilot jurisdiction | Foundation | GO/NO-GO record |
| S28-T002 | Personal Workspace Policy | Single-owner isolation, support and recovery boundaries | T001 | Private tenant model |
| S28-T003 | Consent Grant Model | Purpose, source, expiry, withdraw and policy version | T001–T002 | Auditable consent |
| S28-T004 | Identifier Verification | Email/domain/username control methods by capability | T003 | Owned identifier boundary |
| S28-T005 | Retention & Deletion | TTL, deletion queue, backups, export and exceptions | T001–T004 | Data lifecycle |
| S28-T006 | Personal Privacy UX | Create workspace, consent center, identifiers and deletion | T002–T005 | Transparent user control |
| S28-T007 | Abuse/Isolation Tests | Foreign identifier, cross-mode, support and deletion cases | T003–T006 | Privacy evidence |
| S28-T008 | Personal Foundation Documentation | Privacy notice, runbook, DSR and limitations | T001–T007 | Personal-ready baseline |

## Technical Notes

No exposure provider is called in this Sprint. Verification tokens are
single-purpose, expiring and never used as identity secrets elsewhere.

## Security Requirements

Encryption/keyed hashing where possible, strict support access, audit without
raw identifiers, rate limits, deletion verification and no cross-workspace joins.

## Testing

Consent withdrawal, expired verification, identifier takeover, export/delete,
backup retention, support role and Personal/Business/Home isolation.

## Acceptance Criteria

Unverified identifier cannot trigger enrichment; user can inspect and withdraw
consent and request deletion; Personal data is inaccessible to other modes.

## Definition Of Done

T001–T008 complete with explicit privacy GO; no scanner/provider calls shipped.

## Documentation

Privacy impact assessment, consent policy, user privacy guide, security and Roadmap.

## Git

Privacy-sensitive commits require dedicated review; push only after gates.
