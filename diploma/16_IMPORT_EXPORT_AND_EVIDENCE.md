# 16. Import, export и Evidence

Import быстро переносит существующие CSV/XLSX данные; template задаёт ожидаемые колонки; export выгружает уже существующие данные. Parsing превращает файл в matrix, normalization приводит заголовки/значения, mapping связывает колонки с полями, validation проверяет правила.

```text
файл → parser → headers/normalization → validation
→ duplicate check → preview → confirmation → commit → UI
```

Warning допускает осознанное продолжение; blocking error запрещает строку/файл. Partial success сохраняет валидные строки и возвращает failures. Commit работает create-only: существующие записи не обновляются и полный rollback файла отсутствует.

Ограничения: 5 МБ, до 500 строк; реализованы localized headers, dataset mismatch, duplicates и error report. Pure import functions покрыты контрактными тестами.

Source Metadata отвечает «источник, дата сбора, confidence, файл/record». Сейчас `appendSourceBlock()` добавляет trailing `[Import Source]` в description. Это полезный первый ingestion path, но не независимый immutable evidence record.

Отчёты: risk CSV, printable/PDF-oriented Passport и Executive Report; RBAC и audit применяются по типу отчёта.

> Главное, что нужно запомнить: preview не записывает данные, а commit записывает только подтверждённые валидные строки.

## Проверь себя

1. Чем template отличается от export?
2. Что означает partial success?
3. Почему повторный import всего файла опасен?
4. Чем source block отличается от Evidence table?

