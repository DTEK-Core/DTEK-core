# DESIGN SPRINT 02 — Global Button System

`Статус: IMPLEMENTED / MANUAL VISUAL QA PENDING`  
`Дата создания: 17.08.2026`  
`Область: глобальные action-кнопки DTEK Core`

---

## 1. Название

Системное обновление визуального поведения обычных кнопок DTEK Core.

## 2. Цель

Сохранить текущую цветовую систему и размеры variants, добавив единый
профессиональный характер: сильное скругление, лёгкий hover lift, тень, pressed
feedback и умеренный расходящийся `::after`-эффект.

## 3. Причина

Текущие action-кнопки используют согласованные цвета, но визуальная реакция и
размер по умолчанию неполны: `.btn` не задаёт medium spacing, hover ограничен
primary variant, а pressed/reduced-motion состояния не унифицированы.

## 4. Current State

- Основная система action-кнопок реализована классами `.btn`, `.btn-primary`,
  `.btn-line`, `.btn-ghost`, `.btn-danger` в `app/globals.css`.
- Размеры: `.btn-sm`, `.btn-md`, `.btn-lg`; часть form actions использует
  `.btn` без size modifier.
- `components/ui/button.tsx` содержит Shadcn/CVA variants и используется через
  Alert Dialog.
- Icon-only actions используют `.icon-btn`.
- Sidebar/navigation, Settings tabs, segmented controls, filter-select,
  configurator presets и chart ranges являются отдельными control patterns.

## 5. Requested Changes

- Адаптировать предоставленный CSS-референс, не копируя absolute positioning,
  uppercase, ссылочную семантику или чрезмерный scale.
- Сохранить цвета variants, размеры, иконки, disabled/loading/focus states,
  обработчики, ссылки и навигацию.
- Применить системно через существующий Button/design system.
- Добавить `prefers-reduced-motion`.
- Особо защитить compact, icon-only, navigation и destructive controls.

## 6. UX Analysis

Hover должен сообщать интерактивность без «прыжка» интерфейса: action-кнопка
поднимается на 2 px, pressed возвращается ближе к исходной позиции. Halo
масштабируется умеренно и исчезает, не перекрывая контент. Compact controls
получают меньшую амплитуду, icon-only — без большого halo.

## 7. Functional Safety

Не изменяются JSX-структура страниц, тип элементов, href, обработчики, Server
Actions, validation, RBAC/RLS, pending labels и disabled attributes.
`pointer-events`, keyboard focus и link/button semantics сохраняются.

## 8. Components Affected

- Global `.btn` variants and sizes.
- Shadcn `Button` / `buttonVariants` для Alert Dialog.
- `.icon-btn` как отдельный сдержанный icon-only pattern.

Не затрагиваются `.nav-item`, `.snav`, `.segment-btn`, `.fsel-btn`,
`.cfg-preset-btn`, `.trend-range-btn` и organization switcher.

## 9. Files Affected

- `app/globals.css`.
- `components/ui/button.tsx`.
- `tasks/disign/DESIGN_SPRINT_02_BUTTON_SYSTEM.md`.
- `CHANGELOG.md`.

## 10. Design Materials

- CSS/HTML reference предоставлен владельцем проекта 17.08.2026.
- Визуальная идея: pill radius, lift, shadow, pressed feedback и fading halo.
- Цвета и типографика берутся из текущих DTEK tokens.

## 11. Tasks

- [x] Проанализировать обе существующие Button-системы.
- [x] Отделить action buttons от navigation/selection controls.
- [x] Реализовать адаптированный motion/effect для global `.btn`.
- [x] Синхронизировать Shadcn `buttonVariants`.
- [x] Добавить безопасное поведение icon-only и reduced motion.
- [x] Выполнить project quality gates.
- [x] Выполнить структурную регрессию button usage и production routes.
- [ ] Провести authenticated ручную визуальную регрессию основных страниц.
- [x] Подготовить документацию и diff к Git-финализации.

## 12. Acceptance Criteria

- Primary, line/outline, ghost/secondary и danger/destructive сохраняют цвета.
- `sm`, default/medium, `lg` и icon-only сохраняют назначение и не ломают layout.
- Hover lift, shadow, pressed feedback и умеренный halo единообразны.
- Disabled/loading не двигаются и не запускают halo.
- Focus-visible остаётся различимым с клавиатуры.
- Reduced-motion отключает transform/halo animation.
- Navigation и selection controls не получают action-button halo.

## 13. Regression Checklist

- [ ] Dashboard actions.
- [ ] Objects and Risks toolbar actions.
- [ ] Settings Profile/Organization save actions.
- [ ] Dialog primary/cancel/destructive actions.
- [ ] Import workflow buttons.
- [ ] Report actions.
- [ ] Auth/onboarding large actions.
- [ ] Icon-only drawer/table controls.
- [ ] Keyboard focus, disabled and loading states.
- [ ] Desktop and mobile layouts.

Автоматизированный browser-control в текущей сессии недоступен. Пункты
визуальной регрессии не отмечаются как PASS до фактического ручного прогона.
Production build, type-check, lint и существующие contract tests завершены
успешно.

## 14. Status

`IMPLEMENTED / MANUAL VISUAL QA PENDING`

Владелец проекта прямо запросил глобальное применение стиля 17.08.2026.
Кодовая реализация завершена; authenticated visual QA остаётся отдельным
необязательным для Git-финализации, но честно незакрытым этапом приёмки.
