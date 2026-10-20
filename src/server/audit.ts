import { prisma } from "@/lib/prisma";

/**
 * Audit trail for sensitive administrative operations. Every privileged action
 * should call `logAudit` with the acting user, the action and the target entity.
 */
export async function logAudit(params: {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ip?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId ?? null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ?? null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        ip: params.ip ?? null,
      },
    });
  } catch {
    // Auditing must never break the primary action.
    // eslint-disable-next-line no-console
    console.error("[AYAN:audit] Failed to write audit log");
  }
}
