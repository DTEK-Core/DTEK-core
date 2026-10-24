# SPRINT 21 — Business Source Admission & Infrastructure Discovery

`Статус: PLANNED / NOT STARTED`
`Milestone: Business MVP`
`Зависимость: Sprint 20 + подтверждённые pilot source signals`

## Goal

Подключить один подтверждённый read-only Business source и автоматически
сформировать reviewable infrastructure inventory.

## Why

Первый connector должен следовать реальному customer demand, documented API и
test environment, а не desk ranking.

## Scope

Reopen S15-T007 admission, один source adapter, asset observations, identity
resolution, freshness, Discovery Inbox и inventory coverage.

## Out Of Scope

Несколько connectors, write-back, arbitrary network scan, vulnerability
scanning, SIEM ingestion at scale и automatic destructive merge.

## Tasks

| ID | Название | Описание | Зависимости | Ожидаемый результат |
|---|---|---|---|---|
| S21-T001 | Source Admission Decision | Source cards, demand, API, deployment, owner and test access | S20 | GO/DEFER record |
| S21-T002 | Source Data Contract | Stable identifiers, pagination, permissions and limits | T001 GO | Mapping specification |
| S21-T003 | Read-only Adapter | Implement selected allowlisted connector | T002 | Bounded evidence ingestion |
| S21-T004 | Asset Reconciliation | Map records to candidates and resolve safe identities | T003 | Reviewable inventory |
| S21-T005 | Freshness & Coverage | Last seen, missing/tombstone and source coverage | T003–T004 | Trustworthy current state |
| S21-T006 | Installation & Inventory UX | Connection health, sync and Discovery Inbox context | T003–T005 | Operable user workflow |
| S21-T007 | Security/Contract Tests | SSRF, secrets, hostile source, retries and two tenants | T003–T006 | Admission evidence |
| S21-T008 | Connector Runbook & Docs | Setup, least privilege, recovery and limitations | T001–T007 | Supportable connector |

## Technical Notes

Если T001 = `DEFER`, Sprint не подменяет evidence и не выбирает source. File
adapter остаётся supported path, а дальнейшие connector tasks блокируются.

## Security Requirements

Read-only least privilege, allowlisted endpoints, opaque secret, tenant-fixed
installation, bounded pages/runs and safe error redaction.

## Testing

Vendor sandbox/fixture, pagination, deletion/freshness, collision, revoked
credentials, network failure and two-tenant isolation.

## Acceptance Criteria

Один admitted source создаёт evidence-backed asset candidates; ambiguous records
остаются в Inbox; manual data сохраняет authority.

## Definition Of Done

GO connector полностью принят либо формально зафиксирован DEFER; никакого
частичного production connection без tests/runbook.

## Documentation

Decision record, connector setup, source mapping, security and Roadmap.

## Git

Conventional Commits; vendor adapter отдельно от framework; push after gates.
