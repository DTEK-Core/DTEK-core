# 18. Модель безопасности

## Активы и границы

Активы: учётные записи, tenant data, инфраструктурные сведения, риски, отчёты, audit и service role key. Границы доверия проходят browser → Next.js server → Supabase API → PostgreSQL и будущие external sources.

Потенциальные нарушители: анонимный пользователь, участник tenant с лишними намерениями, скомпрометированный аккаунт, злоумышленник с leaked key, небезопасный import source.

## Упрощённый STRIDE

| Категория | Простыми словами | Мера проекта | Остаток |
|---|---|---|---|
| Spoofing | Выдать себя за другого | Supabase Auth/session | MFA/SSO не завершены как enterprise controls |
| Tampering | Изменить данные | RBAC, RLS, constraints, Zod | Service-role misuse остаётся критичным |
| Repudiation | Отрицать действие | security_events | Покрытие audit частичное |
| Information disclosure | Увидеть чужое | Tenant RLS, safe errors | Нужен ручной two-tenant QA |
| Denial of service | Перегрузить | Size limits, basic rate limit | In-memory limiter не распределённый |
| Elevation of privilege | Получить лишние права | Role checks, deny policies | Нужны регулярные regression/security tests |

Security headers и middleware обеспечивают базовую perimeter-защиту. Секреты находятся в `.env.local`, который не должен попадать в Git. Import не должен считаться безопасным только по расширению файла.

**Подтверждено кодом/автотестами:** auth wiring, core role checks, RLS migrations, validation, import contracts. **Требует ручного подтверждения:** полная матрица четырёх ролей, tenant isolation, Sprint 12 UI QA. **План:** connector security, stronger distributed rate limiting, enterprise auth/deploy.

> Главное, что нужно запомнить: безопасность MVP — набор слоёв и ограничений, а не заявление «проект защищён».

## Проверь себя

1. Какие доверительные границы есть?
2. Какой STRIDE-риск связан с RLS?
3. Почему audit coverage частичный?
4. Что произойдёт при утечке service role?

