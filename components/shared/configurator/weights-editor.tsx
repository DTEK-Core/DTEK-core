'use client';

import { useState, useTransition } from 'react';
import { Slider } from '@/components/ui/slider';
import { saveFactorWeights } from '@/lib/actions/configurator';
import type { FactorWeights } from '@/lib/trust/calculate';

const DEFAULT_WEIGHTS: FactorWeights = {
  vuln_weight:       22,
  config_weight:     18,
  access_weight:     18,
  network_weight:    14,
  compliance_weight: 16,
  incident_weight:   12,
};

const FACTORS: Array<{ key: keyof FactorWeights; label: string; desc: string }> = [
  { key: 'vuln_weight',       label: 'Уязвимости',       desc: 'Число и критичность известных CVE' },
  { key: 'config_weight',     label: 'Конфигурация',      desc: 'Соответствие стандартам конфигурации' },
  { key: 'access_weight',     label: 'Доступы',           desc: 'Управление привилегиями и учётными записями' },
  { key: 'network_weight',    label: 'Сегментация сети',  desc: 'Изоляция и контроль трафика' },
  { key: 'compliance_weight', label: 'Соответствие ПБ',   desc: 'Выполнение политик безопасности' },
  { key: 'incident_weight',   label: 'Инциденты',         desc: 'История инцидентов и время реакции' },
];

interface WeightsEditorProps {
  weights: FactorWeights;
  canEdit: boolean;
}

export function WeightsEditor({ weights: initial, canEdit }: WeightsEditorProps) {
  const [weights, setWeights] = useState<FactorWeights>(initial);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingReset, setPendingReset] = useState(false);

  const sum = FACTORS.reduce((acc, f) => acc + weights[f.key], 0);
  const sumOk = sum === 100;
  const diff = sum - 100;

  function setWeight(key: keyof FactorWeights, raw: string | number) {
    const val = Math.max(0, Math.min(100, typeof raw === 'string' ? (parseInt(raw) || 0) : raw));
    setWeights(prev => ({ ...prev, [key]: val }));
    setSaved(false);
    setError(null);
    setPendingReset(false);
  }

  function handleResetClick() {
    if (!pendingReset) {
      setPendingReset(true);
    } else {
      setWeights(DEFAULT_WEIGHTS);
      setSaved(false);
      setError(null);
      setPendingReset(false);
    }
  }

  function handleResetCancel() {
    setPendingReset(false);
  }

  function handleSave() {
    if (!sumOk || isPending) return;
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveFactorWeights(weights);
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      }
    });
  }

  return (
    <div className="cfg-wrap">
      {/* Info banner for viewer */}
      {!canEdit && (
        <div className="cfg-readonly-note">
          Вы просматриваете конфигурацию. Для изменения весов необходима роль Владельца или Аналитика ИБ.
        </div>
      )}

      <div className="card cfg-card">
        <div className="card-head">
          <span className="card-title">Веса факторов Trust Score</span>
          <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>
            ADR-001 · формула Σ(фактор × вес) / 100
          </span>
        </div>

        <div className="cfg-factors">
          {FACTORS.map(f => {
            const val = weights[f.key];
            return (
              <div key={f.key} className="cfg-factor">
                <div className="cfg-factor-head">
                  <div className="cfg-factor-label">{f.label}</div>
                  <div className="cfg-factor-desc">{f.desc}</div>
                </div>
                <div className="cfg-factor-controls">
                  <Slider
                    value={[val]}
                    onValueChange={([v]) => setWeight(f.key, v)}
                    min={0}
                    max={100}
                    step={1}
                    disabled={!canEdit || isPending}
                    className="cfg-slider"
                  />
                  <div className="cfg-factor-input-wrap">
                    <input
                      type="number"
                      className="cfg-num-input"
                      value={val}
                      min={0}
                      max={100}
                      disabled={!canEdit || isPending}
                      onChange={e => setWeight(f.key, e.target.value)}
                      onBlur={e => setWeight(f.key, e.target.value)}
                    />
                    <span className="cfg-pct-sign">%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sum indicator */}
        <div className="cfg-sum">
          <span className="cfg-sum-label">Сумма весов</span>
          <span className={`cfg-sum-val${sumOk ? ' ok' : ' err'}`}>
            Σ = {sum} / 100
            {sumOk
              ? <span className="cfg-sum-icon">✓</span>
              : <span className="cfg-sum-icon">≠ 100</span>
            }
          </span>
        </div>

        {!sumOk && (
          <div className="cfg-sum-hint">
            {diff > 0
              ? `Уменьшите веса ещё на ${diff}%, чтобы сумма стала 100%`
              : `Добавьте ещё ${-diff}% к любому из факторов`}
          </div>
        )}

        {error && (
          <div className="cfg-error">{error}</div>
        )}
        {saved && (
          <div className="cfg-saved">
            Сохранено. Все объекты пересчитаны.
          </div>
        )}

        {canEdit && (
          <div className="cfg-actions">
            {pendingReset ? (
              <>
                <span className="cfg-reset-confirm-label">Сбросить все веса к значениям по умолчанию?</span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleResetCancel}
                  disabled={isPending}
                >
                  Отмена
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleResetClick}
                  disabled={isPending}
                >
                  Подтвердить сброс
                </button>
              </>
            ) : (
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleResetClick}
                disabled={isPending}
              >
                Сбросить по умолчанию
              </button>
            )}
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSave}
              disabled={!sumOk || isPending}
              title={!sumOk ? `Сумма весов должна быть 100%. Сейчас: ${sum}%` : undefined}
            >
              {isPending ? 'Пересчёт…' : 'Сохранить и пересчитать'}
            </button>
          </div>
        )}
      </div>

      {/* Info cards */}
      <div className="cfg-info-grid">
        <div className="card">
          <div className="card-head"><span className="card-title">Как работают веса</span></div>
          <div className="card-body">
            <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.7, margin: 0 }}>
              Trust Score объекта вычисляется по формуле:
              <br />
              <code style={{ color: 'var(--teal)', fontSize: 12 }}>
                Σ (оценка_фактора × вес) / 100
              </code>
              <br />
              Изменение весов немедленно влечёт массовый пересчёт всех объектов.
              Индекс доверия организации обновится автоматически.
            </p>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><span className="card-title">Значения по умолчанию</span></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {FACTORS.map(f => (
                <div key={f.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-dim)' }}>{f.label}</span>
                  <span className="mono" style={{ color: 'var(--teal)' }}>{DEFAULT_WEIGHTS[f.key]}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
