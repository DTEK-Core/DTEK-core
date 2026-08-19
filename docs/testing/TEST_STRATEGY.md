# TEST_STRATEGY.md — DTEK Core

`Статус: актуальный`
`Дата: 12.08.2026`
`Область: Functional MVP, Market MVP, Evidence Import, Explainability, Risk Workflow`

---

## 1. Цель

Стратегия определяет обязательный quality gate DTEK Core. Автоматические проверки подтверждают код и pure business contracts, а authenticated manual QA подтверждает реальные Supabase, RBAC/RLS, multi-tenant и browser-сценарии.

Ни один Sprint нельзя закрывать только по зелёному build, если его Definition of Done требует ручной приёмки.

---

## 2. Уровни Тестирования

| Уровень | Инструмент | Текущее покрытие | Статус |
|---|---|---|---|
| Type safety | `npm run type-check` | Весь TypeScript-код | Обязательно |
| Static analysis | `npm run lint` | `app`, `components`, `lib`, `types`, middleware | Обязательно |
| Production build | `npm run build` | Все Next.js routes и Server Components | Обязательно |
| Import contracts | `npm run test:import` | Parser, mappings, validation, duplicates, partial success, limits | 19 тестов |
| Explainability contracts | `npm run test:trust-explainability` | Drivers, reasons, impact, history, source timeline, Dashboard aggregation | 17 тестов |
| Risk workflow contracts | `npm run test:risk-workflow` | Activity allowlist, safe UI/audit metadata и privileged Audit Log RLS | 9 тестов |
| Dependency audit | `npm audit` | Production и development dependency tree | Обязательно перед release |
| Runtime smoke | HTTP/browser | Public routes, auth redirect, templates, safe errors | Перед handoff/release |
| Manual functional | Browser + Supabase test organization | Основные пользовательские сценарии | По Sprint checklist |
| Security integration | Browser + две организации + четыре роли | RBAC, RLS, tenant isolation, Server Actions | Обязательно для security-sensitive Sprint |
| E2E automation | Не внедрено | Authenticated critical path | Technical Debt / Pilot Readiness |

---

## 3. CI Quality Gate

GitHub Actions для `develop` и `main` выполняет:

```text
lint
  -> type-check
  -> import + explainability + risk workflow contract tests
  -> production build
```

Build не должен запускаться после провала type-check или contract tests. Merge запрещён при любой красной обязательной проверке.

---

## 4. Ручные Test Suites

| Область | Документ | Состояние |
|---|---|---|
| Sprint 01–03 | `TEST_PLAN_SPRINT_01_03.md` | Исторический baseline |
| Sprint 05–07 | `TEST_PLAN_SPRINT_05_07.md`, `MANUAL_TESTING_GUIDE_S07.md` | Исторический baseline |
| RBAC/RLS | `RBAC_TESTING_GUIDE.md` | Актуальная инструкция |
| Reporting | `REPORTING_SMOKE_TEST_CHECKLIST.md` | Sprint 10 manual smoke |
| Data Onboarding | `DATA_ONBOARDING_SMOKE_TEST_CHECKLIST.md` | Sprint 11 PASS |
| Explainability | `EXPLAINABILITY_QA_CHECKLIST.md` | Sprint 12 manual QA pending |
| Risk Workflow | `RISK_WORKFLOW_QA_CHECKLIST.md` | Sprint 13 manual QA pending |
| Pilot Readiness | `PILOT_READINESS_CHECKLIST.md` | Sprint 14 master release gate pending |

Исторические test plans могут содержать состояния старых экранов. Они не являются источником текущего product status; актуальный статус определяется README, Roadmap и текущим Sprint-документом.

---

## 5. Обязательная Регрессия

Перед закрытием этапа проверить:

- регистрацию, вход, reset password и logout;
- создание организации и onboarding;
- четыре роли и запрет обхода через прямые Server Actions;
- изоляцию двух организаций;
- Objects CRUD и import;
- Trust Passport, Trust Score, history и explainability;
- Risk Registry, связи и counterfactual impact;
- Trust Graph и relation management;
- Configurator и массовый пересчёт;
- Dashboard, reports, CSV export и templates;
- source metadata, audit events, empty/error/loading states;
- desktop и mobile layout для затронутых экранов.

---

## 6. Test Data

- Sprint 11 fixtures находятся в `testing/sprint-11-import/` и являются утверждёнными тестовыми артефактами.
- Sprint 12 worked examples определены в `EXPLAINABILITY_QA_CHECKLIST.md`.
- Sprint 13 workflow data и role matrix определены в `RISK_WORKFLOW_QA_CHECKLIST.md`.
- Sprint 14 release candidate и итоговое решение фиксируются в `PILOT_READINESS_CHECKLIST.md`.
- Тестовые данные должны создаваться только в отдельной организации с явным префиксом Sprint.
- Нельзя использовать реальные клиентские данные, production tenant или service role в браузере.
- Повторный import проверяется как create-only и не должен изменять существующие записи.

---

## 7. Security Gate

Обязательно подтвердить:

- `organization_id` определяется сервером из профиля, а не принимается от клиента;
- service role используется только server-side;
- RLS включён для tenant-scoped tables;
- owner/analyst/admin/viewer не получают лишних действий;
- импорт повторно валидируется на сервере;
- raw SQL, Supabase errors, stack traces, UUID и source record IDs не раскрываются;
- audit metadata не содержит импортированные строки, IP активов или секреты;
- mass operations имеют лимиты и безопасные failure states.

---

## 8. Definition Of Pass

Этап получает `PASS`, если:

- все обязательные команды завершились с exit code 0;
- `npm audit` не содержит известных уязвимостей;
- обязательный Sprint checklist заполнен;
- нет открытых Blocker/Critical;
- Cloud migrations сверены для release;
- документация соответствует фактическому UI и коду;
- рабочее дерево чистое, commit запушен в `develop`, CI зелёный.

Если browser, роли, Supabase access token или тестовая организация недоступны, соответствующая проверка получает `BLOCKED`, а не формальный `PASS`.
