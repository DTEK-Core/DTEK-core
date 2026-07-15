# SECURITY_TESTING_PLAN.md — DTEK Core

`Версия: 1.0`  
`Дата: 25.06.2026`  
`Статус: Sprint 09 ready`

---

## Обзор

Настоящий документ описывает план тестирования безопасности DTEK Core. Тестирование безопасности выполняется отдельно от функционального тестирования и охватывает RBAC, RLS, валидацию, заголовки и потенциальные векторы атак.

---

## Тип 1 — RBAC-тестирование

Подробное руководство: [docs/testing/RBAC_TESTING_GUIDE.md](../testing/RBAC_TESTING_GUIDE.md)

### Объём

- Все 4 роли: owner, analyst, admin, viewer
- Все критические операции: создание объектов, рисков, приглашений, изменение ролей, конфигуратор

### Тест-кейсы (сводка)

| # | Сценарий | Роль | Ожидание |
|---|---|---|---|
| T1.1 | Analyst создаёт риск | analyst | ✅ разрешено |
| T1.2 | Analyst меняет роль другого пользователя | analyst | ❌ ошибка |
| T1.3 | Admin создаёт объект типа `app` | admin | ❌ ошибка |
| T1.4 | Admin создаёт объект типа `server` | admin | ✅ разрешено |
| T1.5 | Admin создаёт риск | admin | ❌ ошибка |
| T1.6 | Admin меняет роль owner | admin | ❌ ошибка |
| T1.7 | Viewer создаёт объект | viewer | ❌ ошибка |
| T1.8 | Viewer видит журнал аудита | viewer | ❌ вкладки нет |
| T1.9 | Analyst сохраняет веса конфигуратора | analyst | ✅ разрешено |
| T1.10 | Viewer создаёт связь в графе | viewer | ❌ ошибка |
| T1.11 | Admin создаёт invite-ссылку | admin | ❌ ошибка или недоступная кнопка |

---

## Тип 2 — RLS-тестирование

### Сценарии изоляции данных

| # | Сценарий | Метод | Ожидание |
|---|---|---|---|
| T2.1 | Запрос объектов чужой организации через Supabase anon key | curl / Postman | 0 записей (пустой результат) |
| T2.2 | IDOR через URL объекта `/objects/[чужой-id]` | Browser URL | 404 или redirect |
| T2.3 | Запрос рисков без авторизации | curl без JWT | 401 |
| T2.4 | Запрос security_events пользователем с ролью viewer | Supabase API | 0 записей (RLS блокирует) |

### Инструкция по T2.1

```bash
# Получить anon key из .env.local
# Выполнить запрос к objects без JWT
curl 'https://ehqpijmbtavfacqogtoe.supabase.co/rest/v1/objects?select=*' \
  -H "apikey: SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer SUPABASE_ANON_KEY"
# Ожидаемый результат: []
```

---

## Тип 3 — Тестирование заголовков безопасности

### Проверка Headers

```bash
curl -I https://your-vercel-domain.vercel.app/
```

Ожидаемые заголовки:

| Заголовок | Ожидаемое значение |
|---|---|
| `Content-Security-Policy` | Присутствует |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Присутствует |
| `Strict-Transport-Security` | Присутствует (Vercel добавляет) |

### Инструменты

- [SecurityHeaders.com](https://securityheaders.com) — проверка через web
- `curl -I` — командная строка
- Chrome DevTools → Network → Response Headers

---

## Тип 4 — Тестирование Rate Limiting

| # | Тест | Метод | Ожидание |
|---|---|---|---|
| T4.1 | 11 запросов к `/invite/` за 60 секунд | curl loop | 11-й запрос: 429 |
| T4.2 | 61 запрос к `/api/*` за 60 секунд | curl loop | 61-й запрос: 429 |
| T4.3 | POST с телом > 100 KB | curl -d @large_file | 413 |

```bash
# T4.3 — создать тестовый файл и отправить
dd if=/dev/urandom bs=1024 count=101 | base64 > /tmp/large_payload.txt
curl -X POST https://domain/api/test \
  -H "Content-Type: application/json" \
  -d "{\"data\": \"$(cat /tmp/large_payload.txt)\"}"
# Ожидание: 413 Request Too Large
```

---

## Тип 5 — Тестирование валидации (Input Validation)

| # | Тест | Вход | Ожидание |
|---|---|---|---|
| T5.1 | XSS через имя объекта | `<script>alert(1)</script>` | Сохраняется как текст, не исполняется |
| T5.2 | Слишком длинное имя | 300+ символов | Zod ошибка (max length) |
| T5.3 | Неверный тип объекта | `type: "malicious"` | Zod ошибка |
| T5.4 | Невалидный Trust Score | `score: -5` | Zod ошибка |
| T5.5 | SQL injection через поиск | `' OR 1=1 --` | Безопасный возврат (no injection) |

---

## Тип 6 — Тестирование журнала аудита

| # | Действие | Ожидаемая запись в security_events |
|---|---|---|
| T6.1 | Изменение весов конфигуратора | `config.weights_changed` |
| T6.2 | Отправка приглашения владельцем | `invitation.sent` |
| T6.3 | Блокировка пользователя | `user.blocked` |
| T6.4 | Смена роли пользователя | `role.changed` |
| T6.5 | Создание организации | `org.created` |
| T6.6 | Завершённый импорт объектов | `import.objects_completed`, инициатор и агрегированные counters |
| T6.7 | Завершённый импорт рисков | `import.risks_completed`, инициатор и link counters |
| T6.8 | Commit не прошёл validation | `import.failed` без содержимого исходных строк |

---

## Инструменты тестирования безопасности

| Инструмент | Применение | Статус |
|---|---|---|
| `curl` / `Postman` | HTTP-тесты, RLS, headers | Используется |
| Chrome DevTools | Network, Security Headers | Используется |
| SecurityHeaders.com | Оценка Headers | Sprint 09 |
| OWASP ZAP | DAST (динамический анализ) | Sprint 09 |
| `npm audit` | Dependency scanning | Используется |
| Snyk | Расширенный dependency scan | Sprint 09 |
| CodeQL / GitHub SAST | Статический анализ кода | Sprint 09 |

---

## Критерии прохождения Security Gate

Перед MVP-релизом:

- [ ] Все T1 RBAC тест-кейсы пройдены
- [ ] T2.1 RLS изоляция подтверждена
- [ ] Security Headers: оценка ≥ B+ на SecurityHeaders.com
- [ ] Rate Limiting: 429 при превышении лимитов
- [ ] Payload limit: 413 при > 100 KB
- [ ] Нет critical/high CVE в `npm audit`
- [ ] Нет секретов в git history (`git log` проверен)
