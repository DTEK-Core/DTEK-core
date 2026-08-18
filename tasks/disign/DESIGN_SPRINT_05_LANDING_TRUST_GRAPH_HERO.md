# DESIGN SPRINT 05 — Landing Trust Graph Hero

`Статус: IMPLEMENTED / MANUAL VISUAL QA PENDING`  
`Дата создания: 18.08.2026`  
`Область: публичная главная страница и существующая Hero Trust Graph animation`

---

## 1. Название

Крупная и органично интегрированная Trust Graph animation в hero главной страницы.

## 2. Цель

Сохранить существующий сценарий и характер Trust Graph, но сделать его одним из
главных визуальных элементов hero, а не небольшой обособленной иллюстрацией.

## 3. Причина

В исходной двухколоночной композиции текст и граф делили ширину почти поровну,
canvas был ограничен высотой 560 px, а при ширине viewport до 980 px полностью
скрывался. Trust Graph воспринимался как второстепенный декоративный элемент.

## 4. Current State

- Hero: grid `1.02fr / .98fr`, gap 32 px, max-width 1320 px.
- Visual: `height: min(560px, 58vw)`.
- При `max-width: 980px` `.lp-hero-visual` использовал `display: none`.
- Canvas уже адаптировался через `ResizeObserver` и ограничивал DPR до 2.
- Модель: 15 узлов, 22 связи, центральный индекс, ambient pulses, периодический
  risk propagation scenario и pointer parallax.

## 5. Requested Changes

- Увеличить роль, ширину и высоту существующего графа.
- Сформировать единую hero-композицию без отдельной большой card shell.
- Масштабировать визуальные детали canvas, а не только его CSS-box.
- Сохранить тексты, CTA, навигацию, данные и логику animation.
- Показывать корректную адаптацию на desktop, notebook, tablet и mobile.
- Не увеличивать количество анимируемых объектов.

## 6. UX Analysis

На desktop граф получает большую долю grid и высоту до 680 px. Мягкое
неограниченное glow-field связывает текст и animation, поэтому граф остаётся
частью общего background language, а не карточкой. На tablet hero становится
вертикальным и граф располагается под текстом. На mobile canvas и overlay cards
уменьшаются пропорционально без horizontal overflow.

## 7. Functional Safety

Не изменяются маршруты, тексты, CTA href, Server Actions, auth, RBAC, данные,
Trust Graph продукта или business logic. Hero canvas сохраняет прежние nodes,
edges, risk path, periods, timing и React lifecycle. Число draw operations не
увеличивается; DPR по-прежнему capped at 2.

## 8. Components Affected

- Landing hero grid and visual field.
- `HeroTrustGraph` canvas rendering scale.
- Hero overlay cards/status responsive typography.
- Reduced-motion hero presentation.

## 9. Files Affected

- `app/landing.css`.
- `components/shared/landing/hero-trust-graph.tsx`.
- `tasks/disign/DESIGN_SPRINT_05_LANDING_TRUST_GRAPH_HERO.md` (создан).
- `CHANGELOG.md`.

## 10. Design Materials

- Текущий production hero и `design/screens/landing-final.png`.
- Пожелание владельца от 18.08.2026: сохранить animation, увеличить её масштаб
  и превратить text + Trust Graph в единую композицию.

## 11. Tasks

- [x] Зафиксировать clean baseline и текущий Git HEAD.
- [x] Проанализировать hero layout, canvas sizing, animation и breakpoints.
- [x] Перераспределить desktop grid в пользу Trust Graph.
- [x] Добавить единое background depth field без card container.
- [x] Масштабировать nodes, edges, pulses и core gauge от canvas dimensions.
- [x] Вернуть Trust Graph на tablet/mobile в адаптивном виде.
- [x] Сохранить object count, timing и DPR performance limits.
- [x] Добавить статичное понятное reduced-motion состояние.
- [ ] Выполнить visual QA в браузере на целевых viewport.
- [ ] Получить подтверждение владельца результата.

## 12. Acceptance Criteria

- Trust Graph заметно крупнее и визуально равноправен hero copy.
- Граф не выглядит как отдельно вставленная карточка.
- Nodes/edges/risk scenario остаются узнаваемыми и функционально прежними.
- Tablet/mobile показывают граф без clipping и horizontal scroll.
- CTA, тексты и следующие sections не изменены.
- Число nodes/edges и animation loops не увеличено.
- Reduced motion остаётся полностью читаемым без сложного движения.

## 13. Regression Checklist

- [ ] Large desktop ≥ 1440 px.
- [ ] Desktop 1280 px.
- [ ] Notebook 1024–1180 px.
- [ ] Tablet 768–980 px.
- [ ] Mobile 320–640 px.
- [ ] CTA readability and wrapping.
- [ ] Overlay cards during normal/risk states.
- [ ] No clipping, overlap or horizontal scroll.
- [ ] ResizeObserver canvas resize and DPR rendering.
- [ ] Reduced motion.
- [ ] FPS/responsiveness during ambient and risk phases.

Встроенный browser-control недоступен в текущей сессии. Автоматические quality
gates не заменяют визуальную проверку, поэтому эти пункты остаются pending.

## 14. Status

`IMPLEMENTED / MANUAL VISUAL QA PENDING`

### Rollback baseline

- Pre-task Git HEAD: `ed00254003a0029040c37552a8f6313bfbcdadb2`.
- Worktree перед задачей: clean.
- Изменения задачи изолируются в одном отдельном commit.
- Команда владельца **«Вернись назад»** означает revert только commit этого
  Design Sprint; предыдущие Button, Download и Stable Sidebar commits остаются.
- Baseline сохраняется в этом документе до подтверждения результата владельцем.
