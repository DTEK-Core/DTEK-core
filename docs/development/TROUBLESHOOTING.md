# TROUBLESHOOTING.md — DTEK Core

`Дата: 19.08.2026`
`Область: локальная разработка, Terminal/Git, Supabase, DNS, middleware, CSV/XLSX import`

---

## Симптомы

Используйте этот документ, если локальное приложение:

- долго открывает страницы;
- не даёт войти или зарегистрироваться;
- не создаёт организацию;
- показывает ошибки Supabase;
- пишет в логах `getaddrinfo ENOTFOUND`, `AuthRetryableFetchError` или `fetch failed`.

---

## Быстрая диагностика

Для pilot/preview triage начните с защищённой UI-проверки и операционного
[Environment Health Runbook](../operations/ENVIRONMENT_HEALTH_RUNBOOK.md).
Путь в приложении: Settings → «Безопасность» → «Состояние окружения»; доступ
имеют `owner/admin`. Этот документ сохраняет расширенную локальную диагностику
Terminal/Git и импорта.

### Terminal/Git health

Если Codex показывает `No output` после короткой команды, сначала различите UI
wrapper и реальный terminal process. У команды должен быть фактический
`exit_code`; активный `cell_id` продолжается только через `functions.wait`, а
полученный `session_id` — только через `write_stdin`.

Перед Git выполните:

```bash
echo CODEX_TERMINAL_HEALTH_OK
pwd
```

Если stdout и `exit 0` обеих команд не получены мгновенно, не запускайте новые
Git-команды в этой session. Восстановите terminal штатным способом, не удаляя
locks и не изменяя `.git`.

Контролируемые проверки проекта:

```bash
npm run diagnose:terminal
npm run check:terminal
npm run git:health
```

- `diagnose:terminal` последовательно проверяет shell, worktree, refs, status,
  log и object traversal;
- `check:terminal` выполняет 20 циклов
  `echo → pwd → HEAD → status → log → rev-list`;
- `git:health` является коротким финальным gate и проверяет terminal, чистый
  synchronized status и последний commit без лишнего `rev-list`;
- после длительной реализации сначала завершите dev server, watchers, test
  runners и дочерние Node-процессы; сломавшаяся перед Git session не требует
  повторной реализации, финализацию продолжайте в свежем shell.

Каждый subprocess работает без stdin/PTY, с отключёнными pager и credential
prompt. Лимит одной короткой команды — 10 секунд. При превышении runner убивает
только эту команду и выводит `COMMAND TIMEOUT`, command и duration.

Диагностика 12.08.2026 подтвердила целостность DTEK Core: refs читаются,
`git fsck --no-progress` не обнаруживает missing/corrupt objects, stale locks,
submodules, nested repositories, Git LFS, fsmonitor и custom hooks отсутствуют.
Проект находится на локальном Data volume, а не в cloud/network path. Ранее
наблюдавшийся `No output` классифицирован как незавершённый Codex code-mode
lifecycle/output forwarding, а не зависание Git repository.

### 1. Проверить `.env.local`

Не выводите секреты полностью в терминал и не коммитьте `.env.local`.

Обязательные значения:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ehqpijmbtavfacqogtoe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Опционально:

```bash
SUPABASE_FETCH_TIMEOUT_MS=2000
```

`NEXT_PUBLIC_SUPABASE_URL` должен содержать актуальный Supabase project ref:
`ehqpijmbtavfacqogtoe`.

### 2. Проверить DNS

```bash
nslookup ehqpijmbtavfacqogtoe.supabase.co
nslookup supabase.co
```

Если оба запроса завершаются timeout или `no servers could be reached`, проблема
на уровне DNS/сети, а не в коде приложения.

На macOS дополнительно:

```bash
scutil --dns
```

Если вывод содержит `No DNS configuration available`, восстановите сетевую
конфигурацию до продолжения разработки.

### 3. Проверить доступность Supabase

```bash
curl -I https://ehqpijmbtavfacqogtoe.supabase.co/auth/v1/health
```

Ожидаемый результат: HTTP-ответ от Supabase. Ошибка `Could not resolve host`
означает, что домен не резолвится локальной машиной.

### 4. Проверить приложение

```bash
npm run dev
```

Откройте:

- `http://localhost:3000/login`
- `http://localhost:3000/register`
- `http://localhost:3000/onboarding/create`

Публичные страницы должны открываться быстро. Защищённые страницы при
недоступном Supabase могут вернуть на `/login?error=supabase_unavailable`, но
не должны зависать.

---

## Частые причины

| Причина | Признак | Восстановление |
|---|---|---|
| DNS не настроен или недоступен | `ENOTFOUND`, `Could not resolve host`, `no servers could be reached` | Переподключить сеть/VPN, проверить DNS-серверы, перезапустить сетевой сервис или машину |
| Неверный project ref | URL не совпадает с `ehqpijmbtavfacqogtoe` | Обновить `NEXT_PUBLIC_SUPABASE_URL` из Supabase Dashboard |
| Неверный anon key | Auth возвращает 401/403 | Обновить `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Неверный service role key | Server Actions падают на сервере | Обновить `SUPABASE_SERVICE_ROLE_KEY`, не раскрывать ключ в клиенте |
| Supabase project остановлен/удалён | Dashboard недоступен или API не отвечает | Проверить Supabase Dashboard и статус проекта |
| Middleware постоянно ждёт refresh token | Страницы открываются медленно при сетевом сбое | Проверить fail-fast обработку в `middleware.ts` и `lib/supabase/config.ts` |

---

## Восстановление окружения

1. Убедитесь, что интернет и DNS работают:

```bash
nslookup supabase.co
```

2. Сверьте project ref в `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ehqpijmbtavfacqogtoe.supabase.co
```

3. Обновите ключи из Supabase Dashboard → Settings → API.

4. Перезапустите dev server:

```bash
npm run dev
```

5. Если dev server был запущен во время изменения env, остановите его и
запустите заново. Next.js не всегда подхватывает изменения `.env.local` без
рестарта процесса.

6. Если ошибка сохраняется, проверьте:

```bash
npm run type-check
npm run lint
npm run build
```

---

## Поведение приложения при сбое Supabase

Supabase clients используют единый timeout `SUPABASE_FETCH_TIMEOUT_MS`
по умолчанию `2000` мс.

Если Supabase недоступен:

- middleware не должен держать protected routes в долгом ожидании;
- публичные auth/onboarding страницы остаются доступными;
- protected routes перенаправляются на `/login?error=supabase_unavailable`;
- auth Server Actions возвращают понятную ошибку вместо зависания.

### Проверка после оптимизации SSR

В штатном запросе middleware проверяет JWT через `getClaims()`, а App Shell и
страница используют один request-scoped profile context. Server Actions не
проходят повторный middleware session/profile lookup: каждая из них
авторизует пользователя самостоятельно. Это уменьшает число последовательных
обращений к Supabase, но не может компенсировать отсутствие DNS или
недоступность Supabase Cloud.

Auth-страницы (`/login`, `/register`, password reset) не делают refresh
устаревшей cookie и открываются сразу. Если auth-cookie отсутствует,
защищённый маршрут сразу перенаправляется на login. Для запроса с cookie
проверка claims и refresh session ограничены тем же 2-секундным пределом;
после него маршрут безопасно перенаправляется на сообщение о недоступном
Supabase.

Это не заменяет восстановление DNS или Supabase, но сохраняет локальный UI
отзывчивым и упрощает диагностику.

---

## Проблемы Импорта CSV/XLSX

Начните с пользовательского [руководства по импорту](../user/IMPORT_GUIDE.md) и канонического шаблона из диалога **Импорт**.

| Симптом | Вероятная Причина | Действие |
|---|---|---|
| Нет кнопки «Импорт» | Роль не имеет права на операцию | Проверьте RBAC: viewer не импортирует; admin импортирует только инфраструктурные объекты и не импортирует риски |
| Файл не выбирается | Неверное расширение или размер больше 5 МБ | Используйте `.csv`/`.xlsx`, уменьшите файл |
| Нет заголовков или данных | Первый лист/CSV пуст либо отсутствует строка заголовков | Добавьте заголовки и хотя бы одну строку данных |
| Файл отклонён по лимиту | Больше 500 строк, 40 колонок или 10 000 символов в ячейке | Разделите выгрузку на несколько файлов |
| `unknown_columns` или duplicate header | Заголовок не входит в contract либо повторяется после нормализации | Сверьте сгруппированный список с шаблоном, удалите повтор |
| Risk CSV загружен как objects или наоборот | Выбран неправильный import module | Используйте предложенную кнопку перехода в правильный раздел |
| Собственный Risk CSV export не проходит | Файл загружен не в Risk Import либо устарела сборка | Откройте `/risks` → **Импорт**; localized и `*_key` headers поддерживаются |
| `invalid_enum`, `invalid_date`, `invalid_number` | Значение не соответствует contract | Используйте канонические enum, ISO-дату и допустимый диапазон |
| «К созданию: 0» | Все строки содержат errors или распознаны как дубли | Просмотрите замечания и скачайте **Отчёт CSV** |
| Риск создан без объекта | Имя/IP не найдено или неоднозначно | Укажите точное имя либо уникальный IP, затем повторите импорт или свяжите риск вручную |
| Импорт завершился частично | Некоторые строки не прошли запись | Не загружайте весь файл повторно: исправьте и импортируйте только failed/skipped строки |
| Чтение или preview дольше 30 секунд | Файл повреждён, сеть/Supabase недоступны или операция зависла | Дождитесь конечной timeout error, проверьте файл и Network, затем выберите файл повторно |
| Commit дольше 120 секунд | Статус записи неизвестен клиенту | Обновите страницу и проверьте данные; не повторяйте commit вслепую |
| Нет import event | Журнал недоступен роли либо audit write не выполнен | Проверьте роль owner/admin, обновите `/settings`; при server error проверьте Supabase logs |

Безопасный порядок диагностики:

1. Скачайте новый шаблон CSV непосредственно в нужном диалоге.
2. Для XLSX поместите импортируемую таблицу на первый лист.
3. Заполните source metadata и получите preview.
4. Скачайте полный **Отчёт CSV** и исправьте blocking errors.
5. После partial success повторно импортируйте только строки, которые не были созданы.
6. Если Server Action завершился общей ошибкой, проверьте доступность Supabase и server logs без вывода содержимого файла и секретов.
7. Для воспроизведения используйте [готовые Sprint 11 fixtures](../../testing/sprint-11-import/README.md).

---

## Что нельзя делать

- Не коммитьте `.env.local`.
- Не выводите service role key полностью в логи.
- Не используйте `service_role` в клиентском коде.
- Не отключайте RLS и RBAC для обхода локальной проблемы.
- Не запускайте миграции, пока не подтверждена доступность правильного проекта.

---

## Финальная проверка после восстановления

```bash
npm run type-check
npm run lint
npm run build
```

Проверить вручную:

- регистрация;
- логин;
- logout;
- создание организации;
- вход в организацию;
- страницы `/objects`, `/graph`, `/risks`, `/configurator`, `/settings`;
- Server Actions без `fetch failed` и долгих retry.
