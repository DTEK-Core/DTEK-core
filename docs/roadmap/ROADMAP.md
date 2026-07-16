# ROADMAP.md — DTEK Core

`Статус: актуальный`  
`Дата: 16.07.2026`
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
6. Спроектировать foundation Connector Framework.

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
| Explainability | Sprint 12 в работе; архитектурная модель утверждена, UI требуется |
| Pilot narrative | Готов |
| Pilot readiness | Требуется |
| Evidence-first architecture | ADR-007 принят; требуется реализация слоями |

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

Статус: активная фаза. Sprint 09 завершил Demo Ready + Interview Ready упаковку, Sprint 10 закрыл Reporting Ready, Sprint 11 закрыл Evidence Onboarding Ready. Sprint 12 Evidence-backed Trust Explainability начат: explainability model утверждена, далее реализуются object-level drivers, reasons, impact и summary. Sprint 13–14 закрывают workflow и pilot readiness.

Фокус:

- demo seed data;
- product story;
- CSV/XLSX import as first evidence ingestion;
- CSV/PDF export;
- executive reporting;
- Trust Score explainability with source/evidence context;
- risk impact;
- pilot runbook;
- email invitation hardening.

### Phase C — Pilot MVP

Статус: после Market MVP.

Фокус:

- работа с 1–3 пилотными организациями;
- evidence/comments по рискам;
- стабильность окружения;
- базовый мониторинг;
- backup/runbook;
- улучшение UX по реальным данным;
- первый API или выбранный connector prototype.

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
| Workflow | У риска есть ответственный, срок, evidence и комментарии |
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
| Market MVP Ready | Import/export/reporting/explainability готовы для ручного пилота |
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
| Sprint 12 | `tasks/SPRINT_12.md` | Evidence-backed Trust Explainability — в работе |
| Sprint 13 | `tasks/SPRINT_13.md` | Evidence-aware Risk Workflow |
| Sprint 14 | `tasks/SPRINT_14.md` | Pilot Readiness |
| Sprint 15 | `tasks/SPRINT_15.md` | Connector Framework Foundation |

---

## 8. Главный Принцип

Каждая следующая задача должна приближать DTEK Core к первому реальному пилоту.

Если задача не помогает показать ценность CISO, загрузить данные, объяснить Trust Score, получить отчёт или приблизить Evidence-first foundation — она, скорее всего, Post-MVP.
