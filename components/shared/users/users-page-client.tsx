'use client';

import { useState } from 'react';
import { UsersTable } from '@/components/shared/users/users-table';
import { InviteDialog } from '@/components/shared/users/invite-dialog';
import { RolesInfoCard } from '@/components/shared/users/roles-info-card';
import { Icon } from '@/components/shared/icon';
import type { Member } from '@/components/shared/users/user-row';

function memberCountLabel(n: number): string {
  if (n === 1) return '1 участник';
  if (n >= 2 && n <= 4) return `${n} участника`;
  return `${n} участников`;
}

interface Props {
  members: Member[];
  currentUserId: string;
  currentUserRole: string;
}

export function UsersPageClient({ members, currentUserId, currentUserRole }: Props) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const canInvite = currentUserRole === 'owner';

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Пользователи</h1>
          <p className="screen-sub">
            {memberCountLabel(members.length)} · управление доступом и ролями
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          type="button"
          onClick={() => setInviteOpen(true)}
          disabled={!canInvite}
          title={canInvite ? undefined : 'Только владелец может приглашать участников'}
        >
          <Icon name="plus" size={15} />
          Пригласить
        </button>
      </div>

      <RolesInfoCard />

      <div className="users-layout">
        <div className="card span-12 users-table-card">
          <UsersTable
            members={members}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            onInvite={canInvite ? () => setInviteOpen(true) : undefined}
          />
        </div>
      </div>

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
