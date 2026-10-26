---
title: Obsidian Setup
type: setup-guide
status: active
updated: 2026-10-26
tags:
  - dtek
  - obsidian
---

# Настройка Obsidian

## Открыть Проект

1. Установите Obsidian с официального сайта.
2. Запустите приложение.
3. Выберите **Open folder as vault**.
4. Укажите папку `/Users/a000/Documents/DTEK Core`.
5. Откройте [[project-management/00_START_HERE|DTEK Project Control Center]].
6. Закрепите эту страницу через `Pin`.

Не создавайте отдельную копию проекта: корень репозитория уже является Vault.

## Рекомендуемые Community Plugins

Установите через `Settings -> Community plugins -> Browse`:

1. **Kanban** — доски из файлов `project-management/boards/`.
2. **Dataview** — автоматические выборки по metadata.
3. **Tasks** — сроки, фильтры и task queries.
4. **Obsidian Git** — опционально; используйте только если понимаете текущий Git workflow.

Начните с Kanban. Все файлы остаются читаемыми и без плагинов.

## Безопасные Настройки Git

- Не выполняйте автоматический commit/push одновременно с работающим Codex.
- Перед ручным изменением убедитесь, что предыдущая задача завершена.
- Не используйте force push или reset.
- Не коммитьте secrets, `.env.local` и личные вложения.
- Локальные layout/workspace настройки Obsidian можно оставить вне Git.

## Вложения

Для будущих схем и изображений создавайте вложения только в согласованной папке
и не сохраняйте туда клиентские evidence, credentials или персональные данные.
Mermaid-схемы предпочтительны: они текстовые, редактируются и версионируются.

## Работа С Досками

После установки Kanban откройте:

- [[project-management/boards/DEVELOPMENT_BOARD|Development Board]];
- [[project-management/boards/IDEAS_AND_RESEARCH|Ideas & Research]];
- [[project-management/boards/BUGS_AND_QA|Bugs & QA]];
- [[project-management/boards/RISKS_AND_BLOCKERS|Risks & Blockers]];
- [[project-management/boards/DESIGN_BOARD|Design Board]].

Карточки можно переносить мышью. Не переносите задачу в `Done`, пока нет
фактических проверок, commit и push.
