import { type Request, type Response, type NextFunction } from "express";
import { type Role } from "../types/index.js";
import { Errors } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(Errors.unauthorized());

    const userRole = req.user.role as Role;

    // Super admin always passes role checks (but NOT tenant isolation)
    if (userRole === "SUPER_ADMIN") return next();

    if (!roles.includes(userRole)) {
      return next(Errors.forbidden(`Role '${userRole}' not permitted for this action`));
    }
    next();
  };
}

/**
 * authorizePermission — checks that the user's role has a specific module+action
 * permission entry in the role_permissions table.
 *
 * Usage: router.get("/", authenticate, requireTenant, authorizePermission("patients", "read"), ...)
 *
 * Falls back gracefully: SUPER_ADMIN always passes. If the user's role has no
 * role_permissions rows at all (i.e. a system role that relies on group-level
 * RBAC) this middleware also passes so it does not break existing flows.
 */
export function authorizePermission(module: string, action: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return next(Errors.unauthorized());

      // SUPER_ADMIN bypasses granular permissions
      if (req.user.role === "SUPER_ADMIN") return next();

      // Load the role by name for this tenant
      const role = await prisma.role.findFirst({
        where: { name: req.user.role },
        include: {
          rolePermissions: {
            include: { permission: true },
          },
        },
      });

      // If role has NO permissions configured, allow (system roles rely on group-level RBAC)
      if (!role || role.rolePermissions.length === 0) return next();

      const hasPermission = role.rolePermissions.some(
        (rp) => rp.permission.module === module && rp.permission.action === action
      );

      if (!hasPermission) {
        return next(
          Errors.forbidden(`Permission '${module}:${action}' not granted to role '${req.user.role}'`)
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

export const SUPER_ADMIN_ONLY = authorize("SUPER_ADMIN");
export const ADMIN_ROLES = authorize("SUPER_ADMIN", "AREA_ADMIN", "CLINIC_ADMIN");
export const CLINICAL_ROLES = authorize(
  "SUPER_ADMIN",
  "AREA_ADMIN",
  "CLINIC_ADMIN",
  "DOCTOR",
);
export const ALL_STAFF = authorize(
  "SUPER_ADMIN",
  "AREA_ADMIN",
  "CLINIC_ADMIN",
  "DOCTOR",
  "OPERATOR",
  "STAFF",
);
