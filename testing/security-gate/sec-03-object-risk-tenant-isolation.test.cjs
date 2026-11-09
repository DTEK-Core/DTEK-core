const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { randomUUID } = require('node:crypto');
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
  const output = execFileSync(
    'docker',
    ['ps', '--filter', 'name=supabase_db_', '--format', '{{.Names}}'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  ).trim();
  const [container] = output.split('\n').filter(Boolean);
  if (!container) throw new Error('Local Supabase database container is unavailable');
  return container;
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
  const email = `sec03-${name}-${suffix}@example.test`;
  const password = `Sec03-${suffix}-Pass!`;
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

test('SEC-03 enforces one tenant across object and risk links', async (t) => {
  const status = getLocalSupabaseStatus();
  const admin = createTestClient(status.API_URL, status.SERVICE_ROLE_KEY);
  const databaseContainer = getLocalDatabaseContainer();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const orgA = randomUUID();
  const orgB = randomUUID();
  const objectA1 = randomUUID();
  const objectA2 = randomUUID();
  const objectA3 = randomUUID();
  const riskA1 = randomUUID();
  const riskA2 = randomUUID();
  const riskB1 = randomUUID();
  const riskB2 = randomUUID();
  const fixtures = {};
  const originalPrivileges = {
    linksSelect: hasTablePrivilege(databaseContainer, 'authenticated', 'object_risks', 'SELECT'),
    linksInsert: hasTablePrivilege(databaseContainer, 'authenticated', 'object_risks', 'INSERT'),
    linksDelete: hasTablePrivilege(databaseContainer, 'authenticated', 'object_risks', 'DELETE'),
    objectsSelect: hasTablePrivilege(databaseContainer, 'authenticated', 'objects', 'SELECT'),
    risksSelect: hasTablePrivilege(databaseContainer, 'authenticated', 'risks', 'SELECT'),
  };

  t.after(async () => {
    const userIds = Object.values(fixtures).map((fixture) => fixture.id);
    const userIdList = userIds.length > 0
      ? userIds.map((id) => `'${id}'::uuid`).join(', ')
      : 'NULL';
    runFixtureSql(databaseContainer, `
      DELETE FROM object_risks
      WHERE object_id IN ('${objectA1}'::uuid, '${objectA2}'::uuid, '${objectA3}'::uuid)
         OR risk_id IN ('${riskA1}'::uuid, '${riskA2}'::uuid, '${riskB1}'::uuid, '${riskB2}'::uuid);
      DELETE FROM risks WHERE organization_id IN ('${orgA}'::uuid, '${orgB}'::uuid);
      DELETE FROM objects WHERE organization_id IN ('${orgA}'::uuid, '${orgB}'::uuid);
      UPDATE profiles
      SET organization_id = NULL, role = 'viewer', status = 'active'
      WHERE id IN (${userIdList});
      DELETE FROM organizations WHERE id IN ('${orgA}'::uuid, '${orgB}'::uuid);
    `);
    runFixtureSql(databaseContainer, `
      ${originalPrivileges.linksSelect ? 'GRANT' : 'REVOKE'} SELECT ON object_risks TO authenticated;
      ${originalPrivileges.linksInsert ? 'GRANT' : 'REVOKE'} INSERT ON object_risks TO authenticated;
      ${originalPrivileges.linksDelete ? 'GRANT' : 'REVOKE'} DELETE ON object_risks TO authenticated;
      ${originalPrivileges.objectsSelect ? 'GRANT' : 'REVOKE'} SELECT ON objects TO authenticated;
      ${originalPrivileges.risksSelect ? 'GRANT' : 'REVOKE'} SELECT ON risks TO authenticated;
    `);
    for (const userId of userIds) await admin.auth.admin.deleteUser(userId);
  });

  runFixtureSql(databaseContainer, `
    GRANT SELECT, INSERT, DELETE ON object_risks TO authenticated;
    GRANT SELECT ON objects, risks TO authenticated;
  `);

  fixtures.ownerA = await createFixtureUser(admin, suffix, 'owner-a');
  fixtures.viewerA = await createFixtureUser(admin, suffix, 'viewer-a');
  fixtures.blockedA = await createFixtureUser(admin, suffix, 'blocked-a');
  fixtures.ownerB = await createFixtureUser(admin, suffix, 'owner-b');

  runFixtureSql(databaseContainer, `
    BEGIN;
    INSERT INTO organizations (id, name, owner_id) VALUES
      ('${orgA}'::uuid, 'SEC-03 A ${suffix}', '${fixtures.ownerA.id}'::uuid),
      ('${orgB}'::uuid, 'SEC-03 B ${suffix}', '${fixtures.ownerB.id}'::uuid);
    UPDATE profiles SET organization_id = '${orgA}'::uuid, role = 'owner', status = 'active'
      WHERE id = '${fixtures.ownerA.id}'::uuid;
    UPDATE profiles SET organization_id = '${orgA}'::uuid, role = 'viewer', status = 'active'
      WHERE id = '${fixtures.viewerA.id}'::uuid;
    UPDATE profiles SET organization_id = '${orgA}'::uuid, role = 'viewer', status = 'blocked'
      WHERE id = '${fixtures.blockedA.id}'::uuid;
    UPDATE profiles SET organization_id = '${orgB}'::uuid, role = 'owner', status = 'active'
      WHERE id = '${fixtures.ownerB.id}'::uuid;
    INSERT INTO objects (id, organization_id, name, type) VALUES
      ('${objectA1}'::uuid, '${orgA}'::uuid, 'SEC-03 Object A1', 'server'),
      ('${objectA2}'::uuid, '${orgA}'::uuid, 'SEC-03 Object A2', 'server'),
      ('${objectA3}'::uuid, '${orgA}'::uuid, 'SEC-03 Object A3', 'server');
    INSERT INTO risks (id, organization_id, title, severity) VALUES
      ('${riskA1}'::uuid, '${orgA}'::uuid, 'SEC-03 Risk A1', 'medium'),
      ('${riskA2}'::uuid, '${orgA}'::uuid, 'SEC-03 Risk A2', 'high'),
      ('${riskB1}'::uuid, '${orgB}'::uuid, 'SEC-03 Risk B1', 'medium'),
      ('${riskB2}'::uuid, '${orgB}'::uuid, 'SEC-03 Risk B2', 'high');
    COMMIT;
  `);

  const ownerA = await signIn(status.API_URL, status.ANON_KEY, fixtures.ownerA);
  const viewerA = await signIn(status.API_URL, status.ANON_KEY, fixtures.viewerA);
  const blockedA = await signIn(status.API_URL, status.ANON_KEY, fixtures.blockedA);
  const ownerB = await signIn(status.API_URL, status.ANON_KEY, fixtures.ownerB);

  const sameTenant = await ownerA
    .from('object_risks')
    .insert({ object_id: objectA1, risk_id: riskA1, linked_by: fixtures.ownerA.id })
    .select('id')
    .single();
  assert.ifError(sameTenant.error);
  assert.ok(sameTenant.data?.id);

  const crossTenant = await ownerA
    .from('object_risks')
    .insert({ object_id: objectA2, risk_id: riskB1, linked_by: fixtures.ownerA.id });
  assert.ok(crossTenant.error, 'object A must not link to risk B');

  const viewerInsert = await viewerA
    .from('object_risks')
    .insert({ object_id: objectA2, risk_id: riskA2, linked_by: fixtures.viewerA.id });
  assert.ok(viewerInsert.error, 'viewer must not create object-risk links');

  const blockedInsert = await blockedA
    .from('object_risks')
    .insert({ object_id: objectA2, risk_id: riskA2, linked_by: fixtures.blockedA.id });
  assert.ok(blockedInsert.error, 'blocked membership must not create object-risk links');

  assert.throws(
    () => runFixtureSql(databaseContainer, `
      INSERT INTO object_risks (object_id, risk_id, linked_by)
      VALUES ('${objectA3}'::uuid, '${riskB2}'::uuid, '${fixtures.ownerA.id}'::uuid);
    `),
    /object_risk_tenant_mismatch/,
    'service-level writes must preserve the tenant invariant',
  );

  assert.throws(
    () => runFixtureSql(databaseContainer, `
      UPDATE object_risks
      SET risk_id = '${riskB2}'::uuid
      WHERE id = '${sameTenant.data.id}'::uuid;
    `),
    /object_risk_tenant_mismatch/,
    'service-level updates must preserve the tenant invariant',
  );

  assert.throws(
    () => runFixtureSql(databaseContainer, `
      UPDATE objects
      SET organization_id = '${orgB}'::uuid
      WHERE id = '${objectA1}'::uuid;
    `),
    /object_risks_object_tenant_fkey/,
    'moving a linked object must preserve the tenant invariant',
  );

  assert.throws(
    () => runFixtureSql(databaseContainer, `
      UPDATE risks
      SET organization_id = '${orgB}'::uuid
      WHERE id = '${riskA1}'::uuid;
    `),
    /object_risks_risk_tenant_fkey/,
    'moving a linked risk must preserve the tenant invariant',
  );

  const compositeConstraints = runFixtureSql(databaseContainer, `
    SELECT count(*)
    FROM pg_constraint
    WHERE conname IN ('object_risks_object_tenant_fkey', 'object_risks_risk_tenant_fkey')
      AND contype = 'f'
      AND convalidated;
  `).trim();
  assert.equal(compositeConstraints, '2');

  const blockedRead = await blockedA
    .from('object_risks')
    .select('id')
    .eq('id', sameTenant.data.id);
  assert.ifError(blockedRead.error);
  assert.equal(blockedRead.data.length, 0);

  const blockedDelete = await blockedA
    .from('object_risks')
    .delete()
    .eq('id', sameTenant.data.id)
    .select('id');
  assert.ifError(blockedDelete.error);
  assert.equal(blockedDelete.data.length, 0);

  const foreignRead = await ownerB
    .from('object_risks')
    .select('id')
    .eq('id', sameTenant.data.id);
  assert.ifError(foreignRead.error);
  assert.equal(foreignRead.data.length, 0);

  const foreignDelete = await ownerB
    .from('object_risks')
    .delete()
    .eq('id', sameTenant.data.id)
    .select('id');
  assert.ifError(foreignDelete.error);
  assert.equal(foreignDelete.data.length, 0);

  const ownDelete = await ownerA
    .from('object_risks')
    .delete()
    .eq('id', sameTenant.data.id)
    .select('id');
  assert.ifError(ownDelete.error);
  assert.equal(ownDelete.data.length, 1);
});
