# RBAC_MODEL.md — DTEK Core

`Версия: 1.7`
`Дата: 08.11.2026`
`Статус: Актуальный`
`Источник: ARCHITECTURE_DECISIONS.md ADR-003`

---

## Модель ролей

DTEK Core использует четыре роли с разграничением по принципу минимальных привилегий.

Роли хранятся в поле `role` таблицы `profiles`:
```sql
role TEXT CHECK (role IN ('owner', 'analyst', 'admin', 'viewer'))
```

| Роль (БД) | Роль (UI) | Назначение |
|---|---|---|
| `owner` | Владелец | Создатель организации. Полный контроль. |
| `analyst` | Аналитик ИБ | Работа с объектами, рисками, паспортами, конфигуратором |
| `admin` | Администратор | Управление инфраструктурными объектами и командой |
| `viewer` | Наблюдатель | Только чтение |

> Приглашение с ролью `owner` запрещено. Owner создаётся только при создании организации.
> В текущем MVP invite-ссылки создаёт только `owner`. `admin` — делегированная роль внутри уже созданной организации, а не первый зарегистрированный пользователь.
> Manual invite link передаётся адресату owner вручную; email provider в Commercial MVP не заявлен.
> Первый `owner` назначается только authenticated RPC создания организации;
> direct INSERT организации и самостоятельное назначение membership запрещены.

---

## Матрица полных прав (RBAC)

| Действие | owner | analyst | admin | viewer |
|---|:---:|:---:|:---:|:---:|
| **Организация** | | | | |
| Редактировать данные организации | ✅ | ❌ | ❌ | ❌ |
| Удалить организацию | ✅ | ❌ | ❌ | ❌ |
| **Пользователи** | | | | |
| Пригласить (все роли кроме owner) | ✅ | ❌ | ❌ | ❌ |
| Изменить роль | ✅ | ❌ | ✅¹ | ❌ |
| Заблокировать/разблокировать | ✅ | ❌ | ✅¹ | ❌ |
| Удалить пользователя | ✅ | ❌ | ✅¹ | ❌ |
| **Объекты** | | | | |
| Создать объект (все типы) | ✅ | ✅ | ❌ | ❌ |
| Создать объект (инфра-типы²) | ✅ | ✅ | ✅ | ❌ |
| Редактировать объект | ✅ | ✅ | ✅ | ❌ |
| Архивировать объект | ✅ | ❌ | ❌ | ❌ |
| Просматривать объекты | ✅ | ✅ | ✅ | ✅ |
| **Trust Passport** | | | | |
| Просматривать паспорт | ✅ | ✅ | ✅ | ✅ |
| **Риски** | | | | |
| Создать риск | ✅ | ✅ | ❌ | ❌ |
| Назначить ответственного и срок | ✅ | ✅ | ❌ | ❌ |
| Изменить статус риска | ✅ | ✅ | ❌ | ❌ |
| Добавить комментарий | ✅ | ✅ | ❌ | ❌ |
| Читать комментарии и activity timeline | ✅ | ✅ | ✅ | ✅ |
| Удалить риск | ✅ | ✅ | ❌ | ❌ |
| Просматривать риски | ✅ | ✅ | ✅ | ✅ |
| **Trust Graph** | | | | |
| Создать связь между объектами | ✅ | ✅ | ❌ | ❌ |
| Удалить связь | ✅ | ✅ | ❌ | ❌ |
| Просматривать граф | ✅ | ✅ | ✅ | ✅ |
| **Конфигуратор** | | | | |
| Редактировать веса факторов | ✅ | ✅ | ❌ | ❌ |
| Просматривать текущие веса | ✅ | ✅ | ✅ | ✅ |
| **Настройки** | | | | |
| Просматривать журнал аудита | ✅ | ❌ | ✅ | ❌ |
| Запускать диагностику окружения | ✅ | ❌ | ✅ | ❌ |
| Редактировать профиль (свой) | ✅ | ✅ | ✅ | ✅ |

### Post-MVP Connector Framework

Connector permissions не расширяют права существующих модулей и начинают
действовать только после реализации runtime. Итоговая матрица S15-T005:

| Действие | owner | analyst | admin | viewer |
|---|:---:|:---:|:---:|:---:|
| Safe installation health/status | ✅ | ✅ | ✅ | ❌ |
| Draft/non-secret config | ✅ | ✅ | Только technical Object scope | ❌ |
| Credential create/replace, без reveal | ✅ | ✅ | ❌ | ❌ |
| Test/manual run/pause/resume | ✅ | ✅ | Только technical Object scope | ❌ |
| First activation, schedule, authority/policy | ✅ | ❌ | ❌ | ❌ |
| Disconnect/delete installation | ✅ | ❌ | ❌ | ❌ |
| Normalized evidence/source context | ✅ | ✅ | Safe technical context | ❌ |
| Raw evidence detail | ✅ | ✅ | Redacted diagnostics | ❌ |
| Connector Audit Log | ✅ | ❌ | ✅ | ❌ |

Полная модель, включая ограничения admin scope и Discovery actions:
[CONNECTOR_SECURITY_MODEL.md](CONNECTOR_SECURITY_MODEL.md).

> ¹ Admin управляет только пользователями, которые не являются `owner`. Назначение роли `owner` запрещено.
> ² Инфраструктурные типы: `server`, `workstation`, `laptop`, `network`, `ot`

---

## Реализация в коде

### Проверка роли в Server Actions

Все критические операции проверяют роль **на сервере**:

```typescript
// Пример из lib/actions/risks.ts
const allowed = ['owner', 'analyst'];
if (!allowed.includes(ctx.role)) {
  return { error: 'Недостаточно прав' };
}
```

### Вспомогательные функции в БД

Функции определены в `supabase/migrations/001_helper_functions.sql`:

```sql
current_org_id()    -- возвращает organization_id текущего пользователя
current_user_role() -- возвращает role текущего пользователя
```

### Profile И Membership Mutations

После migration 020 прямой `UPDATE profiles` через anon/authenticated API
запрещён независимо от видимости кнопок и Server Action:

- собственные `full_name`/`team` обновляются через `update_own_profile`;
- роль, статус и удаление membership выполняются отдельными tenant-scoped RPC;
- caller должен быть active `owner`/`admin` своей организации;
- собственная роль/статус, owner target, назначение owner и foreign tenant
  всегда запрещены;
- audit event создаётся в той же транзакции, что и membership change.

### Blocked Membership

После migration 021 `blocked` является обязательной authorization boundary, а
не только UI-статусом:

- RLS helpers не возвращают tenant и role заблокированному JWT;
- Server Components и Server Actions получают отказ через общий auth context;
- middleware очищает локальную session cookie и показывает безопасное сообщение;
- новая попытка login завершается без предоставления app access;
- unblock сохраняет назначенную роль, но требует новой аутентификации.
- invitation acceptance не может реактивировать blocked profile: migration 022
  разрешает blocked → active только доверенному membership RPC.

### Скрытие элементов UI

Client-side скрытие кнопок — дополнительная мера, не единственная защита. Пример:

```tsx
// Показываем кнопку приглашения только owner
{role === 'owner' && (
  <InviteButton />
)}
```

---

## Проверка ролей при тестировании

Для проверки RBAC см. [docs/testing/RBAC_TESTING_GUIDE.md](../testing/RBAC_TESTING_GUIDE.md).

---

## История изменений

| Версия | Дата | Изменение |
|---|---|---|
| 1.7 | 08.11.2026 | SEC-02: blocked membership закрывает app/API/action access, отзывает sessions и защищён от service-role reactivation bypass |
| 1.6 | 06.11.2026 | SEC-01: direct profile UPDATE запрещён, self/member mutations переведены на tenant-scoped audited RPC |
| 1.5 | 23.08.2026 | Добавлена утверждённая Post-MVP connector/evidence RBAC matrix S15-T005 |
| 1.4 | 19.08.2026 | Manual invite link зафиксирован как MVP delivery path; RBAC не изменён |
| 1.3 | 19.08.2026 | Environment Health Check ограничен owner/admin в UI и Server Action |
| 1.2 | 12.08.2026 | Добавлена детализация Pilot Risk Workflow: assignment, deadlines, immutable comments и timeline |
| 1.1 | 15.07.2026 | Уточнён MVP-flow ролей: первый пользователь — owner, invite-ссылки создаёт owner, admin — делегированная роль |
| 1.0 | 25.06.2026 | Первичная документация по результатам Sprint 06 |
