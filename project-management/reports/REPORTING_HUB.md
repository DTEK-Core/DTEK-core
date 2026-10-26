---
title: Reporting Hub
type: reports-index
status: active
updated: 2026-10-26
tags:
  - dtek
  - reports
---

# Reporting Hub

## Report Types

| Report | Когда | Template |
|---|---|---|
| Task completion | После каждого Task ID | [[project-management/templates/TASK_TEMPLATE|Task Template]] |
| Sprint report | После Sprint | [[project-management/templates/SPRINT_REPORT_TEMPLATE|Sprint Report]] |
| Weekly startup review | Во время активной разработки | Раздел ниже |
| Security/Release decision | Перед milestone GO/NO-GO | Gate document + evidence matrix |
| Pilot closeout | После pilot | Pilot documentation pack |

## Current Reports

- [[project-management/reports/2026-10-26_OBSIDIAN_CONTROL_CENTER|Obsidian Control Center Setup]]
- [[CHANGELOG|Repository Changelog]]
- [[tasks/archive/README|Historical Sprint Summary]]

## Weekly Startup Review

```markdown
# DTEK Weekly Review — YYYY-MM-DD

## Outcomes
- What changed for users or product evidence?

## Engineering
- Completed / In progress / Blocked
- Quality and security status

## Product
- Interviews, pilot signals, ideas accepted/rejected

## Risks
- New, increased, mitigated

## Metrics
- Only measured values with sources

## Decisions Needed
- Owner decisions

## Next Week
- Maximum three priorities
```

## Reporting Rules

- Не писать `PASS` без фактического прогона.
- Не писать `implemented`, если существует только specification.
- Commit hash и push подтверждаются фактическим exit code.
- Не включать secrets, UUID, client evidence или raw security errors.
