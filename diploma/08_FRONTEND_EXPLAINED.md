# 08. Frontend

**React-компонент** — функция, возвращающая часть интерфейса. **Props** — входные данные компонента. **State** — изменяемое состояние в браузере. **Form** собирает ввод.

Next.js App Router строит маршруты по папкам: `page.tsx` — страница, `layout.tsx` — общая оболочка, `loading.tsx` — загрузка, `error.tsx` — ошибка. Server Component получает данные на сервере; Client Component с `'use client'` обрабатывает клики, state и browser API.

| Область | Где смотреть |
|---|---|
| Маршруты | `app/(app)/`, `app/(auth)/` |
| Общая оболочка | `app/(app)/layout.tsx`, `components/shared/shell/` |
| UI primitives | `components/ui/` |
| Предметные компоненты | `components/shared/objects`, `risks`, `graph`, `dashboard` |
| Стили | `app/globals.css`, тематические CSS, `tailwind.config.ts` |
| Design tokens | `lib/design-tokens.ts` |

Loading state показывает ожидание, empty state объясняет отсутствие данных, error state помогает восстановиться. Эти состояния важны для профессионального интерфейса и безопасного сокрытия внутренних ошибок.

Пример пути: `app/(app)/objects/page.tsx` получает данные, передаёт их в `objects-list-client.tsx`, а форма живёт в `object-form.tsx` и вызывает Server Action.

> Главное, что нужно запомнить: Client Component нужен не «потому что это frontend», а только когда требуется интерактивность браузера.

## Проверь себя

1. Чем `layout.tsx` отличается от `page.tsx`?
2. Когда нужен Client Component?
3. Где искать форму объекта?
4. Зачем empty state?

