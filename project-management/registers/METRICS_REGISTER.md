---
title: Metrics Register
type: register
status: active
updated: 2026-10-26
tags:
  - dtek
  - metrics
---

# Metrics Register

Пустое поле означает отсутствие измеренного evidence, а не нулевой результат.

## Product Validation

| Metric | Target | Current | Source |
|---|---:|---:|---|
| Qualified CISO interviews | 5+ | Pending | Interview records |
| Organizations willing to pilot | 1–3 | Pending | Pilot pipeline |
| Time to first value | <= 1 workday | Pending | Pilot events |
| Imported assets per pilot | 50–200 | Pending | Product data |
| Imported risks per pilot | 20–100 | Pending | Product data |
| Executive report useful | Confirmed by CISO | Pending | Feedback |
| Willingness to pay | Explicit commitment | Pending | Pilot closeout |

## Engineering Health

| Metric | Current baseline | Gate |
|---|---:|---|
| TypeScript errors | 0 | Required |
| ESLint warnings/errors | 0 | Required |
| Contract tests | 45/45 PASS | Maintain |
| Public/protected smoke | 18/18 PASS | Maintain |
| DB RLS integration coverage | Not implemented | Security Gate |
| Authenticated role QA | Pending | Security Gate |
| Critical/High release blockers | Known, unresolved | Must be 0 for GO |

## Platform Metrics By Future Mode

| Mode | Primary value metric | Guardrail |
|---|---|---|
| Business | Findings accepted and remediated | False-positive/review burden |
| Home | Useful device findings resolved | Scan scope/privacy incidents |
| Personal | Verified exposures acted upon | Fear-driven engagement prohibited |
| Knowledge | Remediation verified successfully | Unsafe/outdated guidance rate |

## Update Rule

Метрика обновляется только из named source с датой и environment. Placeholder
или demo data не смешивается с pilot/production evidence.
