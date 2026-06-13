# Supabase — DTEK Core

**Project ref:** `ehqpijmbtavfacqogtoe`  
**Region:** Europe West (Frankfurt)  
**DB:** PostgreSQL 15  
**Linked env:** `.env.local` → `NEXT_PUBLIC_SUPABASE_URL`

---

## Migrations

| File | Description |
|------|-------------|
| `001_helper_functions.sql` | RLS helpers (`current_org_id`, `current_user_role`), triggers (`set_updated_at`, `create_trust_passport`, `notify_trust_recalc`) |
| `002_profiles_organizations.sql` | `profiles`, `organizations` tables, FK cycle resolved via deferred ADD COLUMN |
| `003_objects_passports_config.sql` | `objects`, `trust_passports`, `trust_factor_config` |
| `004_risks_relations.sql` | `risks`, `object_risks`, `relations` |
| `005_history_invitations.sql` | `trust_score_history`, `invitations`, all triggers, RLS policies |

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
