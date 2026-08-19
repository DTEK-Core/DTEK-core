# PILOT_READINESS_CHECKLIST.md — DTEK Core

`Спринт: Sprint 14 — Pilot Readiness`  
`Задача: S14-T001 — Pilot Readiness Checklist`  
`Тип: обязательный release gate перед пилотным доступом`  
`Дата создания: 19.08.2026`  
`Статус: PENDING — checklist подготовлен, release gates не закрыты`

---

## 1. Назначение

Этот документ является единой точкой принятия решения о готовности DTEK Core
к пилоту на 1–3 организациях длительностью 2–4 недели. Он объединяет
инженерные, продуктовые, security, эксплуатационные и документационные gates,
но не заменяет детальные QA-чеклисты модулей.

Пилотный доступ нельзя выдавать только на основании успешного build. Решение
`GO` возможно после фактического authenticated прогона, подтверждения
multi-tenant isolation, проверки окружения, восстановления и рабочего invite
flow.

---

## 2. Статусы И Правила

| Статус | Значение |
|---|---|
| `PASS` | Проверка выполнена, evidence приложен |
| `FAIL` | Есть подтверждённый дефект или несоответствие |
| `BLOCKED` | Проверка невозможна из-за окружения или внешнего сервиса |
| `PENDING` | Проверка ещё не выполнялась или требует повторного прогона |
| `N/A` | Пункт неприменим; причина и согласующий указаны |

Правила:

1. `PASS` без даты, проверяющего и evidence не засчитывается.
2. Security, RBAC/RLS, tenant isolation, backup/restore и Critical Path нельзя
   закрыть как `N/A`.
3. Автоматические тесты не заменяют authenticated manual QA.
4. Любой открытый Blocker/Critical defect означает `NO-GO`.
5. После изменения кода, миграций, production env или Supabase configuration
   затронутые gates выполняются повторно.
6. В evidence запрещено помещать пароли, access/refresh tokens, anon/service
   keys, полные auth cookies и реальные чувствительные данные клиента.

---

## 3. Карточка Кандидата

Заполнить для конкретного pilot release candidate:

```text
Версия / tag:
Commit SHA:
Ветка:
URL окружения:
Supabase project ref:
Дата начала проверки:
Release owner:
Security reviewer:
QA reviewer:
Пилотная организация:
Плановое окно пилота:
```

Допустим только commit из `develop`, прошедший обязательные проверки. Значение
project ref можно фиксировать, но ключи и токены в документ не записываются.

---

## 4. Сводка Release Gates

| Gate | Обязательный результат | Текущий статус | Evidence / документ |
|---|---|---|---|
| G-01 Engineering baseline | Type-check, lint, build, contracts, dependency audit | `BASELINE PASS / RECHECK` | Раздел 6 |
| G-02 Sprint 12 Explainability | Authenticated QA и четыре роли | `PENDING` | [EXPLAINABILITY_QA_CHECKLIST.md](EXPLAINABILITY_QA_CHECKLIST.md) |
| G-03 Sprint 13 Risk Workflow | Authenticated QA, RBAC/RLS и timeline | `PENDING` | [RISK_WORKFLOW_QA_CHECKLIST.md](RISK_WORKFLOW_QA_CHECKLIST.md) |
| G-04 Cloud migrations | Local/Cloud цепочки совпадают, drift отсутствует | `BASELINE PASS / RECHECK` | Раздел 7 |
| G-05 Environment health | Supabase, DNS, env, middleware диагностируются | `IMPLEMENTED / RECHECK` | [ENVIRONMENT_HEALTH_RUNBOOK.md](../operations/ENVIRONMENT_HEALTH_RUNBOOK.md) |
| G-06 Invitation delivery | Поддержанный invite path проверен end-to-end | `IMPLEMENTED / RECHECK` | [Invitation Delivery Runbook](../operations/INVITATION_DELIVERY_RUNBOOK.md) |
| G-07 Critical path smoke | Auth → org → data → reports проходит повторяемо | `PENDING / S14-T004` | Baseline S14-T004 |
| G-08 Backup and restore | Процедура описана и проверена | `PENDING / S14-T005` | Runbook S14-T005 |
| G-09 Monitoring and errors | Есть минимальная наблюдаемость и escalation path | `PENDING / S14-T006` | План S14-T006 |
| G-10 Pilot metrics | Success criteria, feedback и source inventory утверждены | `PENDING / S14-T007` | Метрики S14-T007 |
| G-11 Pilot documentation | Пользовательский и внутренний пакет собран | `PENDING / S14-T008` | Pack S14-T008 |

`BASELINE PASS / RECHECK` означает, что проверка была успешна на предыдущем
commit, но должна быть повторена для release candidate. Это не итоговый `PASS`.

---

## 5. Входные Условия

- [ ] Зафиксированы commit SHA, URL и Supabase project ref.
- [ ] Рабочее дерево чистое; release candidate доступен в `develop`.
- [ ] Пилот выполняется в отдельной организации без production-данных клиента.
- [ ] Подготовлены owner, analyst, admin и viewer через штатный invite flow.
- [ ] Подготовлен второй tenant для isolation tests.
- [ ] Назначены release owner, QA reviewer и security reviewer.
- [ ] Согласовано окно проверки без параллельных миграций и env-изменений.
- [ ] Известен rollback owner и канал связи при Blocker/Critical defect.

Если входные условия не выполнены, дальнейшие статусы остаются `PENDING` или
`BLOCKED`, а не отмечаются как `PASS` по предположению.

---

## 6. Engineering Baseline

Выполнить на release candidate:

| Проверка | Ожидаемый результат | Статус | Evidence |
|---|---|---|---|
| `npm ci` | Lockfile устанавливается без изменения |  |  |
| `npm run type-check` | TypeScript strict без ошибок |  |  |
| `npm run lint` | Нет warnings/errors |  |  |
| `npm run test:import` | Все import contracts проходят |  |  |
| `npm run test:trust-explainability` | Все explainability contracts проходят |  |  |
| `npm run test:risk-workflow` | Все risk workflow contracts проходят |  |  |
| `npm run build` | Production build успешен |  |  |
| `npm audit --audit-level=low` | 0 известных уязвимостей |  |  |
| CI `develop` | Обязательные jobs завершены успешно |  |  |

Baseline на `cf68601` от 19.08.2026: type-check, lint, build, 45/45 contract
tests и dependency audit прошли; `npm audit` сообщил `0 vulnerabilities`.
Перед pilot `GO` таблица заполняется заново для фактического commit.

---

## 7. Supabase И Миграции

Проверка только чтением; не запускать `db reset`, `migration up`, repair или
ручной SQL в pilot environment в рамках readiness review.

```bash
npx supabase migration list
```

- [ ] Supabase project имеет статус Active и отвечает по HTTPS.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` указывает на ожидаемый project ref.
- [ ] Local и Remote содержат одинаковую последовательность миграций.
- [ ] Миграции `018_risk_workflow` и `019_security_events_privileged_read`
      присутствуют в Cloud.
- [ ] Нет неизвестных remote-only или unapplied local migrations.
- [ ] RLS включён для tenant-scoped таблиц.
- [ ] Service role key отсутствует в client bundle, логах и документации.

Baseline от 19.08.2026: Supabase доступен; Local/Remote `001–019` совпадают.
Для release candidate требуется повторный результат и дата:

```text
Дата:
Проверяющий:
Local max migration:
Remote max migration:
Результат: PENDING / PASS / FAIL / BLOCKED
Evidence:
```

---

## 8. Auth, Organization И Invitation

| ID | Сценарий | Ожидаемый результат | Статус | Evidence |
|---|---|---|---|---|
| AUTH-01 | Регистрация owner | Аккаунт создаётся один раз, raw error отсутствует |  |  |
| AUTH-02 | Login/logout | Сессия создаётся и завершается без retry loop |  |  |
| AUTH-03 | Refresh session | Переходы после обновления страницы работают |  |  |
| ORG-01 | Создание организации | Owner и default config создаются корректно |  |  |
| ORG-02 | Открытие организации | App Shell и context соответствуют tenant |  |  |
| INV-01 | Создание invitation | Owner получает действующую ссылку без internal ID |  |  |
| INV-02 | Принятие invitation | Пользователь входит в правильную организацию и роль |  |  |
| INV-03 | Existing/expired/revoked | Все состояния обрабатываются без дублирования |  |  |

S14-T003 фиксирует manual invite link как официальный Commercial MVP
delivery path. Автоматическая email delivery не заявляется. Полный
gate закрывается только authenticated E2E прогоном по
[Invitation Delivery Runbook](../operations/INVITATION_DELIVERY_RUNBOOK.md); статус
`IMPLEMENTED / RECHECK` не равен `PASS`.

---

## 9. Product Critical Path

Проверить owner и минимум одну read-only роль:

- [ ] Dashboard загружается без raw runtime errors и показывает данные tenant.
- [ ] Objects: create/import, list, details и archive работают по RBAC.
- [ ] Trust Passport отображает Score, sources, reasons и историю.
- [ ] Trust Graph показывает объекты/связи и корректный empty state.
- [ ] Risks: create/import, owner, SLA, comments, status и timeline работают.
- [ ] Configurator сохраняет разрешённые веса и пересчитывает Score.
- [ ] Settings/Profile сохраняются без потери organization context.
- [ ] Users/Invitations соблюдают role restrictions.
- [ ] Risk CSV, Passport print/PDF и Executive report доступны по матрице ролей.
- [ ] CSV templates и error reports скачиваются с корректными именами.
- [ ] Empty, loading и recoverable error states не блокируют навигацию.
- [ ] Desktop и mobile не имеют критичных overlap/horizontal overflow.

Детальная автоматизация или формализация этого пути относится к S14-T004.

---

## 10. RBAC, RLS И Tenant Isolation

| Проверка | Owner | Analyst | Admin | Viewer | Статус |
|---|---:|---:|---:|---:|---|
| Просмотр объектов/рисков/passports/graph | Да | Да | Да | Да |  |
| Создание рисков и risk workflow mutations | Да | Да | Нет | Нет |  |
| Risk CSV / Executive report | Да | Да | Нет | Нет |  |
| Создание invitation | Да | Нет | Нет | Нет |  |
| Назначение роли owner | Нет | Нет | Нет | Нет |  |
| Просмотр Audit Log | Да | Нет | Да | Нет |  |

Обязательные isolation tests:

- [ ] Пользователь Tenant A не видит Objects/Risks/Comments/Activity Tenant B.
- [ ] Подмена object/risk/organization ID не раскрывает данные Tenant B.
- [ ] Viewer не выполняет mutation прямым Server Action request.
- [ ] Admin не создаёт риск и не назначает owner.
- [ ] Analyst/viewer не читают `security_events` через Supabase API.
- [ ] Export содержит только записи текущей организации.
- [ ] Audit metadata не содержит comment body, секреты и внутренние UUID.

Полная подготовка ролей описана в
[RBAC_TESTING_GUIDE.md](RBAC_TESTING_GUIDE.md).

---

## 11. Окружение И Производительность

- [ ] Production/pilot env содержит обязательные переменные без пустых значений.
- [ ] DNS разрешает Supabase host; нет `ENOTFOUND` и постоянных `fetch failed`.
- [ ] Middleware не создаёт redirect/refresh loops.
- [ ] Основные Server Actions завершаются или показывают safe recoverable error.
- [ ] Console не содержит необработанных auth/Supabase/runtime ошибок.
- [ ] Network не показывает бесконечные повторные запросы.
- [ ] App Shell, Dashboard, Objects и Risks не имеют заметной деградации после warm load.
- [ ] UI health check и CLI triage выполняются по
      [ENVIRONMENT_HEALTH_RUNBOOK.md](../operations/ENVIRONMENT_HEALTH_RUNBOOK.md).
- [ ] Расширенная локальная диагностика выполняется по
      [TROUBLESHOOTING.md](../development/TROUBLESHOOTING.md).

Пороговые значения и health procedure уточняются в S14-T002 и S14-T006.

---

## 12. Operations, Data И Support

- [ ] Backup/restore runbook S14-T005 подготовлен и проверен без production loss.
- [ ] Назначены владелец backup и допустимые RPO/RTO пилота.
- [ ] Monitoring/error plan S14-T006 содержит каналы и escalation severity.
- [ ] Зафиксирован способ остановить доступ и отозвать invitations.
- [ ] Определены срок хранения и удаление тестовых данных после пилота.
- [ ] В pilot dataset нет секретов и лишних персональных данных.
- [ ] Известно, как сообщить о дефекте по
      [BUG_REPORT_TEMPLATE.md](BUG_REPORT_TEMPLATE.md).
- [ ] Pilot success metrics и feedback cadence утверждены в S14-T007.
- [ ] Зафиксирован source inventory без обещания Post-MVP connectors.

---

## 13. Pilot Documentation Pack

Перед выдачей доступа участнику должны быть доступны:

- [ ] краткое описание цели и границ пилота;
- [ ] инструкция входа и принятия invitation;
- [ ] роли и ограничения действий;
- [ ] импорт Objects/Risks и шаблоны;
- [ ] Trust Score/Passport/Graph и Risk Workflow guides;
- [ ] отчёты и экспорт;
- [ ] известные ограничения MVP;
- [ ] support/escalation contacts;
- [ ] порядок обратной связи и завершения пилота.

Финальный набор и ссылки формируются в S14-T008.

---

## 14. Журнал Дефектов И Решений

| ID | Gate / Test | Severity | Описание | Owner | Срок | Evidence | Статус |
|---|---|---|---|---|---|---|---|
| PILOT- |  |  |  |  |  |  | Open |

Severity:

- `Blocker` — пилот или восстановление невозможны;
- `Critical` — auth, data integrity, RLS/RBAC или tenant isolation нарушены;
- `Major` — критический пользовательский путь не работает;
- `Minor` — ограниченный UX/visual defect с обходным путём;
- `Question` — требуется продуктовое или эксплуатационное решение.

Minor defect допускается только с записанным workaround, owner и сроком.

---

## 15. Финальное Решение

### Условия `GO`

- [ ] G-01–G-11 имеют итоговый `PASS`.
- [ ] Sprint 12 и Sprint 13 authenticated QA завершены.
- [ ] Нет открытых Blocker/Critical/Major без согласованного исключения.
- [ ] Cloud migrations повторно сверены на release candidate.
- [ ] Invite, backup/restore, monitoring и support paths готовы.
- [ ] Pilot metrics и документационный пакет утверждены.
- [ ] Release owner и security reviewer подписали решение.

```text
Решение: PENDING / GO / CONDITIONAL GO / NO-GO
Release candidate:
Дата:
Release owner:
QA reviewer:
Security reviewer:
Открытые исключения:
Условия Conditional GO:
Rollback owner:
Комментарий:
```

`CONDITIONAL GO` запрещён при Blocker/Critical, нарушении tenant isolation,
непроверенном restore или незавершённых Sprint 12/13 authenticated gates.

---

## 16. Связанные Документы

- [SPRINT_14.md](../../tasks/SPRINT_14.md) — задачи Pilot Readiness.
- [INVITATION_DELIVERY_RUNBOOK.md](../operations/INVITATION_DELIVERY_RUNBOOK.md) — delivery contract и invitation E2E QA.
- [EXPLAINABILITY_QA_CHECKLIST.md](EXPLAINABILITY_QA_CHECKLIST.md) — gate Sprint 12.
- [RISK_WORKFLOW_QA_CHECKLIST.md](RISK_WORKFLOW_QA_CHECKLIST.md) — gate Sprint 13.
- [REPORTING_SMOKE_TEST_CHECKLIST.md](REPORTING_SMOKE_TEST_CHECKLIST.md) — отчёты.
- [DATA_ONBOARDING_SMOKE_TEST_CHECKLIST.md](DATA_ONBOARDING_SMOKE_TEST_CHECKLIST.md) — импорт.
- [RBAC_TESTING_GUIDE.md](RBAC_TESTING_GUIDE.md) — четыре роли и isolation.
- [PILOT_OFFER.md](../product/PILOT_OFFER.md) — коммерческие границы пилота.
- [SECURITY_OVERVIEW.md](../security/SECURITY_OVERVIEW.md) — security baseline.
- [TECHNICAL_DEBT.md](../architecture/TECHNICAL_DEBT.md) — известные ограничения.
- [TROUBLESHOOTING.md](../development/TROUBLESHOOTING.md) — диагностика окружения.
- [ENVIRONMENT_HEALTH_RUNBOOK.md](../operations/ENVIRONMENT_HEALTH_RUNBOOK.md) — UI/CLI health triage и recovery.

---

*Создание checklist завершает S14-T001, но не означает готовность к пилоту.
Итоговый статус меняется только после фактического прохождения всех gates.*
