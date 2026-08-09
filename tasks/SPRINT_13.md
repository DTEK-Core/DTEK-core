# SPRINT 13 — Pilot Risk Workflow

`Проект: DTEK Core`  
`Спринт: 13`  
`Тип: Commercial MVP Feature Sprint`<br>
`Основа: Sprint 12, Risk_Model.md, PRODUCT_STRATEGY.md, ADR-007`  
`Статус: 🚧 В работе`

---

## 1. Цель Спринта

Превратить Risk Registry из реестра записей в минимальный рабочий процесс управления ручными и импортированными рисками.

Риск должен иметь ответственного, срок, origin context, комментарии и понятную историю действий.

---

## 2. Место В Roadmap

| Параметр | Значение |
|---|---|
| Фаза | Commercial MVP |
| Предыдущий Sprint | Sprint 12 — Evidence-backed Trust Explainability |
| Следующий Sprint | Sprint 14 — Pilot Readiness |
| Milestone | Pilot Risk Workflow Ready |

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
- manual/imported risk origin context;
- risk activity history;
- audit events.

### Не входит

- полноценный task manager;
- Jira replacement;
- complex approval workflow;
- автоматическое remediation;
- кастомные workflow states.
- auto-candidate risks, Discovery Inbox и Evidence Layer runtime.

### Стартовая Готовность

- Cloud migration chain `001–018` применена и синхронизирована с Supabase Cloud.
- Sprint 12 реализован; authenticated manual QA честно отложен владельцем до pilot release gate и не отмечен как `PASS`.
- S13-T001 завершена: assignment и SLA используют существующие поля `risks`; migration `018_risk_workflow.sql` нужна только для comments и activity timeline.
- Следующая задача: S13-T006 — Risk Activity Timeline.

---

## 5. Задачи Спринта

| ID | Задача | Приоритет | Оценка | Зависимости |
|---|---|---|---|---|
| S13-T001 | Risk Workflow Data Model Review | P1 | M | S12 |
| S13-T002 | Risk Owner & Assignment UX | P1 | M | T001 |
| S13-T003 | Due Date & SLA Warnings | P1 | M | T001 |
| S13-T004 | Risk Comments | P1 | M | T001 |
| S13-T005 | Risk Origin Context: Manual/Imported UI | P1 | S | T001 |
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
  S13-T005 Risk Origin Context
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

**Решение:** `risks.owner_id`, `due_date`, `sla_days`, `author_id` и status уже
покрывают assignment и SLA без изменения таблицы `risks`. Для comments и
activity timeline в следующих задачах требуется одна минимальная migration
`018_risk_workflow.sql`: tenant-scoped `risk_comments` и immutable
`risk_activity`, обе с RLS, organization indexes и server-side writes. Manual/
imported origin остаётся existing source metadata, без Evidence Layer, Storage
или auto-candidate runtime. Детали зафиксированы в
`docs/architecture/Risk_Workflow_Data_Model.md`.

### S13-T002 — Risk Owner & Assignment UX

**Описание:** назначать ответственного за риск из пользователей организации.

**Ожидаемый результат:** риск имеет владельца, отображаемого в списке и drawer.

**Решение:** owner и analyst выбирают активного участника своей организации
при создании или редактировании риска, включая снятие назначения. Server Action
валидирует UUID и tenant/status выбранного профиля; admin и viewer не получают
список для назначения и не могут вызвать изменение на сервере.

### S13-T003 — Due Date & SLA Warnings

**Описание:** улучшить отображение сроков и просрочек.

**Ожидаемый результат:** риски подсвечиваются как overdue / due soon / on track.

**Решение:** owner и analyst задают или меняют date-only срок и SLA в форме
риска; явная дата имеет приоритет, иначе `due_date` вычисляется из `sla_days`.
Для активных рисков единый helper показывает `Просрочено`, `Скоро срок`
(менее трёх дней) или `В графике`; завершённые статусы останавливают SLA-warning.

### S13-T004 — Risk Comments

**Описание:** добавить комментарии к риску для рабочей коммуникации.

**Ожидаемый результат:** команда может фиксировать ход устранения риска.

**Решение:** migration 018 создаёт tenant-scoped immutable `risk_comments` и
foundation `risk_activity` с deny-by-default mutation policies. Owner и analyst
добавляют комментарии до 2000 символов через авторизованный Server Action;
admin и viewer читают комментарии без возможности изменения. Успешный comment
создаёт activity event `comment_added`.

### S13-T005 — Risk Origin Context: Manual/Imported UI

**Описание:** показать происхождение существующего риска как manual или imported и связать его с уже реализованным source context.

**Ожидаемый результат:** пользователь понимает происхождение риска без новой Evidence Layer table, Storage-архитектуры или auto-candidate runtime.

**Решение:** Risk Registry показывает компактный origin badge `Вручную` или
`Импорт`, а drawer — source name, source type, collected date и confidence для
импортированных рисков. Read model строится server-side из существующего
trailing `[Import Source]` block, не передаёт `source_record_id` клиенту и явно
отделяет source context от будущей Evidence-записи. Ручные и повреждённые
metadata получают безопасный manual fallback. Форма редактирования показывает
только пользовательское описание, а Server Action сохраняет исходный import
block при обновлении риска. Новых таблиц, прав, зависимостей и score logic нет.

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

- [x] S13-T001: минимальная модель workflow согласована с текущей схемой и RLS.
- [x] S13-T002: риск имеет владельца, отображаемого в списке и drawer.
- [x] S13-T003: SLA/due date редактируются и подсвечиваются по состоянию.
- [x] S13-T004: immutable комментарии доступны в risk drawer с RBAC/RLS.
- [x] S13-T005: manual/imported origin context отображается; auto candidates остаются Post-MVP.
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
| Scope станет Evidence Layer runtime | Средняя | Высокое | Ограничить Sprint manual/imported origin context |
| Workflow станет task manager | Средняя | Среднее | Не заменять Jira/ServiceDesk |
| Новая таблица без RLS | Низкая | Критическое | Любая миграция только с RLS |
