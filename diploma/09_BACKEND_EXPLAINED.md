# 09. Backend и Server Actions

Backend DTEK Core — Server Actions, report/import/trust services, middleware и PostgreSQL functions/policies.

## Типовой action

1. Получает вызов формы.
2. Читает user через `supabase.auth.getUser()`.
3. Получает профиль, роль и `organization_id`.
4. Валидирует вход Zod-схемой.
5. Выполняет tenant-scoped запрос.
6. Возвращает безопасную ошибку без деталей БД.
7. Вызывает `revalidatePath()`.

## Реальные операции

- Создание объекта: `lib/actions/objects.ts` → `objects` → DB-trigger паспорта → `lib/trust/engine.ts`.
- Изменение риска: `lib/actions/risks.ts` → `risks/object_risks` → пересчёт связанных объектов.
- Import: browser parser → preview action → pure prepare function → commit action → audit.
- Dashboard: server page выполняет tenant-scoped выборки и передаёт read model клиентским диаграммам.
- Trust Score: `calculate.ts` является pure-формулой, `engine.ts` читает/сохраняет данные, `explainability.ts` объясняет результат.

Admin/service client обходит RLS. Поэтому его допустимо использовать только server-side и только после явной проверки user, role, tenant и принадлежности target. Это повышенный риск, а не удобная замена обычному клиенту.

> Главное, что нужно запомнить: Server Action доступен для прямого вызова, поэтому вся защита должна находиться внутри action, а не только в кнопке.

## Проверь себя

1. Почему action повторно проверяет роль?
2. Что делает `revalidatePath`?
3. Чем pure calculation отличается от engine?
4. Почему service role опасен?

