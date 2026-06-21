'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { createRisk, updateRisk, deleteRisk } from '@/lib/actions/risks';
import type { SimpleObj } from './risks-page-client';

// ── Constants ──────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: 'vulnerability',  label: 'Уязвимость'      },
  { value: 'configuration',  label: 'Конфигурация'    },
  { value: 'access',         label: 'Доступ'          },
  { value: 'network',        label: 'Сеть'            },
  { value: 'compliance',     label: 'Соответствие'    },
  { value: 'incident',       label: 'Инцидент'        },
  { value: 'monitoring',     label: 'Мониторинг'      },
  { value: 'organizational', label: 'Организационный' },
  { value: 'physical',       label: 'Физический'      },
  { value: 'human',          label: 'Человеческий'    },
  { value: 'other',          label: 'Прочее'          },
];

const SEVERITY_OPTIONS = [
  { value: 'critical', label: 'Критический' },
  { value: 'high',     label: 'Высокий'     },
  { value: 'medium',   label: 'Средний'     },
  { value: 'low',      label: 'Низкий'      },
];

const PROBABILITY_OPTIONS = [
  { value: 'high',   label: 'Высокая' },
  { value: 'medium', label: 'Средняя' },
  { value: 'low',    label: 'Низкая'  },
];

// ── Types ──────────────────────────────────────────────────────────────────────

export interface EditableRisk {
  id: string;
  title: string;
  description: string | null;
  category: string;
  severity: string;
  probability: string | null;
  cvss_score: number | null;
  impact: string | null;
}

interface RiskFormDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editRisk?: EditableRisk | null;
  objects: SimpleObj[];
  onDeleted?: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function RiskFormDialog({
  open,
  onOpenChange,
  editRisk,
  objects,
  onDeleted,
}: RiskFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEdit = !!editRisk;

  function close() {
    if (isPending) return;
    onOpenChange(false);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = isEdit
        ? await updateRisk(editRisk.id, formData)
        : await createRisk(formData);

      if (result?.error) {
        setError(result.error);
        return;
      }

      onOpenChange(false);   // BUG-003: close immediately, refresh in background
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteRisk(editRisk!.id);
      if (result?.error) {
        setError(result.error);
        setShowDeleteConfirm(false);
        return;
      }
      setShowDeleteConfirm(false);
      onOpenChange(false);               // BUG-003: close immediately
      if (onDeleted) onDeleted();
      router.refresh();
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={v => { if (!v) close(); }}>
        <DialogContent
          className="max-w-2xl"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-1)',
            color: 'var(--text)',
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--text)', fontSize: 17, fontWeight: 700 }}>
              {isEdit ? 'Редактировать риск' : 'Зарегистрировать риск'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} key={editRisk?.id ?? 'create'}>
            <RiskFormFields
              initialValues={editRisk ?? undefined}
              objects={objects}
              isEdit={isEdit}
              error={error}
            />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 20,
              gap: 10,
            }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {isEdit && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--crit)' }}
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isPending}
                  >
                    Удалить
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={close}
                  disabled={isPending}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isPending}
                >
                  {isPending
                    ? (isEdit ? 'Сохранение…' : 'Создание…')
                    : (isEdit ? 'Сохранить' : 'Создать риск')}
                </button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-1)',
          color: 'var(--text)',
        }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: 'var(--text)' }}>
              Удалить риск?
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: 'var(--text-dim)' }}>
              Риск «{editRisk?.title}» будет удалён безвозвратно.
              Все привязки к объектам также будут удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              style={{
                background: 'var(--surface-2)',
                color: 'var(--text)',
                border: '1px solid var(--border-1)',
              }}
              disabled={isPending}
            >
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              style={{ background: 'var(--crit)', color: '#fff' }}
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? 'Удаление…' : 'Удалить риск'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Form fields ────────────────────────────────────────────────────────────────

function RiskFormFields({
  initialValues,
  objects,
  isEdit,
  error,
}: {
  initialValues?: EditableRisk;
  objects: SimpleObj[];
  isEdit: boolean;
  error?: string | null;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginTop: 4 }}>

      {/* Название — full row */}
      <label className="set-field" style={{ gridColumn: 'span 2' }}>
        <span className="set-field-label">Название *</span>
        <input
          className="set-input"
          name="title"
          defaultValue={initialValues?.title}
          placeholder="Уязвимость в конфигурации TLS"
          required
          autoComplete="off"
        />
      </label>

      {/* Категория */}
      <label className="set-field">
        <span className="set-field-label">Категория *</span>
        <select
          className="set-input"
          name="category"
          defaultValue={initialValues?.category ?? 'vulnerability'}
          required
        >
          {CATEGORY_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      {/* Серьёзность */}
      <label className="set-field">
        <span className="set-field-label">Серьёзность *</span>
        <select
          className="set-input"
          name="severity"
          defaultValue={initialValues?.severity ?? 'medium'}
          required
        >
          {SEVERITY_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      {/* Вероятность */}
      <label className="set-field">
        <span className="set-field-label">Вероятность</span>
        <select
          className="set-input"
          name="probability"
          defaultValue={initialValues?.probability ?? ''}
        >
          <option value="">— Не задана</option>
          {PROBABILITY_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      {/* CVSS Score */}
      <label className="set-field">
        <span className="set-field-label">CVSS Score (0–10)</span>
        <input
          className="set-input"
          name="cvss_score"
          type="number"
          step="0.1"
          min="0"
          max="10"
          defaultValue={initialValues?.cvss_score ?? ''}
          placeholder="7.5"
        />
      </label>

      {/* Привязать к объекту — only on create */}
      {!isEdit && (
        <label className="set-field">
          <span className="set-field-label">Привязать к объекту</span>
          <select className="set-input" name="object_id" defaultValue="">
            <option value="">— Не привязывать</option>
            {objects.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </label>
      )}

      {/* SLA — only on create */}
      {!isEdit && (
        <label className="set-field">
          <span className="set-field-label">SLA (дней)</span>
          <input
            className="set-input"
            name="sla_days"
            type="number"
            min="1"
            placeholder="30"
          />
        </label>
      )}

      {/* Влияние — full row */}
      <label className="set-field" style={{ gridColumn: 'span 2' }}>
        <span className="set-field-label">Влияние</span>
        <input
          className="set-input"
          name="impact"
          defaultValue={initialValues?.impact ?? ''}
          placeholder="Описание влияния на безопасность организации"
          autoComplete="off"
        />
      </label>

      {/* Описание — full row */}
      <label className="set-field" style={{ gridColumn: 'span 2' }}>
        <span className="set-field-label">Описание</span>
        <textarea
          className="set-input"
          name="description"
          defaultValue={initialValues?.description ?? ''}
          placeholder="Подробное описание риска и контекст обнаружения"
          rows={3}
          style={{ resize: 'vertical' }}
        />
      </label>

      {error && (
        <p className="auth-error" style={{ gridColumn: 'span 2', marginTop: 0 }}>{error}</p>
      )}
    </div>
  );
}
