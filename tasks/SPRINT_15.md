# SPRINT 15 — Connector Framework Foundation

`Проект: DTEK Core`  
`Спринт: 15`  
`Тип: Evidence-first Architecture Sprint`  
`Основа: Sprint 14, ADR-007, Evidence_First_Architecture.md, pilot feedback`  
`Статус: 📋 Запланирован`

---

## 1. Цель Спринта

Создать архитектурную и продуктовую основу для автоматического наполнения DTEK Core без превращения платформы в SIEM, EDR, VM-сканер или CMDB.

Sprint 15 не должен реализовывать много коннекторов сразу. Его задача — подготовить безопасный Connector Framework, Evidence Layer, Normalization, Identity Resolution и Discovery Inbox, чтобы первый коннектор появился на правильной архитектуре.

---

## 2. Место В Roadmap

| Параметр | Значение |
|---|---|
| Фаза | Evidence-first MVP / Connector Foundation |
| Предыдущий Sprint | Sprint 14 — Pilot Readiness |
| Следующий этап | First connector prototype / Commercial MVP iteration на базе Connector Framework |
| Milestone | Connector Foundation Ready |

---

## 3. Бизнес-Ценность

Первые пилоты покажут, какие источники реально есть у клиентов. Sprint 15 превращает этот feedback в архитектуру автоматического наполнения: DTEK Core сможет принимать данные из AD, Zabbix, MaxPatrol VM, Wazuh, Kaspersky, UserGate и других источников без хаотичных интеграций.

---

## 4. Scope / Non-Scope

### Входит

- Connector Framework architecture;
- Evidence Layer data model specification;
- Normalization rules;
- Identity Resolution strategy;
- Confidence model;
- Discovery Inbox UX specification;
- connector security model;
- shortlist первых источников для РФ.

### Не входит

- marketplace коннекторов;
- несколько production-коннекторов;
- endpoint agent;
- realtime ingestion;
- SIEM replacement;
- vulnerability scanner;
- heavy ETL platform.

---

## 5. Приоритетные Источники

Shortlist для первых connector candidates:

1. CSV/XLSX structured import.
2. Active Directory / LDAP / FreeIPA.
3. Zabbix.
4. MaxPatrol VM.
5. Kaspersky Security Center.
6. Wazuh.
7. UserGate / firewall export.
8. OpenSearch / ELK.
9. VMware / Proxmox.
10. Kubernetes / cloud APIs.

Первым production/prototype connector становится источник, подтверждённый pilot feedback.

---

## 6. Задачи Спринта

| ID | Задача | Приоритет | Оценка | Зависимости |
|---|---|---|---|---|
| S15-T001 | Connector Framework Architecture Decision | P1 | M | S14 + ADR-007 |
| S15-T002 | Evidence Layer Data Model Specification | P1 | L | T001 |
| S15-T003 | Normalization & Identity Resolution Specification | P1 | M | T001, T002 |
| S15-T004 | Confidence Engine & Discovery Inbox Specification | P1 | M | T002, T003 |
| S15-T005 | Connector Security Model | P1 | M | T001–T004 |
| S15-T006 | Russian Market Connector Shortlist | P1 | S | S14 feedback |
| S15-T007 | First Connector Candidate Decision | P1 | S | T006 |
| S15-T008 | Connector Foundation Documentation Sync | P1 | S | T001–T007 |

---

## 7. Порядок Выполнения

```text
День 1
  S15-T001 Connector Framework Architecture Decision
  S15-T006 Russian Market Connector Shortlist

День 2
  S15-T002 Evidence Layer Data Model Specification

День 3
  S15-T003 Normalization & Identity Resolution Specification
  S15-T004 Confidence Engine & Discovery Inbox Specification

День 4
  S15-T005 Connector Security Model
  S15-T007 First Connector Candidate Decision
  S15-T008 Documentation Sync
```

---

## 8. Детализация Задач

### S15-T001 — Connector Framework Architecture Decision

**Описание:** определить единый контракт коннектора: source type, auth, sync mode, mapping, status, errors, audit events, tenant isolation.

**Ожидаемый результат:** ADR/architecture document описывает, как подключать источники без хаотичных интеграций.

### S15-T002 — Evidence Layer Data Model Specification

**Описание:** спроектировать таблицы/типы для raw evidence, normalized evidence, source metadata, confidence, last_seen_at и relation to objects/risks/factors.

**Ожидаемый результат:** готова спецификация будущей миграции с RLS и audit requirements.

### S15-T003 — Normalization & Identity Resolution Specification

**Описание:** определить правила нормализации и сопоставления объектов из разных источников.

**Ожидаемый результат:** есть стратегия deduplication: hostname/FQDN/IP/MAC/agent id/cloud id/manual external id.

### S15-T004 — Confidence Engine & Discovery Inbox Specification

**Описание:** определить шкалу confidence и UX очереди неподтверждённых объектов, связей и рисков.

**Ожидаемый результат:** пользователь может подтверждать, объединять, отклонять и архивировать candidates.

### S15-T005 — Connector Security Model

**Описание:** описать хранение секретов, RBAC, RLS, audit events, safe error handling и tenant isolation для коннекторов.

**Ожидаемый результат:** connector foundation не создаёт риск утечки инфраструктурных данных.

### S15-T006 — Russian Market Connector Shortlist

**Описание:** на основе пилотов и ICP подтвердить приоритеты источников для российского рынка.

**Ожидаемый результат:** shortlist ранжирован по коммерческой ценности и сложности.

### S15-T007 — First Connector Candidate Decision

**Описание:** выбрать первый connector prototype или принять решение продолжить через CSV/XLSX evidence import.

**Ожидаемый результат:** следующий Sprint получает конкретный источник и обоснование.

### S15-T008 — Connector Foundation Documentation Sync

**Описание:** синхронизировать architecture, product, roadmap, user/dev docs.

**Ожидаемый результат:** документация не противоречит ADR-007 и готова к первой интеграционной задаче.

---

## 9. Definition Of Done

- [ ] Connector Framework architecture зафиксирована.
- [ ] Evidence Layer data model specification готова.
- [ ] Normalization и Identity Resolution описаны.
- [ ] Confidence Engine и Discovery Inbox описаны.
- [ ] Connector security model готова.
- [ ] Российский connector shortlist утверждён.
- [ ] Первый connector candidate выбран или явно отложен.
- [ ] Документация обновлена.
- [ ] `npm run type-check` проходит.
- [ ] `npm run lint` проходит.
- [ ] `npm run build` проходит.

---

## 10. Риски

| Риск | Вероятность | Влияние | Митигирование |
|---|---|---|---|
| Connector Framework станет слишком тяжёлым | Средняя | Высокое | Foundation только под первые 1–2 источника |
| Коннектор выбран без рыночного сигнала | Средняя | Высокое | Использовать pilot source inventory |
| Evidence Layer нарушит tenant isolation | Низкая | Критическое | RLS, org_id, audit и security review до миграции |
| Пользователь потеряет контроль над моделью | Средняя | Среднее | Discovery Inbox и manual override обязательны |
