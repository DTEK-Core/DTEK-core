'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { createRelation } from '@/lib/actions/relations';
import type { GraphNode } from '@/lib/trust/graph-types';

const RELATION_TYPES = [
  { value: 'uses',           label: 'Использует' },
  { value: 'depends_on',     label: 'Зависит от' },
  { value: 'connected_to',   label: 'Подключён к' },
  { value: 'managed_by',     label: 'Управляется' },
  { value: 'owns',           label: 'Владеет' },
  { value: 'interacts_with', label: 'Взаимодействует' },
];

const TYPE_LABEL: Record<string, string> = {
  server: 'Сервер', workstation: 'АРМ', laptop: 'Ноутбук',
  app: 'Приложение', database: 'БД', network: 'Сеть',
  cloud: 'Cloud', user: 'Учётная запись', ot: 'ОТ', other: 'Прочее',
};

interface RelationDialogProps {
  open: boolean;
  onClose: () => void;
  nodes: GraphNode[];        // non-org nodes
  defaultSourceId?: string;  // pre-select source
}

export function RelationDialog({ open, onClose, nodes, defaultSourceId }: RelationDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [source, setSource] = useState<string>(defaultSourceId ?? '');
  const [target, setTarget] = useState<string>('');
  const [relType, setRelType] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Reset when dialog opens
  function handleOpenChange(val: boolean) {
    if (!val) {
      setError(null);
      onClose();
    }
  }

  function handleSubmit() {
    if (!source || !target || !relType) {
      setError('Заполните все поля');
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createRelation(source, target, relType);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
        onClose();
        // Reset for next open
        setSource(defaultSourceId ?? '');
        setTarget('');
        setRelType('');
      }
    });
  }

  const objectNodes = nodes.filter(n => n.type !== 'org');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent style={{ maxWidth: 440 }}>
        <DialogHeader>
          <DialogTitle>Добавить связь</DialogTitle>
        </DialogHeader>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
          {/* Source */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>
              Источник
            </label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите объект-источник" />
              </SelectTrigger>
              <SelectContent>
                {objectNodes.map(n => (
                  <SelectItem key={n.id} value={n.id}>
                    {n.name}
                    <span style={{ color: 'var(--text-mute)', marginLeft: 6, fontSize: 11 }}>
                      {TYPE_LABEL[n.type] ?? n.type}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>
              Тип связи
            </label>
            <Select value={relType} onValueChange={setRelType}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                {RELATION_TYPES.map(rt => (
                  <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>
              Цель
            </label>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите объект-цель" />
              </SelectTrigger>
              <SelectContent>
                {objectNodes
                  .filter(n => n.id !== source)
                  .map(n => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.name}
                      <span style={{ color: 'var(--text-mute)', marginLeft: 6, fontSize: 11 }}>
                        {TYPE_LABEL[n.type] ?? n.type}
                      </span>
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p style={{ color: 'var(--crit)', fontSize: 13, marginTop: -4 }}>{error}</p>
          )}
        </div>

        <DialogFooter style={{ marginTop: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={isPending}>
            Отмена
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSubmit}
            disabled={isPending || !source || !target || !relType}
          >
            {isPending ? 'Создание…' : 'Создать связь'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
