# SPRINT_ROADMAP.md — DTEK Core

`Статус: план дальнейшей разработки`  
`Дата: 08.07.2026`  
`Важно: этот документ не создаёт Sprint 09, а задаёт последовательность будущих спринтов`

---

## 1. Формат Будущих Sprint

Рекомендуемый формат Sprint-документа:

1. Цель Sprint.
2. Product Context.
3. Scope / Non-scope.
4. Задачи с ID.
5. Зависимости.
6. Затронутые файлы/модули.
7. Риски.
8. Definition of Done.
9. Проверки.
10. Итоговый статус.

Преимущество такого формата: он связывает продуктовый смысл, инженерный scope и quality gate в одном документе.

---

## 2. Выполненные Sprint

| Sprint | Результат |
|---|---|
| Sprint 01 | Foundation, Supabase, auth base, CI/CD |
| Sprint 02 | Organizations, onboarding, users, invitations, app shell |
| Sprint 03 | Objects, Trust Passport, Risk Registry |
| Sprint 04 | Manual testing and stabilization |
| Sprint 05 | Trust Score Engine, Dashboard, Trust Graph, Configurator |
| Sprint 06 | Security hardening, RBAC/RLS audit, security docs |
| Sprint 07 | QA and platform testing |
| Sprint 08 | UX refinement, visual polish, loading states, role info, settings polish |

---

## 3. Recommended Future Sprint Sequence

### Sprint 09 — Market MVP Packaging

Цель: подготовить продукт к внешним интервью и демонстрациям.

Scope:

- demo seed data;
- demo scenario;
- product one-pager;
- ICP and interview script;
- landing/product copy alignment;
- clean project documentation baseline.

Non-scope:

- новые интеграции;
- enterprise security;
- новый UI-модуль.

### Sprint 10 — Reporting & Export

Цель: дать CISO артефакты, которые можно показать руководству.

Scope:

- PDF Trust Passport export;
- CSV Risk Registry export;
- executive organization report;
- базовый report view;
- документация отчётности.

### Sprint 11 — Import & Data Onboarding

Цель: убрать ручной барьер загрузки данных.

Scope:

- CSV import objects;
- CSV import risks;
- validation preview;
- import errors report;
- sample templates.

### Sprint 12 — Trust Explainability

Цель: объяснить, почему Trust Score именно такой.

Scope:

- top score drivers;
- factor reasons;
- risk impact hint;
- score delta explanation;
- user-facing guide.

### Sprint 13 — Risk Workflow

Цель: превратить Risk Registry из списка в рабочий процесс.

Scope:

- risk owner;
- due date UX;
- evidence/attachments strategy;
- comments;
- SLA warnings;
- audit history improvements.

### Sprint 14 — Pilot Readiness

Цель: подготовить продукт к 1–3 пилотам.

Scope:

- environment health checks;
- email invitation delivery or confirmed manual invite flow;
- error monitoring plan;
- backup/runbook;
- pilot checklist;
- smoke testing automation where practical.

### Sprint 15 — First Connector Prototype

Цель: реализовать только тот коннектор, который подтвердили интервью/пилоты.

Possible scope:

- VM scanner import;
- CMDB import;
- AD/LDAP import;
- Jira/ServiceDesk export;
- simple API/webhook.

Решение о точном коннекторе принимается после Sprint 09–14.

---

## 4. Что Не Планировать Как Ближайший Sprint

- On-prem runtime.
- Marketplace.
- Agent platform.
- Custom RBAC roles.
- Heavy GRC workflows.
- Full SIEM/SOAR.
- AI assistant.

---

## 5. Sprint Dependencies

```text
Sprint 09 Market Packaging
    -> Sprint 10 Reporting & Export
    -> Sprint 11 Import & Data Onboarding
    -> Sprint 12 Trust Explainability
    -> Sprint 13 Risk Workflow
    -> Sprint 14 Pilot Readiness
    -> Sprint 15 First Connector Prototype
```

Sprint 10 and Sprint 11 can be partially parallelized after demo data is ready, but Sprint 12 depends on stable Trust Score data and risk model visibility.

---

## 6. Definition Of Done For Future Sprint

Каждый Sprint должен завершаться:

- обновлённой документацией;
- `npm run type-check`;
- `npm run lint`;
- `npm run build`;
- ручным smoke test ключевого сценария;
- Conventional Commit;
- push в `develop`;
- коротким итоговым отчётом.
