# 11. Auth, RBAC, RLS и multi-tenancy

## Разница понятий

- **Authentication** подтверждает личность через Supabase Auth.
- **Session/token** несёт подтверждение входа между запросами; token нельзя считать разрешением на всё.
- **Authorization** решает, разрешено ли действие.
- **RBAC** назначает права ролям `owner`, `analyst`, `admin`, `viewer`.
- **RLS** применяет правило к каждой строке PostgreSQL.
- **Multi-tenancy** разделяет клиентов одной платформы по `organization_id`.

```text
пользователь → session → Server Action → user/profile
→ organization + role → tenant-scoped query → RLS → разрешённые данные
```

## Роли

Owner управляет организацией и участниками; analyst работает с аналитикой, объектами, рисками, связями и весами; admin администрирует часть данных/пользователей, но намеренно не получает все аналитические удаления; viewer читает. Точная матрица: `docs/security/RBAC_MODEL.md` и SQL policies.

## Угрозы и защита

| Угроза | Противодействие | Фактический статус |
|---|---|---|
| Чтение чужого tenant | `current_org_id()`, RLS, scoped queries | Реализовано; ручной QA двух tenant открыт |
| Подмена `organization_id` | Tenant берётся из profile/session | Реализовано в основных actions |
| Прямой вызов action | Auth/role/Zod внутри action | Реализовано, требует постоянного review |
| Viewer меняет запись | RBAC + RLS | Реализовано |
| Утечка service role | Server-only module, `.env` ignored | Реализована организационная защита; компрометация ключа критична |
| SQL injection | Supabase query builder, parameterization, Zod | Снижение риска; raw SQL всё равно требует review |
| Злой import | Размер/строки, schema validation, preview | Реализовано частично; AV scanning отсутствует |
| Stored XSS | React escaping и validation | Базовая защита; security testing нужен |
| Раскрытие DB errors | Безопасные пользовательские сообщения | Реализовано в основных actions |

Admin client обходит RLS, поэтому server-side проверки должны выполняться до каждого такого запроса. Defense in depth означает, что ошибка одного слоя не должна сразу раскрывать соседний tenant.

> Главное, что нужно запомнить: RBAC отвечает «какое действие», RLS — «какие строки»; нужны оба слоя.

## Проверь себя

1. Что произойдёт при подмене tenant ID?
2. Почему service role нельзя отправить в браузер?
3. Чем session отличается от role?
4. Как проверить изоляцию двух организаций?

