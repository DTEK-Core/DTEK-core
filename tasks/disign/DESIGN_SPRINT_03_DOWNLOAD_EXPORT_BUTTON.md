# DESIGN SPRINT 03 — Download & Export Button

`Статус: IMPLEMENTED / MANUAL AUTHENTICATED QA PENDING`  
`Дата создания: 17.08.2026`  
`Область: реальные file download/export actions DTEK Core`

---

## 1. Название

Единый lifecycle-компонент скачивания и экспорта файлов.

## 2. Цель

Сделать формирование и скачивание файлов понятным: показывать реальное начало
операции, неопределённую по длительности загрузку, успешное завершение или
ошибку без имитации progress и без повторных запросов.

## 3. Причина

Рабочие экспорты использовали обычные ссылки или локальные кнопки. Пользователь
не видел единого feedback, а длительность server-side формирования CSV/PDF не
была отражена в UI.

## 4. Current State

- Risk Registry CSV формируется route handler `GET /api/reports/risks`.
- Object/Risk import templates являются статическими CSV в `public/templates`.
- CSV validation report формируется синхронно на клиенте из import issues.
- Trust Passport и Executive PDF используют printable HTML: после audit Server
  Action открывается системный print dialog (`window.print`).
- «Экспорт» на Objects пока disabled и не имеет download pipeline.
- Dashboard «Отчёт CISO» и Passport «PDF» открывают страницы отчётов, а не
  скачивают файл непосредственно.
- XLSX export/download в текущем продукте отсутствует; XLSX поддерживается как
  входной формат импорта.

## 5. Requested Changes

- Создать shared `DownloadButton`.
- Реализовать `idle`, `loading`, `success`, `error`, `disabled`.
- Связать loading с настоящим Promise/fetch lifecycle.
- Добавить отдельную правую область, движение download arrow, success fill,
  arrow-to-check transition, смену текста и pressed feedback.
- Сохранить текущие tokens, размеры, responsive, keyboard/focus и reduced motion.
- Исключить GSAP и искусственную трёхсекундную загрузку.

## 6. UX Analysis

Запуск состоит из короткой CSS-реакции и indeterminate arrow loop, который
может продолжаться столько, сколько длится реальная операция. После получения
Blob или завершения callback иконка становится checkmark, текст — «Готово»;
затем UI возвращается в idle. Ошибка показывает «Повторить» и toast. Повторный
клик во время loading блокируется native `disabled`.

## 7. Functional Safety

Route handlers, Server Actions, форматы, содержимое, имена, фильтры, audit,
RBAC/RLS и multi-tenancy не меняются. Risk CSV по-прежнему использует текущий
authenticated route. Printable reports по-прежнему используют audit action и
browser print. JSON error response не сохраняется как файл.

## 8. Components Affected

- Новый shared `DownloadButton`.
- Risk Registry toolbar export.
- Object/Risk import templates через общий `DataImportDialog`.
- Import validation CSV report.
- Passport and Executive printable report actions.

## 9. Files Affected

- `components/shared/download-button.tsx` (создан).
- `components/shared/risks/risks-page-client.tsx`.
- `components/shared/import/data-import-dialog.tsx`.
- `components/shared/reports/report-actions.tsx`.
- `app/globals.css`.
- `tasks/disign/DESIGN_SPRINT_03_DOWNLOAD_EXPORT_BUTTON.md` (создан).
- `CHANGELOG.md`.

## 10. Design Materials

Владелец предоставил визуальную логику: sliding text, animated arrow, right-side
success fill, arrow-to-check и active scale. Реализация адаптирована под DTEK
tokens и существующую pill Button System без копирования vanilla JS/GSAP.

## 11. Tasks

- [x] Найти реальные download/export actions.
- [x] Отделить navigation и disabled placeholders от downloads.
- [x] Создать shared lifecycle component.
- [x] Реализовать Blob fetch, filename parsing и object URL cleanup.
- [x] Интегрировать CSV route, templates, validation CSV и printable reports.
- [x] Добавить toast error, retry, click lock и reduced motion.
- [x] Выполнить static/type/build regression checks.
- [ ] Выполнить authenticated browser QA реальных exports и mobile layout.

## 12. Acceptance Criteria

- Loading завершается только после реального response Blob/callback.
- Фиксированной длительности network animation и выдуманных процентов нет.
- Success не показывается при ошибке; retry остаётся доступен.
- Повторный click во время loading невозможен.
- Object URL освобождается после инициирования скачивания.
- Доступность и focus-visible сохраняются, reduced motion отключает transforms.
- Существующие export permissions и payload не меняются.

## 13. Regression Checklist

- [ ] Быстрый static template CSV.
- [ ] Более долгий authenticated Risk Registry CSV.
- [ ] Object and Risk template download.
- [ ] Import validation CSV.
- [ ] Passport printable PDF flow.
- [ ] Executive printable PDF flow.
- [ ] Error response and retry.
- [ ] Repeated click during loading.
- [ ] Two sequential downloads.
- [ ] Desktop, tablet, mobile and compact toolbar.
- [ ] Keyboard focus and screen-reader status.
- [ ] Reduced motion.

Автоматические quality gates и source-level regression не заменяют
authenticated ручную проверку браузерного скачивания/print dialog. Эти пункты
не отмечаются как PASS до фактического прогона владельцем или в доступной
authenticated browser session.

## 14. Status

`IMPLEMENTED / MANUAL AUTHENTICATED QA PENDING`

Владелец прямо запросил реализацию 17.08.2026. Продуктовый код реализован;
authenticated browser QA остаётся честно незакрытым release-check пунктом.
