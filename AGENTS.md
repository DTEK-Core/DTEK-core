# AGENTS.md — DTEK Core

> Этот файл читается AI-агентом при каждом запуске в директории проекта.
> Содержит постоянный контекст проекта, архитектурные ограничения и правила работы.
> Основной рабочий агент проекта — Codex.

---

## 1. Обзор проекта

**DTEK Core** — Evidence-first Trust Intelligence Platform.

Это коммерческий B2B SaaS-продукт в сфере кибербезопасности, который собирает цифровые доказательства из инфраструктуры организации, строит цифровую модель доверия и помогает CISO, аналитикам ИБ и IT-администраторам понимать реальный уровень защищённости инфраструктуры через единый показатель — **Trust Score**.

Платформа строится вокруг четырёх ключевых сущностей:

* **Trust Passport** — evidence-backed цифровой паспорт доверия каждого объекта;
* **Trust Score** — взвешенная оценка доверия 0–100 по факторам безопасности и подтверждающим evidence;
* **Trust Graph** — граф связей между объектами организации, который должен постепенно строиться автоматически;
* **Risk Registry** — реестр ручных и импортированных рисков; auto-candidates относятся к Post-MVP Discovery Layer.

Главный принцип развития после ADR-007: пользователь не должен вручную строить инфраструктуру с нуля. Ручной ввод сохраняется как fallback, экспертная корректировка и способ добавить бизнес-контекст.

Проект не является учебным прототипом. Все решения должны приниматься как для коммерческого продукта.

---

## 2. Текущий статус проекта

Проект находится в стадии MVP.

Завершены:

* **Sprint 01** — инфраструктура проекта, Supabase, миграции, CI/CD;
* **Sprint 02** — аутентификация, организации, пользователи, App Shell, онбординг;
* **Sprint 03** — объекты, Trust Passport, реестр рисков;
* **Sprint 04** — ручное тестирование Sprint 03 и стабилизация;
* **Sprint 05** — Trust Score Engine, Trust Graph, Dashboard, Configurator;
* **Sprint 06** — Security Hardening, RBAC/RLS аудит, подготовка security-документации;
* **Sprint 07** — комплексное тестирование реализованной платформы.
* **Sprint 08** — Product Review, UX/UI refinement, командные пожелания и аккуратные улучшения существующего интерфейса.
* **Sprint 09** — Market MVP Packaging: demo narrative, demo dataset, seed plan, ICP/interview script, product one-pager, landing copy alignment, pilot offer и documentation sync.
* **Sprint 10** — Reporting & Export: Trust Passport PDF, Risk CSV, Executive Organization Report, report RBAC/audit и smoke checklist.
* **Sprint 11** — Evidence Import & Data Onboarding: CSV/XLSX import объектов и рисков, preview, source metadata, duplicate detection, partial success, audit events, test fixtures и ручная приёмка.
* **ADR-007** — переход к Evidence-first Trust Platform / Trust Intelligence Platform.

Текущий этап:

* **Sprint 12** — Evidence-backed Trust Explainability; S12-T001–T008 реализованы, итоговый QA checklist подготовлен, ожидается ручная приёмка владельцем проекта.
* **Консолидация 03.08.2026** — dependency baseline усилен, contract tests включены в CI, Supabase seed config и документация синхронизированы; новый Sprint не начат.
* **Roadmap фиксация 07.08.2026** — коммерческий MVP ограничен Sprint 13 (Pilot Risk Workflow) и Sprint 14 (Pilot Readiness); Sprint 15 и Discovery/Evidence/Connector инициативы — Post-MVP.
* Cloud migrations `001–017` сверены с восстановленным Supabase Cloud 08.08.2026. Ручной Sprint 12 QA остаётся обязательным pilot release gate; владелец проекта разрешил начать Sprint 13 до его завершения. Не отмечать QA как PASS без фактического authenticated прогона.

Sprint 12 должен развивать Market MVP без изменения продуктовой границы: объяснимость Trust Score поверх уже реализованных Trust Passport, Trust Score, Trust Graph, Risk Registry, Reporting и Evidence Import. Все последующие Sprint должны учитывать Evidence-first стратегию: import является первым evidence ingestion path, explainability показывает источники данных, а connector framework развивается поэтапно.

---

## 3. Технологический стек

Фактическую версию зависимостей всегда проверять в `package.json`.

Основной стек:

| Слой           | Технология             |
| -------------- | ---------------------- |
| Frontend       | Next.js App Router     |
| UI             | React                  |
| Язык           | TypeScript strict mode |
| Стили          | Tailwind CSS           |
| Компоненты     | Shadcn/UI              |
| Backend / BaaS | Supabase               |
| База данных    | PostgreSQL             |
| Auth           | Supabase Auth          |
| Security       | PostgreSQL RLS + RBAC  |
| Deploy         | Vercel                 |

Не менять стек технологий без явного решения владельца проекта.

---

## 4. Источники истины

Перед выполнением любой задачи обязательно изучить релевантные документы:

* `AI_DEVELOPMENT_GUIDE.md`
* `CLAUDE.md`, если присутствует
* `ARCHITECTURE_DECISIONS.md`
* `DOCUMENTATION_INDEX.md`
* `tasks/MVP_RELEASE_PLAN.md`
* `tasks/EPIC_BACKLOG.md`
* `tasks/FEATURE_BACKLOG.md`
* текущий Sprint документ
* `docs/architecture/`
* `docs/security/`
* `docs/product/`
* текущую структуру репозитория
* папку `/design`

Если документы противоречат друг другу — остановиться и сообщить о конфликте.

Приоритет источников:

1. `ARCHITECTURE_DECISIONS.md`
2. текущий Sprint документ
3. `AI_DEVELOPMENT_GUIDE.md`
4. `AGENTS.md`
5. остальные документы

---

## 5. Архитектурные правила

Запрещено без необходимости:

* менять структуру проекта;
* переносить существующие директории;
* менять стек технологий;
* заменять библиотеки;
* обновлять зависимости;
* создавать дублирующие сервисы;
* создавать альтернативную реализацию уже существующей логики;
* переписывать рабочие модули ради рефакторинга.

Любые изменения должны быть максимально локальными и соответствовать текущей архитектуре проекта.

Приоритет:

1. Точечное исправление.
2. Улучшение существующего компонента.
3. Локальный рефакторинг.
4. Переписывание — только при прямом разрешении.

---

## 6. Структура проекта

```text
/
├── app/                         — маршруты Next.js App Router
├── components/
│   ├── ui/                      — компоненты Shadcn/UI, не редактировать вручную без причины
│   └── shared/                  — переиспользуемые компоненты проекта
├── lib/
│   ├── actions/                 — Server Actions
│   ├── supabase/                — Supabase clients
│   ├── trust/                   — Trust Score Engine
│   ├── security/                — audit/security helpers
│   ├── validation/              — схемы валидации
│   └── utils/                   — утилиты
├── types/                       — TypeScript-типы
├── supabase/
│   ├── migrations/              — SQL миграции
│   └── functions/               — Supabase Edge Functions
├── design/                      — утверждённый дизайн-прототип
├── docs/                        — документация проекта
├── tasks/                       — спринты, backlog, release plan
├── AGENTS.md                    — инструкции для Codex/AI-агента
└── AI_DEVELOPMENT_GUIDE.md      — инженерный регламент проекта
```

Если фактическая структура отличается — сначала проанализировать, затем предложить обновление документации.

---

## 7. Работа с дизайном

Папка `/design` — источник UI/UX решений.

Запрещено:

* создавать новый дизайн без задачи;
* менять пользовательские сценарии;
* менять структуру экранов;
* менять навигацию;
* менять визуальную концепцию.

Разрешено только в рамках утверждённого Sprint:

* улучшать кнопки;
* улучшать состояния hover/active/focus;
* улучшать таблицы;
* улучшать карточки;
* улучшать отступы;
* улучшать типографику;
* улучшать микроанимации;
* делать интерфейс более профессиональным.

Главное правило после ADR-007:

**Развивать DTEK Core как слой доверительной интерпретации данных, не превращая продукт в SIEM/EDR/DLP/CMDB/GRC. Следующий приоритет — отчёты, evidence import, explainability, pilot readiness и foundation Connector Framework.**

---

## 8. Безопасность

DTEK Core — продукт в сфере кибербезопасности.

Всегда учитывать:

* RLS;
* RBAC;
* multi-tenant isolation;
* Server Action authorization;
* input validation;
* least privilege;
* no secrets in code;
* safe error handling;
* Secure SDLC.

Запрещено:

* обходить RLS;
* использовать `service_role` на клиенте;
* хранить секреты в репозитории;
* показывать пользователю внутренние ошибки;
* доверять входным данным без валидации.

---

## 9. Рабочий процесс Codex

Перед изменением кода Codex должен:

1. Изучить задачу.
2. Изучить связанные документы.
3. Найти связанные файлы.
4. Составить план.
5. Указать файлы, которые будут изменены или созданы.
6. Указать риски.
7. Дождаться подтверждения, если задача неоднозначна или может затронуть архитектуру.

Для простых задач можно сразу выполнять, если scope полностью ясен.

Не начинать крупные изменения без плана.

---

## 10. Качество кода

Перед завершением любой задачи обязательно выполнить:

```bash
npm run type-check
npm run lint
npm run build
```

Если существуют тесты — выполнить их тоже.

Задача не считается завершённой, если проверки падают.

Запрещено:

* использовать `any`;
* оставлять `TODO` без задачи;
* оставлять неиспользуемые импорты;
* оставлять временные console.log;
* оставлять мёртвый код;
* создавать дублирующие компоненты.

---

## 11. Git Workflow

Работа ведётся по Git Flow:

```text
main
└── develop
    └── feature/<task-id>
```

Правила:

* основная разработка только в `develop`;
* `main` защищена;
* прямые коммиты в `main` запрещены;
* использовать Conventional Commits;
* один commit = одно логически завершённое изменение;
* после завершения задачи выполнить push.

Формат ветки:

```text
feature/S08-T001-short-name
```

Формат commit:

```text
feat(scope): description
fix(scope): description
docs(scope): description
chore(scope): description
refactor(scope): description
```

---

## 12. Завершение задачи

После выполнения задачи предоставить отчёт:

* что реализовано;
* какие файлы изменены;
* какие файлы созданы;
* какие проверки выполнены;
* результаты проверок;
* какие риски остались;
* какие ограничения есть;
* commit hash;
* подтверждение push в `develop`.

---

## 13. Документация

После каждой значимой задачи проверить необходимость обновления:

* `README.md`
* `DOCUMENTATION_INDEX.md`
* Sprint документа
* `CHANGELOG.md`
* `docs/product/`
* `docs/architecture/`
* `docs/security/`
* пользовательской документации.

Документация должна отражать фактическое состояние продукта.

---

## 14. `.claude` legacy

Папка `.claude`, если присутствует, относится к старому Claude Code workflow.

Не удалять её без отдельной задачи.

Если важные инструкции из `.claude` отсутствуют в `AGENTS.md` или `AI_DEVELOPMENT_GUIDE.md`, предложить перенос.

Основные инструкции для текущей работы — `AGENTS.md` и `AI_DEVELOPMENT_GUIDE.md`.

---

## 15. Главный принцип

Каждое изменение должно приближать DTEK Core к стабильному, безопасному и поддерживаемому коммерческому MVP.

Не делать лишнего.

Не ломать рабочее.

Не переписывать без необходимости.

Сохранять архитектуру, безопасность, документацию и качество.
