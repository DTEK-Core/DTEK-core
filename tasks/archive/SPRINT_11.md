# SPRINT 11 — Evidence Import & Data Onboarding

`Проект: DTEK Core`  
`Спринт: 11`  
`Тип: Market MVP Feature Sprint`  
`Основа: Sprint 10, PRODUCT_STRATEGY.md, ROADMAP.md, ADR-007`  
`Статус: ✅ Завершён`

---

## 1. Цель Спринта

Убрать главный барьер пилотов: ручное заполнение объектов и рисков.

Sprint 11 должен позволить загрузить 50–200 активов и 20–100 рисков из CSV/XLSX как первый evidence ingestion path без полноценного Connector Framework и без ломки текущей архитектуры.

---

## 2. Место В Roadmap

| Параметр | Значение |
|---|---|
| Фаза | Market MVP |
| Предыдущий Sprint | Sprint 10 — Reporting & Export |
| Следующий Sprint | Sprint 12 — Evidence-backed Trust Explainability |
| Milestone | Evidence Onboarding Ready |

---

## 3. Бизнес-Ценность

Первые пользователи почти всегда имеют исходные данные в Excel/CSV. CSV/XLSX import позволяет провести пилот без тяжёлых интеграций и одновременно закладывает будущую модель Evidence Layer: у импортированных данных появляется источник, дата загрузки и понятное происхождение.

---

## 4. Scope / Non-Scope

### Входит

- CSV/XLSX import объектов;
- CSV/XLSX import рисков;
- validation preview;
- import error report;
- sample templates;
- source metadata для импортированных данных;
- безопасный rollback/partial success подход.

### Не входит

- прямые коннекторы к SIEM/VM/CMDB;
- background queue;
- сложный ETL;
- auto-discovery активов через коннекторы;
- drag-and-drop spreadsheet editor.

---

## 5. Задачи Спринта

| ID | Задача | Приоритет | Оценка | Зависимости | Статус |
|---|---|---|---|---|---|
| S11-T001 | Evidence Import Schema Specification | P1 | M | S09, S10 | ✅ Завершено |
| S11-T002 | Objects CSV/XLSX Import | P1 | L | T001 | ✅ Завершено |
| S11-T003 | Risks CSV/XLSX Import | P1 | L | T001 | ✅ Завершено |
| S11-T004 | Import Preview, Validation & Source Metadata | P1 | M | T002, T003 | ✅ Завершено |
| S11-T005 | Import Templates | P1 | S | T001 | ✅ Завершено |
| S11-T006 | Import Audit Events | P1 | S | T002, T003 | ✅ Завершено |
| S11-T007 | Import Documentation | P1 | S | T001–T006 | ✅ Завершено |
| S11-T008 | Data Onboarding Smoke Test | P1 | S | T002–T007 | ✅ Завершено |

---

## 6. Порядок Выполнения

```text
День 1
  S11-T001 Evidence Import Schema Specification
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

### S11-T001 — Evidence Import Schema Specification

**Описание:** определить обязательные и опциональные колонки для объектов и рисков, а также минимальные source metadata поля.

**Ожидаемый результат:** зафиксирован import contract без изменения схемы БД и с совместимостью с будущим Evidence Layer.

**Решение:** добавлен документ `docs/architecture/Evidence_Import_Schema.md`. В нём зафиксированы CSV/XLSX contract для объектов и рисков, source metadata, enum aliases, RBAC, validation preview, error report, duplicate/matching strategy, safe partial success, audit event contract и минимальные CSV templates для S11-T005. Решение не требует миграций и сохраняет совместимость с будущим Evidence Layer.

### S11-T002 — Objects CSV/XLSX Import

**Описание:** реализовать загрузку объектов с server-side validation и RBAC.

**Ожидаемый результат:** owner/analyst/admin в рамках ADR-003 могут импортировать разрешённые объекты.

**Решение:** на странице `/objects` добавлен двухэтапный импорт CSV/XLSX: browser-side чтение файла, server-side normalization/validation preview и явный commit. Поддержаны лимиты 5 МБ / 500 строк, первый лист XLSX, enum aliases, source context, проверка дублей, create-only partial success и повторная tenant/RBAC-проверка в Server Action. `owner` и `analyst` импортируют все типы, `admin` — только инфраструктурные, `viewer` не имеет доступа. Audit events остаются задачей S11-T006.

### S11-T003 — Risks CSV/XLSX Import

**Описание:** реализовать загрузку рисков и опциональную привязку к объектам по внешнему ключу/имени.

**Ожидаемый результат:** риски создаются с категориями, severity, status, due date и связями.

**Решение:** на странице `/risks` добавлен двухэтапный CSV/XLSX import на общей с objects import UI-основе. Server-side pipeline нормализует aliases, CVSS, SLA/due date и source context, проверяет дубли, находит объект только внутри текущей организации по точному имени или уникальному IP и создаёт `object_risks`. Риски без найденного объекта создаются без связи с warning. Доступ имеют только `owner` и `analyst`; `admin` и `viewer` блокируются на UI и в Server Action. После импорта Trust Score связанных объектов пересчитывается пакетно, а audit events остаются задачей S11-T006.

### S11-T004 — Import Preview, Validation & Source Metadata

**Описание:** перед созданием показать количество валидных строк, ошибки и источник импортируемых данных.

**Ожидаемый результат:** пользователь видит, что будет импортировано, откуда пришли данные, и может исправить файл.

**Решение:** общий диалог objects/risks import дополнен file-level source metadata: названием, типом источника, уверенностью, датой сбора и комментарием. Построчные source-поля файла имеют приоритет над этими defaults, а preview явно показывает источник и количество строк с переопределениями. До commit пользователь видит total/valid/creatable/error/duplicate/warning counters, первые замечания с исходным значением и рекомендацией, а также может скачать полный UTF-8 CSV validation report. Preview не пишет данные, а commit повторно валидирует файл, source metadata, RBAC и tenant context на сервере.

### S11-T005 — Import Templates

**Описание:** подготовить шаблоны CSV для объектов и рисков.

**Ожидаемый результат:** пользователь может скачать/открыть пример структуры.

**Решение:** добавлены два статических UTF-8 CSV-шаблона: `public/templates/dtek-core-objects-import-template.csv` и `public/templates/dtek-core-risks-import-template.csv`. Каждый шаблон использует канонические заголовки import contract, допустимые enum values, ISO-дату и одну валидную примерную строку. В общих диалогах Objects/Risks появилась download-команда «Шаблон CSV» с контекстной ссылкой на соответствующий файл. Шаблоны не содержат tenant data, формулы или секреты и доступны как безопасные public assets.

### S11-T006 — Import Audit Events

**Описание:** логировать импорт чувствительных данных.

**Ожидаемый результат:** audit log фиксирует импорт, количество строк и инициатора.

**Решение:** `SecurityEventType` расширен событиями `import.objects_completed`, `import.risks_completed` и `import.failed`. Object/Risk commit пишет audit event через общий server-only helper после повторной validation: completed для полного или partial success, failed для отклонённого commit либо полного write failure. Metadata содержит только тип импорта, безопасное имя файла, source name/type и агрегированные total/created/skipped/failed/warning counters; для risks дополнительно сохраняются link counters. Содержимое строк, IP, описания, source record IDs и другие чувствительные поля в журнал не попадают. Инициатор фиксируется через `actor_id`, `actor_email` и существующий IP audit context; события видны owner/admin в `/settings`.

### S11-T007 — Import Documentation

**Описание:** описать формат CSV, ошибки и ограничения.

**Ожидаемый результат:** обновлены user docs, FAQ и troubleshooting при необходимости.

**Решение:** создано полное пользовательское руководство `docs/user/IMPORT_GUIDE.md`: RBAC, CSV/XLSX contract, шаблоны, source metadata, preview, error report, duplicate/create-only strategy, partial success, audit events и ограничения Sprint 11. Основной User Guide, Platform Workflow, Object Model, Risk Registry, FAQ и Troubleshooting синхронизированы с фактическим import flow; README, Documentation Index и техническая Evidence Import Schema связаны с новым руководством.

### S11-T008 — Data Onboarding Smoke Test

**Описание:** проверить импорт 50+ объектов и 20+ рисков.

**Ожидаемый результат:** после импорта работают Dashboard, Objects, Risks, Passport и Graph.

**Решение:** подготовлен `docs/testing/DATA_ONBOARDING_SMOKE_TEST_CHECKLIST.md` для воспроизводимой ручной приёмки Data Onboarding. Основной сценарий использует отдельные валидные наборы на 60 объектов и 25 рисков; ошибки, дубли и partial success проверяются специализированными fixtures. Чеклист покрывает CSV/XLSX, preview, error report, source metadata, duplicate/create-only strategy, partial success, RBAC, tenant isolation, audit events, Trust Score, Dashboard, Objects, Passport, Risks, Graph, performance и mobile UI. Инженерные проверки выполняются автоматически; статус `PASS` и закрытие Sprint 11 требуют authenticated прогона в отдельной тестовой организации.

**Post-Sprint 11 stabilization:** по результатам первого ручного прогона устранена несовместимость Risk CSV Export → Risk Import, добавлены localized/export header mapping с приоритетом `*_key`, wrong-dataset detection и переход в правильный import, grouped error/warning/info preview, tab-separated CSV, явные file-read/preview/commit timeouts и конкретные duplicate matching fields. Создан `testing/sprint-11-import/` с готовыми valid, partial, duplicate, invalid и performance datasets; `npm run test:import` проверяет parser и import contracts без изменения БД. Основной smoke использует готовые 60 objects / 25 risks fixtures, а ошибки и дубли проверяются отдельными файлами.

**Sprint 11 closure:** повторная ручная приёмка Data Onboarding успешно пройдена после stabilization. Подтверждены CSV/XLSX import объектов и рисков, скачивание и совместимость шаблонов, Risk CSV export roundtrip, preview, column mapping, source metadata, duplicate detection, partial success, commit импортируемых записей, неправильный тип файла, отсутствие бесконечной загрузки, RBAC/RLS/multi-tenant isolation, audit events, Trust Passport, Risk Registry, Trust Score, Dashboard и Trust Graph после bulk import. Sprint достиг milestone **Evidence Onboarding Ready**; следующий этап — Sprint 12.

---

## 8. Definition Of Done

- [x] Objects CSV/XLSX import работает.
- [x] Risks CSV/XLSX import работает.
- [x] Есть preview и ошибки валидации.
- [x] У импортированных данных есть source context.
- [x] Есть шаблоны CSV.
- [x] Audit events фиксируются.
- [x] Trust Score пересчитывается после импорта.
- [x] Документация обновлена.
- [x] `npm run type-check` проходит.
- [x] `npm run lint` проходит.
- [x] `npm run build` проходит.
- [x] Подготовлен Data Onboarding smoke checklist.
- [x] `npm run test:import` проходит.
- [x] Ручной smoke test 60 объектов / 25 рисков пройден.

### Итоговая Сверка Завершённости

| Задача | Реализовано | Протестировано | Задокументировано | Итог |
|---|:---:|:---:|:---:|---|
| S11-T001 Evidence Import Schema Specification | ✅ | ✅ | ✅ | Завершено |
| S11-T002 Objects CSV/XLSX Import | ✅ | ✅ | ✅ | Завершено |
| S11-T003 Risks CSV/XLSX Import | ✅ | ✅ | ✅ | Завершено |
| S11-T004 Import Preview, Validation & Source Metadata | ✅ | ✅ | ✅ | Завершено |
| S11-T005 Import Templates | ✅ | ✅ | ✅ | Завершено |
| S11-T006 Import Audit Events | ✅ | ✅ | ✅ | Завершено |
| S11-T007 Import Documentation | ✅ | ✅ | ✅ | Завершено |
| S11-T008 Data Onboarding Smoke Test | ✅ | ✅ | ✅ | Завершено |

Ничего не перенесено в следующий Sprint как блокер. Известные ограничения Sprint 11 остаются осознанными границами MVP и описаны в `docs/user/IMPORT_GUIDE.md` и `docs/architecture/Evidence_Import_Schema.md`: source context временно хранится в existing text fields, update/merge существующих записей не выполняется, background queue и Connector Framework не входят в Sprint 11.

---

## 9. Риски

| Риск | Вероятность | Влияние | Митигирование |
|---|---|---|---|
| CSV формат станет слишком сложным | Средняя | Среднее | Минимальный обязательный набор колонок |
| Импорт создаст дубли | Средняя | Среднее | external_id/name matching strategy |
| Ошибка импорта нарушит tenant isolation | Низкая | Критическое | Server-side org checks + RLS |
