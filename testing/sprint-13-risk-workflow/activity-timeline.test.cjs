const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

function loadActivityModule() {
  const modulePath = path.resolve(__dirname, '../../lib/utils/risk-activity.ts');
  const source = fs.readFileSync(modulePath, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: modulePath,
  });
  const loadedModule = { exports: {} };
  Function('module', 'exports', 'require', outputText)(loadedModule, loadedModule.exports, require);
  return loadedModule.exports;
}

const {
  buildRiskActivityCopy,
  buildRiskWorkflowAuditEvent,
  isRiskActivityEventType,
} = loadActivityModule();

test('activity allowlist rejects unknown database events', () => {
  assert.equal(isRiskActivityEventType('comment_added'), true);
  assert.equal(isRiskActivityEventType('internal_debug_event'), false);
});

test('owner assignment copy uses safe display names without IDs', () => {
  assert.deepEqual(
    buildRiskActivityCopy('owner_assigned', {
      previous_owner_name: 'Иван Петров',
      owner_name: 'Анна Волкова',
      owner_id: 'must-not-be-rendered',
    }),
    {
      title: 'Ответственный назначен',
      detail: 'Иван Петров → Анна Волкова',
    },
  );
});

test('due date copy includes deadline and SLA changes', () => {
  const copy = buildRiskActivityCopy('due_date_changed', {
    previous_due_date: '2026-08-12T23:59:59.999Z',
    due_date: '2026-08-19T23:59:59.999Z',
    previous_sla_days: 7,
    sla_days: 14,
  });

  assert.equal(copy.title, 'Срок устранения изменён');
  assert.match(copy.detail, /12\.08\.2026 → 19\.08\.2026/);
  assert.match(copy.detail, /SLA: 7 → 14 дн\./);
});

test('status and comment events produce concise Russian copy', () => {
  assert.deepEqual(
    buildRiskActivityCopy('status_changed', {
      previous_status: 'open',
      status: 'in_progress',
    }),
    { title: 'Статус изменён', detail: 'Открыт → В работе' },
  );
  assert.deepEqual(
    buildRiskActivityCopy('comment_added', {}),
    { title: 'Добавлен комментарий', detail: null },
  );
});

test('malformed metadata falls back without exposing raw values', () => {
  assert.deepEqual(
    buildRiskActivityCopy('owner_assigned', { owner_name: { id: 'secret' } }),
    {
      title: 'Ответственный снят',
      detail: 'Без ответственного → Без ответственного',
    },
  );
});

test('owner workflow audit strips IDs and keeps display context', () => {
  assert.deepEqual(
    buildRiskWorkflowAuditEvent('owner_assigned', {
      previous_owner_name: 'Иван Петров',
      owner_name: 'Анна Волкова',
      owner_id: 'must-not-leak',
      organization_id: 'must-not-leak',
    }),
    {
      eventType: 'risk.owner_changed',
      metadata: {
        previousOwnerName: 'Иван Петров',
        ownerName: 'Анна Волкова',
      },
    },
  );
});

test('due date and status workflow audit use explicit safe fields', () => {
  assert.deepEqual(
    buildRiskWorkflowAuditEvent('due_date_changed', {
      previous_due_date: '2026-08-12T23:59:59.999Z',
      due_date: '2026-08-19T23:59:59.999Z',
      previous_sla_days: 7,
      sla_days: 14,
      description: 'must-not-leak',
    }),
    {
      eventType: 'risk.due_date_changed',
      metadata: {
        previousDueDate: '2026-08-12T23:59:59.999Z',
        dueDate: '2026-08-19T23:59:59.999Z',
        previousSlaDays: 7,
        slaDays: 14,
      },
    },
  );
  assert.deepEqual(
    buildRiskWorkflowAuditEvent('status_changed', {
      previous_status: 'in_progress',
      status: 'closed',
    }),
    {
      eventType: 'risk.status_changed',
      metadata: {
        previousStatus: 'in_progress',
        status: 'closed',
      },
    },
  );
});

test('comments do not create security audit events', () => {
  assert.equal(buildRiskWorkflowAuditEvent('comment_added', { body: 'secret' }), null);
});

test('security events RLS restricts reads to owner and admin', () => {
  const migrationPath = path.resolve(
    __dirname,
    '../../supabase/migrations/019_security_events_privileged_read.sql',
  );
  const migration = fs.readFileSync(migrationPath, 'utf8');

  assert.match(migration, /DROP POLICY IF EXISTS "sec_events_select" ON security_events/);
  assert.match(migration, /TO authenticated/);
  assert.match(migration, /current_user_role\(\) IN \('owner', 'admin'\)/);
});
