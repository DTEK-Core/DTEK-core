# Database Design

## Назначение

Описание основных сущностей базы данных DTEK Core.

# Таблица Organizations

Организации системы.

**Поля:**
- id
- name
- description
- industry
- size
- created_at

# Таблица Users

Пользователи системы.

**Поля:**
- id
- organization_id
- full_name
- email
- role
- created_at

# Таблица Objects

Объекты организации.

**Поля:**
- id
- organization_id
- name
- type
- owner_id
- criticality
- status
- created_at

# Таблица Trust Passports

Паспорта доверия.

**Поля:**
- id
- object_id
- trust_score
- trust_level
- risk_count
- connection_count
- updated_at

# Таблица Risks

Риски объектов.

**Поля:**
- id
- title
- description
- severity
- probability
- status
- created_at

# Таблица Object Risks

Связь объектов и рисков.

**Поля:**
- id
- object_id
- risk_id

# Таблица Relations

Связи между объектами.

**Поля:**
- id
- source_object_id
- target_object_id
- relation_type
- created_at

# Таблица Trust Score History

История изменения оценки доверия.

**Поля:**
- id
- object_id
- old_score
- new_score
- reason
- created_at