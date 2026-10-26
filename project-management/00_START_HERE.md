---
title: DTEK Project Control Center
type: hub
status: active
updated: 2026-10-26
tags:
  - dtek
  - management
  - startup
---

# DTEK Project Control Center

Это главная страница управления DTEK в Obsidian. Корень репозитория
`DTEK Core` открывается как один Vault, поэтому код, документация, Sprint и
управленческие заметки остаются в одной Git-истории.

## Быстрый Старт

1. Откройте [[project-management/OBSIDIAN_SETUP|настройку Obsidian]].
2. Каждый рабочий день начинайте с [[project-management/01_EXECUTIVE_DASHBOARD|Executive Dashboard]].
3. Текущую работу ведите в [[project-management/boards/DEVELOPMENT_BOARD|Development Board]].
4. Новые мысли записывайте в [[project-management/boards/IDEAS_AND_RESEARCH|Ideas & Research]].
5. Ошибки и ручную проверку ведите в [[project-management/boards/BUGS_AND_QA|Bugs & QA]].
6. После завершения задачи обновляйте [[project-management/reports/REPORTING_HUB|Reporting Hub]].

## Карта Управления

| Область | Страница |
|---|---|
| Текущий статус | [[project-management/02_CURRENT_STATE|Current State]] |
| Продукт и стартап | [[project-management/03_PRODUCT_AND_BUSINESS|Product & Business]] |
| Roadmap | [[project-management/04_ROADMAP_AND_MILESTONES|Roadmap & Milestones]] |
| Все Sprint | [[project-management/05_SPRINT_CATALOG|Sprint Catalog]] |
| Архитектура и безопасность | [[project-management/06_ARCHITECTURE_AND_SECURITY|Architecture & Security]] |
| Документация | [[project-management/07_DOCUMENTATION_MAP|Documentation Map]] |
| Рабочий процесс | [[project-management/08_OPERATING_MODEL|Operating Model]] |
| Дизайн и UX | [[project-management/09_DESIGN_AND_UX|Design & UX]] |
| Go-to-market и пилоты | [[project-management/10_GO_TO_MARKET|Go-To-Market]] |
| Решения | [[project-management/registers/DECISION_REGISTER|Decision Register]] |
| Риски | [[project-management/boards/RISKS_AND_BLOCKERS|Risks & Blockers]] |
| Метрики | [[project-management/registers/METRICS_REGISTER|Metrics Register]] |

## Источники Истины

Управленческий слой не заменяет проектные документы:

1. [[ARCHITECTURE_DECISIONS|ADR]] — архитектурные решения.
2. Активный Gate или текущий Sprint — scope разработки.
3. [[AI_DEVELOPMENT_GUIDE|AI Development Guide]] и [[AGENTS|AGENTS]].
4. Код, migrations и tests — фактическая реализация.
5. `project-management/` — оперативное управление, навигация и отчётность.

## Главное Правило

Статус задачи меняется здесь только после фактического результата. Документ,
план или созданная карточка не являются доказательством реализации или теста.
