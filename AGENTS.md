# AGENTS.md — DTEK Core

> Компактный постоянный контекст Codex. Подробности читать только по маршрутам
> ниже: не загружать весь репозиторий и всю документацию перед каждой задачей.

## 1. Проект И Текущий Этап

**DTEK Core** — коммерческая Evidence-first Trust Intelligence Platform для
CISO, аналитиков ИБ и IT-администраторов.

Ключевые сущности: Trust Passport, Trust Score, Trust Graph и Risk Registry.
После ADR-007 ручной ввод остаётся fallback и экспертной корректировкой, а
автоматизация развивается через Evidence Layer и Connector Framework.

Фактическое состояние:

- Sprint 01–15 завершены; история находится в `tasks/archive/`;
- Sprint 16–35 — только `PLANNED / NOT STARTED`;
- Security & Stabilization Gate обязателен до нового продуктового Sprint;
- Preflight и SEC-01–SEC-04 завершены;
- local/cloud migrations `001–025` совпадают на 09.11.2026;
- следующая задача Gate: `STAB-01 — Atomic Organization Creation`;
- следующий номер migration: `026`;
- authenticated QA Sprint 12/13, Gate QA и restore rehearsal остаются `PENDING`.

Источник текущего статуса: `tasks/SECURITY_STABILIZATION_GATE.md`.

## 2. Приоритет Источников

При конфликте:

1. `ARCHITECTURE_DECISIONS.md`
2. `docs/product/PRODUCT_STRATEGY.md`
3. `docs/roadmap/ROADMAP.md`
4. текущий task/Sprint документ
5. `AGENTS.md`
6. `AI_DEVELOPMENT_GUIDE.md`
7. остальные документы

Если конфликт влияет на архитектуру, безопасность или roadmap — остановиться и
сообщить владельцу.

## 3. Контекст По Требованию

Не читать автоматически README, все backlog, все Sprint, весь `docs/` или весь
репозиторий. Использовать `rg`, затем открывать только релевантные фрагменты.

| Тип задачи | Что читать |
|---|---|
| Security/Stabilization Gate | `tasks/SECURITY_STABILIZATION_GATE.md`, затронутые migrations/actions, релевантный `docs/security/*` |
| Архитектура/новый модуль | ADR, `docs/architecture/System_Architecture.md`, профильный architecture document |
| База/RLS/RBAC | профильные migrations, `docs/security/RLS_MODEL.md`, `RBAC_MODEL.md`, `Database_Design_Full.md` |
| Product/Roadmap | `PRODUCT_STRATEGY.md`, `DTEK_PLATFORM_VISION.md`, Roadmap и текущий task |
| UI/UX | текущий экран, связанные компоненты, `/design`, конкретный Design Sprint |
| Connector | `CONNECTOR_FOUNDATION_HANDOFF.md`, ADR-009 и reopening gate S15-T007 |
| Deploy/backup/environment | соответствующий документ в `docs/operations/` |
| Простой локальный fix | только затронутый код, ближайшие тесты и действующий contract |

`CLAUDE.md` и `.claude/` — legacy. Не читать и не менять без отдельной причины.

## 4. Архитектурные Границы

- Стек: Next.js App Router, React, TypeScript strict, Tailwind/Shadcn,
  Supabase/PostgreSQL/Auth/RLS, Vercel. Версии проверять в `package.json`.
- Не менять стек, зависимости, структуру каталогов или публичные contracts без
  отдельного решения.
- Не создавать дублирующие сервисы и альтернативные реализации.
- Порядок изменений: точечный fix → улучшение существующего компонента →
  локальный refactor → архитектурное изменение только по ADR/разрешению.
- DTEK Core не превращать в SIEM, EDR/XDR, DLP, CMDB, scanner или тяжёлую GRC.
- Connector не пишет напрямую в Objects/Risks/Relations/Trust model: только
  общий adapter/ingestion contract, Evidence Layer, review и audit trail.
- До закрытия Gate не начинать Sprint 16 и Platform features.

## 5. Security Инварианты

Всегда проверять RLS, RBAC, active membership, multi-tenant isolation, Server
Action authorization, Zod/input validation, least privilege и safe errors.

Запрещено:

- обходить RLS как основную security boundary;
- использовать `service_role` на клиенте;
- полагаться только на предварительную Server Action проверку перед
  service-role mutation;
- хранить/печатать secrets, tokens, внутренние UUID или raw DB errors;
- отмечать manual QA как `PASS` без фактического authenticated прогона.

## 6. Выполнение Одной Задачи

Один Task ID = один ограниченный цикл:

```text
анализ → план/change surface/риски → RED при bug/security change
→ реализация → затронутые тесты → quality gate → cleanup процессов
→ Terminal Health Gate → документация → commit → push → итог
```

- Не объединять следующий Task ID в тот же цикл.
- Для узкого и однозначного scope выполнять без лишнего подтверждения.
- Перед крупным/архитектурно неоднозначным изменением показать план.
- Использовать существующие patterns и минимальный change surface.
- После build/tests/dev/Supabase остановить watchers, sessions и контейнеры,
  запущенные Codex.
- Не повторять успешную проверку без последующего изменения её области.

## 7. Terminal И Git

- Диагностика — короткими non-interactive командами; поиск через `rg`.
- Если команда не завершилась примерно за 10 секунд без прогресса, не запускать
  дубликат: продолжить её `cell_id` через `functions.wait` или `session_id`
  через `write_stdin` до `exit_code`.
- Каждый nested result публиковать через `text(...)`; UI `No output` не означает
  зависание.
- Не запускать foreground watchers как финальную проверку.
- Перед Git отдельно выполнить `echo CODEX_TERMINAL_HEALTH_OK` и `pwd`.
- `git add`, `git commit`, `git push` выполнять отдельными вызовами.
- Push: `GIT_TERMINAL_PROMPT=0 git push --porcelain origin develop`.
- После push выполнить один `npm run git:health`; не polling GitHub/Vercel.
- `output/` и другие пользовательские untracked файлы не добавлять и не удалять.
- Не использовать destructive Git commands без прямого разрешения.

Branch: `develop`; commit: Conventional Commits; push обязателен после
завершённой задачи. `main` напрямую не изменять.

## 8. Качество И Документация

После последнего изменения кода выполнить:

```bash
npm run type-check
npm run lint
npm run build
```

Запустить существующие затронутые тесты. Не оставлять `any`, временные logs,
неиспользуемые imports, мёртвый код или TODO без задачи.

При изменении фактического статуса синхронизировать только затронутые источники:

- текущий task/Sprint/Gate;
- `CHANGELOG.md`;
- профильную architecture/security/user/operations документацию;
- `README.md` и `DOCUMENTATION_INDEX.md`, только если меняется общий статус;
- Obsidian Control Center:
  `/Users/a000/Documents/Courses/50 — Проекты/DTEK Core/`.

Исторические Sprint в `tasks/archive/` не редактировать.

## 9. Итог Задачи

Кратко сообщить: результат, ключевые файлы, проверки, ограничения/ручные gates,
commit hash и push. Не пересказывать весь проект и не дублировать логи команд.

Главный принцип: минимально и безопасно приближать продукт к коммерческому MVP,
не ломая архитектуру и рабочие сценарии.
