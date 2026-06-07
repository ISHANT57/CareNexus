import { type Request } from "express";
import { prisma } from "./prisma.js";
import { type AuditAction } from "@prisma/client";

interface AuditParams {
  req: Request;
  entityType: string;
  entityId: string;
  action: AuditAction;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}

export async function createAuditLog({
  req,
  entityType,
  entityId,
  action,
  before,
  after,
}: AuditParams): Promise<void> {
  try {
    const tenantId = req.tenantId ?? req.user?.tenantId;
    if (!tenantId) return;

    await prisma.auditLog.create({
      data: {
        tenantId,
        entityType,
        entityId,
        action,
        actorId: req.user?.userId ?? null,
        beforeValue: before ? (before as object) : undefined,
        afterValue: after ? (after as object) : undefined,
        ipAddress:
          (req.headers["x-forwarded-for"] as string) ??
          req.socket.remoteAddress ??
          null,
        userAgent: req.headers["user-agent"] ?? null,
      },
    });
  } catch {
    // Audit logging must never crash the main request
  }
}
