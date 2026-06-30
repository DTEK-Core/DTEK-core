'use client';

import { useState, useTransition } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Icon } from '@/components/shared/icon';
import { ChangeRoleDropdown } from '@/components/shared/users/change-role-dropdown';
import { blockUser, unblockUser, removeUser } from '@/lib/actions/users';
import { revokeInvitation } from '@/lib/actions/invitations';

export interface Member {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  team: string | null;
  status: string | null;
  last_seen_at: string | null;
  invitation_id?: string;
}

const ROLE_LABELS: Record<string, string> = {
  owner:   'Владелец',
  admin:   'Администратор',
  analyst: 'Аналитик ИБ',
  viewer:  'Наблюдатель',
};

const ROLE_TONES: Record<string, string> = {
  owner:   'badge soft badge-teal',
  admin:   'badge soft badge-info',
  analyst: 'badge soft badge-neutral',
  viewer:  'badge soft badge-neutral',
};

const STATUS_LABELS: Record<string, string> = {
  active:  'Активен',
  invited: 'Приглашён',
  blocked: 'Заблокирован',
};

const STATUS_DOT_TONES: Record<string, string> = {
  active:  'teal',
  invited: 'amber',
  blocked: 'crit',
};

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Только что';
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  return `${days} дн назад`;
}

interface Props {
  member: Member;
  currentUserId: string;
  currentUserRole: string;
}

export function UserRow({ member, currentUserId, currentUserRole }: Props) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [, startTransition] = useTransition();

  const isInvited = Boolean(member.invitation_id);
  const isSelf = member.id === currentUserId;
  const isOwner = member.role === 'owner';
  const canManage = !isSelf && !isOwner && (currentUserRole === 'owner' || currentUserRole === 'admin');
  const isBlocked = member.status === 'blocked';

  const role = member.role ?? 'analyst';
  const status = member.status ?? 'invited';
  const dotTone = STATUS_DOT_TONES[status] ?? 'neutral';
  const statusLabel = STATUS_LABELS[status] ?? status;

  function handleBlock() {
    startTransition(async () => {
      if (isBlocked) {
        await unblockUser(member.id);
      } else {
        await blockUser(member.id);
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeUser(member.id);
    });
  }

  function handleRevoke() {
    startTransition(async () => {
      await revokeInvitation(member.invitation_id!);
    });
  }

  return (
    <>
      <div className="utable-row">
        {/* Участник */}
        <span className="ut-user">
          <span className="ut-avatar">{isInvited ? '?' : getInitials(member.full_name)}</span>
          <span className="ut-user-info">
            <span className="ut-name" style={isInvited ? { color: 'var(--text-dim)' } : undefined}>
              {member.full_name ?? member.email ?? '—'}
            </span>
            {!isInvited && <span className="ut-email mono">{member.email ?? '—'}</span>}
          </span>
        </span>

        {/* Роль */}
        <span className="ut-cell">
          <span className={ROLE_TONES[role] ?? 'badge soft badge-neutral'}>
            {ROLE_LABELS[role] ?? role}
          </span>
        </span>

        {/* Команда */}
        <span className="ut-cell ot-dim">{member.team ?? '—'}</span>

        {/* Статус */}
        <span className="ut-cell">
          <span className="ut-status">
            <span className={`status-dot status-dot-${dotTone}`} />
            {statusLabel}
          </span>
        </span>

        {/* Активность + actions */}
        <span className="ut-cell ut-c ot-dim mono">
          {relativeTime(member.last_seen_at)}

          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="icon-btn sm" title="Действия" style={{ flexShrink: 0 }}>
                  <Icon name="dots" size={15} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" style={{ minWidth: 200 }}>
                {isInvited ? (
                  <DropdownMenuItem
                    onClick={() => setConfirmRevoke(true)}
                    style={{ color: 'var(--crit)' }}
                  >
                    Отозвать приглашение
                  </DropdownMenuItem>
                ) : (
                  <>
                    <ChangeRoleDropdown userId={member.id} currentRole={role} />
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleBlock}>
                      {isBlocked ? 'Разблокировать' : 'Заблокировать'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setConfirmRemove(true)}
                      style={{ color: 'var(--crit)' }}
                    >
                      Удалить из организации
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </span>
      </div>

      {/* Confirm remove member */}
      <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
            <AlertDialogDescription>
              {member.full_name ?? member.email} потеряет доступ к организации. Действие нельзя
              отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              style={{ background: 'var(--crit)', color: '#fff' }}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm revoke invitation */}
      <AlertDialog open={confirmRevoke} onOpenChange={setConfirmRevoke}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Отозвать приглашение?</AlertDialogTitle>
            <AlertDialogDescription>
              Ссылка для {member.email} станет недействительной.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              style={{ background: 'var(--crit)', color: '#fff' }}
            >
              Отозвать
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
