# System_Architecture.md — DTEK Core

`Статус: актуальный`  
`Дата: 08.07.2026`  
`ADR: ADR-004, ADR-007`

---

## 1. Назначение

Документ описывает фактическую архитектуру DTEK Core MVP.

DTEK Core построен как cloud-first SaaS на Next.js и Supabase. Архитектура оптимизирована для быстрого MVP, безопасной multi-tenant модели и дальнейшего перехода к Evidence-first Trust Platform.

---

## 2. High-Level Architecture

```text
Browser
  -> Next.js App Router on Vercel
  -> Server Components / Server Actions
  -> Supabase Auth + Postgres
  -> RLS/RBAC policies
```

Целевая Evidence-first архитектура добавляет слой автоматического наполнения:

```text
External sources / CSV / Connectors
  -> Evidence Layer
  -> Normalization Engine
  -> Identity Resolution + Confidence Engine
  -> Discovery Inbox
  -> Objects / Relations / Risks
  -> Trust Passport / Trust Score / Trust Graph
```

Подробно: [Evidence_First_Architecture.md](Evidence_First_Architecture.md).

---

## 3. Frontend

| Область | Решение |
|---|---|
| Framework | Next.js App Router 15.x |
| UI | React 18 |
| Styling | Tailwind CSS + global CSS modules |
| Components | Shadcn/UI + `components/shared/*` |
| Rendering | Server Components by default |
| Client components | Только для интерактивных элементов |

---

## 4. Backend

| Область | Решение |
|---|---|
| Backend layer | Next.js Server Actions |
| BaaS | Supabase Cloud |
| Database | PostgreSQL 15 |
| Auth | Supabase Auth |
| Authorization | Server-side RBAC + PostgreSQL RLS |
| Audit | `security_events` table + helpers |

Edge Functions и Supabase Storage не являются обязательной частью текущего MVP. Они могут быть добавлены в Post-MVP при появлении подтверждённой задачи.

Connector Framework foundation зафиксирован ADR-009 как versioned adapter
layer с server-only orchestration и единым Ingestion Gateway. Connector не
пишет напрямую в Objects/Risks/Relations; runtime, background sync и evidence
storage не являются частью текущей схемы до отдельных задач и миграций.
Подробно:
[Connector_Framework_Architecture.md](Connector_Framework_Architecture.md).

Reporting Sprint 10 использует Next.js Server Components, route handlers и server-side report modules. Подробно: [Reporting_Architecture.md](Reporting_Architecture.md).

---

## 5. Data Model

Ключевые таблицы:

- `profiles`
- `organizations`
- `objects`
- `trust_passports`
- `trust_factor_config`
- `risks`
- `object_risks`
- `relations`
- `trust_score_history`
- `invitations`
- `security_events`

Полная схема: [Database_Design_Full.md](Database_Design_Full.md).

Будущие Evidence-first таблицы должны проектироваться отдельно и обязательно включать `organization_id`, RLS, source metadata, confidence, timestamps и audit trail.

---

## 6. Trust Score Engine

Trust Score рассчитывается в TypeScript:

- `lib/trust/calculate.ts` — чистые функции;
- `lib/trust/engine.ts` — чтение/запись результатов;
- Server Actions вызывают пересчёт после изменений объектов, рисков и конфигурации.

Модель: [Trust_Score_Model_v2.md](Trust_Score_Model_v2.md).

---

## 7. Security Architecture

Основные уровни:

1. Supabase Auth.
2. Middleware route protection.
3. Server Action authorization.
4. PostgreSQL RLS.
5. Zod validation.
6. Security headers.
7. Rate limiting.
8. Security Audit Log.

Подробнее: [../security/SECURITY_OVERVIEW.md](../security/SECURITY_OVERVIEW.md).

---

## 8. Known Architecture Trade-Offs

| Решение | Почему принято | Когда пересмотреть |
|---|---|---|
| Supabase Cloud | Быстрый MVP, Auth + Postgres + RLS | Enterprise/on-prem |
| Server Actions | Простая архитектура без отдельного API | При необходимости публичного API |
| Синхронный Trust Score пересчёт | Достаточно для MVP-объёмов | 500+ объектов или долгие операции |
| Cloud-only | Быстрая разработка и деплой | Enterprise customers |
| In-memory rate limiting | Простота для MVP | Multi-instance production |
| Manual-first data model | Быстрое подтверждение UX и Trust Score | Evidence-first import/connectors |

Технический долг: [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md).

---

## 9. Non-Goals MVP

- Graph database.
- Agent runtime.
- On-prem runtime.
- Event streaming.
- Heavy connector framework до Sprint 15 foundation.
- AI/ML scoring.
- Custom RBAC roles.

---

## 10. Future Evolution

Последовательность развития:

1. Market MVP.
2. Pilot readiness.
3. Evidence import as first ingestion path.
4. Connector Framework Foundation — ADR-009 принят, data/security specifications продолжаются в Sprint 15.
5. First connector prototypes based on pilot evidence.
6. API/webhooks.
7. Enterprise security features.
8. On-prem/private cloud only after commercial validation.
