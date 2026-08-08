# Risk Workflow Data Model

`Sprint: 13`  
`Задача: S13-T001 — Risk Workflow Data Model Review`  
`Статус: утверждённая минимальная спецификация`

## Решение

Sprint 13 расширяет ручной и импортированный Risk Registry до pilot workflow,
не меняя Trust Score formula, Evidence-first boundary или multi-tenant model.

Таблица `risks` уже содержит достаточные поля для первой части workflow:

| Возможность | Текущее поле | Решение |
|---|---|---|
| Ответственный | `owner_id` | Переиспользовать; Server Action проверяет участника той же организации. |
| Срок и SLA | `due_date`, `sla_days` | Переиспользовать; warning вычисляется в UI из текущей даты. |
| Статус | `status`, `resolved_at` | Переиспользовать утверждённый lifecycle. |
| Автор | `author_id` | Переиспользовать для контекста создания. |
| Origin | existing manual/import source metadata | Не добавлять evidence table, source ID или auto-candidate state. |

## Минимальная Migration 018

Для comments и читаемой истории нужна одна локальная migration
`018_risk_workflow.sql`, которая будет создана только в задачах реализации
comments/activity.

### `risk_comments`

| Поле | Назначение |
|---|---|
| `id` | UUID primary key |
| `organization_id` | tenant boundary и индекс |
| `risk_id` | ссылка на `risks`, cascade delete |
| `author_id` | ссылка на `profiles`, `SET NULL` |
| `body` | обязательный текст с ограничением длины |
| `created_at` | UTC timestamp |

Комментарии в MVP immutable: редактирование и удаление не входят в scope.

### `risk_activity`

| Поле | Назначение |
|---|---|
| `id` | UUID primary key |
| `organization_id` | tenant boundary и индекс |
| `risk_id` | ссылка на `risks`, cascade delete |
| `actor_id` | ссылка на `profiles`, `SET NULL` |
| `event_type` | allowlist workflow events |
| `metadata` | безопасный structured before/after context без secrets |
| `created_at` | UTC timestamp |

Минимальный allowlist: `owner_assigned`, `due_date_changed`, `status_changed`,
`comment_added`. Для существующих рисков origin отображается как read model и
не требует отдельного activity event.

## Security And RLS

- обе таблицы имеют `organization_id NOT NULL` и RLS;
- read policy использует текущую организацию, как остальные tenant tables;
- прямые user-client mutations запрещены;
- Server Actions авторизуют owner/analyst перед write и используют server-only
  admin client;
- `risk_activity` immutable после записи;
- `owner_id` обязательно проверяется как профиль текущей организации, чтобы
  исключить cross-tenant assignment;
- metadata не хранит service keys, raw errors или внутренние snapshot values,
  которые не предназначены для UI.

## Non-Goals

- новая Evidence Layer table или Storage architecture;
- connector/discovery runtime и auto-candidate risks;
- task manager, approvals, reminders или custom workflow states;
- изменение RLS/RBAC model, Trust Score formula или product boundary.

## Delivery Order

1. S13-T002 и S13-T003 используют существующие `owner_id`, `due_date`,
   `sla_days`.
2. S13-T004 создаёт migration 018 и comments flow.
3. S13-T006 использует `risk_activity` для timeline.
4. S13-T007 дополняет workflow действия security audit events.
