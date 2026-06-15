# DTEK Core

**Digital Trust Management Platform (DTMP)**

Платформа создаёт цифровую модель доверия организации как слой над существующими инструментами безопасности (SIEM, DLP, EDR).

## Ключевые сущности

- **Trust Passport** — цифровой паспорт каждого объекта инфраструктуры
- **Trust Score** — взвешенная 6-факторная оценка доверия (0–100)
- **Trust Graph** — граф зависимостей между объектами
- **Risk Registry** — реестр рисков с привязкой к объектами

## Технологический стек

- **Frontend:** Next.js 14, TypeScript (strict), Tailwind CSS, Shadcn/UI
- **Backend:** Supabase (PostgreSQL 15, Auth, Edge Functions, Storage)
- **Hosting:** Vercel

## Текущее состояние

**Sprint 02 завершён (15.06.2026).** Реализована «пустая платформа» — Release 1:

| Страница | Маршрут | Статус |
|---|---|---|
| Лендинг | `/` | ✅ Реализован |
| Регистрация | `/register` | ✅ Реализован |
| Вход | `/login` | ✅ Реализован |
| Сброс пароля | `/forgot-password`, `/reset-password` | ✅ Реализован |
| Принятие приглашения | `/invite/[token]` | ✅ Реализован |
| Создание организации | `/onboarding/create` | ✅ Реализован |
| Онбординг wizard | `/onboarding/wizard` | ✅ Реализован |
| Центр управления | `/dashboard` | 🔧 Заглушка (Sprint 05) |
| Пользователи | `/users` | ✅ Реализован |
| Настройки | `/settings` | ✅ Реализован |
| Объекты / Граф / Риски | `/objects`, `/graph`, `/risks` | 🔧 Sprint 03+ |

## Разработка

```bash
git clone https://github.com/DTEK-Core/DTEK-core.git
cd DTEK-core
npm install
# Создать .env.local с переменными:
# NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
# NEXT_PUBLIC_APP_URL=http://localhost:3000
npm run dev
```

```bash
npm run type-check   # проверка TypeScript
npm run lint         # ESLint
npm run build        # production build
```

## Ветковая модель

- `main` — продакшн, защищена (только через PR)
- `develop` — основная рабочая ветка
- `feature/<task-id>` — фичи (например: `feature/S02-T008-users-page`)

## Документация

Документация проекта в папке `docs/`, планы в `tasks/`.

| Документ | Назначение |
|---|---|
| `ARCHITECTURE_DECISIONS.md` | 5 ADR — приоритетный источник истины |
| `tasks/SPRINT_02.md` | Sprint 02 (завершён) |
| `tasks/MVP_RELEASE_PLAN.md` | План релиза MVP |
| `docs/Database_Design_Full.md` | Схема БД |

---

`DTEK Core` · Digital Trust Management Platform · v0.2.0-dev
