# CHANGELOG — DTEK Core

Все значимые изменения фиксируются в этом документе.  
Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/).

---

## Strategic Shift — 2026-07-09

### Evidence-first Trust Platform

#### Добавлено

- `docs/product/EVIDENCE_FIRST_STRATEGY.md` — новая продуктовая концепция DTEK Core как Evidence-first Trust Intelligence Platform.
- `docs/architecture/Evidence_First_Architecture.md` — целевая архитектура Discovery Layer, Connector Framework, Evidence Layer, Normalization, Identity Resolution, Confidence Engine, Discovery Inbox, Drift Detection и Auto Risk Mapper.
- ADR-007 в `ARCHITECTURE_DECISIONS.md` — архитектурное решение о переходе от manual-first MVP к evidence-first развитию.

#### Изменено

- README, AGENTS, Product Strategy, Vision, Product Concept, Roadmap и Sprint Roadmap синхронизированы с новой концепцией.
- Sprint 11–15 перестроены вокруг Evidence Import, evidence-backed explainability, evidence-aware risk workflow, pilot source inventory и Connector Framework Foundation.
- Trust Passport, Trust Score, Trust Graph и Risk Registry описаны как evidence-backed модели.
- Backlog и User Stories дополнены Evidence-first Epic: Discovery Layer, Evidence Layer, Identity Resolution, Discovery Inbox, Auto Risk Mapper и Drift Detection.

---

## Sprint 11 — Evidence Import & Data Onboarding

### Sprint 11 Closure — Evidence Onboarding Ready

#### Изменено

- Sprint 11 переведён из стабилизации в закрытое состояние после повторной ручной приёмки Data Onboarding.
- README, Documentation Index, Roadmap, Sprint Roadmap, MVP Release Plan, Feature Backlog, AGENTS и smoke checklist синхронизированы с фактическим состоянием Sprint 11.
- Следующий активный этап зафиксирован как Sprint 12 — Evidence-backed Trust Explainability.

#### Проверено

- Повторный smoke test подтвердил import flow для 60 объектов и 25 рисков, CSV/XLSX parsing, preview, source metadata, duplicate detection, partial success, RBAC/tenant isolation, audit events и связанные страницы.

### Post-Sprint 11 — Import Stabilization

#### Исправлено

- Risk CSV export DTEK Core повторно импортируется через localized header mapping и приоритет технических `*_key` колонок.
- Файлы неправильного типа распознаются до preview и направляют пользователя в соответствующий import modal.
- Async file read, preview и commit всегда завершаются success, error или timeout state; после неизвестного commit status слепой повтор блокируется.
- Unknown, ignored и mapped headers группируются; preview разделяет errors, warnings и information.
- Duplicate messages указывают конкретные matching fields; tab-separated CSV поддерживается parser.

#### Добавлено

- `testing/sprint-11-import/` с valid 60/25, partial success, duplicate, invalid, localized, export roundtrip и performance 200/100 fixtures.
- `npm run test:import` с contract-тестами parser, mapping, templates, roundtrip, RBAC, duplicates и partial success.

#### Безопасность

- Server-side wrong-dataset validation дублирует client UX; RBAC и tenant-scoped organization checks сохранены без миграций и изменений RLS.

### S11-T008 — Data Onboarding Smoke Test

#### Добавлено

- Ручной smoke test модуль Data Onboarding с контрольным импортом 60 объектов и 25 рисков.
- Сценарии CSV/XLSX, preview, validation report, source metadata, duplicates, partial success, RBAC, tenant isolation, audit, Trust Score, основных страниц, performance и mobile UI.

#### Изменено

- README, Documentation Index, Import Guide и Sprint 11 связаны с новым checklist.
- На момент S11-T008 Sprint 11 был переведён в состояние готовности к ручной приёмке без преждевременного объявления runtime-проверок успешными.

### S11-T007 — Import Documentation

#### Добавлено

- Полное пользовательское руководство по CSV/XLSX import объектов и рисков: роли, contract, source metadata, preview, validation report, partial success и ограничения.
- Раздел диагностики типовых import errors в FAQ и Troubleshooting.

#### Изменено

- User Guide, Platform Workflow, Object Model Guide и Risk Registry Guide синхронизированы с фактическим import flow Sprint 11.
- README, Documentation Index, Evidence Import Schema и Sprint 11 связаны с пользовательской документацией.

### S11-T006 — Import Audit Events

#### Добавлено

- Audit events `import.objects_completed`, `import.risks_completed` и `import.failed`.
- Общий server-side import audit helper с sanitization file/source strings и агрегированных counters.
- Отображение import events, результата и инициатора в журнале аудита `/settings`.
- Security tests для успешного objects/risks import и validation failure.

#### Изменено

- Object/Risk commit фиксирует полный, частичный и неуспешный результат без записи raw CSV/XLSX data.
- Sprint 11, Evidence Import Schema, README и security-документация синхронизированы с S11-T006.

### S11-T005 — Import Templates

#### Добавлено

- Канонический CSV-шаблон импорта объектов с допустимой примерной строкой.
- Канонический CSV-шаблон импорта рисков и связи с объектом.
- Download-команда «Шаблон CSV» в общих диалогах импорта Objects и Risks.

#### Изменено

- `tasks/SPRINT_11.md`, README и Evidence Import Schema синхронизированы с фактическими template URL и UX S11-T005.

### S11-T004 — Import Preview, Validation & Source Metadata

#### Добавлено

- File-level source metadata для objects/risks import: название, тип, confidence, дата сбора и комментарий.
- Расширенный preview с total, valid, creatable, error, duplicate и warning counters.
- Source summary с effective defaults и количеством построчных переопределений.
- Полный UTF-8 CSV validation report с исходными значениями, рекомендациями и защитой от spreadsheet formula injection.

#### Изменено

- Построчные source-поля имеют приоритет над metadata, заданными в диалоге импорта.
- Preview и commit используют один source payload и повторную server-side validation.
- `tasks/SPRINT_11.md`, README и Evidence Import Schema синхронизированы с реализацией S11-T004.

### S11-T003 — Risks CSV/XLSX Import

#### Добавлено

- Диалог импорта рисков на `/risks` с CSV/XLSX preview и явным commit.
- Server-side risk import pipeline: aliases, CVSS, SLA/due date, source context, duplicate detection и object matching.
- Безопасная привязка импортированных рисков к объектам текущей организации по имени или уникальному IP.
- Общий import UI и shared parsing/validation primitives для objects и risks import.

#### Изменено

- Trust Engine поддерживает отложенный пересчёт organization index для эффективного batch risk import.
- Стили import dialog перенесены в global scope и переиспользуются страницами Objects и Risks.
- `tasks/SPRINT_11.md`, README и Evidence Import Schema синхронизированы с реализацией S11-T003.

### S11-T002 — Objects CSV/XLSX Import

#### Добавлено

- Диалог импорта объектов на `/objects` с поддержкой CSV и первого листа XLSX.
- Browser file reader для CSV/XLSX и server-side import pipeline с Zod validation, enum aliases, source context и duplicate detection.
- Server Actions для validation preview и подтверждённого create-only импорта с partial success.
- Зависимость `read-excel-file` для безопасного чтения XLSX без spreadsheet editor или изменения БД.

#### Изменено

- RBAC импорта соответствует ADR-003 и import schema: `owner`/`analyst` импортируют все типы, `admin` — инфраструктурные, `viewer` не имеет доступа.
- Лимит Server Actions увеличен до 8 МБ при сохранении import-ограничений 5 МБ, 500 строк и 40 колонок.
- `tasks/SPRINT_11.md`, README и Evidence Import Schema синхронизированы с реализацией S11-T002.

### S11-T001 — Evidence Import Schema Specification

#### Добавлено

- `docs/architecture/Evidence_Import_Schema.md` — контракт CSV/XLSX импорта объектов и рисков: обязательные/опциональные колонки, source metadata, enum aliases, RBAC, validation preview, error report, duplicate/matching strategy, safe partial success, audit event contract и минимальные templates.

#### Изменено

- `tasks/SPRINT_11.md` отмечает S11-T001 как завершённую и добавляет колонку статуса задач Sprint 11.
- `DOCUMENTATION_INDEX.md`, `README.md` и `Evidence_First_Architecture.md` дополнены ссылкой на import schema specification.

---

## Sprint 10 — Reporting & Export

### Sprint Transition — Sprint 10 Closed, Sprint 11 Ready

#### Изменено

- Sprint 10 отмечен как завершённый в `tasks/SPRINT_10.md`, Roadmap и Documentation Index.
- На момент перехода после Sprint 10 Sprint 11 был переведён в статус готовности к старту как следующий этап Roadmap.
- `README.md` обновлён: текущий фокус теперь Sprint 11 Evidence Import & Data Onboarding.
- `ARCHITECTURE_DECISIONS.md`, `docs/architecture/User_Roles.md` и RBAC-документация синхронизированы с фактической MVP-моделью ролей.

### Manual Testing Follow-up — RBAC testing clarification

#### Изменено

- `docs/testing/RBAC_TESTING_GUIDE.md` теперь явно объясняет, что первый пользователь организации получает роль `owner`, а `admin` создаётся только через приглашение.
- RBAC-документация синхронизирована с фактическим MVP-flow: invite-ссылки создаёт `owner`, `admin` управляет не-owner пользователями и инфраструктурными объектами.
- Reporting smoke checklist и пользовательские guides уточняют, что тестовые роли должны находиться в одной организации и создаваться через invite-ссылки.

### S10-T008 — Reporting Smoke Test Checklist

#### Добавлено

- `docs/testing/REPORTING_SMOKE_TEST_CHECKLIST.md` — ручной smoke test модуль Sprint 10 Reporting & Export.

#### Изменено

- `DOCUMENTATION_INDEX.md` дополнен ссылкой на Sprint 10 Reporting manual smoke test.
- `tasks/SPRINT_10.md` отмечает S10-T008 как завершённую.

### S10-T007 — User Documentation

#### Добавлено

- `docs/user/REPORTS_AND_EXPORT_GUIDE.md` — пользовательское руководство по Trust Passport PDF, Risk Registry CSV и Executive Organization Report.

#### Изменено

- `USER_GUIDE.md`, `FAQ.md`, `OBJECT_MODEL_GUIDE.md` и `RISK_REGISTRY_GUIDE.md` дополнены сценариями отчётов и экспорта.
- `DOCUMENTATION_INDEX.md` и `README.md` синхронизированы с пользовательской документацией Sprint 10.
- `tasks/SPRINT_10.md` отмечает S10-T007 как завершённую.

### S10-T006 — Report Empty/Error States

#### Добавлено

- Report-specific `not-found` и `error` screens для `/reports/*`.
- `components/shared/reports/report-state.tsx` — общий UI-блок для empty/error состояний отчётов.
- Report layout для общего подключения print/report CSS в специальных состояниях маршрута.

#### Изменено

- Executive Report теперь явно показывает состояние пустой цифровой модели вместо пустых графиков и дефолтной факторной аналитики.
- Risk CSV endpoint возвращает безопасное сообщение об ошибке без внутренних деталей при сбое генерации.
- `tasks/SPRINT_10.md` отмечает S10-T006 как завершённую.

### S10-T005 — Report Access Control & Audit Events

#### Добавлено

- `lib/reports/access.ts` — единая RBAC-матрица отчётов согласно ADR-008.
- `lib/actions/reports.ts` — Server Action для audit-событий printable report export перед browser print/save as PDF.

#### Изменено

- Trust Passport, Risk CSV и Executive Report используют общий report access helper.
- Printable reports фиксируют `report.passport_exported` и `report.executive_exported` по кнопке сохранения PDF.
- `createSecurityEvent()` теперь ожидает попытку записи audit event и безопасно логирует ошибки без падения основного сценария.
- Audit Log отображает report-события человекочитаемыми названиями.
- `tasks/SPRINT_10.md` отмечает S10-T005 как завершённую.

### S10-T004 — Executive Organization Report

#### Добавлено

- `/reports/executive` — защищённая печатная версия executive organization report для CISO-сценария.
- `lib/reports/executive-report.ts` — server-side сбор управленческой сводки организации: Trust Score, KPI, distribution, factor averages, top risky objects, critical risks и source/evidence coverage.

#### Изменено

- Dashboard получил точку входа в executive report для ролей `owner` и `analyst`.
- Открытие executive report логируется audit event `report.executive_opened`.
- `tasks/SPRINT_10.md` отмечает S10-T004 как завершённую.

### S10-T003 — Risk Registry CSV Export

#### Добавлено

- `/api/reports/risks` — защищённый CSV export endpoint для Risk Registry.
- `lib/reports/csv.ts` — безопасная CSV-сериализация с UTF-8 BOM.
- `lib/reports/risk-csv.ts` — server-side сбор, фильтрация и mapping рисков для CSV.

#### Изменено

- Кнопка экспорта на странице Risk Registry теперь скачивает CSV с текущими фильтрами.
- Экспорт доступен только ролям `owner` и `analyst` согласно ADR-008.
- `tasks/SPRINT_10.md` отмечает S10-T003 как завершённую.

### S10-T002 — Trust Passport PDF Export

#### Добавлено

- `/reports/passport/[id]` — защищённая печатная версия Trust Passport для browser print/save as PDF.
- `lib/reports/passport-report.ts` — server-side assembler данных паспорта, используемый обычной страницей и report page.
- `app/report.css` — print-optimized стили для отчётов Sprint 10.
- `components/shared/reports/report-actions.tsx` — кнопки возврата и сохранения PDF.

#### Изменено

- Кнопка `PDF` на странице Trust Passport теперь открывает печатный отчёт.
- `lib/security/audit.ts` дополнен report/export event types для Sprint 10.
- `tasks/SPRINT_10.md` отмечает S10-T002 как завершённую.

### S10-T001 — Reporting Architecture Decision

#### Добавлено

- `docs/architecture/Reporting_Architecture.md` — архитектура отчётов Sprint 10: print-optimized HTML reports, CSV route handlers, RBAC, audit events и Evidence-first compatibility.
- ADR-008 в `ARCHITECTURE_DECISIONS.md` — решение не добавлять тяжёлые PDF/BI зависимости в S10-T001.

#### Изменено

- `tasks/SPRINT_10.md` отмечает S10-T001 как завершённую и фиксирует выбранный подход к PDF/CSV.
- `DOCUMENTATION_INDEX.md` и `System_Architecture.md` дополнены ссылками на Reporting Architecture.

---

## [v0.8.0] — 2026-06-30 (Sprint 08 — UX Refinement)

### Sprint 09 — Market MVP Packaging

#### Добавлено

- `docs/product/DEMO_NARRATIVE.md` — сценарий демонстрации DTEK Core для CISO и первых интервью (S09-T001).
- `docs/product/DEMO_DATASET_SPEC.md` — спецификация демонстрационной организации, объектов, рисков, ролей и связей для Market MVP demo (S09-T002).
- `docs/product/DEMO_SEED_PLAN.md` — безопасный план ручного наполнения demo organization через существующий UI без миграций и seed-скриптов (S09-T003).
- `docs/product/ICP_INTERVIEW_SCRIPT.md` — ICP, discovery-вопросы, expected signals и scoring rubric для интервью с CISO и ИБ-интеграторами (S09-T004).
- `docs/product/PRODUCT_ONE_PAGER.md` — one-pager DTEK Core для CISO с проблемой, решением, value proposition и 14-дневным pilot offer (S09-T005).
- `docs/product/COPY_ALIGNMENT.md` — перечень правок landing/README copy под Market MVP стратегию (S09-T006).
- `docs/product/PILOT_OFFER.md` — 14-дневный сценарий пилота для CISO с входными данными, планом, deliverables, success criteria и security boundary (S09-T007).
- `docs/product/SPRINT09_DOCUMENTATION_SYNC.md` — финальная синхронизация README, roadmap, documentation index и user docs после Sprint 09 (S09-T008).

#### Изменено

- **Landing/Product Copy Alignment** (S09-T006) — лендинг и README приведены к позиционированию Digital Trust & Cyber Risk Management без обещаний SIEM/EDR/CMDB/GRC или ранних интеграций.
- **Sprint 09 Documentation Sync** (S09-T008) — Sprint 09 отмечен как завершённый, Roadmap/README/User Guide синхронизированы со статусом Demo Ready + Interview Ready.

### Sprint 08 — UX Refinement & Platform Polish

#### Добавлено

- **Configurator presets** (S08-T004) — отраслевые профили весов Trust Score и новая иконка Конфигуратора.
- **Loading states** (S08-T007) — skeleton-экраны для основных защищённых маршрутов.
- **Users Role Info Card** (S08-T009) — карточка с описанием прав ролей на странице пользователей.
- **Invitation link UX** (S08-T003) — после создания приглашения UI показывает ссылку, email и роль; активное повторное приглашение возвращает существующую ссылку.

#### Изменено

- **Sidebar** (S08-T001) — раздел «Настройки» перемещён из группы «Управление» в footer-зону боковой панели, над блоком профиля пользователя. Соответствует дизайн-прототипу `design/src/shell.jsx`. Active-state и иконка сохранены.
- **Users table** (S08-T002) — устранено визуальное смещение колонок таблицы участников: разделены стили `.uth-c`/`.ut-c`; последняя колонка body теперь flex-контейнер полной ширины (ранее сужалась через `justify-self: end`); добавлен `min-width: 0` на все ячейки; text-overflow ellipsis для длинных имён и email; удалён дублирующий inline-style из `user-row.tsx`.
- **Audit Log** (S08-T005) — визуальная модернизация журнала аудита: категории событий, фильтры, иконки и отображение инициатора.
- **Dashboard** (S08-T006) — реструктурирован layout Центра управления.
- **Navigation affordance** — вся область названия вкладки стала функциональной ссылкой.
- **Settings profile controls** (S08-T008) — полировка кнопок и профиля.

### Strategic Consolidation — 2026-07-08

#### Добавлено

- `AI_DEVELOPMENT_GUIDE.md` — актуальный инженерный регламент для AI-разработки.
- `docs/product/PRODUCT_STRATEGY.md` — стратегическое позиционирование DTEK Core как Digital Trust & Cyber Risk Management Platform.
- `docs/roadmap/ROADMAP.md` — roadmap от Functional MVP к Market MVP.
- `docs/roadmap/SPRINT_ROADMAP.md` — единый план будущих спринтов без создания Sprint 09.
- `docs/architecture/TECHNICAL_DEBT.md` — реестр технического долга и архитектурных рисков.
- `tasks/SPRINT_09.md`–`tasks/SPRINT_15.md` — полный комплект Sprint-документов до коммерческого MVP и первого connector prototype.

#### Изменено

- `README.md`, `DOCUMENTATION_INDEX.md`, `Vision.md`, `Product_Concept.md`, `MVP_Scope.md`, `System_Architecture.md` приведены к новой стратегии и фактической архитектуре.
- `ARCHITECTURE_DECISIONS.md` дополнен ADR-006 о продуктовой границе Market MVP.
- `tasks/MVP_RELEASE_PLAN.md` дополнен Market MVP Foundation вместо узкого Post-MVP export-only этапа.
- `docs/security/SECURITY_OVERVIEW.md` исправляет описание роли `admin` в соответствии с ADR-003.

#### Удалено / Архивировано

- `docs/development/CONFIGURATOR_GUIDE.md` удалён как дубль пользовательского guide.
- `docs/product/SPRINT08_ANALYSIS.md` перенесён в `docs/archive/SPRINT08_ANALYSIS.md` как исторический pre-review анализ.

---

## [v0.7.0] — 2026-06-25

### Sprint 07 — QA & Platform Testing

#### Исправлено

- **Configurator UX** — кнопка «Сохранить» работала только с суммой = 100%, но не давала пользователю понять почему заблокирована
  - Добавлена жёлтая подсказка с конкретным советом: «Уменьшите веса ещё на N%» / «Добавьте ещё N%»
  - Добавлен `title` tooltip на disabled-кнопку
  - Реализован двухкликовый confirm при сбросе весов (per spec `Configurator_Concept_Final.md §6`)
  - Добавлен CSS-класс `btn-danger` для кнопки подтверждения сброса

- **Документация TC-CFG-RBAC01** — ошибочно указывало «Только owner изменяет веса»
  - Исправлено: `Configurator_Concept_Final.md §4.1` — Аналитик ИБ **тоже** может изменять веса

- **RBAC_TESTING_GUIDE.md** — матрица ошибочно указывала admin=✅ для создания/удаления связей в графе
  - Исправлено: `lib/actions/relations.ts` разрешает только `owner` и `analyst` (ADR-003 подтверждает)

#### Добавлено

- `docs/testing/TEST_PLAN_SPRINT_05_07.md` — 58 тест-кейсов по 12 функциональным блокам
- `docs/testing/MANUAL_TESTING_GUIDE_S07.md` — 20-шаговое руководство ручного тестирования
- `docs/testing/RBAC_TESTING_GUIDE.md` — методология RBAC-тестирования с 16 тест-кейсами
- `docs/development/CONFIGURATOR_GUIDE.md` — пользовательское руководство по Конфигуратору
- `tasks/SPRINT_07.md` — документация QA-спринта

---

## [v0.6.0] — 2026-06-23

### Sprint 06 — Security Hardening

#### Добавлено

- **Next.js 15 upgrade** (S06-T006) — обновление с 14.x до 15.x, исправлены breaking changes (params/searchParams как Promise<>)
- **Security Headers** (S06-T004) — CSP, X-Frame-Options, X-Content-Type-Options, Permissions-Policy, Referrer-Policy через `next.config.mjs`
- **Rate Limiting** (S06-T005) — IP-based: 10 req/60s для `/join`, 60 req/60s для `/api/*`, payload > 100 KB → 413
- **Zod Input Validation** (S06-T001) — `lib/validation/schemas.ts` покрывает все Server Actions
- **RLS Hardening** (S06-T001) — migration `016_rls_hardening.sql`: ужесточение политик для всех таблиц
- **RBAC Fixes** (S06-T003) — исправлены ошибки разграничения прав: admin не может менять роль owner
- **Security Audit Log** (S06-T007) — migration `017_security_events.sql`, `lib/security/audit.ts`, UI в `/settings` → «Журнал аудита»
- Зависимости: `zod@3.24` (v4 API), обновлены `@supabase/*`, устранены npm audit предупреждения

---

## [v0.5.0] — 2026-06-22

### Sprint 05 — Trust Score Engine, Dashboard, Trust Graph, Configurator

#### Добавлено

- **Trust Score Engine** (S05-T001, T002, T003) — `lib/trust/calculate.ts`, `lib/trust/engine.ts`
  - Формула ADR-001: `Σ(factor_score × weight) / 100`, 6 факторов
  - Массовый пересчёт при изменении рисков, критичности объекта, весов
  - Автоматическая запись в `trust_score_history`
- **Dashboard** (`/dashboard`, S05-T004) — Trust Ring организации, KPI-карточки, топ-5 рисковых объектов, лента событий, Realtime обновления
- **Trust Graph** (`/graph`, S05-T005, T006) — D3-based граф: узлы-объекты с цветом по уровню доверия, drag-n-drop, управление связями (6 типов), боковая панель с деталями узла
- **Конфигуратор** (`/configurator`, S05-T007) — редактор весов 6 факторов, слайдеры + числовые поля, сохранение с массовым пересчётом, сумма весов = 100%
- Server Actions: `recalculateTrustScores`, `saveFactorWeights`, `createRelation`, `deleteRelation`

---

## [v0.4.0] — 2026-06-21

### Sprint 04 — Testing, Bug Fixing & Stabilization

#### Исправлено

- **BUG-001** — Выравнивание колонок в таблице объектов
  - `.oth` (button): добавлен `padding: 0` — устраняет смещение от браузерного padding по умолчанию
  - `.otable-row`: добавлены `width: 100%` и `overflow: hidden` — строки всегда одинаковой ширины
  - `.ot-c`: исправлена правостороннее выравнивание через `display: flex; justify-content: flex-end`
  - `.ot-cell`: добавлены `min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis`

- **BUG-002** — Кнопка «Редактировать» в Risk Drawer
  - Добавлен проп `onEdit?: () => void` в `RiskDrawerProps`
  - Кнопка «Редактировать» отображается в footer drawer для owner/analyst
  - Открывает `RiskFormDialog` в режиме редактирования с предзаполненными данными

- **BUG-003** — Медленный UX после действий с рисками
  - `RiskFormDialog`: диалог закрывается до `router.refresh()` — реакция мгновенная
  - `RiskDrawer`: оптимистичное обновление статуса через `optimisticStatus` state

- **BUG-004** — React hydration mismatch в форматировании дат
  - Создан `lib/utils/dates.ts` с фиксированным массивом `MONTHS_SHORT`
  - Устраняет расхождение Node.js ICU («21 июл.») и браузера («21 июля»)
  - Функции `relativeTime()`, `formatSla()`, `fmtDateShort()` вынесены в единый модуль

- **BUG-005** — Краш страницы при ошибке смены статуса риска
  - `changeStatus()` обёрнута в `try/catch` внутри `startTransition`
  - При ошибке: откат `optimisticStatus`, сообщение в footer — без краша

- **BUG-006** — Risk Drawer не закрывался при открытии редактирования
  - `onEdit` теперь вызывает `setSelectedId(null)` и `setEditRisk()` в одном батче

#### Добавлено

- `docs/testing/TEST_STRATEGY.md` — стратегия тестирования
- `docs/testing/TEST_PLAN_SPRINT_01_03.md` — 27 тест-кейсов по 6 модулям
- `docs/testing/BUG_REPORT_TEMPLATE.md` — шаблон отчёта об ошибке
- `docs/testing/TEST_REPORT_SPRINT_01_03.md` — результаты quality gate
- `docs/testing/MANUAL_TESTING_GUIDE.md` — руководство ручного тестирования (20 шагов)
- `tasks/SPRINT_04.md` — документация Sprint 04
- `CHANGELOG.md` — этот файл

---

## [v0.3.0] — 2026-06-20

### Sprint 03 — Digital Asset Management & Trust Risk Registry

#### Добавлено

- **Список объектов** (`/objects`) — таблица и карточки с сортировкой, фильтрацией, поиском
- **Детали объекта** (`/objects/[id]`) — 4 вкладки: факторы Trust Score, риски, связи, история
- **Trust Passport** (`/objects/[id]/passport`) — цифровой паспорт с 6-факторной разбивкой
- **Реестр рисков** (`/risks`) — таблица рисков с фильтрацией по статусу, серьёзности, категории
- **Risk Drawer** — боковая панель с деталями риска, CVSS-оценкой, привязкой к объекту
- **RiskFormDialog** — создание и редактирование рисков (CRUD)
- Shared компоненты: `TrustRing`, `SeverityTag`, `CritTag`, `TrustChip`, `Meter`, `FilterSelect`, `SortCaret`, `Icon`
- Server Actions: `createObject`, `updateObject`, `deleteObject`, `createRisk`, `updateRisk`, `deleteRisk`, `updateRiskStatus`, `linkRiskToObject`

#### Исправлено

- `app/landing.css`: `var(--border)` → `var(--border-subtle)` (4 вхождения) — устраняет невидимые границы

---

## [v0.2.0] — 2026-06-15

### Sprint 02 — Organization Management & Platform Setup

#### Добавлено

- **Лендинг** (`/`) — hero-секция с анимацией Trust Graph, ключевые блоки
- **Управление пользователями** (`/users`) — таблица участников, смена ролей
- **Настройки организации** (`/settings`) — профиль пользователя, настройки организации
- **Онбординг wizard** (`/onboarding/wizard`) — 5-шаговый мастер создания организации
- **Создание организации** (`/onboarding/create`) — форма регистрации первой организации
- **Приглашения** (`/invite/[token]`) — отправка приглашений, принятие по токену, отзыв
- Middleware — защита маршрутов, редирект при отсутствии организации
- 4 роли: `owner`, `analyst`, `admin`, `viewer`

---

## [v0.1.0] — 2026-06-13

### Sprint 01 — Foundation & Authentication

#### Добавлено

- **Аутентификация** — регистрация, вход, выход, сброс пароля
- **Supabase** — настройка Cloud проекта (EU West), 14 миграций БД
- **CI/CD** — GitHub Actions (lint → type-check → build), Vercel деплой
- **App Shell** — layout с навигацией, тёмная тема, CSS-переменные, шрифты
- **TypeScript strict** — конфигурация, псевдоним `@/`, типы БД
- **Базовые страницы**: `/login`, `/register`, `/forgot-password`, `/reset-password`

---

[v0.7.0]: https://github.com/DTEK-Core/DTEK-core/compare/v0.6.0...develop
[v0.6.0]: https://github.com/DTEK-Core/DTEK-core/compare/v0.5.0...v0.6.0
[v0.5.0]: https://github.com/DTEK-Core/DTEK-core/compare/v0.4.0...v0.5.0
[v0.4.0]: https://github.com/DTEK-Core/DTEK-core/compare/v0.3.0...v0.4.0
[v0.3.0]: https://github.com/DTEK-Core/DTEK-core/compare/v0.2.0...v0.3.0
[v0.2.0]: https://github.com/DTEK-Core/DTEK-core/compare/v0.1.0...v0.2.0
[v0.1.0]: https://github.com/DTEK-Core/DTEK-core/releases/tag/v0.1.0
