# 23. Текущее состояние и Roadmap

## На 03.08.2026

Последний полностью закрытый этап — Sprint 11. Код Sprint 12 реализован, contract tests и документация готовы, но authenticated manual QA не завершён. Следующий Sprint не начат.

## Реализовано

Auth, organizations, onboarding, App Shell, RBAC/RLS, users, objects, Passport, six-factor Score, manual Graph, Risk Registry, Configurator, Dashboard, CSV/XLSX import, source metadata, templates, reports/export и частичный audit.

## Частично

- Risk workflow: есть базовые поля/CRUD, нет comments/activity workflow.
- Evidence: source-aware import есть, отдельных records/lineage нет.
- Graph: ручной, не discovery-driven.
- Audit: критичные события, но не полное покрытие.
- Testing: contract baseline есть, ручной Sprint 12 gate открыт.
- DB typing: `types/database.ts` не сгенерирован.

## Roadmap

1. Закрыть Sprint 12 manual QA и cloud migration check.
2. Sprint 13: Evidence-aware Risk Workflow.
3. Sprint 14: Pilot Readiness.
4. Sprint 15: Connector Framework Foundation.
5. Post-MVP: evidence/discovery runtime, identity resolution, confidence, drift, auto risk.
6. Enterprise/v2: SSO/MFA expansion, on-prem, distributed controls, advanced integrations/governance.

Порядок снижает риск: сначала объяснить существующий score, затем сделать риск рабочим процессом, подготовить пилот и только потом проектировать тяжёлые integrations на основании реальных потребностей.

## Исторические расхождения

Старые `docs/product/DEMO_NARRATIVE.md` и ранние test reports ещё называют Configurator/reporting/import/explainability будущими. Они исторически верны для своих Sprint, но не описывают текущее состояние. Актуальны README, Sprint 11/12, code и migrations.

> Главное, что нужно запомнить: MVP функционален для ручного/import-driven пилота, но evidence automation остаётся Roadmap.

## Проверь себя

1. Почему Sprint 12 ещё не закрыт?
2. Что относится к Sprint 13?
3. Какие функции только Post-MVP?
4. Почему connectors идут после pilot readiness?

