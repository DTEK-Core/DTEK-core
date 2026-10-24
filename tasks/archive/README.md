# DTEK Core — Sprint Archive

`Статус: REFERENCE`
`Дата консолидации: 24.10.2026`
`Назначение: неизменяемая история разработки Sprint 01–15`

---

## Правила Архива

- Архив сохраняет исходные Sprint-документы и принятые в них решения.
- Старые статусы и unchecked checklist внутри файлов являются историческими и
  не заменяют фактическое состояние кода или текущий Roadmap.
- Незакрытые acceptance gates Sprint 12–14 перенесены в активный
  `tasks/SECURITY_STABILIZATION_GATE.md` и Pilot Readiness documentation.
- Архивные Sprint не возобновляются и не редактируются для планирования новых
  работ. Для нового scope создаётся новый Sprint с продолжающейся нумерацией.

---

## Классификация

| Документ | Статус | Фактический результат / перенос |
|---|---|---|
| [SPRINT_01.md](SPRINT_01.md) | COMPLETED | Infrastructure, schema baseline, CI/CD |
| [SPRINT_02.md](SPRINT_02.md) | COMPLETED | Auth, organizations, users, onboarding |
| [SPRINT_03.md](SPRINT_03.md) | COMPLETED | Objects, Trust Passport, Risk Registry |
| [SPRINT_04.md](SPRINT_04.md) | COMPLETED | Stabilization and manual QA cycle |
| [SPRINT_05.md](SPRINT_05.md) | COMPLETED | Trust Score, Graph, Dashboard, Configurator |
| [SPRINT_06.md](SPRINT_06.md) | COMPLETED | Security hardening baseline; later audit findings supersede claims of completeness |
| [SPRINT_07.md](SPRINT_07.md) | REFERENCE | Historical QA plans and results |
| [SPRINT_08.md](SPRINT_08.md) | REFERENCE | Product/UX review source |
| [SPRINT_08_IMPLEMENTATION.md](SPRINT_08_IMPLEMENTATION.md) | COMPLETED | UX refinement implementation |
| [SPRINT_09.md](SPRINT_09.md) | COMPLETED | Market MVP packaging |
| [SPRINT_10.md](SPRINT_10.md) | COMPLETED | Reporting and export |
| [SPRINT_11.md](SPRINT_11.md) | COMPLETED | CSV/XLSX onboarding and source context |
| [SPRINT_12.md](SPRINT_12.md) | REFERENCE | Implementation complete; authenticated QA moved to active Gate |
| [SPRINT_13.md](SPRINT_13.md) | REFERENCE | Implementation complete; multi-role QA moved to active Gate |
| [SPRINT_14.md](SPRINT_14.md) | REFERENCE | Pilot readiness artifacts complete; factual release gates remain pending |
| [SPRINT_15.md](SPRINT_15.md) | COMPLETED | Connector Foundation Ready / Runtime Deferred |

Итого: 16 документов, описывающих 15 завершённых исторических Sprint.

---

## Активные И Будущие Документы

- Active blocking stage: [Security & Stabilization Gate](../SECURITY_STABILIZATION_GATE.md).
- Current task map: [tasks/README.md](../README.md).
- Planned continuation: `tasks/SPRINT_16.md`–`tasks/SPRINT_35.md`.
- Design work remains separate in `tasks/disign/`.
