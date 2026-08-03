# Диаграммы DTEK Core

## Авторизация и tenant isolation

```mermaid
sequenceDiagram
  actor U as Пользователь
  participant A as Supabase Auth
  participant S as Server Action
  participant P as Profile
  participant D as PostgreSQL/RLS
  U->>A: Login
  A-->>U: Session cookie/token
  U->>S: Action request
  S->>A: getUser
  S->>P: role + organization_id
  S->>D: scoped query
  D->>D: current_org_id + policy
  D-->>S: Только разрешённые строки
```

## Создание объекта

```mermaid
flowchart LR
  F[Object form] --> V[Zod validation]
  V --> A[Server Action]
  A --> O[(objects)]
  O --> TR[DB trigger]
  TR --> P[(trust_passports)]
  A --> E[Trust engine]
  E --> P
  E --> H[(trust_score_history)]
```

## Импорт

```mermaid
flowchart LR
  F[CSV/XLSX] --> P[Browser parser]
  P --> N[Normalize + validate]
  N --> D[Duplicate check]
  D --> R[Preview]
  R -->|confirm| C[Create-only commit]
  C --> DB[(Objects/Risks)]
  C --> A[(Security events)]
```

## Trust Score

```mermaid
flowchart TB
  O[Object fields] --> C[Completeness]
  R[Active risks] --> F[6 factor scores]
  C --> F
  W[Organization weights = 100] --> S[Weighted score]
  F --> S
  S --> P[Passport + Object]
  S --> H[History snapshot]
  P --> X[Explainability]
```

## Trust Graph

```mermaid
graph LR
  WEB[External web app] --> APP[Application server]
  APP --> DB[(Critical database)]
  IAM[Service identity] --> APP
```

Сейчас вершины — objects, рёбра — вручную созданные `relations`. Автоматическое извлечение рёбер отсутствует.

## Целевая evidence-first цепочка

```mermaid
flowchart LR
  AD[AD] --> CF[Connector Framework]
  Z[Zabbix] --> CF
  VM[MaxPatrol VM] --> CF
  CF --> RAW[Raw Evidence]
  RAW --> N[Normalization]
  N --> IR[Identity Resolution]
  IR --> IN[Discovery Inbox]
  IN --> O[Object]
  O --> P[Trust Passport]
  P --> S[Trust Score]
  O --> G[Trust Graph]
  RAW --> ARM[Auto Risk Mapper]
  ARM --> RR[Risk candidates]
```

Последняя диаграмма целевая: её блоки после import path ещё не являются работающим runtime.

