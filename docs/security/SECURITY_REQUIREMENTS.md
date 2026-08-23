# SECURITY_REQUIREMENTS.md — DTEK Core

`Версия: 1.1`
`Дата: 23.08.2026`
`Статус: MVP — базовые требования`

---

## Область применения

Документ фиксирует требования к безопасности DTEK Core MVP. Требования разделены на:
- **Реализованные** — выполнены в Sprint 01–06
- **Обязательные для MVP** — должны быть выполнены до MVP-релиза
- **Пост-MVP** — Sprint 09+ и Enterprise

---

## Категории требований

### 1. Аутентификация (AuthN)

| ID | Требование | Приоритет | Статус |
|---|---|---|---|
| AUTH-01 | Email+password аутентификация с подтверждением email | P1 | ✅ Sprint 01 |
| AUTH-02 | Сброс пароля через email (секурный токен) | P1 | ✅ Sprint 01 |
| AUTH-03 | Выход из системы с инвалидацией сессии | P1 | ✅ Sprint 01 |
| AUTH-04 | Защита маршрутов через middleware | P1 | ✅ Sprint 01 |
| AUTH-05 | 2FA (TOTP/SMS) | P2 | 🔜 Sprint 09 |
| AUTH-06 | SSO/SAML для enterprise | P3 | 🔜 v2.0 |

### 2. Авторизация (AuthZ / RBAC)

| ID | Требование | Приоритет | Статус |
|---|---|---|---|
| RBAC-01 | 4 роли: owner, analyst, admin, viewer | P1 | ✅ Sprint 01 |
| RBAC-02 | Проверка RBAC на сервере (Server Actions) | P1 | ✅ Sprint 01–06 |
| RBAC-03 | Запрет приглашения с ролью owner | P1 | ✅ Sprint 02 |
| RBAC-04 | Admin не может изменить роль owner | P1 | ✅ Sprint 06 |
| RBAC-05 | Скрытие UI-элементов недоступных действий | P2 | ✅ Sprint 02–06 |

### 3. Изоляция данных (Data Isolation)

| ID | Требование | Приоритет | Статус |
|---|---|---|---|
| ISO-01 | RLS на всех таблицах с данными организации | P1 | ✅ Sprint 01 |
| ISO-02 | Фильтрация по organization_id через helper functions | P1 | ✅ Sprint 01 |
| ISO-03 | Service Role Key — только на сервере, нет в клиентском коде | P1 | ✅ Sprint 01 |
| ISO-04 | Ужесточение RLS-политик (миграция 016) | P1 | ✅ Sprint 06 |

### 4. Валидация входных данных

| ID | Требование | Приоритет | Статус |
|---|---|---|---|
| VAL-01 | Zod-валидация всех Server Action входов | P1 | ✅ Sprint 06 |
| VAL-02 | Ограничение payload size (100 KB) | P1 | ✅ Sprint 06 |
| VAL-03 | Sanitization XSS-опасных полей | P1 | ✅ React escaping |
| VAL-04 | Параметризованные запросы (no SQL injection) | P1 | ✅ Supabase client |

### 5. Сетевая безопасность

| ID | Требование | Приоритет | Статус |
|---|---|---|---|
| NET-01 | HTTPS-только (Vercel enforces) | P1 | ✅ |
| NET-02 | Content-Security-Policy (CSP) | P1 | ✅ Sprint 06 |
| NET-03 | X-Frame-Options: DENY | P1 | ✅ Sprint 06 |
| NET-04 | X-Content-Type-Options: nosniff | P1 | ✅ Sprint 06 |
| NET-05 | Permissions-Policy | P1 | ✅ Sprint 06 |
| NET-06 | Referrer-Policy | P1 | ✅ Sprint 06 |
| NET-07 | Rate Limiting (IP-based) | P1 | ✅ Sprint 06 |
| NET-08 | WAF (Web Application Firewall) | P2 | 🔜 Sprint 09 |

### 6. Аудит и мониторинг

| ID | Требование | Приоритет | Статус |
|---|---|---|---|
| AUD-01 | Журнал безопасности (security_events таблица) | P1 | ✅ Sprint 06 |
| AUD-02 | Логирование критических событий (auth, config, users) | P1 | ✅ Sprint 06 |
| AUD-03 | Доступ к журналу: owner, admin | P1 | ✅ Sprint 06 |
| AUD-04 | Алертинг на критические события | P2 | 🔜 Sprint 09 |
| AUD-05 | Экспорт журнала аудита | P2 | 🔜 Sprint 09 |

### 7. Управление секретами

| ID | Требование | Приоритет | Статус |
|---|---|---|---|
| SEC-01 | Нет секретов в коде (только process.env) | P1 | ✅ |
| SEC-02 | `.env.local` в `.gitignore` | P1 | ✅ |
| SEC-03 | Service Role Key только в Server Actions | P1 | ✅ |
| SEC-04 | Ротация ключей при подозрении на компрометацию | P1 | Процедура |

### 8. Connector Framework (Post-MVP)

Эти требования специфицированы S15-T005, но считаются реализованными только
после runtime/migration и фактических acceptance tests.

| ID | Требование | Приоритет | Статус |
|---|---|---|---|
| CONN-01 | Dynamic tenant credentials хранятся в Supabase Vault через opaque reference, без reveal | P1 | 📐 Специфицировано |
| CONN-02 | Connector actions имеют server-side RBAC и immutable tenant context | P1 | 📐 Специфицировано |
| CONN-03 | Connector/evidence tables используют explicit grants, RLS и composite tenant FKs | P1 | 📐 Специфицировано |
| CONN-04 | Server credential boundary не использует RLS bypass как authorization | P1 | 📐 Специфицировано |
| CONN-05 | Outbound requests ограничены allowlist, HTTPS/TLS и SSRF/DNS/redirect policy | P1 | 📐 Специфицировано |
| CONN-06 | Source responses валидируются и ограничиваются по size/time/pages/records | P1 | 📐 Специфицировано |
| CONN-07 | Logs, errors и audit не содержат secrets/raw infrastructure data | P1 | 📐 Специфицировано |
| CONN-08 | Two-tenant, Vault, SSRF, poisoning, replay и restore tests блокируют production activation | P1 | 📐 Специфицировано |

Источник требований:
[CONNECTOR_SECURITY_MODEL.md](CONNECTOR_SECURITY_MODEL.md).

### 9. Требования ФСТЭК (планируется)

| ID | Требование | НПА | Статус |
|---|---|---|---|
| FSTEK-01 | Идентификация и аутентификация | ФСТЭК 17/21 | 🔜 Sprint 09 |
| FSTEK-02 | Управление доступом | ФСТЭК 17/21 | 🔜 Sprint 09 |
| FSTEK-03 | Регистрация событий безопасности | ФСТЭК 17/21 | ⚡ Частично (Sprint 06) |
| FSTEK-04 | Антивирусная защита | ФСТЭК | 🔜 Enterprise |
| FSTEK-05 | Защита каналов передачи данных | ФСТЭК | ✅ TLS |

---

## Статус MVP-готовности

**MVP Security Gate**: все P1 требования должны быть выполнены до MVP-релиза.

| Категория | P1 всего | P1 выполнено | % |
|---|---|---|---|
| Аутентификация | 4 | 4 | 100% |
| Авторизация (RBAC) | 4 | 4 | 100% |
| Изоляция данных | 4 | 4 | 100% |
| Валидация | 4 | 4 | 100% |
| Сетевая безопасность | 7 | 7 | 100% |
| Аудит | 3 | 3 | 100% |
| Секреты | 3 | 3 | 100% |
| **Итого** | **29** | **29** | **100%** |

Все P1-требования безопасности выполнены. MVP security-ready.
