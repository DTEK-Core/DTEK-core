# SPRINT 26 — Paired Home Collector & Device Discovery

`Статус: PLANNED / NOT STARTED`
`Milestone: Home MVP`
`Зависимость: Sprint 25 + Sprint 19 execution GO`

## Goal

Реализовать минимальный paired local collector для bounded discovery устройств
в собственной домашней сети пользователя.

## Why

Cloud service не видит private LAN и не должен сканировать произвольные цели.
Локальный collector создаёт доказуемый scope и безопасный канал наблюдений.

## Scope

Collector ADR/threat model, pairing, signed pull jobs, local network scope,
passive/bounded discovery, device fingerprint candidates and unknown-device UX.

## Out Of Scope

Continuous agent, remote shell, packet capture upload, exploit scanning,
firmware updates, native mobile app и arbitrary plugins.

## Tasks

| ID | Название | Описание | Зависимости | Ожидаемый результат |
|---|---|---|---|---|
| S26-T001 | Collector ADR & Threat Model | Runtime, transport, update and compromise scenarios | S25/S19 | GO/NO-GO architecture |
| S26-T002 | Pairing & Device Identity | Short-lived pairing, rotation, revoke and attestation baseline | T001 | Trusted collector identity |
| S26-T003 | Scoped Job Protocol | Signed pull jobs, expiry, replay protection and cancellation | T001–T002 | Safe control channel |
| S26-T004 | Local Discovery Checks | Allowlisted low-impact checks within confirmed subnet | T003 | Bounded observations |
| S26-T005 | Device Fingerprinting | Normalize MAC/vendor/hostname/service hints conservatively | T004 | Device candidates |
| S26-T006 | Unknown Device Workflow | Review, label, ignore and alert without auto-ownership claims | T005 | Useful consumer action |
| S26-T007 | Collector Security Tests | Replay, impersonation, scope escape, update and resource tests | T002–T006 | Security evidence |
| S26-T008 | Install/Recovery Documentation | Setup, permissions, revoke, uninstall and diagnostics | T001–T007 | Supportable prototype |

## Technical Notes

Collector sends normalized allowlisted observations. Raw packet captures and
arbitrary command output are not part of Home MVP.

## Security Requirements

No inbound home port, least privilege, signed jobs/updates, local scope check,
resource caps, encrypted transport, revoke and redacted logs.

## Testing

Multiple subnets, IPv4/IPv6, offline/replayed jobs, forged collector, scope
escape, hostile service banners, resource exhaustion and Home isolation.

## Acceptance Criteria

Paired collector discovers devices only in approved scope; cloud cannot issue
arbitrary commands; revoke immediately blocks future jobs.

## Definition Of Done

T001–T008 complete with security review; collector remains limited prototype.

## Documentation

Collector threat model, protocol, install guide, privacy notice and Roadmap.

## Git

Collector repository/package decision follows ADR; commits and release artifacts signed.
