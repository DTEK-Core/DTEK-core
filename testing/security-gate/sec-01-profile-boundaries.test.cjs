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
  const email = `sec01-${name}-${suffix}@example.test`;
  const password = `Sec01-${suffix}-Pass!`;
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

function readProfile(container, userId) {
  const output = runFixtureSql(container, `
    SELECT row_to_json(profile_row)::text
    FROM (
      SELECT id, organization_id, full_name, team, role, status
      FROM profiles
      WHERE id = '${userId}'::uuid
    ) AS profile_row;
  `).trim();
  assert.ok(output, `profile ${userId} was not found`);
  return JSON.parse(output);
}

function assertDenied(error, label) {
  assert.ok(error, `${label}: expected an authorization error`);
}

test('SEC-01 enforces profile and tenant privilege boundaries', async (t) => {
  const status = getLocalSupabaseStatus();
  const admin = createTestClient(status.API_URL, status.SERVICE_ROLE_KEY);
  const databaseContainer = getLocalDatabaseContainer();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const fixtures = {};
  const organizationIds = [randomUUID(), randomUUID()];

  t.after(async () => {
    const userIds = Object.values(fixtures).map((fixture) => fixture.id);
    if (userIds.length > 0) {
      runFixtureSql(databaseContainer, `
        DELETE FROM security_events
        WHERE organization_id IN ('${organizationIds[0]}'::uuid, '${organizationIds[1]}'::uuid);
        UPDATE profiles
        SET organization_id = NULL, role = 'viewer', status = 'active'
        WHERE id IN (${userIds.map((id) => `'${id}'::uuid`).join(', ')});
        DELETE FROM organizations
        WHERE id IN ('${organizationIds[0]}'::uuid, '${organizationIds[1]}'::uuid);
      `);
    }
    for (const userId of userIds) await admin.auth.admin.deleteUser(userId);
  });

  fixtures.ownerA = await createFixtureUser(admin, suffix, 'owner-a');
  fixtures.adminA = await createFixtureUser(admin, suffix, 'admin-a');
  fixtures.viewerA = await createFixtureUser(admin, suffix, 'viewer-a');
  fixtures.blockedA = await createFixtureUser(admin, suffix, 'blocked-a');
  fixtures.ownerB = await createFixtureUser(admin, suffix, 'owner-b');
  fixtures.viewerB = await createFixtureUser(admin, suffix, 'viewer-b');

  const [orgAId, orgBId] = organizationIds;

  const assignments = [
    [fixtures.ownerA.id, orgAId, 'owner', 'active'],
    [fixtures.adminA.id, orgAId, 'admin', 'active'],
    [fixtures.viewerA.id, orgAId, 'viewer', 'active'],
    [fixtures.blockedA.id, orgAId, 'viewer', 'blocked'],
    [fixtures.ownerB.id, orgBId, 'owner', 'active'],
    [fixtures.viewerB.id, orgBId, 'viewer', 'active'],
  ];
  runFixtureSql(databaseContainer, `
    BEGIN;
    INSERT INTO organizations (id, name, owner_id)
    VALUES
      ('${orgAId}'::uuid, 'SEC-01 A ${suffix}', '${fixtures.ownerA.id}'::uuid),
      ('${orgBId}'::uuid, 'SEC-01 B ${suffix}', '${fixtures.ownerB.id}'::uuid);
    ${assignments.map(([id, organizationId, role, profileStatus]) => `
      UPDATE profiles
      SET organization_id = '${organizationId}'::uuid,
          role = '${role}',
          status = '${profileStatus}'
      WHERE id = '${id}'::uuid;
    `).join('')}
    COMMIT;
  `);

  const ownerA = await signIn(status.API_URL, status.ANON_KEY, fixtures.ownerA);
  const adminA = await signIn(status.API_URL, status.ANON_KEY, fixtures.adminA);
  const viewerA = await signIn(status.API_URL, status.ANON_KEY, fixtures.viewerA);
  const blockedA = await signIn(status.API_URL, status.ANON_KEY, fixtures.blockedA);

  const directSelfEscalation = await viewerA
    .from('profiles')
    .update({ role: 'owner', status: 'active', organization_id: orgBId })
    .eq('id', fixtures.viewerA.id);
  assertDenied(directSelfEscalation.error, 'direct self escalation');
  assert.equal(readProfile(databaseContainer, fixtures.viewerA.id).role, 'viewer');
  assert.equal(readProfile(databaseContainer, fixtures.viewerA.id).organization_id, orgAId);

  const directOwnerMutation = await ownerA
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', fixtures.viewerA.id);
  assertDenied(directOwnerMutation.error, 'direct owner mutation');

  const selfUpdate = await viewerA.rpc('update_own_profile', {
    p_full_name: 'Viewer A Updated',
    p_team: 'Security',
  });
  assert.ifError(selfUpdate.error);
  const updatedViewer = readProfile(databaseContainer, fixtures.viewerA.id);
  assert.equal(updatedViewer.full_name, 'Viewer A Updated');
  assert.equal(updatedViewer.team, 'Security');
  assert.equal(updatedViewer.role, 'viewer');
  assert.equal(updatedViewer.organization_id, orgAId);

  const blockedSelfUpdate = await blockedA.rpc('update_own_profile', {
    p_full_name: 'Blocked Update',
    p_team: null,
  });
  assertDenied(blockedSelfUpdate.error, 'blocked self update');

  const viewerRoleChange = await viewerA.rpc('change_organization_member_role', {
    p_target_user_id: fixtures.adminA.id,
    p_role: 'viewer',
  });
  assertDenied(viewerRoleChange.error, 'viewer role management');

  const selfRoleChange = await ownerA.rpc('change_organization_member_role', {
    p_target_user_id: fixtures.ownerA.id,
    p_role: 'admin',
  });
  assertDenied(selfRoleChange.error, 'owner self role change');

  const ownerAssignment = await ownerA.rpc('change_organization_member_role', {
    p_target_user_id: fixtures.viewerA.id,
    p_role: 'owner',
  });
  assertDenied(ownerAssignment.error, 'owner assignment');

  const crossTenantChange = await ownerA.rpc('change_organization_member_role', {
    p_target_user_id: fixtures.viewerB.id,
    p_role: 'analyst',
  });
  assertDenied(crossTenantChange.error, 'cross-tenant role change');

  const allowedRoleChange = await ownerA.rpc('change_organization_member_role', {
    p_target_user_id: fixtures.viewerA.id,
    p_role: 'analyst',
  });
  assert.ifError(allowedRoleChange.error);
  assert.equal(readProfile(databaseContainer, fixtures.viewerA.id).role, 'analyst');

  const blockMember = await adminA.rpc('set_organization_member_status', {
    p_target_user_id: fixtures.viewerA.id,
    p_status: 'blocked',
  });
  assert.ifError(blockMember.error);
  assert.equal(readProfile(databaseContainer, fixtures.viewerA.id).status, 'blocked');

  const unblockMember = await ownerA.rpc('set_organization_member_status', {
    p_target_user_id: fixtures.viewerA.id,
    p_status: 'active',
  });
  assert.ifError(unblockMember.error);
  assert.equal(readProfile(databaseContainer, fixtures.viewerA.id).status, 'active');

  const removeMember = await ownerA.rpc('remove_organization_member', {
    p_target_user_id: fixtures.viewerA.id,
  });
  assert.ifError(removeMember.error);
  const removedViewer = readProfile(databaseContainer, fixtures.viewerA.id);
  assert.equal(removedViewer.organization_id, null);
  assert.equal(removedViewer.role, 'viewer');
  assert.equal(removedViewer.status, 'active');

  const events = runFixtureSql(databaseContainer, `
    SELECT event_type
    FROM security_events
    WHERE organization_id = '${orgAId}'::uuid
      AND event_type IN ('role.changed', 'user.blocked', 'user.unblocked', 'user.removed');
  `).trim().split('\n').filter(Boolean);
  assert.deepEqual(
    new Set(events),
    new Set(['role.changed', 'user.blocked', 'user.unblocked', 'user.removed']),
  );
});
