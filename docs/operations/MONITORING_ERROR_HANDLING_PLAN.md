# MONITORING_ERROR_HANDLING_PLAN.md - DTEK Core

`Спринт: Sprint 14 - Pilot Readiness`  
`Задача: S14-T006 - Monitoring & Error Handling Plan`  
`Версия: 1.0`  
`Дата: 22.08.2026`  
`Статус: IMPLEMENTED / PILOT ACTIVATION PENDING`

---

## 1. Назначение

План определяет минимальную наблюдаемость DTEK Core для пилота на 1-3
организациях длительностью 2-4 недели. Он помогает обнаружить, классифицировать
и обработать:

- падения Server Actions и route handlers;
- ошибки build/deploy;
- недоступность Supabase Auth или PostgreSQL;
- auth/middleware redirect loops;
- деградацию основных страниц и операций;
- ошибки security audit и фонового пересчёта Trust Score.

План не вводит новый monitoring stack. Для Commercial MVP используются
возможности Vercel, GitHub Actions, Supabase, существующий Environment Health
Check, production HTTP smoke и DTEK Core Security Audit Log.

---

## 2. Границы И Принципы

### Входит

- карта operational signals и источников логов;
- минимальные performance/error thresholds;
- severity, response targets и escalation;
- safe error handling и redaction contract;
- triage runbooks для основных классов инцидентов;
- release/pilot monitoring checklist;
- evidence и incident report format.

### Не входит

- Sentry, Datadog, Grafana Cloud или собственный telemetry backend;
- 24x7 SOC/NOC и формальный enterprise SLA;
- log drains, SIEM integration и длительное архивирование provider logs;
- автоматический remediation;
- включение verbose SQL, request body или sensitive payload logging;
- изменение бизнес-логики Server Actions.

Главные принципы:

1. Пользователь получает безопасное и понятное сообщение, оператор - минимум
   контекста для диагностики.
2. Логи не являются местом хранения бизнес-данных или evidence.
3. Ошибка mutation не должна отображаться как успех.
4. Автоматический retry разрешён только для безопасных idempotent reads.
5. Provider status проверяется до изменения кода или БД.
6. Security Audit Log не заменяет operational logs и наоборот.

---

## 3. Фактический Baseline

| Компонент | Реализованный сигнал | Ограничение |
|---|---|---|
| GitHub Actions | lint, type-check, 45 contract tests, build, 18 HTTP smoke contracts | Проверяет commit/deployable build, не pilot user session |
| Vercel | deployment/build status, Runtime Logs, HTTP status, Function/Middleware duration | Retention и alerts зависят от plan/settings |
| Supabase | Platform status, Logs Explorer: API/Auth/Postgres | Retention зависит от plan; app-level correlation ограничена |
| Environment Health UI | config, session/org, Auth API, tenant DB/RLS, duration | On-demand, owner/admin, не внешний uptime monitor |
| Pilot smoke | Public routes, templates, headers, protected redirects | Authenticated critical path проверяется отдельно |
| Security Audit Log | Критичные успешные mutations/exports/imports | Не содержит operational errors; запись audit non-blocking |
| Safe UI states | Generic Server Action errors, report error boundary, toasts | Нет глобального error boundary или централизованного SDK |
| Supabase timeout | Fail-fast fetch, default `2000 ms` | Не является latency metric или retry mechanism |

Текущий MVP не имеет собственного time-series monitoring, автоматического
error aggregation и custom correlation ID. Эти ограничения не скрываются:
перед pilot `GO` активируются доступные provider notifications и назначается
ответственный за регулярный review.

---

## 4. Роли И Ответственность

Заполнить в закрытой release card, не в Git:

```text
Pilot environment:
Release commit:
Monitoring owner:
Backup owner:
Incident commander:
Security reviewer:
Product/pilot contact:
Primary notification channel:
Fallback notification channel:
Support hours and timezone:
Vercel plan / log retention:
Supabase plan / log retention:
Provider alerts enabled:
Last monitoring rehearsal:
```

| Роль | Ответственность |
|---|---|
| Monitoring owner | Проверяет alerts/logs, ведёт журнал, начинает triage |
| Incident commander | Определяет severity, containment и коммуникацию |
| Security reviewer | Ведёт P0/security/tenant-isolation incidents |
| Release owner | Останавливает deploy, выполняет rollback/cutover decision |
| Pilot contact | Принимает сообщение пользователя без запроса secrets |

Один человек может совмещать роли в MVP, но имена и каналы должны быть
зафиксированы до выдачи pilot access.

---

## 5. Карта Сигналов

| Что контролировать | Источник | Минимальный trigger | Действие |
|---|---|---|---|
| CI failure | GitHub Actions | Любой failed required job | Release blocker, исправить до merge/deploy |
| Build/deploy failure | Vercel Deployments | Любой failed production/pilot deploy | P1, не продвигать deployment |
| Runtime 5xx | Vercel Runtime Logs | Любой 5xx critical route; 3 одинаковых за 10 минут | Triage; повтор переводит в P1 |
| Function/middleware latency | Vercel Observability/Logs | `>3 s` три раза на warm critical path или `>10 s` один раз | P2/P1, проверить outgoing Supabase request |
| Supabase outage | status page + Health UI | Auth или DB `unavailable`; одинаково у двух sessions | P1, проверить provider status/DNS |
| Auth failures | Supabase Auth logs | Login/register/reset падают у двух test accounts | P1 |
| Database/API errors | Supabase API/Postgres logs | Повторный `5xx`, timeout, RLS/SQL error на штатном flow | P1/P2 по влиянию |
| Redirect/refresh loop | Vercel Middleware logs + browser Network | Повторяющийся route chain или session refresh | P1 для login/app shell |
| Server Action failure | UI report + Vercel Function logs | Две одинаковые ошибки либо одна data-integrity ошибка | P1/P2 |
| Audit write failure | Vercel log prefix `[audit]` | Любая ошибка для privileged mutation/export | P2; проверить DB/RLS/service key |
| Missing Trust recalculation | QA/UI consistency | Mutation успешна, Score не обновился | P2; проверить non-blocking recalculation |
| Security/RBAC anomaly | User report + Security Audit + RLS test | Unauthorized access или cross-tenant visibility | P0 |

Critical routes:

```text
/login
/register
/onboarding/create
/dashboard
/objects
/risks
/users
/settings
/reports/executive
/api/reports/risks
/invite/{token}
```

Invite tokens и query parameters запрещено копировать в общий incident report.

---

## 6. Performance Baseline

Для малого pilot dataset после warm load используются операционные targets:

| Операция | Target | Incident trigger |
|---|---|---|
| Critical page navigation | До 2 секунд | Более 3 секунд три последовательных раза |
| Обычная Server Action mutation | До 3 секунд | Более 5 секунд два раза или timeout |
| Login/register/org creation | До 3 секунд | Более 5 секунд либо `fetch failed` |
| Environment Health Check | До 3 секунд | `degraded/unavailable` или более 5 секунд |
| CSV/XLSX import | По fixture baseline и размеру файла | Зависание, timeout или заметная регрессия на том же fixture |
| Report/Graph initial load | До 5 секунд на pilot dataset | Более 10 секунд или runtime error |

Это pilot thresholds, не публичный SLA. Измерять одинаковый route, account,
dataset и environment. Cold deployment/startup, плохая клиентская сеть и
provider incident записываются отдельно, а не смешиваются с warm application
latency.

Если реальный baseline стабильно выше target без функциональной ошибки,
зарегистрировать P2 performance defect с provider timing evidence. Не повышать
timeout как первое исправление.

---

## 7. Severity И Response Targets

| Severity | Примеры | Acknowledge | Containment/workaround target |
|---|---|---|---|
| P0 Critical | Cross-tenant leak, data corruption, exposed secret, unauthorized privileged action | 15 минут | 30 минут; остановить доступ/mutations |
| P1 High | Auth/org недоступны, repeated critical 5xx, Supabase outage, failed release, restore required | 30 минут | 4 часа или documented provider wait |
| P2 Medium | Изолированная action failure, audit gap, repeated latency, один модуль недоступен | 1 рабочий день | План/исправление до 3 рабочих дней |
| P3 Low | Неповторяемая ошибка, minor UI fallback, вопрос к документации | 2 рабочих дня | Backlog/release decision |

Правила:

- P0 всегда означает `NO-GO` или приостановку активного пилота.
- Открытый P1 на critical path блокирует новый release и pilot onboarding.
- Provider outage не снижает severity, но может менять способ containment.
- Отсутствие evidence не является основанием закрыть incident как resolved.
- Actual response times фиксируются для S14-T007 pilot metrics.

---

## 8. Monitoring Cadence

### Перед pilot access

- выполнить engineering baseline и `npm run test:smoke`;
- пройти authenticated critical path;
- проверить Environment Health UI;
- подтвердить Supabase project `Active`, migrations и backup state;
- проверить Vercel production/pilot deployment и Runtime Logs;
- проверить, что provider notifications доходят monitoring owner;
- провести tabletop incident rehearsal по одному P1 сценарию.

### Во время активного пилота

| Периодичность | Проверка |
|---|---|
| После каждого deploy | CI, deployment status, smoke, health, 5xx/errors |
| В начале рабочего дня | Supabase/Vercel status, unresolved errors, pilot reports |
| После user-reported issue | Logs и health в том же временном окне |
| Еженедельно | Trend latency/errors, open incidents, backup status, access review |
| После P0/P1 | Post-incident review и повтор затронутых release gates |

Без 24x7 on-call вне согласованных support hours пользователь получает заранее
определённый emergency contact. Это ограничение должно быть включено в Pilot
Documentation Pack.

---

## 9. Alert Activation Checklist

Перед pilot `GO` monitoring owner подтверждает фактические возможности текущих
plans. Нельзя отмечать alert как активный только потому, что функция описана у
провайдера.

- [ ] GitHub notifications включены для failed workflow на `develop/main`.
- [ ] Vercel deployment failure notifications доходят primary channel.
- [ ] Vercel Observability доступна; Runtime Logs и 5xx filters проверены.
- [ ] Vercel error/usage alerts включены, если доступны текущему plan.
- [ ] Supabase status page RSS/Atom подписка доставляет тестовое сообщение либо
      зафиксирован manual status-check fallback.
- [ ] Supabase Logs Explorer открывается monitoring owner.
- [ ] Auth/API/Postgres log sources и текущий retention записаны.
- [ ] Environment Health Check доступен owner/admin test account.
- [ ] Notification channels не содержат secrets и customer data.

Если автоматические provider alerts недоступны, gate может быть
`CONDITIONAL GO` только при отсутствии P0/P1, назначенном monitoring owner,
ежедневном manual review и явном одобрении release/security owners.

---

## 10. Error Handling Contract

### 10.1. Пользовательский интерфейс

Пользователю разрешено показывать:

- краткую категорию: validation, permission, connection или temporary failure;
- безопасное действие: повторить, обновить страницу, войти снова, обратиться в
  поддержку;
- error digest или provider request ID, если он уже безопасно предоставлен
  платформой и не содержит payload.

Запрещено показывать:

- raw Supabase/Postgres error object, SQL, `details`, `hint` или stack trace;
- JWT, cookies, connection string, keys и значения env;
- internal user/org/object/risk UUID;
- invite token, password reset token и source record IDs;
- данные другого tenant;
- полный request/response payload.

Mutation возвращает success только после подтверждённой основной DB operation.
Если history/audit является обязательной частью transaction contract, failure
обрабатывается по фактической реализации и не маскируется toast-успехом.

### 10.2. Server/runtime logs

Разрешённый минимальный контекст:

```text
timestamp UTC
environment
component/operation allowlisted name
route template, без sensitive query
safe error category
HTTP status
duration
Vercel requestId / Next digest, если доступен
release commit/deployment
```

Запрещённый контекст совпадает с UI-списком и дополнительно включает raw form
data, CSV/XLSX rows, comment body, IP/CVSS evidence и реальные email. Даже
server-only log не должен становиться копией customer dataset.

Рекомендуемые категории:

```text
validation
authorization
configuration
connectivity
timeout
dependency
database
rate_limit
unknown
```

### 10.3. Retry

- GET/health read можно повторить один раз вручную после проверки provider
  status.
- Create/update/delete/import/invite accept нельзя автоматически повторять без
  idempotency guarantee и проверки фактического результата.
- Не увеличивать бесконечно Supabase timeout и не создавать refresh loops.
- После connection recovery пользователь повторяет mutation только после
  проверки, что предыдущая попытка не создала запись.

---

## 11. Triage Flow

```text
Signal или user report
  -> записать UTC time, environment, release, role и safe operation
  -> определить scope: один user / tenant / все tenants
  -> проверить Vercel deployment и provider status
  -> запустить Environment Health Check
  -> сопоставить Vercel request с Supabase Auth/API/Postgres logs
  -> классифицировать severity
  -> containment / rollback / provider wait
  -> выполнить targeted verification
  -> закрыть incident с evidence и follow-up
```

Порядок важен: при общей недоступности Supabase не применять миграции и не
переписывать middleware; при failed deployment не выполнять database restore.

---

## 12. Component Playbooks

### 12.1. Login, registration или organization creation

1. Проверить Supabase project state и status page.
2. Запустить Health UI, если доступен существующий owner/admin session.
3. Проверить Vercel Runtime Logs для соответствующего времени и route.
4. Проверить Supabase Auth logs; для org creation дополнительно API/Postgres.
5. Сравнить две test accounts и вторую сеть/browser.
6. При `ENOTFOUND`, `fetch failed` или timeout перейти к
   [ENVIRONMENT_HEALTH_RUNBOOK.md](ENVIRONMENT_HEALTH_RUNBOOK.md).
7. Не просить пользователя присылать password, token или `.env.local`.

### 12.2. Server Action или route handler

1. Зафиксировать operation, role, UTC time и safe UI message.
2. Проверить, создалась ли mutation, прежде чем повторять действие.
3. Найти Vercel Function invocation по route/time/requestId.
4. Сопоставить с Supabase API/Postgres logs.
5. Проверить RBAC/RLS, validation и organization context.
6. После исправления повторить только затронутый action и regression path.

### 12.3. Build/deploy failure

1. Не продвигать failed deployment.
2. Проверить GitHub required job и Vercel Build Log.
3. Сверить release commit и environment variable names без вывода values.
4. Исправить source/config, повторить CI один раз.
5. Если previous deployment healthy, оставить его активным.

### 12.4. Performance degradation

1. Повторить warm path три раза на том же account/dataset.
2. Проверить Function/Middleware duration и outgoing request timing в Vercel.
3. Проверить Supabase status, API/Postgres logs и DB health.
4. Исключить DNS/VPN/client network.
5. Проверить duplicate requests, refresh loops и bulk recalculation.
6. Не маскировать проблему увеличением timeout без root cause.

### 12.5. Security или tenant isolation

1. Немедленно классифицировать P0 и остановить затронутый доступ/mutations.
2. Не исследовать реальными данными другого клиента.
3. Сохранить provider evidence в закрытом хранилище.
4. Проверить RLS/RBAC и последние privileged audit events.
5. Ротировать credential при подозрении на exposure.
6. Возобновить pilot только после security review и повторного isolation QA.

---

## 13. Security Audit И Operational Logs

Разделение обязательно:

| Security Audit Log | Operational Logs |
|---|---|
| Кто выполнил критичную бизнес-операцию | Почему request/dependency завершился ошибкой |
| Tenant-scoped, owner/admin read | Provider/dashboard access по operational role |
| Allowlisted metadata, immutable history | Ограниченная plan-dependent retention |
| Не хранит comment/import body | Не хранит бизнес-payload и secrets |

Ошибка записи audit event не блокирует поддерживаемый пользовательский flow,
но должна появиться в Vercel logs с префиксом `[audit]` и получить P2 review.
Security Audit Log нельзя использовать как error tracker.

---

## 14. Incident Evidence

Использовать обновлённый
[BUG_REPORT_TEMPLATE.md](../testing/BUG_REPORT_TEMPLATE.md) и дополнить:

```text
Incident ID:
Detected at / timezone:
Environment:
Release commit / deployment:
Reporter role:
Affected operation / route template:
Scope: user / tenant / all tenants
Severity:
Safe UI message:
Vercel requestId or Next digest:
Provider status:
Environment Health result:
First response time:
Containment:
Root cause:
Verification:
Follow-up owner/date:
```

Screenshots и log excerpts должны быть отредактированы до прикрепления. В
общем issue запрещены secrets, tokens, full URLs с token/query, customer rows и
PII.

---

## 15. Release Gate S14-T006

### Реализовано в задаче

- [x] Определены sources, signals, thresholds и cadence.
- [x] Определены severity и response targets.
- [x] Описаны safe UI/runtime error contracts и retry rules.
- [x] Описаны triage, component playbooks и incident evidence.
- [x] Зафиксированы границы MVP без нового monitoring vendor.

### Требует фактического выполнения перед Pilot GO

- [ ] Назначены monitoring owner, incident commander и channels.
- [ ] Проверены GitHub/Vercel failure notifications.
- [ ] Проверены Vercel Observability/Runtime Logs и Supabase Logs Explorer.
- [ ] Подтверждены provider plans и log retention.
- [ ] Настроена Supabase status subscription или manual fallback.
- [ ] Выполнен tabletop P1 incident rehearsal.
- [ ] Support hours и emergency contact включены в Pilot Documentation Pack.

До выполнения второй группы gate имеет статус
`IMPLEMENTED / PILOT ACTIVATION PENDING`, а не `PASS`.

---

## 16. Когда Нужен Отдельный Monitoring Stack

После пилота создать отдельное архитектурное решение, если наблюдается хотя бы
одно условие:

- provider retention недостаточна для расследований;
- ошибки невозможно связать между Vercel и Supabase по времени/requestId;
- incidents обнаруживаются пользователями раньше команды;
- требуется 24x7 alerting или договорный SLA;
- более трёх P1 incidents за пилот;
- нужен централизованный frontend error capture, tracing или log archive;
- клиент требует SIEM/log drain integration.

До такого решения не добавлять telemetry SDK и не отправлять customer data
третьему провайдеру по умолчанию.

---

## 17. Источники И Связанные Документы

Официальные provider docs:

- [Vercel Observability](https://vercel.com/docs/observability)
- [Vercel Runtime Logs](https://vercel.com/docs/logs/runtime)
- [Vercel Alerts](https://vercel.com/docs/alerts)
- [Supabase Logging](https://supabase.com/docs/guides/monitoring-and-debugging/logs)
- [Supabase Platform Status](https://supabase.com/docs/guides/platform#platform-status)

DTEK Core:

- [DEPLOYMENT.md](DEPLOYMENT.md)
- [ENVIRONMENT_HEALTH_RUNBOOK.md](ENVIRONMENT_HEALTH_RUNBOOK.md)
- [BACKUP_RESTORE_RUNBOOK.md](BACKUP_RESTORE_RUNBOOK.md)
- [PILOT_READINESS_CHECKLIST.md](../testing/PILOT_READINESS_CHECKLIST.md)
- [PILOT_SMOKE_TEST_CHECKLIST.md](../testing/PILOT_SMOKE_TEST_CHECKLIST.md)
- [SECURITY_OVERVIEW.md](../security/SECURITY_OVERVIEW.md)
- [TROUBLESHOOTING.md](../development/TROUBLESHOOTING.md)

---

*План закрывает документационную часть S14-T006. Фактические notifications,
owners и incident rehearsal подтверждаются отдельно для pilot release.*
