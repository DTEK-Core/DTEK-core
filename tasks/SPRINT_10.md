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

| ID | Задача | Приоритет | Оценка | Зависимости | Статус |
|---|---|---|---|---|---|
| S10-T001 | Reporting Architecture Decision | P1 | S | S09 | ✅ Завершено |
| S10-T002 | Trust Passport PDF Export | P1 | L | T001 | ✅ Завершено |
| S10-T003 | Risk Registry CSV Export | P1 | M | T001 | ✅ Завершено |
| S10-T004 | Executive Organization Report | P1 | L | T001 | ✅ Завершено |
| S10-T005 | Report Access Control & Audit Events | P1 | M | T002–T004 | ✅ Завершено |
| S10-T006 | Report Empty/Error States | P2 | S | T002–T004 | 📋 Запланировано |
| S10-T007 | User Documentation: Reports & Export | P1 | S | T002–T006 | 📋 Запланировано |
| S10-T008 | Reporting Smoke Test Checklist | P1 | S | T002–T007 | 📋 Запланировано |

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

**Решение:** ADR-008. PDF/report artefacts Sprint 10 реализуются как protected print-optimized HTML report pages с browser print/save as PDF. CSV экспорт реализуется через protected Next.js route handler с server-side RBAC, UTF-8 BOM, safe CSV serialization, `Content-Disposition` и audit event. Новые PDF/BI зависимости в S10-T001 не добавляются.

### S10-T002 — Trust Passport PDF Export

**Описание:** добавить экспорт паспорта доверия объекта в PDF.

**Ожидаемый результат:** PDF содержит реквизиты объекта, Trust Score, факторную разбивку, риски, дату генерации, source/evidence section placeholder и branding DTEK Core.

**Решение:** добавлена защищённая печатная версия `/reports/passport/{object_id}`. Страница собирает данные server-side через `lib/reports/passport-report.ts`, показывает реквизиты объекта, Trust Score, факторную разбивку, риски, дату генерации, source/evidence coverage placeholder и branding DTEK Core. Кнопка PDF в Trust Passport открывает report page в новой вкладке; сохранение PDF выполняется через browser print/save as PDF согласно ADR-008.

### S10-T003 — Risk Registry CSV Export

**Описание:** экспортировать текущий набор рисков с фильтрами.

**Ожидаемый результат:** CSV с полями риска, статусом, severity, linked objects, due date и owner.

**Решение:** добавлен защищённый route handler `/api/reports/risks`, который формирует CSV server-side через `lib/reports/risk-csv.ts` и `lib/reports/csv.ts`. Экспорт доступен только `owner` и `analyst`, учитывает текущие фильтры UI (`q`, `severity`, `status`), использует UTF-8 BOM, safe CSV escaping, `Content-Disposition` attachment и audit event `report.risks_csv_exported`.

### S10-T004 — Executive Organization Report

**Описание:** создать управленческий отчёт по организации для CISO.

**Ожидаемый результат:** отчёт включает org Trust Score, топ рисковых объектов, распределение доверия, критические риски, source coverage placeholder и summary.

**Решение:** добавлена защищённая печатная версия `/reports/executive` для owner/analyst. Отчёт собирается server-side через `lib/reports/executive-report.ts`, использует organization_id из профиля пользователя, показывает org Trust Score, KPI, executive summary, распределение доверия, факторный профиль, топ рисковых объектов, критические риски и source/evidence coverage placeholder. В Dashboard добавлена точка входа для разрешённых ролей; открытие отчёта фиксируется audit event `report.executive_opened`.

### S10-T005 — Report Access Control & Audit Events

**Описание:** проверить RBAC и логировать экспорт чувствительных отчётов.

**Ожидаемый результат:** export доступен только разрешённым ролям; события фиксируются в audit log.

**Решение:** добавлен общий report RBAC helper `lib/reports/access.ts` с матрицей ADR-008: Trust Passport доступен ролям организации, Risk CSV и Executive Report доступны только `owner`/`analyst`. Risk CSV route возвращает 403 при запрете. Printable reports логируют export через Server Action `lib/actions/reports.ts` перед browser print/save as PDF: `report.passport_exported` и `report.executive_exported`. Открытие Executive Report продолжает логироваться как `report.executive_opened`, Risk CSV — как `report.risks_csv_exported`. Audit helper теперь ожидает попытку записи и безопасно логирует ошибки без блокировки пользовательского сценария.

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
