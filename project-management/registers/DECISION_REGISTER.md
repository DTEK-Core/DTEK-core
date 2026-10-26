---
title: Decision Register
type: register
status: active
updated: 2026-10-26
tags:
  - dtek
  - decisions
---

# Decision Register

Архитектурные решения подробно хранятся в [[ARCHITECTURE_DECISIONS]]. Здесь
находится управленческий обзор и product decisions, которые ещё не требуют ADR.

## Architecture Decisions

| ID | Решение | Status |
|---|---|---|
| ADR-001 | Weighted multi-factor Business Trust Score | Approved |
| ADR-002 | Configurator: onboarding + model settings | Approved |
| ADR-003 | Owner/Analyst/Admin/Viewer roles | Approved |
| ADR-004 | Cloud-first MVP | Approved |
| ADR-005 | Full database design baseline | Approved |
| ADR-006 | Market MVP product boundary | Approved |
| ADR-007 | Evidence-first Trust Platform | Approved |
| ADR-008 | Server-side printable reporting | Approved |
| ADR-009 | Connector adapter/ingestion framework | Approved |
| ADR-010 | DTEK Platform with shared Trust Core | Strategic direction; runtime deferred |

## Product Decisions

| Date | Decision | Rationale | Revisit |
|---|---|---|---|
| 2026-08-23 | Keep CSV/XLSX; defer first connector | Нет pilot admission evidence | После source cards |
| 2026-10-24 | Expand through Business/Home/Personal, not rewrite | Reuse current Trust Core | At each phase gate |
| 2026-10-26 | Use repository as Obsidian Vault | One source of truth with Git | If team collaboration outgrows local workflow |

## New Decision Workflow

1. Создать заметку из [[project-management/templates/DECISION_TEMPLATE|Decision Template]].
2. Собрать context, alternatives, security and migration consequences.
3. Владелец принимает решение.
4. Если затрагивается architecture/security/public contract — создать ADR.
5. Добавить строку в этот register и связать Roadmap/Sprint.
