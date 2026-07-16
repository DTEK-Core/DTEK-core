# Sprint 11 Import — Test Data

`Назначение: воспроизводимое ручное и автоматическое тестирование CSV/XLSX import`
`Актуально: post-Sprint 11 stabilization`

---

## Быстрый Старт

Пересоздать детерминированные CSV fixtures:

```bash
npm run test:import:fixtures
```

Запустить автоматические contract-тесты parser, mapping, preview, duplicates и partial success:

```bash
npm run test:import
```

Полный authenticated UI-прогон выполняется по [DATA_ONBOARDING_SMOKE_TEST_CHECKLIST.md](../../docs/testing/DATA_ONBOARDING_SMOKE_TEST_CHECKLIST.md).

---

## Структура

| Папка | Назначение |
|---|---|
| `objects/` | Валидные объекты, локализованные заголовки и tab delimiter |
| `risks/` | Валидные риски и пример собственного Risk CSV export |
| `partial-success/` | Валидные строки + error + duplicate в одном файле |
| `duplicates/` | Повтор первых записей основного набора после успешного import |
| `invalid/` | Файлы неправильного типа и некорректные заголовки |
| `performance/` | 200 объектов и 100 рисков для performance baseline |

---

## Основной Ручной Прогон

1. Создайте отдельную тестовую организацию.
2. Импортируйте `objects/objects-valid-60.csv` через `/objects`.
3. Сохраните `risks/risks-valid-25.csv` как XLSX без изменения первого листа.
4. Импортируйте XLSX через `/risks`.
5. Повторите оба файла из `duplicates/` после основного import.
6. Проверьте Dashboard, Objects, Passport, Risks и Graph.

Ожидается:

- 60 созданных объектов;
- 25 созданных рисков;
- 20 автоматически связанных рисков;
- 5 рисков без связи;
- повторные файлы дают `К созданию: 0`;
- source context присутствует в импортированных descriptions.

### Проверка XLSX

CSV и XLSX используют общий mapping/validation pipeline, но разные browser parser paths. Для XLSX-проверки откройте любой fixture в Excel или LibreOffice Calc и сохраните как `.xlsx`:

- данные должны находиться на первом листе;
- строка заголовков должна остаться первой;
- не объединяйте ячейки;
- не меняйте значения технических enum.

---

## Контрольные Partial Success Наборы

`partial-success/objects-partial-success.csv`:

- строк: 5;
- valid: 4;
- creatable: 3;
- errors: 1;
- duplicates: 1.

`partial-success/risks-partial-success.csv` имеет те же ожидаемые counters при наличии объекта `S11-OBJ-SRV-001`.

---

## Неправильный Тип Файла

- `invalid/risk-file-for-object-import.csv` должен показать переход к импорту рисков;
- `invalid/object-file-for-risk-import.csv` должен показать переход к импорту объектов;
- технический preview с десятками unknown columns появляться не должен.

---

## Risk Export Roundtrip

`risks/dtek-core-risk-export-sample.csv` повторяет локализованный формат `/api/reports/risks`:

- display-колонки сохраняются для читаемости;
- `Категория key`, `Критичность key`, `Статус key` имеют приоритет при import;
- Owner, Author, internal IDs и Evidence note безопасно игнорируются;
- `Linked objects` поддерживает первую автоматическую связь;
- если в export перечислено несколько объектов через `;`, preview показывает informational message.

Object CSV export в текущем MVP отсутствует: кнопка на `/objects` отключена. Objects Template и fixtures являются источником import contract.

---

## Безопасность

- Используйте только отдельную тестовую организацию.
- Не добавляйте реальные IP, email, секреты и customer data в fixtures.
- Не изменяйте `organization_id` или внутренние UUID вручную.
- Не запускайте повторный commit после client timeout, пока не обновили страницу и не проверили результат.
