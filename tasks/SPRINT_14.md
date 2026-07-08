# SPRINT 14 — Pilot Readiness

`Проект: DTEK Core`  
`Спринт: 14`  
`Тип: Pilot MVP Stabilization`  
`Основа: Sprint 13, TECHNICAL_DEBT.md, SECURITY_OVERVIEW.md`  
`Статус: 📋 Запланирован`

---

## 1. Цель Спринта

Подготовить DTEK Core к 1–3 пилотным внедрениям на 2–4 недели.

Sprint 14 закрывает эксплуатационные, стабильностные и onboarding-риски перед передачей продукта первым внешним пользователям.

---

## 2. Место В Roadmap

| Параметр | Значение |
|---|---|
| Фаза | Pilot MVP |
| Предыдущий Sprint | Sprint 13 — Risk Workflow |
| Следующий Sprint | Sprint 15 — First Connector Prototype |
| Milestone | Pilot Ready |

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

### Не входит

- полноценный enterprise SRE;
- SOC monitoring;
- WAF procurement;
- SSO/SAML;
- on-prem deployment;
- certification.

---

## 5. Задачи Спринта

| ID | Задача | Приоритет | Оценка | Зависимости |
|---|---|---|---|---|
| S14-T001 | Pilot Readiness Checklist | P1 | S | S13 |
| S14-T002 | Environment Health Check UI/Runbook | P1 | M | T001 |
| S14-T003 | Invitation Delivery Finalization | P1 | M | T001 |
| S14-T004 | Smoke Test Automation Baseline | P1 | M | T001 |
| S14-T005 | Backup & Restore Runbook | P1 | S | T001 |
| S14-T006 | Monitoring & Error Handling Plan | P1 | M | T001 |
| S14-T007 | Pilot Metrics & Feedback Loop | P1 | S | T001 |
| S14-T008 | Pilot Documentation Pack | P1 | S | T001–T007 |

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

**Описание:** создать единый checklist перед запуском пилота.

**Ожидаемый результат:** команда понимает, что проверить до выдачи доступа.

### S14-T002 — Environment Health Check UI/Runbook

**Описание:** определить способ быстрой диагностики Supabase/env/DNS/middleware.

**Ожидаемый результат:** команда может понять, почему продукт недоступен, без долгой отладки.

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

**Описание:** определить метрики успешности пилота.

**Ожидаемый результат:** пилот измеряется через usage, data completeness, reports, feedback и willingness to pay.

### S14-T008 — Pilot Documentation Pack

**Описание:** собрать документацию для пилотной команды и внутреннего сопровождения.

**Ожидаемый результат:** есть пакет для запуска пилота.

---

## 8. Definition Of Done

- [ ] Есть pilot readiness checklist.
- [ ] Есть runbook диагностики окружения.
- [ ] Invite flow готов для пилота.
- [ ] Smoke test baseline есть.
- [ ] Backup/restore описан.
- [ ] Monitoring plan описан.
- [ ] Pilot metrics определены.
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

