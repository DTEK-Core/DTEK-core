'use client';

import { useTransition } from 'react';
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { changeUserRole } from '@/lib/actions/users';

const ROLES: { value: 'analyst' | 'admin' | 'viewer'; label: string }[] = [
  { value: 'analyst', label: 'Аналитик ИБ' },
  { value: 'admin',   label: 'Администратор' },
  { value: 'viewer',  label: 'Наблюдатель' },
];

interface Props {
  userId: string;
  currentRole: string;
  onDone?: () => void;
}

export function ChangeRoleDropdown({ userId, currentRole, onDone }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSelect(role: string) {
    startTransition(async () => {
      await changeUserRole(userId, role as 'analyst' | 'admin' | 'viewer');
      onDone?.();
    });
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger disabled={isPending}>
        Сменить роль
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuRadioGroup value={currentRole} onValueChange={handleSelect}>
          {ROLES.map((r) => (
            <DropdownMenuRadioItem key={r.value} value={r.value}>
              {r.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
