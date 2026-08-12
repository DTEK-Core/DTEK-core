# SECURITY_OVERVIEW.md — DTEK Core

`Версия: 1.2`
`Дата: 12.08.2026`
`Статус: Актуальный`

---

## Обзор безопасности платформы

DTEK Core — Evidence-first Trust Intelligence Platform. Поскольку платформа хранит чувствительные данные об инфраструктуре, уязвимостях, источниках данных и инцидентах безопасности, безопасность является неотъемлемым требованием, а не дополнительной опцией.

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
| Администратор | `admin` | Инфраструктурные объекты, просмотр рисков и графа |
| Наблюдатель | `viewer` | Только просмотр |

RBAC проверяется **на сервере** в каждом Server Action. Клиентская видимость элементов UI — дополнительная мера, но не единственная.

### Уровень 4 — Изоляция данных (RLS)

Row Level Security в PostgreSQL (Supabase) гарантирует:
- Пользователь видит только данные своей организации
- Обход через прямые запросы к Supabase API невозможен
- Каждая таблица имеет собственные RLS-политики
- `SUPABASE_SERVICE_ROLE_KEY` используется только в Server Actions, никогда на клиенте

### Уровень 5 — Evidence / Connector Security

ADR-007 добавляет будущие источники данных и коннекторы. Для них обязательны:

- secrets только server-side;
- `organization_id` и RLS для всех evidence/source tables;
- audit events для import/sync/connect/disconnect;
- safe error handling без раскрытия tokens/passwords;
- idempotent sync;
- отдельный security review до первого production connector.

---

## Реализованные меры безопасности (Sprint 01–13)

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
| Import Audit Events без raw CSV data | S11 | ✅ |
| Risk Workflow Audit Events без UUID и comment body | S13 | ✅ |
| Audit Log privileged-read RLS (migration 019) | S13 | ✅ |

---

## Security Audit Log

Журнал аудита доступен в `/settings` → «Журнал аудита» для ролей
`owner` и `admin`. В Sprint 08 журнал получил визуальные категории
событий (`Доступ`, `Конфиг`, `Пользователи`, `Система`), клиентский
фильтр по категории, иконки событий и отображение инициатора с
мини-аватаром.

Sprint 11 добавляет события `import.objects_completed`,
`import.risks_completed` и `import.failed`. Они содержат источник и
агрегированные счётчики результата, но не содержимое CSV/XLSX, IP-адреса,
описания объектов/рисков или source record identifiers.

Sprint 13 добавляет события `risk.owner_changed`, `risk.due_date_changed` и
`risk.status_changed`. Они создаются после успешной mutation и содержат только
безопасный before/after context: display names, даты, SLA и статусы. В metadata
не передаются внутренние UUID, description, import source и текст комментариев.
Migration 019 дополнительно ограничивает прямой RLS SELECT журнала ролями
`owner` и `admin`; одной только скрытой вкладки UI недостаточно для RBAC.

Экспорт, retention-политики и расширенные расследовательские фильтры
остаются в плане Sprint 09+.

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
- Connector security model для Sprint 15

*Подробнее: [SECURE_SDLC.md](SECURE_SDLC.md)*
