# 22. Запуск и развёртывание

## Локально

```bash
npm ci
cp .env.example .env.local
npm run dev
```

`.env.local` содержит адрес Supabase, anon key, server-only service role и app URL. Реальные значения нельзя помещать в документацию или Git. Anon key сам по себе не заменяет RLS; service role обходит RLS и является секретом высокого риска.

Миграции применяются Supabase CLI в связанном проекте после review. Локальная цепочка содержит `001–017`, но фактический cloud state подтверждается `npx supabase migration list` с разрешённым access token.

`npm run build` создаёт production build, `npm run start` запускает его. Production отличается доменом, ключами, масштабированием, cookies, журналированием и реальными данными. Vercel build должен иметь server secrets; нельзя использовать `.env.local` как механизм production deploy.

Перед deploy: audit, tests, build, env validation, migration status, manual QA, backup/rollback plan, CI, release branch и smoke after deploy. Текущий production URL ранее возвращал 404, а develop preview был защищён SSO; состояние нужно перепроверять перед демонстрацией.

> Главное, что нужно запомнить: успешный локальный build не доказывает готовность production окружения.

## Проверь себя

1. Почему service role не начинается с `NEXT_PUBLIC_`?
2. Как проверить cloud migrations?
3. Чем local отличается от production?
4. Что проверить после deploy?

