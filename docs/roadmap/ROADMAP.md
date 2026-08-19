# ROADMAP.md — DTEK Core

`Статус: актуальный`  
`Дата: 07.08.2026`
`Основа: Strategic Product & Market Analysis + Sprint 08 + ADR-007`

---

## 1. Roadmap Logic

Sprint 01–08 создали функциональный и визуально отполированный MVP. Sprint 09 упаковал продукт для демонстрации и первых интервью.

После ADR-007 следующий этап — не расширение ради расширения, а переход к Evidence-first Market MVP:

1. Упаковать продукт для демонстрации.
2. Дать быстрый способ загрузить реальные данные как первый evidence ingestion path.
3. Дать отчёты, которые CISO может показать руководству.
4. Сделать Trust Score объяснимым через факторы, риски и evidence/source context.
5. Подготовить продукт к первым пилотам.
6. Подготовить продукт к первым пилотам; Connector Framework оставить следующим Post-MVP этапом.

---

## 2. Текущее Состояние

| Область | Статус |
|---|---|
| Auth / Organizations / Users | Реализовано |
| Objects | Реализовано |
| Trust Passport | Реализовано |
| Trust Score Engine | Реализовано |
| Risk Registry | Реализовано |
| Trust Graph | Реализовано |
| Dashboard | Реализовано |
| Configurator | Реализовано |
| RBAC/RLS/Security Audit | Реализовано на MVP-уровне |
| UX polish | Sprint 08 завершён |
| Demo data | Спецификация и manual seed plan готовы |
| Import/export | Реализовано для CSV/XLSX import и ключевых отчётов; import трактуется как evidence ingestion |
| Reports | Реализовано в Sprint 10 |
| Explainability | Sprint 12 реализован; QA checklist готов, ручная приёмка отложена владельцем проекта до pilot release gate |
| Engineering consolidation | Dependency hardening и CI contract tests завершены; Sprint 14 начат с master readiness checklist |
| Pilot narrative | Готов |
| Commercial MVP remaining | Sprint 14 Pilot Readiness; Sprint 12/13 authenticated QA входят в release gates |
| Evidence-first architecture | ADR-007 принят; Discovery/Evidence/Connector runtime — Post-MVP |

---

## 3. Roadmap Phases

### Phase A — Functional MVP

Статус: завершено.

Включает Sprint 01–08:

- техническая основа;
- auth;
- организации;
- пользователи;
- объекты;
- риски;
- Trust Score;
- Trust Graph;
- Dashboard;
- Configurator;
- безопасность;
- UX polish.

### Phase B — Market MVP

Статус: активная фаза. Sprint 09 завершил Demo Ready + Interview Ready упаковку, Sprint 10 закрыл Reporting Ready, Sprint 11 закрыл Evidence Onboarding Ready. Реализация Sprint 12 и Sprint 13 завершена вместе с пользовательской документацией и QA checklists; их ручная authenticated приёмка остаётся обязательным pilot release gate. Sprint 14 закрывает общую pilot readiness.

Фокус:

- demo seed data;
- product story;
- CSV/XLSX import as first evidence ingestion;
- CSV/PDF export;
- executive reporting;
- Trust Score explainability with source/evidence context;
- risk impact;
- pilot runbook;
- supported manual invitation delivery с authenticated E2E gate.

### Phase C — Commercial MVP Completion

Статус: Sprint 13 реализован, manual QA pending; Sprint 14 начат, S14-T001–T003 завершены.

Фокус:

- Pilot Risk Workflow: owner, due date, comments, activity и audit для manual/imported рисков;
- стабильность окружения;
- базовый мониторинг;
- backup/runbook;
- финальный release/pilot checklist.

### Phase D — Evidence-first Integrations

Статус: после подтверждения пилотов.

Возможные направления:

- Connector Framework Foundation;
- Discovery Layer;
- Evidence Layer;
- Identity Resolution;
- Discovery Inbox;
- AD/LDAP/FreeIPA;
- Zabbix;
- MaxPatrol VM;
- Wazuh/Kaspersky Security Center;
- UserGate/firewall exports;
- VMware/Proxmox/Kubernetes/cloud APIs.

### Phase E — Enterprise Readiness

Статус: v2+.

Возможные направления:

- SSO/SAML;
- 2FA/TOTP;
- on-prem / private cloud;
- advanced audit retention;
- WAF/advanced monitoring;
- role customization;
- procurement/security pack;
- regulatory alignment.

---

## 4. Что Переносится В Post-MVP

| Функция | Причина |
|---|---|
| Собственный агент | Высокая сложность, не нужен для проверки гипотезы |
| Полноценный SIEM/SOAR | Не соответствует продуктовой границе |
| Много коннекторов одновременно | Сначала нужен Connector Framework Foundation и пилотные сигналы |
| Marketplace | Нет подтверждённой потребности |
| Enterprise Runtime | Требует отдельной архитектуры и продаж |
| Кастомные роли | Затрагивает RLS/RBAC и не критично для MVP |
| Rule Engine | Сложная бизнес-логика, нужна после explainability |

---

## 5. Обязательные Функции До Первых Пилотов

| Блок | Результат |
|---|---|
| Demo Data | Продукт можно показать без пустых экранов |
| CSV Import | Клиент может загрузить реальные объекты и риски |
| Reports | CISO получает материал для руководства |
| Explainability | Пользователь понимает, почему Trust Score именно такой |
| Risk Impact | Видно, какие риски дают максимальный эффект при закрытии |
| Workflow | У риска есть ответственный, срок, manual/imported origin context, комментарии и история |
| Stability | Нет зависаний при проблемах Supabase/DNS |

---

## 6. Milestones

| Milestone | Критерий готовности |
|---|---|
| Demo Ready | Есть demo narrative, demo dataset specification и безопасный seed plan |
| Interview Ready | Есть one-pager, ICP, вопросы для CISO, продуктовая история и pilot offer |
| Reporting Ready | Есть PDF/CSV export и executive report |
| Data Onboarding Ready | Есть CSV import объектов и рисков |
| Evidence Onboarding Ready | CSV/XLSX import создаёт source-aware данные и готовит Evidence Layer |
| Explainability Ready | Trust Score объясняется через факторы, причины, impact рисков и source/evidence context |
| Risk Workflow Ready | Риски имеют владельцев, сроки, evidence/comments и историю |
| Commercial MVP Ready | Import/export/reporting/explainability, risk workflow и release gates готовы для ручного пилота |
| Pilot Ready | Продукт можно дать 1–3 компаниям на 2–4 недели |
| Connector Foundation Ready | Спроектированы Connector Framework, Evidence Layer, Discovery Inbox и shortlist первых источников |

---

## 7. Sprint Roadmap

Полный комплект Sprint-документов после Sprint 08 создан в `tasks/`:

| Sprint | Документ | Roadmap phase |
|---|---|---|
| Sprint 09 | `tasks/SPRINT_09.md` | Market MVP Packaging |
| Sprint 10 | `tasks/SPRINT_10.md` | Reporting & Export — завершён |
| Sprint 11 | `tasks/SPRINT_11.md` | Evidence Import & Data Onboarding — завершён |
| Sprint 12 | `tasks/SPRINT_12.md` | Evidence-backed Trust Explainability — реализация завершена, manual QA pending |
| Sprint 13 | `tasks/SPRINT_13.md` | Commercial MVP: Pilot Risk Workflow |
| Sprint 14 | `tasks/SPRINT_14.md` | Commercial MVP: Pilot Readiness и release gates |
| Sprint 15 | `tasks/SPRINT_15.md` | Post-MVP: Connector Framework Foundation |

---

## 8. Главный Принцип

Каждая следующая задача должна приближать DTEK Core к первому реальному пилоту.

Если задача не помогает показать ценность CISO, загрузить данные, объяснить Trust Score, получить отчёт, вести риск или безопасно запустить пилот — она, скорее всего, Post-MVP.
