# DOCUMENTATION INDEX — DTEK Core

> Единый навигационный документ по всей документации проекта.  
> Начните здесь, если вы новый участник проекта.

---

## Как читать документацию (порядок для нового участника)

```
1. README.md                        — Быстрый старт и текущее состояние проекта
2. ARCHITECTURE_DECISIONS.md        — 5 ADR: ключевые решения, ОБЯЗАТЕЛЬНО перед кодом
3. CLAUDE.md                        — Инструкции для AI-агентов и разработчиков
4. docs/product/Vision.md           — Зачем продукт существует
5. docs/architecture/Database_Design_Full.md — Схема БД (10 таблиц + RLS)
6. docs/security/SECURITY_OVERVIEW.md — Как устроена безопасность
7. tasks/MVP_RELEASE_PLAN.md        — Дорожная карта по спринтам и релизам
```

---

## Корневые документы

| Документ | Назначение | Приоритет |
|---|---|---|
| [README.md](README.md) | Быстрый старт, текущее состояние, структура проекта | Высокий |
| [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) | ADR-001–005: модель доверия, роли, архитектура, БД, конфигуратор | **Максимальный** |
| [CLAUDE.md](CLAUDE.md) | Инструкции для AI-агентов и соглашения проекта | Высокий |
| [CHANGELOG.md](CHANGELOG.md) | История изменений по версиям | Средний |
| [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) | Этот документ | — |

---

## docs/architecture/ — Архитектурные документы

> Актуальные технические спецификации. Источник истины для кода.

| Документ | Назначение |
|---|---|
| [Database_Design_Full.md](architecture/Database_Design_Full.md) | 10 таблиц БД: типы, CHECK, индексы, RLS — актуальная схема (ADR-005) |
| [Trust_Score_Model_v2.md](architecture/Trust_Score_Model_v2.md) | Формула и расчёт Trust Score: 6 факторов, веса, MVP-логика (ADR-001) |
| [Configurator_Concept_Final.md](architecture/Configurator_Concept_Final.md) | Концепция Конфигуратора: Phase 1 (wizard) + Phase 2 (weights editor) (ADR-002) |
| [System_Architecture.md](architecture/System_Architecture.md) | Cloud-архитектура MVP: Vercel + Supabase Cloud (ADR-004) |
| [User_Roles.md](architecture/User_Roles.md) | Матрица прав по ролям: owner/analyst/admin/viewer (ADR-003) |

---

## docs/product/ — Продуктовые документы

> Концепция, пользовательские истории, область применения.

| Документ | Назначение |
|---|---|
| [Vision.md](product/Vision.md) | Видение продукта: зачем DTEK Core существует |
| [Product_Concept.md](product/Product_Concept.md) | Концепция продукта: 4 ключевые сущности, целевая аудитория |
| [User_Stories.md](product/User_Stories.md) | 46 пользовательских историй с Acceptance Criteria |
| [PRD_Core_Modules.md](product/PRD_Core_Modules.md) | PRD основных модулей платформы |
| [PRD_Modules.md](product/PRD_Modules.md) | Детализация PRD по модулям |
| [MVP_Scope.md](product/MVP_Scope.md) | Границы MVP: что входит, что вне MVP |
| [Risk_Model.md](product/Risk_Model.md) | Исследование: модель рисков |
| [Trust_Graph_Model.md](product/Trust_Graph_Model.md) | Исследование: модель графа доверия |
| [Trust_Passport_Model.md](product/Trust_Passport_Model.md) | Исследование: модель паспорта доверия |

---

## docs/security/ — Документация по безопасности

> Подготовлена для Sprint 09 (Security Sprint) и требований ФСТЭК.

| Документ | Назначение |
|---|---|
| [SECURITY_OVERVIEW.md](security/SECURITY_OVERVIEW.md) | Обзор безопасности: 4 уровня защиты, реализованные меры |
| [RBAC_MODEL.md](security/RBAC_MODEL.md) | Модель ролей: полная матрица прав, реализация в коде |
| [RLS_MODEL.md](security/RLS_MODEL.md) | Row Level Security: политики по каждой таблице |
| [THREAT_MODEL.md](security/THREAT_MODEL.md) | Модель угроз STRIDE: 21 угроза, контрмеры, остаточные риски |
| [SECURE_SDLC.md](security/SECURE_SDLC.md) | Безопасная разработка: процессы на каждом этапе SDLC |
| [SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) | Требования к безопасности: 29 P1-требований, статус MVP |
| [SECURITY_TESTING_PLAN.md](security/SECURITY_TESTING_PLAN.md) | План тестирования: RBAC, RLS, headers, rate limiting |
| [VULNERABILITY_MANAGEMENT.md](security/VULNERABILITY_MANAGEMENT.md) | Управление уязвимостями: процесс, классификация, SLA |
| [DEPENDENCY_MANAGEMENT.md](security/DEPENDENCY_MANAGEMENT.md) | Управление зависимостями: политика, аудит, lockfile |
| [DEPENDENCY_AUDIT_S06.md](security/DEPENDENCY_AUDIT_S06.md) | Аудит зависимостей: Sprint 06 (next@15 upgrade) |

---

## docs/testing/ — Тестирование

| Документ | Назначение |
|---|---|
| [TEST_STRATEGY.md](testing/TEST_STRATEGY.md) | Стратегия тестирования платформы |
| [TEST_PLAN_SPRINT_01_03.md](testing/TEST_PLAN_SPRINT_01_03.md) | 27 тест-кейсов: Auth, Objects, Risks, Passport, Users |
| [TEST_REPORT_SPRINT_01_03.md](testing/TEST_REPORT_SPRINT_01_03.md) | Результаты тестирования Sprint 01–03 |
| [TEST_PLAN_SPRINT_05_07.md](testing/TEST_PLAN_SPRINT_05_07.md) | 58 тест-кейсов: Dashboard, Graph, Engine, Settings, RBAC |
| [MANUAL_TESTING_GUIDE.md](testing/MANUAL_TESTING_GUIDE.md) | Руководство ручного тестирования (Sprint 01–04) |
| [MANUAL_TESTING_GUIDE_S07.md](testing/MANUAL_TESTING_GUIDE_S07.md) | Руководство ручного тестирования (Sprint 07): 20 шагов |
| [RBAC_TESTING_GUIDE.md](testing/RBAC_TESTING_GUIDE.md) | Методология RBAC-тестирования: мультибраузерный подход |
| [BUG_REPORT_TEMPLATE.md](testing/BUG_REPORT_TEMPLATE.md) | Шаблон отчёта об ошибке |

---

## docs/user/ — Руководства для пользователей

> Документация для конечных пользователей платформы: аналитиков ИБ, CISO, администраторов.

| Документ | Назначение |
|---|---|
| [USER_GUIDE.md](user/USER_GUIDE.md) | Полное руководство пользователя: что такое DTEK Core, начало работы |
| [PLATFORM_WORKFLOW.md](user/PLATFORM_WORKFLOW.md) | Рабочий процесс платформы: жизненный цикл от объекта до аналитики |
| [TRUST_SCORE_GUIDE.md](user/TRUST_SCORE_GUIDE.md) | Подробное руководство по Trust Score: модель, факторы, примеры расчётов |
| [OBJECT_MODEL_GUIDE.md](user/OBJECT_MODEL_GUIDE.md) | Модель объектов: типы, атрибуты, цифровая модель инфраструктуры |
| [RISK_REGISTRY_GUIDE.md](user/RISK_REGISTRY_GUIDE.md) | Реестр рисков: жизненный цикл, статусы, SLA, CVSS, влияние на Trust Score |
| [CONFIGURATOR_GUIDE.md](user/CONFIGURATOR_GUIDE.md) | Конфигуратор: веса факторов, отраслевые профили, эффект изменений |
| [FAQ.md](user/FAQ.md) | 41 ответ на часто задаваемые вопросы |

---

## docs/development/ — Руководства для разработчиков

| Документ | Назначение |
|---|---|
| [CONFIGURATOR_GUIDE.md](development/CONFIGURATOR_GUIDE.md) | Пользовательское руководство по Конфигуратору |
| [TROUBLESHOOTING.md](development/TROUBLESHOOTING.md) | Диагностика и восстановление локального окружения: Supabase, DNS, env, middleware |

---

## docs/product/ — Продуктовые документы и аналитика

| Документ | Назначение |
|---|---|
| [SPRINT08_ANALYSIS.md](product/SPRINT08_ANALYSIS.md) | Анализ продукта Sprint 08: сильные стороны, Mini Sprint, коммерческий потенциал, рекомендации |

---

## docs/operations/ — Операционные документы

| Документ | Назначение |
|---|---|
| [DEPLOYMENT.md](operations/DEPLOYMENT.md) | Деплой: Vercel, Supabase, переменные окружения, чеклист |

---

## tasks/ — Задачи и планирование

> Бэклог, спринты, дорожная карта.

| Документ | Назначение |
|---|---|
| [tasks/MVP_RELEASE_PLAN.md](tasks/MVP_RELEASE_PLAN.md) | Дорожная карта: R0–R5 (MVP) + R6 (Post-MVP), milestone-карта |
| [tasks/EPIC_BACKLOG.md](tasks/EPIC_BACKLOG.md) | 11 Epic с критериями завершения и зависимостями |
| [tasks/FEATURE_BACKLOG.md](tasks/FEATURE_BACKLOG.md) | 53 фичи с приоритетами, размерами, зависимостями |
| [tasks/SPRINT_01.md](tasks/SPRINT_01.md) | Sprint 01: Foundation & Authentication ✅ |
| [tasks/SPRINT_02.md](tasks/SPRINT_02.md) | Sprint 02: Organization Management & Platform Setup ✅ |
| [tasks/SPRINT_03.md](tasks/SPRINT_03.md) | Sprint 03: Digital Asset Management & Trust Risk Registry ✅ |
| [tasks/SPRINT_04.md](tasks/SPRINT_04.md) | Sprint 04: Testing, Bug Fixing & Stabilization ✅ |
| [tasks/SPRINT_05.md](tasks/SPRINT_05.md) | Sprint 05: Trust Score Engine, Dashboard, Graph, Configurator ✅ |
| [tasks/SPRINT_06.md](tasks/SPRINT_06.md) | Sprint 06: Security Hardening ✅ |
| [tasks/SPRINT_07.md](tasks/SPRINT_07.md) | Sprint 07: QA & Platform Testing ✅ |
| [tasks/SPRINT_08.md](tasks/SPRINT_08.md) | Sprint 08: Product Review & UX Refinement 🔍 |
| [tasks/SPRINT_08_IMPLEMENTATION.md](tasks/SPRINT_08_IMPLEMENTATION.md) | Sprint 08: Implementation — UX Refinement & Platform Polish 🔜 |

---

## docs/archive/ — Архив

> Устаревшие документы. Заменены актуальными версиями. Не использовать как источник истины.

[docs/archive/README.md](archive/README.md) — список файлов и что их заменило.

---

## .claude/ — AI-агент инструкции

| Документ | Назначение |
|---|---|
| [.claude/CLAUDE.md](.claude/CLAUDE.md) | Правила проекта для AI-агентов |
| [.claude/AI_DEVELOPMENT_GUIDE.md](.claude/AI_DEVELOPMENT_GUIDE.md) | Руководство AI-разработки |
| [.claude/engineering_rules.md](.claude/engineering_rules.md) | Инженерные правила |
| [.claude/workflow.md](.claude/workflow.md) | Рабочий процесс |

---

*Последнее обновление: 30.06.2026 | Sprint 08 Implementation Plan | Версия платформы: v0.7.0*
