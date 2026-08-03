# SPRINT_ROADMAP.md — DTEK Core

`Статус: актуальный`  
`Дата проверки: 03.08.2026`
`Дата: 20.07.2026`
`Назначение: единый план разработки после Sprint 08 до Evidence-first коммерческого MVP`

---

## 1. Логика Sprint Roadmap

Sprint 01–08 закрыли Functional MVP и UX refinement. Sprint 09 упаковал продукт для демонстрации. После ADR-007 дальнейшая разработка идёт по пути Evidence-first коммерческого MVP:

```text
Demo Ready
  -> Reporting Ready
  -> Evidence Onboarding Ready
  -> Evidence-backed Explainability Ready
  -> Evidence-aware Risk Workflow Ready
  -> Pilot Ready
  -> Connector Foundation Ready
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
| Sprint 12 | [tasks/SPRINT_12.md](../../tasks/SPRINT_12.md) | Реализация завершена, manual QA pending | Объяснить Trust Score, impact рисков и источники данных |
| Sprint 13 | [tasks/SPRINT_13.md](../../tasks/SPRINT_13.md) | Evidence-aware Risk Workflow Ready | Сделать Risk Registry рабочим процессом для manual/imported/auto-candidate risks |
| Sprint 14 | [tasks/SPRINT_14.md](../../tasks/SPRINT_14.md) | Pilot Ready | Подготовить продукт к 1–3 пилотам |
| Sprint 15 | [tasks/SPRINT_15.md](../../tasks/SPRINT_15.md) | Connector Foundation Ready | Спроектировать Connector Framework, Evidence Layer и Discovery Inbox |

---

## 5. Dependency Graph

```text
Sprint 08 UX Refinement
    -> Sprint 09 Market MVP Packaging
        -> Sprint 10 Reporting & Export
            -> Sprint 11 Evidence Import & Data Onboarding
                -> Sprint 12 Evidence-backed Trust Explainability
                    -> Sprint 13 Evidence-aware Risk Workflow
                        -> Sprint 14 Pilot Readiness
                            -> Sprint 15 Connector Framework Foundation
```

Sprint 11 завершён и даёт Evidence Onboarding Ready baseline. Все задачи реализации Sprint 12 завершены, включая пользовательскую документацию и итоговый QA checklist. Milestone Evidence-backed Explainability Ready закрывается после ручного прогона `docs/testing/EXPLAINABILITY_QA_CHECKLIST.md`; затем активная разработка переходит к Sprint 13.

Финальная инженерная консолидация выполнена 03.08.2026: dependency audit очищен, contract tests добавлены в CI, документация синхронизирована. Это не закрывает manual QA и не запускает Sprint 13 автоматически.

Sprint 15 уже не является случайным одиночным коннектором. Он создаёт foundation для безопасных коннекторов и выбирает первые candidates по пилотным сигналам.

---

## 6. Commercial MVP Boundary

Коммерческий MVP считается спланированным до состояния:

- продукт можно показать CISO без пустых экранов;
- данные можно загрузить без интеграций как первый evidence ingestion path;
- отчёты можно передать руководству;
- Trust Score объясним;
- риски имеют workflow;
- пилот можно запустить и измерить;
- Connector Framework спроектирован до первой тяжёлой интеграции.

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
