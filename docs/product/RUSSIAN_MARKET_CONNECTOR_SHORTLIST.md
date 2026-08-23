# RUSSIAN_MARKET_CONNECTOR_SHORTLIST.md — DTEK Core

`Версия: 1.0`
`Дата: 23.08.2026`
`Задача: S15-T006 — Russian Market Connector Shortlist`
`Статус: MARKET RESEARCH COMPLETE / S15-T007 DEFER / PILOT VALIDATION PENDING`

---

## 1. Назначение

Документ определяет исследовательский shortlist источников для российского
рынка и порядок их проверки перед выбором первого Connector Framework
prototype.

Он отвечает на четыре вопроса:

1. Какие source families дают DTEK Core наибольшую evidence-first ценность?
2. Какие из них имеют документированный и технически допустимый read path?
3. Где потребуется on-prem collector или отдельное deployment решение?
4. Какой pilot evidence должен появиться до S15-T007?

Shortlist не является обещанием интеграций, оценкой доли рынка или решением о
первом connector. Production runtime, vendor partnership, test licenses и
доступ к клиентским инсталляциям отсутствуют.

---

## 2. Evidence Status И Ограничение Решения

На 23.08.2026 в репозитории нет заполненных source cards реальных пилотов.
`PILOT_METRICS_FEEDBACK_LOOP.md` имеет статус `PILOT DATA PENDING`, поэтому:

- cross-pilot demand не измерен;
- manual burden и required freshness не подтверждены пользователями;
- customer deployment/security boundary неизвестен;
- shortlist ниже является **research priority**, а не validated demand ranking;
- ни один кандидат не проходит формальный admission gate раздела 8.3 Pilot
  Metrics;
- S15-T007 должен выбрать connector только после появления pilot evidence либо
  явно отложить выбор и сохранить CSV/XLSX path.

`PENDING` не равно нулю. Ноль означал бы, что фактор измерили и спроса нет;
сейчас данных для оценки просто не существует.

---

## 3. Принципы Shortlist

1. Источник должен усиливать Trust Passport, Trust Score, Trust Graph или Risk
   Registry, а не превращать DTEK Core в SIEM/EDR/CMDB/VM scanner.
2. Сначала используется read-only bounded pull и narrow data contract.
3. Stable source identity важнее количества доступных полей.
4. Наличие API не отменяет tenant isolation, Vault, SSRF и egress gates T005.
5. Private customer network не открывается в интернет ради SaaS connector.
6. Один product family не означает один универсальный adapter.
7. CSV/XLSX остаётся немедленным fallback для редких или закрытых источников.
8. Vendor/version/license access проверяются на реальном pilot environment.
9. Российский рынок учитывается через локальные vendors, on-prem/isolated
   deployment и импортозамещённые open-source stacks без неподтверждённых
   заявлений о рыночной доле.

---

## 4. Методика Оценки

### 4.1. Pilot Demand

Используется модель из `PILOT_METRICS_FEEDBACK_LOOP.md`:

- decision value: `0–3`;
- manual burden: `0–3`;
- freshness need: `0–3`;
- cross-pilot demand: `0–3`;
- evidence quality gain: `0–3`.

До заполнения source cards все demand scores имеют статус `PENDING` и не
подменяются desk research.

### 4.2. Desk Feasibility

Каждый factor оценивается `0–3`, максимум `12`:

| Factor | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Access | Нет допустимого path | Сложный/manual | Stable export | Documented API/standard protocol |
| Identity | Нет stable key | Слабый matching | Частичный stable key | Надёжный external identity |
| Security/deployment fit | Нарушает boundary | Нужен отдельный collector/ADR | Допустим с ограничениями | Соответствует SaaS connector model |
| Implementation scope | Unknown/enterprise | Large | Medium | Small foundation-compatible |

Feasibility показывает техническую готовность к исследованию, а не коммерческий
приоритет. Высокий score не заменяет pilot demand.

### 4.3. Complexity

| Level | Значение |
|---|---|
| `S` | Один стабильный read contract, узкая schema, public test path |
| `M` | Несколько paginated endpoints и mapping, одна auth model |
| `L` | Private deployment, сложная auth/schema или несколько entity kinds |
| `XL` | Collector/agent, customer mapping, enterprise certification или many services |

---

## 5. Итоговый Research Ranking

| Rank | Candidate family | DTEK value hypothesis | Feasibility | Complexity | Pilot demand | Research decision |
|---:|---|---|---:|:---:|:---:|---|
| 0 | CSV/XLSX structured import | Быстрый data onboarding без connector | Реализовано | — | PENDING | Current baseline, не новый connector |
| 1 | Zabbix | Assets, interfaces, inventory, monitoring status, freshness | 10/12 | M | PENDING | Validate first |
| 2 | Kaspersky Security Center | Endpoint inventory, software и protection coverage | 9/12 | M/L | PENDING | Validate first |
| 3 | MaxPatrol VM | Assets, vulnerability evidence и remediation context | 8/12 | L | PENDING | Validate first |
| 4 | Wazuh | Agent inventory, OS, endpoint status и security coverage | 9/12 | M/L | PENDING | Validate first |
| 5 | Active Directory / FreeIPA | Identity, hosts, groups и access relations | 8/12 | L/XL | PENDING | Research after collector decision |
| 6 | Yandex Cloud | Public cloud inventory и resource topology | 11/12 | M | PENDING | Segment-specific fast path |
| 7 | UserGate NGFW | Network assets, perimeter/VPN context и graph edges | 7/12 | L | PENDING | Research with appliance access |
| 8 | VMware / Proxmox | VM, host, cluster, datastore и network topology | 8/12 | L | PENDING | Split by confirmed platform |
| 9 | OpenSearch / ELK | Flexible security/operations evidence | 6/12 | L/XL | PENDING | Mapping template first |
| 10 | Kubernetes | Workloads, namespaces, nodes и service relations | 7/12 | XL | PENDING | Post-first-connector research |

Rank — порядок discovery/validation, не порядок implementation. Место Yandex
Cloud ниже кандидатов с худшим feasibility объясняется отсутствием segment
evidence: технически API удобен, но неизвестно, сколько ICP-компаний хранит
значимый scope именно там.

---

## 6. Priority Candidates

### 6.1. Zabbix

**Почему в shortlist:** source естественно даёт список наблюдаемых hosts,
interfaces, groups, tags, inventory и monitoring state. Это полезно для
Object candidates, freshness, source coverage и сопоставления с security tools.

**Подтверждённый access:** JSON-RPC API; `host.get` поддерживает выбор interfaces,
inventory, tags, groups, discovery data и monitored state. API permissions
могут ограничиваться user role.

**Identity:** `hostid` стабилен внутри конкретной Zabbix installation и должен
namespace-иться через DTEK source ID. Hostname/IP являются supporting signals,
но не auto-merge key.

**First contract:** read-only hosts + interfaces + inventory + groups/tags +
status. Items, triggers, history и events не входят в первый contract.

**Feasibility:** `Access 3 + Identity 3 + Security 1 + Scope 3 = 10/12`.

**Risks:** Zabbix обычно расположен в private network. Прямой arbitrary URL из
SaaS запрещён T005; production требует approved collector/egress path. Inventory
может быть неполным или manual.

**Pilot evidence needed:** минимум два source cards либо один strategic pilot;
host count, inventory completeness, stable IDs, refresh need, read-only role,
network boundary и время текущей выгрузки.

### 6.2. Kaspersky Security Center

**Почему в shortlist:** endpoint inventory и protection state дают coverage для
Trust Passport, software context и gap candidates.

**Подтверждённый access:** KSC Open API является HTTP/JSON interface. Текущая
официальная reference описывает host attributes, software inventory, session
authentication и request tracing.

**Identity:** KSC host identifiers используются только в namespace конкретного
Administration Server. Display name/IP не являются strong cross-source key.

**First contract:** hosts, OS, agent/last-visible state, protection status и
allowlisted software summary. Управление tasks, policies и endpoints запрещено.

**Feasibility:** `Access 3 + Identity 3 + Security 1 + Scope 2 = 9/12`.

**Risks:** proprietary versioned protocol, private port, session lifecycle,
commercial test environment и potentially sensitive inventory. TLS versions и
auth modes проверяются на фактической поддерживаемой версии; insecure downgrade
не допускается.

**Pilot evidence needed:** installed KSC version, API availability/license,
least-privilege account, host count, desired fields, freshness и network model.

### 6.3. MaxPatrol VM

**Почему в shortlist:** vulnerability evidence напрямую усиливает фактор
уязвимостей, Risk candidates, Passport coverage и remediation discussion без
реализации собственного scanner.

**Подтверждённый access:** официальный developer guide описывает HTTPS REST API,
OAuth/Bearer flow и операции с assets/scans. Version-specific schema и read
permissions требуют проверки на pilot system.

**Identity:** source asset ID может быть strong внутри deployment; hostname,
IP, scanner account и network data остаются supporting/context signals.

**First contract:** assets + active vulnerability findings + severity/CVSS +
last scan/last seen. Scan creation, account management и remediation mutation
не входят.

**Feasibility:** `Access 3 + Identity 3 + Security 1 + Scope 1 = 8/12`.

**Risks:** high-volume and sensitive vulnerability payload, product-version
compatibility, commercial test access, pagination/retention и сложное mapping.

**Pilot evidence needed:** actual version, approved API scope, export/API burden,
finding volume, asset identity quality, accepted data fields и decision value.

### 6.4. Wazuh

**Почему в shortlist:** agent inventory, status, OS summary и endpoint/security
coverage подходят для Object candidates и контроля непокрытых активов.

**Подтверждённый access:** Wazuh Server REST API использует JWT; `/agents` и
overview endpoints поддерживают pagination/status filters. RBAC позволяет
ограничить API user.

**Identity:** agent ID стабилен в namespace Wazuh manager; name/IP недостаточны
для cross-source auto-merge.

**First contract:** read-only agents, OS, status, version и last keep-alive.
Enrollment keys, agent management, active response, rules и raw events исключены.

**Feasibility:** `Access 3 + Identity 3 + Security 1 + Scope 2 = 9/12`.

**Risks:** manager обычно private; официальные examples допускают self-signed
certificates, но DTEK Core не отключает TLS verification. Нужен trusted
certificate/collector. API имеет powerful mutation endpoints, поэтому требуется
отдельная read-only RBAC role.

**Pilot evidence needed:** manager version, agent count, read-only role,
certificate chain, current export burden и необходимость daily freshness.

---

## 7. Secondary Candidates

### 7.1. Active Directory / FreeIPA

Эта family имеет высокую product value: computer/user/group identities и access
relations могут усиливать Trust Graph и identity resolution. AD и FreeIPA не
являются одним adapter:

- AD использует LDAP/Kerberos semantics и stable `objectGUID`/`objectSid`;
- FreeIPA предоставляет JSON/XML-RPC/Python API, Kerberos/session context,
  `entryUUID` и собственные host/group semantics.

Оба источника обычно private и крайне чувствительны. Foundation SaaS connector
не должен принимать arbitrary LDAP endpoint. Требуется outbound-only collector
ADR, read-only service identity, attribute allowlist и отдельные adapters.

Первый contract ограничивается computers/hosts, groups и selected membership;
password material, hashes, authentication events и write operations запрещены.

### 7.2. Yandex Cloud

Public HTTPS APIs, service accounts, stable resource IDs и pagination хорошо
соответствуют SaaS runtime. Cloud/Folder и Compute Instance list дают быстрый
object/topology foundation.

Кандидат не поднимается выше без segment signal: один cloud provider покрывает
только часть ICP. Первый contract должен ограничиться organization/cloud/folder,
VM, disk, network/subnet bindings и read-only IAM role. Custom instance metadata
по умолчанию не собирается из-за риска secrets/user-data disclosure.

### 7.3. UserGate NGFW

UserGate documentation подтверждает management API через XML-RPC и XML-RPC over
HTTPS в поддерживаемых версиях. Источник может дать network assets, interfaces,
VPN/perimeter и relation context.

Он требует appliance/version matrix, private collector, strict method allowlist
и исключение config secrets, packet/log payload и write operations. API support
и stable identifiers должны быть подтверждены на customer version.

### 7.4. VMware / Proxmox

Обе платформы дают VM/host/cluster/network/storage topology и stable managed
object IDs, но требуют отдельных adapters:

- VMware vSphere exposes Web Services/REST management APIs;
- Proxmox VE предоставляет REST API через `pveproxy`.

Private management plane и широкие privileges делают collector и read-only role
обязательными. Guest custom attributes, snapshots и console/session data не
собираются без отдельного evidence decision.

### 7.5. OpenSearch / ELK

REST search path технически доступен, но index mappings различаются у каждого
клиента. Stable business identity часто отсутствует, а raw events имеют высокий
объём и чувствительность.

Сначала нужен customer-specific export/mapping template. Generic query connector
не должен становиться arbitrary ETL/SIEM ingestion engine. Кандидат повышается
только при повторении одного schema/product integration в нескольких пилотах.

### 7.6. Kubernetes

Kubernetes API способен дать nodes, namespaces, workloads, services и owner
references для Trust Graph. Но RBAC, service-account token, private control
plane, cluster multiplicity, volume и rapidly changing resources делают его
неподходящим первым connector без отдельного collector/runtime validation.

---

## 8. Candidates Outside Current Shortlist

| Candidate | Решение | Причина |
|---|---|---|
| MaxPatrol SIEM / RuSIEM full event ingestion | Import/research first | Риск превратить продукт в SIEM/data lake; нужен узкий aggregate contract |
| PT NAD / raw NetFlow / packet data | Postpone | High volume, sensitive traffic и сложная topology inference |
| ViPNet / Континент | Research only | Версия/API/access не подтверждены; security-sensitive management plane |
| Secret Net / Dallas Lock | Export first | Нужны customer/vendor API evidence и stable asset identity |
| Grafana | No direct connector | Визуализация, не authoritative source; подключаться к underlying source |
| PostgreSQL/Postgres Pro database scan | No direct access | DTEK Core не должен получать произвольные DB credentials для inventory |
| Endpoint agent DTEK Core | Post-MVP enterprise | Отдельный product/runtime/security lifecycle |
| Generic webhook / arbitrary URL | Rejected for foundation | Нарушает allowlisted pull и SSRF boundary |

Эти решения могут измениться только после source card и architecture/security
review, а не после общего feature request.

---

## 9. Data Contract Comparison

| Source | First entity kinds | Strong source key | Useful assertions | Explicit non-scope |
|---|---|---|---|---|
| Zabbix | host, interface | deployment + hostid | monitored, inventory, group, last seen | history/events/full items |
| KSC | managed host, product | server + host ID | agent/protection/software coverage | task/policy mutation |
| MaxPatrol VM | asset, finding | deployment + asset/finding ID | vulnerability, severity, scan freshness | scanning/remediation control |
| Wazuh | agent | manager + agent ID | OS, active state, version, last keep-alive | keys/active response/raw events |
| AD | computer, user, group | forest + objectGUID/objectSid | membership, enabled state, directory identity | credentials/auth logs/write |
| FreeIPA | host, user, group | realm + entryUUID | membership, host identity | credentials/Kerberos material/write |
| Yandex Cloud | cloud, folder, VM, network | organization/cloud + resource ID | lifecycle, placement, relations | custom metadata/secrets/mutation |
| UserGate | device/interface/VPN context | appliance + object ID, to verify | perimeter and network relation | packet/log payload/config write |
| VMware/Proxmox | host, VM, cluster, network | management plane + managed ID | topology, power/lifecycle state | console/snapshot mutation |
| OpenSearch | mapped assertion | index/schema-specific | only allowlisted aggregate fields | arbitrary query/raw event lake |

---

## 10. Russian Deployment Considerations

Перед повышением candidate в T007 source card должен ответить:

- SaaS разрешён или требуется on-prem/private cloud?
- можно ли передавать hostnames, IP, users, vulnerabilities и topology?
- есть ли isolated segment без исходящего internet access?
- какой vendor/product version реально используется?
- входит ли API в license/support contract?
- можно ли создать dedicated read-only service account?
- какие TLS/certificate requirements действуют?
- требуется ли ФСТЭК/ФСБ-certified deployment или customer security review?
- где физически должен выполняться collector и храниться raw evidence?
- какой retention и deletion contract согласован?

DTEK Core не заявляет соответствие конкретному регуляторному режиму только на
основании происхождения vendor. Требования фиксируются per customer/deployment.

---

## 11. Pilot Validation Card

Для каждого реального source создать карточку в закрытом workspace:

```text
Pilot alias:
Segment:
Source family / actual vendor and version:
Data owner:
Decision supported:
Data kinds:
Current format/access:
Approximate volume:
Update cadence / required freshness:
Stable external key:
Manual effort per cycle:
Security/deployment boundary:
Read-only account/API available:
Demand factors 0-3 with evidence:
Feasibility factors 0-3 with evidence:
Requested path: import / connector / no action:
Evidence location:
Owner / validation date:
```

Реальные company/source names, endpoints, accounts и identifiers не попадают в
Git. В cross-pilot report используется обезличенный alias.

---

## 12. Admission Gate Для S15-T007

Candidate может рассматриваться как первый prototype, если выполнено всё:

- [ ] минимум два independent pilot signals или один strategic signal с явным
  product owner approval;
- [ ] demand score заполнен observation/evidence, а не предположением;
- [ ] feasibility пересчитан на реальной version/deployment;
- [ ] decision value и manual burden подтверждены;
- [ ] stable identity и narrow first data contract определены;
- [ ] read-only account и test environment доступны;
- [ ] SaaS/collector deployment path согласован;
- [ ] T005 Vault, tenant, SSRF, audit и restore gates применимы;
- [ ] connector не дублирует достаточный CSV/XLSX export;
- [ ] есть customer/product owner для acceptance.

Если gate не выполнен, допустимое решение T007 — `DEFER / KEEP IMPORT PATH`.

---

## 13. Recommended Validation Order

1. На ближайших pilot/discovery sessions заполнить cards для Zabbix, KSC,
   MaxPatrol VM и Wazuh, если они реально присутствуют.
2. Отдельно фиксировать AD и FreeIPA, не объединяя demand и implementation.
3. Проверить Yandex Cloud у cloud-heavy ICP как потенциальный public-API fast
   path.
4. Для private sources сначала подтвердить collector requirement, затем API.
5. Использовать CSV/XLSX export как контрольную стоимость: connector нужен,
   только если регулярно уменьшает manual burden или улучшает freshness/quality.
6. После минимум двух pilots выполнить cross-signal synthesis и перейти к T007.

---

## 14. Official Technical Baseline

Desk feasibility проверена по официальным источникам:

- [Zabbix `host.get`](https://www.zabbix.com/documentation/current/en/manual/api/reference/host/get) — hosts, interfaces, inventory, groups, tags и discovery/status;
- [Kaspersky Security Center Open API](https://support.kaspersky.com/help/KSC/16.1/KSCAPI/index.html) и [host attributes](https://support.kaspersky.com/help/KSC/16.1/KSCAPI/a00012.html) — HTTP/JSON, auth/session, inventory и protection metadata;
- [MaxPatrol VM developer guide](https://www.ptsecurity.com/upload/corporate/ru-ru/products/mpvm/ptmpvm2.0_developguide_ru.pdf) — HTTPS REST API, OAuth и assets/scans operations;
- [Wazuh Server API](https://documentation.wazuh.com/current/user-manual/api/getting-started.html) и [API reference](https://documentation.wazuh.com/current/user-manual/api/reference.html) — JWT, agents, pagination и RBAC;
- [Active Directory object identity](https://learn.microsoft.com/en-us/windows/win32/ad/object-names-and-identities) — stable `objectGUID` semantics;
- [FreeIPA API guide](https://freeipa.readthedocs.io/en/latest/api/basic_usage.html) — JSON-RPC/Python API и Kerberos/client context;
- [UserGate NGFW manual](https://docs.usergate.com/pdf_manuals/ngfw/ngfw-7.x-manual-en.pdf) — XML-RPC и XML-RPC over HTTPS management ports;
- [Yandex Cloud Compute API](https://yandex.cloud/en/docs/compute/api-ref/Instance/list) — public paginated VM inventory;
- [VMware vSphere API](https://developer.broadcom.com/xapis/vsphere-web-services-api/latest/index.html) и [Proxmox VE guide](https://pve.proxmox.com/pve-docs/pve-admin-guide.pdf) — virtual infrastructure management APIs.

Публичная документация подтверждает техническую возможность, но не наличие
нужной версии, лицензии, role model или deployment access у будущего клиента.

---

## 15. Итог S15-T006

Российский research shortlist сформирован и ранжирован по product hypothesis,
data contract, documented access, identity quality, security fit и complexity.
Первая validation wave: Zabbix, Kaspersky Security Center, MaxPatrol VM и Wazuh.
AD/FreeIPA, Yandex Cloud и UserGate остаются сильными segment/deployment
candidates; virtualization, OpenSearch и Kubernetes идут после подтверждения
конкретной потребности.

**Pilot-backed shortlist пока пуст**, потому что source inventory не заполнен.
Это корректный результат, а не пропуск задачи. T007 не должен выбирать первый
connector до admission evidence; допустимо явно сохранить CSV/XLSX как основной
ingestion path.

S15-T007 выполнил этот gate и принял решение `DEFER / KEEP CSV-XLSX IMPORT
PATH`. Условия пересмотра зафиксированы в
[FIRST_CONNECTOR_CANDIDATE_DECISION.md](FIRST_CONNECTOR_CANDIDATE_DECISION.md).
