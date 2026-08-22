# Supabase — DTEK Core

**Project ref:** `ehqpijmbtavfacqogtoe`  
**Region:** Europe West (Frankfurt)  
**DB:** PostgreSQL 15  
**Linked env:** `.env.local` → `NEXT_PUBLIC_SUPABASE_URL`

---

## Local Connection Checklist

- `NEXT_PUBLIC_SUPABASE_URL` должен указывать на `https://ehqpijmbtavfacqogtoe.supabase.co`.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` берётся из Supabase Dashboard → Settings → API.
- `SUPABASE_SERVICE_ROLE_KEY` используется только на сервере и не коммитится.
- `SUPABASE_FETCH_TIMEOUT_MS` можно оставить по умолчанию `2000`.
- Если домен Supabase не резолвится или приложение показывает `fetch failed`,
  используйте [docs/development/TROUBLESHOOTING.md](../docs/development/TROUBLESHOOTING.md).

---

## Migrations

| File | Description |
|------|-------------|
| `001-004` | Helper functions, profiles, organizations и profile/org FK |
| `005-008` | Objects, Trust Passports, factor config и triggers |
| `009-013` | Risks, object risks, relations, score history и invitations |
| `014-015` | Notify/auth trigger fixes |
| `016-017` | RLS hardening и security events |
| `018` | Pilot Risk Workflow: owner, due date, comments и activity |
| `019` | Privileged owner/admin read policy для security events |

Файлы `supabase/migrations/001_*.sql` - `019_*.sql` являются источником истины
для текущей schema chain. Они не заменяют backup данных и Auth users.

## Commands

```bash
# Apply migrations to Supabase Cloud
npx supabase db push

# Regenerate TypeScript types after schema changes
npx supabase gen types typescript --project-id ehqpijmbtavfacqogtoe \
  > types/database.ts

# Create a new migration (timestamp format)
npx supabase migration new <name>

# Link CLI to cloud project (requires DB password)
npx supabase link --project-ref ehqpijmbtavfacqogtoe
```

## Architecture Notes

- **RLS** is enabled on all tables. Every row is scoped to `organization_id`.
- `current_org_id()` and `current_user_role()` are `STABLE SECURITY DEFINER` SQL functions — they run as the function owner, bypassing RLS on `profiles`, so they can safely read the caller's own profile without recursion.
- `trust_passports` is written only by the system (Edge Functions / triggers). Users have SELECT only.
- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — **never expose on client side, never commit to git**.

## Backup And Restore

Перед pilot release проверить managed backups в Supabase Dashboard и выполнить
restore rehearsal только в отдельный target project. Logical SQL exports,
connection strings и backup data запрещено хранить в репозитории.

Процедура: [BACKUP_RESTORE_RUNBOOK.md](../docs/operations/BACKUP_RESTORE_RUNBOOK.md).
