# SPRINT 23 — Dependency, Exposure Path & Resilience Analysis

`Статус: PLANNED / NOT STARTED`
`Milestone: Business MVP`
`Зависимость: Sprint 22`

## Goal

Использовать Trust Graph для объяснимого анализа dependencies, dangerous paths,
single points of failure и bounded cascade scenarios.

## Why

Это связывает кибербезопасность и техническую устойчивость, не превращая DTEK
в generic monitoring или architecture tool.

## Scope

Typed/provenanced relations, critical service context, redundancy hints,
exposure paths, SPOF and bounded impact scenarios with assumptions.

## Out Of Scope

Полный digital-twin simulator, live packet analysis, causal certainty,
unbounded graph traversal и automatic architecture changes.

## Tasks

| ID | Название | Описание | Зависимости | Ожидаемый результат |
|---|---|---|---|---|
| S23-T001 | Graph Analysis Contract | Relation semantics, evidence and bounded algorithms | S22 | Versioned analysis rules |
| S23-T002 | Critical Service Context | Link assets to services/criticality and ownership | T001 | Business impact context |
| S23-T003 | SPOF & Redundancy Hints | Detect evidence-backed single dependency patterns | T001–T002 | Resilience findings |
| S23-T004 | Exposure Path Analysis | Bounded path from exposure to critical assets | T001–T002 | Explainable attack surface path |
| S23-T005 | Cascade Scenario | What-if deactivation/compromise with explicit assumptions | T002–T004 | Impact hints, not predictions |
| S23-T006 | Priority Model | Combine severity, criticality, reach and confidence | T003–T005 | Ranked action candidates |
| S23-T007 | Graph/Impact UX | Path highlighting, assumptions and remediation entry | T003–T006 | Usable analysis surface |
| S23-T008 | Scale & Correctness Tests | Limits, cycles, stale edges, false positives | T001–T007 | Safe pilot baseline |

## Technical Notes

Algorithms run with depth/node/time limits and cache only tenant-scoped derived
results. Absence of evidence never proves redundancy absence without caveat.

## Security Requirements

No cross-workspace traversal, graph query budgets, redacted topology exports,
source confidence and safe errors.

## Testing

Cycles, disconnected graphs, 500+ nodes, stale relations, cross-tenant UUID,
multiple paths and deterministic ranking fixtures.

## Acceptance Criteria

Analysis shows evidence and assumptions; bounded queries cannot exhaust server;
manual relations remain distinguishable from discovered ones.

## Definition Of Done

T001–T008 complete; correctness/performance/security gates PASS; no claim of
causal prediction without evidence.

## Documentation

Trust Graph model, algorithms, user guide, limitations, Roadmap and Changelog.

## Git

Conventional Commits by model/engine/UI/tests/docs; push after checks.
