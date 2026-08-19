# Mini Design Improvements — DTEK Core

`Статус журнала: ACTIVE`  
`Создан: 18.08.2026`  
`Следующий ID: MD-011`

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

## MD-007 — Homepage Hero Heading Controlled Two Lines

`Статус: DONE / MANUAL VISUAL QA PENDING`

`Дата: 18.08.2026`

`Commit: этот MD-раздел и реализация хранятся в одном task commit`

`Baseline: f33838ca2ab006ee8a4ca9ccc8910c913817d0c6`

### Проблема

Однострочный heading MD-006 использовал независимую ширину до 940/760 px и
начал визуально пересекаться с правой Trust Graph animation.

### Требовалось

Вернуть осознанную desktop-композицию «Цифровое доверие» / «и киберриски
активов», сохранив крупный стиль, плотный ритм и естественный responsive без
изменения текста, hero grid или графа.

### Выполнено

- Заголовок разделён на два контролируемых block-span по заданным смысловым строкам.
- Удалены wide-title width, elevated z-index и desktop/notebook `nowrap` MD-006.
- Основной кегль снова использует текущий диапазон до 58 px; второй ряд —
  `0.84em`, `line-height: 1.08`, с умеренно плотным letter-spacing.
- Notebook сохраняет адаптивный cap 50 px; mobile использует второй ряд `0.82em`
  и разрешает естественный внутренний перенос при нехватке ширины.

### Затронуто

`components/shared/landing/landing-page.tsx`, `app/landing.css`, этот журнал и
`CHANGELOG.md`.

### Functional safety

`HeroTrustGraph`, canvas, animation timing, hero grid, visual size/position,
CTA, lead, links, остальные sections и функциональность не изменены.

### Проверка и rollback

Целевые точки: 1920, 1440, 1280, notebook, tablet и mobile. Автоматические
quality gates выполняются перед commit; visual browser QA остаётся pending,
если browser-control недоступен. **«Вернись назад»** отменяет только commit
MD-007 и возвращает однострочный baseline `f33838c…`.

---

## MD-008 — Homepage Hero Heading Balanced Wrap

`Статус: DONE / MANUAL VISUAL QA PENDING`

`Дата: 18.08.2026`

`Commit: этот MD-раздел и реализация хранятся в одном task commit`

`Baseline: 7936302370848b97a1f2016d15406728ecb30b37`

### Проблема

Предыдущие варианты либо расширяли заголовок в область Trust Graph, либо
навязывали одинаковый фиксированный перенос на всех desktop-разрешениях и
выглядели зажато относительно фактической ширины левой hero-колонки.

### Требовалось

Собрать текст, CTA и существующий Trust Graph в сбалансированную композицию,
самостоятельно выбрав responsive typography и переносы, но не меняя текст,
граф, hero grid или остальные элементы страницы.

### Выполнено

- Заголовок возвращён в единый семантический текстовый поток без ручных `<br>`
  и отдельных строк с разным кеглем.
- `text-wrap: balance` распределяет слова по 2–3 визуально сопоставимым строкам
  в зависимости от доступной ширины; fallback сохраняет обычный перенос.
- Ширина ограничена `100%` существующей copy-column, поэтому текст не выходит в
  правую область графа; `nowrap`, отрицательные offsets и overlay не используются.
- Desktop использует выразительный диапазон 42–56 px с плотным `line-height:
  1.01`; notebook — 40–48 px / 1.02; mobile — 36–46 px / 1.06.

### Затронуто

`components/shared/landing/landing-page.tsx`, `app/landing.css`, этот журнал и
`CHANGELOG.md`.

### Functional safety

`HeroTrustGraph`, canvas, animation timing, размеры и позиционирование графа,
hero grid, CTA, lead, links, остальные sections и функциональность не изменены.

### Проверка и rollback

Целевые точки: 1920, 1440, 1280, notebook, tablet и mobile. Автоматические
quality gates выполняются перед commit; visual browser QA остаётся pending,
если browser-control недоступен. **«Вернись назад»** отменяет только commit
MD-008 и возвращает baseline `7936302…`.

---

## MD-009 — Trust Intelligence Model Section

`Статус: DONE / MANUAL VISUAL QA PENDING`

`Дата: 18.08.2026`

`Commit: этот MD-раздел и реализация хранятся в одном task commit`

`Baseline: f5462d688c0f59edafa399c8f5198a07ec17565b`

### Проблема

Блок «Четыре опоры платформы» представлял возможности четырьмя одинаковыми
карточками с номерами 01–04. Такая подача не объясняла связь механизмов и
выглядела как типовой features-блок SaaS landing page.

### Требовалось

Переосмыслить только эту секцию как самостоятельное продуктовое объяснение
Trust Intelligence системы, сохранив Passport, Trust Score, Trust Graph и
Configurator, текущую дизайн-систему и всю функциональность.

### Выполнено

- Вместо четырёх равных карточек создан связный контур Passport → Trust Score →
  Trust Graph с различимыми ролями: контекст объекта, объяснимое состояние и
  контекст зависимостей.
- Configurator вынесен в отдельный управляющий слой под контуром, показывающий,
  что веса модели влияют на систему, а не являются четвёртой независимой функцией.
- Заголовок заменён на «Доверие — это связанная система, а не отдельная метрика»;
  вводный текст объясняет переход от объекта к распространению риска.
- Номера 01–04 удалены; добавлены сдержанные signal-flow, hover emphasis и
  статичный пример Trust Score без изменения реальной расчётной логики.
- Desktop использует горизонтальную архитектурную композицию; tablet/mobile
  превращают её в последовательный вертикальный поток, а control layer остаётся
  визуально отделённым.

### Затронуто

`components/shared/landing/landing-page.tsx`, `app/landing.css`, этот журнал и
`CHANGELOG.md`.

### Functional safety

Hero, heading MD-008, `HeroTrustGraph`, stats, CTA, routes, Passport/Score/Graph/
Configurator logic, backend, Supabase, RLS/RBAC и данные не изменены. Исходный
features-блок не содержал ссылок, поэтому navigation contract отсутствовал.

### Проверка и rollback

Целевые точки: 1920, 1440, 1280, notebook, tablet и mobile. Анимация signal-flow
должна отключаться текущим reduced-motion режимом секции. Автоматические quality
gates выполняются перед commit; visual browser QA остаётся pending, если
browser-control недоступен. **«Вернись назад»** отменяет только commit MD-009 и
возвращает baseline `f5462d6…`.

---

## MD-010 — Compact Sidebar User Menu

`Статус: DONE / MANUAL AUTHENTICATED QA PENDING`

`Дата: 19.08.2026`

`Commit: этот MD-раздел и реализация хранятся в одном task commit`

`Baseline: 888cb9be75c44d59b0340a5bff3a35c9693e532f`

### Проблема

В нижней части sidebar одновременно отображались Settings, постоянный блок с
именем/e-mail и отдельная строка logout. Три равноправных элемента перегружали
footer-зону и смешивали navigation с account actions.

### Требовалось

Сделать пользовательскую область компактнее и логичнее, сохранив Settings,
данные профиля, logout Server Action, keyboard accessibility и стабильную
viewport-архитектуру sidebar.

### Выполнено

- Settings остаётся отдельным navigation item над account control с прежним
  `/settings`, active-state, hover и focus-visible.
- Постоянные имя и e-mail заменены круглым avatar-trigger с инициалами; если
  имя и e-mail отсутствуют, используется нейтральная иконка пользователя.
- Существующий Radix/Shadcn `DropdownMenu` показывает имя и полный e-mail только
  по запросу; длинные значения сокращаются визуально и доступны через title.
- Logout перенесён в account menu и вызывает неизменённый Server Action
  `logout`; отдельная третья строка из sidebar удалена.
- Dropdown наследует Radix-поведение: keyboard navigation, Escape, focus
  management и закрытие по клику вне меню.

### Затронуто

`components/shared/shell/app-sidebar.tsx`, `app/globals.css`, этот журнал и
`CHANGELOG.md`.

### Functional safety

Ширина, `100dvh`, overflow chain, sidebar navigation, верхняя/основная части,
organization context, routes, auth, RBAC/RLS и mobile architecture не изменены.
Новые зависимости и дублирующие UI-компоненты не добавлялись.

### Проверка и rollback

Автоматические quality gates выполняются перед commit. Authenticated ручная
проверка menu open/close, outside click, Escape, keyboard logout, длинного e-mail
и desktop/mobile остаётся обязательной приёмкой. **«Вернись назад»** отменяет
только commit MD-010 и возвращает baseline `888cb9b…`.

---

## Правило продолжения

### Контрольная стабилизация — 19.08.2026

- Публичные CTA и template download contracts повторно проверены локально.
- Исправлены неинтерактивные пункты landing navigation: три ведут к реальным
  секциям страницы, документация — к актуальной папке `docs` ветки `develop`.
- Для viewport до 520 px шапка использует compact layout без конкуренции бренда
  с двумя CTA: вход остаётся в шапке, а запрос пилота — в hero.
- Visual/authenticated QA MD-001–004 и MD-010 остаётся `PENDING` и не отмечается
  как пройденная без реального browser-прогона соответствующих сценариев.

---

Следующая небольшая UI/UX-задача добавляется сюда как `MD-011`, затем `MD-012`
и далее. Новый отдельный Design Sprint-файл для mini changes не создаётся.
Отдельный Sprint нужен только для крупного redesign страницы/модуля, новой
Design System, navigation architecture или существенного нового UX-flow.
