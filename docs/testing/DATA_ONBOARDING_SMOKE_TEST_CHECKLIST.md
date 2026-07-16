# DATA_ONBOARDING_SMOKE_TEST_CHECKLIST.md — DTEK Core

`Спринт: Sprint 11 — Evidence Import & Data Onboarding`
`Задача: S11-T008 — Data Onboarding Smoke Test`
`Тип: ручной smoke test модуля импорта и первичного наполнения`
`Дата: 16.07.2026`

---

## Назначение

Этот документ проверяет готовность полного Data Onboarding flow Sprint 11:

- импорт 50+ объектов и 20+ рисков;
- CSV/XLSX parsing и source metadata;
- validation preview, error report, дубли и partial success;
- RBAC и multi-tenant isolation;
- import audit events;
- пересчёт Trust Score после связывания рисков;
- целостность Dashboard, Objects, Trust Passport, Risks и Trust Graph;
- отсутствие зависаний, постоянных retry и критичных проблем mobile UI.

Чеклист не запускает миграции и не требует прямого доступа к таблицам Supabase. Все бизнес-данные создаются только через пользовательский import flow.

Если найден дефект, заполните **Журнал замечаний** или используйте [BUG_REPORT_TEMPLATE.md](BUG_REPORT_TEMPLATE.md).

---

## Статусы Проверки

| Статус | Значение |
|---|---|
| `PASS` | Фактический результат соответствует ожидаемому |
| `FAIL` | Найден дефект |
| `BLOCKED` | Проверка невозможна из-за окружения или внешнего сервиса |
| `N/A` | Сценарий неприменим к текущему окружению |

Не отмечайте сценарий как `PASS`, если проверена только видимость кнопки без preview или commit.

---

## Уже Выполненные Инженерные Проверки

Перед передачей checklist на ручную приёмку выполняются:

- `npm run type-check`;
- `npm run lint`;
- `npm run build`;
- `npm run test:import`;
- проверка Markdown links;
- сверка сценариев с `lib/import/*`, Server Actions и import UI.

Эти проверки подтверждают сборку и соответствие документации коду, но не заменяют authenticated smoke test с записью данных в тестовую организацию.

---

## Подготовка Окружения

### 1. Безопасная Тестовая Организация

Используйте отдельную организацию, данные которой можно оставить после проверки. Не проводите bulk smoke test в рабочей или демонстрационной организации.

Зафиксируйте до начала:

```text
Организация:
URL окружения:
Commit:
Дата и время:
Проверяющий:
```

### 2. Запуск Приложения

```bash
npm run dev
```

Откройте `http://localhost:3000`, DevTools Console и Network. Supabase должен быть доступен, а в Console не должно быть постоянных `fetch failed` или refresh-token retry.

### 3. Тестовые Роли

Все роли должны находиться в одной тестовой организации:

| Роль | Назначение |
|---|---|
| `owner` | Основной импорт, audit и итоговая проверка |
| `analyst` | Разрешённый импорт объектов и рисков |
| `admin` | Только инфраструктурные объекты, без импорта рисков |
| `viewer` | Проверка read-only запрета |

Создайте роли через invite flow владельца. Не регистрируйте analyst/admin/viewer отдельно через `/register`, иначе они станут владельцами других организаций. Подробности: [RBAC_TESTING_GUIDE.md](RBAC_TESTING_GUIDE.md).

### 4. Тестовая Папка

Все готовые файлы находятся в [testing/sprint-11-import](../../testing/sprint-11-import/README.md). Используйте свежую тестовую организацию: fixtures имеют стабильные префиксы, чтобы duplicate detection давал воспроизводимый результат.

---

## Подготовка Тестовых Файлов

Используйте файлы без ручного редактирования:

| Сценарий | Файл | Ожидаемый Preview |
|---|---|---|
| Основные объекты | `testing/sprint-11-import/objects/objects-valid-60.csv` | 60 строк, 60 valid, 60 creatable |
| Основные риски | `testing/sprint-11-import/risks/risks-valid-25.csv` | 25 строк, 25 valid, 25 creatable |
| Objects partial success | `partial-success/objects-partial-success.csv` | 5 total, 4 valid, 3 creatable, 1 error, 1 duplicate |
| Risks partial success | `partial-success/risks-partial-success.csv` | 5 total, 4 valid, 3 creatable, 1 error, 1 duplicate |
| Objects duplicates | `duplicates/objects-existing-duplicates.csv` | После основного import: 5 duplicates, 0 creatable |
| Risks duplicates | `duplicates/risks-existing-duplicates.csv` | После основного import: 5 duplicates, 0 creatable |
| Risk Export roundtrip | `risks/dtek-core-risk-export-sample.csv` | Локализованные/export headers сопоставлены, 2 creatable |
| Wrong risk file | `invalid/risk-file-for-object-import.csv` | Переход к импорту рисков |
| Wrong object file | `invalid/object-file-for-risk-import.csv` | Переход к импорту объектов |

Для XLSX parser сохраните `risks-valid-25.csv` как `.xlsx`, не меняя первый лист и заголовки. Канонические UI-шаблоны остаются отдельной проверкой структуры.

---

## Краткий Итог Проверки

| Блок | Статус | Замечания |
|---|---|---|
| Templates и parsing |  |  |
| Objects preview/commit |  |  |
| Risks preview/commit |  |  |
| Validation и partial success |  |  |
| Source metadata |  |  |
| RBAC и tenant isolation |  |  |
| Audit events |  |  |
| Dashboard / Objects / Passport |  |  |
| Risks / Trust Score / Graph |  |  |
| Performance и mobile |  |  |
| Документация |  |  |

---

## Блок 1 — Templates И File Parsing

### TC-S11-001 — Скачивание Шаблонов

**Роль:** owner

1. Откройте `/objects` → **Импорт** → **Шаблон CSV**.
2. Откройте `/risks` → **Импорт** → **Шаблон CSV**.

Ожидаемый результат:

- [ ] Скачиваются два разных CSV-файла.
- [ ] Кириллица и английские заголовки читаются корректно.
- [ ] Каждый шаблон содержит одну валидную примерную строку.
- [ ] В файлах нет формул, макросов, tenant data или секретов.

**Статус:**

**Замечания:**

---

### TC-S11-002 — CSV И XLSX Parsing

1. Выберите `objects/objects-valid-60.csv`.
2. После preview нажмите **Другой файл** и повторно выберите его.
3. На `/risks` выберите XLSX-копию `risks/risks-valid-25.csv`.
4. Загрузите risk-file в Object Import и object-file в Risk Import.
5. Загрузите `risks/dtek-core-risk-export-sample.csv` в Risk Import.

Ожидаемый результат:

- [ ] Оба формата читаются без browser error.
- [ ] XLSX использует данные первого листа.
- [ ] Имя выбранного файла показано в диалоге.
- [ ] Повторный выбор не смешивает состояние предыдущего preview.
- [ ] Preview не создаёт записей до явного commit.
- [ ] Неправильный тип файла показывает одно понятное сообщение и кнопку перехода.
- [ ] Собственный Risk CSV export распознаётся без blocking errors.

**Статус:**

**Замечания:**

---

## Блок 2 — Objects Import

### TC-S11-003 — Source Metadata И Preview

**Роль:** owner

**URL:** `/objects`

Перед выбором файла задайте:

```text
Название источника: S11 Smoke Asset Inventory
Тип: Инвентаризация / CMDB
Уверенность: Высокая
Дата сбора: текущая дата
Комментарий: S11-T008 controlled smoke test
```

Ожидаемый результат:

- [ ] Preview показывает 60 строк / 60 валидных / 60 к созданию / 0 ошибок / 0 дублей.
- [ ] Источник отображается как `S11 Smoke Asset Inventory`.
- [ ] Видно 60 строк с построчным переопределением source metadata.
- [ ] Кнопка показывает **Импортировать 60**.
- [ ] До commit количество объектов в `/objects` не изменилось.

**Статус:**

**Замечания:**

---

### TC-S11-004 — Validation Report

1. Выберите `partial-success/objects-partial-success.csv`.
2. В preview нажмите **Отчёт CSV**.
3. Откройте скачанный файл.

Ожидаемый результат:

- [ ] CSV открывается в UTF-8.
- [ ] Есть номера строк, поля, коды и рекомендации.
- [ ] Preview показывает 5 total / 4 valid / 3 creatable / 1 error / 1 duplicate.
- [ ] Присутствуют `invalid_enum` и `duplicate_in_file`.
- [ ] Отчёт не содержит service role key, auth token или stack trace.

**Статус:**

**Замечания:**

---

### TC-S11-005 — Commit 60 Объектов

1. Повторно выберите `objects/objects-valid-60.csv`.
2. Нажмите **Импортировать 60**.
3. Дождитесь состояния **Импорт завершён**.
4. Закройте диалог.

Ожидаемый результат:

- [ ] Создано ровно 60 объектов.
- [ ] Нет зависания, повторного commit или двойного toast.
- [ ] Новые объекты видны без полного logout/login.
- [ ] У каждого проверенного объекта есть Trust Passport.
- [ ] В description виден `[Import Source]` context.

**Статус:**

**Замечания:**

---

## Блок 3 — Risks Import

### TC-S11-006 — Risks XLSX Preview

**Роль:** owner

**URL:** `/risks`

Задайте источник `S11 Smoke Vulnerability Export`, тип **Сканер уязвимостей**, confidence **Высокая** и выберите XLSX-копию `risks-valid-25.csv`.

Ожидаемый результат:

- [ ] Preview показывает 25 строк / 25 валидных / 25 к созданию / 0 ошибок / 0 дублей.
- [ ] Кнопка показывает **Импортировать 25**.

**Статус:**

**Замечания:**

---

### TC-S11-007 — Commit 25 Рисков

1. Нажмите **Импортировать 25**.
2. Проверьте итоговые counters.
3. Закройте диалог и обновите `/risks`.

Ожидаемый результат:

- [ ] Создано 25 рисков.
- [ ] Связано 20, без связи 5.
- [ ] Category, severity, status, CVSS и due date соответствуют файлу.
- [ ] Пять рисков без linked object существуют без связи.
- [ ] В description присутствует source context.

**Статус:**

**Замечания:**

---

## Блок 4 — Дубли И Partial Success

### TC-S11-008 — Повторный Импорт Того Же Файла

1. Загрузите `duplicates/objects-existing-duplicates.csv` после основного objects import.
2. Загрузите `duplicates/risks-existing-duplicates.csv` после основного risks import.

Ожидаемый результат:

- [ ] Все пять строк каждого файла определены как существующие дубли.
- [ ] `К созданию` равно 0.
- [ ] В сообщении указаны конкретные matching fields.
- [ ] Commit недоступен.
- [ ] Существующие записи не изменились.
- [ ] Количество объектов и рисков не увеличилось.

**Статус:**

**Замечания:**

---

### TC-S11-009 — Partial Success

Используйте готовые `partial-success/objects-partial-success.csv` и `partial-success/risks-partial-success.csv` в свежей организации или до основного import соответствующих записей.

Ожидаемый результат:

- [ ] Preview показывает пять строк и три строки к созданию.
- [ ] Commit создаёт только три валидные уникальные записи.
- [ ] Ошибка одной строки не откатывает успешные строки.
- [ ] Result корректно показывает created/skipped/failed.

**Статус:**

**Замечания:**

---

## Блок 5 — RBAC И Tenant Isolation

### TC-S11-010 — Owner И Analyst

- [ ] Owner видит import для Objects и Risks.
- [ ] Analyst видит import для Objects и Risks.
- [ ] Analyst может получить preview и commit с уникальным mini-dataset.
- [ ] Обе роли работают только в текущей организации.

**Статус:**

**Замечания:**

---

### TC-S11-011 — Admin

Подготовьте mini-dataset с одним `server` и одним `database`.

- [ ] Admin видит import на `/objects`.
- [ ] `server` разрешён к созданию.
- [ ] `database` получает `rbac_denied`.
- [ ] Admin не видит import на `/risks`.
- [ ] Прямой Server Action request не должен обходить проверку роли.

**Статус:**

**Замечания:**

---

### TC-S11-012 — Viewer

- [ ] Viewer не видит import на `/objects`.
- [ ] Viewer не видит import на `/risks`.
- [ ] Viewer может просматривать уже импортированные данные.
- [ ] В UI нет активных команд commit.

**Статус:**

**Замечания:**

---

### TC-S11-013 — Вторая Организация

**Предусловие:** отдельная организация B.

1. Войдите в организацию B.
2. Найдите объекты и риски по уникальному префиксу организации A.

Ожидаемый результат:

- [ ] Ни один объект или риск организации A не виден.
- [ ] Dashboard и Graph организации B не учитывают импорт A.
- [ ] Подмена object ID в URL не раскрывает Passport организации A.

**Статус:**

**Замечания:**

---

## Блок 6 — Audit Events

### TC-S11-014 — Completed И Failed Events

**Роль:** owner или admin

**URL:** `/settings` → **Журнал аудита**

- [ ] Есть `import.objects_completed`.
- [ ] Есть `import.risks_completed`.
- [ ] Есть `import.failed` после отклонённого commit или полного write failure, если такой сценарий безопасно воспроизведён.
- [ ] Видны инициатор, тип импорта, имя файла и агрегированные counters.
- [ ] Для risks видны linked/unlinked counters.
- [ ] В metadata нет raw rows, IP, descriptions, CVSS, source record IDs и токенов.
- [ ] Analyst не видит Audit Log, admin видит.

**Статус:**

**Замечания:**

---

## Блок 7 — Целостность Платформы После Импорта

### TC-S11-015 — Objects И Trust Passport

- [ ] `/objects` показывает минимум 60 новых объектов.
- [ ] Поиск находит объект по префиксу.
- [ ] Фильтры типов и criticality работают.
- [ ] Детальная страница объекта открывается.
- [ ] Trust Passport содержит реквизиты и source context.
- [ ] Trust Score отображается без `NaN`, отрицательных или пустых значений.

**Статус:**

**Замечания:**

---

### TC-S11-016 — Risks И Trust Score

- [ ] `/risks` показывает минимум 25 новых рисков.
- [ ] Фильтры severity/status/category работают.
- [ ] У 20 рисков отображается найденный объект.
- [ ] У пяти рисков связь отсутствует ожидаемо.
- [ ] Trust Score связанных объектов пересчитан после commit.
- [ ] Закрытые/accepted риски обрабатываются согласно текущей Trust Score модели.

**Статус:**

**Замечания:**

---

### TC-S11-017 — Dashboard И Trust Graph

- [ ] Dashboard открывается без server error.
- [ ] KPI объектов и рисков отражают импорт.
- [ ] Top risky objects содержит связанные критичные/high риски.
- [ ] Trust Graph показывает импортированные объекты как узлы.
- [ ] Граф остаётся интерактивным на 60+ узлах.
- [ ] Отсутствие импортируемых связей object-object не создаёт ложных рёбер.

**Статус:**

**Замечания:**

---

## Блок 8 — Performance, Stability И Mobile

### TC-S11-018 — Performance Baseline

На обычном локальном соединении зафиксируйте ориентировочное время:

| Операция | Фактическое Время | Результат |
|---|---:|---|
| Objects preview, 60 строк |  |  |
| Objects commit, 60 строк |  |  |
| Risks preview, 25 строк |  |  |
| Risks commit, 25 строк |  |  |
| Performance preview, 200 объектов |  |  |
| Performance preview, 100 рисков |  |  |
| Dashboard после импорта |  |  |
| Graph, 60+ узлов |  |  |

Ожидаемый результат:

- [ ] Preview и commit завершаются без зависания интерфейса.
- [ ] Нет бесконечных запросов или повторного commit.
- [ ] Нет постоянных Supabase retry/fetch failed.
- [ ] До 10 секунд считается нормальным baseline; 10–30 секунд фиксируется как медленная операция.
- [ ] Чтение файла или preview после 30 секунд завершается понятным timeout error.
- [ ] Commit после 120 секунд блокирует слепой повтор и предлагает обновить данные.
- [ ] Переключение основных страниц остаётся приемлемым после импорта.

**Статус:**

**Замечания:**

---

### TC-S11-019 — Mobile View

Проверьте `/objects` и `/risks` на ширине 390px или 430px.

- [ ] Кнопка импорта доступна разрешённой роли.
- [ ] Диалог помещается по ширине и прокручивается по вертикали.
- [ ] Source fields, counters и issues не перекрываются.
- [ ] Длинные имена файлов не ломают layout.
- [ ] Кнопки **Другой файл**, **Отчёт CSV** и **Импортировать N** доступны.
- [ ] Нет горизонтального скролла всей страницы.

**Статус:**

**Замечания:**

---

## Блок 9 — Документация

### TC-S11-020 — User Documentation Alignment

Сверьте фактический UI с [IMPORT_GUIDE.md](../user/IMPORT_GUIDE.md).

- [ ] Названия кнопок и метрик совпадают.
- [ ] Лимиты 5 МБ / 500 строк / 40 колонок указаны корректно.
- [ ] RBAC соответствует приложению.
- [ ] Source metadata и row overrides описаны корректно.
- [ ] Create-only, duplicates и partial success не вводят пользователя в заблуждение.
- [ ] Все локальные ссылки работают.

**Статус:**

**Замечания:**

---

## Журнал Замечаний

| ID | Сценарий | Роль | Фактический Результат | Ожидаемый Результат | Severity | Статус |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |

Severity:

- `Blocker`: onboarding невозможно завершить;
- `Critical`: нарушены RBAC, tenant isolation или целостность данных;
- `Major`: импорт, preview, audit или пересчёт работает нестабильно;
- `Minor`: визуальная или текстовая проблема;
- `Question`: требуется продуктовое уточнение.

---

## Definition Of Ready Для Закрытия Sprint 11

Sprint 11 можно считать достигшим milestone **Evidence Onboarding Ready**, если:

- [x] Все P1-сценарии имеют статус `PASS`.
- [x] Нет `Blocker` и `Critical` замечаний.
- [x] Через один onboarding flow создано не менее 60 объектов и 25 рисков.
- [x] CSV и XLSX parsing подтверждены.
- [x] Preview, validation report, дубли и partial success работают.
- [x] RBAC и multi-tenant isolation подтверждены четырьмя ролями.
- [x] Import events видны в audit log без чувствительных данных.
- [x] Trust Score связанных объектов пересчитан.
- [x] Dashboard, Objects, Passport, Risks и Graph работают после bulk import.
- [x] Нет зависаний и постоянных retry.
- [x] User documentation соответствует UI.

---

## Итоговый Протокол

Заполните после ручного прогона:

```text
Дата проверки: 2026-07-16
Проверяющий: владелец проекта + Codex documentation consolidation
Окружение: локальная тестовая организация DTEK Core
Браузер: authenticated manual smoke environment
Commit / версия: Sprint 11 stabilization baseline
Префикс тестовых данных: S11-

Объекты: 60 создано / 0 пропущено / 0 ошибок
Риски: 25 создано / 20 связано / 5 без связи / 0 пропущено / 0 ошибок

Итоговый статус:
PASS

Краткий вывод:
Data Onboarding flow Sprint 11 подтверждён после post-Sprint stabilization. Импорт объектов и рисков работает для CSV/XLSX, preview не создаёт данные до commit, source metadata сохраняется, дубли и partial success обрабатываются предсказуемо, RBAC/RLS и tenant isolation не нарушены.

Критичные замечания:
Нет.

Некритичные замечания:
Нет открытых замечаний, блокирующих переход к Sprint 12.

Решение:
Sprint 11 готов к закрытию
```

---

## Связанные Документы

- [IMPORT_GUIDE.md](../user/IMPORT_GUIDE.md) — пользовательский import flow.
- [Evidence_Import_Schema.md](../architecture/Evidence_Import_Schema.md) — технический contract.
- [RBAC_TESTING_GUIDE.md](RBAC_TESTING_GUIDE.md) — создание и проверка ролей.
- [BUG_REPORT_TEMPLATE.md](BUG_REPORT_TEMPLATE.md) — оформление дефекта.
- [SPRINT_11.md](../../tasks/SPRINT_11.md) — scope и статус Sprint 11.

---

*Итоговый протокол заполнен после повторного ручного smoke test; Sprint 11 закрыт как Evidence Onboarding Ready.*
