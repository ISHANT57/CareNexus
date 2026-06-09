import { type Request, type Response, type NextFunction } from "express";
import { Errors } from "../lib/errors.js";

/**
 * Ensures every request has a resolved tenantId.
 * Super admins can supply X-Tenant-Id header to operate on a specific tenant.
 * Regular users are locked to their JWT tenantId.
 */
export function requireTenant(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) return next(Errors.unauthorized());

  if (req.user.role === "SUPER_ADMIN") {
    const headerTenantId = req.headers["x-tenant-id"] as string | undefined;
    if (headerTenantId === "ALL") {
      req.tenantId = undefined; // Drop tenant filter for global queries
    } else if (headerTenantId) {
      req.tenantId = headerTenantId;
    } else {
      req.tenantId = req.user.tenantId;
    }
    return next();
  }

  if (!req.user.tenantId) return next(Errors.unauthorized("No tenant context"));
  req.tenantId = req.user.tenantId;
  next();
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
