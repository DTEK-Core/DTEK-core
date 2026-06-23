'use client';

const EVENT_LABELS: Record<string, string> = {
  'role.changed':           'Изменение роли',
  'user.blocked':           'Блокировка пользователя',
  'user.removed':           'Удаление пользователя',
  'invitation.sent':        'Отправка приглашения',
  'invitation.accepted':    'Принятие приглашения',
  'invitation.cancelled':   'Отмена приглашения',
  'org.updated':            'Обновление данных организации',
  'config.weights_changed': 'Изменение весов Trust Score',
  'object.created':         'Создание объекта',
  'object.deleted':         'Удаление объекта',
  'risk.created':           'Создание риска',
  'risk.deleted':           'Удаление риска',
};

export interface SecurityEventRow {
  id: string;
  event_type: string;
  actor_email: string | null;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatMeta(row: SecurityEventRow): string {
  const m = row.metadata;
  if (!m) return '—';
  if (row.event_type === 'role.changed') {
    return `${m.fromRole ?? '?'} → ${m.toRole ?? '?'}`;
  }
  if (row.event_type === 'invitation.sent' || row.event_type === 'invitation.accepted') {
    return `${m.email ?? ''} (${m.role ?? ''})`;
  }
  if (row.event_type === 'invitation.cancelled') {
    return String(m.email ?? row.target_id ?? '—');
  }
  if (row.event_type === 'user.blocked' || row.event_type === 'user.removed') {
    return String(m.targetEmail ?? row.target_id ?? '—');
  }
  if (row.event_type === 'config.weights_changed') {
    return 'веса обновлены';
  }
  if (row.event_type === 'org.updated') {
    const fields = m.changedFields;
    return Array.isArray(fields) ? fields.join(', ') : '—';
  }
  return '—';
}

interface Props {
  events: SecurityEventRow[];
}

export function SecurityLog({ events }: Props) {
  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">Журнал аудита</span>
        <span className="card-sub">{events.length} событий (последние 100)</span>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        {events.length === 0 ? (
          <p style={{ padding: '24px', color: 'var(--muted)', textAlign: 'center' }}>
            Событий пока нет
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>Дата и время</th>
                  <th style={thStyle}>Событие</th>
                  <th style={thStyle}>Кто</th>
                  <th style={thStyle}>Детали</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={tdStyle}>{formatDate(ev.created_at)}</td>
                    <td style={tdStyle}>{EVENT_LABELS[ev.event_type] ?? ev.event_type}</td>
                    <td style={{ ...tdStyle, color: 'var(--muted)' }}>{ev.actor_email ?? '—'}</td>
                    <td style={{ ...tdStyle, color: 'var(--muted)' }}>{formatMeta(ev)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontWeight: 500,
  color: 'var(--muted)',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 16px',
  verticalAlign: 'top',
};
