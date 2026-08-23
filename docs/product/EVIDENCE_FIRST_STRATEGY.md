# EVIDENCE_FIRST_STRATEGY.md — DTEK Core

`Статус: источник истины`  
`Дата: 09.07.2026`  
`Решение: ADR-007`  
`Назначение: новая продуктовая концепция DTEK Core как Evidence-first Trust Platform`

---

## 1. Суть Решения

DTEK Core развивается как **Trust Intelligence Platform**: платформа, которая собирает цифровые доказательства из инфраструктуры организации, строит цифровую модель доверия и помогает CISO и командам ИБ принимать решения.

Ключевой переход:

```text
Manual-first cyber risk inventory
  -> Evidence-first Trust Intelligence Platform
```

Пользователь не должен вручную строить всю инфраструктурную модель. Он подключает источники данных, загружает выгрузки или использует коннекторы, а DTEK Core:

- обнаруживает объекты;
- объединяет данные из разных источников;
- создаёт Trust Passport;
- строит Trust Graph;
- рассчитывает Trust Score;
- формирует Risk Registry;
- отслеживает изменения инфраструктуры.

Специалист ИБ остаётся владельцем модели, но его роль меняется: он подтверждает, корректирует и обогащает цифровую модель, а не вводит её с нуля.

---

## 2. Что Не Меняется

Новая концепция не отменяет реализованный MVP.

Сохраняются:

- организации;
- пользователи и RBAC;
- объекты;
- Trust Passport;
- Trust Score;
- Trust Graph;
- Risk Registry;
- Configurator;
- Dashboard;
- ручное создание и редактирование данных;
- CSV/import как быстрый pilot onboarding.

Ручной ввод становится не основным способом наполнения, а fallback и механизмом экспертной корректировки.

---

## 3. Новый Product Boundary

DTEK Core не становится:

- SIEM;
- EDR/XDR;
- DLP;
- vulnerability scanner;
- CMDB;
- CNAPP;
- SOC platform;
- агентской платформой.

DTEK Core становится слоем интерпретации:

```text
Existing tools and infrastructure
  -> Evidence Layer
  -> Normalization and identity resolution
  -> Trust Passport / Trust Graph / Risk Registry
  -> Trust Score / Reports / Decisions
```

Платформа получает факты из внешних систем, но не заменяет эти системы.

---

## 4. Идеальный Рабочий Процесс

```text
Администратор создаёт организацию
  -> выбирает источники данных
  -> загружает CSV/XLSX или подключает коннекторы
  -> DTEK Core создаёт Evidence
  -> Normalization Engine приводит данные к модели DTEK
  -> Identity Resolution объединяет дубли
  -> Discovery Inbox показывает спорные объекты
  -> Trust Passport и Trust Graph обновляются
  -> Trust Score пересчитывается
  -> Auto Risk Mapper предлагает риски
  -> аналитик подтверждает, исправляет и дополняет модель
```

---

## 5. Автоматическое И Ручное

| Автоматически | Ручное / экспертное |
|---|---|
| обнаружение объектов | назначение бизнес-владельца |
| технические атрибуты объекта | бизнес-критичность |
| связи из сети, IAM, cloud, Kubernetes, логов | подтверждение спорных связей |
| признаки уязвимостей и misconfiguration | принятие или отклонение риска |
| source coverage | merge дублей |
| drift/change detection | override и исключения |
| базовые auto-risks | описание бизнес-контекста |

---

## 6. Приоритет Источников Для Российского Рынка

Порядок не означает одновременную реализацию. Он определяет вероятную коммерческую ценность для первых пилотов.

| Приоритет | Источники | Почему важны |
|---|---|---|
| 1 | CSV/XLSX, AD, LDAP, FreeIPA | быстрый старт и базовый asset/identity context |
| 2 | Zabbix | распространённый источник живых хостов и инфраструктурных статусов |
| 3 | MaxPatrol VM, OpenVAS/Greenbone | уязвимости и security asset context |
| 4 | Kaspersky Security Center, Wazuh | endpoint coverage, software inventory, events |
| 5 | UserGate, firewall/VPN logs | perimeter exposure и network edges |
| 6 | OpenSearch/ELK, RuSIEM, MaxPatrol SIEM | события ИБ и incident factor |
| 7 | VMware, Proxmox, Kubernetes, cloud APIs | инфраструктурная топология и workload discovery |

---

## 7. Как Меняется Market MVP

Market MVP остаётся пошаговым, но теперь каждый шаг готовит Evidence-first архитектуру:

1. **Reporting** показывает ценность доверительной модели руководству.
2. **CSV/XLSX Import** становится первым evidence ingestion path.
3. **Explainability** объясняет Trust Score через факторы, риски и evidence.
4. **Risk Workflow** связывает auto-risks и manual risks с действиями команды.
5. **Pilot Readiness** проверяет, какие источники реально есть у клиентов.
6. **Connector Framework Foundation** создаёт основу для первых коннекторов.

Архитектурный контракт foundation утверждён ADR-009 и описан в
[Connector_Framework_Architecture.md](../architecture/Connector_Framework_Architecture.md):
vendor adapters работают через общий ingestion boundary и не пишут напрямую в
Trust-модель.

---

## 8. Конечная Цель

DTEK Core должен отвечать на вопрос:

> Что существующие системы безопасности и инфраструктуры говорят о доверии к цифровым активам организации?

И превращать разрозненные сигналы в:

- цифровые паспорта доверия;
- объяснимый Trust Score;
- граф зависимостей;
- приоритетный реестр рисков;
- управленческие отчёты;
- историю изменений доверия.
