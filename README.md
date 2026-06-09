# DTEK Core

**Digital Trust Management Platform (DTMP)**

Платформа создаёт цифровую модель доверия организации как слой над существующими инструментами безопасности (SIEM, DLP, EDR).

## Ключевые сущности

- **Trust Passport** — цифровой паспорт каждого объекта инфраструктуры
- **Trust Score** — взвешенная 6-факторная оценка доверия (0–100)
- **Trust Graph** — граф зависимостей между объектами
- **Risk Registry** — реестр рисков с привязкой к объектам

## Технологический стек

- **Frontend:** Next.js 14, TypeScript (strict), Tailwind CSS, Shadcn/UI
- **Backend:** Supabase (PostgreSQL 15, Auth, Edge Functions, Storage)
- **Hosting:** Vercel

## Разработка

```bash
git clone https://github.com/DTEK-Core/DTEK-core.git
cd DTEK-core
npm install
cp .env.example .env.local
# Заполнить .env.local переменными Supabase
npm run dev
```

## Ветковая модель

- `main` — продакшн, защищена (только через PR)
- `develop` — основная рабочая ветка
- `feature/<task-id>` — фичи (например: `feature/S01-T002`)

## Документация

Документация проекта в папке `docs/`, планы в `tasks/`.

---

`DTEK Core` · Digital Trust Management Platform · v0.1.0-dev
