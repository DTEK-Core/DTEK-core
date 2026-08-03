# 19. Тестирование и качество

Unit test проверяет малую функцию; integration — взаимодействие частей; E2E — сценарий через систему; smoke — базовую жизнеспособность; regression — отсутствие возврата старой ошибки; security test — защитные свойства; manual test — то, что надёжнее оценивает человек.

Test fixture — подготовленные данные, test case — шаги/условия, expected result — ожидаемый результат. Definition of Done определяет, когда задача действительно завершена.

## Фактические проверки

- `npm run test:import`: 17 контрактных тестов import pipeline.
- `npm run test:trust-explainability`: 17 тестов drivers/impact/explainability.
- `docs/testing/`: ручные RBAC, reporting, onboarding и Sprint 12 checklists.
- CI: lint → type-check/contract tests → build.

`npm run type-check` ловит ошибки TypeScript, но не поведение и RLS. `npm run lint` ловит правила/подозрительные конструкции, но не бизнес-ошибки. `npm run build` проверяет production compilation/routes, но не доказывает корректность данных или UI. Только вместе они дают baseline.

## Перед демонстрацией

```bash
npm ci
npm audit
npm run lint
npm run type-check
npm run test:import
npm run test:trust-explainability
npm run build
npm run dev
```

После этого вручную проверить login, dashboard, object → passport, risk, graph, import preview/commit, reports, роли, второй tenant и responsive UI. Sprint 12 считается закрытым только после заполнения `docs/testing/EXPLAINABILITY_QA_CHECKLIST.md`.

> Главное, что нужно запомнить: зелёный build доказывает сборку, но не безопасность и не корректность пользовательского сценария.

## Проверь себя

1. Чем smoke test отличается от E2E?
2. Что не проверяет TypeScript?
3. Почему manual QA остаётся gate?
4. Где находятся fixtures?

