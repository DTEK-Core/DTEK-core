# 05. Карта функциональности

Подробности каждого ядра находятся в документах 12–17. Здесь единая фактическая карта.

| Модуль | Статус | Что работает сейчас | Основные пути |
|---|---|---|---|
| Auth | Реализовано | Регистрация, вход, logout, reset | `lib/actions/auth.ts`, `app/(auth)/` |
| Organizations/onboarding | Реализовано | Создание tenant, веса, приглашения | `lib/actions/organizations.ts`, `onboarding.ts` |
| App Shell | Реализовано | Защищённый layout и навигация | `app/(app)/layout.tsx` |
| Users/RBAC | Реализовано | Роли, приглашения, блокировка | `lib/actions/users.ts`, `invitations.ts` |
| Objects | Реализовано | CRUD, фильтры, ручной ввод/import | `lib/actions/objects.ts` |
| Trust Passport | Реализовано | Паспорт, факторы, риски, связи, история | `objects/[id]/passport`, `passport-report.ts` |
| Trust Score | Реализовано | 6 факторов, веса, история, объяснимость | `lib/trust/` |
| Trust Graph | Реализовано частично | Ручные связи и визуализация | `lib/actions/relations.ts`, `components/shared/graph/` |
| Risk Registry | Реализовано частично | CRUD, связи, import, статусы/сроки | `lib/actions/risks.ts` |
| Configurator | Реализовано | Веса с суммой 100 и пересчёт | `lib/actions/configurator.ts` |
| Dashboard | Реализовано | KPI, trend, distribution, top risks, drivers | `app/(app)/dashboard/` |
| CSV/XLSX import | Реализовано | Preview, validation, duplicates, partial success | `lib/import/`, `lib/actions/*-imports.ts` |
| Export/templates | Реализовано | CSV риска, PDF/print reports, шаблоны | `lib/reports/`, `public/templates/` |
| Source Metadata | Реализовано частично | Текстовый import source block | `lib/import/shared.ts` |
| Audit trail | Реализовано частично | Security events для критичных действий | `lib/security/`, migration 017 |
| Reporting | Реализовано | Passport и executive reports, risk CSV | `app/(app)/reports/` |
| Evidence Layer | Подготовлена архитектура | Отдельных records/tables нет | `docs/architecture/Evidence_First_Architecture.md` |
| Discovery/Inbox | Запланировано | Runtime/UI отсутствуют | Sprint 15 и Post-MVP |
| Connectors | Подготовлена архитектура | Connector runtime отсутствует | Sprint 15 |
| Identity resolution/dedup | Частично/запланировано | Import duplicate check есть; cross-source merge нет | `lib/import/`; future architecture |
| Confidence Engine | Запланировано | Metadata отображается, на Score не влияет | Roadmap |
| Drift Detection | Запланировано | Нет runtime | Backlog |
| Auto Risk Mapper | Запланировано | Нет runtime | Backlog |

## Общий технический шаблон работающего модуля

Пользователь работает с React-компонентом; Server Action получает сессию, определяет профиль и организацию, валидирует Zod, выполняет tenant-scoped запрос, БД применяет RLS/constraints, затем Next.js revalidate обновляет экран.

> Главное, что нужно запомнить: наличие документа или интерфейса без бизнес-логики не считается реализацией.

## Проверь себя

1. Какие модули реализованы частично?
2. Чем import dedup отличается от Identity Resolution?
3. Где находится backend текущего MVP?

