# DOCUMENTATION_INDEX.md — DTEK Core

`Статус: актуальный`  
`Дата: 15.07.2026`

Единая карта документации DTEK Core. Начинайте отсюда, если подключаетесь к проекту впервые.

---

## 1. Быстрый Маршрут Для Нового Участника

1. [README.md](README.md) — что такое продукт и как запустить проект.
2. [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) — утверждённые ADR.
3. [docs/product/PRODUCT_STRATEGY.md](docs/product/PRODUCT_STRATEGY.md) — стратегия и позиционирование.
4. [docs/product/EVIDENCE_FIRST_STRATEGY.md](docs/product/EVIDENCE_FIRST_STRATEGY.md) — Evidence-first концепция после ADR-007.
5. [docs/roadmap/ROADMAP.md](docs/roadmap/ROADMAP.md) — дальнейшее развитие.
6. [docs/roadmap/SPRINT_ROADMAP.md](docs/roadmap/SPRINT_ROADMAP.md) — будущая последовательность спринтов.
7. [docs/architecture/System_Architecture.md](docs/architecture/System_Architecture.md) — техническая архитектура MVP.
8. [docs/architecture/Evidence_First_Architecture.md](docs/architecture/Evidence_First_Architecture.md) — Discovery, Connector и Evidence layers.
9. [docs/security/SECURITY_OVERVIEW.md](docs/security/SECURITY_OVERVIEW.md) — модель безопасности.
10. [AI_DEVELOPMENT_GUIDE.md](AI_DEVELOPMENT_GUIDE.md) и [AGENTS.md](AGENTS.md) — правила работы AI/разработчиков.

---

## 2. Корневые Документы

| Документ | Назначение |
|---|---|
| [README.md](README.md) | Краткое описание продукта, запуск, статус, структура |
| [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) | ADR-001–006, высший источник архитектурных решений |
| [AI_DEVELOPMENT_GUIDE.md](AI_DEVELOPMENT_GUIDE.md) | Инженерный регламент для AI-разработки |
| [AGENTS.md](AGENTS.md) | Постоянный контекст Codex/AI-агентов |
| [CLAUDE.md](CLAUDE.md) | Legacy-контекст Claude workflow, сохраняется для совместимости |
| [CHANGELOG.md](CHANGELOG.md) | История изменений |
| [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) | Этот индекс |

---

## 3. Product

| Документ | Назначение |
|---|---|
| [docs/product/PRODUCT_STRATEGY.md](docs/product/PRODUCT_STRATEGY.md) | Источник истины по стратегии, ICP, позиционированию и Market MVP |
| [docs/product/EVIDENCE_FIRST_STRATEGY.md](docs/product/EVIDENCE_FIRST_STRATEGY.md) | Новая Evidence-first стратегия: автоматическое наполнение, evidence, Discovery Inbox и Connector Framework |
| [docs/product/DEMO_NARRATIVE.md](docs/product/DEMO_NARRATIVE.md) | Сценарий демонстрации DTEK Core для CISO и первых интервью |
| [docs/product/DEMO_DATASET_SPEC.md](docs/product/DEMO_DATASET_SPEC.md) | Спецификация demo dataset для демонстрационной организации Sprint 09 |
| [docs/product/DEMO_SEED_PLAN.md](docs/product/DEMO_SEED_PLAN.md) | План безопасного ручного наполнения demo organization без миграций и seed-скриптов |
| [docs/product/ICP_INTERVIEW_SCRIPT.md](docs/product/ICP_INTERVIEW_SCRIPT.md) | ICP и сценарий discovery-интервью для российского рынка ИБ |
| [docs/product/PRODUCT_ONE_PAGER.md](docs/product/PRODUCT_ONE_PAGER.md) | One-pager DTEK Core для CISO: проблема, решение, ценность и pilot offer |
| [docs/product/PILOT_OFFER.md](docs/product/PILOT_OFFER.md) | 14-дневный pilot offer: входные данные, план, результаты и success criteria |
| [docs/product/COPY_ALIGNMENT.md](docs/product/COPY_ALIGNMENT.md) | Выравнивание landing/README copy с Market MVP стратегией |
| [docs/product/SPRINT09_DOCUMENTATION_SYNC.md](docs/product/SPRINT09_DOCUMENTATION_SYNC.md) | Финальная синхронизация документации Sprint 09 |
| [docs/product/Vision.md](docs/product/Vision.md) | Видение и долгосрочная цель |
| [docs/product/Product_Concept.md](docs/product/Product_Concept.md) | Концепция продукта и ключевые сущности |
| [docs/product/MVP_Scope.md](docs/product/MVP_Scope.md) | Границы текущего MVP и Market MVP |
| [docs/product/User_Stories.md](docs/product/User_Stories.md) | Пользовательские истории |
| [docs/product/PRD_Core_Modules.md](docs/product/PRD_Core_Modules.md) | PRD ключевых модулей |
| [docs/product/PRD_Modules.md](docs/product/PRD_Modules.md) | Детализация PRD по модулям |
| [docs/product/Risk_Model.md](docs/product/Risk_Model.md) | Модель рисков |
| [docs/product/Trust_Graph_Model.md](docs/product/Trust_Graph_Model.md) | Модель Trust Graph |
| [docs/product/Trust_Passport_Model.md](docs/product/Trust_Passport_Model.md) | Модель Trust Passport |

---

## 4. Roadmap

| Документ | Назначение |
|---|---|
| [docs/roadmap/ROADMAP.md](docs/roadmap/ROADMAP.md) | Evidence-first дорожная карта от Sprint 09 к Market/Pilot MVP |
| [docs/roadmap/SPRINT_ROADMAP.md](docs/roadmap/SPRINT_ROADMAP.md) | Единый план Sprint 09–15 с учётом ADR-007 |
| [tasks/MVP_RELEASE_PLAN.md](tasks/MVP_RELEASE_PLAN.md) | Исторический release plan R0–R6, дополнен новым Market MVP направлением |
| [tasks/EPIC_BACKLOG.md](tasks/EPIC_BACKLOG.md) | Epic backlog MVP |
| [tasks/FEATURE_BACKLOG.md](tasks/FEATURE_BACKLOG.md) | Feature backlog MVP |

---

## 5. Architecture

| Документ | Назначение |
|---|---|
| [docs/architecture/System_Architecture.md](docs/architecture/System_Architecture.md) | Архитектура Next.js + Supabase Cloud |
| [docs/architecture/Evidence_First_Architecture.md](docs/architecture/Evidence_First_Architecture.md) | Целевая архитектура Discovery Layer, Connector Framework, Evidence Layer и автоматического наполнения |
| [docs/architecture/Reporting_Architecture.md](docs/architecture/Reporting_Architecture.md) | Архитектура отчётов и экспорта Sprint 10 |
| [docs/architecture/Evidence_Import_Schema.md](docs/architecture/Evidence_Import_Schema.md) | Контракт CSV/XLSX импорта объектов и рисков Sprint 11 |
| [docs/architecture/Database_Design_Full.md](docs/architecture/Database_Design_Full.md) | Полная схема БД, индексы, RLS |
| [docs/architecture/Trust_Score_Model_v2.md](docs/architecture/Trust_Score_Model_v2.md) | Формула Trust Score |
| [docs/architecture/Configurator_Concept_Final.md](docs/architecture/Configurator_Concept_Final.md) | Концепция Конфигуратора |
| [docs/architecture/User_Roles.md](docs/architecture/User_Roles.md) | Роли и матрица доступа |
| [docs/architecture/TECHNICAL_DEBT.md](docs/architecture/TECHNICAL_DEBT.md) | Технический долг и архитектурные риски |

---

## 6. Security

| Документ | Назначение |
|---|---|
| [docs/security/SECURITY_OVERVIEW.md](docs/security/SECURITY_OVERVIEW.md) | Обзор безопасности |
| [docs/security/RBAC_MODEL.md](docs/security/RBAC_MODEL.md) | RBAC модель |
| [docs/security/RLS_MODEL.md](docs/security/RLS_MODEL.md) | RLS модель |
| [docs/security/THREAT_MODEL.md](docs/security/THREAT_MODEL.md) | Threat model |
| [docs/security/SECURE_SDLC.md](docs/security/SECURE_SDLC.md) | Secure SDLC |
| [docs/security/SECURITY_REQUIREMENTS.md](docs/security/SECURITY_REQUIREMENTS.md) | Security requirements |
| [docs/security/SECURITY_TESTING_PLAN.md](docs/security/SECURITY_TESTING_PLAN.md) | Security testing plan |
| [docs/security/VULNERABILITY_MANAGEMENT.md](docs/security/VULNERABILITY_MANAGEMENT.md) | Vulnerability management |
| [docs/security/DEPENDENCY_MANAGEMENT.md](docs/security/DEPENDENCY_MANAGEMENT.md) | Dependency management |
| [docs/security/DEPENDENCY_AUDIT_S06.md](docs/security/DEPENDENCY_AUDIT_S06.md) | Historical dependency audit |

---

## 7. User Docs

| Документ | Назначение |
|---|---|
| [docs/user/USER_GUIDE.md](docs/user/USER_GUIDE.md) | Руководство пользователя |
| [docs/user/PLATFORM_WORKFLOW.md](docs/user/PLATFORM_WORKFLOW.md) | Рабочий процесс платформы |
| [docs/user/TRUST_SCORE_GUIDE.md](docs/user/TRUST_SCORE_GUIDE.md) | Trust Score guide |
| [docs/user/OBJECT_MODEL_GUIDE.md](docs/user/OBJECT_MODEL_GUIDE.md) | Object model guide |
| [docs/user/RISK_REGISTRY_GUIDE.md](docs/user/RISK_REGISTRY_GUIDE.md) | Risk Registry guide |
| [docs/user/IMPORT_GUIDE.md](docs/user/IMPORT_GUIDE.md) | CSV/XLSX import объектов и рисков, preview и диагностика |
| [docs/user/CONFIGURATOR_GUIDE.md](docs/user/CONFIGURATOR_GUIDE.md) | Configurator guide |
| [docs/user/REPORTS_AND_EXPORT_GUIDE.md](docs/user/REPORTS_AND_EXPORT_GUIDE.md) | Reports and export guide |
| [docs/user/FAQ.md](docs/user/FAQ.md) | FAQ |

---

## 8. Development, Operations, Testing

| Документ | Назначение |
|---|---|
| [docs/development/TROUBLESHOOTING.md](docs/development/TROUBLESHOOTING.md) | Диагностика локального окружения и Supabase |
| [docs/operations/DEPLOYMENT.md](docs/operations/DEPLOYMENT.md) | Деплой и переменные окружения |
| [docs/testing/TEST_STRATEGY.md](docs/testing/TEST_STRATEGY.md) | Стратегия тестирования |
| [docs/testing/TEST_PLAN_SPRINT_01_03.md](docs/testing/TEST_PLAN_SPRINT_01_03.md) | Test plan Sprint 01–03 |
| [docs/testing/TEST_PLAN_SPRINT_05_07.md](docs/testing/TEST_PLAN_SPRINT_05_07.md) | Test plan Sprint 05–07 |
| [docs/testing/MANUAL_TESTING_GUIDE.md](docs/testing/MANUAL_TESTING_GUIDE.md) | Manual testing guide |
| [docs/testing/MANUAL_TESTING_GUIDE_S07.md](docs/testing/MANUAL_TESTING_GUIDE_S07.md) | Sprint 07 manual testing |
| [docs/testing/RBAC_TESTING_GUIDE.md](docs/testing/RBAC_TESTING_GUIDE.md) | RBAC testing |
| [docs/testing/REPORTING_SMOKE_TEST_CHECKLIST.md](docs/testing/REPORTING_SMOKE_TEST_CHECKLIST.md) | Sprint 10 Reporting manual smoke test |
| [docs/testing/DATA_ONBOARDING_SMOKE_TEST_CHECKLIST.md](docs/testing/DATA_ONBOARDING_SMOKE_TEST_CHECKLIST.md) | Sprint 11 Data Onboarding manual smoke test |
| [docs/testing/BUG_REPORT_TEMPLATE.md](docs/testing/BUG_REPORT_TEMPLATE.md) | Bug report template |

---

## 9. Sprint History

Sprint-файлы в `tasks/` сохраняются как исторический журнал разработки.

| Документ | Статус |
|---|---|
| [tasks/SPRINT_01.md](tasks/SPRINT_01.md) | Завершён |
| [tasks/SPRINT_02.md](tasks/SPRINT_02.md) | Завершён |
| [tasks/SPRINT_03.md](tasks/SPRINT_03.md) | Завершён |
| [tasks/SPRINT_04.md](tasks/SPRINT_04.md) | Завершён |
| [tasks/SPRINT_05.md](tasks/SPRINT_05.md) | Завершён |
| [tasks/SPRINT_06.md](tasks/SPRINT_06.md) | Завершён |
| [tasks/SPRINT_07.md](tasks/SPRINT_07.md) | Завершён, документ содержит исторические pending-чеклисты |
| [tasks/SPRINT_08.md](tasks/SPRINT_08.md) | Product Review, исторический источник обратной связи |
| [tasks/SPRINT_08_IMPLEMENTATION.md](tasks/SPRINT_08_IMPLEMENTATION.md) | Sprint 08 Implementation, завершён функционально |
| [tasks/SPRINT_09.md](tasks/SPRINT_09.md) | Sprint 09: Market MVP Packaging, завершён |
| [tasks/SPRINT_10.md](tasks/SPRINT_10.md) | Sprint 10: Reporting & Export, завершён |
| [tasks/SPRINT_11.md](tasks/SPRINT_11.md) | Sprint 11: Evidence Import & Data Onboarding, в работе |
| [tasks/SPRINT_12.md](tasks/SPRINT_12.md) | Sprint 12: Evidence-backed Trust Explainability |
| [tasks/SPRINT_13.md](tasks/SPRINT_13.md) | Sprint 13: Evidence-aware Risk Workflow |
| [tasks/SPRINT_14.md](tasks/SPRINT_14.md) | Sprint 14: Pilot Readiness |
| [tasks/SPRINT_15.md](tasks/SPRINT_15.md) | Sprint 15: Connector Framework Foundation |

---

## 10. Archive

[docs/archive/README.md](docs/archive/README.md) описывает устаревшие документы и их актуальные замены.

Архив не является источником истины.
