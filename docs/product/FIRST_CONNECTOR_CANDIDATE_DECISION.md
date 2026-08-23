# FIRST_CONNECTOR_CANDIDATE_DECISION.md — DTEK Core

`Версия: 1.0`
`Дата решения: 23.08.2026`
`Задача: S15-T007 — First Connector Candidate Decision`
`Решение: DEFER / KEEP CSV-XLSX IMPORT PATH`
`Статус: APPROVED — пересмотр после pilot admission evidence`

---

## 1. Decision Summary

DTEK Core **не выбирает первый production/prototype connector** на текущем
этапе. Автоматический connector runtime откладывается, а CSV/XLSX import
остаётся основным evidence onboarding path.

Причина не в отсутствии технических кандидатов. T006 подготовил research pool,
но в проекте отсутствуют подтверждённые pilot source cards, demand scores,
customer deployment boundary, test environment и product owner конкретной
интеграции. Выбор Zabbix, Kaspersky Security Center, MaxPatrol VM, Wazuh или
другого source сейчас был бы предположением, противоречащим Roadmap и Pilot
Metrics.

Это финальное решение S15-T007, а не незавершённый анализ. Sprint acceptance
разрешает выбрать source **или явно отложить** его; выбран второй вариант.

---

## 2. Контекст

К моменту решения готовы:

- ADR-009 и Connector Framework contract;
- Evidence Layer data model;
- Normalization и Identity Resolution;
- Confidence Engine и Discovery Inbox specification;
- Connector Security Model;
- Russian Market research shortlist;
- рабочий CSV/XLSX import объектов и рисков.

Не готовы как фактическое evidence:

- результаты 1–3 реальных pilot source inventories;
- подтверждённая стоимость ручной выгрузки;
- требуемая freshness;
- repeat demand между независимыми компаниями;
- customer-approved SaaS/on-prem data boundary;
- доступ к поддерживаемой API version и read-only account;
- synthetic/vendor test environment;
- owner и acceptance criteria первого connector prototype.

Архитектура готова принять обоснованный выбор позже, но не должна создавать
ложную срочность реализации.

---

## 3. Admission Gate Result

Gate из `RUSSIAN_MARKET_CONNECTOR_SHORTLIST.md` проверен полностью:

| Criterion | Требование | Evidence | Результат |
|---|---|---|---|
| Independent demand | 2 pilots или 1 strategic + approval | Source cards отсутствуют | FAIL / NO DATA |
| Demand score | 5 факторов с observation | `PILOT DATA PENDING` | FAIL / NO DATA |
| Real feasibility | Фактическая version/deployment | Только desk research | FAIL / NO DATA |
| Decision value | Подтверждено пользователем | Нет interview evidence | FAIL / NO DATA |
| Manual burden | Измерен текущий цикл | Нет time measurement | FAIL / NO DATA |
| Stable identity | Проверена на sample payload | Только documentation hypothesis | PENDING |
| Read-only access | Account + API/test environment | Не предоставлены | FAIL / NO DATA |
| Deployment path | SaaS или collector согласован | Не определён | FAIL / NO DATA |
| T005 security fit | Проверен на source version | Contract готов, runtime test отсутствует | PENDING |
| Import comparison | Connector лучше export по value/cost | Не измерено | FAIL / NO DATA |
| Acceptance owner | Назначен customer/product owner | Не назначен | FAIL / NO DATA |

Ни один candidate не проходит gate. `PENDING` не интерпретируется как ноль или
положительный результат.

---

## 4. Рассмотренные Варианты

### Option A — Выбрать Zabbix

**За:** лучший общий research priority, documented host API, stable source
`hostid`, узкий foundation-compatible contract.

**Почему не выбран:** нет подтверждённого customer demand; production source
обычно находится в private network, а collector/egress architecture ещё не
утверждена. Feasibility `10/12` является desk score, не pilot evidence.

### Option B — Выбрать Kaspersky Security Center

**За:** endpoint/software/protection coverage хорошо усиливает Trust Passport;
официальный Open API документирован.

**Почему не выбран:** нет данных о customer version, license/API availability,
read-only role, private network path и требуемом наборе полей.

### Option C — Выбрать MaxPatrol VM

**За:** vulnerability evidence непосредственно связано с Trust Score и Risk
candidates; HTTPS API существует.

**Почему не выбран:** нет test environment, actual supported schema, finding
volume, commercial access и подтверждённой ценности live API против export.

### Option D — Выбрать Wazuh

**За:** открытая API documentation, agents/status/OS дают понятный первый
contract и пригодны для synthetic testing.

**Почему не выбран:** testability продукта не равна спросу российского ICP;
private manager, TLS и least-privilege RBAC требуют проверки на реальном
deployment.

### Option E — Выбрать Yandex Cloud Как Самый SaaS-Compatible

**За:** public HTTPS API, service account, stable resource IDs и высокая desk
feasibility `11/12`.

**Почему не выбран:** отсутствует segment signal, что cloud inventory является
главным blocker первых клиентов. Техническая простота не заменяет product value.

### Option F — Продолжить Через CSV/XLSX

**За:** путь уже реализован, протестирован и поддерживает source metadata,
preview, partial success, duplicate detection и audit. Он позволяет измерить
manual burden и data quality до создания connector runtime.

**Минус:** данные обновляются вручную и могут терять freshness.

**Решение:** выбран Option F до появления admission evidence.

---

## 5. Что Означает DEFER

`DEFER` означает:

- первый vendor/source не назначен;
- Zabbix остаётся research priority #1, но не implementation commitment;
- KSC, MaxPatrol VM и Wazuh остаются первой validation wave;
- CSV/XLSX import продолжает обслуживать pilots;
- source inventory собирается по утверждённой карточке;
- будущий connector task не создаётся до reopening trigger;
- T008 может завершить Foundation Documentation Sync без runtime;
- Connector Foundation Ready означает готовность contracts, а не наличие
  production integration.

`DEFER` не означает отказ от Evidence-first стратегии. Напротив, импорт даёт
первые реальные source/evidence observations, на которых можно проверить
следующую инвестицию.

---

## 6. Что Не Реализуется

В результате T007 не создаются:

- connector adapter или registry entry;
- `lib/connectors/` runtime;
- Vault provisioning;
- connector/evidence SQL migrations;
- scheduler, queue или worker;
- on-prem collector;
- connector settings UI;
- vendor SDK dependency;
- API credentials или test secrets;
- обещание connector в pilot/commercial materials.

Текущие `objects`, `risks`, Trust Score и import flow не меняются.

---

## 7. Reopening Triggers

Решение пересматривается, когда выполнено хотя бы одно условие:

1. Два независимых pilots заполнили source cards для одной source family.
2. Один strategic pilot имеет высокий decision value, product owner approval и
   готов предоставить test access.
3. CSV/XLSX onboarding измеримо блокирует critical decision из-за freshness,
   объёма или ошибок.

Любой trigger только открывает review; он не выбирает connector автоматически.

---

## 8. Required Evidence Package

Перед новым decision review нужны:

```text
Pilot aliases:
Actual vendor/product versions:
Decision supported:
Demand score with observations:
Manual hours per update:
Required freshness:
Approximate records/findings:
Stable external identity sample:
Current export/API path:
Read-only role available:
SaaS/on-prem/isolated boundary:
Test environment owner:
Customer acceptance owner:
Evidence location:
```

Реальные customer names, endpoints, credentials и identifiers не хранятся в
Git.

---

## 9. Decision Algorithm При Пересмотре

1. Отфильтровать candidates, не прошедшие T006 admission и T005 security gates.
2. Сравнить validated demand, а не число mentions.
3. Проверить, решает ли connector проблему лучше улучшенного export/template.
4. Выбрать минимальный read-only contract с одной source family.
5. При равной ценности выбрать меньший runtime/deployment scope.
6. Зафиксировать source/version/auth/endpoints/limits/identity/acceptance в новом
   implementation decision.
7. Начать с manual bounded pull; schedule добавлять после runtime validation.

Нельзя усреднять разные продукты в один adapter: AD и FreeIPA, VMware и Proxmox,
KSC и Wazuh имеют разные protocols, identities и security boundaries.

---

## 10. Interim Pilot Workflow

До пересмотра решения:

```text
получить approved CSV/XLSX export
  -> заполнить source metadata
  -> preview и validation
  -> import в tenant
  -> проверить duplicates/mapping
  -> использовать Trust Passport/Score/Risks/Reports
  -> измерить manual effort и freshness gap
  -> заполнить source card
  -> обновить demand/feasibility score
```

Если export нестабилен, сначала создаётся source-specific template/mapping note.
Это дешевле и безопаснее, чем generic connector без подтверждённого contract.

---

## 11. Consequences

### Положительные

- команда не тратит Sprint на неподтверждённую интеграцию;
- архитектура и security model не искажаются под случайный test source;
- CSV/XLSX остаётся работающим коммерческим onboarding path;
- следующий выбор получает измеримые demand и deployment evidence;
- vendor promise не появляется раньше test access и acceptance owner.

### Ограничения

- automatic freshness пока недоступна;
- source status обновляется только при новом import;
- не проверены реальные performance/API/version constraints;
- pilot может выявить необходимость collector до connector adapter.

Ограничения принимаются осознанно и фиксируются как Post-MVP decision debt.

---

## 12. Handoff

Следующая задача Sprint 15 — S15-T008 Documentation Sync. Она должна:

- связать все T001–T007 contracts и decision records;
- зафиксировать milestone `Connector Foundation Ready / Runtime Deferred`;
- сохранить `PILOT DATA PENDING` без ложного PASS;
- не создавать implementation Sprint без reopening evidence.

После T008 Sprint 15 может завершиться архитектурно, даже если первый connector
не выбран: его отсутствие является утверждённым результатом T007.

---

## 13. Связанные Документы

- [RUSSIAN_MARKET_CONNECTOR_SHORTLIST.md](RUSSIAN_MARKET_CONNECTOR_SHORTLIST.md)
  — research ranking и admission gate.
- [PILOT_METRICS_FEEDBACK_LOOP.md](PILOT_METRICS_FEEDBACK_LOOP.md) — demand и
  feasibility evidence model.
- [EVIDENCE_FIRST_STRATEGY.md](EVIDENCE_FIRST_STRATEGY.md) — product direction.
- [Connector_Framework_Architecture.md](../architecture/Connector_Framework_Architecture.md)
  — runtime boundary.
- [CONNECTOR_SECURITY_MODEL.md](../security/CONNECTOR_SECURITY_MODEL.md) —
  security gates.
- [IMPORT_GUIDE.md](../user/IMPORT_GUIDE.md) — действующий onboarding path.
- [SPRINT_15.md](../../tasks/SPRINT_15.md) — Sprint status и Definition of Done.

---

## 14. Final Decision

```text
FIRST CONNECTOR: NOT SELECTED
DECISION: DEFER
ACTIVE DATA PATH: CSV/XLSX IMPORT
REVIEW: AFTER PILOT ADMISSION EVIDENCE
RUNTIME/MIGRATIONS: NOT AUTHORIZED
```

Решение сохраняет Evidence-first направление и завершает S15-T007 без
преждевременной реализации.
