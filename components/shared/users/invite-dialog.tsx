'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { sendInvitation } from '@/lib/actions/invitations';

const ROLES = [
  { value: 'analyst', label: 'Аналитик ИБ' },
  { value: 'admin',   label: 'Администратор' },
  { value: 'viewer',  label: 'Наблюдатель' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function InviteDialog({ open, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('analyst');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setEmail('');
    setRole('analyst');
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const result = await sendInvitation(email, role);
    setPending(false);

    if (result.error) {
      setError(result.error);
    } else {
      toast.success(`Приглашение отправлено на ${email}`);
      reset();
      onClose();
    }
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent style={{ maxWidth: 440 }}>
        <DialogHeader>
          <DialogTitle>Пригласить участника</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="set-fields" style={{ marginTop: 4 }}>
            <div className="set-field">
              <label className="set-field-label">Email</label>
              <input
                className="set-input"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@company.ru"
              />
            </div>
            <div className="set-field">
              <label className="set-field-label">Роль</label>
              <select
                className="set-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="ob-error" style={{ marginTop: 10 }}>{error}</p>}

          <div className="ob-actions" style={{ marginTop: 20 }}>
            <button type="button" className="btn btn-ghost" onClick={handleClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? 'Отправка…' : 'Отправить приглашение'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
