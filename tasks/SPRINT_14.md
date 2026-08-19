# SPRINT 14 — Pilot Readiness

`Проект: DTEK Core`  
`Спринт: 14`  
`Тип: Commercial MVP Release Readiness`<br>
`Основа: Sprint 13, TECHNICAL_DEBT.md, SECURITY_OVERVIEW.md, ADR-007`  
`Статус: 🚧 В работе — S14-T001–T002 завершены`

---

## 1. Цель Спринта

Подготовить DTEK Core к 1–3 пилотным внедрениям на 2–4 недели.

Sprint 14 закрывает эксплуатационные, стабильностные и onboarding-риски перед передачей продукта первым внешним пользователям. Он также включает release gates Sprint 12: authenticated manual QA и сверку Cloud migrations.

---

## 2. Место В Roadmap

| Параметр | Значение |
|---|---|
| Фаза | Commercial MVP release |
| Предыдущий Sprint | Sprint 13 — Pilot Risk Workflow |
| Следующий этап | Post-MVP: Sprint 15 — Connector Framework Foundation |
| Milestone | Commercial MVP / Pilot Ready |

---

## 3. Бизнес-Ценность

Пилот проваливается не только из-за отсутствия функции. Он проваливается, если продукт нестабилен, приглашения не работают, нет runbook, непонятно как восстановить окружение и невозможно измерить успех.

---

## 4. Scope / Non-Scope

### Входит

- environment health checks;
- invitation delivery decision;
- pilot runbook;
- smoke test automation where practical;
- backup/restore checklist;
- monitoring/error handling plan;
- pilot success metrics.
- сбор обратной связи о востребованных источниках для Post-MVP.

### Не входит

- полноценный enterprise SRE;
- SOC monitoring;
- WAF procurement;
- SSO/SAML;
- on-prem deployment;
- certification.

---

## 5. Задачи Спринта

| ID | Задача | Приоритет | Оценка | Зависимости | Статус |
|---|---|---|---|---|---|
| S14-T001 | Pilot Readiness Checklist | P1 | S | S13 | ✅ Завершено |
| S14-T002 | Environment Health Check UI/Runbook | P1 | M | T001 | ✅ Завершено |
| S14-T003 | Invitation Delivery Finalization | P1 | M | T001 | ⬜ Запланировано |
| S14-T004 | Smoke Test Automation Baseline | P1 | M | T001 | ⬜ Запланировано |
| S14-T005 | Backup & Restore Runbook | P1 | S | T001 | ⬜ Запланировано |
| S14-T006 | Monitoring & Error Handling Plan | P1 | M | T001 | ⬜ Запланировано |
| S14-T007 | Pilot Metrics & Feedback Loop | P1 | S | T001 | ⬜ Запланировано |
| S14-T008 | Pilot Documentation Pack | P1 | S | T001–T007 | ⬜ Запланировано |

---

## 6. Порядок Выполнения

```text
День 1
  S14-T001 Pilot Readiness Checklist
  S14-T005 Backup & Restore Runbook

День 2
  S14-T002 Environment Health Check
  S14-T003 Invitation Delivery

День 3
  S14-T004 Smoke Test Automation
  S14-T006 Monitoring Plan

День 4
  S14-T007 Pilot Metrics
  S14-T008 Documentation Pack
```

---

## 7. Детализация Задач

### S14-T001 — Pilot Readiness Checklist

**Описание:** создать единый checklist перед запуском пилота, включая закрытие ручного QA Sprint 12 и сверку Cloud migrations.

**Ожидаемый результат:** команда понимает, что проверить до выдачи доступа.

**Решение:** создан
`docs/testing/PILOT_READINESS_CHECKLIST.md` — единый release-control документ
с карточкой кандидата, 11 обязательными gates, evidence/status protocol,
инженерным baseline, Cloud migration check, authenticated Sprint 12/13 QA,
Critical Path, RBAC/RLS и tenant-isolation проверками, operations/data/support
требованиями и финальным решением `GO / CONDITIONAL GO / NO-GO`. Успешная
стабилизация на commit `cf68601` зафиксирована только как baseline с
обязательной повторной проверкой release candidate; незавершённые T002–T008 и
ручные QA не отмечены как `PASS`.

### S14-T002 — Environment Health Check UI/Runbook

**Описание:** определить способ быстрой диагностики Supabase/env/DNS/middleware.

**Ожидаемый результат:** команда может понять, почему продукт недоступен, без долгой отладки.

**Решение:** в Settings → «Безопасность» добавлена on-demand health-карточка
для `owner/admin` с повторной Server Action авторизацией. Она безопасно
проверяет наличие обязательной server configuration, текущую сессию и
organization context, Supabase Auth health endpoint и tenant-scoped DB/RLS
query; проверки Auth/DB выполняются параллельно и наследуют общий fail-fast
timeout. UI показывает только фиксированные статусы и длительность без URL,
ключей, UUID, cookies и raw ошибок. Создан
`docs/operations/ENVIRONMENT_HEALTH_RUNBOOK.md` с DNS/env/Supabase/middleware
triage, recovery, evidence и escalation flow. Публичный health endpoint,
автоматические изменения окружения и monitoring не добавлялись.

### S14-T003 — Invitation Delivery Finalization

**Описание:** принять решение: email provider или официально поддержанный manual invite link.

**Ожидаемый результат:** onboarding пилотной команды не блокируется.

### S14-T004 — Smoke Test Automation Baseline

**Описание:** автоматизировать или формализовать smoke tests ключевого пути.

**Ожидаемый результат:** регистрация, организация, объекты, риски, граф, отчёты проверяются повторяемо.

### S14-T005 — Backup & Restore Runbook

**Описание:** описать резервное копирование и восстановление Supabase-проекта.

**Ожидаемый результат:** есть процедура восстановления пилотного окружения.

### S14-T006 — Monitoring & Error Handling Plan

**Описание:** определить минимальный мониторинг ошибок и производительности.

**Ожидаемый результат:** команда видит падения Server Actions, build/deploy failures и Supabase outages.

### S14-T007 — Pilot Metrics & Feedback Loop

**Описание:** определить метрики успешности пилота и собрать feedback о востребованных источниках клиента для Post-MVP приоритизации коннекторов.

**Ожидаемый результат:** пилот измеряется через usage, data completeness, reports, feedback, willingness to pay и connector demand без обещания интеграций в MVP.

### S14-T008 — Pilot Documentation Pack

**Описание:** собрать документацию для пилотной команды и внутреннего сопровождения.

**Ожидаемый результат:** есть пакет для запуска пилота.

---

## 8. Definition Of Done

- [x] Есть pilot readiness checklist.
- [ ] Sprint 12 authenticated manual QA и Cloud migration check подтверждены.
- [x] Есть runbook диагностики окружения.
- [ ] Invite flow готов для пилота.
- [ ] Smoke test baseline есть.
- [ ] Backup/restore описан.
- [ ] Monitoring plan описан.
- [ ] Pilot metrics и source inventory определены.
- [ ] Документация обновлена.
- [ ] `npm run type-check` проходит.
- [ ] `npm run lint` проходит.
- [ ] `npm run build` проходит.

---

## 9. Риски

| Риск | Вероятность | Влияние | Митигирование |
|---|---|---|---|
| Email provider добавит лишнюю сложность | Средняя | Среднее | Manual invite link оставить fallback |
| Smoke tests потребуют много инфраструктуры | Средняя | Среднее | Начать с минимального baseline |
| Пилот начнётся без метрик | Средняя | Высокое | Утвердить metrics до старта |
