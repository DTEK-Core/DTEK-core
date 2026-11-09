const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { createClient } = require('@supabase/supabase-js');

function getLocalSupabaseStatus() {
  const cli = path.resolve('node_modules/.bin/supabase');
  const output = execFileSync(cli, ['status', '-o', 'json'], {
    cwd: path.resolve('.'),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const start = output.indexOf('{');
  const end = output.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('Local Supabase status is unavailable');
  return JSON.parse(output.slice(start, end + 1));
}

function createTestClient(url, key) {
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

function getLocalDatabaseContainer() {
  const config = readFileSync(path.resolve('supabase/config.toml'), 'utf8');
  const projectId = config.match(/^project_id\s*=\s*"([^"]+)"/m)?.[1];
  if (!projectId) throw new Error('Local Supabase project_id is unavailable');
  const expectedContainer = `supabase_db_${projectId}`;
  const output = execFileSync(
    'docker',
    ['ps', '--filter', `name=${expectedContainer}`, '--format', '{{.Names}}'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  ).trim();
  const containers = output.split('\n').filter(Boolean);
  if (!containers.includes(expectedContainer)) {
    throw new Error('Local Supabase database container is unavailable');
  }
  return expectedContainer;
}

function runFixtureSql(container, sql) {
  return execFileSync(
    'docker',
    ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-At'],
    { input: sql, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
  );
}

function hasTablePrivilege(container, role, table, privilege) {
  return runFixtureSql(
    container,
    `SELECT has_table_privilege('${role}', 'public.${table}', '${privilege}');`,
  ).trim() === 't';
}

async function createFixtureUser(admin, suffix, name) {
  const email = `stab01-${name}-${suffix}@example.test`;
  const password = `Stab01-${suffix}-Pass!`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });
  assert.ifError(error);
  assert.ok(data.user);
  return { id: data.user.id, email, password };
}

async function signIn(url, anonKey, fixture) {
  const client = createTestClient(url, anonKey);
  const { error } = await client.auth.signInWithPassword({
    email: fixture.email,
    password: fixture.password,
  });
  assert.ifError(error);
  return client;
}

function organizationPayload(name) {
  return {
    p_name: name,
    p_short_name: name.slice(0, 80),
    p_industry: 'IT и телеком',
    p_size: 'medium',
    p_inn: '7712345678',
    p_region: 'Москва',
  };
}

test('STAB-01 creates organization, owner membership and config atomically', async (t) => {
  const status = getLocalSupabaseStatus();
  const admin = createTestClient(status.API_URL, status.SERVICE_ROLE_KEY);
  const anon = createTestClient(status.API_URL, status.ANON_KEY);
  const databaseContainer = getLocalDatabaseContainer();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const fixtureToken = `stab01_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const configFailureFunction = `${fixtureToken}_config_failure`;
  const configFailureTrigger = `${fixtureToken}_config_failure_trigger`;
  const auditFailureFunction = `${fixtureToken}_audit_failure`;
  const auditFailureTrigger = `${fixtureToken}_audit_failure_trigger`;
  const fixtures = {};
  const originalPrivileges = {
    organizationsSelect: hasTablePrivilege(databaseContainer, 'service_role', 'organizations', 'SELECT'),
    configSelect: hasTablePrivilege(databaseContainer, 'service_role', 'trust_factor_config', 'SELECT'),
    eventsSelect: hasTablePrivilege(databaseContainer, 'service_role', 'security_events', 'SELECT'),
  };

  t.after(async () => {
    const userIds = Object.values(fixtures).map((fixture) => fixture.id);
    const userIdList = userIds.length > 0
      ? userIds.map((id) => `'${id}'::uuid`).join(', ')
      : 'NULL';
    let cleanupError = null;
    try {
      runFixtureSql(databaseContainer, `
        DROP TRIGGER IF EXISTS ${configFailureTrigger} ON public.trust_factor_config;
        DROP FUNCTION IF EXISTS public.${configFailureFunction}();
        DROP TRIGGER IF EXISTS ${auditFailureTrigger} ON public.security_events;
        DROP FUNCTION IF EXISTS public.${auditFailureFunction}();
        DELETE FROM security_events WHERE actor_id IN (${userIdList});
        UPDATE profiles
        SET organization_id = NULL, role = 'viewer', status = 'active'
        WHERE id IN (${userIdList});
        DELETE FROM organizations WHERE owner_id IN (${userIdList});
      `);
    } catch (error) {
      cleanupError = error;
    }
    try {
      runFixtureSql(databaseContainer, `
        ${originalPrivileges.organizationsSelect
          ? 'GRANT SELECT ON organizations TO service_role;'
          : 'REVOKE SELECT ON organizations FROM service_role;'}
        ${originalPrivileges.configSelect
          ? 'GRANT SELECT ON trust_factor_config TO service_role;'
          : 'REVOKE SELECT ON trust_factor_config FROM service_role;'}
        ${originalPrivileges.eventsSelect
          ? 'GRANT SELECT ON security_events TO service_role;'
          : 'REVOKE SELECT ON security_events FROM service_role;'}
      `);
    } catch (error) {
      cleanupError ||= error;
    }
    for (const userId of userIds) {
      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) cleanupError ||= error;
    }
    if (cleanupError) throw cleanupError;
  });

  runFixtureSql(databaseContainer, `
    GRANT SELECT ON organizations, trust_factor_config, security_events TO service_role;
  `);

  fixtures.success = await createFixtureUser(admin, suffix, 'success');
  fixtures.invalid = await createFixtureUser(admin, suffix, 'invalid');
  fixtures.blocked = await createFixtureUser(admin, suffix, 'blocked');
  fixtures.invited = await createFixtureUser(admin, suffix, 'invited');
  fixtures.missing = await createFixtureUser(admin, suffix, 'missing');
  fixtures.member = await createFixtureUser(admin, suffix, 'member');
  fixtures.rollback = await createFixtureUser(admin, suffix, 'rollback');
  fixtures.auditRollback = await createFixtureUser(admin, suffix, 'audit-rollback');
  fixtures.race = await createFixtureUser(admin, suffix, 'race');

  const successClient = await signIn(status.API_URL, status.ANON_KEY, fixtures.success);
  const invalidClient = await signIn(status.API_URL, status.ANON_KEY, fixtures.invalid);
  const blockedClient = await signIn(status.API_URL, status.ANON_KEY, fixtures.blocked);
  const invitedClient = await signIn(status.API_URL, status.ANON_KEY, fixtures.invited);
  const missingClient = await signIn(status.API_URL, status.ANON_KEY, fixtures.missing);
  const memberClient = await signIn(status.API_URL, status.ANON_KEY, fixtures.member);
  const rollbackClient = await signIn(status.API_URL, status.ANON_KEY, fixtures.rollback);
  const auditRollbackClient = await signIn(status.API_URL, status.ANON_KEY, fixtures.auditRollback);
  const raceClient = await signIn(status.API_URL, status.ANON_KEY, fixtures.race);

  runFixtureSql(databaseContainer, `
    WITH created_org AS (
      INSERT INTO organizations (name, short_name, size, owner_id)
      VALUES ('STAB-01 Existing ${suffix}', 'Existing', 'small', '${fixtures.member.id}'::uuid)
      RETURNING id
    )
    UPDATE profiles
    SET organization_id = created_org.id, role = 'owner'
    FROM created_org
    WHERE profiles.id = '${fixtures.member.id}'::uuid;

    INSERT INTO trust_factor_config (organization_id)
    SELECT organization_id FROM profiles WHERE id = '${fixtures.member.id}'::uuid;

    UPDATE profiles SET status = 'blocked'
    WHERE id = '${fixtures.blocked.id}'::uuid;
    UPDATE profiles SET status = 'invited'
    WHERE id = '${fixtures.invited.id}'::uuid;
    DELETE FROM profiles WHERE id = '${fixtures.missing.id}'::uuid;
  `);

  const actionSource = readFileSync(path.resolve('lib/actions/organizations.ts'), 'utf8');
  assert.match(actionSource, /createClient/);
  assert.match(actionSource, /\.rpc\(\s*['"]create_organization_atomic['"]/);
  assert.doesNotMatch(actionSource, /createAdminClient/);
  assert.doesNotMatch(actionSource, /error\.message/);

  const created = await successClient.rpc(
    'create_organization_atomic',
    organizationPayload(`STAB-01 Success ${suffix}`),
  );
  assert.ifError(created.error);
  assert.match(created.data, /^[0-9a-f-]{36}$/i);

  const { data: organization, error: organizationError } = await admin
    .from('organizations')
    .select('id, name, short_name, industry, size, inn, region, owner_id')
    .eq('id', created.data)
    .single();
  assert.ifError(organizationError);
  assert.equal(organization.owner_id, fixtures.success.id);
  assert.equal(organization.name, `STAB-01 Success ${suffix}`);

  const { data: successProfile, error: successProfileError } = await admin
    .from('profiles')
    .select('organization_id, role, status')
    .eq('id', fixtures.success.id)
    .single();
  assert.ifError(successProfileError);
  assert.deepEqual(successProfile, {
    organization_id: created.data,
    role: 'owner',
    status: 'active',
  });

  const { count: configCount, error: configError } = await admin
    .from('trust_factor_config')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', created.data);
  assert.ifError(configError);
  assert.equal(configCount, 1);

  const { count: auditCount, error: auditError } = await admin
    .from('security_events')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', created.data)
    .eq('actor_id', fixtures.success.id)
    .eq('event_type', 'org.created');
  assert.ifError(auditError);
  assert.equal(auditCount, 1);

  const repeated = await successClient.rpc(
    'create_organization_atomic',
    organizationPayload(`STAB-01 Repeated ${suffix}`),
  );
  assert.ok(repeated.error);

  const directInsert = await successClient.from('organizations').insert({
    name: `STAB-01 Direct ${suffix}`,
    short_name: 'Direct',
    size: 'small',
    owner_id: fixtures.success.id,
  });
  assert.ok(directInsert.error, 'direct organization insert must be denied');

  const invalid = await invalidClient.rpc('create_organization_atomic', {
    ...organizationPayload(`STAB-01 Invalid ${suffix}`),
    p_name: '\t\n',
    p_short_name: '\n\t',
  });
  assert.ok(invalid.error);

  const memberAttempt = await memberClient.rpc(
    'create_organization_atomic',
    organizationPayload(`STAB-01 Member ${suffix}`),
  );
  assert.ok(memberAttempt.error);

  const blockedAttempt = await blockedClient.rpc(
    'create_organization_atomic',
    organizationPayload(`STAB-01 Blocked ${suffix}`),
  );
  assert.ok(blockedAttempt.error);

  const invitedAttempt = await invitedClient.rpc(
    'create_organization_atomic',
    organizationPayload(`STAB-01 Invited ${suffix}`),
  );
  assert.ok(invitedAttempt.error);

  const missingAttempt = await missingClient.rpc(
    'create_organization_atomic',
    organizationPayload(`STAB-01 Missing ${suffix}`),
  );
  assert.ok(missingAttempt.error);

  const anonymousAttempt = await anon.rpc(
    'create_organization_atomic',
    organizationPayload(`STAB-01 Anonymous ${suffix}`),
  );
  assert.ok(anonymousAttempt.error);

  const serviceRoleAttempt = await admin.rpc(
    'create_organization_atomic',
    organizationPayload(`STAB-01 Service Role ${suffix}`),
  );
  assert.ok(serviceRoleAttempt.error);

  runFixtureSql(databaseContainer, `
    CREATE OR REPLACE FUNCTION public.${configFailureFunction}()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM organizations
        WHERE id = NEW.organization_id
          AND name LIKE 'STAB-01 Rollback%'
      ) THEN
        RAISE EXCEPTION 'stab01_forced_config_failure';
      END IF;
      RETURN NEW;
    END;
    $$;
    CREATE TRIGGER ${configFailureTrigger}
      BEFORE INSERT ON public.trust_factor_config
      FOR EACH ROW EXECUTE FUNCTION public.${configFailureFunction}();
  `);

  const rollbackAttempt = await rollbackClient.rpc(
    'create_organization_atomic',
    organizationPayload(`STAB-01 Rollback ${suffix}`),
  );
  assert.ok(rollbackAttempt.error);

  const { data: rollbackProfile, error: rollbackProfileError } = await admin
    .from('profiles')
    .select('organization_id, role, status')
    .eq('id', fixtures.rollback.id)
    .single();
  assert.ifError(rollbackProfileError);
  assert.deepEqual(rollbackProfile, {
    organization_id: null,
    role: 'viewer',
    status: 'active',
  });

  const { count: rollbackOrgCount, error: rollbackOrgError } = await admin
    .from('organizations')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', fixtures.rollback.id);
  assert.ifError(rollbackOrgError);
  assert.equal(rollbackOrgCount, 0);

  runFixtureSql(databaseContainer, `
    DROP TRIGGER ${configFailureTrigger} ON public.trust_factor_config;
    DROP FUNCTION public.${configFailureFunction}();
  `);

  runFixtureSql(databaseContainer, `
    CREATE OR REPLACE FUNCTION public.${auditFailureFunction}()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      IF NEW.actor_id = '${fixtures.auditRollback.id}'::uuid
         AND NEW.event_type = 'org.created' THEN
        RAISE EXCEPTION 'stab01_forced_audit_failure';
      END IF;
      RETURN NEW;
    END;
    $$;
    CREATE TRIGGER ${auditFailureTrigger}
      BEFORE INSERT ON public.security_events
      FOR EACH ROW EXECUTE FUNCTION public.${auditFailureFunction}();
  `);

  const auditRollbackAttempt = await auditRollbackClient.rpc(
    'create_organization_atomic',
    organizationPayload(`STAB-01 Audit Rollback ${suffix}`),
  );
  assert.ok(auditRollbackAttempt.error);

  const { data: auditRollbackProfile, error: auditRollbackProfileError } = await admin
    .from('profiles')
    .select('organization_id, role, status')
    .eq('id', fixtures.auditRollback.id)
    .single();
  assert.ifError(auditRollbackProfileError);
  assert.deepEqual(auditRollbackProfile, {
    organization_id: null,
    role: 'viewer',
    status: 'active',
  });

  const { count: auditRollbackOrgCount, error: auditRollbackOrgError } = await admin
    .from('organizations')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', fixtures.auditRollback.id);
  assert.ifError(auditRollbackOrgError);
  assert.equal(auditRollbackOrgCount, 0);

  const { count: auditRollbackEventCount, error: auditRollbackEventError } = await admin
    .from('security_events')
    .select('id', { count: 'exact', head: true })
    .eq('actor_id', fixtures.auditRollback.id)
    .eq('event_type', 'org.created');
  assert.ifError(auditRollbackEventError);
  assert.equal(auditRollbackEventCount, 0);

  runFixtureSql(databaseContainer, `
    DROP TRIGGER ${auditFailureTrigger} ON public.security_events;
    DROP FUNCTION public.${auditFailureFunction}();
  `);

  const racePayloadA = organizationPayload(`STAB-01 Race A ${suffix}`);
  const racePayloadB = organizationPayload(`STAB-01 Race B ${suffix}`);
  const raceResults = await Promise.all([
    raceClient.rpc('create_organization_atomic', racePayloadA),
    raceClient.rpc('create_organization_atomic', racePayloadB),
  ]);
  assert.equal(raceResults.filter((result) => !result.error).length, 1);
  assert.equal(raceResults.filter((result) => result.error).length, 1);

  const { count: raceOrgCount, error: raceOrgError } = await admin
    .from('organizations')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', fixtures.race.id);
  assert.ifError(raceOrgError);
  assert.equal(raceOrgCount, 1);

  for (const fixture of [
    fixtures.invalid,
    fixtures.blocked,
    fixtures.invited,
    fixtures.auditRollback,
    fixtures.rollback,
  ]) {
    const { data, error } = await admin
      .from('profiles')
      .select('organization_id')
      .eq('id', fixture.id)
      .single();
    assert.ifError(error);
    assert.equal(data.organization_id, null);
  }
});
