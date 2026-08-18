# Mini Design Improvements — DTEK Core

`Статус журнала: ACTIVE`  
`Создан: 18.08.2026`  
`Следующий ID: MD-007`

Единый журнал небольших UI/UX-изменений. Каждая запись имеет собственный
baseline и отдельный commit, поэтому последнюю задачу можно отменить без отката
предыдущих улучшений. Крупные redesign и новые UX-flow продолжают оформляться
отдельными Design Sprint.

---

## MD-001 — Global Button Style

`Статус: DONE / MANUAL VISUAL QA PENDING`  
`Дата: 17.08.2026`  
`Commit: b7d3b72ade4f499ccee6c144ddb11ddb6ff30a44`  
`Baseline: eeaf1dc8de3185c3e076d11986c8576d14e0ea72`

### Проблема

Action-кнопки сохраняли правильные variants, но не имели единого medium-size и
согласованной hover/active реакции; form actions выглядели сжато.

### Требовалось

Адаптировать pill radius, lift, shadow, pressed feedback и fading halo из
референса, не меняя цвета, тип элемента, handlers, navigation или business logic.

### Выполнено

- Унифицированы `.btn`, `.btn-primary`, `.btn-line`, `.btn-ghost`, `.btn-danger`.
- Сохранены `sm/md/lg`, icon-only и destructive semantics.
- Shadcn `Button` синхронизирован с общей системой.
- Disabled/loading не анимируются; добавлен `prefers-reduced-motion`.
- Navigation/selection controls намеренно исключены из action-button эффекта.

### Затронуто

`app/globals.css`, `app/landing.css`, `components/ui/button.tsx`, `CHANGELOG.md`.

### Проверка и замечания

Type-check, lint, build и существующие contract tests — PASS. Authenticated
визуальная проверка Dashboard, Objects/Risks, Settings, dialogs, reports,
onboarding и mobile остаётся pending.

---

## MD-002 — Animated Download & Export Button

`Статус: DONE / MANUAL AUTHENTICATED QA PENDING`  
`Дата: 17.08.2026`  
`Commit: 0889f669b1ebc61725727db79986d7ec71909784`  
`Baseline: b7d3b72ade4f499ccee6c144ddb11ddb6ff30a44`

### Проблема

Реальные download/export actions не имели общего feedback и не показывали
фактический lifecycle формирования или получения файла.

### Требовалось

Единый shared component со состояниями idle/loading/success/error/disabled,
indeterminate loading без фальшивых процентов, защитой от повторного клика,
toast error, resource cleanup и reduced motion.

### Выполнено

- Создан `DownloadButton` с animated arrow, right success area и checkmark.
- Loading связан с настоящим `fetch().blob()` либо завершением callback.
- Сохранены filenames, Blob download и `URL.revokeObjectURL` cleanup.
- Интегрированы Risk CSV, import templates, validation CSV и printable reports.
- Route handlers, formats, filters, audit, RBAC/RLS и multi-tenancy не менялись.
- Disabled Objects export и navigation links не маскировались под download.

### Затронуто

`components/shared/download-button.tsx`, Risk Registry, Data Import Dialog,
report actions, `app/globals.css`, `CHANGELOG.md`.

### Проверка и замечания

Type-check, lint, build и 45 contract tests — PASS. Реальные authenticated
CSV/PDF downloads, error/retry, repeated click, keyboard и mobile — pending.
XLSX export отсутствует; XLSX остаётся только входным import format.

---

## MD-003 — Stable Sidebar Layout

`Статус: DONE / MANUAL AUTHENTICATED QA PENDING`  
`Дата: 17.08.2026`  
`Commit: ed00254003a0029040c37552a8f6313bfbcdadb2`  
`Baseline: 0889f669b1ebc61725727db79986d7ec71909784`

### Проблема

`.app { height: 100% }` опирался на `body` только с `min-height`, поэтому grid
получал content-driven height и sidebar растягивался/уменьшался вместе со страницей.

### Требовалось

Стабильный viewport sidebar, независимый main scroll и внутренний navigation
scroll без изменения дизайна, JSX, navigation, RBAC или page content.

### Выполнено

- App Shell ограничен `height: 100dvh` и `overflow: hidden`.
- Grid использует `minmax(0, 1fr)`; main scroll chain получил `min-height: 0`.
- Sidebar занимает shell, а `.sidebar-nav` прокручивается только при нехватке места.
- Print CSS снимает viewport containment для многостраничных PDF.

### Затронуто

`app/globals.css`, `app/report.css`, `CHANGELOG.md`.

### Проверка и замечания

Type-check, lint, build и 45 tests — PASS. Authenticated переходы Dashboard →
Graph → Objects → Risks → Trust Passport, resize и реальный scroll — pending.

---

## MD-004 — Homepage Trust Graph Hero

`Статус: DONE / MANUAL VISUAL QA PENDING`  
`Дата: 18.08.2026`  
`Commit: 57a6e8103126d21f5f5d69a7de413c535c1f7356`  
`Baseline: ed00254003a0029040c37552a8f6313bfbcdadb2`

### Проблема

Hero Trust Graph занимал небольшую правую область до 560 px и полностью
скрывался при viewport до 980 px, поэтому выглядел второстепенной иллюстрацией.

### Требовалось

Сохранить модель и сценарий animation, увеличить её роль, объединить с hero и
адаптировать desktop/tablet/mobile без простого CSS stretching.

### Выполнено

- Graph получил большую долю grid, высоту до 680 px и общее depth/glow field.
- Canvas масштабирует nodes, edges, pulses и core gauge от своих dimensions.
- Tablet/mobile показывают вертикальную композицию и компактные overlay cards.
- Сохранены 15 nodes, 22 edges, pointer parallax, ambient pulses, risk path,
  `RISK_PERIOD 12.5`, `RISK_DUR 5.4`, один RAF loop и DPR cap 2.
- Reduced motion отображает статичную понятную композицию.

### Затронуто

`app/landing.css`, `components/shared/landing/hero-trust-graph.tsx`, `CHANGELOG.md`.

### Проверка и замечания

Type-check, lint, build и 45 tests — PASS. Визуальная проверка целевых viewport,
overlay risk state, horizontal overflow и FPS остаётся pending.

---

## MD-005 — Homepage Hero Heading Composition

`Статус: DONE / MANUAL VISUAL QA PENDING`

`Дата: 18.08.2026`

`Commit: этот MD-раздел и реализация хранятся в одном task commit`

`Baseline: 05835a1530a222544c2da480567f507895d55aed`

### Проблема

Жёсткое разбиение заголовка на три строки — «Цифровое доверие» / «и киберриски» /
«активов» — дробило смысл и визуально ломало баланс hero.

### Требовалось

Сохранить исходный текст, Trust Graph, CTA и grid; улучшить только controlled
line break, typography и responsive перенос без overflow или layout shift.

### Выполнено

- Desktop-композиция объединена в две смысловые строки: «Цифровое доверие» /
  «и киберриски активов».
- Второй ряд получил умеренно меньший кегль и отдельный line-height, создавая
  ясную иерархию без уменьшения Trust Graph.
- На notebook типографика адаптируется к узкой текстовой колонке.
- На mobile второй смысловой ряд может естественно перенестись внутри строки;
  жёсткий третий line break не навязывается.

### Затронуто

`components/shared/landing/landing-page.tsx`, `app/landing.css`, этот журнал и
`CHANGELOG.md`.

### Functional safety

Текст, CTA href, animation component, canvas logic, hero grid, остальные
sections, navigation, backend, RBAC/RLS и данные не изменены.

### Проверка и rollback

Type-check/lint/build и contract tests выполняются перед финализацией. Manual
visual QA на desktop/notebook/tablet/mobile остаётся pending при недоступном
browser-control. Команда **«Вернись назад»** должна revert только task commit
MD-005; общий журнал и MD-001–004 остаются благодаря baseline `05835a1…`.

---

## MD-006 — Homepage Hero Heading Single Line

`Статус: DONE / MANUAL VISUAL QA PENDING`

`Дата: 18.08.2026`

`Commit: этот MD-раздел и реализация хранятся в одном task commit`

`Baseline: a50cbd3793a73e0f0c6ed4761faa252fb418e652`

### Проблема

После MD-005 заголовок всё ещё имел два принудительных `.lp-line`. Левая hero
колонка шириной около 480–530 px и `max-width: 620px` не позволяли полной фразе
поместиться крупным кеглем без controlled break.

### Требовалось

На desktop и notebook показывать неизменённый текст одной строкой, сначала
используя доступную горизонтальную область и лишь умеренно адаптируя typography.
Tablet/mobile должны сохранять естественный перенос без overflow.

### Выполнено

- Два принудительных смысловых ряда заменены единым текстовым потоком `<h1>`.
- Заголовок получил независимую от узкой copy-column ширину до 940 px на
  desktop и до 760 px на notebook, не меняя hero grid columns.
- Desktop typography ограничена выразительным диапазоном 41–46 px, notebook —
  34–40 px; `nowrap` действует только при viewport от 981 px.
- Tablet/mobile используют прежний естественный перенос и ограничения ширины.

### Затронуто

`components/shared/landing/landing-page.tsx`, `app/landing.css`, этот журнал и
`CHANGELOG.md`.

### Functional safety

Trust Graph component, canvas, animation timing, hero grid, CTA, lead, links,
остальные sections и функциональность не изменены.

### Проверка и rollback

Целевые точки: 1920, 1440, 1280, notebook, tablet и mobile. Автоматические
quality gates выполняются перед commit; visual browser QA остаётся pending,
если browser-control недоступен. **«Вернись назад»** отменяет только commit
MD-006 и возвращает baseline `a50cbd3…`.

---

## Правило продолжения

Следующая небольшая UI/UX-задача добавляется сюда как `MD-007`, затем `MD-008`
и далее. Новый отдельный Design Sprint-файл для mini changes не создаётся.
Отдельный Sprint нужен только для крупного redesign страницы/модуля, новой
Design System, navigation architecture или существенного нового UX-flow.
