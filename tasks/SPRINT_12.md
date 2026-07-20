# SPRINT 12 — Evidence-backed Trust Explainability

`Проект: DTEK Core`  
`Спринт: 12`  
`Тип: Market MVP Feature Sprint`  
`Основа: Sprint 11, Trust_Score_Model_v2.md, ADR-001, ADR-007`  
`Статус: 🧪 Реализация завершена, ожидается ручная приёмка`

---

## 1. Цель Спринта

Сделать Trust Score объяснимым для CISO и аналитика ИБ через факторы, риски, историю изменений и source/evidence context.

Пользователь должен понимать не только число, но и причины:

```text
Почему Score такой?
Какие факторы давят сильнее всего?
Какие риски исправить первыми?
Какие источники подтверждают данные?
Что изменится после закрытия риска?
```

---

## 2. Место В Roadmap

| Параметр | Значение |
|---|---|
| Фаза | Market MVP |
| Предыдущий Sprint | Sprint 11 — Evidence Import & Data Onboarding |
| Следующий Sprint | Sprint 13 — Evidence-aware Risk Workflow |
| Milestone | Evidence-backed Explainability Ready |

---

## 3. Бизнес-Ценность

Trust Score без объяснения может восприниматься как произвольная оценка. Evidence-backed explainability превращает Trust Score в управленческий инструмент: пользователь видит не только число, но и происхождение данных.

---

## 4. Scope / Non-Scope

### Входит

- top score drivers;
- factor reason cards;
- risk impact hint;
- score delta explanation;
- source/evidence context;
- user-facing explanation copy.

### Не входит

- ML/AI scoring;
- автоматические remediation playbooks;
- rule engine;
- изменение формулы Trust Score;
- новые факторы.

---

## 5. Задачи Спринта

| ID | Задача | Приоритет | Оценка | Зависимости | Статус |
|---|---|---|---|---|---|
| S12-T001 | Evidence-backed Explainability Model Specification | P1 | M | S11 | ✅ Завершено |
| S12-T002 | Top Score Drivers for Object Passport | P1 | M | T001 | ✅ Завершено |
| S12-T003 | Factor Reason Cards With Sources | P1 | M | T001 | ✅ Завершено |
| S12-T004 | Risk Impact Hint | P1 | M | T001 | ✅ Завершено |
| S12-T005 | Score Delta Explanation With Evidence Timeline | P2 | M | T001 | ✅ Завершено |
| S12-T006 | Dashboard Explainability Summary | P2 | S | T002–T004 | ✅ Завершено |
| S12-T007 | User Documentation: Why This Score | P1 | S | T001–T006 | ✅ Завершено |
| S12-T008 | Explainability QA Checklist | P1 | S | T002–T007 | ✅ Завершено |

---

## 6. Порядок Выполнения

```text
День 1
  S12-T001 Explainability Model Specification

День 2
  S12-T002 Top Score Drivers
  S12-T003 Factor Reason Cards

День 3
  S12-T004 Risk Impact Hint
  S12-T005 Score Delta Explanation

День 4
  S12-T006 Dashboard Summary
  S12-T007 Documentation
  S12-T008 QA Checklist
```

---

## 7. Детализация Задач

### S12-T001 — Evidence-backed Explainability Model Specification

**Описание:** определить, какие причины Trust Score показываются пользователю и как они рассчитываются из существующих данных, import source и будущих evidence records.

**Ожидаемый результат:** спецификация explainability без изменения ADR-001.

**Решение:** создан `docs/architecture/Evidence_Explainability_Model.md`. Спецификация фиксирует четырёхуровневую модель объяснения, канонический read model, factor arithmetic, top drivers относительно neutral reference 70, counterfactual risk impact, score delta contract, source/evidence context, empty/error states и требования RBAC/multi-tenant isolation. `confidence` остаётся metadata и не влияет на Score; import source context явно отделён от будущего Evidence Layer. Формула ADR-001, схема БД, зависимости и Trust Score Engine не изменены.

### S12-T002 — Top Score Drivers

**Описание:** показать главные причины снижения или роста Trust Score на странице объекта/паспорта.

**Ожидаемый результат:** пользователь видит 3–5 ключевых факторов влияния.

**Решение:** в Trust Passport добавлен блок «Ключевые факторы оценки» с максимум пятью материальными drivers, отсортированными по абсолютному взвешенному отклонению от neutral reference 70. Для каждого фактора показываются score, актуальный вес организации, направление и вклад с точностью до одного знака; при отсутствии отклонений отображается честное neutral state. Расчёт вынесен в pure-модуль `lib/trust/explainability.ts`, покрыт contract-тестами и использует стабильный порядок ADR-001. Passport report service теперь получает текущий `trust_factor_config`, а единый fallback весов переиспользуется Trust Engine. Risk-level причины и source context реализованы в S12-T003, counterfactual impact — в S12-T004.

### S12-T003 — Factor Reason Cards With Sources

**Описание:** для каждого фактора показать понятное объяснение: base, penalties, бонусы, связанные риски и источники данных.

**Ожидаемый результат:** факторная оценка становится прозрачной.

**Решение:** компактный factor breakdown Trust Passport заменён шестью раскрываемыми reason cards. В свёрнутом состоянии каждая карточка показывает factor score, вес, взвешенный вклад и полную арифметику `base − penalties + bonus = factor score`; в деталях — только реально влияющие активные риски, applied penalty, clamp/consistency state и дедуплицированный source context объекта и рисков. Import metadata читается строгим parser из последнего trailing `[Import Source]` block, malformed metadata безопасно получает manual fallback, а `source_record_id` не выводится в UI. Расчёт переиспользует общие helper-функции Trust Score Engine, не меняет формулу ADR-001 и покрыт contract-тестами. Read model строится в существующем tenant-scoped report service с дополнительной проверкой `risks.organization_id`; новых привилегий, миграций и зависимостей нет. Counterfactual risk impact добавлен в S12-T004.

### S12-T004 — Risk Impact Hint

**Описание:** показать ориентировочный эффект закрытия риска.

**Ожидаемый результат:** в Risk Drawer/Passport видно “закрытие риска может дать +N к Trust Score”.

**Решение:** добавлен pure counterfactual расчёт `current = calcTrustScore(all risks)` и `projected = calcTrustScore(without target risk)` через существующий Trust Score Engine с актуальными весами организации, completeness, category mapping, distributed penalties, clamp и финальным округлением ADR-001. В Risk Drawer эффект показывается отдельно для каждого связанного объекта; Trust Passport и printable Passport получают компактную подсказку по каждому риску. Поддержаны состояния `potential_gain`, `no_rounded_change`, `inactive` и отсутствие связи, а формулировки подчёркивают ориентировочный характер результата. Прежняя фиктивная оценка `CVSS × 2` и недостоверное обещание снять ограничение сегмента удалены. Read model строится server-side только из объектов и рисков текущей организации; новых записей, привилегий, миграций и зависимостей нет. Contract-тесты фиксируют custom weights, inactive risks, distributed penalties, clamp и округление. Историческое объяснение добавлено в S12-T005 в пределах данных текущей схемы.

### S12-T005 — Score Delta Explanation With Evidence Timeline

**Описание:** объяснить последнее изменение Trust Score по истории.

**Ожидаемый результат:** пользователь видит фактическое изменение Score, доступные изменения факторов и границу между историческим событием и текущим source/evidence context.

**Решение:** Trust Passport получил блок «Почему изменился Score» с последней фактической delta, причиной расчёта, безопасной ролью инициатора, датой и раскрываемой историей до пяти событий. Для каждой записи factor delta строится только по двум последовательным полным `factors_snapshot`; первая или повреждённая запись получает честный fallback без реконструкции причинности. Текущие import/manual sources дедуплицируются, сортируются по дате сбора и показываются отдельной timeline с явным предупреждением, что близость дат не доказывает причину изменения. Printable Passport содержит ту же сводку. Tenant-scoped report service запрашивает историю по `object_id + organization_id`, не передаёт клиенту raw `changed_by`, `source_record_id` или исходный snapshot. Формула ADR-001, схема БД, RLS/RBAC, зависимости и права записи не изменены; исторические веса и связь history → evidence остаются ограничением текущей схемы.

### S12-T006 — Dashboard Explainability Summary

**Описание:** добавить краткое объяснение состояния организации на Dashboard.

**Ожидаемый результат:** Dashboard отвечает на вопрос “что сейчас сильнее всего снижает доверие”.

**Решение:** Dashboard получил компактную сводку трёх главных отрицательных факторов организации. Pure aggregation повторно использует object-level `neutral_delta` S12-T002, исключает neutral/positive factors, группирует отрицательные drivers по каноническим факторам и ранжирует их по сумме абсолютных отклонений; отдельный организационный scoring algorithm не создаётся. Для каждого фактора показываются текущий вес, количество и доля затронутых паспортов, среднее отклонение среди них и объект с наибольшим отрицательным влиянием со ссылкой на Trust Passport. Поддержаны состояния отсутствующих паспортов и отсутствия материального снижения. Read model включает только неархивные объекты текущей организации, дополнительно проверяет `trust_passports.organization_id` и использует текущий `trust_factor_config` с fallback ADR-001. Объектные KPI, distribution, top-5 и explainability теперь строятся из одного tenant-scoped набора, что сокращает Dashboard с тринадцати до семи параллельных запросов. Формула Trust Score, схема БД, RLS/RBAC и зависимости не изменены.

### S12-T007 — User Documentation

**Описание:** обновить guide по Trust Score и FAQ.

**Ожидаемый результат:** пользовательская документация объясняет новую логику.

**Решение:** обновлены `docs/user/TRUST_SCORE_GUIDE.md`, `docs/user/FAQ.md` и `docs/user/USER_GUIDE.md`. Пользовательская документация теперь объясняет, как читать ключевые факторы оценки относительно reference 70, reason cards с base/penalties/bonus/contribution, source context и его отличие от будущих evidence records, фактическую историю «Почему изменился Score», counterfactual Risk Impact Hint и Dashboard summary «Что снижает доверие». Документы подчёркивают ограничения Market MVP: explainability не меняет формулу ADR-001, `confidence` не влияет на Score, impact hint является ориентиром, а source dates не доказывают причинность конкретного изменения. README, Documentation Index, Roadmap, Sprint Roadmap, CHANGELOG и AGENTS синхронизированы.

### S12-T008 — Explainability QA Checklist

**Описание:** проверить корректность причин на демо-данных и импортированных данных.

**Ожидаемый результат:** чеклист исключает расхождения UI и формулы.

**Решение:** создан `docs/testing/EXPLAINABILITY_QA_CHECKLIST.md` — воспроизводимая ручная приёмка полного Sprint 12. Чеклист включает эталонный объект со Score 63 и проверкой factor arithmetic, Top Drivers, custom weights, active/inactive risks, clamp и rounding, counterfactual Risk Impact Hint, фактическую Score Delta Timeline, manual/imported/malformed source states, Dashboard aggregation, regression импорта Sprint 11, четыре роли, tenant isolation, safe error states, mobile/desktop UI и сверку пользовательской документации. Инженерные contract-тесты отделены от authenticated manual QA; milestone закрывается только после заполнения итогового протокола владельцем проекта.

---

## 8. Definition Of Done

- [x] Trust Score имеет объяснение на уровне объекта.
- [x] Факторы имеют reason cards.
- [x] В объяснении есть source/evidence context там, где он доступен.
- [x] Risk impact показывается пользователю.
- [x] Последнее изменение Score объясняется по фактической истории и доступным factor snapshots.
- [x] Dashboard показывает summary причин.
- [x] Формула Trust Score не изменена.
- [x] Документация обновлена.
- [x] Explainability QA checklist подготовлен.
- [ ] Ручная приёмка по checklist завершена без Blocker/Critical замечаний.
- [x] `npm run type-check` проходит.
- [x] `npm run lint` проходит.
- [x] `npm run build` проходит.

---

## 9. Риски

| Риск | Вероятность | Влияние | Митигирование |
|---|---|---|---|
| Explainability начнёт спорить с формулой | Средняя | Высокое | Опираемся только на `lib/trust/calculate.ts` |
| UI станет перегруженным | Средняя | Среднее | Показывать top drivers, детали раскрывать |
| Пользователь примет impact как гарантию | Средняя | Среднее | Писать “ориентировочно” |
