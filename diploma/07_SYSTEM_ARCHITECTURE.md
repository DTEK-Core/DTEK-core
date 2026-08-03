# 07. Архитектура системы

## Аналогия

Frontend — рабочее окно, Server Actions — сотрудники приёмной, PostgreSQL — архив, RLS — охрана у каждой полки, организация — отдельный кабинет клиента, audit — журнал действий.

## Техническая схема

```mermaid
flowchart TB
  B[Browser: React] --> N[Next.js App Router]
  N --> A[Server Components / Actions]
  A --> S[Supabase Auth]
  A --> P[(PostgreSQL + RLS)]
  A --> T[Trust Engine]
  T --> P
  P --> A --> B
```

Next.js выбран для UI и server-side операций в одном TypeScript-проекте. TypeScript уменьшает класс ошибок типов. Supabase даёт Auth, PostgreSQL и API, но не отменяет проектирование доступа. PostgreSQL обеспечивает связи, constraints, индексы и RLS.

## Движение запроса

```mermaid
sequenceDiagram
  participant U as Пользователь
  participant UI as React UI
  participant SA as Server Action
  participant DB as PostgreSQL/RLS
  U->>UI: Отправляет форму
  UI->>SA: Передаёт данные
  SA->>SA: Session + role + Zod
  SA->>DB: Tenant-scoped query
  DB->>DB: Constraint + RLS
  DB-->>SA: Результат
  SA-->>UI: Result + revalidate
```

Бизнес-логика находится в `lib/actions`, `lib/trust`, `lib/import`, `lib/reports`; browser input всегда недоверенный. Multi-tenancy обеспечивается совместно: server-side tenant scope плюс RLS.

Остальные диаграммы собраны в [diagrams/README.md](diagrams/README.md).

> Главное, что нужно запомнить: RLS — последний барьер, но приложение всё равно обязано проверять роль и tenant до запроса.

## Проверь себя

1. Почему нельзя доверять `organization_id` из формы?
2. Что делает Server Action?
3. Какую роль играет PostgreSQL помимо хранения?

