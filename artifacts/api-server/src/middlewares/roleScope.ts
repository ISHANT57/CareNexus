import { Request } from "express";
import { prisma } from "../lib/prisma.js";

/**
 * Returns a Prisma `where` clause fragment based on the user's role.
 * This is used to enforce Role Visibility (RBAC scoping) within a tenant.
 *
 * Scopes applied:
 * - SUPER_ADMIN: Can see everything (returns empty object)
 * - AREA_ADMIN: Can see data for clinics they are assigned to (and areas related to those clinics)
 * - CLINIC_ADMIN: Can see data for clinics they are assigned to
 * - DOCTOR: Can see data for patients they are explicitly assigned to, or appointments they own
 * - OPERATOR/STAFF: Minimal data (falls back to clinic assignment scope)
 *
 * Note: `module` is used to determine how the filter should be shaped.
 * Supported modules: 'patient', 'appointment', 'consultation', 'clinic', 'user', 'dashboard'
 */
export async function getRoleScope(req: Request, module: "patient" | "appointment" | "consultation" | "clinic" | "user" | "dashboard") {
  if (!req.user) return {};
  
  const role = req.user.role;
  const userId = req.user.userId;

  // SUPER_ADMIN sees everything within the tenant (tenant scope is applied globally elsewhere)
  if (role === "SUPER_ADMIN") return {};

  // Find clinics this user is assigned to
  const assignments = await prisma.userClinicAssignment.findMany({
    where: { userId, deletedAt: null },
    select: { clinicId: true },
  });
  
  const clinicIds = assignments.map(a => a.clinicId);

  // DOCTOR scope
  if (role === "DOCTOR") {
    if (module === "patient" || module === "dashboard") {
      return { doctorAssignments: { some: { doctorId: userId, deletedAt: null } } };
    }
    if (module === "appointment" || module === "consultation") {
      return { doctorId: userId };
    }
    if (module === "clinic") {
      return { id: { in: clinicIds } };
    }
    if (module === "user") {
      // Doctors shouldn't really query users, but if they do, limit to their clinics
      return { clinicAssignments: { some: { clinicId: { in: clinicIds }, deletedAt: null } } };
    }
  }

  // AREA_ADMIN, CLINIC_ADMIN, OPERATOR, STAFF scope
  // They are scoped to their assigned clinics. 
  // (In CareNexus, AREA_ADMINs are assigned to all clinics in their area).
  
  if (clinicIds.length > 0) {
    if (module === "patient" || module === "appointment" || module === "consultation" || module === "dashboard") {
      return { clinicId: { in: clinicIds } };
    }
    if (module === "clinic") {
      return { id: { in: clinicIds } };
    }
    if (module === "user") {
      return { clinicAssignments: { some: { clinicId: { in: clinicIds }, deletedAt: null } } };
    }
  }

  // Failsafe: if a user is not SUPER_ADMIN and has no clinic assignments,
  // they should not see any scoped data.
  // We return a condition that is impossible to satisfy.
  return { id: "00000000-0000-0000-0000-000000000000" };
}
