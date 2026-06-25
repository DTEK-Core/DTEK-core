# DEPLOYMENT.md — DTEK Core

`Версия: 1.0`  
`Дата: 25.06.2026`

---

## Инфраструктура MVP

| Компонент | Провайдер | Детали |
|---|---|---|
| Frontend / SSR | Vercel | Project: `kirills-projects-96b721f1/dtek-core` |
| База данных | Supabase Cloud | Project ref: `ehqpijmbtavfacqogtoe`, EU West (Frankfurt) |
| Auth | Supabase Auth | Email+Password, JWT |
| Storage | Supabase Storage | Не используется в MVP |
| Edge Functions | Supabase Edge Functions | Не используется в MVP (Sprint 08+) |

---

## Деплой на Vercel

DTEK Core деплоится автоматически при push в `main`:

```
git push origin main  ← только через PR из develop + CI
```

**CI пайплайн** (`.github/workflows/ci.yml`):
```
lint → type-check → build
```

Ручной деплой (при необходимости):
```bash
npx vercel --prod
```

---

## Переменные окружения

Настраиваются в Vercel Dashboard → Project → Settings → Environment Variables:

| Переменная | Среды | Описание |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development | Публичный ключ (безопасен для клиента) |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | Ключ обхода RLS — только сервер |
| `NEXT_PUBLIC_APP_URL` | Production, Preview, Development | URL приложения |

Для локальной разработки: создать `.env.local` (в `.gitignore`, не коммитить).

---

## Суpabase Migrations

Применение новых миграций на Cloud:

```bash
# Требует SUPABASE_ACCESS_TOKEN в окружении
SUPABASE_ACCESS_TOKEN=<token> npx supabase db push --include-all
```

Текущие миграции: `001` — `017` (применены на Cloud)

Regenerate TypeScript types после новых миграций:

```bash
npx supabase gen types typescript --project-id ehqpijmbtavfacqogtoe > types/database.ts
```

---

## Мониторинг

| Что | Где смотреть |
|---|---|
| Логи приложения | Vercel Dashboard → Functions → Logs |
| Ошибки БД | Supabase Dashboard → Logs → Edge Logs |
| Auth события | Supabase Dashboard → Authentication → Logs |
| Аудит безопасности | `/settings` → «Журнал аудита» (в платформе) |

---

## Checklist перед деплоем в production

```
[ ] npm run type-check — 0 ошибок
[ ] npm run lint — 0 предупреждений
[ ] npm run build — успешная сборка
[ ] Переменные окружения настроены в Vercel
[ ] Новые миграции применены на Supabase Cloud
[ ] PR одобрен и CI прошёл
```
