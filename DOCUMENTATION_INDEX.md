# DOCUMENTATION_INDEX.md — DTEK Platform / DTEK Core

`Статус: актуальный`  
`Дата: 26.10.2026`

Единая карта источников истины. Статусы возможностей всегда проверять по коду,
миграциям и этому разделению:

- **IMPLEMENTED** — DTEK Business foundation Sprint 01–15;
- **CURRENT** — Security & Stabilization Gate, prepared/not started;
- **PLANNED** — Sprint 16–35 и DTEK Platform evolution;
- **FUTURE** — capabilities вне первого Platform MVP.

---

## 1. Быстрый Маршрут

1. [README.md](README.md) — продукт, текущая стадия и запуск.
2. [DTEK Platform Vision](docs/product/DTEK_PLATFORM_VISION.md) — единая новая концепция.
3. [Architecture Decisions](ARCHITECTURE_DECISIONS.md) — ADR-001–010.
4. [Current System Architecture](docs/architecture/System_Architecture.md) — фактический Next.js/Supabase MVP.
5. [Target Platform Architecture](docs/architecture/DTEK_PLATFORM_ARCHITECTURE.md) — план расширения Trust Core.
6. [Gap Analysis](docs/architecture/DTEK_PLATFORM_GAP_ANALYSIS.md) — reuse/extension/new matrix.
7. [Platform Security Principles](docs/security/DTEK_PLATFORM_SECURITY_PRINCIPLES.md) — новые security/privacy boundaries.
8. [Roadmap](docs/roadmap/ROADMAP.md) и [Sprint Roadmap](docs/roadmap/SPRINT_ROADMAP.md).
9. [Security & Stabilization Gate](tasks/SECURITY_STABILIZATION_GATE.md) — следующий blocking stage.
10. [AI Development Guide](AI_DEVELOPMENT_GUIDE.md) и [AGENTS.md](AGENTS.md).
11. Obsidian Project Control Center в `/Users/a000/Documents/Courses/50 — Проекты/DTEK Core.md` — оперативное управление, доски, реестры и отчёты.

---

## 2. Root Sources

| Документ | Назначение |
|---|---|
| [README.md](README.md) | Статус, реализованные routes, запуск и handoff |
| [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) | Приоритетный реестр ADR-001–010 |
| [AGENTS.md](AGENTS.md) | Постоянный контекст Codex |
| [AI_DEVELOPMENT_GUIDE.md](AI_DEVELOPMENT_GUIDE.md) | Инженерный workflow |
| [CHANGELOG.md](CHANGELOG.md) | История изменений |
| [CLAUDE.md](CLAUDE.md) | Legacy workflow reference |

---

## 3. Product

| Документ | Статус / назначение |
|---|---|
| [DTEK_PLATFORM_VISION.md](docs/product/DTEK_PLATFORM_VISION.md) | PLANNED product evolution: Business/Home/Personal/Exposure/Knowledge |
| [Vision.md](docs/product/Vision.md) | Краткое долгосрочное видение |
| [PRODUCT_STRATEGY.md](docs/product/PRODUCT_STRATEGY.md) | Позиционирование, ICP и product boundaries |
| [Product_Concept.md](docs/product/Product_Concept.md) | Текущие и planned domain concepts |
| [MVP_Scope.md](docs/product/MVP_Scope.md) | Business и Platform MVP boundaries |
| [EVIDENCE_FIRST_STRATEGY.md](docs/product/EVIDENCE_FIRST_STRATEGY.md) | ADR-007 evidence-first foundation |
| [User_Stories.md](docs/product/User_Stories.md) | Исторические Business user stories |
| [PRD_Core_Modules.md](docs/product/PRD_Core_Modules.md) | Реализованное Business ядро |
| [RUSSIAN_MARKET_CONNECTOR_SHORTLIST.md](docs/product/RUSSIAN_MARKET_CONNECTOR_SHORTLIST.md) | Research shortlist, не runtime commitment |
| [FIRST_CONNECTOR_CANDIDATE_DECISION.md](docs/product/FIRST_CONNECTOR_CANDIDATE_DECISION.md) | `DEFER / KEEP CSV-XLSX IMPORT PATH` |
| [PILOT_OFFER.md](docs/product/PILOT_OFFER.md) | Business pilot offer |
| [PILOT_METRICS_FEEDBACK_LOOP.md](docs/product/PILOT_METRICS_FEEDBACK_LOOP.md) | Pilot evidence protocol |

---

## 4. Architecture

| Документ | Назначение |
|---|---|
| [System_Architecture.md](docs/architecture/System_Architecture.md) | CURRENT architecture |
| [DTEK_PLATFORM_ARCHITECTURE.md](docs/architecture/DTEK_PLATFORM_ARCHITECTURE.md) | PLANNED shared Trust Core и Workspace evolution |
| [DTEK_PLATFORM_GAP_ANALYSIS.md](docs/architecture/DTEK_PLATFORM_GAP_ANALYSIS.md) | Capability gap matrix |
| [Evidence_First_Architecture.md](docs/architecture/Evidence_First_Architecture.md) | Target ingestion/discovery layers |
| [Connector_Framework_Architecture.md](docs/architecture/Connector_Framework_Architecture.md) | ADR-009 adapter/ingestion contract |
| [Evidence_Layer_Data_Model.md](docs/architecture/Evidence_Layer_Data_Model.md) | SPEC only; production tables absent |
| [Normalization_Identity_Resolution.md](docs/architecture/Normalization_Identity_Resolution.md) | SPEC only |
| [Confidence_Engine_Discovery_Inbox.md](docs/architecture/Confidence_Engine_Discovery_Inbox.md) | SPEC only |
| [Database_Design_Full.md](docs/architecture/Database_Design_Full.md) | Current Business schema baseline |
| [Trust_Score_Model_v2.md](docs/architecture/Trust_Score_Model_v2.md) | Business score source of truth |
| [Evidence_Import_Schema.md](docs/architecture/Evidence_Import_Schema.md) | Implemented CSV/XLSX contract |
| [Evidence_Explainability_Model.md](docs/architecture/Evidence_Explainability_Model.md) | Implemented explainability contract |
| [Risk_Workflow_Data_Model.md](docs/architecture/Risk_Workflow_Data_Model.md) | Implemented pilot risk workflow |
| [TECHNICAL_DEBT.md](docs/architecture/TECHNICAL_DEBT.md) | Known limitations and debt |

---

## 5. Security

| Документ | Назначение |
|---|---|
| [SECURITY_OVERVIEW.md](docs/security/SECURITY_OVERVIEW.md) | Current security architecture and limitations |
| [DTEK_PLATFORM_SECURITY_PRINCIPLES.md](docs/security/DTEK_PLATFORM_SECURITY_PRINCIPLES.md) | Planned workspace/scanning/Home/Personal/Exposure controls |
| [CONNECTOR_SECURITY_MODEL.md](docs/security/CONNECTOR_SECURITY_MODEL.md) | Connector secret, SSRF, audit and tenant gates |
| [RBAC_MODEL.md](docs/security/RBAC_MODEL.md) | Business RBAC |
| [RLS_MODEL.md](docs/security/RLS_MODEL.md) | Business RLS model |
| [THREAT_MODEL.md](docs/security/THREAT_MODEL.md) | Current threat model |
| [SECURE_SDLC.md](docs/security/SECURE_SDLC.md) | Secure development lifecycle |
| [SECURITY_TESTING_PLAN.md](docs/security/SECURITY_TESTING_PLAN.md) | Security test strategy |
| [VULNERABILITY_MANAGEMENT.md](docs/security/VULNERABILITY_MANAGEMENT.md) | Product vulnerability process |

---

## 6. Roadmap And Tasks

| Документ | Статус |
|---|---|
| [tasks/README.md](tasks/README.md) | Current task map |
| [ROADMAP.md](docs/roadmap/ROADMAP.md) | Current milestone roadmap |
| [SPRINT_ROADMAP.md](docs/roadmap/SPRINT_ROADMAP.md) | Gate + Sprint 16–35 sequence |
| [MVP_RELEASE_PLAN.md](tasks/MVP_RELEASE_PLAN.md) | Historical R0–R6 and planned R7–R12 |
| [EPIC_BACKLOG.md](tasks/EPIC_BACKLOG.md) | Historical and Platform epics |
| [FEATURE_BACKLOG.md](tasks/FEATURE_BACKLOG.md) | Historical and Platform capabilities |
| [SECURITY_STABILIZATION_GATE.md](tasks/SECURITY_STABILIZATION_GATE.md) | CURRENT blocking gate, not started |
| [tasks/archive/README.md](tasks/archive/README.md) | Sprint 01–15 archive manifest |

Planned Sprint documents:

| Phase | Documents |
|---|---|
| Platform Foundation | [S16](tasks/SPRINT_16.md), [S17](tasks/SPRINT_17.md), [S18](tasks/SPRINT_18.md), [S19](tasks/SPRINT_19.md) |
| Business Evolution | [S20](tasks/SPRINT_20.md), [S21](tasks/SPRINT_21.md), [S22](tasks/SPRINT_22.md), [S23](tasks/SPRINT_23.md), [S24](tasks/SPRINT_24.md) |
| Home MVP | [S25](tasks/SPRINT_25.md), [S26](tasks/SPRINT_26.md), [S27](tasks/SPRINT_27.md) |
| Personal MVP | [S28](tasks/SPRINT_28.md), [S29](tasks/SPRINT_29.md), [S30](tasks/SPRINT_30.md), [S31](tasks/SPRINT_31.md) |
| Shared Platform | [S32](tasks/SPRINT_32.md), [S33](tasks/SPRINT_33.md), [S34](tasks/SPRINT_34.md) |
| Platform Release | [S35](tasks/SPRINT_35.md) |

Все Sprint 16–35: `PLANNED / NOT STARTED`.

---

## 7. Operations And Testing

| Документ | Назначение |
|---|---|
| [TROUBLESHOOTING.md](docs/development/TROUBLESHOOTING.md) | Environment/Supabase diagnosis |
| [CONNECTOR_FOUNDATION_HANDOFF.md](docs/development/CONNECTOR_FOUNDATION_HANDOFF.md) | Runtime admission and implementation sequence |
| [PILOT_READINESS_CHECKLIST.md](docs/testing/PILOT_READINESS_CHECKLIST.md) | Existing Business release gate evidence |
| [EXPLAINABILITY_QA_CHECKLIST.md](docs/testing/EXPLAINABILITY_QA_CHECKLIST.md) | Sprint 12 authenticated manual QA |
| [RISK_WORKFLOW_QA_CHECKLIST.md](docs/testing/RISK_WORKFLOW_QA_CHECKLIST.md) | Sprint 13 authenticated manual QA |
| [PILOT_SMOKE_TEST_CHECKLIST.md](docs/testing/PILOT_SMOKE_TEST_CHECKLIST.md) | Automated/public and authenticated smoke scopes |
| [BACKUP_RESTORE_RUNBOOK.md](docs/operations/BACKUP_RESTORE_RUNBOOK.md) | Backup and restore procedure |
| [MONITORING_ERROR_HANDLING_PLAN.md](docs/operations/MONITORING_ERROR_HANDLING_PLAN.md) | Monitoring and incident triage |
| [PILOT_DOCUMENTATION_PACK.md](docs/pilot/PILOT_DOCUMENTATION_PACK.md) | Business pilot handoff |

---

## 8. User And Learning Docs

| Документ | Назначение |
|---|---|
| [USER_GUIDE.md](docs/user/USER_GUIDE.md) | Current Business user guide |
| [PLATFORM_WORKFLOW.md](docs/user/PLATFORM_WORKFLOW.md) | Current Business workflow |
| [TRUST_SCORE_GUIDE.md](docs/user/TRUST_SCORE_GUIDE.md) | Business score/explainability |
| [RISK_REGISTRY_GUIDE.md](docs/user/RISK_REGISTRY_GUIDE.md) | Risk workflow |
| [IMPORT_GUIDE.md](docs/user/IMPORT_GUIDE.md) | CSV/XLSX onboarding |
| [REPORTS_AND_EXPORT_GUIDE.md](docs/user/REPORTS_AND_EXPORT_GUIDE.md) | Reporting/export |
| [diploma/README.md](diploma/README.md) | Учебный маршрут автора; может отражать pre-Platform snapshot |

---

## 9. Archive Policy

- `tasks/archive/` хранит неизменяемую Sprint 01–15 history.
- `docs/archive/` хранит superseded/reference документы.
- Старый unchecked checklist не доказывает текущий fail или pass.
- Архив не заменяет ADR, код, migrations, активный Gate или current Roadmap.

---

## 10. Project Management / Obsidian

| Документ | Назначение |
|---|---|
| `00_START_HERE.md` | Главная страница Project Control Center |
| `01_EXECUTIVE_DASHBOARD.md` | Стадия, blockers, milestones и health |
| `05_SPRINT_CATALOG.md` | Sprint 01–35 и активный Gate |
| `boards/DEVELOPMENT_BOARD.md` | Kanban разработки |
| `boards/IDEAS_AND_RESEARCH.md` | Идеи, исследования и parked scope |
| `boards/BUGS_AND_QA.md` | Дефекты и manual QA gates |
| `boards/RISKS_AND_BLOCKERS.md` | Security/product/platform risks |
| `boards/DESIGN_BOARD.md` | Design/Figma workflow и approved scope |
| `registers/DECISION_REGISTER.md` | ADR и product decisions |
| `registers/METRICS_REGISTER.md` | Product, engineering и guardrail metrics |
| `registers/PILOT_AND_CUSTOMER_REGISTER.md` | Safe pilot pipeline, interview и connector demand evidence |
| `09_DESIGN_AND_UX.md` | Design sources, UX principles и workflow |
| `10_GO_TO_MARKET.md` | First commercial wedge и pilot funnel |
| `reports/REPORTING_HUB.md` | Task/Sprint/weekly reports |
| `OBSIDIAN_SETUP.md` | Открытие Vault и рекомендуемые плагины |

Все пути в таблице относятся к внешнему каталогу
`/Users/a000/Documents/Courses/50 — Проекты/DTEK Core/`. Он является
оперативным слоем, а архитектурные и технические источники истины остаются в
ADR, Sprint, коде, migrations и tests этого репозитория.
