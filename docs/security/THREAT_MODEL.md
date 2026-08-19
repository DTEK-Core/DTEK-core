# THREAT_MODEL.md — DTEK Core

`Версия: 1.0`  
`Дата: 25.06.2026`  
`Статус: MVP — предварительная версия`

---

## Область применения

Настоящий документ описывает модель угроз для DTEK Core MVP (Cloud-only, Supabase + Vercel). On-premise (Enterprise Runtime) анализируется отдельно в версии 2.0.

**Компоненты в области:**
- Веб-приложение (Next.js на Vercel)
- База данных (PostgreSQL в Supabase Cloud)
- Аутентификация (Supabase Auth)
- HTTPS-трафик между браузером и Vercel

**Вне области MVP:**
- Коннекторы к внешним системам (SIEM, AD, CMDB)
- Edge Functions (Sprint 08+)
- Мобильные клиенты

---

## Потоки данных (Data Flows)

```
[Browser] --HTTPS--> [Vercel / Next.js]
                            |
                    Server Actions / API Routes
                            |
                    [Supabase Cloud]
                     ├── Auth (JWT)
                     ├── PostgreSQL + RLS
                     └── Storage
```

---

## Реестр угроз (STRIDE)

### S — Spoofing (Подделка идентичности)

| # | Угроза | Вектор | Контрмера | Статус |
|---|---|---|---|---|
| S-1 | Вход под чужим аккаунтом | Подбор пароля | Auth rate limiting (Supabase) | ✅ |
| S-2 | Принятие чужого приглашения | Перехват invite-токена | 64-hex bearer token, 7-day expiry, invited email auth, trusted manual delivery | ✅ |
| S-3 | Подделка JWT | Изменение claims | JWT подписан Supabase, проверяется middleware | ✅ |

### T — Tampering (Нарушение целостности)

| # | Угроза | Вектор | Контрмера | Статус |
|---|---|---|---|---|
| T-1 | Изменение Trust Score другой организации | Прямой запрос Supabase API | RLS политики (org isolation) | ✅ |
| T-2 | Повышение собственной роли | Прямой запрос к таблице profiles | RLS: UPDATE только своего профиля; поле role не обновляется пользователем | ✅ |
| T-3 | Подмена данных в Server Action | CSRF | Next.js Server Actions защищены встроенным CSRF-токеном | ✅ |
| T-4 | Инъекция SQL через формы | Параметризованные запросы Supabase | Supabase JS Client: prepared statements | ✅ |

### R — Repudiation (Отрицание)

| # | Угроза | Вектор | Контрмера | Статус |
|---|---|---|---|---|
| R-1 | Отрицание изменения весов конфигуратора | — | security_events: `config.weights_changed` | ✅ |
| R-2 | Отрицание приглашения пользователя | — | security_events: `invitation.sent` | ✅ |
| R-3 | Отрицание блокировки пользователя | — | security_events: `user.blocked` | ✅ |

### I — Information Disclosure (Разглашение)

| # | Угроза | Вектор | Контрмера | Статус |
|---|---|---|---|---|
| I-1 | Утечка данных другой организации через API | Прямой запрос к Supabase | RLS: `organization_id = current_org_id()` | ✅ |
| I-2 | IDOR (Insecure Direct Object Reference) через URL | `objects/[id]` — чужой ID | Server: проверка принадлежности через RLS | ✅ |
| I-3 | Утечка `SUPABASE_SERVICE_ROLE_KEY` | Commit в репозиторий | `.gitignore` + `.env.local`; code review | ✅ |
| I-4 | Утечка через ошибки в ответах API | Verbose error messages | Серверные ошибки не передаются клиенту | ✅ |
| I-5 | Clickjacking | iframe embedding | `X-Frame-Options: DENY` | ✅ |

### D — Denial of Service (Отказ в обслуживании)

| # | Угроза | Вектор | Контрмера | Статус |
|---|---|---|---|---|
| D-1 | Флуд на эндпоинты | Высокочастотные запросы | Rate Limiting: 60 req/60s (API), 10 req/60s (invite/join) | ✅ |
| D-2 | Перегрузка большими payload | Огромные JSON-тела | Payload size limit: 100 KB | ✅ |
| D-3 | DDoS на Vercel уровне | — | Vercel DDoS protection (встроенная) | ✅ |

### E — Elevation of Privilege (Повышение привилегий)

| # | Угроза | Вектор | Контрмера | Статус |
|---|---|---|---|---|
| E-1 | Вызов SA с повышенной ролью | Прямой HTTP POST к SA endpoint | SA проверяет роль через `current_user_role()` | ✅ |
| E-2 | Admin меняет роль owner | UI/SA | SA `changeUserRole`: admin не может менять owner | ✅ |
| E-3 | Viewer создаёт объект | Прямой POST | SA `createObject`: проверка `['owner','analyst','admin']` | ✅ |

---

## Остаточные риски (MVP)

| # | Риск | Вероятность | Влияние | Mitigation plan |
|---|---|---|---|---|
| R-1 | Нет 2FA | Средняя | Высокое | Запланировано на Sprint 09+ |
| R-2 | Нет автоматического logout по неактивности | Низкая | Среднее | Sprint 09+ |
| R-3 | Нет WAF перед Vercel | Низкая | Среднее | Enterprise tier / Sprint 09 |
| R-4 | Email-only подтверждение (без SMS/TOTP) | Средняя | Среднее | 2FA в Sprint 09 |

---

## Пересмотр модели угроз

Модель угроз пересматривается:
- После каждого Security Sprint
- При добавлении новых компонентов (Edge Functions, коннекторы)
- При выявлении инцидентов
- При переходе к on-premise (v2.0)

*Следующий пересмотр: Sprint 09 (Security Sprint)*
