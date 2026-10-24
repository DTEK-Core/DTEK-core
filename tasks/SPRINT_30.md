# SPRINT 30 — DTEK Exposure: Breach & Digital Footprint

`Статус: PLANNED / NOT STARTED`
`Milestone: Personal MVP`
`Зависимость: Sprint 29 + approved provider/privacy gate`

## Goal

Добавить privacy-preserving проверку собственных verified identifiers по
допущенным breach/public exposure sources.

## Why

Exposure даёт понятную consumer value, но не должен раскрывать leaked secrets
или превращаться в поиск данных о других людях.

## Scope

Provider admission, minimized lookup, exposure evidence/findings, categories,
history, safe recommendations, rate/cost/abuse controls and private UX.

## Out Of Scope

Raw breach dumps, plaintext passwords, arbitrary email/phone search, bulk
enumeration, dark-web crawling and automatic account actions.

## Tasks

| ID | Название | Описание | Зависимости | Ожидаемый результат |
|---|---|---|---|---|
| S30-T001 | Exposure Provider Decision | Legal/API/security/data-retention review | S29 | Approved source or DEFER |
| S30-T002 | Privacy-preserving Lookup | Verified identifier tokens/hashes and minimal response | T001 GO | Safe provider adapter |
| S30-T003 | Exposure Evidence Model | Category/date/source/confidence without raw secrets | T002 | Durable minimized evidence |
| S30-T004 | Exposure Findings | Severity, affected identity and remediation mapping | T003 | Actionable exposure |
| S30-T005 | Personal Score Integration | Versioned factor impact with freshness/coverage | T003–T004 | Explainable score change |
| S30-T006 | Digital Footprint UX | Private summary, timeline and safe details | T003–T005 | Consumer-facing value |
| S30-T007 | Abuse/Cost Tests | Enumeration, rate, provider outage, replay and spend limits | T002–T006 | Abuse-resistant release |
| S30-T008 | Exposure Documentation & QA | Privacy, provider runbook, deletion and limitations | T001–T007 | Exposure Ready decision |

## Technical Notes

T001 may produce `DEFER`; no fake/demo provider is promoted to production.
Password exposure uses a privacy-preserving provider method or remains absent.

## Security Requirements

Verified ownership, no raw secrets, per-identifier limits, encrypted/keyed
storage, safe audit, provider minimization and deletion/retention enforcement.

## Testing

Foreign identifier, enumeration, provider compromise/error, stale exposure,
deletion, false-positive dispute and cross-workspace cases.

## Acceptance Criteria

Only owner-verified identifiers are queried; result shows categories/actions,
never passwords or breach records; provider failure is safe.

## Definition Of Done

T001–T008 complete or formal DEFER; privacy/security gates and user QA PASS.

## Documentation

Provider decision, privacy notice, Personal guide, abuse runbook and Roadmap.

## Git

Provider adapter and UI isolated; no secrets in fixtures/commits; push after gates.
