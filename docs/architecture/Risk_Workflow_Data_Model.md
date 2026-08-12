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
| Срок и SLA | `due_date`, `sla_days` | Переиспользовать; date-only deadline хранится до конца UTC-дня, warning вычисляется в UI как overdue / due soon менее трёх дней / on track только для активных рисков. |
| Статус | `status`, `resolved_at` | Переиспользовать утверждённый lifecycle. |
| Автор | `author_id` | Переиспользовать для контекста создания. |
| Origin | existing manual/import source metadata | Не добавлять evidence table, source ID или auto-candidate state. |

## Минимальная Migration 018

Для comments и читаемой истории используется migration
`018_risk_workflow.sql`, созданная в S13-T004.

### `risk_comments`

| Поле | Назначение |
|---|---|
| `id` | UUID primary key |
| `organization_id` | tenant boundary и индекс |
| `risk_id` | ссылка на `risks`, cascade delete |
| `author_id` | ссылка на `profiles`, `SET NULL` |
| `body` | обязательный текст с ограничением длины |
| `created_at` | UTC timestamp |

Комментарии в MVP immutable: owner и analyst добавляют их через Server Action,
а редактирование и удаление не входят в scope. Каждое успешное добавление также
создаёт `comment_added` в `risk_activity` для будущей timeline S13-T006.

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

### Activity Metadata Contract

| Event | UI metadata |
|---|---|
| `owner_assigned` | `previous_owner_name`, `owner_name` |
| `due_date_changed` | `previous_due_date`, `due_date`, `previous_sla_days`, `sla_days` |
| `status_changed` | `previous_status`, `status` |
| `comment_added` | пустой object; текст комментария остаётся в `risk_comments` |

Server Actions не передают в metadata profile, tenant или source UUID. Начальные
owner/due значения ручного риска записываются сразу после create; при ошибке
activity новый risk откатывается до object link. При owner/due/status update
activity создаётся до основной mutation; если mutation не проходит, server-only
client удаляет подготовленные события. Неизменившиеся значения не создают
activity. Комментарий и его event используют существующий rollback flow S13-T004.

Read model загружается по `organization_id`, принимает только утверждённый
allowlist и server-side преобразует metadata в безопасный текст. Drawer получает
только actor display name, event type, timestamp, title и detail. События
отображаются newest-first. Повреждённое metadata получает нейтральный fallback,
неизвестный event не передаётся клиенту.

`risk_activity` является пользовательской историей workflow, а не security
audit log. Security audit для критичных действий добавляется отдельно в
S13-T007. События, совершённые до S13-T006, не синтезируются задним числом.

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
3. S13-T006 использует `risk_activity` для tenant-scoped timeline — завершено.
4. S13-T007 дополняет workflow действия security audit events.
