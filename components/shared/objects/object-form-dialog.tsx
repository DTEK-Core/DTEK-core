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
import { ObjectForm } from './object-form';
import { createObject, updateObject, deleteObject, archiveObject } from '@/lib/actions/objects';

export interface EditableObject {
  id: string;
  name: string;
  type: string;
  description: string | null;
  criticality: string;
  ip_address: string | null;
  os_platform: string | null;
  segment: string | null;
  exposure: string | null;
  status: string;
}

interface ObjectFormDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userRole: string;
  editObject?: EditableObject | null;
  onDeleted?: () => void;
}

export function ObjectFormDialog({
  open,
  onOpenChange,
  userRole,
  editObject,
  onDeleted,
}: ObjectFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEdit = !!editObject;
  const canDelete = isEdit && ['owner', 'analyst'].includes(userRole);
  const canArchive = isEdit && ['owner', 'analyst', 'admin'].includes(userRole)
    && editObject.status !== 'archived';

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
        ? await updateObject(editObject.id, formData)
        : await createObject(formData);

      if (result?.error) {
        setError(result.error);
        return;
      }

      router.refresh();
      onOpenChange(false);
    });
  }

  function handleArchive() {
    setError(null);
    startTransition(async () => {
      const result = await archiveObject(editObject!.id);
      if (result?.error) { setError(result.error); return; }
      router.refresh();
      onOpenChange(false);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteObject(editObject!.id);
      if (result?.error) {
        setError(result.error);
        setShowDeleteConfirm(false);
        return;
      }
      setShowDeleteConfirm(false);
      onOpenChange(false);
      if (onDeleted) {
        onDeleted();
      } else {
        router.refresh();
      }
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
              {isEdit ? 'Редактировать объект' : 'Добавить объект'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} key={editObject?.id ?? 'create'}>
            <ObjectForm
              initialValues={
                editObject
                  ? {
                      name: editObject.name,
                      type: editObject.type,
                      description: editObject.description ?? '',
                      criticality: editObject.criticality,
                      ip_address: editObject.ip_address ?? '',
                      os_platform: editObject.os_platform ?? '',
                      segment: editObject.segment ?? '',
                      exposure: editObject.exposure ?? '',
                    }
                  : undefined
              }
              userRole={userRole}
              error={error}
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 20,
                gap: 10,
              }}
            >
              {/* Danger actions for edit mode */}
              <div style={{ display: 'flex', gap: 8 }}>
                {canArchive && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={handleArchive}
                    disabled={isPending}
                  >
                    Архивировать
                  </button>
                )}
                {canDelete && (
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

              {/* Primary actions */}
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
                    ? isEdit ? 'Сохранение…' : 'Создание…'
                    : isEdit ? 'Сохранить' : 'Создать объект'}
                </button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-1)',
            color: 'var(--text)',
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: 'var(--text)' }}>
              Удалить объект?
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: 'var(--text-dim)' }}>
              Объект «{editObject?.name}» и все связанные данные — паспорт доверия, риски,
              связи в Trust Graph — будут удалены безвозвратно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border-1)' }}
              disabled={isPending}
            >
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              style={{ background: 'var(--crit)', color: '#fff' }}
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? 'Удаление…' : 'Удалить объект'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
