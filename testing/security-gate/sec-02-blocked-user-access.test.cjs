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

async function createFixtureUser(admin, suffix, name) {
  const email = `sec02-${name}-${suffix}@example.test`;
  const password = `Sec02-${suffix}-Pass!`;
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
  const { data, error } = await client.auth.signInWithPassword({
    email: fixture.email,
    password: fixture.password,
  });
  assert.ifError(error);
  assert.ok(data.session);
  return client;
}

function countSessions(container, userId) {
  return Number(runFixtureSql(
    container,
    `SELECT count(*) FROM auth.sessions WHERE user_id = '${userId}'::uuid;`,
  ).trim());
}

function hasTablePrivilege(container, role, table, privilege) {
  return runFixtureSql(
    container,
    `SELECT has_table_privilege('${role}', 'public.${table}', '${privilege}');`,
  ).trim() === 't';
}

test('SEC-02 revokes blocked user access across RLS and Auth sessions', async (t) => {
  const status = getLocalSupabaseStatus();
  const admin = createTestClient(status.API_URL, status.SERVICE_ROLE_KEY);
  const databaseContainer = getLocalDatabaseContainer();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const organizationId = randomUUID();
  const objectId = randomUUID();
  const rogueOrganizationId = randomUUID();
  const fixtures = {};
  const originalPrivileges = {
    profilesSelect: hasTablePrivilege(databaseContainer, 'authenticated', 'profiles', 'SELECT'),
    objectsSelect: hasTablePrivilege(databaseContainer, 'authenticated', 'objects', 'SELECT'),
    organizationsInsert: hasTablePrivilege(databaseContainer, 'authenticated', 'organizations', 'INSERT'),
  };

  t.after(async () => {
    const userIds = Object.values(fixtures).map((fixture) => fixture.id);
    if (userIds.length > 0) {
      runFixtureSql(databaseContainer, `
        DELETE FROM security_events WHERE organization_id = '${organizationId}'::uuid;
        DELETE FROM objects WHERE id = '${objectId}'::uuid;
        UPDATE profiles
        SET organization_id = NULL, role = 'viewer', status = 'active'
        WHERE id IN (${userIds.map((id) => `'${id}'::uuid`).join(', ')});
        DELETE FROM organizations
        WHERE id IN ('${organizationId}'::uuid, '${rogueOrganizationId}'::uuid);
      `);
    }
    for (const userId of userIds) await admin.auth.admin.deleteUser(userId);
    runFixtureSql(databaseContainer, `
      ${originalPrivileges.profilesSelect ? 'GRANT' : 'REVOKE'} SELECT ON profiles TO authenticated;
      ${originalPrivileges.objectsSelect ? 'GRANT' : 'REVOKE'} SELECT ON objects TO authenticated;
      ${originalPrivileges.organizationsInsert ? 'GRANT' : 'REVOKE'} INSERT ON organizations TO authenticated;
    `);
  });

  runFixtureSql(databaseContainer, `
    GRANT SELECT ON profiles, objects TO authenticated;
    GRANT INSERT ON organizations TO authenticated;
  `);

  fixtures.owner = await createFixtureUser(admin, suffix, 'owner');
  fixtures.viewer = await createFixtureUser(admin, suffix, 'viewer');

  runFixtureSql(databaseContainer, `
    BEGIN;
    INSERT INTO organizations (id, name, owner_id)
    VALUES ('${organizationId}'::uuid, 'SEC-02 ${suffix}', '${fixtures.owner.id}'::uuid);
    UPDATE profiles
    SET organization_id = '${organizationId}'::uuid, role = 'owner', status = 'active'
    WHERE id = '${fixtures.owner.id}'::uuid;
    UPDATE profiles
    SET organization_id = '${organizationId}'::uuid, role = 'viewer', status = 'active'
    WHERE id = '${fixtures.viewer.id}'::uuid;
    INSERT INTO objects (id, organization_id, name, type, status)
    VALUES ('${objectId}'::uuid, '${organizationId}'::uuid, 'SEC-02 protected object', 'server', 'active');
    COMMIT;
  `);

  const owner = await signIn(status.API_URL, status.ANON_KEY, fixtures.owner);
  const viewer = await signIn(status.API_URL, status.ANON_KEY, fixtures.viewer);
  const { data: viewerSessionData } = await viewer.auth.getSession();
  const viewerRefreshToken = viewerSessionData.session?.refresh_token;
  assert.ok(viewerRefreshToken);
  assert.ok(countSessions(databaseContainer, fixtures.viewer.id) > 0);

  const beforeBlock = await viewer.from('objects').select('id').eq('id', objectId);
  assert.ifError(beforeBlock.error);
  assert.equal(beforeBlock.data.length, 1);

  const blockResult = await owner.rpc('set_organization_member_status', {
    p_target_user_id: fixtures.viewer.id,
    p_status: 'blocked',
  });
  assert.ifError(blockResult.error);

  assert.throws(
    () => runFixtureSql(databaseContainer, `
      BEGIN;
      GRANT SELECT, UPDATE ON profiles TO service_role;
      SET LOCAL ROLE service_role;
      UPDATE profiles SET status = 'active' WHERE id = '${fixtures.viewer.id}'::uuid;
      COMMIT;
    `),
    /profile_reactivation_denied/,
    'service-role writes must not reactivate a blocked profile',
  );

  const blockedObjects = await viewer.from('objects').select('id').eq('id', objectId);
  assert.ifError(blockedObjects.error);
  assert.equal(blockedObjects.data.length, 0, 'blocked JWT must not read tenant objects');

  const blockedProfiles = await viewer.from('profiles').select('id');
  assert.ifError(blockedProfiles.error);
  assert.equal(blockedProfiles.data.length, 0, 'blocked JWT must not read profiles');

  const blockedOrg = await viewer.rpc('current_org_id');
  assert.ifError(blockedOrg.error);
  assert.equal(blockedOrg.data, null, 'blocked JWT must not resolve a tenant');

  const blockedRole = await viewer.rpc('current_user_role');
  assert.ifError(blockedRole.error);
  assert.equal(blockedRole.data, null, 'blocked JWT must not resolve a role');

  const directOrganizationInsert = await viewer.from('organizations').insert({
    id: rogueOrganizationId,
    name: 'SEC-02 denied organization',
    owner_id: fixtures.viewer.id,
  });
  assert.ok(directOrganizationInsert.error, 'blocked JWT must not create an organization');

  const accessContext = await viewer.rpc('get_current_access_context').maybeSingle();
  assert.ifError(accessContext.error);
  assert.equal(accessContext.data.status, 'blocked');
  assert.equal(accessContext.data.organization_id, null, 'blocked context must not expose tenant identity');
  assert.equal(accessContext.data.role, null, 'blocked context must not expose assigned privileges');

  assert.equal(countSessions(databaseContainer, fixtures.viewer.id), 0, 'blocking must revoke refresh sessions');

  const refreshClient = createTestClient(status.API_URL, status.ANON_KEY);
  const blockedRefresh = await refreshClient.auth.refreshSession({ refresh_token: viewerRefreshToken });
  assert.ok(blockedRefresh.error, 'revoked refresh token must not create a new access token');

  const blockedNewSession = await signIn(status.API_URL, status.ANON_KEY, fixtures.viewer);
  const blockedNewObjects = await blockedNewSession.from('objects').select('id').eq('id', objectId);
  assert.ifError(blockedNewObjects.error);
  assert.equal(blockedNewObjects.data.length, 0, 'new blocked session must not read tenant objects');

  const blockedNewContext = await blockedNewSession.rpc('get_current_access_context').maybeSingle();
  assert.ifError(blockedNewContext.error);
  assert.deepEqual(blockedNewContext.data, {
    organization_id: null,
    role: null,
    status: 'blocked',
  });
  await blockedNewSession.auth.signOut({ scope: 'global' });

  const unblockResult = await owner.rpc('set_organization_member_status', {
    p_target_user_id: fixtures.viewer.id,
    p_status: 'active',
  });
  assert.ifError(unblockResult.error);

  const viewerAfterUnblock = await signIn(status.API_URL, status.ANON_KEY, fixtures.viewer);
  const restoredObjects = await viewerAfterUnblock.from('objects').select('id').eq('id', objectId);
  assert.ifError(restoredObjects.error);
  assert.equal(restoredObjects.data.length, 1);

  const restoredContext = await viewerAfterUnblock.rpc('get_current_access_context').maybeSingle();
  assert.ifError(restoredContext.error);
  assert.equal(restoredContext.data.status, 'active');
  assert.equal(restoredContext.data.role, 'viewer', 'unblock must preserve the assigned role');
});
