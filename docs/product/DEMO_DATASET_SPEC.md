# DEMO_DATASET_SPEC.md — DTEK Core

`Sprint: S09-T002`  
`Статус: актуальный`  
`Дата: 09.07.2026`  
`Назначение: спецификация демонстрационных данных для Market MVP`

---

## 1. Назначение

Документ определяет состав demo dataset для демонстрации DTEK Core по сценарию [DEMO_NARRATIVE.md](DEMO_NARRATIVE.md).

Цель demo dataset — показать платформу без пустых экранов и провести CISO через цепочку:

```text
Организация -> объекты -> риски -> Trust Score -> Trust Graph -> executive insight
```

Этот документ не является seed script и не создаёт данные в БД. Способ наполнения будет определён в S09-T003.

---

## 2. Demo Organization

| Поле | Значение |
|---|---|
| Название | АО "Северная Энергосеть" |
| Short name | СевЭнерго |
| Отрасль | Энергетика / промышленная инфраструктура |
| Размер | 500–1500 сотрудников |
| Регион | Северо-Западный федеральный округ |
| Контекст | IT + OT контур, удалённый доступ подрядчиков, критичные сервисы диспетчеризации |
| Demo objective | Показать, как DTEK Core выявляет активы с низким доверием и риски, влияющие на критичные зависимости |

### Demo Story

Компания готовится к внутреннему аудиту ИБ. У CISO есть разрозненные данные: список серверов, несколько критичных рисков, устаревшие сетевые настройки и вопросы по доступу подрядчиков. DTEK Core используется как управленческий слой, который связывает активы, риски и доверие.

---

## 3. Demo Users And Roles

| Full name | Email | Role | Назначение в демо |
|---|---|---|---|
| Кирилл Волков | owner@demo.dtek.local | `owner` | Владелец организации, показывает настройки и пользователей |
| Анна Морозова | analyst@demo.dtek.local | `analyst` | Аналитик ИБ, работает с рисками и Trust Passport |
| Сергей Лебедев | admin@demo.dtek.local | `admin` | IT-администратор, отвечает за инфраструктурные объекты |
| Ирина Соколова | viewer@demo.dtek.local | `viewer` | Наблюдатель / руководитель, read-only роль |

### Demo Access Notes

- Для основного показа использовать `owner` или `analyst`.
- `viewer` нужен для демонстрации RBAC и read-only сценария.
- Email-домены демонстрационные, не должны использовать реальные адреса.

---

## 4. Trust Model Configuration

Для демо использовать отраслевой профиль промышленности / энергетики.

| Фактор | Ключ | Вес |
|---|---|---|
| Уязвимости | `vuln` | 30 |
| Конфигурация | `config` | 20 |
| Доступы | `access` | 12 |
| Сегментация | `network` | 25 |
| Соответствие требованиям | `compliance` | 8 |
| Инциденты | `incident` | 5 |
| **Итого** | | **100** |

### Почему Эти Веса

Для промышленной инфраструктуры в демо важно показать, что уязвимости и сегментация влияют сильнее всего. Это усиливает историю о связи IT и OT контуров.

---

## 5. Demo Objects

Минимальный набор: 15 объектов. Он покрывает все ключевые экраны: Dashboard, Objects, Passport, Risks, Graph.

| Код | Name | Type | Criticality | Segment | Exposure | Owner | Demo purpose |
|---|---|---|---|---|---|---|---|
| OBJ-001 | SCADA Core Server | `ot` | `critical` | OT-Core | `isolated` | Сергей Лебедев | Центральный OT-актив, главный объект доверия |
| OBJ-002 | Historian DB | `database` | `critical` | OT-DMZ | `internal` | Сергей Лебедев | Критичная база технологических данных |
| OBJ-003 | Dispatch Portal | `app` | `high` | IT-Services | `external` | Анна Морозова | Внешний сервис для диспетчеризации |
| OBJ-004 | VPN Gateway | `network` | `critical` | Perimeter | `external` | Сергей Лебедев | Точка удалённого доступа |
| OBJ-005 | Contractor VPN Account | `identity` | `high` | Identity | `external` | Анна Морозова | Риск подрядчиков и MFA |
| OBJ-006 | Domain Controller 01 | `server` | `critical` | Corporate-IT | `internal` | Сергей Лебедев | Ключевой identity-инфраструктурный объект |
| OBJ-007 | Patch Management Server | `server` | `high` | Corporate-IT | `internal` | Сергей Лебедев | Управление обновлениями |
| OBJ-008 | SOC Monitoring Service | `service` | `high` | Security | `internal` | Анна Морозова | Покрытие мониторингом |
| OBJ-009 | Engineer Workstation 17 | `workstation` | `high` | OT-Admin | `internal` | Сергей Лебедев | Рабочая станция инженера АСУ ТП |
| OBJ-010 | CISO Laptop | `laptop` | `medium` | Corporate-IT | `internal` | Анна Морозова | Пользовательский актив с хорошим доверием |
| OBJ-011 | Backup Storage | `server` | `high` | Backup | `internal` | Сергей Лебедев | Резервное копирование и ransomware story |
| OBJ-012 | Firewall Cluster | `network` | `critical` | Perimeter | `external` | Сергей Лебедев | Сетевая сегментация и perimeter |
| OBJ-013 | Asset Inventory Spreadsheet | `policy` | `medium` | Governance | `internal` | Анна Морозова | Показывает переход от Excel к DTEK Core |
| OBJ-014 | HR Portal | `app` | `medium` | Corporate-IT | `external` | Ирина Соколова | Некритичный бизнес-сервис |
| OBJ-015 | SIEM Collector | `service` | `high` | Security | `internal` | Анна Морозова | Демонстрация, что DTEK Core не заменяет SIEM |

### Expected Trust Distribution

| Уровень | Количество | Назначение |
|---|---:|---|
| High / Good | 4–5 | Показать здоровые активы |
| Medium | 5–6 | Основная масса активов |
| Low / Critical | 3–4 | Объекты для demo story и приоритизации |

### Hero Objects For Demo

| Объект | Почему важен |
|---|---|
| SCADA Core Server | Критичный OT-актив, должен быть в центре графа |
| VPN Gateway | Связывает внешний доступ и критичные внутренние сегменты |
| Contractor VPN Account | Хорошо показывает access risk |
| Historian DB | Демонстрирует зависимость данных от OT/IT связей |
| Engineer Workstation 17 | Понятный сценарий компрометации рабочей станции |

---

## 6. Demo Risks

Минимальный набор: 12 рисков. Риски должны покрывать все факторы Trust Score и разные статусы.

| Код | Title | Category | Severity | Probability | Status | Linked objects | Demo purpose |
|---|---|---|---|---|---|---|---|
| RISK-001 | Критичная уязвимость VPN Gateway без установленного патча | `vulnerability` | `critical` | `high` | `open` | OBJ-004 | Главный риск периметра |
| RISK-002 | Удалённый доступ подрядчика без MFA | `access` | `high` | `high` | `open` | OBJ-005, OBJ-004 | Показывает access risk |
| RISK-003 | Недостаточная сегментация между IT и OT DMZ | `network` | `critical` | `medium` | `in_progress` | OBJ-012, OBJ-002, OBJ-001 | Главный graph insight |
| RISK-004 | Устаревшая ОС на Engineer Workstation 17 | `vulnerability` | `high` | `medium` | `open` | OBJ-009 | Понятный workstation risk |
| RISK-005 | Отсутствует подтверждённый план восстановления SCADA Core | `compliance` | `high` | `medium` | `open` | OBJ-001, OBJ-011 | Compliance + resilience |
| RISK-006 | Неполное покрытие SOC-мониторингом OT-сегмента | `monitoring` | `medium` | `medium` | `in_progress` | OBJ-008, OBJ-001, OBJ-002 | Incident/monitoring story |
| RISK-007 | Слабая политика ротации сервисных учётных записей | `access` | `medium` | `medium` | `open` | OBJ-006, OBJ-015 | Identity governance |
| RISK-008 | Firewall rules содержат устаревшие разрешения | `configuration` | `high` | `medium` | `open` | OBJ-012 | Config + perimeter |
| RISK-009 | Backup Storage не изолирован от домена | `network` | `high` | `medium` | `open` | OBJ-011, OBJ-006 | Ransomware/resilience |
| RISK-010 | Нет актуального реестра владельцев критичных активов | `organizational` | `medium` | `high` | `accepted` | OBJ-013 | Accepted risk, не должен снижать score |
| RISK-011 | HR Portal имеет просроченный TLS-сертификат | `configuration` | `low` | `medium` | `mitigated` | OBJ-014 | Закрытый/устранённый риск |
| RISK-012 | Инцидент подозрительного входа в VPN за последние 30 дней | `incident` | `medium` | `medium` | `open` | OBJ-004, OBJ-005 | Incident factor |

### Risk Coverage By Trust Factor

| Factor | Risks |
|---|---|
| `vuln` | RISK-001, RISK-004 |
| `config` | RISK-008, RISK-011 |
| `access` | RISK-002, RISK-007 |
| `network` | RISK-003, RISK-009 |
| `compliance` | RISK-005 |
| `incident` | RISK-006, RISK-012 |
| all factors | RISK-010 |

---

## 7. Expected Trust Score Outcomes

Точные значения Trust Score рассчитываются движком. Для demo dataset важны ожидаемые диапазоны.

| Object | Expected range | Почему |
|---|---:|---|
| SCADA Core Server | 30–50 | Critical + network/compliance/monitoring risks |
| Historian DB | 35–55 | Critical + segmentation risk |
| Dispatch Portal | 60–75 | External high object без критичных рисков |
| VPN Gateway | 20–40 | Critical vuln + access + incident |
| Contractor VPN Account | 30–50 | High + access + incident |
| Domain Controller 01 | 55–70 | Critical + medium access risk |
| Patch Management Server | 65–80 | High, без активных major risks |
| SOC Monitoring Service | 60–75 | Monitoring risk связан с покрытием |
| Engineer Workstation 17 | 45–60 | High vulnerability |
| CISO Laptop | 75–90 | Medium, хорошая полнота паспорта |
| Backup Storage | 45–65 | Network/ransomware risk |
| Firewall Cluster | 40–60 | Critical + configuration/network risks |
| Asset Inventory Spreadsheet | 65–80 | Accepted organizational risk |
| HR Portal | 70–85 | Low mitigated risk |
| SIEM Collector | 65–80 | High, связан с monitoring story |

### Organization Trust Score

Ожидаемый диапазон организации:

```text
55–68
```

Это достаточно низко, чтобы показать проблему, но не настолько плохо, чтобы demo выглядело искусственно катастрофичным.

---

## 8. Trust Graph Relations

Минимальный набор: 14 связей.

| Source | Relation | Target | Demo meaning |
|---|---|---|---|
| Contractor VPN Account | `uses` | VPN Gateway | Подрядчик использует VPN |
| VPN Gateway | `connected_to` | Firewall Cluster | VPN входит через периметр |
| Firewall Cluster | `connected_to` | Domain Controller 01 | Периметр связан с IT-сегментом |
| Domain Controller 01 | `interacts_with` | Engineer Workstation 17 | Администрирование инфраструктуры |
| Engineer Workstation 17 | `connected_to` | SCADA Core Server | Риск перехода в OT |
| SCADA Core Server | `depends_on` | Historian DB | SCADA зависит от данных |
| Dispatch Portal | `depends_on` | Historian DB | Портал зависит от historian |
| SOC Monitoring Service | `uses` | SIEM Collector | Мониторинг использует collector |
| SIEM Collector | `interacts_with` | SCADA Core Server | Покрытие OT событий |
| Engineer Workstation 17 | `managed_by` | Patch Management Server | Управление обновлениями рабочей станции |
| Backup Storage | `depends_on` | Domain Controller 01 | Backup зависит от домена |
| Asset Inventory Spreadsheet | `interacts_with` | SCADA Core Server | Governance-артефакт связан с критичным активом |
| HR Portal | `depends_on` | Domain Controller 01 | HR использует identity |
| Firewall Cluster | `connected_to` | Historian DB | Периметр влияет на OT-DMZ |

### Relation Type Constraint

Фактические допустимые значения:

- `uses`
- `depends_on`
- `connected_to`
- `managed_by`
- `owns`
- `interacts_with`

Все relation values в таблице выше соответствуют текущему CHECK constraint. При S09-T003 нужно использовать именно эти значения.

---

## 9. Dashboard Expectations

Dashboard должен показывать:

- org Trust Score в диапазоне 55–68;
- 15 объектов;
- 8–10 активных рисков;
- 2–3 critical риска;
- top risky objects: VPN Gateway, SCADA Core Server, Contractor VPN Account, Historian DB, Firewall Cluster;
- trust distribution с visible low/medium/good buckets;
- event feed с пересчётами Trust Score и изменениями конфигурации.

---

## 10. Demo Walkthrough Mapping

| Demo narrative block | Dataset element |
|---|---|
| Executive snapshot | Org score 55–68, top risky objects |
| Objects | 15 mixed assets |
| Trust Passport | VPN Gateway или SCADA Core Server |
| Risks | RISK-001, RISK-002, RISK-003 |
| Graph | Contractor -> VPN -> Firewall -> OT/SCADA chain |
| Configurator | Industrial weights preset |
| Users/RBAC | 4 demo users with roles |

---

## 11. Data Quality Requirements

Для каждого demo object желательно заполнить:

- `name`;
- `type`;
- `criticality`;
- `description`;
- `owner_id`;
- `ip_address` или сетевой идентификатор;
- `os_platform`, если применимо;
- `segment`;
- `exposure`.

Это нужно не только для визуальной полноты, но и для `compliance` bonus через полноту паспорта.

---

## 12. Что Не Должно Быть В Demo Dataset

- реальные email или персональные данные;
- реальные IP-адреса клиента;
- названия реальных организаций без разрешения;
- реальные CVE, если они могут ассоциироваться с конкретной инфраструктурой клиента;
- данные, похожие на production secrets;
- больше 20–25 объектов на первом demo: граф станет шумным.

---

## 13. Acceptance Criteria

Demo dataset считается специфицированным, если:

- есть demo organization profile;
- есть 4 demo users с ролями;
- есть 15 demo objects;
- есть 12 demo risks;
- риски покрывают все 6 факторов Trust Score;
- есть expected Trust Score ranges;
- есть relation map для Trust Graph;
- есть Dashboard expectations;
- dataset соответствует текущей БД и ADR-006;
- документ может быть использован в S09-T003 для выбора seed-подхода.

---

## 14. Open Questions For S09-T003

S09-T003 должен решить:

1. Seed делаем SQL-скриптом, admin-only Server Action или documented manual setup?
2. Нужно ли создавать отдельную demo organization в существующем Supabase project?
3. Как безопасно создавать demo users без реальных почтовых отправок?
4. Нужно ли фиксировать deterministic UUID для demo objects?
5. Как обновлять demo data без миграций и без риска для production tenant?
