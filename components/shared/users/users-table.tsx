'use client';

import { UserRow, type Member } from '@/components/shared/users/user-row';
import { Icon } from '@/components/shared/icon';

interface Props {
  members: Member[];
  currentUserId: string;
  currentUserRole: string;
  onInvite?: () => void;
}

export function UsersTable({ members, currentUserId, currentUserRole, onInvite }: Props) {
  if (members.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          padding: '48px 24px',
          color: 'var(--text-mute)',
        }}
      >
        <Icon name="users" size={36} />
        <p style={{ fontSize: 14 }}>Нет участников. Пригласите коллег в организацию.</p>
        {onInvite && (
          <button className="btn btn-primary" type="button" onClick={onInvite}>
            <Icon name="plus" size={15} />
            Пригласить
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="utable">
      <div className="utable-head">
        <span className="uth">Участник</span>
        <span className="uth">Роль</span>
        <span className="uth">Команда</span>
        <span className="uth">Статус</span>
        <span className="uth uth-c">Активность</span>
      </div>
      {members.map((m) => (
        <UserRow
          key={m.invitation_id ? `inv-${m.invitation_id}` : `usr-${m.id}`}
          member={m}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />
      ))}
    </div>
  );
}
