import { type Request, type Response, type NextFunction } from "express";
import { type Role } from "../types/index.js";
import { Errors } from "../lib/errors.js";

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
