import { createAdminClient } from '@/lib/supabase/admin';
import { headers } from 'next/headers';

export type SecurityEventType =
  | 'role.changed'
  | 'user.blocked'
  | 'user.removed'
  | 'invitation.sent'
  | 'invitation.accepted'
  | 'invitation.cancelled'
  | 'org.updated'
  | 'config.weights_changed'
  | 'object.created'
  | 'object.deleted'
  | 'risk.created'
  | 'risk.deleted'
  | 'risk.owner_changed'
  | 'risk.due_date_changed'
  | 'risk.status_changed'
  | 'report.passport_exported'
  | 'report.risks_csv_exported'
  | 'report.executive_opened'
  | 'report.executive_exported'
  | 'import.objects_completed'
  | 'import.risks_completed'
  | 'import.failed';

interface SecurityEventPayload {
  organizationId: string;
  actorId:        string;
  actorEmail?:    string;
  eventType:      SecurityEventType;
  targetType?:    string;
  targetId?:      string;
  metadata?:      Record<string, unknown>;
}

export async function createSecurityEvent(payload: SecurityEventPayload): Promise<void> {
  try {
    const admin = createAdminClient();
    const hdrs  = await headers();
    const ip    = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim()
               ?? hdrs.get('x-real-ip')
               ?? null;

    const { error } = await admin.from('security_events').insert({
      organization_id: payload.organizationId,
      actor_id:        payload.actorId,
      actor_email:     payload.actorEmail ?? null,
      event_type:      payload.eventType,
      target_type:     payload.targetType ?? null,
      target_id:       payload.targetId   ?? null,
      metadata:        payload.metadata   ?? null,
      ip_address:      ip,
    } as never);

    if (error) console.error('[audit]', payload.eventType, error.message);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('[audit]', payload.eventType, message);
  }
}
