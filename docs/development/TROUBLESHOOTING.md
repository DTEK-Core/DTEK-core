# TROUBLESHOOTING.md — DTEK Core

`Дата: 07.07.2026`  
`Область: локальная разработка, Supabase, DNS, middleware`

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
SUPABASE_FETCH_TIMEOUT_MS=4000
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
по умолчанию `4000` мс.

Если Supabase недоступен:

- middleware не должен держать protected routes в долгом ожидании;
- публичные auth/onboarding страницы остаются доступными;
- protected routes перенаправляются на `/login?error=supabase_unavailable`;
- auth Server Actions возвращают понятную ошибку вместо зависания.

Это не заменяет восстановление DNS или Supabase, но сохраняет локальный UI
отзывчивым и упрощает диагностику.

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
