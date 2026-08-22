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

* **Sprint 12** — Evidence-backed Trust Explainability; S12-T001–T008 реализованы, итоговый QA checklist подготовлен, ручная приёмка владельцем проекта отложена до pilot release gate.
* **Sprint 13** — Pilot Risk Workflow; S13-T001–T008 реализованы, QA checklist подготовлен, authenticated manual QA ожидается.
* **Консолидация 03.08.2026** — dependency baseline усилен, contract tests включены в CI, Supabase seed config и документация синхронизированы.
* **Roadmap фиксация 07.08.2026** — коммерческий MVP ограничен Sprint 13 (Pilot Risk Workflow) и Sprint 14 (Pilot Readiness); Sprint 15 и Discovery/Evidence/Connector инициативы — Post-MVP.
* **Sprint 14** — S14-T001–T004 реализованы: master readiness checklist, environment health, manual invitation delivery и production HTTP smoke baseline; authenticated release-candidate gates не отмечать `PASS` без фактического прогона.
* Cloud migrations `001–019` применены и сверены с Supabase Cloud; migration 019 ограничивает Audit Log ролями owner/admin на уровне RLS. Ручные Sprint 12/13 QA остаются обязательными pilot release gates. Не отмечать QA как PASS без фактического authenticated прогона.

Sprint 13 развивает Market MVP без изменения продуктовой границы: добавляет
pilot-ready workflow поверх manual/imported Risk Registry. Все последующие
Sprint должны учитывать Evidence-first стратегию: import является первым
evidence ingestion path, explainability показывает источники данных, а
connector framework развивается поэтапно.

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

### Ограниченный Рабочий Цикл

Один Task ID выполняется как один ограниченный рабочий цикл:

```text
анализ → реализация → локальные проверки → cleanup процессов
→ Terminal Health Gate → документация → commit/push → короткий итог
```

Не объединять несколько независимых Sprint-задач, полный аудит, регрессионное
тестирование и Git-финализацию в одну непрерывную execution session. После
`build`, test runner, browser/smoke testing, dev server, Supabase CLI и других
длительных операций убедиться, что watchers, background shells, log streams и
дочерние Node-процессы завершены. Следующую задачу начинать только после
подтверждения стабильного terminal state.

Финальные `type-check`, lint и build выполнять один раз после последнего
соответствующего изменения. Не повторять успешные проверки только ради отчёта;
после последующей правки повторять лишь затронутые проверки.

### Короткие Команды И Внешние Статусы

Codex не должен создавать длительное состояние `Ran a command` без понятного
прогресса. Диагностику и чтение выполнять небольшими командами, проверки — по
одной или небольшими независимыми группами. Если build/test продолжает работу,
ожидать только уже запущенный процесс и регулярно сообщать его стадию.

Terminal-команды по умолчанию должны быть non-interactive. Для просмотра
истории всегда использовать `git --no-pager log`; не запускать watchers и
`npm run dev` как foreground-команды финальной проверки. Сетевые Git-команды
выполнять с `GIT_TERMINAL_PROMPT=0`, чтобы credential prompt завершался явной
ошибкой, а не оставлял скрытое ожидание ввода.

### Terminal Health Gate

Перед финальными Git-командами отдельно выполнить
`echo CODEX_TERMINAL_HEALTH_OK` и `pwd`. Обе команды должны немедленно вернуть
ожидаемый stdout и `exit_code: 0`. Если этого не произошло, никакие новые
Git-команды в этой terminal session не запускать:
остановить только активный lifecycle по его `cell_id`/`session_id`, восстановить
terminal session и повторить gate. Не изменять репозиторий или Git config для
маскировки сбоя execution layer.

В code-mode lifecycle инструмента имеет два разных идентификатора. Если
`functions.exec` возвращает `cell_id`, продолжать только через `functions.wait`
для этого cell. Если результат затем содержит terminal `session_id`, cell уже
не является точкой ожидания: продолжать только через `write_stdin` для этого
session до фактического `exit_code`. Каждый nested tool result обязательно
передавать через `text(...)`; иначе UI покажет `No output` при уже выполненной
команде. Не запускать повторную команду поверх любого из этих состояний.

Метка UI `No output` сама по себе не является состоянием Git-процесса. Если
nested result не содержит `exit_code`, нельзя запускать прямой `git status`
повторно или ждать интерфейс бесконечно: проверить `cell_id`/`session_id` и
довести существующий lifecycle до завершения. Для финальной проверки всегда
использовать `npm run git:health`; runner имеет собственный timeout, проверяет
обязательный stdout branch status и возвращает явный `PASS` или exit code 1.

Если обычная локальная команда (`git status`, `git diff`, `git branch`) не
завершается примерно за 10 секунд, не ждать и не повторять её поверх текущего
процесса: остановить именно этот процесс и диагностировать pager, hook, lock,
filesystem или terminal environment. Длительные build/test-команды можно ждать
дольше только при подтверждённом прогрессе и реальном exit code. Успешный
частичный output не считается завершением команды.

После подтверждённого `git push` запрещён циклический polling GitHub/Vercel.
External deployment status проверяется максимум один раз без ожидания смены
состояния. `pending` не блокирует завершение обычной feature-задачи; ожидать
`success` следует только при прямом запросе пользователя на проверку deploy.

Никогда не объединять `git add && git commit && git push` или
`git status && git rev-list` в одну команду. Каждый Git-шаг запускается
отдельно, а сетевой push — неинтерактивно с `--porcelain`. После успешного push
не выполнять повторные external status checks. Пустой вывод `git add` и чистого
`git status --short` является нормальным результатом, а не причиной повторного
запуска.

Если реализация, проверки и документация завершены, но terminal session
сломалась перед Git, не повторять разработку. В свежей session проверить diff и
status, затем отдельно выполнить commit, push и финальный health check.

Финальный отчёт разрешён только после фактического exit code для commit/push и
отдельной короткой проверки синхронизации. Если команда была остановлена или её
результат не получен, явно отметить Git-шаг незавершённым.

Для воспроизводимой диагностики использовать `npm run diagnose:terminal`, а для
stress-test — `npm run check:terminal`: runner создаёт двадцать изолированных
non-interactive command cycles и ограничивает каждую команду десятью секундами.
При timeout он завершает конкретный subprocess и печатает `COMMAND TIMEOUT`,
команду и длительность. Финальная проверка обычной задачи должна выполняться
через короткий `npm run git:health`, а не прямой nested `git status` или
`git rev-list`. Полный двадцатицикловый stress-test нужен для диагностики, не
после каждой feature-задачи. Перед ответом проверить, что запущенные Codex dev
server, watcher или test runner завершены.

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
