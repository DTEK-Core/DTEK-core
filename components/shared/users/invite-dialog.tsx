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
import { Icon } from '@/components/shared/icon';

const ROLES = [
  { value: 'analyst', label: 'Аналитик ИБ' },
  { value: 'admin',   label: 'Администратор' },
  { value: 'viewer',  label: 'Наблюдатель' },
];

const ROLE_LABELS: Record<string, string> = {
  analyst: 'Аналитик ИБ',
  admin:   'Администратор',
  viewer:  'Наблюдатель',
};

type InviteResult = {
  email: string;
  role: string;
  inviteUrl: string | null;
  status: 'created' | 'existing' | 'expired';
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function InviteDialog({ open, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('analyst');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InviteResult | null>(null);
  const [copied, setCopied] = useState(false);

  function reset() {
    setEmail('');
    setRole('analyst');
    setError(null);
    setResult(null);
    setCopied(false);
  }

  async function copyInviteUrl(inviteUrl: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = inviteUrl;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.setAttribute('readonly', '');
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      toast.success('Ссылка скопирована');
    } catch {
      setError('Не удалось скопировать ссылку. Скопируйте её вручную.');
    }
  }

  async function handleSubmit(e: { preventDefault: () => void }, createNewExpired = false) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setCopied(false);

    const response = await sendInvitation(email, role, createNewExpired);
    setPending(false);

    if (response.error) {
      setError(response.error);
    } else {
      setResult({
        email: response.email ?? email,
        role: response.role ?? role,
        inviteUrl: response.inviteUrl ?? null,
        status: response.status ?? 'created',
      });
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

        {result ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                background: result.status === 'expired' ? 'rgba(245, 196, 81, 0.08)' : 'var(--panel-soft)',
              }}
            >
              <span className={result.status === 'expired' ? 'badge soft badge-amber' : 'badge soft badge-teal'}>
                {result.status === 'expired' ? 'Истекло' : 'Приглашение создано'}
              </span>
              {result.status === 'existing' && (
                <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>активная ссылка уже существует</span>
              )}
            </div>

            <div className="set-fields">
              <div className="set-field">
                <label className="set-field-label">Email</label>
                <input className="set-input" value={result.email} readOnly />
              </div>
              <div className="set-field">
                <label className="set-field-label">Роль</label>
                <input className="set-input" value={ROLE_LABELS[result.role] ?? result.role} readOnly />
              </div>
            </div>

            {result.inviteUrl ? (
              <div className="set-field">
                <label className="set-field-label">Ссылка приглашения</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'stretch', flexWrap: 'wrap' }}>
                  <input
                    className="set-input mono"
                    value={result.inviteUrl}
                    readOnly
                    style={{ minWidth: 220, flex: '1 1 220px', fontSize: 12 }}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => copyInviteUrl(result.inviteUrl!)}
                    title="Копировать ссылку"
                    style={{ flexShrink: 0 }}
                  >
                    <Icon name={copied ? 'check' : 'link'} size={15} />
                    {copied ? 'Скопировано' : 'Копировать'}
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-mute)', margin: 0 }}>
                Срок действия приглашения истёк. Создайте новую ссылку для этого пользователя.
              </p>
            )}

            {error && <p className="ob-error">{error}</p>}

            <div className="ob-actions" style={{ marginTop: 4, flexWrap: 'wrap' }}>
              {result.status === 'expired' ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={pending}
                  onClick={(e) => handleSubmit(e, true)}
                >
                  {pending ? 'Создание…' : 'Создать новое приглашение'}
                </button>
              ) : (
                <>
                  <button type="button" className="btn btn-ghost" onClick={reset}>
                    Создать ещё одно приглашение
                  </button>
                  <a className="btn btn-primary" href={result.inviteUrl ?? '#'} target="_blank" rel="noreferrer">
                    Открыть
                  </a>
                </>
              )}
            </div>
          </div>
        ) : (
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
        )}
      </DialogContent>
    </Dialog>
  );
}
