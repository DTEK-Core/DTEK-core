---
kanban-plugin: board
title: Risks and Blockers
type: kanban
status: active
updated: 2026-10-26
tags:
  - dtek
  - risks
  - blockers
---

# Risks & Blockers

## Critical

- [ ] Profile privilege escalation — SEC-01
- [ ] Blocked user retains effective access — SEC-02
- [ ] Cross-tenant Object/Risk relation — SEC-03
- [ ] Cross-tenant Trust Graph relation — SEC-04

## High

- [ ] Non-atomic organization creation — STAB-01
- [ ] Non-atomic invitation acceptance — STAB-02
- [ ] Placeholder Supabase database types — STAB-03
- [ ] Missing DB-level RLS integration suite — STAB-04
- [ ] Authenticated role QA pending — STAB-05

## Product Risks

- [ ] Roadmap охватывает несколько product modes; проверять гипотезы по phase gates
- [ ] Trust Score может восприниматься как абсолютная гарантия безопасности
- [ ] Home/Personal retention нельзя строить на fear-based notifications
- [ ] Knowledge content требует review, versioning и verification safety

## Platform Security Risks

- [ ] Scanning: SSRF, command injection, resource exhaustion, unauthorized scope
- [ ] Home: household privacy, local network overreach, collector compromise
- [ ] Personal: consent, PII/breach leakage, deletion and retention
- [ ] Exposure: doxxing, enumeration, provider abuse and false attribution
- [ ] Agents: credential theft, update channel and remote execution risk

## Monitoring

- [ ] Supabase project availability and pause risk
- [ ] Google Fonts dependency can make clean builds network-sensitive
- [ ] External provider cost/availability and data residency
- [ ] Documentation/status drift between operational board and source Sprint

## Mitigated / Accepted

- [x] Historical Sprint preserved without rewriting in `tasks/archive/`
- [x] Planned capabilities clearly separated from implemented runtime
- [x] Obsidian cockpit links to source documents instead of copying them

%% kanban:settings
{"kanban-plugin":"board","list-collapse":[false,false,false,false,false]}
%%
