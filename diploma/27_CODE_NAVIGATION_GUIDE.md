# 27. Навигация по коду

| Путь | Что находится | Перед изменением |
|---|---|---|
| `app/` | Маршруты, layouts, server pages, API | Проверить route и auth boundary |
| `components/ui/` | Базовые UI primitives | Не ломать общий API |
| `components/shared/` | Предметный UI | Найти caller и states |
| `lib/actions/` | Server Actions | Проверить auth/role/tenant/Zod/audit |
| `lib/trust/` | Формула, engine, explainability | Прочитать ADR-001 и tests |
| `lib/import/` | Parsing contracts и normalization | Прочитать import schema/tests |
| `lib/reports/` | Report read models/exports | Проверить report RBAC |
| `lib/supabase/` | Browser/server/admin clients | Не раскрывать service role |
| `lib/security/` | Audit helpers | Проверить metadata leakage |
| `types/` | TypeScript contracts | Не считать заглушку DB type истинной схемой |
| `supabase/migrations/` | Фактическая DB/RLS | Новая миграция, не правка применённой |
| `docs/` | Источники product/architecture/security | Проверять актуальность даты/Sprint |
| `tasks/` | Backlog и Sprint | Не начинать Sprint без решения |
| `testing/` | Contract fixtures/tests | Сохранять воспроизводимость |
| `diploma/` | Учебная база | Обновлять при существенных изменениях |

## Я хочу изменить X

| X | Начать с |
|---|---|
| Кнопку | Компонент страницы → `components/ui/button.tsx` |
| Форму объекта | `object-form.tsx`, schemas, `actions/objects.ts` |
| Trust Score | ADR-001 → `calculate.ts` → engine/tests/docs |
| RLS | `docs/security/RLS_MODEL.md` → migration policies |
| CSV import | `lib/import/*`, import actions, Sprint 11 tests |
| Таблицу БД | Последняя migration → новая migration → RLS/types/docs |
| Trust Graph | graph page/components, relations action/migration |
| Роль | RBAC model, actions, RLS policies, tests |
| Dashboard | server page → dashboard components → explainability |
| Connector | Evidence architecture и Sprint 15; runtime пока не начинать |

Правило трассировки: page → component → action/service → Supabase client → table/policy → revalidate/read model → UI.

> Главное, что нужно запомнить: изменение интерфейса часто затрагивает контракт, доступ, БД, tests и docs.

## Проверь себя

1. Где искать создание relation?
2. Что читать перед изменением Score?
3. Почему применённую migration не переписывают?
4. Как проследить создание объекта?

