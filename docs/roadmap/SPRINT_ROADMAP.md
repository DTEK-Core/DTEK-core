# SPRINT_ROADMAP.md — DTEK Core

`Статус: актуальный`  
`Дата: 22.08.2026`
`Назначение: официально зафиксированный план до коммерческого MVP`

---

## 1. Логика Sprint Roadmap

Sprint 01–08 закрыли Functional MVP и UX refinement. Sprint 09 упаковал продукт для демонстрации. После ADR-007 дальнейшая разработка идёт по пути Evidence-first коммерческого MVP:

```text
Demo Ready
  -> Reporting Ready
  -> Evidence Onboarding Ready
  -> Evidence-backed Explainability Ready
  -> Pilot Risk Workflow Ready
  -> Pilot Ready / Commercial MVP
  -> Post-MVP Connector Foundation Ready
```

---

## 2. Формат Sprint-Документов

Для Sprint 09+ используется единый формат, совместимый со Sprint 08:

1. Цель Sprint.
2. Место в Roadmap.
3. Бизнес-ценность.
4. Scope / Non-scope.
5. Задачи Sprint.
6. Порядок выполнения.
7. Детализация задач.
8. Definition of Done.
9. Риски.

Формат сохраняет стиль проекта и делает каждый Sprint самодостаточным для новой команды.

---

## 3. Выполненные Sprint

| Sprint | Документ | Результат |
|---|---|---|
| Sprint 01 | [tasks/SPRINT_01.md](../../tasks/SPRINT_01.md) | Foundation, Supabase, auth base, CI/CD |
| Sprint 02 | [tasks/SPRINT_02.md](../../tasks/SPRINT_02.md) | Organizations, onboarding, users, invitations, app shell |
| Sprint 03 | [tasks/SPRINT_03.md](../../tasks/SPRINT_03.md) | Objects, Trust Passport, Risk Registry |
| Sprint 04 | [tasks/SPRINT_04.md](../../tasks/SPRINT_04.md) | Manual testing and stabilization |
| Sprint 05 | [tasks/SPRINT_05.md](../../tasks/SPRINT_05.md) | Trust Score Engine, Dashboard, Trust Graph, Configurator |
| Sprint 06 | [tasks/SPRINT_06.md](../../tasks/SPRINT_06.md) | Security hardening, RBAC/RLS audit, security docs |
| Sprint 07 | [tasks/SPRINT_07.md](../../tasks/SPRINT_07.md) | QA and platform testing |
| Sprint 08 | [tasks/SPRINT_08_IMPLEMENTATION.md](../../tasks/SPRINT_08_IMPLEMENTATION.md) | UX refinement, loading states, invite link, role info, settings polish |
| Sprint 09 | [tasks/SPRINT_09.md](../../tasks/SPRINT_09.md) | Market MVP packaging: demo narrative, dataset, seed plan, ICP, one-pager, pilot offer |
| Sprint 10 | [tasks/SPRINT_10.md](../../tasks/SPRINT_10.md) | Reporting & Export: Trust Passport report, Risk CSV, Executive Organization Report, RBAC/audit, smoke checklist |
| Sprint 11 | [tasks/SPRINT_11.md](../../tasks/SPRINT_11.md) | Evidence Import & Data Onboarding: CSV/XLSX import, preview, source metadata, duplicate detection, partial success, audit events, fixtures, smoke PASS |

---

## 4. Planned Sprint Roadmap

| Sprint | Документ | Milestone | Цель |
|---|---|---|---|
| Sprint 12 | [tasks/SPRINT_12.md](../../tasks/SPRINT_12.md) | Реализация завершена, manual QA deferred to pilot release gate | Объяснить Trust Score, impact рисков и источники данных |
| Sprint 13 | [tasks/SPRINT_13.md](../../tasks/SPRINT_13.md) | Реализация завершена, manual QA pending | Сделать Risk Registry рабочим процессом для manual/imported risks |
| Sprint 14 | [tasks/SPRINT_14.md](../../tasks/SPRINT_14.md) | В работе: S14-T001–T005 завершены | Закрыть release gates и подготовить продукт к 1–3 пилотам |
| Sprint 15 | [tasks/SPRINT_15.md](../../tasks/SPRINT_15.md) | Post-MVP Connector Foundation Ready | Спроектировать Connector Framework, Evidence Layer и Discovery Inbox после пилотов |

---

## 5. Dependency Graph

```text
Sprint 08 UX Refinement
    -> Sprint 09 Market MVP Packaging
        -> Sprint 10 Reporting & Export
            -> Sprint 11 Evidence Import & Data Onboarding
                -> Sprint 12 Evidence-backed Trust Explainability
                    -> Sprint 13 Pilot Risk Workflow
                        -> Sprint 14 Pilot Readiness
                            -> Commercial MVP fixed
                                -> Post-MVP Sprint 15 Connector Framework Foundation
```

Sprint 11 завершён и даёт Evidence Onboarding Ready baseline. Все задачи реализации Sprint 12 завершены, включая пользовательскую документацию и итоговый QA checklist. Ручной прогон `docs/testing/EXPLAINABILITY_QA_CHECKLIST.md` остаётся обязательным pilot release gate. По явному решению владельца от 08.08.2026 он отложен и не блокирует старт Sprint 13; Sprint 12 при этом не помечается закрытым или `PASS`.

Все задачи реализации Sprint 13 завершены, включая документацию и
`docs/testing/RISK_WORKFLOW_QA_CHECKLIST.md`. Authenticated multi-role QA Sprint
13 остаётся `PENDING`; только фактический прогон может перевести milestone в
`PASS`. Sprint 14 объединяет оставшиеся Sprint 12/13 manual gates с общей Pilot
Readiness проверкой.

S14-T001 завершена 19.08.2026: создан
`docs/testing/PILOT_READINESS_CHECKLIST.md`. Он является master release gate,
но не переводит продукт в `Pilot Ready` до выполнения T002–T008 и фактического
authenticated QA Sprint 12/13.

S14-T002 добавляет owner/admin-only on-demand Environment Health Check и
operations runbook для Supabase/env/DNS/middleware triage без публичного health
endpoint, автоматического recovery или раскрытия секретов.

S14-T003 фиксирует manual invite link как официальный Commercial MVP
delivery path, открывает `/invite/{token}` для нового пользователя под
rate limit, укрепляет accept-flow и убирает скрытые недоставляемые
invitation из onboarding wizard. Email provider остаётся за границей MVP.

S14-T004 добавляет dependency-free production HTTP smoke runner с 18
контрактами и CI gate после build. Authenticated Auth/Org/Data/Reports/RBAC/mobile
critical path формализован отдельным checklist и остаётся RC gate.

S14-T005 фиксирует Supabase backup scope, pilot RPO/RTO targets, managed и
logical backup paths, безопасный restore-to-new-project и controlled cutover.
Runbook реализован, но Dashboard backup state и restore rehearsal на отдельном
target остаются обязательным RC gate.

Финальная инженерная консолидация выполнена 03.08.2026: dependency audit очищен, contract tests добавлены в CI, документация синхронизирована. Она не закрывает manual QA; старт Sprint 13 отдельно разрешён владельцем 08.08.2026 после восстановления Supabase и сверки Cloud migrations.

Sprint 15 создаёт foundation для безопасных коннекторов и выбирает первые candidates по пилотным сигналам, но не входит в коммерческий MVP.

---

## 6. Commercial MVP Boundary

Коммерческий MVP считается спланированным до состояния:

- продукт можно показать CISO без пустых экранов;
- данные можно загрузить без интеграций как первый evidence ingestion path;
- отчёты можно передать руководству;
- Trust Score объясним;
- риски имеют workflow;
- пилот можно запустить и измерить;

После Sprint 14 начинается Post-MVP: Connector Framework, Evidence Layer, Discovery Inbox, Identity Resolution и первый connector prototype требуют отдельного решения на основе pilot feedback.

Enterprise-функции (`SSO`, `on-prem`, `custom roles`, `marketplace`, агент) остаются за пределами этой Sprint Roadmap.

---

## 7. Definition Of Done Для Любого Sprint

Каждый Sprint должен завершаться:

- обновлённой документацией;
- актуальным статусом Sprint-документа;
- `npm run type-check`;
- `npm run lint`;
- `npm run build`;
- smoke test ключевого сценария;
- Conventional Commit;
- push в `develop`;
- итоговым отчётом.
