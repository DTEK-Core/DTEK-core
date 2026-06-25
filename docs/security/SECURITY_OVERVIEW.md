# SECURITY_OVERVIEW.md — DTEK Core

`Версия: 1.0`  
`Дата: 25.06.2026`  
`Статус: Актуальный`

---

## Обзор безопасности платформы

DTEK Core — платформа управления цифровым доверием организации. Поскольку платформа хранит чувствительные данные об инфраструктуре, уязвимостях и инцидентах безопасности, безопасность является неотъемлемым требованием, а не дополнительной опцией.

---

## Уровни защиты

Защита платформы реализована на четырёх уровнях:

### Уровень 1 — Сетевой и транспортный

- **TLS/HTTPS** — все соединения зашифрованы (Vercel enforces HTTPS)
- **Security Headers** — CSP, X-Frame-Options, X-Content-Type-Options, Permissions-Policy, Referrer-Policy (настроены в `next.config.mjs`)
- **Rate Limiting** — IP-based: `/join` 10 req/60s, `/api/*` 60 req/60s
- **Payload Limit** — запросы > 100 KB отклоняются (413)

### Уровень 2 — Аутентификация и сессии

- **Auth Provider**: Supabase Auth (JWT, Email+Password)
- **Password Reset** — email-подтверждение через Supabase SMTP
- **Invite Flow** — токены приглашений с ограниченным сроком жизни
- **Session Management** — JWT в httpOnly cookies (Next.js middleware)
- **Middleware Guard** — все `/app/*` маршруты требуют активной сессии

### Уровень 3 — Авторизация (RBAC)

Четыре роли с разграничением по принципу минимальных привилегий:

| Роль | Ключ БД | Возможности |
|---|---|---|
| Владелец | `owner` | Полный контроль над организацией |
| Аналитик ИБ | `analyst` | Объекты, риски, паспорта, конфигуратор |
| Администратор | `admin` | Инфраструктурные объекты, управление пользователями |
| Наблюдатель | `viewer` | Только просмотр |

RBAC проверяется **на сервере** в каждом Server Action. Клиентская видимость элементов UI — дополнительная мера, но не единственная.

### Уровень 4 — Изоляция данных (RLS)

Row Level Security в PostgreSQL (Supabase) гарантирует:
- Пользователь видит только данные своей организации
- Обход через прямые запросы к Supabase API невозможен
- Каждая таблица имеет собственные RLS-политики
- `SUPABASE_SERVICE_ROLE_KEY` используется только в Server Actions, никогда на клиенте

---

## Реализованные меры безопасности (Sprint 01–06)

| Мера | Sprint | Статус |
|---|---|---|
| Auth Middleware & Route Guards | S01 | ✅ |
| RBAC на уровне Server Actions | S01–S03 | ✅ |
| RLS-политики на всех таблицах | S01 (014 миграций) | ✅ |
| Security Headers (CSP, X-Frame-Options, ...) | S06 | ✅ |
| IP Rate Limiting | S06 | ✅ |
| Payload Size Guard | S06 | ✅ |
| Zod Input Validation | S06 | ✅ |
| RLS Hardening (migration 016) | S06 | ✅ |
| Security Audit Log | S06 | ✅ |
| RBAC Fixes (migration 017 + SA changes) | S06 | ✅ |

---

## Связанные документы

| Документ | Содержание |
|---|---|
| [RBAC_MODEL.md](RBAC_MODEL.md) | Подробная матрица прав доступа |
| [RLS_MODEL.md](RLS_MODEL.md) | RLS-политики для каждой таблицы |
| [THREAT_MODEL.md](THREAT_MODEL.md) | Угрозы и контрмеры |
| [SECURE_SDLC.md](SECURE_SDLC.md) | Процесс безопасной разработки |
| [SECURITY_REQUIREMENTS.md](SECURITY_REQUIREMENTS.md) | Требования к безопасности |
| [SECURITY_TESTING_PLAN.md](SECURITY_TESTING_PLAN.md) | План тестирования безопасности |
| [VULNERABILITY_MANAGEMENT.md](VULNERABILITY_MANAGEMENT.md) | Управление уязвимостями |
| [DEPENDENCY_MANAGEMENT.md](DEPENDENCY_MANAGEMENT.md) | Управление зависимостями |
| [DEPENDENCY_AUDIT_S06.md](DEPENDENCY_AUDIT_S06.md) | Аудит зависимостей Sprint 06 |

---

## Планы безопасности (Sprint 09+)

- Расширенное тестирование безопасности (SAST, dependency scanning)
- ФСТЭК-ориентированные требования для enterprise
- 2FA (TOTP)
- Audit Log расширение (экспорт, фильтры, retention)
- Secure SDLC в CI/CD

*Подробнее: [SECURE_SDLC.md](SECURE_SDLC.md)*
