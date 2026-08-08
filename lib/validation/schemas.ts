import { z } from 'zod';

// ── Reusable primitives ───────────────────────────────────────────────────────
const shortText  = z.string().min(1, 'Поле не может быть пустым').max(200).trim();
const mediumText = z.string().min(1, 'Поле не может быть пустым').max(500).trim();
const longText   = z.string().max(5000, 'Превышен лимит длины поля (5000 символов)').trim();
const optShort   = z.string().max(200).trim().nullable().optional();

// ── Enum values from DB CHECK constraints ─────────────────────────────────────
const OBJECT_TYPES = [
  'server', 'workstation', 'laptop', 'network', 'app',
  'database', 'service', 'identity', 'ot', 'policy', 'other',
] as const;

const CRITICALITY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

const EXPOSURE_TYPES = ['internal', 'external', 'isolated'] as const;

const RISK_CATEGORIES = [
  'vulnerability', 'configuration', 'access', 'network', 'compliance',
  'incident', 'monitoring', 'organizational', 'physical', 'human', 'other',
] as const;

const RISK_SEVERITY = ['low', 'medium', 'high', 'critical'] as const;

const RISK_PROBABILITY = ['low', 'medium', 'high'] as const;

const RISK_STATUSES = ['open', 'in_progress', 'mitigated', 'accepted', 'closed'] as const;

const RELATION_TYPES = [
  'uses', 'depends_on', 'connected_to', 'managed_by', 'owns', 'interacts_with',
] as const;

const INVITATION_ROLES = ['analyst', 'admin', 'viewer'] as const;

const ORG_SIZES = ['micro', 'small', 'medium', 'large', 'enterprise'] as const;

// ── Organization ──────────────────────────────────────────────────────────────

export const CreateOrgSchema = z.object({
  name:       shortText.max(200, 'Наименование не должно превышать 200 символов'),
  short_name: z.string().min(1, 'Поле не может быть пустым').max(100).trim(),
  industry:   z.string().max(100).trim().nullable().optional(),
  size:       z.enum(ORG_SIZES, { message: 'Выберите допустимый размер организации' }),
  inn:        z.string().max(12).regex(/^\d*$/, 'ИНН должен содержать только цифры').nullable().optional(),
  region:     optShort,
});

export const UpdateOrgSchema = z.object({
  name:     shortText.max(200, 'Наименование не должно превышать 200 символов'),
  inn:      z.string().max(12).regex(/^\d*$/, 'ИНН должен содержать только цифры').nullable().optional(),
  industry: z.string().max(100).trim().nullable().optional(),
  region:   optShort,
  size:     z.enum(ORG_SIZES, { message: 'Выберите допустимый размер организации' }).nullable().optional(),
});

// ── User Profile ──────────────────────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
  full_name: shortText.max(100, 'Имя не должно превышать 100 символов'),
  team:      optShort,
});

// ── Objects ───────────────────────────────────────────────────────────────────

export const CreateObjectSchema = z.object({
  name:        shortText.max(200, 'Название не должно превышать 200 символов'),
  type:        z.enum(OBJECT_TYPES, { message: 'Выберите допустимый тип объекта' }),
  criticality: z.enum(CRITICALITY_LEVELS, { message: 'Выберите уровень критичности' }).default('medium'),
  description: longText.nullable().optional(),
  ip_address:  z.string().max(45).nullable().optional(),
  os_platform: optShort,
  segment:     optShort,
  exposure:    z.enum(EXPOSURE_TYPES, { message: 'Выберите допустимый тип расположения' }).nullable().optional(),
});

export const UpdateObjectSchema = z.object({
  name:        shortText.max(200, 'Название не должно превышать 200 символов'),
  type:        z.enum(OBJECT_TYPES, { message: 'Выберите допустимый тип объекта' }).nullable().optional(),
  criticality: z.enum(CRITICALITY_LEVELS, { message: 'Выберите уровень критичности' }).nullable().optional(),
  description: longText.nullable().optional(),
  ip_address:  z.string().max(45).nullable().optional(),
  os_platform: optShort,
  segment:     optShort,
  exposure:    z.enum(EXPOSURE_TYPES, { message: 'Выберите допустимый тип расположения' }).nullable().optional(),
});

// ── Risks ─────────────────────────────────────────────────────────────────────

export const CreateRiskSchema = z.object({
  title:       mediumText.max(500, 'Название не должно превышать 500 символов'),
  description: longText.nullable().optional(),
  category:    z.enum(RISK_CATEGORIES, { message: 'Выберите допустимую категорию риска' }).default('other'),
  severity:    z.enum(RISK_SEVERITY, { message: 'Выберите уровень серьёзности' }).default('medium'),
  probability: z.enum(RISK_PROBABILITY, { message: 'Выберите допустимую вероятность' }).nullable().optional(),
  cvss_score:  z.number().min(0, 'CVSS не может быть меньше 0').max(10, 'CVSS не может быть больше 10').nullable().optional(),
  impact:      longText.nullable().optional(),
  sla_days:    z.number().int('SLA должен быть целым числом').positive('SLA должен быть положительным числом').nullable().optional(),
  object_id:   z.string().uuid('Некорректный идентификатор объекта').nullable().optional(),
  owner_id:    z.string().uuid('Некорректный идентификатор ответственного').nullable().optional(),
});

export const UpdateRiskSchema = z.object({
  title:       mediumText.max(500, 'Название не должно превышать 500 символов'),
  description: longText.nullable().optional(),
  category:    z.enum(RISK_CATEGORIES, { message: 'Выберите допустимую категорию риска' }).nullable().optional(),
  severity:    z.enum(RISK_SEVERITY, { message: 'Выберите уровень серьёзности' }).nullable().optional(),
  probability: z.enum(RISK_PROBABILITY, { message: 'Выберите допустимую вероятность' }).nullable().optional(),
  cvss_score:  z.number().min(0).max(10).nullable().optional(),
  impact:      longText.nullable().optional(),
  owner_id:    z.string().uuid('Некорректный идентификатор ответственного').nullable().optional(),
});

export const UpdateRiskStatusSchema = z.object({
  status: z.enum(RISK_STATUSES, { message: 'Недопустимый статус риска' }),
});

// ── Invitations ───────────────────────────────────────────────────────────────

export const InviteSchema = z.object({
  email: z.string().email('Некорректный адрес электронной почты').max(254).trim(),
  role:  z.enum(INVITATION_ROLES, { message: 'Недопустимая роль' }),
});

// ── Relations ─────────────────────────────────────────────────────────────────

export const CreateRelationSchema = z.object({
  sourceObjectId: z.string().uuid('Некорректный идентификатор объекта-источника'),
  targetObjectId: z.string().uuid('Некорректный идентификатор объекта-цели'),
  relationType:   z.enum(RELATION_TYPES, { message: 'Недопустимый тип связи' }),
});

// ── Factor Weights (Configurator) ─────────────────────────────────────────────

const _baseWeightsSchema = z.object({
  vuln_weight:       z.number().int().min(0).max(100),
  config_weight:     z.number().int().min(0).max(100),
  access_weight:     z.number().int().min(0).max(100),
  network_weight:    z.number().int().min(0).max(100),
  compliance_weight: z.number().int().min(0).max(100),
  incident_weight:   z.number().int().min(0).max(100),
});

type _WeightsBase = z.infer<typeof _baseWeightsSchema>;

export const FactorWeightsSchema = _baseWeightsSchema.refine(
  (d: _WeightsBase) =>
    d.vuln_weight + d.config_weight + d.access_weight +
    d.network_weight + d.compliance_weight + d.incident_weight === 100,
  { message: 'Сумма весов должна быть равна 100' },
);

export type FactorWeightsInput = z.infer<typeof FactorWeightsSchema>;
