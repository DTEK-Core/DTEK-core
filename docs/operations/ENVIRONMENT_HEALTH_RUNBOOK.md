# ENVIRONMENT_HEALTH_RUNBOOK.md — DTEK Core

`Спринт: Sprint 14 — Pilot Readiness`  
`Задача: S14-T002 — Environment Health Check UI/Runbook`  
`Область: Supabase, environment variables, DNS, auth context, database/RLS, middleware`  
`Дата: 19.08.2026`  
`Статус: Актуальный`

---

## 1. Назначение

Runbook помогает быстро определить, почему DTEK Core недоступен или работает
медленно, не раскрывая секреты и не изменяя данные. Он используется локально,
в Preview и в pilot environment.

Диагностика отвечает на четыре вопроса:

1. Заданы ли обязательные server configuration values?
2. Подтверждаются ли текущая сессия и organization context?
3. Отвечает ли Supabase Auth API?
4. Выполняется ли tenant-scoped database query через RLS?

Runbook не применяет миграции, не изменяет env, не отключает RLS и не
восстанавливает проект автоматически.

---

## 2. Быстрый UI Triage

Путь:

```text
Настройки → Безопасность → Состояние окружения
```

Доступ имеют только `owner` и `admin`. UI скрыт для `analyst/viewer`, а Server
Action повторно проверяет роль и организацию при каждом запуске.

Нажмите **Проверить состояние**. Проверка запускается только по запросу и не
добавляет сетевые вызовы к обычной загрузке Settings.

Если login или Settings уже недоступны, UI-проверка неприменима: сразу
переходите к разделу **CLI Диагностика**. Health UI намеренно не является
публичным anonymous endpoint и не должен обходить auth во время outage.

| Проверка | Что подтверждает | Что не раскрывается |
|---|---|---|
| Конфигурация сервера | Обязательные значения присутствуют и URL валиден | Значения env и ключей |
| Сессия и организация | Server authorization и organization context | User/org UUID, cookies, JWT |
| Supabase Auth API | Health endpoint отвечает в пределах timeout | Host, anon key, raw body |
| База данных и RLS | Текущая роль читает свою организацию | Строка организации и SQL error |

Статусы:

- `Работает` — все четыре проверки успешны;
- `Требует внимания` — сервис ответил, но health response нештатный;
- `Недоступно` — конфигурация, сеть, сессия или tenant query не прошли.

Health UI возвращает только контролируемые сообщения и длительность. Он не
записывает security event, потому что не меняет данные и может запускаться
многократно во время инцидента.

---

## 3. Границы Проверки

Зелёный UI health report не подтверждает:

- совпадение Local/Cloud migrations;
- корректность всех Server Actions;
- invitation delivery;
- backup/restore;
- отсутствие дефектов Sprint 12/13;
- готовность release candidate к пилоту.

Эти gates закрываются отдельно по
[PILOT_READINESS_CHECKLIST.md](../testing/PILOT_READINESS_CHECKLIST.md).

---

## 4. Безопасность Диагностики

Запрещено:

- печатать значения `SUPABASE_SERVICE_ROLE_KEY`, anon key, JWT и cookies;
- отправлять `.env.local` в чат, issue или screenshot;
- использовать service role в браузере;
- отключать RLS для проверки;
- запускать `db reset`, `db push`, migration repair или ручной SQL до
  подтверждения правильного project ref;
- прикладывать к evidence реальные объекты, риски, IP и персональные данные.

Разрешено фиксировать только наличие параметра, HTTP status, длительность,
номер миграции и sanitized error category.

---

## 5. CLI Диагностика

### Шаг 1 — Проверить Наличие Конфигурации

Для локальной среды выполните проверку, которая не печатает значения:

```bash
node - <<'NODE'
const fs = require('fs');
const source = fs.readFileSync('.env.local', 'utf8');
const names = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
];
for (const name of names) {
  const configured = new RegExp(`^${name}=.+$`, 'm').test(source);
  console.log(`${name}: ${configured ? 'configured' : 'missing'}`);
}
NODE
```

Для Preview/Production сверяйте те же имена в Vercel Dashboard. Не копируйте
значения из Dashboard в evidence.

Опциональный `SUPABASE_FETCH_TIMEOUT_MS` должен быть числом не меньше `1000`.
При отсутствии используется fail-fast значение `2000` мс.

### Шаг 2 — Проверить Project State

Откройте Supabase Dashboard и убедитесь, что ожидаемый проект имеет статус
Active. Состояние Paused объясняет одновременные `fetch failed` для Auth и DB.

Если project ref в URL отличается от утверждённого окружения, остановите
диагностику: нельзя проверять миграции или данные другого проекта.

### Шаг 3 — Проверить DNS

```bash
nslookup ehqpijmbtavfacqogtoe.supabase.co
nslookup supabase.co
```

На macOS при необходимости:

```bash
scutil --dns
```

Интерпретация:

| Результат | Вывод |
|---|---|
| Оба имени разрешаются | DNS baseline работает |
| Не разрешается только project host | Проверить project ref и Supabase state |
| Не разрешаются оба | Локальная сеть, VPN или DNS resolver |
| Ответ нестабилен | Повторить без VPN/через другую сеть и сравнить |

### Шаг 4 — Проверить Auth API

```bash
curl --silent --show-error --head --max-time 8 \
  https://ehqpijmbtavfacqogtoe.supabase.co/auth/v1/health
```

Любой полученный HTTP response подтверждает DNS/TLS connectivity. `2xx`
подтверждает штатный health endpoint. `Could not resolve host`, timeout и TLS
error классифицируются отдельно; не заменяйте их общим «ошибка базы».

### Шаг 5 — Сверить Миграции Только Чтением

```bash
npx supabase migration list
```

Ожидается совпадение Local/Remote `001–019`. Команда не должна применять или
repair миграции. Расхождение блокирует pilot release и передаётся владельцу
схемы БД.

### Шаг 6 — Проверить App Routes

Запустите приложение:

```bash
npm run dev
```

Проверьте:

- `/`, `/login`, `/register` открываются без Supabase session refresh;
- protected route без cookie быстро перенаправляется на `/login`;
- authenticated `/settings` открывается без redirect loop;
- health UI завершается либо показывает safe error в пределах timeout;
- Network не содержит бесконечных refresh/Server Action retry.

После проверки остановите dev server. Не оставляйте watcher перед Git.

---

## 6. Диагностика Middleware

| Симптом | Вероятная Причина | Проверка |
|---|---|---|
| Protected route сразу ведёт на login | Нет auth cookie или сессия истекла | Войти повторно, проверить cookie presence без вывода значения |
| `/login` открывается медленно | Проблема вне middleware auth refresh | Проверить build/network; auth routes пропускают refresh |
| Redirect повторяется между onboarding и dashboard | Profile organization context не согласован | Проверить profile/org через штатный UI и server logs |
| Через ~2 секунды redirect с `supabase_unavailable` | DNS/Supabase недоступен | Шаги 2–4 |
| Server Action выполняет двойной auth request | Неверная обработка `next-action` | Проверить текущий middleware contract и Network |
| Страница ждёт значительно дольше timeout | Зависший внешний вызов или stale process | Проверить server logs, остановить dev server, повторить один раз |

Текущий contract:

- public/auth routes не выполняют session refresh;
- запрос без auth cookie не обращается к Supabase;
- Server Actions выполняют собственную server authorization;
- запрос с cookie ограничен `SUPABASE_FETCH_TIMEOUT_MS`.

---

## 7. Матрица Результатов

| Configuration | Auth API | DB/RLS | Вероятная Область |
|---|---|---|---|
| Fail | Не запускалась | Не запускалась | Env configuration |
| Pass | Fail | Fail | DNS, сеть, paused Supabase или неверный project ref |
| Pass | Pass | Fail | Session/RLS/data API или organization context |
| Pass | Pass | Pass | Окружение доступно; искать проблему в конкретном route/action |

Если UI не может подтвердить сессию, он возвращает общий safe error до
формирования отчёта. Это может означать истёкшую сессию или недоступный
Supabase; начните с повторного входа и шагов 2–4.

---

## 8. Восстановление

### DNS Или Сеть

1. Отключите/переподключите VPN.
2. Сравните результат через другую сеть.
3. Проверьте системный DNS resolver.
4. Не меняйте код приложения до подтверждения сетевой причины.

### Supabase Paused

1. Возобновите проект в Supabase Dashboard.
2. Дождитесь статуса Active.
3. Повторите Auth API health и UI check.
4. Сверьте migrations `001–019`.

### Неверная Конфигурация

1. Сверьте параметры с Supabase/Vercel Dashboard.
2. Обновите только нужное окружение.
3. Перезапустите dev server или redeploy Preview.
4. Не коммитьте `.env.local`.

### Auth Работает, DB/RLS Не Работает

1. Войдите повторно.
2. Убедитесь, что profile привязан к организации.
3. Проверьте Cloud migrations и RLS policies.
4. Не используйте service role для маскировки проблемы.
5. Зафиксируйте sanitized server error category и передайте security reviewer.

---

## 9. Evidence И Escalation

Для инцидента заполните:

```text
Дата/время и timezone:
Окружение: local / preview / pilot
Commit SHA:
Роль: owner / admin
UI overall status:
Configuration status + duration:
Auth API status + duration:
Database/RLS status + duration:
DNS result category:
HTTP status без body:
Local/Remote max migration:
Первый failing route/action:
Есть ли retry loop:
Sanitized log category:
Ответственный:
Следующее действие:
```

Escalation:

- Blocker/Critical auth, data isolation или migration drift — немедленный
  `NO-GO`, release owner + security reviewer;
- Supabase outage/DNS — operations owner;
- отдельный route/action при зелёном environment report — владелец модуля;
- repeated degradation без функционального отказа — monitoring backlog S14-T006.

Используйте [BUG_REPORT_TEMPLATE.md](../testing/BUG_REPORT_TEMPLATE.md) для
воспроизводимого дефекта.

---

## 10. Exit Criteria

- [ ] UI report завершён для owner или admin.
- [ ] Все четыре UI-проверки имеют `Работает`.
- [ ] Нет `ENOTFOUND`, timeout и retry loop.
- [ ] Local/Remote migrations `001–019` совпадают.
- [ ] Login, protected redirect и authenticated Settings работают.
- [ ] Evidence не содержит секреты и tenant data.
- [ ] Gate G-05 в Pilot Readiness Checklist обновлён для release candidate.

---

## 11. Связанные Документы

- [TROUBLESHOOTING.md](../development/TROUBLESHOOTING.md) — расширенная локальная диагностика.
- [DEPLOYMENT.md](DEPLOYMENT.md) — Vercel/Supabase configuration и release.
- [PILOT_READINESS_CHECKLIST.md](../testing/PILOT_READINESS_CHECKLIST.md) — master release gates.
- [RBAC_MODEL.md](../security/RBAC_MODEL.md) — доступ к operational diagnostics.
- [SECURITY_OVERVIEW.md](../security/SECURITY_OVERVIEW.md) — security baseline.

---

*Environment Health Check сокращает время triage, но не является публичным
uptime endpoint и не заменяет мониторинг S14-T006.*
