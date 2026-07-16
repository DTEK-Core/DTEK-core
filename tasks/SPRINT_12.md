# SPRINT 12 — Evidence-backed Trust Explainability

`Проект: DTEK Core`  
`Спринт: 12`  
`Тип: Market MVP Feature Sprint`  
`Основа: Sprint 11, Trust_Score_Model_v2.md, ADR-001, ADR-007`  
`Статус: 🚧 В работе`

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
| S12-T002 | Top Score Drivers for Object Passport | P1 | M | T001 | 📋 Запланировано |
| S12-T003 | Factor Reason Cards With Sources | P1 | M | T001 | 📋 Запланировано |
| S12-T004 | Risk Impact Hint | P1 | M | T001 | 📋 Запланировано |
| S12-T005 | Score Delta Explanation With Evidence Timeline | P2 | M | T001 | 📋 Запланировано |
| S12-T006 | Dashboard Explainability Summary | P2 | S | T002–T004 | 📋 Запланировано |
| S12-T007 | User Documentation: Why This Score | P1 | S | T001–T006 | 📋 Запланировано |
| S12-T008 | Explainability QA Checklist | P1 | S | T002–T007 | 📋 Запланировано |

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

### S12-T003 — Factor Reason Cards With Sources

**Описание:** для каждого фактора показать понятное объяснение: base, penalties, бонусы, связанные риски и источники данных.

**Ожидаемый результат:** факторная оценка становится прозрачной.

### S12-T004 — Risk Impact Hint

**Описание:** показать ориентировочный эффект закрытия риска.

**Ожидаемый результат:** в Risk Drawer/Passport видно “закрытие риска может дать +N к Trust Score”.

### S12-T005 — Score Delta Explanation With Evidence Timeline

**Описание:** объяснить последнее изменение Trust Score по истории.

**Ожидаемый результат:** пользователь понимает, почему Score изменился с прошлого расчёта и какие source/evidence это вызвали.

### S12-T006 — Dashboard Explainability Summary

**Описание:** добавить краткое объяснение состояния организации на Dashboard.

**Ожидаемый результат:** Dashboard отвечает на вопрос “что сейчас сильнее всего снижает доверие”.

### S12-T007 — User Documentation

**Описание:** обновить guide по Trust Score и FAQ.

**Ожидаемый результат:** пользовательская документация объясняет новую логику.

### S12-T008 — Explainability QA Checklist

**Описание:** проверить корректность причин на демо-данных и импортированных данных.

**Ожидаемый результат:** чеклист исключает расхождения UI и формулы.

---

## 8. Definition Of Done

- [ ] Trust Score имеет объяснение на уровне объекта.
- [ ] Факторы имеют reason cards.
- [ ] В объяснении есть source/evidence context там, где он доступен.
- [ ] Risk impact показывается пользователю.
- [ ] Dashboard показывает summary причин.
- [ ] Формула Trust Score не изменена.
- [ ] Документация обновлена.
- [ ] `npm run type-check` проходит.
- [ ] `npm run lint` проходит.
- [ ] `npm run build` проходит.

---

## 9. Риски

| Риск | Вероятность | Влияние | Митигирование |
|---|---|---|---|
| Explainability начнёт спорить с формулой | Средняя | Высокое | Опираемся только на `lib/trust/calculate.ts` |
| UI станет перегруженным | Средняя | Среднее | Показывать top drivers, детали раскрывать |
| Пользователь примет impact как гарантию | Средняя | Среднее | Писать “ориентировочно” |
