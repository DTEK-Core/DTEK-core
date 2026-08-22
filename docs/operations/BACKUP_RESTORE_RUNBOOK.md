# BACKUP_RESTORE_RUNBOOK.md - DTEK Core

`Спринт: Sprint 14 - Pilot Readiness`  
`Задача: S14-T005 - Backup & Restore Runbook`  
`Версия: 1.0`  
`Дата: 22.08.2026`  
`Статус: IMPLEMENTED / RESTORE REHEARSAL PENDING`

---

## 1. Назначение

Runbook описывает резервное копирование и восстановление pilot-окружения
DTEK Core на Supabase Cloud. Он применяется при случайном удалении или
повреждении данных, ошибочной миграции, недоступности проекта и подготовке
release candidate.

Документ не является разрешением на восстановление рабочей базы. Любая restore
operation требует отдельного решения владельца проекта, фиксации recovery
point и проверки target project. Для rehearsal и анализа всегда предпочтительно
восстановление в новый Supabase-проект.

---

## 2. Критические Правила

1. Не выполнять `db reset`, `db push`, `migration repair`, destructive SQL или
   restore в активном pilot-проекте в рамках обычной проверки.
2. Не считать миграции Git резервной копией данных. Они восстанавливают схему,
   но не пользователей Auth, организации, объекты, риски и историю.
3. Не хранить backup-файлы, connection strings, database password, access token,
   anon/service keys или `.env.local` в репозитории, task-документах и issue.
4. Не подставлять production/pilot secrets в примеры, screenshots и логи.
5. Перед restore зафиксировать source project ref, recovery point, incident
   owner, target project ref и ожидаемый объём потери данных.
6. По умолчанию восстанавливать в новый изолированный проект. In-place restore
   допустим только при подтверждённом инциденте, maintenance window и явном
   одобрении владельца проекта.
7. Не переключать Vercel на восстановленный проект до проверки Auth, данных,
   RLS/RBAC, tenant isolation и critical path.

---

## 3. Текущий Контур MVP

| Область | Текущее состояние | Как восстанавливается |
|---|---|---|
| PostgreSQL schema/data | Supabase Cloud, migrations `001-019` | Managed backup или проверенный logical backup |
| Supabase Auth users | Используется Email/Password | Managed database restore; проверить login/reset после restore |
| RLS, functions, triggers | В migrations `001-019` | Database restore и сверка с Git migrations |
| Supabase Storage objects | В MVP не используются | Перед каждым release повторно подтвердить; при появлении нужен отдельный object backup |
| Edge Functions | В MVP не используются | Перед каждым release повторно подтвердить; функции разворачиваются отдельно |
| Auth configuration | Site URL, redirect URLs, email settings | Вручную воспроизвести по configuration inventory |
| API keys | Привязаны к Supabase-проекту | Получить новые в target project, не копировать из backup |
| Vercel configuration | Environment variables и deployment settings | Перенастроить после проверки target project |
| Application code | GitHub, ветки `develop`/`main` | Git release commit/tag и штатный deploy |

Supabase database backup не содержит фактические Storage objects. Restore to a
new project переносит database/Auth data, но требует ручной настройки Storage,
Edge Functions, Auth/API keys, Realtime и части project settings. Поэтому
database backup не считается полной копией Supabase-проекта без configuration
inventory.

---

## 4. Владельцы И Цели Восстановления

Перед пилотом заполнить:

```text
Backup owner:
Restore approver:
Security reviewer:
Pilot project ref:
Supabase plan:
Backup type: Daily / PITR / Manual logical
Available restore window:
Last visible restore point (UTC):
Last logical export (UTC):
Last restore rehearsal:
Rehearsal target project ref:
Evidence location:
```

Pilot objectives:

| Показатель | Цель | Правило подтверждения |
|---|---|---|
| RPO | Не более 24 часов | Подтверждён recent managed restore point или logical export |
| RTO | Не более 4 часов | Измерен rehearsal от решения о restore до validated target |
| Restore rehearsal | До первого пилота и после существенного изменения recovery path | Только новый/одноразовый target project |
| Configuration inventory | Перед первым пилотом и после изменения Supabase/Vercel settings | Evidence без значений секретов |

Это pilot targets, а не автоматические гарантии. Если тариф, backup type,
retention, restore point или rehearsal не подтверждены в Dashboard, gate
остаётся `PENDING`, а RPO/RTO считаются неподтверждёнными.

---

## 5. Политика Резервного Копирования

### 5.1. Managed backup

Перед каждым pilot release открыть Supabase Dashboard -> Database -> Backups и
зафиксировать без секретов:

- project ref и статус `Active`;
- текущий plan;
- тип backup: Daily Backups или PITR;
- earliest/latest доступный recovery point;
- время последней успешной копии;
- возможность `Restore to a New Project`;
- имя проверяющего, дату и ссылку на закрытое evidence.

Наличие managed backup нельзя предполагать по старой документации: возможности
и retention зависят от текущего плана и настроек проекта.

### 5.2. Portable logical backup

Logical export является дополнительной переносимой копией. Для пилота он
создаётся:

- до первого внешнего доступа;
- перед schema/data-changing release;
- не реже одного раза в неделю во время активного пилота;
- ежедневно, если recent managed restore point не подтверждён.

Хранение:

- только в одобренном зашифрованном хранилище вне Git и рабочей папки;
- доступ только у backup owner и restore approver;
- минимум 7 дней rolling retention для pilot copies;
- pre-release copy хранится не менее 30 дней после завершения пилота;
- удаление фиксируется в evidence log.

Точный срок может быть сокращён требованиями клиента или договором. Реальные
данные клиента нельзя помещать в личное облако или нешифрованный архив.

### 5.3. Configuration inventory

Сохранить отдельно от backup-файлов и без secret values:

- Supabase project ref, region, Postgres major version и plan;
- включённые extensions, Realtime publications, network/SSL restrictions;
- Auth providers, Site URL, redirect URLs, email templates/SMTP status;
- список Storage buckets и Edge Functions либо подтверждение `не используются`;
- имена Vercel env variables и environments, где они заданы;
- release commit SHA и список migrations `001-019`;
- ответственных и support/escalation channel.

---

## 6. Создание Logical Backup

### 6.1. Preconditions

- [ ] Backup owner вошёл в Supabase CLI под своей учётной записью.
- [ ] Source project ref сверен с pilot release card.
- [ ] Docker Desktop и актуальный Supabase CLI доступны.
- [ ] Получена Session pooler connection string из Dashboard -> Connect.
- [ ] Backup directory находится вне репозитория и защищена правами ОС.
- [ ] В source database не выполняется миграция или bulk import.

Проверки команд:

```bash
npx supabase --version
npx supabase migration list --linked
```

`migration list` используется только для чтения. Не выполнять `db push` или
`repair` во время backup procedure.

### 6.2. Export

Ниже воспроизводится официальный split export: roles, schema и data. Ввести
Session pooler URL из Supabase Dashboard без сохранения в shell history.

```bash
umask 077
BACKUP_DIR="$HOME/secure-backups/dtek-core/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$BACKUP_DIR"

read -r -s "SOURCE_DB_URL?Source database URL: "
echo

npx supabase db dump --db-url "$SOURCE_DB_URL" \
  -f "$BACKUP_DIR/roles.sql" --role-only

npx supabase db dump --db-url "$SOURCE_DB_URL" \
  -f "$BACKUP_DIR/schema.sql"

npx supabase db dump --db-url "$SOURCE_DB_URL" \
  -f "$BACKUP_DIR/data.sql" --use-copy --data-only \
  -x "storage.buckets_vectors" -x "storage.vector_indexes"

npx supabase db dump --db-url "$SOURCE_DB_URL" \
  -f "$BACKUP_DIR/history_schema.sql" --schema supabase_migrations

npx supabase db dump --db-url "$SOURCE_DB_URL" \
  -f "$BACKUP_DIR/history_data.sql" --use-copy --data-only \
  --schema supabase_migrations

unset SOURCE_DB_URL
```

Не копировать команды с реальным URL в task, чат или shell script репозитория.
Если команда завершилась с ошибкой, набор считается неполным и не может быть
использован как verified backup.

### 6.3. Integrity check

```bash
test -s "$BACKUP_DIR/roles.sql"
test -s "$BACKUP_DIR/schema.sql"
test -s "$BACKUP_DIR/data.sql"
test -s "$BACKUP_DIR/history_schema.sql"
test -s "$BACKUP_DIR/history_data.sql"

cd "$BACKUP_DIR"
shasum -a 256 roles.sql schema.sql data.sql \
  history_schema.sql history_data.sql > SHA256SUMS
chmod 600 roles.sql schema.sql data.sql \
  history_schema.sql history_data.sql SHA256SUMS
```

Зафиксировать размеры файлов, checksum, UTC timestamp, source project ref и CLI
version. Не прикладывать SQL-файлы к GitHub issue. Проверка `test -s` и checksum
подтверждают целостность файлов, но полноценную восстанавливаемость подтверждает
только rehearsal.

---

## 7. Выбор Сценария Восстановления

| Ситуация | Предпочтительный путь |
|---|---|
| Rehearsal или анализ данных | Managed `Restore to a New Project` |
| Ошибочное удаление/повреждение, source доступен | Restore to new project, validate, затем controlled cutover |
| Source недоступен, есть managed backup | Новый проект из backup/PITR |
| Managed restore недоступен, есть verified logical set | Manual logical restore в новый пустой проект |
| Нужен срочный rollback active project | In-place restore только после approval и оценки data loss |
| Только приложение сломано, данные целы | Не восстанавливать БД; rollback/deploy приложения |
| Только Supabase был paused | Resume и health check; pause/resume не заменяет backup strategy |

Если причина не установлена, сначала выполнить
[ENVIRONMENT_HEALTH_RUNBOOK.md](ENVIRONMENT_HEALTH_RUNBOOK.md). Ошибки DNS,
ключей или middleware не исправляются восстановлением базы.

---

## 8. Предпочтительный Restore To A New Project

### 8.1. Подготовка

1. Остановить bulk import и изменения конфигурации.
2. Зафиксировать incident start, последнюю корректную бизнес-операцию и
   предполагаемый recovery point в UTC.
3. Сравнить recovery point с последним backup/PITR point и записать ожидаемый
   data loss.
4. Получить approval владельца проекта и назначить restore operator.
5. Если source доступен, создать fresh logical backup перед вмешательством.
6. Убедиться, что target будет новым проектом в требуемом регионе и не связан с
   production Vercel environment.

### 8.2. Managed restore

1. В source Supabase Dashboard открыть Database -> Backups -> Restore to a New
   Project.
2. Выбрать backup или PITR time строго до инцидента.
3. Проверить region, compute/disk settings и отображаемую стоимость.
4. Создать новый проект и дождаться завершения операции в Dashboard.
5. Записать target project ref и фактическую длительность restore.
6. Не менять env Vercel до завершения разделов 9 и 10.

Managed clone переносит database schema/data, roles и Auth users, но не является
полной копией настроек проекта. После создания target вручную проверить Auth,
API keys, Realtime, extensions/settings, network restrictions, Storage и Edge
Functions.

### 8.3. Logical restore fallback

Использовать только verified комплект из раздела 6 и новый пустой Supabase
project. Перед запуском сверить процедуру с актуальной официальной Supabase
инструкцией, так как CLI и managed schemas меняются.

```bash
cd "/path/to/verified-backup"
shasum -a 256 -c SHA256SUMS

read -r -s "TARGET_DB_URL?Target database URL: "
echo

psql \
  --single-transaction \
  --variable ON_ERROR_STOP=1 \
  --file roles.sql \
  --file schema.sql \
  --command 'SET session_replication_role = replica' \
  --file data.sql \
  --dbname "$TARGET_DB_URL"

psql \
  --single-transaction \
  --variable ON_ERROR_STOP=1 \
  --file history_schema.sql \
  --file history_data.sql \
  --dbname "$TARGET_DB_URL"

unset TARGET_DB_URL
```

Любая ошибка при `ON_ERROR_STOP=1` означает `FAIL`: не продолжать cutover,
сохранить safe error summary и создать новый clean target для следующей
попытки. Не исправлять backup-файлы ad hoc без review; известные Supabase role
и owner conflicts сверять с официальным troubleshooting или Support.

---

## 9. Восстановление Конфигурации

На target project:

- [ ] Сверить Postgres version, extensions и migrations `001-019`.
- [ ] Воспроизвести Auth Site URL, redirect URLs и Email/Password settings.
- [ ] Проверить SMTP/email template status; MVP manual invite link остаётся
      основным delivery path.
- [ ] Получить новые project URL, anon key и service role key.
- [ ] Сверить Realtime publications, network restrictions и SSL settings.
- [ ] Подтвердить отсутствие Storage objects и Edge Functions в текущем MVP.
- [ ] Если они появились после этой версии runbook, выполнить отдельный
      approved backup/restore plan до cutover.
- [ ] Не переносить старые API keys как текст из backup evidence.

Новые значения сначала добавить только в локальную/изолированную validation
environment. Production/Preview variables Vercel менять после проверки target.

---

## 10. Проверка Восстановленного Target

### 10.1. Database и Auth

- [ ] Все migrations `001-019` присутствуют без drift.
- [ ] Количество организаций, profiles, objects, risks, relations и invitations
      соответствует recovery point либо расхождение объяснено.
- [ ] Существующий test owner входит в систему.
- [ ] Password reset проходит штатный redirect flow.
- [ ] Новый manual invitation создаётся и принимается.
- [ ] RLS включён на tenant tables; owner/admin/analyst/viewer работают по
      актуальной матрице.
- [ ] Tenant A не читает и не изменяет данные Tenant B.
- [ ] `security_events` доступны только owner/admin.

Не включать email, UUID, comment body и клиентские данные в общедоступное
evidence. Для count comparison допустимы агрегаты без PII.

### 10.2. Application critical path

В изолированном deployment выполнить:

```bash
npm run type-check
npm run lint
npm run build
SMOKE_BASE_URL=https://target-preview.example npm run test:smoke
```

Затем пройти authenticated раздел
[PILOT_SMOKE_TEST_CHECKLIST.md](../testing/PILOT_SMOKE_TEST_CHECKLIST.md): Auth,
Organization, import, Objects, Passport, Risks, Dashboard, Graph, Configurator,
reports, RBAC/RLS и mobile.

### 10.3. Restore acceptance

Restore rehearsal получает `PASS`, только если:

- checksum verified;
- restore завершён без необъяснённых ошибок;
- configuration inventory воспроизведён;
- Auth и critical path прошли;
- tenant isolation подтверждена;
- фактические RPO/RTO рассчитаны;
- target не подключён к production случайно;
- evidence заполнено и согласовано.

---

## 11. Controlled Cutover

Выполнять только при реальном recovery, не при rehearsal.

1. Объявить maintenance window и остановить пользовательские mutations/import.
2. Зафиксировать final source state и ожидаемый data gap.
3. Получить финальный `GO` restore approver и security reviewer.
4. Обновить Vercel `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` и server-only
   `SUPABASE_SERVICE_ROLE_KEY` для нужных environments.
5. Не менять `NEXT_PUBLIC_APP_URL`, если домен приложения не изменился.
6. Выполнить redeploy и повторить health check, automated smoke и сокращённый
   authenticated critical path.
7. Наблюдать Auth/DB/application logs в согласованное окно.
8. Старый проект оставить read-only/изолированным до решения об удалении.
9. После стабилизации ротировать временные credentials и закрыть лишний доступ.

Если target validation после cutover падает, остановить mutations и вернуть
предыдущий validated env mapping. Не пытаться объединять расходящиеся базы без
отдельного data reconciliation plan.

---

## 12. In-place Restore

In-place restore создаёт downtime и может безвозвратно удалить изменения после
выбранного recovery point. Он допустим только если восстановление в новый
проект и controlled cutover объективно невозможны или медленнее допустимого
RTO.

Обязательные условия:

- [ ] Инцидент имеет Blocker/Critical severity.
- [ ] Backup/recovery point виден в Dashboard.
- [ ] Рассчитан и письменно принят data loss.
- [ ] Все mutations остановлены.
- [ ] Fresh logical export создан, если source доступен.
- [ ] Есть approval владельца проекта и maintenance window.
- [ ] Назначены restore operator, QA и rollback owner.
- [ ] После restore выполняются разделы 9 и 10.

Никогда не использовать in-place restore как способ проверить этот runbook.

---

## 13. Evidence И Журнал Rehearsal

```text
Operation: Backup / Rehearsal / Recovery
Date and time (UTC):
Operator:
Approver:
Source project ref:
Target project ref:
Release commit:
Backup type:
Backup/recovery point (UTC):
Incident point (UTC, if applicable):
Expected RPO:
Actual RPO:
RTO start/end:
Actual RTO:
Checksum result:
Migration result:
Auth result:
Tenant isolation result:
Critical path result:
Configuration gaps:
Defects/workarounds:
Final result: PASS / FAIL / BLOCKED
Evidence location:
Target disposal/cutover decision:
```

Evidence хранится в закрытом операционном хранилище. В Git фиксируются только
процедура и итоговый обезличенный статус, но не backup data или secrets.

---

## 14. Release Gate S14-T005

### Реализовано в задаче

- [x] Определены backup scope, владельцы и pilot RPO/RTO targets.
- [x] Описаны managed и portable logical backup paths.
- [x] Описаны restore-to-new-project, logical fallback и in-place safeguards.
- [x] Определены configuration inventory, validation, cutover и evidence.
- [x] Зафиксированы ограничения Storage, Edge Functions и project settings.

### Требует фактического выполнения перед Pilot GO

- [ ] В Dashboard подтверждены plan, backup type, retention и recent restore point.
- [ ] Назначены backup owner, restore approver и security reviewer.
- [ ] Создан encrypted logical backup вне репозитория.
- [ ] Выполнен restore rehearsal в новый disposable project.
- [ ] Auth, RBAC/RLS, tenant isolation и critical path прошли.
- [ ] Фактические RPO/RTO и evidence зафиксированы.
- [ ] Rehearsal target изолирован или удалён по решению владельца.

До выполнения второй группы readiness gate имеет статус
`IMPLEMENTED / REHEARSAL PENDING`, а не `PASS`.

---

## 15. Источники И Связанные Документы

Официальные Supabase инструкции:

- [Database Backups](https://supabase.com/docs/guides/platform/backups)
- [Restore to a new project](https://supabase.com/docs/guides/platform/clone-project)
- [Backup and Restore using the CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)

Документы DTEK Core:

- [DEPLOYMENT.md](DEPLOYMENT.md)
- [ENVIRONMENT_HEALTH_RUNBOOK.md](ENVIRONMENT_HEALTH_RUNBOOK.md)
- [PILOT_READINESS_CHECKLIST.md](../testing/PILOT_READINESS_CHECKLIST.md)
- [PILOT_SMOKE_TEST_CHECKLIST.md](../testing/PILOT_SMOKE_TEST_CHECKLIST.md)
- [SECURITY_OVERVIEW.md](../security/SECURITY_OVERVIEW.md)
- [TROUBLESHOOTING.md](../development/TROUBLESHOOTING.md)
- [supabase/README.md](../../supabase/README.md)

---

*Runbook закрывает документационную часть S14-T005. Реальная готовность к
восстановлению подтверждается только безопасным rehearsal на отдельном target.*
