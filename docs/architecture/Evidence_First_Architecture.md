# Evidence_First_Architecture.md — DTEK Core

`Статус: архитектурная концепция`  
`Дата: 09.07.2026`  
`Решение: ADR-007`  
`Назначение: целевая архитектура автоматического наполнения DTEK Core`

---

## 1. Назначение

Документ описывает будущую архитектурную часть DTEK Core для Evidence-first Trust Platform.

Текущий код не реализует полный Discovery / Connector runtime. Этот документ задаёт целевую модель, ограничения и последовательность внедрения без ломки существующего MVP.

---

## 2. Архитектурный Принцип

Все автоматически найденные данные проходят через слой цифровых доказательств.

```text
Source
  -> Connector / Import
  -> Raw Evidence
  -> Normalization
  -> Identity Resolution
  -> Discovery Inbox
  -> Object / Relation / Risk
  -> Trust Passport / Trust Score / Trust Graph
```

Ни один коннектор не должен напрямую и без проверки создавать финальную бизнес-модель, если данные неоднозначны.

---

## 3. Новые Архитектурные Компоненты

### 3.1 Discovery Layer

Отвечает за поиск и первичную регистрацию потенциальных объектов.

Источники:

- CSV/XLSX;
- directory services;
- monitoring;
- vulnerability scanners;
- endpoint/security platforms;
- SIEM/log platforms;
- virtualization;
- Kubernetes;
- cloud APIs.

Результат Discovery Layer — не финальный объект, а evidence-backed candidate.

### 3.2 Connector Framework

Единая модель подключения внешних источников.

Минимальный контракт будущего коннектора:

- источник;
- тип авторизации;
- schedule/manual run;
- mapping;
- состояние последней синхронизации;
- ошибки;
- audit events;
- tenant isolation;
- secret handling только server-side.

### 3.3 Evidence Layer

Хранит цифровые доказательства, из которых выводятся объекты, связи, риски и Trust Score.

Evidence должно отвечать на вопросы:

- откуда пришёл факт;
- когда он был получен;
- к какому объекту относится;
- насколько он достоверен;
- какой фактор Trust Score он поддерживает;
- устарел ли он.

### 3.4 Normalization Engine

Приводит разные форматы источников к внутренней модели DTEK Core.

Примеры нормализации:

- `hostname`, `fqdn`, `computer_name` -> `object.name`;
- `ip`, `ip_address`, `address` -> сетевой идентификатор;
- CVE/severity -> risk candidate;
- AD group/admin rights -> access factor evidence;
- firewall exposure -> network factor evidence.

### 3.5 Identity Resolution

Определяет, относятся ли несколько evidence records к одному объекту.

Сигналы сопоставления:

- hostname/FQDN;
- IP/MAC;
- cloud instance id;
- VM UUID;
- AD object id;
- agent id;
- serial number;
- manual external id.

Результат:

- confident match;
- possible duplicate;
- unresolved candidate.

### 3.6 Confidence Engine

Оценивает уверенность автоматического вывода.

Пример шкалы:

| Confidence | Значение |
|---|---|
| High | можно автоматически обновить объект |
| Medium | требуется подтверждение в Discovery Inbox |
| Low | только candidate, без влияния на Trust Score |

### 3.7 Discovery Inbox

Очередь объектов, связей и рисков, которые требуют решения пользователя.

Действия пользователя:

- подтвердить;
- отклонить;
- объединить с существующим объектом;
- создать новый объект;
- пометить как исключение;
- назначить владельца и критичность.

### 3.8 Drift Detection

Фиксирует изменения инфраструктуры:

- объект появился;
- объект исчез;
- изменилась экспозиция;
- изменился источник покрытия;
- появилась новая критичная уязвимость;
- изменилась связь;
- Trust Score изменился из-за evidence.

### 3.9 Auto Risk Mapper

Создаёт risk candidates из evidence.

Примеры:

- critical CVE на critical server;
- endpoint без EDR/AV coverage;
- external exposure без подтверждённого владельца;
- stale AD account с привилегиями;
- хост есть в Zabbix, но отсутствует в security tooling.

### 3.10 Source Coverage

Показывает, какими источниками подтверждён объект.

Пример:

```text
srv-db-01
  AD: found
  Zabbix: monitored
  MaxPatrol VM: scanned
  Wazuh: no agent
  Manual: criticality confirmed
```

### 3.11 Evidence Timeline

История появления и изменения evidence, связанная с объектом, риском и Trust Score.

Используется для explainability:

- почему объект появился;
- почему риск создан;
- почему Trust Score изменился;
- какой источник повлиял на фактор.

---

## 4. Состояния Объекта

Будущая модель объекта должна различать технический статус и discovery state.

Пример discovery state:

| State | Смысл |
|---|---|
| `discovered` | найден автоматически, ещё не подтверждён |
| `pending_confirmation` | требует решения пользователя |
| `verified` | подтверждён пользователем или high-confidence match |
| `manual` | создан вручную |
| `merged` | объединён с другим объектом |
| `archived` | выведен из активной модели |

Эта модель не заменяет текущий `objects.status`; она проектируется как отдельное измерение для будущих миграций.

---

## 5. Trust Passport В Evidence-first Архитектуре

Trust Passport становится evidence-backed документом.

Каждое важное поле должно иметь происхождение:

- source;
- confidence;
- last_seen_at;
- manual_override flag;
- related evidence ids.

Manual fields остаются допустимыми, но должны быть явно помечены как `Manual`.

---

## 6. Trust Graph В Evidence-first Архитектуре

Связи могут появляться из:

- network flow;
- IAM/group membership;
- Kubernetes service/deployment relationships;
- cloud dependencies;
- SIEM/log correlations;
- vulnerability scanner topology;
- manual correction.

Manual relation management остаётся, но автоматические связи должны иметь source и confidence.

---

## 7. Risk Registry В Evidence-first Архитектуре

Риски делятся на:

- manual risks;
- imported risks;
- auto risk candidates;
- confirmed auto risks.

Auto Risk Mapper не должен безусловно засорять реестр. Риски с низкой уверенностью попадают в review, а не сразу в активный Risk Registry.

---

## 8. Security Requirements

Evidence-first архитектура усиливает требования безопасности:

- secrets коннекторов хранятся только server-side;
- service role не попадает в клиент;
- все evidence rows привязаны к `organization_id`;
- RLS обязательна для новых таблиц;
- sync errors не раскрывают секреты;
- connector actions логируются в audit trail;
- импорт/синхронизация должны быть idempotent;
- tenant isolation проверяется отдельно для каждого source.

---

## 9. Первые Connector Candidates

Первые источники выбираются по пилотным данным, но архитектурный shortlist:

1. CSV/XLSX structured import.
2. Active Directory / LDAP / FreeIPA.
3. Zabbix.
4. MaxPatrol VM.
5. Kaspersky Security Center.
6. Wazuh.
7. UserGate / firewall export.

Для Sprint 11 CSV/XLSX structured import является первым evidence ingestion path. Его контракт, поля, validation preview, source metadata и RBAC описаны в [Evidence_Import_Schema.md](Evidence_Import_Schema.md).

---

## 10. Non-Goals До Подтверждения Pilot MVP

- агент на endpoint;
- marketplace коннекторов;
- realtime streaming ingestion;
- SIEM replacement;
- vulnerability scanning engine;
- heavy ETL platform;
- custom correlation language;
- enterprise connector secrets vault beyond MVP needs.
