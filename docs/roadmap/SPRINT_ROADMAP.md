# SPRINT_ROADMAP.md — DTEK Core

`Статус: актуальный`  
`Дата: 08.07.2026`  
`Назначение: единый план разработки после Sprint 08 до коммерческого MVP`

---

## 1. Логика Sprint Roadmap

Sprint 01–08 закрыли Functional MVP и UX refinement. Дальнейшая разработка идёт не по принципу “добавить больше функций”, а по пути коммерческого MVP:

```text
Demo Ready
  -> Reporting Ready
  -> Data Onboarding Ready
  -> Explainability Ready
  -> Risk Workflow Ready
  -> Pilot Ready
  -> Integration Ready
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

---

## 4. Planned Sprint Roadmap

| Sprint | Документ | Milestone | Цель |
|---|---|---|---|
| Sprint 09 | [tasks/SPRINT_09.md](../../tasks/SPRINT_09.md) | Demo Ready + Interview Ready | Упаковать MVP для внешних демонстраций и интервью |
| Sprint 10 | [tasks/SPRINT_10.md](../../tasks/SPRINT_10.md) | Reporting Ready | Дать CISO PDF/CSV/export artefacts и executive report |
| Sprint 11 | [tasks/SPRINT_11.md](../../tasks/SPRINT_11.md) | Data Onboarding Ready | Загрузить реальные объекты и риски через CSV |
| Sprint 12 | [tasks/SPRINT_12.md](../../tasks/SPRINT_12.md) | Explainability Ready | Объяснить Trust Score и impact рисков |
| Sprint 13 | [tasks/SPRINT_13.md](../../tasks/SPRINT_13.md) | Risk Workflow Ready | Сделать Risk Registry рабочим процессом |
| Sprint 14 | [tasks/SPRINT_14.md](../../tasks/SPRINT_14.md) | Pilot Ready | Подготовить продукт к 1–3 пилотам |
| Sprint 15 | [tasks/SPRINT_15.md](../../tasks/SPRINT_15.md) | Integration Ready | Реализовать первый подтверждённый connector prototype |

---

## 5. Dependency Graph

```text
Sprint 08 UX Refinement
    -> Sprint 09 Market MVP Packaging
        -> Sprint 10 Reporting & Export
            -> Sprint 11 Import & Data Onboarding
                -> Sprint 12 Trust Explainability
                    -> Sprint 13 Risk Workflow
                        -> Sprint 14 Pilot Readiness
                            -> Sprint 15 First Connector Prototype
```

Sprint 10 и Sprint 11 могут частично готовиться параллельно после Sprint 09, но Sprint 12 зависит от устойчивой модели данных и импортированных рисков.

Sprint 15 условный: он начинается только после пилотного feedback или подтверждённого рыночного сигнала.

---

## 6. Commercial MVP Boundary

Коммерческий MVP считается спланированным до состояния:

- продукт можно показать CISO без пустых экранов;
- данные можно загрузить без интеграций;
- отчёты можно передать руководству;
- Trust Score объясним;
- риски имеют workflow;
- пилот можно запустить и измерить;
- первый коннектор выбирается по evidence, а не заранее.

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
