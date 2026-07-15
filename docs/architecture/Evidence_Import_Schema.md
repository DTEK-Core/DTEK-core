# Evidence_Import_Schema.md — DTEK Core

`Статус: актуальный`
`Дата: 15.07.2026`
`Sprint: S11-T001 — Evidence Import Schema Specification`
`Основа: ADR-007, tasks/SPRINT_11.md, Database_Design_Full.md`

---

## 1. Назначение

Документ фиксирует контракт импорта объектов и рисков для Sprint 11.

Sprint 11 трактует CSV/XLSX import как первый evidence ingestion path, но не реализует полный Evidence Layer, Discovery Inbox или Connector Framework. Задача импорта в этом Sprint:

- быстро загрузить 50-200 объектов и 20-100 рисков для пилота;
- сохранить понятный source context;
- не менять текущую архитектуру и схему БД без необходимости;
- подготовить данные к будущей Evidence-first модели.

---

## 2. Архитектурные Ограничения S11

### Входит В Sprint 11

- импорт объектов;
- импорт рисков;
- привязка импортированных рисков к объектам;
- preview перед записью;
- server-side validation;
- import error report;
- source metadata на уровне файла и строки;
- audit events;
- CSV-шаблоны.

### Не Входит В Sprint 11

- новые таблицы Evidence Layer;
- полноценный Discovery Inbox;
- background queue;
- scheduled import;
- прямые коннекторы;
- auto risk mapper;
- автоматическое merge-confirmation UI;
- массовое обновление существующих записей.

### Решение По Хранению Source Context

В Sprint 11 source context хранится без изменения схемы БД:

- на уровне audit event metadata;
- в preview/import result;
- в человекочитаемом блоке внутри существующих текстовых полей:
  - `objects.description`;
  - `risks.description` или `risks.impact`, если description отсутствует.

Формат блока:

```text
[Import Source]
source_name: MaxPatrol VM export
source_type: vulnerability_export
source_record_id: mpvm-12345
source_collected_at: 2026-07-15
confidence: medium
```

Этот подход является временным. Будущие Sprint должны перенести source context в Evidence Layer tables.

---

## 3. Поддерживаемые Форматы Файлов

| Формат | Статус S11 | Требования |
|---|---|---|
| `.csv` | Основной формат | UTF-8, UTF-8 BOM допускается, первая строка - заголовки |
| `.xlsx` | Тот же контракт | Используется первый лист, первая строка - заголовки |

Для `.csv` допускаются разделители:

- comma `,`;
- semicolon `;`.

Парсер должен определить разделитель по первой непустой строке. Если определить нельзя, используется comma.

Ограничения MVP:

| Ограничение | Значение |
|---|---|
| Максимальный размер файла | 5 MB |
| Максимум строк объектов | 500 |
| Максимум строк рисков | 500 |
| Пустые строки | Игнорируются |
| Неизвестные колонки | Не блокируют import, попадают в warnings |

---

## 4. Общие Поля Source Metadata

Эти поля применимы к объектам и рискам.

| Колонка | Обязательность | Тип | Описание |
|---|---|---|---|
| `source_name` | optional | string, 1-200 | Человекочитаемое имя источника |
| `source_type` | optional | enum | Тип источника |
| `source_record_id` | optional | string, 1-200 | ID записи в исходной системе |
| `source_collected_at` | optional | date/datetime | Когда данные были получены в источнике |
| `confidence` | optional | enum | Уверенность в данных |
| `import_note` | optional | string, 1-500 | Комментарий к строке импорта |

### `source_type`

Допустимые значения:

| Значение | Когда Использовать |
|---|---|
| `manual_csv` | Ручная таблица инвентаризации |
| `asset_inventory` | Выгрузка CMDB / ITAM / asset inventory |
| `vulnerability_export` | Выгрузка VM-сканера |
| `monitoring_export` | Zabbix, Grafana, monitoring |
| `directory_export` | AD, LDAP, FreeIPA |
| `security_tool_export` | Kaspersky, Wazuh, EDR/XDR-like tooling |
| `network_export` | Firewall, NAC, сетевые выгрузки |
| `other` | Другой источник |

Default: `manual_csv`.

### `confidence`

Допустимые значения:

| Значение | Смысл |
|---|---|
| `high` | Данные можно считать достаточно надёжными |
| `medium` | Данные полезны, но требуют проверки |
| `low` | Данные сомнительны, нужны ручная проверка и корректировка |

Default: `medium`.

---

## 5. Objects Import Contract

### 5.1 Обязательные Колонки

| Колонка | Тип | Mapping |
|---|---|---|
| `name` | string, 1-200 | `objects.name` |
| `type` | enum | `objects.type` |

### 5.2 Опциональные Колонки

| Колонка | Тип | Mapping / Использование |
|---|---|---|
| `external_id` | string, 1-200 | Alias для `source_record_id`, если `source_record_id` пуст |
| `description` | string, max 5000 | `objects.description` + source block |
| `criticality` | enum | `objects.criticality`, default `medium` |
| `ip_address` | string, max 45 | `objects.ip_address` |
| `os_platform` | string, max 200 | `objects.os_platform` |
| `segment` | string, max 200 | `objects.segment` |
| `exposure` | enum | `objects.exposure` |
| `owner_email` | email | Будущий mapping на `owner_id`; в S11 warning-only |
| `source_name` | string | Source metadata |
| `source_type` | enum | Source metadata |
| `source_record_id` | string | Source metadata |
| `source_collected_at` | date/datetime | Source metadata |
| `confidence` | enum | Source metadata |
| `import_note` | string | Source metadata |

### 5.3 `objects.type`

Допустимые значения:

| Значение | Алиасы При Импорте |
|---|---|
| `server` | `сервер`, `srv`, `host` |
| `workstation` | `рабочая станция`, `pc`, `desktop` |
| `laptop` | `ноутбук`, `notebook` |
| `network` | `network_device`, `router`, `switch`, `firewall`, `сетевое устройство` |
| `app` | `application`, `приложение` |
| `database` | `db`, `database`, `база данных` |
| `service` | `cloud_service`, `service`, `сервис` |
| `identity` | `account`, `user`, `учетная запись`, `учётная запись` |
| `ot` | `ics`, `iot`, `асу тп` |
| `policy` | `document`, `policy`, `политика` |
| `other` | `прочее`, `unknown` |

### 5.4 `objects.criticality`

Допустимые значения:

| Значение | Алиасы |
|---|---|
| `low` | `низкая`, `низкий` |
| `medium` | `средняя`, `средний`, пусто |
| `high` | `высокая`, `высокий` |
| `critical` | `критичная`, `критический`, `crit` |

### 5.5 `objects.exposure`

Допустимые значения:

| Значение | Алиасы |
|---|---|
| `internal` | `внутренний`, `inside`, `lan` |
| `external` | `внешний`, `internet`, `public` |
| `isolated` | `изолированный`, `offline`, `dmz-isolated` |

### 5.6 RBAC Для Objects Import

| Роль | Разрешение |
|---|---|
| `owner` | Может импортировать любые типы объектов |
| `analyst` | Может импортировать любые типы объектов |
| `admin` | Может импортировать только `server`, `workstation`, `laptop`, `network`, `ot` |
| `viewer` | Нет доступа |

Если `admin` загружает строку с типом `app`, `database`, `service`, `identity`, `policy` или `other`, строка должна попасть в validation errors и не должна быть записана.

---

## 6. Risks Import Contract

### 6.1 Обязательные Колонки

| Колонка | Тип | Mapping |
|---|---|---|
| `title` | string, 1-500 | `risks.title` |
| `severity` | enum | `risks.severity` |

### 6.2 Опциональные Колонки

| Колонка | Тип | Mapping / Использование |
|---|---|---|
| `external_id` | string, 1-200 | Alias для `source_record_id`, если `source_record_id` пуст |
| `description` | string, max 5000 | `risks.description` + source block |
| `category` | enum | `risks.category`, default `other` |
| `status` | enum | `risks.status`, default `open` |
| `probability` | enum | `risks.probability` |
| `cvss_score` | number 0-10 | `risks.cvss_score` |
| `impact` | string, max 5000 | `risks.impact` |
| `sla_days` | positive integer | `risks.sla_days`; `due_date` может быть рассчитан |
| `due_date` | date/datetime | `risks.due_date`; приоритетнее `sla_days` |
| `linked_object_name` | string | Поиск объекта для `object_risks` |
| `linked_object_ip` | string | Поиск объекта для `object_risks` |
| `linked_object_external_id` | string | Для будущего Evidence Layer; в S11 warning-only, если объект не найден |
| `owner_email` | email | Будущий mapping на `owner_id`; в S11 warning-only |
| `source_name` | string | Source metadata |
| `source_type` | enum | Source metadata |
| `source_record_id` | string | Source metadata |
| `source_collected_at` | date/datetime | Source metadata |
| `confidence` | enum | Source metadata |
| `import_note` | string | Source metadata |

### 6.3 `risks.category`

Допустимые значения:

| Значение | Алиасы |
|---|---|
| `vulnerability` | `уязвимость`, `vuln`, `cve` |
| `configuration` | `конфигурация`, `config`, `misconfiguration` |
| `access` | `доступ`, `privilege`, `iam` |
| `network` | `сеть`, `segmentation`, `exposure` |
| `compliance` | `соответствие`, `regulation`, `audit` |
| `incident` | `инцидент`, `event` |
| `monitoring` | `мониторинг`, `logging`, `coverage` |
| `organizational` | `организационный`, `process` |
| `physical` | `физический` |
| `human` | `человеческий фактор`, `people` |
| `other` | `прочее`, пусто |

### 6.4 `risks.severity`

Допустимые значения:

| Значение | Алиасы |
|---|---|
| `low` | `низкий`, `низкая` |
| `medium` | `средний`, `средняя` |
| `high` | `высокий`, `высокая` |
| `critical` | `критический`, `критичная`, `crit` |

### 6.5 `risks.status`

Допустимые значения:

| Значение | Алиасы |
|---|---|
| `open` | `открыт`, `новый`, пусто |
| `in_progress` | `в работе`, `progress` |
| `mitigated` | `устранён`, `устранен`, `mitigated` |
| `accepted` | `принят`, `accepted` |
| `closed` | `закрыт`, `closed` |

### 6.6 RBAC Для Risks Import

| Роль | Разрешение |
|---|---|
| `owner` | Может импортировать риски и связи risk-object |
| `analyst` | Может импортировать риски и связи risk-object |
| `admin` | Нет доступа к созданию рисков |
| `viewer` | Нет доступа |

---

## 7. Нормализация Данных

Перед validation:

1. Все заголовки колонок приводятся к lowercase snake_case.
2. Пробелы в начале и конце значений удаляются.
3. Пустые строки и строки из одних разделителей игнорируются.
4. Пустые значения трактуются как `null`, кроме обязательных колонок.
5. Enum aliases приводятся к каноническим значениям.
6. Даты принимаются в форматах:
   - `YYYY-MM-DD`;
   - `YYYY-MM-DDTHH:mm:ssZ`;
   - `DD.MM.YYYY`.
7. `cvss_score` принимает `7.5` и `7,5`, сохраняется как number.
8. `sla_days` принимает только положительное целое число.
9. Неизвестные колонки не записываются в БД и отображаются как warnings.

---

## 8. Validation Preview

Import всегда выполняется в два этапа:

```text
Upload file
  -> parse
  -> normalize
  -> validate
  -> preview
  -> explicit confirm
  -> commit valid rows
```

Preview не должен создавать записи в БД.

Preview должен показать:

- имя файла;
- тип import: objects или risks;
- source metadata;
- количество строк;
- количество валидных строк;
- количество строк с errors;
- количество warnings;
- потенциальные дубли;
- список первых ошибок;
- возможность скачать error report.

Commit доступен только после preview.

---

## 9. Error Report Contract

Каждая ошибка валидации имеет структуру:

| Поле | Тип | Описание |
|---|---|---|
| `row` | number | Номер строки в исходном файле, начиная с 2 |
| `field` | string | Колонка или `_row` |
| `code` | string | Машиночитаемый код ошибки |
| `message` | string | Человекочитаемое сообщение |
| `original_value` | string/null | Исходное значение |
| `suggestion` | string/null | Подсказка исправления |
| `severity` | `error`/`warning` | Ошибка блокирует строку, warning не блокирует |

Базовые коды:

| Код | Severity | Смысл |
|---|---|---|
| `missing_required_field` | error | Не заполнено обязательное поле |
| `invalid_enum` | error | Значение не входит в допустимый enum |
| `invalid_date` | error | Дата не распознана |
| `invalid_number` | error | Число не распознано |
| `value_too_long` | error | Превышен лимит длины |
| `rbac_denied` | error | Роль не может импортировать строку |
| `object_not_found` | warning | Риск импортируется без связи с объектом |
| `duplicate_in_file` | warning | Похожая строка уже есть в файле |
| `possible_duplicate_existing` | warning | Похожая запись уже есть в организации |
| `unknown_column` | warning | Колонка не используется |

---

## 10. Duplicate And Matching Strategy

Sprint 11 не добавляет `external_id` в БД. Поэтому matching должен быть консервативным.

### Objects

Порядок проверки возможного дубля:

1. `name` + `type` в текущей организации.
2. `ip_address`, если он указан и уникален среди активных объектов организации.
3. `name` без учёта регистра, если реализация безопасно поддерживает такой поиск.

Поведение:

- по умолчанию import создаёт только новые записи;
- если найден возможный дубль, строка получает warning;
- автоматическое обновление существующего объекта не выполняется в Sprint 11;
- пользователь может исправить файл или пропустить строку.

### Risks

Порядок проверки возможного дубля:

1. `title` + `category` + `severity` в текущей организации.
2. `title` + linked object, если объект найден.

Поведение:

- по умолчанию import создаёт новый риск только при отсутствии явного дубля;
- автоматическое объединение рисков не выполняется;
- `source_record_id` сохраняется как source context, но не является DB-key в Sprint 11.

---

## 11. Commit Strategy

Sprint 11 использует safe partial success:

- строки с `error` не записываются;
- строки только с `warning` могут быть записаны после подтверждения пользователя;
- каждая записанная строка возвращает результат `created`, `skipped` или `failed`;
- при сбое отдельной строки остальные успешные строки не откатываются автоматически;
- итоговый import result должен содержать список созданных записей и failures.

Полный transactional rollback всего файла требует отдельного DB RPC или import batch table и выходит за рамки S11-T001. Безопасность достигается через preview, create-only поведение и отсутствие массового update/delete.

---

## 12. Audit Events

S11-T006 должен расширить `SecurityEventType` следующими событиями:

| Event | Когда Создаётся |
|---|---|
| `import.objects_completed` | После commit objects import |
| `import.risks_completed` | После commit risks import |
| `import.failed` | Если import commit завершился общим сбоем |

Минимальная metadata:

```json
{
  "importType": "objects",
  "fileName": "assets.csv",
  "sourceName": "manual inventory",
  "sourceType": "manual_csv",
  "totalRows": 120,
  "createdRows": 118,
  "skippedRows": 2,
  "failedRows": 0,
  "warnings": 5
}
```

Audit events не должны содержать содержимое всего файла или чувствительные секреты.

---

## 13. Влияние На Trust Score

### Objects Import

При создании объекта используется текущая MVP-логика:

- начальный Trust Score определяется критичностью;
- trust passport создаётся existing DB trigger;
- последующий пересчёт может выполняться через существующий Trust Score Engine.

### Risks Import

После создания риска и связи `object_risks`:

- Trust Score связанных объектов должен быть пересчитан;
- Dashboard, Objects, Risks и Passport должны быть revalidated;
- риски без найденного объекта импортируются без влияния на Trust Score до ручной привязки.

---

## 14. Минимальные Шаблоны

S11-T005 должен подготовить два CSV-шаблона.

### Objects Template

```csv
name,type,criticality,ip_address,os_platform,segment,exposure,description,source_name,source_type,source_record_id,source_collected_at,confidence
srv-db-01,server,critical,10.10.1.15,Astra Linux,prod-db,internal,Primary PostgreSQL server,Manual inventory,manual_csv,asset-001,2026-07-15,medium
```

### Risks Template

```csv
title,severity,category,status,probability,cvss_score,sla_days,linked_object_name,description,impact,source_name,source_type,source_record_id,source_collected_at,confidence
Critical CVE on database server,critical,vulnerability,open,high,9.8,7,srv-db-01,Unpatched critical vulnerability,May affect customer data,MaxPatrol VM,vulnerability_export,vm-1001,2026-07-15,high
```

---

## 15. Acceptance Criteria Для S11-T001

- [x] Определены обязательные и опциональные колонки объектов.
- [x] Определены обязательные и опциональные колонки рисков.
- [x] Определены source metadata поля.
- [x] Описаны enum values и aliases.
- [x] Описаны RBAC-правила import.
- [x] Описаны validation preview и error report.
- [x] Описаны duplicate/matching правила без изменения схемы БД.
- [x] Описан audit event contract для S11-T006.
- [x] Описаны минимальные templates для S11-T005.

---

## 16. Связанные Документы

- [ARCHITECTURE_DECISIONS.md](../../ARCHITECTURE_DECISIONS.md) — ADR-007.
- [Database_Design_Full.md](Database_Design_Full.md) — текущая схема объектов, рисков и RLS.
- [Evidence_First_Architecture.md](Evidence_First_Architecture.md) — целевая Evidence-first архитектура.
- [tasks/SPRINT_11.md](../../tasks/SPRINT_11.md) — Sprint 11 roadmap.
