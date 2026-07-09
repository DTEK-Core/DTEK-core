# SPRINT 13 — Evidence-aware Risk Workflow

`Проект: DTEK Core`  
`Спринт: 13`  
`Тип: Market MVP Feature Sprint`  
`Основа: Sprint 12, Risk_Model.md, PRODUCT_STRATEGY.md, ADR-007`  
`Статус: 📋 Запланирован`

---

## 1. Цель Спринта

Превратить Risk Registry из реестра записей в рабочий процесс управления ручными, импортированными и автоматически предложенными рисками.

Риск должен иметь ответственного, срок, evidence/source context, комментарии и понятную историю действий.

---

## 2. Место В Roadmap

| Параметр | Значение |
|---|---|
| Фаза | Market MVP / Pilot MVP |
| Предыдущий Sprint | Sprint 12 — Evidence-backed Trust Explainability |
| Следующий Sprint | Sprint 14 — Pilot Readiness |
| Milestone | Evidence-aware Risk Workflow Ready |

---

## 3. Бизнес-Ценность

Для пилота недостаточно показать риск. Клиент должен назначить ответственного, вести работу, прикладывать доказательства, понимать происхождение риска и видеть просрочки. Это делает DTEK Core операционным инструментом, а не витриной.

---

## 4. Scope / Non-Scope

### Входит

- risk owner;
- due date UX;
- SLA warnings;
- comments;
- manual/imported/auto risk evidence strategy;
- risk activity history;
- audit events.

### Не входит

- полноценный task manager;
- Jira replacement;
- complex approval workflow;
- автоматическое remediation;
- кастомные workflow states.

---

## 5. Задачи Спринта

| ID | Задача | Приоритет | Оценка | Зависимости |
|---|---|---|---|---|
| S13-T001 | Risk Workflow Data Model Review | P1 | M | S12 |
| S13-T002 | Risk Owner & Assignment UX | P1 | M | T001 |
| S13-T003 | Due Date & SLA Warnings | P1 | M | T001 |
| S13-T004 | Risk Comments | P1 | M | T001 |
| S13-T005 | Evidence Strategy & Manual/Imported/Auto Risk UI | P1 | M | T001 |
| S13-T006 | Risk Activity Timeline | P2 | M | T002–T005 |
| S13-T007 | Audit Events For Risk Workflow | P1 | S | T002–T006 |
| S13-T008 | Risk Workflow Documentation & QA | P1 | S | T001–T007 |

---

## 6. Порядок Выполнения

```text
День 1
  S13-T001 Data Model Review
  S13-T002 Risk Owner UX

День 2
  S13-T003 Due Date & SLA Warnings
  S13-T004 Risk Comments

День 3
  S13-T005 Evidence Strategy
  S13-T007 Audit Events

День 4
  S13-T006 Activity Timeline
  S13-T008 Documentation & QA
```

---

## 7. Детализация Задач

### S13-T001 — Risk Workflow Data Model Review

**Описание:** проверить, какие поля уже есть в `risks`, и определить минимальные изменения схемы, если они нужны.

**Ожидаемый результат:** решение: использовать существующие поля или добавить миграцию с RLS.

### S13-T002 — Risk Owner & Assignment UX

**Описание:** назначать ответственного за риск из пользователей организации.

**Ожидаемый результат:** риск имеет владельца, отображаемого в списке и drawer.

### S13-T003 — Due Date & SLA Warnings

**Описание:** улучшить отображение сроков и просрочек.

**Ожидаемый результат:** риски подсвечиваются как overdue / due soon / on track.

### S13-T004 — Risk Comments

**Описание:** добавить комментарии к риску для рабочей коммуникации.

**Ожидаемый результат:** команда может фиксировать ход устранения риска.

### S13-T005 — Evidence Strategy & Manual/Imported/Auto Risk UI

**Описание:** определить безопасный MVP-подход к evidence и происхождению риска: manual, imported, auto candidate, confirmed auto risk.

**Ожидаемый результат:** риск показывает происхождение и evidence без преждевременной тяжёлой файловой архитектуры или с минимальной Storage-архитектурой при необходимости.

### S13-T006 — Risk Activity Timeline

**Описание:** показать историю ключевых действий по риску.

**Ожидаемый результат:** drawer показывает изменения статуса, владельца, сроков и комментарии.

### S13-T007 — Audit Events For Risk Workflow

**Описание:** логировать критичные действия по рискам.

**Ожидаемый результат:** audit log отражает назначение, изменение срока и закрытие риска.

### S13-T008 — Documentation & QA

**Описание:** обновить пользовательский guide и тестовый чеклист.

**Ожидаемый результат:** процесс работы с риском описан и проверяем.

---

## 8. Definition Of Done

- [ ] Риск имеет владельца.
- [ ] SLA/due date видны и подсвечиваются.
- [ ] Есть комментарии или зафиксированное MVP-решение.
- [ ] Evidence/source context реализован или задокументирован как ограничение.
- [ ] Activity timeline отражает ключевые события.
- [ ] Audit events работают.
- [ ] Документация обновлена.
- [ ] `npm run type-check` проходит.
- [ ] `npm run lint` проходит.
- [ ] `npm run build` проходит.

---

## 9. Риски

| Риск | Вероятность | Влияние | Митигирование |
|---|---|---|---|
| Evidence потребует Supabase Storage | Средняя | Среднее | Сначала определить MVP evidence strategy |
| Workflow станет task manager | Средняя | Среднее | Не заменять Jira/ServiceDesk |
| Новая таблица без RLS | Низкая | Критическое | Любая миграция только с RLS |
