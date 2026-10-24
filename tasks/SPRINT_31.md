# SPRINT 31 — Safe Public Intelligence Toolkit

`Статус: PLANNED / NOT STARTED`
`Milestone: Personal MVP`
`Зависимость: Sprint 30`

## Goal

Добавить ограниченный defensive toolkit для собственных domains, URLs, hashes,
verified usernames и local metadata inspection.

## Why

Публичная intelligence полезна как evidence source, но легко превращается в
SSRF, enumeration или doxxing без capability-specific controls.

## Scope

Domain ownership, DNS/domain posture, URL/hash reputation providers,
verified-username self footprint, local-first file/image metadata and reports.

## Out Of Scope

People search, phone/address lookup, face recognition, reverse-image people
search, scraping private profiles, bulk username enumeration and malware detonation.

## Tasks

| ID | Название | Описание | Зависимости | Ожидаемый результат |
|---|---|---|---|---|
| S31-T001 | Capability Threat/Legal Review | Separate scope and abuse model per tool | S30 | Allowed capability list |
| S31-T002 | Domain Ownership & DNS Evidence | Verify control before deeper domain checks | T001 | Authorized domain intelligence |
| S31-T003 | URL Reputation | Safe provider lookup without arbitrary server fetch | T001 | URL findings |
| S31-T004 | Hash Reputation | Hash-only provider contract and safe results | T001 | File reputation evidence |
| S31-T005 | Verified Username Footprint | Self-verified bounded provider matches only | T001 | Limited footprint evidence |
| S31-T006 | Local Metadata Inspection | Client/local parse preferred; strip before upload | T001 | Privacy-safe metadata report |
| S31-T007 | Abuse/SSRF/Resource Tests | Redirect, DNS, enumeration, file bomb and limits | T002–T006 | Security evidence |
| S31-T008 | Toolkit UX & Documentation | Unified report, limitations, consent and delete | T001–T007 | Personal MVP complete |

## Technical Notes

Each capability has a separate provider/policy. User-supplied URL is not fetched
by the app unless an approved fetch boundary explicitly permits it.

## Security Requirements

Ownership verification, strict protocols/destinations, file size/type limits,
client-side parsing where possible, no relationship inference and full audit.

## Testing

SSRF/DNS rebinding, redirects, unicode domains, zip/image bombs, provider abuse,
foreign usernames, deletion and mobile UX.

## Acceptance Criteria

Toolkit cannot query arbitrary people or internal destinations; every result is
evidence-backed, scoped and private.

## Definition Of Done

T001–T008 and Personal MVP security/privacy gates PASS; unsafe capabilities remain absent.

## Documentation

Capability policies, provider decisions, user safety guide, privacy and Roadmap.

## Git

Each provider/capability isolated in reviewable commit; push after adversarial tests.
