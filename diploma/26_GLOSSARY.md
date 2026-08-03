# 26. Глоссарий

| Термин | Простое и техническое значение | В DTEK Core | Подробнее |
|---|---|---|---|
| ADR | Зафиксированное архитектурное решение | Формула, стек, evidence-first boundary | `ARCHITECTURE_DECISIONS.md` |
| API | Контракт обмена программ | Supabase API, report route | 09 |
| Asset | Ценный объект | Строка `objects` | 12 |
| Audit trail | Журнал значимых действий | `security_events` | 18 |
| Authentication | Проверка личности | Supabase Auth | 11 |
| Authorization | Проверка разрешения | Actions + policies | 11 |
| Backend | Серверная логика | `lib/actions`, PostgreSQL | 09 |
| B2B | Продукт для бизнеса | Покупатель — организация | 03 |
| CI | Автоматические проверки commit | GitHub Actions | 19 |
| CMDB | База конфигурационных единиц | Источник, не замена DTEK | 02 |
| Commit | Снимок Git с hash | История Sprint | 21 |
| Confidence | Уверенность в данных | Metadata; не влияет на Score | 16 |
| Connector | Адаптер источника | Запланирован | 17 |
| Constraint | DB-ограничение | Score 0–100, weights=100 | 10 |
| Criticality | Бизнес-важность | Поле object и база factors | 13 |
| Dashboard | Сводный экран | KPI, trends, drivers | 05 |
| Deduplication | Поиск повторов | Ограниченно в import | 16 |
| Discovery | Поиск кандидатов из данных | Запланирован | 17 |
| Drift | Изменение состояния со временем | Drift Detection запланирован | 17 |
| EDR | Защита endpoint | Внешний источник, не boundary продукта | 02 |
| Evidence | Проверяемое доказательство | Пока source block, target tables позже | 16 |
| Foreign key | Связь таблиц | object ↔ organization | 10 |
| Frontend | Интерфейс браузера | React components | 08 |
| GRC | Governance, risk, compliance | Смежная система | 02 |
| Identity Resolution | Сведение записей к сущности | Запланировано | 17 |
| Index | Ускоритель DB поиска | Tenant/status/date indexes | 10 |
| Migration | Версионированное изменение БД | SQL `001–017` | 10 |
| Multi-tenancy | Несколько изолированных клиентов | `organization_id` + RLS | 11 |
| Normalization | Приведение форматов | Import headers/enums | 16 |
| Object | Цифровой/инфраструктурный актив | Таблица `objects` | 12 |
| Passport | Агрегат доверия объекта | `trust_passports` + read model | 12 |
| PostgreSQL | Реляционная СУБД | База Supabase | 10 |
| RBAC | Права по ролям | owner/analyst/admin/viewer | 11 |
| RLS | Права на уровне строк | Tenant policies | 11 |
| Risk | Возможный ущерб в условиях неопределённости | `risks` + `object_risks` | 15 |
| SaaS | Онлайн-сервис по модели подписки | Целевая модель DTEK | 01 |
| Server Action | Серверная функция Next.js | CRUD/import/config actions | 09 |
| Session | Состояние входа | Cookie/token Supabase | 11 |
| SIEM | Сбор/корреляция событий | Возможный источник | 02 |
| Sprint | Этап с целью и DoD | `tasks/SPRINT_*.md` | 20 |
| STRIDE | Модель категорий угроз | Security review | 18 |
| Tenant | Организация-клиент | `organizations` | 11 |
| Threat | Возможная причина вреда | Threat model | 18 |
| Trust Graph | Граф зависимостей | `relations` + canvas | 14 |
| Trust Score | Объяснимая оценка 0–100 | `lib/trust` | 13 |
| TypeScript | JavaScript со статическими типами | Основной язык | 08 |
| Validation | Проверка входа | Zod/import schemas | 09 |
| Vulnerability | Слабость актива | Risk category/factor | 15 |

> Главное, что нужно запомнить: термин нужно объяснять через смысл, технический механизм и конкретное место проекта.

## Проверь себя

1. Объясните RBAC и RLS без терминов из таблицы.
2. Чем Evidence отличается от Confidence?
3. Чем Object отличается от Passport?

