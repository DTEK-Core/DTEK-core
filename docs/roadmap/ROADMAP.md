# ROADMAP.md — DTEK Core

`Статус: актуальный`  
`Дата: 09.07.2026`  
`Основа: Strategic Product & Market Analysis + Sprint 08`

---

## 1. Roadmap Logic

Sprint 01–08 создали функциональный и визуально отполированный MVP.

Следующий этап — не расширение ради расширения, а переход к Market MVP:

1. Упаковать продукт для демонстрации.
2. Дать быстрый способ загрузить реальные данные.
3. Дать отчёты, которые CISO может показать руководству.
4. Сделать Trust Score объяснимым.
5. Подготовить продукт к первым пилотам.

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
| Import/export | Требуется |
| Reports | Требуется |
| Explainability | Требуется |
| Pilot narrative | Готов |
| Pilot readiness | Требуется |

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

Статус: активная фаза. Sprint 09 завершил Demo Ready + Interview Ready упаковку; Sprint 10–14 закрывают reporting, data onboarding, explainability, workflow и pilot readiness.

Фокус:

- demo seed data;
- product story;
- CSV import;
- CSV/PDF export;
- executive reporting;
- Trust Score explainability;
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

### Phase D — Post-MVP Integrations

Статус: после подтверждения пилотов.

Возможные направления:

- VM/scanner import;
- CMDB import;
- AD/LDAP;
- SIEM event import;
- Jira/ServiceDesk;
- webhook/API.

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
| Много коннекторов | Сначала нужны интервью и пилоты |
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
| Explainability Ready | Trust Score объясняется через факторы, причины и impact рисков |
| Risk Workflow Ready | Риски имеют владельцев, сроки, evidence/comments и историю |
| Market MVP Ready | Import/export/reporting/explainability готовы для ручного пилота |
| Pilot Ready | Продукт можно дать 1–3 компаниям на 2–4 недели |
| Integration Ready | Понятно, какой первый коннектор нужен по результатам пилотов |

---

## 7. Sprint Roadmap

Полный комплект Sprint-документов после Sprint 08 создан в `tasks/`:

| Sprint | Документ | Roadmap phase |
|---|---|---|
| Sprint 09 | `tasks/SPRINT_09.md` | Market MVP Packaging |
| Sprint 10 | `tasks/SPRINT_10.md` | Reporting & Export |
| Sprint 11 | `tasks/SPRINT_11.md` | Import & Data Onboarding |
| Sprint 12 | `tasks/SPRINT_12.md` | Trust Explainability |
| Sprint 13 | `tasks/SPRINT_13.md` | Risk Workflow |
| Sprint 14 | `tasks/SPRINT_14.md` | Pilot Readiness |
| Sprint 15 | `tasks/SPRINT_15.md` | First Connector Prototype |

---

## 8. Главный Принцип

Каждая следующая задача должна приближать DTEK Core к первому реальному пилоту.

Если задача не помогает показать ценность CISO, загрузить данные, объяснить Trust Score или получить отчёт — она, скорее всего, Post-MVP.
