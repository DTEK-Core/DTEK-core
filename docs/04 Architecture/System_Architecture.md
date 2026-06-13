# System Architecture

## Назначение

Документ описывает общую архитектуру платформы DTEK Core MVP.

# Архитектурные принципы

1. Простота реализации.
2. Минимальная инфраструктура.
3. Максимальная совместимость с AI-разработкой.
4. Возможность масштабирования.
5. Cloud First подход.

# Общая схема

`Пользователь -> Next.js Frontend -> Supabase -> PostgreSQL -> Claude API`

# Frontend

## Технологии

- `Next.js`
- `React`
- `TypeScript`
- `Tailwind CSS`
- `Shadcn/UI`
- `React Flow`

# Backend

## Технологии

- `Supabase`
- `Edge Functions`

# База данных

## Технология

- `PostgreSQL`

# Хранилище файлов

## Технология

- `Supabase Storage`

# Авторизация

## Технология

- `Supabase Auth`

# AI слой

## Технология

- `Claude API`

# Основные модули системы

1. Authentication
2. Organizations
3. Users
4. Objects
5. Trust Passports
6. Trust Score
7. Trust Graph
8. Risk Registry
9. Configurator

# Инфраструктура

## Разработка

- `GitHub`
- `GitHub Projects`
- `Claude Code`
- `Obsidian`
- `Miro`

## Продакшн

- `Vercel`
- `Supabase Cloud`

# Будущее развитие

**После MVP допускается внедрение:**
- `Neo4j`
- `Runtime Platform`
- `Marketplace`
- `Enterprise Edition`
