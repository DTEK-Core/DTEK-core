import { OBJECT_TYPES, CRITICALITY_LEVELS } from '@/lib/design-tokens';

const INFRA_TYPE_KEYS = ['server', 'workstation', 'laptop', 'network', 'ot'];

const EXPOSURE_OPTIONS = [
  { value: 'internal', label: 'Внутренний' },
  { value: 'external', label: 'Внешний' },
  { value: 'isolated', label: 'Изолированный' },
];

export interface ObjectFormValues {
  name?: string;
  type?: string;
  description?: string;
  criticality?: string;
  ip_address?: string;
  os_platform?: string;
  segment?: string;
  exposure?: string;
}

interface ObjectFormProps {
  initialValues?: ObjectFormValues;
  userRole: string;
  error?: string | null;
}

export function ObjectForm({ initialValues, userRole, error }: ObjectFormProps) {
  const isAdmin = userRole === 'admin';
  const availableTypes = isAdmin
    ? OBJECT_TYPES.filter(t => INFRA_TYPE_KEYS.includes(t.key as string))
    : [...OBJECT_TYPES];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginTop: 4 }}>
      {/* Название */}
      <label className="set-field">
        <span className="set-field-label">Название *</span>
        <input
          className="set-input"
          name="name"
          defaultValue={initialValues?.name}
          placeholder="Web-сервер production"
          required
          autoComplete="off"
        />
      </label>

      {/* Тип */}
      <label className="set-field">
        <span className="set-field-label">Тип *</span>
        <select
          className="set-input"
          name="type"
          defaultValue={initialValues?.type ?? ''}
          required
        >
          <option value="" disabled>Выберите тип</option>
          {availableTypes.map(t => (
            <option key={t.key} value={t.key}>{t.label}</option>
          ))}
        </select>
      </label>

      {/* Критичность */}
      <label className="set-field">
        <span className="set-field-label">Критичность *</span>
        <select
          className="set-input"
          name="criticality"
          defaultValue={initialValues?.criticality ?? 'medium'}
          required
        >
          {[...CRITICALITY_LEVELS].reverse().map(c => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
      </label>

      {/* Экспозиция */}
      <label className="set-field">
        <span className="set-field-label">Экспозиция</span>
        <select
          className="set-input"
          name="exposure"
          defaultValue={initialValues?.exposure ?? ''}
        >
          <option value="">— Не задана</option>
          {EXPOSURE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      {/* IP-адрес */}
      <label className="set-field">
        <span className="set-field-label">IP-адрес</span>
        <input
          className="set-input"
          name="ip_address"
          defaultValue={initialValues?.ip_address}
          placeholder="192.168.1.10"
          autoComplete="off"
        />
      </label>

      {/* Платформа / ОС */}
      <label className="set-field">
        <span className="set-field-label">Платформа / ОС</span>
        <input
          className="set-input"
          name="os_platform"
          defaultValue={initialValues?.os_platform}
          placeholder="Ubuntu 22.04 / Windows Server 2022"
          autoComplete="off"
        />
      </label>

      {/* Сегмент */}
      <label className="set-field">
        <span className="set-field-label">Сегмент</span>
        <input
          className="set-input"
          name="segment"
          defaultValue={initialValues?.segment}
          placeholder="DMZ, Internal, Production…"
          autoComplete="off"
        />
      </label>

      {/* Описание — span 2 cols */}
      <label className="set-field" style={{ gridColumn: 'span 2' }}>
        <span className="set-field-label">Описание</span>
        <textarea
          className="set-input"
          name="description"
          defaultValue={initialValues?.description}
          placeholder="Краткое описание объекта и его роли в инфраструктуре"
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
