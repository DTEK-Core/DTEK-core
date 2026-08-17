# DESIGN SPRINT 04 — Stable Sidebar Layout

`Статус: IMPLEMENTED / MANUAL AUTHENTICATED QA PENDING`  
`Дата создания: 17.08.2026`  
`Область: App Shell layout и независимый scroll`

---

## 1. Название

Стабильная viewport-высота desktop sidebar.

## 2. Цель

Отделить высоту sidebar от высоты страницы: sidebar всегда занимает один
viewport, main content прокручивается независимо, а navigation сохраняет
собственный внутренний scroll при нехватке высоты.

## 3. Причина

При переходе между длинными и короткими страницами sidebar визуально менял
высоту, потому что общий grid вычислял её из page content.

## 4. Current State

- App Shell: `.app` grid с колонками sidebar/main.
- `.app` использовал `height: 100%`.
- `html` имел `height: 100%`, но `body` — только `min-height: 100%`.
- Из-за разорванной percentage-height цепочки `.app` получал content-driven
  auto height; sidebar как grid item растягивался вместе с main content.
- `.app-scroll` уже имел `overflow-y: auto`, но без ограниченной высоты grid его
  scroll container не получал стабильной области.
- `.sidebar-nav` уже имеет `flex: 1`, `min-height: 0` и `overflow-y: auto`.

## 5. Requested Changes

- Не менять визуальный дизайн и содержимое sidebar.
- Зафиксировать App Shell относительно viewport.
- Разделить main/sidebar scrolling.
- Исключить content-driven height, horizontal overflow и двойной scrollbar.
- Сохранить navigation, active state, profile/logout, RBAC и responsive.

## 6. UX Analysis

App Shell должен быть единым viewport-контейнером. Sidebar занимает всю его
высоту и не участвует в scroll страницы. Main scroll area получает остаток
ширины и высоты. Если navigation станет выше доступного пространства, только
`.sidebar-nav` прокручивается между brand/org и footer.

## 7. Functional Safety

JSX, маршруты, navigation items, pathname active detection, logout Server
Action, organization context и permissions не изменяются. Print stylesheet
по-прежнему отключает sidebar и переводит App Shell в обычный document flow.

## 8. Components Affected

- Общий `.app` grid.
- `.app-main` и `.app-scroll` sizing contract.
- `.sidebar` viewport containment.

## 9. Files Affected

- `app/globals.css`.
- `app/report.css` (print-only viewport reset).
- `tasks/disign/DESIGN_SPRINT_04_STABLE_SIDEBAR_LAYOUT.md` (создан).
- `CHANGELOG.md`.

## 10. Design Materials

Визуальные материалы не требуются: владелец явно подтвердил текущий дизайн.
Изменяется только layout behavior.

## 11. Tasks

- [x] Проследить percentage-height chain от Root Layout до sidebar.
- [x] Найти content-driven grid height.
- [x] Ограничить App Shell через `100dvh`.
- [x] Защитить grid/main от min-content overflow.
- [x] Сохранить самостоятельный main/sidebar-nav scroll.
- [x] Проверить print override и source-level responsive contracts.
- [x] Выполнить project quality gates.
- [ ] Выполнить authenticated manual navigation/resize QA.

## 12. Acceptance Criteria

- Sidebar не меняет высоту и ширину между страницами.
- Длинный page content прокручивается внутри main.
- Короткий page content не уменьшает App Shell.
- Sidebar navigation получает внутренний scroll только при необходимости.
- Нет document-level двойного или горизонтального scrollbar.
- Collapse width contract, visual styles и page content не меняются.
- Print layout остаётся обычным flowing document без sidebar.

## 13. Regression Checklist

- [ ] Dashboard → Graph → Objects → Risks → Trust Passport → Dashboard.
- [ ] Очень длинная и короткая страницы.
- [ ] Таблица и большой Trust Graph.
- [ ] Resize: large desktop, desktop, notebook, tablet, mobile.
- [ ] Main scroll and sidebar navigation scroll.
- [ ] Navigation active state, settings/profile and logout.
- [ ] Horizontal overflow and overlapping content.
- [x] Print CSS overrides fixed viewport sizing.
- [x] Static App Shell sizing/overflow contract.

Authenticated browser-control недоступен в текущей сессии. Невыполненные
визуальные пункты не отмечаются как PASS до фактического ручного прогона.

## 14. Status

`IMPLEMENTED / MANUAL AUTHENTICATED QA PENDING`

Владелец прямо запросил реализацию 17.08.2026. Изменение ограничено общим CSS
layout contract; дизайн sidebar и содержимое страниц не изменялись.
