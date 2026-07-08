# SPRINT 11 — Import & Data Onboarding

`Проект: DTEK Core`  
`Спринт: 11`  
`Тип: Market MVP Feature Sprint`  
`Основа: Sprint 10, PRODUCT_STRATEGY.md, ROADMAP.md`  
`Статус: 📋 Запланирован`

---

## 1. Цель Спринта

Убрать главный барьер пилотов: ручное заполнение объектов и рисков.

Sprint 11 должен позволить загрузить 50–200 активов и 20–100 рисков из CSV без миграций, коннекторов и изменения архитектуры.

---

## 2. Место В Roadmap

| Параметр | Значение |
|---|---|
| Фаза | Market MVP |
| Предыдущий Sprint | Sprint 10 — Reporting & Export |
| Следующий Sprint | Sprint 12 — Trust Explainability |
| Milestone | Data Onboarding Ready |

---

## 3. Бизнес-Ценность

Первые пользователи почти всегда имеют исходные данные в Excel/CSV. CSV import позволяет провести пилот без интеграций и доказать ценность продукта на реальных данных клиента.

---

## 4. Scope / Non-Scope

### Входит

- CSV import объектов;
- CSV import рисков;
- validation preview;
- import error report;
- sample templates;
- безопасный rollback/partial success подход.

### Не входит

- прямые коннекторы к SIEM/VM/CMDB;
- background queue;
- сложный ETL;
- auto-discovery активов;
- drag-and-drop spreadsheet editor.

---

## 5. Задачи Спринта

| ID | Задача | Приоритет | Оценка | Зависимости |
|---|---|---|---|---|
| S11-T001 | CSV Schema Specification | P1 | S | S09, S10 |
| S11-T002 | Objects CSV Import | P1 | L | T001 |
| S11-T003 | Risks CSV Import | P1 | L | T001 |
| S11-T004 | Import Preview & Validation Errors | P1 | M | T002, T003 |
| S11-T005 | Import Templates | P1 | S | T001 |
| S11-T006 | Import Audit Events | P1 | S | T002, T003 |
| S11-T007 | Import Documentation | P1 | S | T001–T006 |
| S11-T008 | Data Onboarding Smoke Test | P1 | S | T002–T007 |

---

## 6. Порядок Выполнения

```text
День 1
  S11-T001 CSV Schema Specification
  S11-T005 Import Templates

День 2–3
  S11-T002 Objects CSV Import
  S11-T004 Import Preview & Validation Errors

День 4–5
  S11-T003 Risks CSV Import
  S11-T006 Import Audit Events

День 6
  S11-T007 Documentation
  S11-T008 Smoke Test
```

---

## 7. Детализация Задач

### S11-T001 — CSV Schema Specification

**Описание:** определить обязательные и опциональные колонки для объектов и рисков.

**Ожидаемый результат:** зафиксирован CSV contract без изменения схемы БД.

### S11-T002 — Objects CSV Import

**Описание:** реализовать загрузку объектов с server-side validation и RBAC.

**Ожидаемый результат:** owner/analyst/admin в рамках ADR-003 могут импортировать разрешённые объекты.

### S11-T003 — Risks CSV Import

**Описание:** реализовать загрузку рисков и опциональную привязку к объектам по внешнему ключу/имени.

**Ожидаемый результат:** риски создаются с категориями, severity, status, due date и связями.

### S11-T004 — Import Preview & Validation Errors

**Описание:** перед созданием показать количество валидных строк и ошибки.

**Ожидаемый результат:** пользователь видит, что будет импортировано, и может исправить CSV.

### S11-T005 — Import Templates

**Описание:** подготовить шаблоны CSV для объектов и рисков.

**Ожидаемый результат:** пользователь может скачать/открыть пример структуры.

### S11-T006 — Import Audit Events

**Описание:** логировать импорт чувствительных данных.

**Ожидаемый результат:** audit log фиксирует импорт, количество строк и инициатора.

### S11-T007 — Import Documentation

**Описание:** описать формат CSV, ошибки и ограничения.

**Ожидаемый результат:** обновлены user docs, FAQ и troubleshooting при необходимости.

### S11-T008 — Data Onboarding Smoke Test

**Описание:** проверить импорт 50+ объектов и 20+ рисков.

**Ожидаемый результат:** после импорта работают Dashboard, Objects, Risks, Passport и Graph.

---

## 8. Definition Of Done

- [ ] Objects CSV import работает.
- [ ] Risks CSV import работает.
- [ ] Есть preview и ошибки валидации.
- [ ] Есть шаблоны CSV.
- [ ] Audit events фиксируются.
- [ ] Trust Score пересчитывается после импорта.
- [ ] Документация обновлена.
- [ ] `npm run type-check` проходит.
- [ ] `npm run lint` проходит.
- [ ] `npm run build` проходит.

---

## 9. Риски

| Риск | Вероятность | Влияние | Митигирование |
|---|---|---|---|
| CSV формат станет слишком сложным | Средняя | Среднее | Минимальный обязательный набор колонок |
| Импорт создаст дубли | Средняя | Среднее | external_id/name matching strategy |
| Ошибка импорта нарушит tenant isolation | Низкая | Критическое | Server-side org checks + RLS |

