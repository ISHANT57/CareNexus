import { type Request, type Response, type NextFunction } from "express";
import { Errors } from "../lib/errors.js";

import { prisma } from "../lib/prisma.js";

/**
 * Ensures every request has a resolved tenantId.
 * Super admins can supply X-Tenant-Id header to operate on a specific tenant.
 * Regular users are locked to their specific requested tenant assignment.
 */
export async function requireTenant(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) return next(Errors.unauthorized());

    const headerTenantId = req.headers["x-tenant-id"] as string | undefined;

    // Check all user assignments
    const assignments = await prisma.userTenantAssignment.findMany({
      where: { userId: req.user.userId, status: "ACTIVE" },
      include: { role: true },
    });

    if (assignments.length === 0) {
      return next(Errors.unauthorized("No active tenant assignments found"));
    }

    const isSuperAdmin = assignments.some(a => a.role.name === "SUPER_ADMIN");

    if (isSuperAdmin) {
      if (headerTenantId === "ALL") {
        req.tenantId = undefined; // Drop tenant filter for global queries
        req.user.role = "SUPER_ADMIN";
        return next();
      } else if (headerTenantId) {
        req.tenantId = headerTenantId;
        req.user.role = "SUPER_ADMIN";
        return next();
      }
    }

    if (!headerTenantId || headerTenantId === "ALL") {
      // Default to first assignment if no specific header provided or unauthorized for ALL
      req.tenantId = assignments[0].tenantId;
      req.user.role = assignments[0].role.name;
      return next();
    }

    // Verify they have access to the requested tenant
    const targetAssignment = assignments.find(a => a.tenantId === headerTenantId);
    if (!targetAssignment) {
      return next(Errors.forbidden("You do not have access to this tenant"));
    }

    req.tenantId = targetAssignment.tenantId;
    req.user.role = targetAssignment.role.name;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Validates that a resource's tenantId matches the request's tenantId.
 * Throws TENANT_MISMATCH if not.
 */
export function assertTenantMatch(
  req: Request,
  resourceTenantId: string,
): void {
  if (req.user?.role === "SUPER_ADMIN") return;
  if (resourceTenantId !== req.tenantId) throw Errors.tenantMismatch();
}
