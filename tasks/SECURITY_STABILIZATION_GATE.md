# SECURITY & STABILIZATION GATE — DTEK Core

`Тип: blocking release gate, не продуктовый Sprint`  
`Статус: PREPARED / NOT STARTED`  
`Дата подготовки: 24.08.2026`  
`Исходная стадия: Functional pre-pilot MVP`  
`Следующий продуктовый Sprint: не начат`

---

## 1. Назначение Gate

Полный аудит DTEK Core от 24.08.2026 подтвердил функциональную целостность
продукта, но выявил четыре блокирующих security finding и несколько связанных
stabilization-задач. До их устранения продукт нельзя переводить в статус
`PILOT READY` или передавать коммерческому pilot tenant.

Gate находится между завершённым состоянием Sprint 15 и любым продолжением
Roadmap. Он не является Sprint 16, не расширяет продуктовый scope и не открывает
Connector Runtime.

Текущий статус:

```text
Functional pre-pilot MVP
  -> Security & Stabilization Gate (PREPARED / NOT STARTED)
  -> authenticated release evidence
  -> PILOT READY decision
```

---

## 2. Исходная Контрольная Точка

| Область | Оценка аудита |
|---|---:|
| Product functionality | 82% |
| Technical readiness | 68% |
| Security readiness | 45% |
| UX/UI readiness | 76% |
| Automated testing | 52% |
| Commercial MVP readiness | 62% |

На контрольной точке успешно прошли `type-check`, lint, production build,
45 contract tests, production HTTP smoke `18/18` и production dependency audit.
Эти проверки не доказывают корректность multi-tenant RLS и authenticated
multi-role сценариев, поэтому не заменяют acceptance criteria этого Gate.

Cloud migration parity в ходе аудита повторно не подтверждён: локально
присутствуют migrations `001–019`, а повторная linked-проверка остаётся
обязательным preflight перед будущими migration changes.

---

## 3. Critical Findings

### SEC-01 — Profile Privilege Escalation

**Проблема:** текущая `profiles_update` policy разрешает пользователю обновлять
собственную строку без надёжной защиты `role`, `organization_id` и `status`.
Условие owner также не ограничивает target profile текущей организацией.

**Будущее решение:**

- запретить общий direct `UPDATE profiles` для `authenticated`;
- разрешить self-service update только allowlist-полей профиля;
- membership-поля изменять через tenant-scoped privileged RPC/DB contract;
- запретить назначение `owner`, изменение owner и межтенантный перенос;
- проверять active caller, current tenant и допустимый target role в БД;
- сохранить Server Action authorization как второй слой защиты.

**Ожидаемый результат:** direct Supabase API не позволяет изменить собственную
роль, tenant или status и не позволяет owner/admin изменить чужой tenant.

### SEC-02 — Blocked User Access Revocation

**Проблема:** `profiles.status = 'blocked'` отображает состояние, но не
прекращает доступ существующей сессии.

**Будущее решение:**

- добавить единый active-membership invariant в DB helper functions;
- возвращать status в auth context и middleware session context;
- централизованно отклонять blocked profile до выполнения Server Actions;
- обеспечить RLS deny через active-aware `current_org_id()` и
  `current_user_role()` либо эквивалентные helpers;
- при блокировке отзывать доступные Supabase Auth sessions server-side;
- определить безопасный redirect/error state без раскрытия внутренних данных.

Проверки не должны хаотично копироваться по каждому модулю: DB helpers защищают
direct API, auth context защищает Server Components/Actions, middleware
обеспечивает ранний UX guard.

### SEC-03 — Cross-tenant Object ↔ Risk Relation

**Проблема:** `object_risks` проверяет tenant объекта, но не tenant риска.

**Будущее решение:**

- ввести DB-enforced tenant identity для обеих сторон связи;
- использовать составные constraints/FK либо эквивалентный immutable DB guard;
- обновить `SELECT`, `INSERT` и `DELETE` policies с проверкой обеих сторон;
- перед migration проверить существующие строки на tenant mismatch;
- сохранить проверки Server Actions, но не считать их security boundary.

**Invariant:**

```text
Object.organization_id
  == Risk.organization_id
  == current active tenant
```

### SEC-04 — Cross-tenant Trust Graph Relation

**Проблема:** `relations.organization_id` проверяется, но принадлежность
`source_object_id` и `target_object_id` этой организации не гарантируется БД.

**Будущее решение:**

- связать оба endpoint с `organization_id` на уровне constraints/FK;
- усилить RLS для create/read/delete relation;
- проверить существующие relation rows до применения constraint;
- сохранить запрет self-relation и текущую uniqueness semantics.

**Invariant:**

```text
source_object.organization_id
  == target_object.organization_id
  == relation.organization_id
  == current active tenant
```

---

## 4. Important Stabilization Tasks

### STAB-01 — Atomic Organization Creation

Перенести критический DB flow `organization + owner membership +
trust_factor_config` в одну транзакционную PostgreSQL function/RPC. RPC должна:

- принимать только валидированные business inputs;
- использовать `auth.uid()` как caller identity;
- требовать active profile без текущей организации;
- исключать повторное создание/перенос уже привязанного пользователя;
- создать organization, owner membership и config атомарно;
- возвращать только безопасный organization identifier;
- не оставлять orphan rows при ошибке.

Server Action сохраняет Zod validation и вызывает RPC через user-scoped client,
а не собирает транзакцию несколькими `service_role` запросами.

### STAB-02 — Atomic Invitation Acceptance

Создание пользователя в Supabase Auth и изменения public schema не могут быть
одной PostgreSQL-транзакцией. Поэтому атомарным должен стать security-critical
DB transition:

```text
validated pending invitation
  + matching authenticated profile/email
  + empty or same tenant membership
  -> profile membership activated
  + invitation consumed exactly once
```

Переход реализуется idempotent RPC с row locking/compare-and-set. Auth signup
остаётся внешним шагом с безопасным retry: созданный, но ещё не присоединённый
profile не получает tenant access. Повторный вызов не должен принять одно
приглашение дважды или переместить пользователя между tenants.

### STAB-03 — Real Supabase TypeScript Types

- после финальных Gate migrations сгенерировать `types/database.ts` из linked
  schema;
- проверить diff schema до замены production types;
- типизировать новые RPC и затронутые queries;
- убрать `as never`/`as unknown` в изменяемом Gate scope;
- сокращение casts во всём репозитории выполнять отдельно, если оно выходит за
  безопасную границу Gate.

### STAB-04 — DB-level RLS Integration Tests

Создать воспроизводимый local Supabase integration suite для пяти account
states и двух организаций. Тесты выполняются с реальными JWT/user clients, а не
с `service_role`, кроме fixture setup/teardown. Каждый SEC/STAB fix получает
свои тесты сразу; STAB-04 объединяет их в обязательный release gate.

### STAB-05 — Authenticated Manual QA

После automated security suite провести role-based QA Sprint 12–14 и pilot
critical path. Результат фиксируется как фактический `PASS/FAIL/BLOCKED` с
датой, окружением и tester, без автоматической отметки `PASS`.

---

## 5. Зависимости И Порядок Реализации

```text
0. Preflight: diff после аудита + linked migration parity + backup
1. SEC-01 Profile/RBAC privilege boundaries
2. SEC-02 blocked-user enforcement поверх новых boundaries
3. SEC-03 Object <-> Risk tenant constraints
4. SEC-04 Trust Graph tenant constraints
5. STAB-01 atomic organization creation
6. STAB-02 atomic invitation acceptance
7. STAB-03 generated types после финальной DB schema
8. STAB-04 consolidated RLS integration suite
9. STAB-05 authenticated role QA
10. Full regression + Pilot Readiness review
```

SEC-02 зависит от SEC-01, потому что status нельзя считать control plane, пока
пользователь способен изменить его сам. STAB-01/02 используют защищённый
membership contract SEC-01. Types генерируются после изменения DB functions и
constraints, чтобы не генерировать их дважды. Security tests разрабатываются
инкрементально на шагах 1–6, а на шаге 8 запускается полная матрица.

Перед будущей реализацией необходимо только коротко проверить изменения после
24.08.2026 в затрагиваемых файлах и актуальный следующий migration number.
Повторный полный стратегический аудит не требуется.

---

## 6. Предполагаемый Change Surface

Финальный scope уточняется после preflight; существующие applied migrations не
редактируются.

| Область | Предполагаемые файлы |
|---|---|
| DB security | новая migration после актуальной последней migration; `001_helper_functions.sql`, `002_profiles.sql`, `010_object_risks.sql`, `011_relations.sql`, `013_invitations.sql`, `016_rls_hardening.sql` только как reference |
| Auth context | `lib/supabase/auth.ts`, `lib/supabase/middleware.ts`, `middleware.ts` |
| Membership actions | `lib/actions/users.ts`, профильные settings actions/components при необходимости |
| Organization flow | `lib/actions/organizations.ts`, `lib/actions/onboarding.ts` только если contract требует |
| Invitation flow | `lib/actions/invitations.ts`, invite acceptance UI только для safe error state |
| Graph/risk actions | `lib/actions/relations.ts`, `lib/actions/risks.ts`, Trust Engine query boundary при необходимости |
| Generated types | `types/database.ts` и только затронутые Supabase call sites |
| Automated tests | новый tenant/RLS integration suite, package/CI scripts при необходимости |
| QA/docs | security, RBAC/RLS, testing, runbook, readiness и changelog documents |

Номер migration намеренно не зафиксирован: владелец может внести промежуточные
изменения до старта Gate.

---

## 7. Security Acceptance Criteria

- [ ] Self-profile update меняет только разрешённые display fields.
- [ ] Пользователь не может изменить собственные role, tenant или status.
- [ ] Owner/admin не может изменить profile другого tenant.
- [ ] Owner нельзя назначить приглашением или role-management action.
- [ ] Blocked session теряет app, Server Action и direct data API access.
- [ ] Разблокировка восстанавливает только права назначенной роли.
- [ ] Object ↔ Risk relation требует один active tenant для обеих сторон.
- [ ] Trust Graph relation требует один active tenant для relation и endpoints.
- [ ] Organization DB flow не оставляет partial state.
- [ ] Invitation membership transition atomic, single-use и retry-safe.
- [ ] Service role остаётся только server-side и не подменяет tenant checks.
- [ ] Security errors не раскрывают UUID, policy details, tokens или raw DB errors.
- [ ] Security Audit Log фиксирует privileged membership transitions безопасно.

---

## 8. RLS Integration Test Matrix

Fixtures: `ownerA`, `adminA`, `analystA`, `viewerA`, `blockedA`, минимум один
active пользователь каждой необходимой роли в Organization B, Object/Risk A и
B, Graph endpoints A и B, pending/accepted invitations.

| Проверка direct API/RPC | owner | admin | analyst | viewer | blocked |
|---|:---:|:---:|:---:|:---:|:---:|
| Читать данные своего tenant | ALLOW | ALLOW | ALLOW | ALLOW | DENY |
| Читать данные Organization B | DENY | DENY | DENY | DENY | DENY |
| Изменить свои display profile fields | ALLOW | ALLOW | ALLOW | ALLOW | DENY |
| Изменить собственные role/org/status | DENY | DENY | DENY | DENY | DENY |
| Управлять non-owner membership своего tenant | ALLOW | по RBAC | DENY | DENY | DENY |
| Назначить/изменить owner | DENY | DENY | DENY | DENY | DENY |
| Создать Object A ↔ Risk A | по RBAC | по RBAC | по RBAC | DENY | DENY |
| Создать Object A ↔ Risk B | DENY | DENY | DENY | DENY | DENY |
| Создать Graph edge Object A ↔ Object A | по RBAC | DENY | ALLOW | DENY | DENY |
| Создать Graph edge Object A ↔ Object B | DENY | DENY | DENY | DENY | DENY |
| Повторно принять consumed invitation | DENY | DENY | DENY | DENY | DENY |

Значение `по RBAC` сверяется с актуальным `RBAC_MODEL.md`; security test не
должен расширять существующие роли ради удобства fixture setup.

Дополнительные обязательные cases: forged `organization_id`, known foreign UUID,
expired/revoked invitation, concurrent invitation accept, already-linked user,
block/unblock с существующей session и попытка обхода через REST/RPC.

---

## 9. Authenticated QA Matrix

| Роль/state | Обязательные сценарии |
|---|---|
| owner | login/logout, organization, users/invites, objects, risks, Passport explainability, Dashboard, Graph, Configurator, reports, import, Settings/audit |
| admin | разрешённые users/infrastructure actions; запрет owner assignment, risk mutation, Configurator mutation; Audit Log и Health Check |
| analyst | objects/risks/comments/assignment/Graph/Configurator/import по матрице; запрет team administration |
| viewer | read-only Dashboard/Objects/Passport/Risks/Graph; все mutations запрещены |
| blocked | существующая и новая session не дают app/API/action access; safe UX без tenant data |

Для каждой роли проверить desktop и mobile critical path. Sprint-specific
checklists остаются источниками подробных cases:

- `docs/testing/EXPLAINABILITY_QA_CHECKLIST.md`;
- `docs/testing/RISK_WORKFLOW_QA_CHECKLIST.md`;
- `docs/testing/PILOT_READINESS_CHECKLIST.md`;
- `docs/testing/RBAC_TESTING_GUIDE.md`.

---

## 10. Regression Scope

- регистрация, login, logout, password reset и refresh session;
- создание организации и onboarding;
- создание, повторное открытие, отзыв, expiry и принятие приглашения;
- role change, block/unblock и защита owner;
- Dashboard, Objects, Trust Passport, Risks, Graph и Configurator;
- imports объектов/рисков и source metadata;
- Trust Score recalculation и explainability;
- reports/exports, Settings, Audit Log и Environment Health;
- public routes, protected redirects, mobile layout и safe error states;
- import, explainability, risk workflow и production smoke automated suites.

---

## 11. Rollback Strategy

1. До migration: linked migration parity, schema-only backup, data backup и
   preflight queries на invalid cross-tenant rows.
2. Applied migrations не редактировать; использовать новую forward migration.
3. Constraints добавлять только после validation существующих данных. Любое
   расхождение блокирует deploy и разбирается отдельно, без silent delete.
4. DB functions/RPC разворачивать до переключения Server Actions; удалять
   legacy path только после automated и authenticated проверки.
5. Rollback приложения допустим только к версии, совместимой с новой schema.
6. Ослабление исправленной RLS policy не является штатным rollback. При
   критическом инциденте доступ временно закрывается, затем выпускается forward
   fix с отдельным security review.
7. Auth-created profile без accepted membership остаётся tenant-less и может
   безопасно повторить invitation transition.

---

## 12. Definition Of Done

- [ ] SEC-01–SEC-04 реализованы и имеют negative DB-level tests.
- [ ] STAB-01–STAB-05 выполнены и задокументированы.
- [ ] Cloud/local migration parity подтверждён до и после deploy.
- [ ] Реальные Supabase types отражают production schema.
- [ ] `npm run type-check` — PASS.
- [ ] `npm run lint` — PASS.
- [ ] `npm run build` — PASS.
- [ ] Import, explainability и risk workflow suites — PASS.
- [ ] Production smoke — PASS.
- [ ] RLS integration matrix — PASS.
- [ ] Authenticated role/mobile QA — PASS.
- [ ] Основные user journeys не имеют regression.
- [ ] Security/RBAC/RLS/operations/user documentation синхронизирована.
- [ ] Gate review зафиксировал фактическое release evidence.

---

## 13. Условия Статуса `PILOT READY`

`PILOT READY` разрешён только после полного Definition of Done и явного решения
release review. Наличие кода, migration или checklist без фактического test
evidence не считается прохождением Gate. Любой незакрытый Critical finding
оставляет статус `BLOCKED`.

---

## 14. Сознательно Вне Gate

- оптимизация повторных claims/profile запросов;
- общий redesign empty/error states Supabase;
- системная переработка fire-and-forget audit events вне затронутого scope;
- pagination/limits Trust Graph;
- полноценное organization switching;
- server-side PDF renderer;
- реализация Evidence Layer tables/runtime;
- Connector Runtime, Discovery Inbox и Identity Resolution runtime;
- выбор первого connector до pilot admission evidence;
- SSO/SAML, 2FA, on-prem и enterprise role customization.

Эти пункты сохраняются в Technical Debt/Roadmap и не должны незаметно
расширять blocking Gate.

---

## 15. Команда Возобновления

После команды владельца:

> Переходим к Security & Stabilization Gate по последнему аудиту

агент должен:

1. открыть этот документ;
2. коротко проверить diff/history затрагиваемых файлов после 24.08.2026;
3. сверить linked migrations и выбрать актуальный следующий номер;
4. минимально актуализировать implementation details;
5. начать с preflight и SEC-01 без нового полного стратегического аудита.

До этой команды статус остаётся `PREPARED / NOT STARTED`.
