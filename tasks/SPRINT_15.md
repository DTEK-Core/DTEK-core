# SPRINT 15 — First Connector Prototype

`Проект: DTEK Core`  
`Спринт: 15`  
`Тип: Post-Market MVP Integration Sprint`  
`Основа: Sprint 14, ADR-006, pilot feedback`  
`Статус: 📋 Условно запланирован`

---

## 1. Цель Спринта

Реализовать первый внешний источник данных только после подтверждения его ценности интервью или пилотами.

Sprint 15 не выбирает коннектор заранее. Он фиксирует процесс и архитектурные ограничения первого connector prototype.

---

## 2. Место В Roadmap

| Параметр | Значение |
|---|---|
| Фаза | Post-Market MVP / Integration Ready |
| Предыдущий Sprint | Sprint 14 — Pilot Readiness |
| Следующий этап | Commercial MVP iteration или Enterprise Discovery |
| Milestone | Integration Ready |

---

## 3. Бизнес-Ценность

Первые интеграции должны снижать ручной труд и повышать ценность Trust Score. Неверно выбранный коннектор потратит время и усложнит архитектуру без пользы рынку.

---

## 4. Scope / Non-Scope

### Входит

- connector selection based on evidence;
- integration architecture decision;
- один prototype connector;
- import mapping;
- audit and error handling;
- documentation.

### Не входит

- connector marketplace;
- несколько коннекторов одновременно;
- агент на инфраструктуру клиента;
- realtime ingestion;
- SIEM replacement;
- broad ETL platform.

---

## 5. Возможные Кандидаты

Выбирается один:

- VM/scanner CSV/API import;
- CMDB import;
- AD/LDAP identity import;
- SIEM event import;
- Jira/ServiceDesk export;
- lightweight webhook/API.

---

## 6. Задачи Спринта

| ID | Задача | Приоритет | Оценка | Зависимости |
|---|---|---|---|---|
| S15-T001 | Connector Selection Report | P1 | S | S14 + pilot feedback |
| S15-T002 | Connector Architecture Decision | P1 | M | T001 |
| S15-T003 | Data Mapping Specification | P1 | M | T001, T002 |
| S15-T004 | Connector Prototype Implementation | P1 | L | T002, T003 |
| S15-T005 | Connector Error Handling & Audit | P1 | M | T004 |
| S15-T006 | Connector Security Review | P1 | M | T004 |
| S15-T007 | Connector Documentation | P1 | S | T004–T006 |
| S15-T008 | Connector Pilot Test | P1 | M | T004–T007 |

---

## 7. Порядок Выполнения

```text
День 1
  S15-T001 Connector Selection Report
  S15-T002 Architecture Decision

День 2
  S15-T003 Data Mapping Specification

День 3–5
  S15-T004 Prototype Implementation
  S15-T005 Error Handling & Audit

День 6
  S15-T006 Security Review
  S15-T007 Documentation
  S15-T008 Pilot Test
```

---

## 8. Детализация Задач

### S15-T001 — Connector Selection Report

**Описание:** на основе интервью и пилотов выбрать один источник данных.

**Ожидаемый результат:** есть обоснование, почему выбран именно этот коннектор.

### S15-T002 — Connector Architecture Decision

**Описание:** определить способ подключения без нарушения архитектуры.

**Ожидаемый результат:** documented decision: CSV/API/webhook/manual sync, auth, storage of secrets, schedule.

### S15-T003 — Data Mapping Specification

**Описание:** сопоставить поля внешнего источника с объектами, рисками, факторами Trust Score.

**Ожидаемый результат:** mapping spec и правила обработки неизвестных значений.

### S15-T004 — Connector Prototype Implementation

**Описание:** реализовать минимальный рабочий prototype.

**Ожидаемый результат:** данные попадают в DTEK Core и участвуют в Trust Score/рисках согласно mapping.

### S15-T005 — Connector Error Handling & Audit

**Описание:** обработать ошибки импорта и логировать connector events.

**Ожидаемый результат:** пользователь видит статус синхронизации, ошибки не раскрывают секреты.

### S15-T006 — Connector Security Review

**Описание:** проверить secrets, RBAC, RLS, tenant isolation и safe failure.

**Ожидаемый результат:** security checklist пройден до пилотного использования.

### S15-T007 — Connector Documentation

**Описание:** описать настройку и ограничения connector prototype.

**Ожидаемый результат:** dev/user docs обновлены.

### S15-T008 — Connector Pilot Test

**Описание:** проверить prototype на демо или пилотных данных.

**Ожидаемый результат:** есть вывод: масштабировать, доработать или отказаться.

---

## 9. Definition Of Done

- [ ] Коннектор выбран на основе evidence.
- [ ] Архитектурное решение зафиксировано.
- [ ] Mapping описан.
- [ ] Prototype работает на тестовых данных.
- [ ] RBAC/RLS/security review выполнен.
- [ ] Документация обновлена.
- [ ] `npm run type-check` проходит.
- [ ] `npm run lint` проходит.
- [ ] `npm run build` проходит.

---

## 10. Риски

| Риск | Вероятность | Влияние | Митигирование |
|---|---|---|---|
| Коннектор выбран без рыночного сигнала | Средняя | Высокое | Sprint 15 начинается только после pilot feedback |
| Интеграция усложнит архитектуру | Средняя | Высокое | Один prototype, без connector framework |
| Секреты попадут в клиент | Низкая | Критическое | Secrets только server-side |

