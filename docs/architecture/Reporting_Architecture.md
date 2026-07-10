# Reporting_Architecture.md — DTEK Core

`Статус: архитектурное решение`  
`Дата: 09.07.2026`  
`Решение: ADR-008`  
`Sprint: S10-T001 — Reporting Architecture Decision`

---

## 1. Назначение

Документ фиксирует архитектуру отчётов и экспорта для Sprint 10.

Цель Sprint 10 — дать CISO и аналитикам ИБ экспортируемые артефакты без смены стека и без преждевременной тяжёлой report/BI-инфраструктуры:

- Trust Passport PDF;
- Risk Registry CSV;
- Executive Organization Report;
- RBAC и audit events для экспорта.

---

## 2. Принятое Решение

Для Market MVP отчёты реализуются через **server-side report modules + защищённые Next.js route handlers / report pages**.

### PDF / Printable Reports

PDF-отчёты Sprint 10 реализуются как print-optimized HTML reports:

```text
Protected report page
  -> server-side data loading
  -> print CSS
  -> browser print/save as PDF
```

Причина: в текущем стеке нет PDF-библиотеки. Добавлять Puppeteer/Playwright/html-to-pdf engine или тяжёлый PDF renderer в S10-T001 преждевременно. Browser print-to-PDF закрывает Market MVP сценарий: пользователь получает передаваемый PDF-артефакт без нового runtime, очередей и серверного headless browser.

### CSV Export

CSV экспорт реализуется через route handler:

```text
GET /api/reports/risks.csv
  -> auth + RBAC
  -> server-side query
  -> CSV serialization
  -> Content-Disposition attachment
```

CSV должен использовать:

- UTF-8;
- BOM для корректного открытия в Excel;
- escaping кавычек, переносов строк и разделителей;
- фильтры только после server-side проверки организации;
- audit event после успешного export.

---

## 3. Почему Не Другие Варианты

| Вариант | Решение | Причина |
|---|---|---|
| Puppeteer/Playwright HTML-to-PDF на сервере | Не использовать в Sprint 10 | Тяжёлый runtime, деплой-риски на Vercel, возможные проблемы cold start |
| `@react-pdf/renderer` | Не добавлять в S10-T001 | Новая зависимость и отдельная layout-модель; вернуться, если print HTML не закроет pilot need |
| Генерация PDF вручную | Не использовать | Высокий риск ошибок формата, плохая поддерживаемость |
| BI/report designer | Не использовать | За пределами Market MVP |
| Supabase Edge Function для отчётов | Не использовать сейчас | Дублирует server-side слой Next.js и усложняет auth/audit |

---

## 4. Целевая Структура Кода

Рекомендуемая структура для последующих задач Sprint 10:

```text
app/
  (app)/
    reports/
      passport/[id]/page.tsx
      executive/page.tsx
  api/
    reports/
      risks/route.ts

lib/
  reports/
    access.ts
    passport-report.ts
    executive-report.ts
    risk-csv.ts
    csv.ts
```

Назначение:

| Файл | Назначение |
|---|---|
| `lib/reports/access.ts` | Auth/RBAC helpers for reports |
| `lib/reports/passport-report.ts` | Server-side data assembler for Trust Passport report |
| `lib/reports/executive-report.ts` | Server-side data assembler for organization report |
| `lib/reports/risk-csv.ts` | Query + mapping for Risk Registry CSV |
| `lib/reports/csv.ts` | Safe CSV serialization |
| `lib/actions/reports.ts` | Audit action for browser print/save as PDF flows |
| `app/(app)/reports/*` | Protected printable report pages |
| `app/api/reports/risks/route.ts` | CSV download endpoint |

---

## 5. Data Flow

### 5.1 Trust Passport Printable PDF

```text
User clicks "Export PDF"
  -> opens /reports/passport/{object_id}
  -> middleware verifies session
  -> report page loads server-side data
  -> RBAC/RLS validates organization access
  -> page renders print-optimized report
  -> user saves as PDF through browser print dialog
  -> audit event recorded
```

### 5.2 Risk Registry CSV

```text
User clicks "Export CSV"
  -> GET /api/reports/risks
  -> middleware verifies session and rate limit
  -> route handler verifies RBAC
  -> query uses organization_id from authenticated profile
  -> CSV is serialized server-side
  -> response has Content-Disposition attachment
  -> audit event recorded
```

### 5.3 Executive Report

```text
User opens /reports/executive
  -> server-side organization summary query
  -> top risky objects
  -> risk distribution
  -> Trust Score summary
  -> source/evidence placeholders
  -> print-optimized report
```

---

## 6. RBAC

Report access follows least privilege.

| Report | owner | analyst | admin | viewer |
|---|:---:|:---:|:---:|:---:|
| Trust Passport printable report | Yes | Yes | Yes | View only if object visible |
| Risk Registry CSV export | Yes | Yes | No | No |
| Executive Organization Report | Yes | Yes | No | No |

Notes:

- `viewer` can view object/passport data in the UI, but bulk export is not enabled for Market MVP.
- `admin` can view risks but does not receive bulk risk/export privileges in Sprint 10.
- Any future relaxation requires explicit update to RBAC docs and tests.

---

## 7. Audit Events

Sprint 10 should add report/export event types to the audit model:

- `report.passport_exported`;
- `report.risks_csv_exported`;
- `report.executive_opened`;
- `report.executive_exported`.

Minimum metadata:

```json
{
  "reportType": "passport | risk_csv | executive",
  "format": "print_html | csv",
  "targetId": "object_id or organization_id",
  "filters": {},
  "rowCount": 42
}
```

Audit failure must not block the export, but it must be visible in server logs.

S10-T005 implementation note:

- `lib/reports/access.ts` contains the central report RBAC matrix.
- Printable report buttons call a Server Action before `window.print()` to record export intent.
- `createSecurityEvent()` catches audit write failures internally and logs them server-side.

---

## 8. Security Requirements

- Report data is loaded only server-side.
- `organization_id` is derived from authenticated profile, never from client input.
- Route handlers must not accept arbitrary organization IDs.
- RLS remains active for user-scoped queries.
- If admin client is needed for audit writes, it stays server-only.
- No secrets or internal errors in report output.
- Empty states must be explicit and safe.
- CSV values must be escaped.
- CSV responses must use attachment headers.
- Report pages must not be indexed; protected routes are session-only.
- Export endpoints stay under middleware and `/api/` rate limit.

---

## 9. Evidence-first Compatibility

Reports must reserve space for Evidence-first context introduced by ADR-007:

- source coverage placeholder in Trust Passport PDF;
- source/evidence note in Executive Report;
- optional `source` / `evidence` columns in future CSV exports;
- no hard dependency on future Evidence Layer tables in Sprint 10.

This keeps Sprint 10 useful now and compatible with Sprint 11–15.

---

## 10. Limitations

Known limitations accepted for Market MVP:

- server-side binary PDF generation is not implemented in Sprint 10 architecture;
- print-to-PDF output depends on browser print engine;
- scheduled reports are out of scope;
- report templates are fixed;
- no report designer;
- no email delivery.

If pilots require server-side PDF files, revisit with a separate ADR comparing `@react-pdf/renderer`, headless Chromium and external reporting services.

---

## 11. Definition Of Done For S10-T001

- ADR-008 recorded in `ARCHITECTURE_DECISIONS.md`;
- this document created;
- Sprint 10 task status updated;
- Documentation index updated;
- no new dependencies added;
- no application behavior changed.
