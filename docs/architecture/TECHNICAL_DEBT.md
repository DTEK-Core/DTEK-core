# TECHNICAL_DEBT.md — DTEK Core

`Статус: актуальный`  
`Дата: 24.08.2026`
`Область: архитектура, масштабирование, эксплуатация`

---

## 1. Цель

Документ фиксирует известный технический долг, ограничения и эксплуатационные
риски после реализации Sprint 14 и принятия Connector Framework ADR-009.

Технический долг не означает, что продукт сломан. Это список решений, которые приемлемы для MVP, но требуют контроля перед пилотами и enterprise-развитием.

---

## 2. Критичные До Pilot MVP

| ID | Состояние | Риск | Следующее действие |
|---|---|---|---|
| TD-001 | Demo dataset и manual seed plan готовы, автоматического seed нет | Новый demo tenant нужно наполнять вручную или через Sprint 11 import | Подтвердить воспроизводимый demo tenant до пилота |
| TD-002 | ✅ CSV/XLSX import реализован в Sprint 11 | Ограничения create-only и отсутствия rollback сохраняются | Контролировать как Known Limitation |
| TD-003 | ✅ Reporting реализован в Sprint 10 | PDF формируется через browser print, не server renderer | Контролировать как Known Limitation |
| TD-004 | Sprint 12 не прошёл authenticated manual QA | Explainability milestone нельзя закрыть только contract-тестами | Выполнить `EXPLAINABILITY_QA_CHECKLIST.md` до pilot release; по решению владельца не блокирует Sprint 13 |
| TD-005 | Invite email delivery не является полноценным каналом | Командный onboarding требует ручной передачи ссылки | Sprint 14 или раньше |
| TD-006 | Последний документированный baseline: Cloud migrations `001–019`; аудит 24.08.2026 parity повторно не подтвердил | Новую migration нельзя безопасно нумеровать/применять без linked-сверки | Выполнить `npx supabase migration list --linked` в preflight Gate |
| TD-007 | `main` не синхронизирован с `develop`, production release не подтверждён | Production не отражает текущий Market MVP | Выпускать только после QA, PR и release checklist |
| TD-008 | Sprint 13 не прошёл authenticated multi-role QA | Risk Workflow milestone нельзя закрыть только contract-тестами | Выполнить `RISK_WORKFLOW_QA_CHECKLIST.md` до pilot release |
| TD-009 | Profile update boundaries допускают privilege/tenant escalation | Критический security blocker | SEC-01 в `SECURITY_STABILIZATION_GATE.md` |
| TD-010 | Blocked status не прекращает фактический доступ | Критический security blocker | SEC-02 в `SECURITY_STABILIZATION_GATE.md` |
| TD-011 | Object/Risk и Graph relations не имеют полной DB-level tenant integrity | Критический security blocker | SEC-03/SEC-04 в `SECURITY_STABILIZATION_GATE.md` |
| TD-012 | Organization/invitation membership transitions не полностью атомарны | Partial state и race conditions | STAB-01/STAB-02 в `SECURITY_STABILIZATION_GATE.md` |
| TD-013 | Supabase types остаются заглушкой; RLS integration suite отсутствует | Ослабленная compile-time и security verification | STAB-03/STAB-04 в `SECURITY_STABILIZATION_GATE.md` |

---

## 3. Масштабирование

| ID | Проблема | Текущее решение | Когда вернуться |
|---|---|---|---|
| TD-101 | Server Components запрашивают Supabase при навигации | Loading skeletons + fail-fast timeout | После первых пилотов или при >2s p95 |
| TD-102 | Массовый пересчёт Trust Score синхронный | Server Actions вызывают `lib/trust/engine.ts` | При организациях 500+ объектов |
| TD-103 | In-memory rate limit | Достаточно для MVP | Перед production multi-instance |
| TD-104 | Нет фоновой очереди событий | Audit записывается напрямую | Перед расширенным monitoring/audit |
| TD-105 | Нет кэша аналитических запросов Dashboard | Supabase queries на страницу | При росте объёма данных |
| TD-106 | Next.js build предупреждает о Node API Supabase client в Edge middleware | Потенциальная несовместимость при изменении Edge runtime | Проверить при обновлении `@supabase/ssr` или Next.js; не подавлять warning |
| TD-107 | Webpack cache сериализует крупные строки | Медленнее локальная десериализация build cache | Вернуться при заметном влиянии на CI/build time |
| TD-108 | Middleware и Server Components повторно получают claims/profile | Дополнительные auth/profile round trips | После Security Gate измерить p95 и оптимизировать отдельно |
| TD-109 | Часть Supabase read errors отображается как empty state | Сбой источника можно принять за отсутствие данных | Выделить единый error-state contract после blocking Gate |
| TD-110 | Trust Graph загружает граф без pagination/limits | Рост client payload на крупных tenants | После первых pilot volume measurements |

---

## 4. Security / Compliance Debt

| ID | Проблема | Статус |
|---|---|
| TD-201 | Нет 2FA/TOTP | Post-MVP / Enterprise |
| TD-202 | Нет SSO/SAML | Enterprise |
| TD-203 | CSP допускает ограничения Next.js runtime | Задокументировано в security docs |
| TD-204 | Нет WAF | Post-MVP |
| TD-205 | Нет формального pentest | Перед production launch |
| TD-206 | ФСТЭК alignment только на уровне документации | Требует отдельного security sprint |
| TD-207 | ESLint 8 и часть lint toolchain deprecated | Перейти на ESLint 9/flat config отдельной инженерной задачей до Next.js 16 |
| TD-208 | Часть audit writes не имеет единообразной гарантии ожидания | Событие может не сохраниться при раннем завершении request | Аудировать отдельно; в Gate исправлять только затронутые privileged transitions |

---

## 5. Product Architecture Debt

| ID | Проблема | Риск | Решение |
|---|---|---|---|
| TD-301 | S15-T007 отложил первый connector: pilot-backed ranking отсутствует | Automatic freshness недоступна, но преждевременный выбор дороже | Сохранять import path; reopen decision только после source cards/admission evidence |
| TD-302 | Pilot Risk Workflow реализован, но остаётся intentionally minimal | Не покрывает approvals, reminders и custom states | Не расширять до task manager без pilot signal |
| TD-303 | Activity timeline и security audit реализованы без backfill старых действий; source metadata не является Evidence Layer | Старые workflow-события честно отсутствуют; новый connector contract ещё не имеет runtime | Evidence Layer specification — S15-T002 |
| TD-304 | Отраслевые пресеты пока экспертно-заданы | Требуется калибровка на реальных кейсах | Пилоты |
| TD-305 | TrustOps термин не валидирован рынком | Может быть непонятен покупателю | Использовать как вторичный термин |
| TD-306 | Один profile поддерживает только один `organization_id` | Полноценное organization switching отсутствует | Отдельное product/architecture решение после пилотов |

---

## 6. Documentation Debt

| ID | Проблема | Статус |
|---|---|
| TD-401 | Исторические Sprint-документы содержат старые статусы | Оставлены как history, не source of truth |
| TD-402 | `.claude/` содержит legacy workflow | Сохранено для совместимости, актуальные правила в root |
| TD-403 | `CLAUDE.md` и `AGENTS.md` частично пересекаются | Критичный ADR/migration/positioning context синхронизирован 23.08.2026; избегать дальнейшего расхождения |

---

## 7. Known Limitations Текущего MVP

- import работает по create-only модели и не выполняет массовый update/merge или rollback файла;
- source metadata временно хранится в trailing `[Import Source]` text block, а не в Evidence Layer tables;
- `confidence` является metadata и не влияет на Trust Score;
- Trust Graph создаётся вручную, автоматическое discovery связей отсутствует;
- Risk Registry имеет owner, SLA, immutable comments, manual/imported origin context, activity timeline и аудит критичных workflow actions; backfill старых действий отсутствует;
- printable reports сохраняются в PDF средствами браузера;
- invitation link передаётся вручную без production email delivery;
- нет E2E automation для authenticated multi-role и multi-tenant сценариев;
- demo seed автоматизированно не воспроизводится;
- Connector Framework, Evidence Layer, Identity Resolution и
  Confidence/Discovery Inbox contracts специфицированы в Sprint 15, но
  connector runtime/UI/migrations, Drift Detection и Auto Risk Mapper пока не
  реализованы.

---

## 8. Что Не Исправлять Сейчас

Не нужно сейчас:

- переписывать Trust Score Engine;
- переносить backend из Supabase;
- заменять App Router;
- вводить Graph DB;
- делать on-prem;
- добавлять кастомную RBAC-модель;
- строить очередь событий.

Эти изменения преждевременны до Market MVP и пилотов.
