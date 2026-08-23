# CHANGELOG — DTEK Core

Все значимые изменения фиксируются в этом документе.  
Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/).

---

## Sprint 15 Connector Framework Architecture — 2026-08-23

### Добавлено

- Принят ADR-009 и создан единый Connector Framework contract: versioned
  allowlisted adapters, tenant installations, bounded sync runs, server-only
  orchestration и Ingestion Gateway.
- Зафиксированы lifecycle, idempotency/cursor/freshness, mapping boundary,
  manual override, safe errors, audit и observability.
- Secret reference, SSRF protection, service-role boundary и two-tenant tests
  определены как обязательные gates до connector runtime.

### Изменено

- Sprint 15, roadmap, backlogs, architecture/security overview и agent context
  синхронизированы; T006/T007 явно оставлены зависимыми от pilot signals.
- Runtime, migrations, dependencies, UI и конкретный connector не добавлялись.

## Sprint 14 Pilot Documentation Pack — 2026-08-22

### Добавлено

- Создан единый pilot hub с launch card и последовательностью qualification,
  release gate, onboarding, data intake, feedback и closeout.
- Client-facing руководства отделены от internal operations/release materials;
  зафиксированы роли, known limitations и безопасный support/escalation flow.
- Readiness checklist, Sprint, README, Documentation Index и roadmap
  синхронизированы без преждевременной отметки Pilot GO: реальные контакты,
  retention, authenticated QA и release evidence остаются pending.

## Sprint 14 Pilot Metrics & Feedback Loop — 2026-08-22

### Добавлено

- Создан канонический pilot scorecard для qualification, time-to-value, data
  completeness, usage, product value, operations и commercial signal.
- Определены feedback cadence, midpoint/final questions, commitment-based WTP
  ladder, outcome rules и обезличенный cross-pilot synthesis.
- Source inventory дополнен раздельными demand/feasibility scores и gates для
  Sprint 15 connector shortlist без обещания интеграций в MVP.
- Pilot Offer, readiness gates, product strategy и roadmap синхронизированы;
  фактические pilot metrics остаются `PILOT DATA PENDING`.

## Sprint 14 Monitoring & Error Handling Plan — 2026-08-22

### Добавлено

- Создан минимальный pilot monitoring baseline на существующих
  GitHub/Vercel/Supabase signals, Environment Health UI и smoke tests.
- Определены performance/error thresholds, P0-P3 severity, response targets,
  review cadence, triage и component incident playbooks.
- Зафиксированы safe UI/runtime logging, redaction и retry contracts без нового
  telemetry vendor; provider activation и P1 rehearsal остаются release gate.
- Bug report template дополнен operational context и запретом secrets,
  customer payload и internal IDs в evidence.

## Sprint 14 Backup & Restore Runbook — 2026-08-22

### Добавлено

- Создан Supabase Backup & Restore Runbook с backup scope, pilot RPO/RTO
  targets, managed и portable logical backup procedures.
- Описаны безопасный restore-to-new-project, logical fallback, in-place
  safeguards, configuration inventory, validation и controlled cutover.
- Добавлены evidence form и release gate: документация реализована, а
  Dashboard backup verification и disposable-project rehearsal остаются
  `PENDING` до фактического выполнения.

## Sprint 14 Smoke Test Automation Baseline — 2026-08-22

### Добавлено

- Добавлен dependency-free `npm run test:smoke`: runner сам запускает
  production Next.js, проверяет 18 HTTP-контрактов и гарантированно
  завершает дочерний server при PASS, FAIL и terminal signal.
- Public/auth pages, invalid invitation, CSV templates, security headers и
  unauthenticated redirects ключевых app/report routes вошли в baseline.
- Runner поддерживает safe remote GET mode через `SMOKE_BASE_URL` и имеет
  настраиваемые startup/request/performance timeouts.
- Production smoke добавлен в CI после build; создан отдельный
  authenticated Pilot Critical Path checklist для Auth, Organization, imports,
  Objects, Risks, Graph, Reports, RBAC/RLS и mobile.

## Sprint 14 Invitation Delivery Finalization — 2026-08-19

### Изменено

- Manual invite link зафиксирован как официальный Commercial MVP
  delivery path; UI больше не имитирует email-отправку.
- Invite route доступен без auth cookie, ограничен 10 req/60s,
  исключён из индексации и отклоняет token неверного формата до DB query.
- Accept-flow валидирует server input, проверяет mutations и не
  переносит существующий аккаунт между tenant.
- Onboarding wizard направляет owner в `/users` вместо создания
  скрытых invitation без доставки.
- Добавлен Invitation Delivery Runbook с security contract, recovery и
  authenticated pilot QA checklist.

## Sprint 14 Environment Health Check — 2026-08-19

### Добавлено

- В Settings → «Безопасность» добавлена on-demand диагностика окружения для
  `owner/admin` с повторной Server Action авторизацией.
- Проверяются server configuration, session/organization context, Supabase Auth
  API и tenant-scoped database/RLS query; клиент получает только безопасные
  статусы и длительность без secrets, UUID и raw errors.
- Создан operations runbook для env/DNS/Supabase/middleware triage, recovery,
  evidence и escalation; публичный health endpoint и auto-recovery не добавлялись.

## Sprint 14 Pilot Readiness Checklist — 2026-08-19

### Добавлено

- Создан единый master checklist для pilot release candidate с 11 gates,
  evidence/status protocol и финальным решением `GO / CONDITIONAL GO / NO-GO`.
- В обязательные gates включены Sprint 12/13 authenticated QA, Cloud migration
  drift check, Critical Path, RBAC/RLS, tenant isolation, backup/restore,
  monitoring, invitation delivery, pilot metrics и documentation pack.
- Предыдущий зелёный baseline фиксируется как `RECHECK`, а не как разрешение на
  пилот; незавершённые Sprint 14 задачи и ручные проверки остаются `PENDING`.

## Control Stabilization — 2026-08-19

### Исправлено

- Пункты landing navigation получили реальные section links; ссылка
  «Документация» открывает актуальную документацию ветки `develop`.
- Мобильная landing-шапка получила compact layout до 520 px, предотвращающий
  конфликт бренда и CTA на узких viewport.
- Транзитивный `nanoid` обновлён с `3.3.17` до `3.3.18`, закрывая high severity
  advisory без изменения прямых зависимостей.

### Проверено

- Supabase доступен, local/cloud migrations `001–019` синхронизированы.
- Import, explainability и risk workflow contract suites проходят полностью.

## Compact Sidebar User Menu — 2026-08-19

### Изменено

- Постоянный блок имени/e-mail и отдельная logout-строка заменены компактным
  круглым avatar-trigger на базе существующих Avatar и DropdownMenu.
- Имя и e-mail показываются только в доступном пользовательском меню; действие
  «Выйти» перенесено в это же меню с сохранением существующего Server Action.
- «Настройки» остаются отдельным navigation item с прежним маршрутом и
  active-state; верхняя навигация, размеры и viewport-стабильность sidebar не менялись.
- Изменение зарегистрировано в Mini Design журнале как MD-010.

## Trust Intelligence Model Section — 2026-08-18

### Изменено

- Типовая сетка «Четыре опоры платформы» заменена единой продуктовой схемой:
  Паспорт доверия → Оценка доверия → Граф доверия.
- Конфигуратор представлен отдельным управляющим слоем модели; номера 01–04 и
  четыре одинаковые feature-карточки удалены.
- Добавлены сдержанные signal-flow и hover micro-interactions, а tablet/mobile
  используют последовательный вертикальный поток.
- Hero, Trust Graph animation, stats, маршруты и продуктовая логика не изменены;
  задача зарегистрирована как MD-009.

## Homepage Hero Heading Balanced Wrap — 2026-08-18

### Изменено

- Hero heading использует единый семантический текстовый поток и адаптивный
  `text-wrap: balance` вместо принудительной одинаковой разбивки строк.
- Кегль, line-height и letter-spacing уточнены для desktop/notebook/mobile, а
  ширина строго ограничена существующей левой copy-column.
- Trust Graph, hero grid, CTA, подзаголовок, остальные элементы и
  функциональность не изменены; задача зарегистрирована как MD-008.

## Homepage Hero Heading Controlled Two Lines — 2026-08-18

### Изменено

- Hero heading использует заданные строки «Цифровое доверие» и «и киберриски
  активов», устраняя пересечение однострочного варианта с Trust Graph.
- Wide-title и desktop/notebook `nowrap` удалены; второй ряд получил отдельный
  адаптивный кегль и line-height, а mobile сохраняет естественный перенос.
- Trust Graph component, animation, размеры, позиционирование, hero grid, CTA и
  остальные элементы не изменены; задача зарегистрирована как MD-007.

## Homepage Hero Heading Single Line — 2026-08-18

### Изменено

- Полный заголовок «Цифровое доверие и киберриски активов» использует единую
  строку на desktop/notebook вместо двух принудительных line wrappers.
- Заголовок получил отдельную responsive ширину и умеренный desktop/notebook
  font range; tablet/mobile сохраняют естественный перенос.
- Trust Graph component, animation, hero grid, CTA и остальные элементы не
  изменены; правка зарегистрирована в Mini Design журнале как MD-006.

## Homepage Hero Heading — 2026-08-18

### Изменено

- Заголовок hero собран в две смысловые desktop-строки: «Цифровое доверие» и
  «и киберриски активов»; второй ряд получил адаптивный кегль и может естественно
  переноситься на mobile без жёсткого третьего разрыва.
- Trust Graph, hero grid, CTA, исходный текст и animation logic не изменены.
- Изменение зарегистрировано в общем Mini Design журнале как MD-005 с отдельным
  baseline после документационной консолидации.

## Mini Design Journal — 2026-08-18

### Изменено

- Mini Design история Button System, Download UX, Stable Sidebar и Landing
  Trust Graph объединена в `tasks/disign/MINI_DESIGN_CHANGES.md` как MD-001–004.
- `AI_DEVELOPMENT_GUIDE.md` закрепляет единый Mini Design журнал и отдельный
  rollback baseline/commit для каждой последующей небольшой UI/UX-задачи.

### Удалено

- После переноса истории удалены ставшие дублирующими
  `DESIGN_SPRINT_02–05`; самостоятельный Figma-first Sprint Settings/Profile
  сохранён отдельно.

## Landing Trust Graph Hero — 2026-08-18

### Изменено

- Существующая Trust Graph animation получила большую долю hero, высоту до
  680 px и общее depth/glow field, связывающее canvas с текстовой композицией.
- Canvas пропорционально масштабирует nodes, edges, pulses и центральный Trust
  Score без добавления объектов или изменения risk propagation scenario.
- На tablet и mobile граф больше не скрывается: используется вертикальная hero
  композиция, адаптивная высота и компактные overlay cards без horizontal scroll.
- Reduced-motion режим показывает hero статично, сохраняя всю информацию без
  entrance, float и pulse animations.

## Stable Sidebar Layout — 2026-08-17

### Исправлено

- App Shell теперь занимает стабильные `100dvh`, поэтому sidebar больше не
  растягивается длинными страницами и не уменьшается на коротких.
- Main content прокручивается в собственной ограниченной области, а sidebar
  navigation сохраняет независимый внутренний scroll при нехватке высоты.
- Grid columns используют `minmax(0, 1fr)`, предотвращая horizontal overflow
  без изменения ширины, дизайна, navigation или содержимого страниц.

## Download & Export Button — 2026-08-17

### Добавлено

- Shared `DownloadButton` с состояниями idle/loading/success/error/disabled,
  real-operation lifecycle, защитой от повторного запуска и toast retry UX.
- Анимация download arrow, правая success-область и arrow-to-check transition
  на текущих DTEK tokens с поддержкой `prefers-reduced-motion`.

### Изменено

- Risk Registry CSV, CSV-шаблоны импорта, validation CSV и printable
  Passport/Executive reports используют единый download UX.
- Fetch-based downloads дожидаются фактического Blob, сохраняют исходное имя
  файла и освобождают object URL; export formats, filters, RBAC и audit не
  изменены.

## Global Button System — 2026-08-17

### Изменено

- Action-кнопки DTEK Core получили единый pill radius, мягкий hover lift,
  pressed feedback, тень и умеренный расходящийся halo без изменения цветов,
  обработчиков, ссылок или business logic.
- Global `.btn` теперь имеет корректный medium-размер по умолчанию; `sm`, `md`
  и `lg` сохраняют отдельные размеры, а destructive/line/ghost variants — свою
  цветовую семантику.
- Shadcn `Button` синхронизирован для Alert Dialog; icon-only actions используют
  сдержанную анимацию без большого halo.
- Disabled и `aria-disabled` состояния не анимируются; для
  `prefers-reduced-motion` transforms и halo отключены.

## Codex Long Task Stability Policy — 2026-08-12

### Изменено

- Один Sprint Task закреплён как ограниченный цикл с обязательным cleanup
  длительных процессов перед Git-финализацией.
- Terminal Health Gate синхронизирован на две мгновенные проверки:
  `echo CODEX_TERMINAL_HEALTH_OK` и `pwd`; automated runner проверяет обе.
- Успешные quality checks не повторяются без изменений, а сбой execution
  session перед Git завершается в fresh shell без повторной реализации.

## Terminal Execution Hardening — 2026-08-12

### Изменено

- Terminal health runner переведён на прямые isolated subprocess без stdin/PTY;
  pager, optional locks и credential prompt отключены, каждая короткая команда
  имеет kill timeout 10 секунд и явный `COMMAND TIMEOUT` report.
- `npm run check:terminal` выполняет 20 циклов `echo`, HEAD, status, log и
  rev-list; добавлен полный `npm run diagnose:terminal`, а обычный
  `npm run git:health` оставлен минимальным и не вызывает rev-list.
- AGENTS, AI Development Guide и troubleshooting закрепляют Terminal Health
  Gate и корректный lifecycle `cell_id` → `session_id` → `exit_code`.

## Git Status Health Check — 2026-08-12

### Изменено

- Добавлен `npm run git:health`: односессионная финальная проверка требует
  фактический branch stdout, чистый synchronized working tree, имеет timeout и
  печатает явный `PASS`, чтобы UI `No output` не принимался за состояние
  `git status`.
- Финальный workflow Codex больше не вызывает прямой nested `git status`:
  wrapper lifecycle завершается по `cell_id`/`session_id`, а Git health
  подтверждается контролируемым subprocess.

## Terminal Safety Policy — 2026-08-09

### Изменено

- Добавлен `npm run check:terminal`: десять изолированных shell-сессий проверяют
  read-only Git-команды с non-interactive окружением и timeout 10 секунд.
- Инструкции Codex фиксируют раздельный lifecycle `cell_id` и terminal
  `session_id`, обязательную публикацию nested tool result и минимальную
  финальную Git-проверку без pager и повторного polling.

## Risk Comments Stabilization — 2026-08-09

### Исправлено

- Неожиданные Supabase/Auth исключения при добавлении комментария к риску больше
  не попадают в Next.js Runtime Error как сырой объект PostgREST. Server Action
  и клиентская форма возвращают безопасное сообщение и сохраняют введённый текст
  для повторной отправки.

## AI Workflow Stabilization — 2026-08-09

### Изменено

- `AI_DEVELOPMENT_GUIDE.md` и `AGENTS.md` ограничивают длительные составные
  команды и запрещают циклическое ожидание GitHub/Vercel status после
  подтверждённого push. Внешний deployment `pending` больше не блокирует
  завершение обычной feature-задачи.

## Performance Stabilization — 2026-08-08

### Исправлено

- Повторные Supabase Auth/Profile round-trip в middleware, App Shell, Server
  Components и Server Actions сокращены: защита использует верифицированный
  JWT claims context, общий для одного SSR render.
- Server Actions больше не проходят дополнительную middleware-проверку до
  собственной RBAC-авторизации; создание организации распараллеливает
  независимые profile/config записи.
- Fail-fast timeout Supabase уменьшен с 4 до 2 секунд, чтобы недоступный DNS
  или endpoint не воспринимался как зависание интерфейса.
- Гостевые auth-страницы и редиректы с защищённых маршрутов больше не ждут
  Supabase, если в запросе отсутствует auth-cookie.
- Лендинг больше не выполняет `auth.getUser()` перед рендером; auth-страницы
  игнорируют refresh устаревшей cookie, а session check защищённого маршрута
  ограничен единым fail-fast timeout.

## Sprint 13 Kickoff — 2026-08-08

### Изменено

- Cloud migrations `001–017` сверены с восстановленным Supabase Cloud.
- Ручная приёмка Sprint 12 зафиксирована как отложенный pilot release gate по
  решению владельца проекта; она не отмечена как `PASS` и не закрывает Sprint 12.
- Начат Sprint 13. S13-T001 утвердил минимальную модель Pilot Risk Workflow:
  существующие поля `risks` покрывают owner/SLA, а comments/activity потребуют
  одну tenant-scoped RLS migration в следующих задачах.
- README, Sprint Roadmap, Technical Debt и deployment handoff синхронизированы:
  manual QA Sprint 12 остаётся условием pilot release, но не блокирует работу
  Sprint 13 в `develop` по явному решению владельца.

### Добавлено

- S13-T002: owner и analyst могут назначать или снимать ответственного за риск
  из активных участников своей организации. Назначение показывается в Risk
  Registry и drawer, а Server Action повторно проверяет tenant и active status
  выбранного профиля.
- S13-T003: срок устранения и SLA можно задавать при создании и редактировании
  риска. Risk Registry и drawer различают просрочку, срок менее трёх дней,
  выполнение в графике, завершённый SLA и отсутствие срока; закрытые статусы
  не показываются как просроченные.
- S13-T004: добавлены immutable комментарии к рискам, tenant-scoped RLS tables
  `risk_comments` и `risk_activity`, activity event `comment_added` и read-only
  отображение для admin/viewer. Server Action ограничивает запись ролями owner
  и analyst и проверяет принадлежность риска организации. Migration 018
  применена к связанному Supabase Cloud.
- S13-T005: Risk Registry различает manual и imported риски; drawer показывает
  безопасный source context без `source_record_id` и честно отделяет metadata
  от Evidence Layer. Редактирование пользовательского описания сохраняет
  trailing import block, не раскрывая его в форме.
- S13-T006: drawer показывает tenant-scoped activity timeline изменений
  ответственного, срока/SLA, статуса и добавления комментария. Metadata не
  содержит UUID, неизвестные события не передаются клиенту, старые действия не
  синтезируются. Pure formatter покрыт contract tests и включён в CI.
- S13-T007: успешные изменения ответственного, срока/SLA и статуса риска
  фиксируются отдельными tenant-scoped security audit events. Audit metadata
  ограничена безопасным before/after context без UUID, description, import
  source и comment body; owner/admin видят локализованные детали в Audit Log.
- S13-T008: подготовлен authenticated Risk Workflow QA checklist на 14 сценариев;
  пользовательские, архитектурные, security, roadmap и testing документы
  синхронизированы. Реализация Sprint 13 завершена, manual QA остаётся `PENDING`.
- QA-сверка выявила и migration 019 исправляет RLS gap: прямое чтение
  `security_events` теперь разрешено только owner/admin, а не всем участникам
  организации.

## Current Stage Consolidation — 2026-08-03

### Исправлено

- Next.js и связанный ESLint baseline обновлены в пределах ветки 15; уязвимые transitive PostCSS и sharp заменены безопасными версиями через npm overrides.
- Supabase local seed отключён: конфигурация больше не ссылается на отсутствующий `supabase/seed.sql`.
- Устаревшие утверждения об отсутствии CSV/XLSX import и reporting удалены из актуальных пользовательских и эксплуатационных документов.

### Изменено

- `npm run lint` переведён с deprecated `next lint` на прямой ESLint CLI с `--max-warnings=0`.
- GitHub Actions выполняет import и explainability contract tests до production build.
- README, Documentation Index, Deployment, Test Strategy, Technical Debt, FAQ, Pilot Offer, Roadmap и backlog синхронизированы с фактическим состоянием Sprint 11/12.
- Known Limitations собраны в `TECHNICAL_DEBT.md`; отдельный дублирующий документ не создавался.

### Проверено

- Sprint 11 остаётся последним полностью закрытым Sprint.
- Реализация Sprint 12 завершена; authenticated manual QA остаётся обязательным gate и не отмечен как PASS формально.
- Новый Sprint и новый продуктовый функционал не начинались.

---

## Roadmap Finalization — 2026-08-07

### Изменено

- Коммерческий MVP официально ограничен Sprint 13 — Pilot Risk Workflow и Sprint 14 — Pilot Readiness.
- Sprint 13 очищен от auto-candidate risks, Discovery Inbox и Evidence Layer runtime: в MVP остаётся workflow для manual/imported risks с origin context.
- Sprint 14 стал финальным release gate и включает authenticated QA Sprint 12 и сверку Cloud migrations.
- Sprint 15, Connector Framework, Evidence Layer, Discovery, Identity Resolution и первый connector prototype явно переведены в Post-MVP.

### Документация

- Roadmap, Sprint Roadmap, MVP Scope, Product Strategy, release/epic/feature backlogs, Sprint 13–15, README, Documentation Index, AGENTS и Technical Debt синхронизированы с зафиксированной границей MVP.

---

## Sprint 12 — Evidence-backed Trust Explainability

### S12-T008 — Explainability QA Checklist

#### Добавлено

- Ручной QA checklist полного Sprint 12 с эталонным Score 63, factor arithmetic, Top Drivers, custom weights, clamp, rounding и counterfactual Risk Impact Hint.
- Сценарии Score Delta Timeline, manual/imported/malformed source context, Dashboard aggregation, import regression, четырёх ролей, tenant isolation, safe errors и mobile/desktop UI.
- Итоговый протокол и Definition of Ready для честного закрытия milestone после ручной приёмки владельцем проекта.

#### Изменено

- Sprint 12, README, Documentation Index, Roadmap, Sprint Roadmap, MVP Release Plan, AGENTS и explainability specification синхронизированы: реализация S12-T001–T008 завершена, manual QA остаётся условием закрытия milestone.

#### Безопасность И Граница Продукта

- Чеклист отдельно проверяет отсутствие internal IDs и raw errors, read-only доступ четырёх ролей, запрет переоценки для viewer и изоляцию второй организации.
- Source context, confidence, timestamps и impact hints проверяются в пределах утверждённой модели без изменения ADR-001, схемы БД или Evidence Layer.

### S12-T007 — User Documentation: Why This Score

#### Добавлено

- Пользовательское объяснение блоков Trust Passport: «Ключевые факторы оценки», reason cards, source context, «Почему изменился Score» и Risk Impact Hint.
- FAQ по Sprint 12 explainability: neutral reference 70, отличие source context от evidence record, ограничения истории, counterfactual impact и Dashboard summary.
- Краткое объяснение explainability в основном User Guide.

#### Изменено

- Trust Score Guide расширен разделом «Почему Score такой» и рекомендациями по работе с объяснениями.
- README, Documentation Index, Roadmap, Sprint Roadmap и Sprint 12 синхронизированы с завершением пользовательской документации.

#### Безопасность И Граница Продукта

- Документация явно фиксирует, что explainability не меняет формулу ADR-001, не добавляет новый score engine, не делает `confidence` частью расчёта и не трактует import source context как полноценный evidence record.

### S12-T006 — Dashboard Explainability Summary

#### Добавлено

- Компактная сводка трёх главных отрицательных факторов организации на Dashboard с охватом паспортов, средним object-level отклонением и текущим весом.
- Прямая ссылка на Trust Passport объекта с наибольшим отрицательным driver для каждого фактора.
- Honest empty states для отсутствующих факторных данных и отсутствия материальных отрицательных drivers.
- Contract-тесты организационной агрегации, stable ranking, neutral filtering и неполного passport coverage.

#### Изменено

- KPI объектов, trust distribution, top-5 и explainability строятся из одного tenant-scoped набора активных объектов; количество параллельных Dashboard-запросов сокращено с тринадцати до семи.
- Sprint 12, README, Roadmap, Sprint Roadmap, MVP Release Plan, Feature Backlog и Technical Debt синхронизированы с завершением S12-T006.

#### Безопасность

- Сводка учитывает только неархивные объекты текущей организации и дополнительно сверяет tenant паспорта перед агрегацией.
- Новая метрика не является отдельным организационным Score; формула ADR-001, схема БД, RLS/RBAC, права записи и зависимости не изменены.

### S12-T005 — Score Delta Explanation With Evidence Timeline

#### Добавлено

- Блок «Почему изменился Score» в Trust Passport с фактической delta, причиной, безопасной ролью инициатора и историей до пяти событий.
- Сравнение факторных оценок только по последовательным полным `factors_snapshot` с честными fallback-состояниями для первой и неполной записи.
- Timeline текущих import/manual sources с дедупликацией, сортировкой по дате сбора и явным отказом от недоказанной исторической причинности.
- Сводка последнего изменения Score и source context в printable Trust Passport.
- Contract-тесты factor delta, malformed snapshots, actor sanitization, source ordering, deduplication и limit.

#### Изменено

- Tenant-scoped Passport report получает до шести записей `trust_score_history`, чтобы построить пять сравнимых событий без дополнительных клиентских запросов.
- Sprint 12, README и Technical Debt синхронизированы с завершением S12-T005.

#### Безопасность

- История запрашивается по `object_id` и текущему `organization_id`; клиент получает нормализованный read model без raw `changed_by`, `source_record_id` и исходных snapshots.
- Формула ADR-001, схема БД, RLS/RBAC, права записи, зависимости и Trust Score Engine не изменены.

### S12-T004 — Risk Impact Hint

#### Добавлено

- Counterfactual Risk Impact Hint через два расчёта существующим Trust Score Engine: со всеми рисками и без выбранного риска.
- Отдельный impact по каждому связанному объекту в Risk Drawer и компактные подсказки в Trust Passport и printable Passport.
- Состояния потенциального роста, отсутствия изменения после округления, неактивного риска и отсутствующей связи.
- Contract-тесты custom weights, inactive risks, distributed penalties, clamp и финального округления.

#### Изменено

- Risk Registry загружает полные tenant-scoped поля объектов и актуальный `trust_factor_config` для server-side impact read model.
- Фиктивная формула `CVSS × 2` и недостоверное обещание снять ограничение сегмента удалены из Risk Drawer.
- Sprint 12, README и Technical Debt синхронизированы с завершением S12-T004.

#### Безопасность

- Impact рассчитывается read-only на сервере после проверки текущей организации; связи с объектами другой организации исключаются из модели.
- Counterfactual результаты не сохраняются, не меняют Score и не добавляют новых привилегий, миграций или зависимостей.

### S12-T003 — Factor Reason Cards With Sources

#### Добавлено

- Шесть раскрываемых Factor Reason Cards в Trust Passport с base, active risk penalties, completeness bonus, clamp state и взвешенным вкладом.
- Строгий parser последнего trailing `[Import Source]` block с безопасным manual fallback для отсутствующих или malformed metadata.
- Source context объекта и влияющих рисков с типом, датой сбора и confidence без маркировки import metadata как полноценного evidence record.
- Contract-тесты факторной арифметики, active/closed risk filtering, distributed penalties, clamp и source parser.

#### Изменено

- Trust Score Engine и explainability используют общие pure helper-функции base, penalty и completeness bonus без изменения ADR-001.
- Passport report получает completeness и source metadata, а связанные риски дополнительно проверяет по текущей организации.
- Sprint 12, README и Technical Debt синхронизированы с завершением S12-T003.

#### Безопасность

- Explainability read model строится на сервере после RBAC и tenant-проверки; клиент не получает исходные descriptions или `source_record_id`.
- Новых привилегий, записей в БД, миграций и зависимостей нет.

### S12-T002 — Top Score Drivers

#### Добавлено

- Pure-модуль Trust Score explainability для factor contribution, neutral delta, direction и стабильного top-5.
- Блок «Ключевые факторы оценки» в Trust Passport с положительными/отрицательными drivers и neutral state.
- Contract-тесты утверждённого примера, custom weights, top-5, neutral filtering и stable ties.

#### Изменено

- Trust Passport и printable report используют актуальные веса `trust_factor_config`, а не только design defaults.
- Дефолтные веса вынесены в единый контракт и переиспользуются Trust Engine и report service.
- Sprint 12 и README синхронизированы с завершением S12-T002.

#### Безопасность

- Drivers рассчитываются в tenant-scoped report flow и доступны в read-only режиме всем ролям с доступом к паспорту.
- Новых клиентских привилегий, записей в БД, миграций и зависимостей нет.

### S12-T001 — Evidence-backed Explainability Model Specification

#### Добавлено

- `docs/architecture/Evidence_Explainability_Model.md` — единый explainability contract для Trust Score, factor reasons, top drivers, risk impact, score delta и source/evidence context.
- Детерминированные правила neutral delta и counterfactual impact, учитывающие текущие веса, clamp и финальное округление Trust Score Engine.

#### Изменено

- Sprint 12 переведён в активное состояние; S12-T001 отмечена завершённой.
- README, Documentation Index, Roadmap, Sprint Roadmap, MVP Release Plan и Technical Debt синхронизированы с началом Sprint 12.

#### Архитектура И Безопасность

- Формула ADR-001, схема БД, зависимости, RLS и RBAC не изменены.
- Import source context отделён от future Evidence Layer; `confidence` не влияет на Score.
- Explainability определена как tenant-scoped read model без клиентского `service_role` и без записи counterfactual результатов.

## Strategic Shift — 2026-07-09

### Evidence-first Trust Platform

#### Добавлено

- `docs/product/EVIDENCE_FIRST_STRATEGY.md` — новая продуктовая концепция DTEK Core как Evidence-first Trust Intelligence Platform.
- `docs/architecture/Evidence_First_Architecture.md` — целевая архитектура Discovery Layer, Connector Framework, Evidence Layer, Normalization, Identity Resolution, Confidence Engine, Discovery Inbox, Drift Detection и Auto Risk Mapper.
- ADR-007 в `ARCHITECTURE_DECISIONS.md` — архитектурное решение о переходе от manual-first MVP к evidence-first развитию.

#### Изменено

- README, AGENTS, Product Strategy, Vision, Product Concept, Roadmap и Sprint Roadmap синхронизированы с новой концепцией.
- Sprint 11–15 перестроены вокруг Evidence Import, evidence-backed explainability, evidence-aware risk workflow, pilot source inventory и Connector Framework Foundation.
- Trust Passport, Trust Score, Trust Graph и Risk Registry описаны как evidence-backed модели.
- Backlog и User Stories дополнены Evidence-first Epic: Discovery Layer, Evidence Layer, Identity Resolution, Discovery Inbox, Auto Risk Mapper и Drift Detection.

---

## Sprint 11 — Evidence Import & Data Onboarding

### Sprint 11 Closure — Evidence Onboarding Ready

#### Изменено

- Sprint 11 переведён из стабилизации в закрытое состояние после повторной ручной приёмки Data Onboarding.
- README, Documentation Index, Roadmap, Sprint Roadmap, MVP Release Plan, Feature Backlog, AGENTS и smoke checklist синхронизированы с фактическим состоянием Sprint 11.
- Следующий активный этап зафиксирован как Sprint 12 — Evidence-backed Trust Explainability.

#### Проверено

- Повторный smoke test подтвердил import flow для 60 объектов и 25 рисков, CSV/XLSX parsing, preview, source metadata, duplicate detection, partial success, RBAC/tenant isolation, audit events и связанные страницы.

### Post-Sprint 11 — Import Stabilization

#### Исправлено

- Risk CSV export DTEK Core повторно импортируется через localized header mapping и приоритет технических `*_key` колонок.
- Файлы неправильного типа распознаются до preview и направляют пользователя в соответствующий import modal.
- Async file read, preview и commit всегда завершаются success, error или timeout state; после неизвестного commit status слепой повтор блокируется.
- Unknown, ignored и mapped headers группируются; preview разделяет errors, warnings и information.
- Duplicate messages указывают конкретные matching fields; tab-separated CSV поддерживается parser.

#### Добавлено

- `testing/sprint-11-import/` с valid 60/25, partial success, duplicate, invalid, localized, export roundtrip и performance 200/100 fixtures.
- `npm run test:import` с contract-тестами parser, mapping, templates, roundtrip, RBAC, duplicates и partial success.

#### Безопасность

- Server-side wrong-dataset validation дублирует client UX; RBAC и tenant-scoped organization checks сохранены без миграций и изменений RLS.

### S11-T008 — Data Onboarding Smoke Test

#### Добавлено

- Ручной smoke test модуль Data Onboarding с контрольным импортом 60 объектов и 25 рисков.
- Сценарии CSV/XLSX, preview, validation report, source metadata, duplicates, partial success, RBAC, tenant isolation, audit, Trust Score, основных страниц, performance и mobile UI.

#### Изменено

- README, Documentation Index, Import Guide и Sprint 11 связаны с новым checklist.
- На момент S11-T008 Sprint 11 был переведён в состояние готовности к ручной приёмке без преждевременного объявления runtime-проверок успешными.

### S11-T007 — Import Documentation

#### Добавлено

- Полное пользовательское руководство по CSV/XLSX import объектов и рисков: роли, contract, source metadata, preview, validation report, partial success и ограничения.
- Раздел диагностики типовых import errors в FAQ и Troubleshooting.

#### Изменено

- User Guide, Platform Workflow, Object Model Guide и Risk Registry Guide синхронизированы с фактическим import flow Sprint 11.
- README, Documentation Index, Evidence Import Schema и Sprint 11 связаны с пользовательской документацией.

### S11-T006 — Import Audit Events

#### Добавлено

- Audit events `import.objects_completed`, `import.risks_completed` и `import.failed`.
- Общий server-side import audit helper с sanitization file/source strings и агрегированных counters.
- Отображение import events, результата и инициатора в журнале аудита `/settings`.
- Security tests для успешного objects/risks import и validation failure.

#### Изменено

- Object/Risk commit фиксирует полный, частичный и неуспешный результат без записи raw CSV/XLSX data.
- Sprint 11, Evidence Import Schema, README и security-документация синхронизированы с S11-T006.

### S11-T005 — Import Templates

#### Добавлено

- Канонический CSV-шаблон импорта объектов с допустимой примерной строкой.
- Канонический CSV-шаблон импорта рисков и связи с объектом.
- Download-команда «Шаблон CSV» в общих диалогах импорта Objects и Risks.

#### Изменено

- `tasks/SPRINT_11.md`, README и Evidence Import Schema синхронизированы с фактическими template URL и UX S11-T005.

### S11-T004 — Import Preview, Validation & Source Metadata

#### Добавлено

- File-level source metadata для objects/risks import: название, тип, confidence, дата сбора и комментарий.
- Расширенный preview с total, valid, creatable, error, duplicate и warning counters.
- Source summary с effective defaults и количеством построчных переопределений.
- Полный UTF-8 CSV validation report с исходными значениями, рекомендациями и защитой от spreadsheet formula injection.

#### Изменено

- Построчные source-поля имеют приоритет над metadata, заданными в диалоге импорта.
- Preview и commit используют один source payload и повторную server-side validation.
- `tasks/SPRINT_11.md`, README и Evidence Import Schema синхронизированы с реализацией S11-T004.

### S11-T003 — Risks CSV/XLSX Import

#### Добавлено

- Диалог импорта рисков на `/risks` с CSV/XLSX preview и явным commit.
- Server-side risk import pipeline: aliases, CVSS, SLA/due date, source context, duplicate detection и object matching.
- Безопасная привязка импортированных рисков к объектам текущей организации по имени или уникальному IP.
- Общий import UI и shared parsing/validation primitives для objects и risks import.

#### Изменено

- Trust Engine поддерживает отложенный пересчёт organization index для эффективного batch risk import.
- Стили import dialog перенесены в global scope и переиспользуются страницами Objects и Risks.
- `tasks/SPRINT_11.md`, README и Evidence Import Schema синхронизированы с реализацией S11-T003.

### S11-T002 — Objects CSV/XLSX Import

#### Добавлено

- Диалог импорта объектов на `/objects` с поддержкой CSV и первого листа XLSX.
- Browser file reader для CSV/XLSX и server-side import pipeline с Zod validation, enum aliases, source context и duplicate detection.
- Server Actions для validation preview и подтверждённого create-only импорта с partial success.
- Зависимость `read-excel-file` для безопасного чтения XLSX без spreadsheet editor или изменения БД.

#### Изменено

- RBAC импорта соответствует ADR-003 и import schema: `owner`/`analyst` импортируют все типы, `admin` — инфраструктурные, `viewer` не имеет доступа.
- Лимит Server Actions увеличен до 8 МБ при сохранении import-ограничений 5 МБ, 500 строк и 40 колонок.
- `tasks/SPRINT_11.md`, README и Evidence Import Schema синхронизированы с реализацией S11-T002.

### S11-T001 — Evidence Import Schema Specification

#### Добавлено

- `docs/architecture/Evidence_Import_Schema.md` — контракт CSV/XLSX импорта объектов и рисков: обязательные/опциональные колонки, source metadata, enum aliases, RBAC, validation preview, error report, duplicate/matching strategy, safe partial success, audit event contract и минимальные templates.

#### Изменено

- `tasks/SPRINT_11.md` отмечает S11-T001 как завершённую и добавляет колонку статуса задач Sprint 11.
- `DOCUMENTATION_INDEX.md`, `README.md` и `Evidence_First_Architecture.md` дополнены ссылкой на import schema specification.

---

## Sprint 10 — Reporting & Export

### Sprint Transition — Sprint 10 Closed, Sprint 11 Ready

#### Изменено

- Sprint 10 отмечен как завершённый в `tasks/SPRINT_10.md`, Roadmap и Documentation Index.
- На момент перехода после Sprint 10 Sprint 11 был переведён в статус готовности к старту как следующий этап Roadmap.
- `README.md` обновлён: текущий фокус теперь Sprint 11 Evidence Import & Data Onboarding.
- `ARCHITECTURE_DECISIONS.md`, `docs/architecture/User_Roles.md` и RBAC-документация синхронизированы с фактической MVP-моделью ролей.

### Manual Testing Follow-up — RBAC testing clarification

#### Изменено

- `docs/testing/RBAC_TESTING_GUIDE.md` теперь явно объясняет, что первый пользователь организации получает роль `owner`, а `admin` создаётся только через приглашение.
- RBAC-документация синхронизирована с фактическим MVP-flow: invite-ссылки создаёт `owner`, `admin` управляет не-owner пользователями и инфраструктурными объектами.
- Reporting smoke checklist и пользовательские guides уточняют, что тестовые роли должны находиться в одной организации и создаваться через invite-ссылки.

### S10-T008 — Reporting Smoke Test Checklist

#### Добавлено

- `docs/testing/REPORTING_SMOKE_TEST_CHECKLIST.md` — ручной smoke test модуль Sprint 10 Reporting & Export.

#### Изменено

- `DOCUMENTATION_INDEX.md` дополнен ссылкой на Sprint 10 Reporting manual smoke test.
- `tasks/SPRINT_10.md` отмечает S10-T008 как завершённую.

### S10-T007 — User Documentation

#### Добавлено

- `docs/user/REPORTS_AND_EXPORT_GUIDE.md` — пользовательское руководство по Trust Passport PDF, Risk Registry CSV и Executive Organization Report.

#### Изменено

- `USER_GUIDE.md`, `FAQ.md`, `OBJECT_MODEL_GUIDE.md` и `RISK_REGISTRY_GUIDE.md` дополнены сценариями отчётов и экспорта.
- `DOCUMENTATION_INDEX.md` и `README.md` синхронизированы с пользовательской документацией Sprint 10.
- `tasks/SPRINT_10.md` отмечает S10-T007 как завершённую.

### S10-T006 — Report Empty/Error States

#### Добавлено

- Report-specific `not-found` и `error` screens для `/reports/*`.
- `components/shared/reports/report-state.tsx` — общий UI-блок для empty/error состояний отчётов.
- Report layout для общего подключения print/report CSS в специальных состояниях маршрута.

#### Изменено

- Executive Report теперь явно показывает состояние пустой цифровой модели вместо пустых графиков и дефолтной факторной аналитики.
- Risk CSV endpoint возвращает безопасное сообщение об ошибке без внутренних деталей при сбое генерации.
- `tasks/SPRINT_10.md` отмечает S10-T006 как завершённую.

### S10-T005 — Report Access Control & Audit Events

#### Добавлено

- `lib/reports/access.ts` — единая RBAC-матрица отчётов согласно ADR-008.
- `lib/actions/reports.ts` — Server Action для audit-событий printable report export перед browser print/save as PDF.

#### Изменено

- Trust Passport, Risk CSV и Executive Report используют общий report access helper.
- Printable reports фиксируют `report.passport_exported` и `report.executive_exported` по кнопке сохранения PDF.
- `createSecurityEvent()` теперь ожидает попытку записи audit event и безопасно логирует ошибки без падения основного сценария.
- Audit Log отображает report-события человекочитаемыми названиями.
- `tasks/SPRINT_10.md` отмечает S10-T005 как завершённую.

### S10-T004 — Executive Organization Report

#### Добавлено

- `/reports/executive` — защищённая печатная версия executive organization report для CISO-сценария.
- `lib/reports/executive-report.ts` — server-side сбор управленческой сводки организации: Trust Score, KPI, distribution, factor averages, top risky objects, critical risks и source/evidence coverage.

#### Изменено

- Dashboard получил точку входа в executive report для ролей `owner` и `analyst`.
- Открытие executive report логируется audit event `report.executive_opened`.
- `tasks/SPRINT_10.md` отмечает S10-T004 как завершённую.

### S10-T003 — Risk Registry CSV Export

#### Добавлено

- `/api/reports/risks` — защищённый CSV export endpoint для Risk Registry.
- `lib/reports/csv.ts` — безопасная CSV-сериализация с UTF-8 BOM.
- `lib/reports/risk-csv.ts` — server-side сбор, фильтрация и mapping рисков для CSV.

#### Изменено

- Кнопка экспорта на странице Risk Registry теперь скачивает CSV с текущими фильтрами.
- Экспорт доступен только ролям `owner` и `analyst` согласно ADR-008.
- `tasks/SPRINT_10.md` отмечает S10-T003 как завершённую.

### S10-T002 — Trust Passport PDF Export

#### Добавлено

- `/reports/passport/[id]` — защищённая печатная версия Trust Passport для browser print/save as PDF.
- `lib/reports/passport-report.ts` — server-side assembler данных паспорта, используемый обычной страницей и report page.
- `app/report.css` — print-optimized стили для отчётов Sprint 10.
- `components/shared/reports/report-actions.tsx` — кнопки возврата и сохранения PDF.

#### Изменено

- Кнопка `PDF` на странице Trust Passport теперь открывает печатный отчёт.
- `lib/security/audit.ts` дополнен report/export event types для Sprint 10.
- `tasks/SPRINT_10.md` отмечает S10-T002 как завершённую.

### S10-T001 — Reporting Architecture Decision

#### Добавлено

- `docs/architecture/Reporting_Architecture.md` — архитектура отчётов Sprint 10: print-optimized HTML reports, CSV route handlers, RBAC, audit events и Evidence-first compatibility.
- ADR-008 в `ARCHITECTURE_DECISIONS.md` — решение не добавлять тяжёлые PDF/BI зависимости в S10-T001.

#### Изменено

- `tasks/SPRINT_10.md` отмечает S10-T001 как завершённую и фиксирует выбранный подход к PDF/CSV.
- `DOCUMENTATION_INDEX.md` и `System_Architecture.md` дополнены ссылками на Reporting Architecture.

---

## [v0.8.0] — 2026-06-30 (Sprint 08 — UX Refinement)

### Sprint 09 — Market MVP Packaging

#### Добавлено

- `docs/product/DEMO_NARRATIVE.md` — сценарий демонстрации DTEK Core для CISO и первых интервью (S09-T001).
- `docs/product/DEMO_DATASET_SPEC.md` — спецификация демонстрационной организации, объектов, рисков, ролей и связей для Market MVP demo (S09-T002).
- `docs/product/DEMO_SEED_PLAN.md` — безопасный план ручного наполнения demo organization через существующий UI без миграций и seed-скриптов (S09-T003).
- `docs/product/ICP_INTERVIEW_SCRIPT.md` — ICP, discovery-вопросы, expected signals и scoring rubric для интервью с CISO и ИБ-интеграторами (S09-T004).
- `docs/product/PRODUCT_ONE_PAGER.md` — one-pager DTEK Core для CISO с проблемой, решением, value proposition и 14-дневным pilot offer (S09-T005).
- `docs/product/COPY_ALIGNMENT.md` — перечень правок landing/README copy под Market MVP стратегию (S09-T006).
- `docs/product/PILOT_OFFER.md` — 14-дневный сценарий пилота для CISO с входными данными, планом, deliverables, success criteria и security boundary (S09-T007).
- `docs/product/SPRINT09_DOCUMENTATION_SYNC.md` — финальная синхронизация README, roadmap, documentation index и user docs после Sprint 09 (S09-T008).

#### Изменено

- **Landing/Product Copy Alignment** (S09-T006) — лендинг и README приведены к позиционированию Digital Trust & Cyber Risk Management без обещаний SIEM/EDR/CMDB/GRC или ранних интеграций.
- **Sprint 09 Documentation Sync** (S09-T008) — Sprint 09 отмечен как завершённый, Roadmap/README/User Guide синхронизированы со статусом Demo Ready + Interview Ready.

### Sprint 08 — UX Refinement & Platform Polish

#### Добавлено

- **Configurator presets** (S08-T004) — отраслевые профили весов Trust Score и новая иконка Конфигуратора.
- **Loading states** (S08-T007) — skeleton-экраны для основных защищённых маршрутов.
- **Users Role Info Card** (S08-T009) — карточка с описанием прав ролей на странице пользователей.
- **Invitation link UX** (S08-T003) — после создания приглашения UI показывает ссылку, email и роль; активное повторное приглашение возвращает существующую ссылку.

#### Изменено

- **Sidebar** (S08-T001) — раздел «Настройки» перемещён из группы «Управление» в footer-зону боковой панели, над блоком профиля пользователя. Соответствует дизайн-прототипу `design/src/shell.jsx`. Active-state и иконка сохранены.
- **Users table** (S08-T002) — устранено визуальное смещение колонок таблицы участников: разделены стили `.uth-c`/`.ut-c`; последняя колонка body теперь flex-контейнер полной ширины (ранее сужалась через `justify-self: end`); добавлен `min-width: 0` на все ячейки; text-overflow ellipsis для длинных имён и email; удалён дублирующий inline-style из `user-row.tsx`.
- **Audit Log** (S08-T005) — визуальная модернизация журнала аудита: категории событий, фильтры, иконки и отображение инициатора.
- **Dashboard** (S08-T006) — реструктурирован layout Центра управления.
- **Navigation affordance** — вся область названия вкладки стала функциональной ссылкой.
- **Settings profile controls** (S08-T008) — полировка кнопок и профиля.

### Strategic Consolidation — 2026-07-08

#### Добавлено

- `AI_DEVELOPMENT_GUIDE.md` — актуальный инженерный регламент для AI-разработки.
- `docs/product/PRODUCT_STRATEGY.md` — стратегическое позиционирование DTEK Core как Digital Trust & Cyber Risk Management Platform.
- `docs/roadmap/ROADMAP.md` — roadmap от Functional MVP к Market MVP.
- `docs/roadmap/SPRINT_ROADMAP.md` — единый план будущих спринтов без создания Sprint 09.
- `docs/architecture/TECHNICAL_DEBT.md` — реестр технического долга и архитектурных рисков.
- `tasks/SPRINT_09.md`–`tasks/SPRINT_15.md` — полный комплект Sprint-документов до коммерческого MVP и первого connector prototype.

#### Изменено

- `README.md`, `DOCUMENTATION_INDEX.md`, `Vision.md`, `Product_Concept.md`, `MVP_Scope.md`, `System_Architecture.md` приведены к новой стратегии и фактической архитектуре.
- `ARCHITECTURE_DECISIONS.md` дополнен ADR-006 о продуктовой границе Market MVP.
- `tasks/MVP_RELEASE_PLAN.md` дополнен Market MVP Foundation вместо узкого Post-MVP export-only этапа.
- `docs/security/SECURITY_OVERVIEW.md` исправляет описание роли `admin` в соответствии с ADR-003.

#### Удалено / Архивировано

- `docs/development/CONFIGURATOR_GUIDE.md` удалён как дубль пользовательского guide.
- `docs/product/SPRINT08_ANALYSIS.md` перенесён в `docs/archive/SPRINT08_ANALYSIS.md` как исторический pre-review анализ.

---

## [v0.7.0] — 2026-06-25

### Sprint 07 — QA & Platform Testing

#### Исправлено

- **Configurator UX** — кнопка «Сохранить» работала только с суммой = 100%, но не давала пользователю понять почему заблокирована
  - Добавлена жёлтая подсказка с конкретным советом: «Уменьшите веса ещё на N%» / «Добавьте ещё N%»
  - Добавлен `title` tooltip на disabled-кнопку
  - Реализован двухкликовый confirm при сбросе весов (per spec `Configurator_Concept_Final.md §6`)
  - Добавлен CSS-класс `btn-danger` для кнопки подтверждения сброса

- **Документация TC-CFG-RBAC01** — ошибочно указывало «Только owner изменяет веса»
  - Исправлено: `Configurator_Concept_Final.md §4.1` — Аналитик ИБ **тоже** может изменять веса

- **RBAC_TESTING_GUIDE.md** — матрица ошибочно указывала admin=✅ для создания/удаления связей в графе
  - Исправлено: `lib/actions/relations.ts` разрешает только `owner` и `analyst` (ADR-003 подтверждает)

#### Добавлено

- `docs/testing/TEST_PLAN_SPRINT_05_07.md` — 58 тест-кейсов по 12 функциональным блокам
- `docs/testing/MANUAL_TESTING_GUIDE_S07.md` — 20-шаговое руководство ручного тестирования
- `docs/testing/RBAC_TESTING_GUIDE.md` — методология RBAC-тестирования с 16 тест-кейсами
- `docs/development/CONFIGURATOR_GUIDE.md` — пользовательское руководство по Конфигуратору
- `tasks/SPRINT_07.md` — документация QA-спринта

---

## [v0.6.0] — 2026-06-23

### Sprint 06 — Security Hardening

#### Добавлено

- **Next.js 15 upgrade** (S06-T006) — обновление с 14.x до 15.x, исправлены breaking changes (params/searchParams как Promise<>)
- **Security Headers** (S06-T004) — CSP, X-Frame-Options, X-Content-Type-Options, Permissions-Policy, Referrer-Policy через `next.config.mjs`
- **Rate Limiting** (S06-T005) — IP-based: 10 req/60s для `/join`, 60 req/60s для `/api/*`, payload > 100 KB → 413
- **Zod Input Validation** (S06-T001) — `lib/validation/schemas.ts` покрывает все Server Actions
- **RLS Hardening** (S06-T001) — migration `016_rls_hardening.sql`: ужесточение политик для всех таблиц
- **RBAC Fixes** (S06-T003) — исправлены ошибки разграничения прав: admin не может менять роль owner
- **Security Audit Log** (S06-T007) — migration `017_security_events.sql`, `lib/security/audit.ts`, UI в `/settings` → «Журнал аудита»
- Зависимости: `zod@3.24` (v4 API), обновлены `@supabase/*`, устранены npm audit предупреждения

---

## [v0.5.0] — 2026-06-22

### Sprint 05 — Trust Score Engine, Dashboard, Trust Graph, Configurator

#### Добавлено

- **Trust Score Engine** (S05-T001, T002, T003) — `lib/trust/calculate.ts`, `lib/trust/engine.ts`
  - Формула ADR-001: `Σ(factor_score × weight) / 100`, 6 факторов
  - Массовый пересчёт при изменении рисков, критичности объекта, весов
  - Автоматическая запись в `trust_score_history`
- **Dashboard** (`/dashboard`, S05-T004) — Trust Ring организации, KPI-карточки, топ-5 рисковых объектов, лента событий, Realtime обновления
- **Trust Graph** (`/graph`, S05-T005, T006) — D3-based граф: узлы-объекты с цветом по уровню доверия, drag-n-drop, управление связями (6 типов), боковая панель с деталями узла
- **Конфигуратор** (`/configurator`, S05-T007) — редактор весов 6 факторов, слайдеры + числовые поля, сохранение с массовым пересчётом, сумма весов = 100%
- Server Actions: `recalculateTrustScores`, `saveFactorWeights`, `createRelation`, `deleteRelation`

---

## [v0.4.0] — 2026-06-21

### Sprint 04 — Testing, Bug Fixing & Stabilization

#### Исправлено

- **BUG-001** — Выравнивание колонок в таблице объектов
  - `.oth` (button): добавлен `padding: 0` — устраняет смещение от браузерного padding по умолчанию
  - `.otable-row`: добавлены `width: 100%` и `overflow: hidden` — строки всегда одинаковой ширины
  - `.ot-c`: исправлена правостороннее выравнивание через `display: flex; justify-content: flex-end`
  - `.ot-cell`: добавлены `min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis`

- **BUG-002** — Кнопка «Редактировать» в Risk Drawer
  - Добавлен проп `onEdit?: () => void` в `RiskDrawerProps`
  - Кнопка «Редактировать» отображается в footer drawer для owner/analyst
  - Открывает `RiskFormDialog` в режиме редактирования с предзаполненными данными

- **BUG-003** — Медленный UX после действий с рисками
  - `RiskFormDialog`: диалог закрывается до `router.refresh()` — реакция мгновенная
  - `RiskDrawer`: оптимистичное обновление статуса через `optimisticStatus` state

- **BUG-004** — React hydration mismatch в форматировании дат
  - Создан `lib/utils/dates.ts` с фиксированным массивом `MONTHS_SHORT`
  - Устраняет расхождение Node.js ICU («21 июл.») и браузера («21 июля»)
  - Функции `relativeTime()`, `formatSla()`, `fmtDateShort()` вынесены в единый модуль

- **BUG-005** — Краш страницы при ошибке смены статуса риска
  - `changeStatus()` обёрнута в `try/catch` внутри `startTransition`
  - При ошибке: откат `optimisticStatus`, сообщение в footer — без краша

- **BUG-006** — Risk Drawer не закрывался при открытии редактирования
  - `onEdit` теперь вызывает `setSelectedId(null)` и `setEditRisk()` в одном батче

#### Добавлено

- `docs/testing/TEST_STRATEGY.md` — стратегия тестирования
- `docs/testing/TEST_PLAN_SPRINT_01_03.md` — 27 тест-кейсов по 6 модулям
- `docs/testing/BUG_REPORT_TEMPLATE.md` — шаблон отчёта об ошибке
- `docs/testing/TEST_REPORT_SPRINT_01_03.md` — результаты quality gate
- `docs/testing/MANUAL_TESTING_GUIDE.md` — руководство ручного тестирования (20 шагов)
- `tasks/SPRINT_04.md` — документация Sprint 04
- `CHANGELOG.md` — этот файл

---

## [v0.3.0] — 2026-06-20

### Sprint 03 — Digital Asset Management & Trust Risk Registry

#### Добавлено

- **Список объектов** (`/objects`) — таблица и карточки с сортировкой, фильтрацией, поиском
- **Детали объекта** (`/objects/[id]`) — 4 вкладки: факторы Trust Score, риски, связи, история
- **Trust Passport** (`/objects/[id]/passport`) — цифровой паспорт с 6-факторной разбивкой
- **Реестр рисков** (`/risks`) — таблица рисков с фильтрацией по статусу, серьёзности, категории
- **Risk Drawer** — боковая панель с деталями риска, CVSS-оценкой, привязкой к объекту
- **RiskFormDialog** — создание и редактирование рисков (CRUD)
- Shared компоненты: `TrustRing`, `SeverityTag`, `CritTag`, `TrustChip`, `Meter`, `FilterSelect`, `SortCaret`, `Icon`
- Server Actions: `createObject`, `updateObject`, `deleteObject`, `createRisk`, `updateRisk`, `deleteRisk`, `updateRiskStatus`, `linkRiskToObject`

#### Исправлено

- `app/landing.css`: `var(--border)` → `var(--border-subtle)` (4 вхождения) — устраняет невидимые границы

---

## [v0.2.0] — 2026-06-15

### Sprint 02 — Organization Management & Platform Setup

#### Добавлено

- **Лендинг** (`/`) — hero-секция с анимацией Trust Graph, ключевые блоки
- **Управление пользователями** (`/users`) — таблица участников, смена ролей
- **Настройки организации** (`/settings`) — профиль пользователя, настройки организации
- **Онбординг wizard** (`/onboarding/wizard`) — 5-шаговый мастер создания организации
- **Создание организации** (`/onboarding/create`) — форма регистрации первой организации
- **Приглашения** (`/invite/[token]`) — отправка приглашений, принятие по токену, отзыв
- Middleware — защита маршрутов, редирект при отсутствии организации
- 4 роли: `owner`, `analyst`, `admin`, `viewer`

---

## [v0.1.0] — 2026-06-13

### Sprint 01 — Foundation & Authentication

#### Добавлено

- **Аутентификация** — регистрация, вход, выход, сброс пароля
- **Supabase** — настройка Cloud проекта (EU West), 14 миграций БД
- **CI/CD** — GitHub Actions (lint → type-check → build), Vercel деплой
- **App Shell** — layout с навигацией, тёмная тема, CSS-переменные, шрифты
- **TypeScript strict** — конфигурация, псевдоним `@/`, типы БД
- **Базовые страницы**: `/login`, `/register`, `/forgot-password`, `/reset-password`

---

[v0.7.0]: https://github.com/DTEK-Core/DTEK-core/compare/v0.6.0...develop
[v0.6.0]: https://github.com/DTEK-Core/DTEK-core/compare/v0.5.0...v0.6.0
[v0.5.0]: https://github.com/DTEK-Core/DTEK-core/compare/v0.4.0...v0.5.0
[v0.4.0]: https://github.com/DTEK-Core/DTEK-core/compare/v0.3.0...v0.4.0
[v0.3.0]: https://github.com/DTEK-Core/DTEK-core/compare/v0.2.0...v0.3.0
[v0.2.0]: https://github.com/DTEK-Core/DTEK-core/compare/v0.1.0...v0.2.0
[v0.1.0]: https://github.com/DTEK-Core/DTEK-core/releases/tag/v0.1.0
