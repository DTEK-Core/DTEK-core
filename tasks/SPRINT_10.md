# SPRINT 10 — Reporting & Export

`Проект: DTEK Core`  
`Спринт: 10`  
`Тип: Market MVP Feature Sprint`  
`Основа: Sprint 09, ROADMAP.md, MVP_RELEASE_PLAN.md R6, ADR-007`  
`Статус: 📋 Запланирован`

---

## 1. Цель Спринта

Дать CISO и аналитикам ИБ экспортируемые артефакты: Trust Passport PDF, Risk Registry CSV и executive report по организации.

Отчёты должны быть совместимы с Evidence-first концепцией: если у данных есть источник или evidence, отчёт должен уметь показать это без изменения текущей бизнес-логики.

---

## 2. Место В Roadmap

| Параметр | Значение |
|---|---|
| Фаза | Market MVP |
| Предыдущий Sprint | Sprint 09 — Market MVP Packaging |
| Следующий Sprint | Sprint 11 — Evidence Import & Data Onboarding |
| Milestone | Reporting Ready |

---

## 3. Бизнес-Ценность

Без отчётов DTEK Core остаётся интерфейсом. С отчётами он становится инструментом, результат которого можно показать руководству, аудитору или пилотной команде клиента.

---

## 4. Scope / Non-Scope

### Входит

- PDF export Trust Passport;
- CSV export Risk Registry;
- executive organization report;
- report metadata;
- source/evidence placeholders in report structure;
- user documentation.

### Не входит

- сложный report designer;
- scheduled reports;
- BI-конструктор;
- email delivery reports;
- enterprise branding.

---

## 5. Задачи Спринта

| ID | Задача | Приоритет | Оценка | Зависимости |
|---|---|---|---|---|
| S10-T001 | Reporting Architecture Decision | P1 | S | S09 |
| S10-T002 | Trust Passport PDF Export | P1 | L | T001 |
| S10-T003 | Risk Registry CSV Export | P1 | M | T001 |
| S10-T004 | Executive Organization Report | P1 | L | T001 |
| S10-T005 | Report Access Control & Audit Events | P1 | M | T002–T004 |
| S10-T006 | Report Empty/Error States | P2 | S | T002–T004 |
| S10-T007 | User Documentation: Reports & Export | P1 | S | T002–T006 |
| S10-T008 | Reporting Smoke Test Checklist | P1 | S | T002–T007 |

---

## 6. Порядок Выполнения

```text
День 1
  S10-T001 Reporting Architecture Decision
  S10-T003 Risk Registry CSV Export

День 2–3
  S10-T002 Trust Passport PDF Export
  S10-T005 Access Control & Audit Events

День 4
  S10-T004 Executive Organization Report
  S10-T006 Empty/Error States

День 5
  S10-T007 User Documentation
  S10-T008 Smoke Test Checklist
```

---

## 7. Детализация Задач

### S10-T001 — Reporting Architecture Decision

**Описание:** выбрать реализацию отчётов без смены стека: server route, Server Action, HTML-to-PDF или библиотека генерации.

**Ожидаемый результат:** зафиксирован способ генерации PDF/CSV, ограничения и безопасность.

### S10-T002 — Trust Passport PDF Export

**Описание:** добавить экспорт паспорта доверия объекта в PDF.

**Ожидаемый результат:** PDF содержит реквизиты объекта, Trust Score, факторную разбивку, риски, дату генерации, source/evidence section placeholder и branding DTEK Core.

### S10-T003 — Risk Registry CSV Export

**Описание:** экспортировать текущий набор рисков с фильтрами.

**Ожидаемый результат:** CSV с полями риска, статусом, severity, linked objects, due date и owner.

### S10-T004 — Executive Organization Report

**Описание:** создать управленческий отчёт по организации для CISO.

**Ожидаемый результат:** отчёт включает org Trust Score, топ рисковых объектов, распределение доверия, критические риски, source coverage placeholder и summary.

### S10-T005 — Report Access Control & Audit Events

**Описание:** проверить RBAC и логировать экспорт чувствительных отчётов.

**Ожидаемый результат:** export доступен только разрешённым ролям; события фиксируются в audit log.

### S10-T006 — Report Empty/Error States

**Описание:** обработать пустые данные, недоступный объект, ошибку генерации.

**Ожидаемый результат:** пользователь получает понятное сообщение без внутренних ошибок.

### S10-T007 — User Documentation

**Описание:** описать, какие отчёты существуют и как их использовать.

**Ожидаемый результат:** обновлены user docs и FAQ.

### S10-T008 — Reporting Smoke Test Checklist

**Описание:** подготовить smoke test экспорта.

**Ожидаемый результат:** чеклист проверяет PDF, CSV, RBAC, audit и mobile/desktop UI.

---

## 8. Definition Of Done

- [ ] Trust Passport экспортируется в PDF.
- [ ] Risk Registry экспортируется в CSV.
- [ ] Executive report доступен CISO-сценарию.
- [ ] RBAC и audit events проверены.
- [ ] Документация обновлена.
- [ ] `npm run type-check` проходит.
- [ ] `npm run lint` проходит.
- [ ] `npm run build` проходит.

---

## 9. Риски

| Риск | Вероятность | Влияние | Митигирование |
|---|---|---|---|
| PDF generation окажется сложнее оценки | Средняя | Высокое | Начать с минимального PDF без report designer |
| Отчёт раскроет данные другой организации | Низкая | Критическое | RLS + RBAC + server-side checks |
| CSV сломается на кириллице | Средняя | Среднее | UTF-8 BOM, smoke tests |
