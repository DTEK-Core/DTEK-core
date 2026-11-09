const assert = require('node:assert/strict');
const { execFileSync, spawn } = require('node:child_process');
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

function runFixtureSqlAsync(container, sql) {
  return new Promise((resolve) => {
    const child = spawn(
      'docker',
      ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-At'],
      { stdio: ['pipe', 'pipe', 'pipe'] },
    );
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('close', (code) => resolve({ code, stdout, stderr }));
    child.stdin.end(sql);
  });
}

function startFixtureSqlSession(container) {
  const child = spawn(
    'docker',
    ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-At'],
    { stdio: ['pipe', 'pipe', 'pipe'] },
  );
  let stdout = '';
  let stderr = '';
  let exited = false;
  const waiters = [];
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    stdout += chunk;
    for (const waiter of waiters.splice(0)) waiter();
  });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  const result = new Promise((resolve) => {
    child.on('close', (code) => {
      exited = true;
      for (const waiter of waiters.splice(0)) waiter();
      resolve({ code, stdout, stderr });
    });
  });
  return {
    write(sql) {
      child.stdin.write(sql);
    },
    end(sql = '') {
      child.stdin.end(sql);
    },
    isExited() {
      return exited;
    },
    async waitForOutput(marker, timeoutMs = 5000) {
      const deadline = Date.now() + timeoutMs;
      while (!stdout.includes(marker) && !exited && Date.now() < deadline) {
        await new Promise((resolve) => {
          const timeout = setTimeout(resolve, Math.min(100, deadline - Date.now()));
          waiters.push(() => {
            clearTimeout(timeout);
            resolve();
          });
        });
      }
      assert.match(stdout, new RegExp(marker), stderr || `Missing marker: ${marker}`);
    },
    result,
  };
}

function hasTablePrivilege(container, role, table, privilege) {
  return runFixtureSql(
    container,
    `SELECT has_table_privilege('${role}', 'public.${table}', '${privilege}');`,
  ).trim() === 't';
}

async function createFixtureUser(admin, suffix, name) {
  const email = `sec04-${name}-${suffix}@example.test`;
  const password = `Sec04-${suffix}-Pass!`;
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

test('SEC-04 enforces one tenant across Trust Graph relation endpoints', async (t) => {
  const status = getLocalSupabaseStatus();
  const admin = createTestClient(status.API_URL, status.SERVICE_ROLE_KEY);
  const databaseContainer = getLocalDatabaseContainer();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const orgA = randomUUID();
  const orgB = randomUUID();
  const objectA1 = randomUUID();
  const objectA2 = randomUUID();
  const objectA3 = randomUUID();
  const objectB1 = randomUUID();
  const objectB2 = randomUUID();
  const fixtures = {};
  const originalPrivileges = {
    relationsSelect: hasTablePrivilege(databaseContainer, 'authenticated', 'relations', 'SELECT'),
    relationsInsert: hasTablePrivilege(databaseContainer, 'authenticated', 'relations', 'INSERT'),
    relationsDelete: hasTablePrivilege(databaseContainer, 'authenticated', 'relations', 'DELETE'),
    objectsSelect: hasTablePrivilege(databaseContainer, 'authenticated', 'objects', 'SELECT'),
  };

  t.after(async () => {
    const userIds = Object.values(fixtures).map((fixture) => fixture.id);
    const userIdList = userIds.length > 0
      ? userIds.map((id) => `'${id}'::uuid`).join(', ')
      : 'NULL';
    let cleanupError = null;
    try {
      runFixtureSql(databaseContainer, `
        DELETE FROM relations
        WHERE organization_id IN ('${orgA}'::uuid, '${orgB}'::uuid)
           OR source_object_id IN ('${objectA1}'::uuid, '${objectA2}'::uuid, '${objectA3}'::uuid, '${objectB1}'::uuid, '${objectB2}'::uuid)
           OR target_object_id IN ('${objectA1}'::uuid, '${objectA2}'::uuid, '${objectA3}'::uuid, '${objectB1}'::uuid, '${objectB2}'::uuid);
        DELETE FROM objects WHERE organization_id IN ('${orgA}'::uuid, '${orgB}'::uuid);
        UPDATE profiles
        SET organization_id = NULL, role = 'viewer', status = 'active'
        WHERE id IN (${userIdList});
        DELETE FROM organizations WHERE id IN ('${orgA}'::uuid, '${orgB}'::uuid);
      `);
    } catch (error) {
      cleanupError = error;
    }
    try {
      runFixtureSql(databaseContainer, `
        ${originalPrivileges.relationsSelect ? 'GRANT' : 'REVOKE'} SELECT ON relations TO authenticated;
        ${originalPrivileges.relationsInsert ? 'GRANT' : 'REVOKE'} INSERT ON relations TO authenticated;
        ${originalPrivileges.relationsDelete ? 'GRANT' : 'REVOKE'} DELETE ON relations TO authenticated;
        ${originalPrivileges.objectsSelect ? 'GRANT' : 'REVOKE'} SELECT ON objects TO authenticated;
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
    GRANT SELECT, INSERT, DELETE ON relations TO authenticated;
    GRANT SELECT ON objects TO authenticated;
  `);

  fixtures.ownerA = await createFixtureUser(admin, suffix, 'owner-a');
  fixtures.analystA = await createFixtureUser(admin, suffix, 'analyst-a');
  fixtures.viewerA = await createFixtureUser(admin, suffix, 'viewer-a');
  fixtures.blockedA = await createFixtureUser(admin, suffix, 'blocked-a');
  fixtures.ownerB = await createFixtureUser(admin, suffix, 'owner-b');

  runFixtureSql(databaseContainer, `
    BEGIN;
    INSERT INTO organizations (id, name, owner_id) VALUES
      ('${orgA}'::uuid, 'SEC-04 A ${suffix}', '${fixtures.ownerA.id}'::uuid),
      ('${orgB}'::uuid, 'SEC-04 B ${suffix}', '${fixtures.ownerB.id}'::uuid);
    UPDATE profiles SET organization_id = '${orgA}'::uuid, role = 'owner', status = 'active'
      WHERE id = '${fixtures.ownerA.id}'::uuid;
    UPDATE profiles SET organization_id = '${orgA}'::uuid, role = 'analyst', status = 'active'
      WHERE id = '${fixtures.analystA.id}'::uuid;
    UPDATE profiles SET organization_id = '${orgA}'::uuid, role = 'viewer', status = 'active'
      WHERE id = '${fixtures.viewerA.id}'::uuid;
    UPDATE profiles SET organization_id = '${orgA}'::uuid, role = 'viewer', status = 'blocked'
      WHERE id = '${fixtures.blockedA.id}'::uuid;
    UPDATE profiles SET organization_id = '${orgB}'::uuid, role = 'owner', status = 'active'
      WHERE id = '${fixtures.ownerB.id}'::uuid;
    INSERT INTO objects (id, organization_id, name, type) VALUES
      ('${objectA1}'::uuid, '${orgA}'::uuid, 'SEC-04 Object A1', 'server'),
      ('${objectA2}'::uuid, '${orgA}'::uuid, 'SEC-04 Object A2', 'server'),
      ('${objectA3}'::uuid, '${orgA}'::uuid, 'SEC-04 Object A3', 'server'),
      ('${objectB1}'::uuid, '${orgB}'::uuid, 'SEC-04 Object B1', 'server'),
      ('${objectB2}'::uuid, '${orgB}'::uuid, 'SEC-04 Object B2', 'server');
    COMMIT;
  `);

  const ownerA = await signIn(status.API_URL, status.ANON_KEY, fixtures.ownerA);
  const analystA = await signIn(status.API_URL, status.ANON_KEY, fixtures.analystA);
  const viewerA = await signIn(status.API_URL, status.ANON_KEY, fixtures.viewerA);
  const blockedA = await signIn(status.API_URL, status.ANON_KEY, fixtures.blockedA);
  const ownerB = await signIn(status.API_URL, status.ANON_KEY, fixtures.ownerB);

  const sameTenant = await ownerA
    .from('relations')
    .insert({
      organization_id: orgA,
      source_object_id: objectA1,
      target_object_id: objectA2,
      relation_type: 'depends_on',
      created_by: fixtures.ownerA.id,
    })
    .select('id')
    .single();
  assert.ifError(sameTenant.error);
  assert.ok(sameTenant.data?.id);

  const duplicateRelation = await ownerA.from('relations').insert({
    organization_id: orgA,
    source_object_id: objectA1,
    target_object_id: objectA2,
    relation_type: 'depends_on',
    created_by: fixtures.ownerA.id,
  });
  assert.equal(duplicateRelation.error?.code, '23505');

  const selfRelation = await ownerA.from('relations').insert({
    organization_id: orgA,
    source_object_id: objectA1,
    target_object_id: objectA1,
    relation_type: 'uses',
    created_by: fixtures.ownerA.id,
  });
  assert.equal(selfRelation.error?.code, '23514');

  const analystRelation = await analystA
    .from('relations')
    .insert({
      organization_id: orgA,
      source_object_id: objectA2,
      target_object_id: objectA3,
      relation_type: 'uses',
      created_by: fixtures.analystA.id,
    })
    .select('id')
    .single();
  assert.ifError(analystRelation.error);

  const crossTenant = await ownerA.from('relations').insert({
    organization_id: orgA,
    source_object_id: objectA3,
    target_object_id: objectB1,
    relation_type: 'connected_to',
    created_by: fixtures.ownerA.id,
  });
  assert.ok(crossTenant.error, 'relation endpoints must not cross tenant boundaries');

  const viewerInsert = await viewerA.from('relations').insert({
    organization_id: orgA,
    source_object_id: objectA1,
    target_object_id: objectA3,
    relation_type: 'uses',
    created_by: fixtures.viewerA.id,
  });
  assert.ok(viewerInsert.error, 'viewer must not create graph relations');

  const blockedInsert = await blockedA.from('relations').insert({
    organization_id: orgA,
    source_object_id: objectA1,
    target_object_id: objectA3,
    relation_type: 'connected_to',
    created_by: fixtures.blockedA.id,
  });
  assert.ok(blockedInsert.error, 'blocked membership must not create graph relations');

  assert.throws(
    () => runFixtureSql(databaseContainer, `
      INSERT INTO relations (
        organization_id, source_object_id, target_object_id, relation_type, created_by
      ) VALUES (
        '${orgA}'::uuid, '${objectA3}'::uuid, '${objectB2}'::uuid,
        'managed_by', '${fixtures.ownerA.id}'::uuid
      );
    `),
    /relations_target_tenant_fkey/,
    'service-level writes must preserve target tenant identity',
  );

  assert.throws(
    () => runFixtureSql(databaseContainer, `
      UPDATE relations
      SET target_object_id = '${objectB2}'::uuid
      WHERE id = '${sameTenant.data.id}'::uuid;
    `),
    /relations_target_tenant_fkey/,
    'service-level updates must preserve endpoint tenant identity',
  );

  assert.throws(
    () => runFixtureSql(databaseContainer, `
      UPDATE objects
      SET organization_id = '${orgB}'::uuid
      WHERE id = '${objectA1}'::uuid;
    `),
    /relations_source_tenant_fkey/,
    'moving a linked endpoint must preserve graph tenant identity',
  );

  const compositeConstraints = runFixtureSql(databaseContainer, `
    SELECT count(*)
    FROM pg_constraint
    WHERE conname IN ('relations_source_tenant_fkey', 'relations_target_tenant_fkey')
      AND contype = 'f'
      AND convalidated;
  `).trim();
  assert.equal(compositeConstraints, '2');

  const raceInsert = startFixtureSqlSession(databaseContainer);
  raceInsert.write(`
    BEGIN;
    INSERT INTO relations (
      organization_id, source_object_id, target_object_id, relation_type, created_by
    ) VALUES (
      '${orgA}'::uuid, '${objectA3}'::uuid, '${objectA1}'::uuid,
      'interacts_with', '${fixtures.ownerA.id}'::uuid
    );
    SELECT 'SEC04_INSERT_READY';
  `);
  await raceInsert.waitForOutput('SEC04_INSERT_READY');
  const raceMove = runFixtureSqlAsync(databaseContainer, `
    SET lock_timeout = '5s';
    UPDATE objects
    SET organization_id = '${orgB}'::uuid
    WHERE id = '${objectA3}'::uuid;
  `);
  await new Promise((resolve) => setTimeout(resolve, 250));
  assert.equal(raceInsert.isExited(), false, 'insert transaction must remain open');
  let raceMoveSettled = false;
  raceMove.then(() => { raceMoveSettled = true; });
  await new Promise((resolve) => setTimeout(resolve, 250));
  assert.equal(raceMoveSettled, false, 'parent update must wait for the relation transaction');
  raceInsert.end('COMMIT;\n');
  const [raceInsertResult, raceMoveResult] = await Promise.all([raceInsert.result, raceMove]);
  assert.equal(raceInsertResult.code, 0, raceInsertResult.stderr);
  assert.notEqual(raceMoveResult.code, 0);
  assert.match(raceMoveResult.stderr, /relations_source_tenant_fkey/);

  const blockedRead = await blockedA.from('relations').select('id').eq('id', sameTenant.data.id);
  assert.ifError(blockedRead.error);
  assert.equal(blockedRead.data.length, 0);

  const blockedDelete = await blockedA
    .from('relations')
    .delete()
    .eq('id', sameTenant.data.id)
    .select('id');
  assert.ifError(blockedDelete.error);
  assert.equal(blockedDelete.data.length, 0);

  const viewerDelete = await viewerA
    .from('relations')
    .delete()
    .eq('id', sameTenant.data.id)
    .select('id');
  assert.ifError(viewerDelete.error);
  assert.equal(viewerDelete.data.length, 0);

  const foreignRead = await ownerB.from('relations').select('id').eq('id', sameTenant.data.id);
  assert.ifError(foreignRead.error);
  assert.equal(foreignRead.data.length, 0);

  const foreignDelete = await ownerB
    .from('relations')
    .delete()
    .eq('id', sameTenant.data.id)
    .select('id');
  assert.ifError(foreignDelete.error);
  assert.equal(foreignDelete.data.length, 0);

  const analystDelete = await analystA
    .from('relations')
    .delete()
    .eq('id', analystRelation.data.id)
    .select('id');
  assert.ifError(analystDelete.error);
  assert.equal(analystDelete.data.length, 1);

  const ownDelete = await ownerA
    .from('relations')
    .delete()
    .eq('id', sameTenant.data.id)
    .select('id');
  assert.ifError(ownDelete.error);
  assert.equal(ownDelete.data.length, 1);
});
