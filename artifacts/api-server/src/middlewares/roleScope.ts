import { Request } from "express";
import { prisma } from "../lib/prisma.js";

/**
 * Returns a Prisma `where` clause fragment based on the user's role.
 * This is used to enforce Role Visibility (RBAC scoping) within a tenant.
 *
 * Scopes applied:
 * - SUPER_ADMIN: Can see everything (returns empty object)
 * - AREA_ADMIN: Can see data for clinics in their assigned area(s) (derived from their clinic assignments)
 * - CLINIC_ADMIN: Can see data for clinics they are assigned to
 * - DOCTOR: Can see data for patients they are explicitly assigned to, or appointments they own
 * - OPERATOR/STAFF: Scoped to their assigned clinics
 *
 * Note: `module` is used to determine how the filter should be shaped.
 * Supported modules: 'patient', 'appointment', 'consultation', 'clinic', 'user', 'dashboard', 'area', 'program', 'outcome', 'task'
 */
export async function getRoleScope(
  req: Request,
  module: "patient" | "appointment" | "consultation" | "clinic" | "user" | "dashboard" | "area" | "program" | "outcome" | "task"
): Promise<any> {
  if (!req.user) return {};
  
  const role = req.user.role;
  const userId = req.user.userId;

  // SUPER_ADMIN has full access across all modules
  if (role === "SUPER_ADMIN") return {};

  // Find clinics this user is assigned to
  const assignments = await prisma.userClinicAssignment.findMany({
    where: { userId, deletedAt: null },
    include: { clinic: { select: { areaId: true } } },
  });
  
  const clinicIds = assignments.map(a => a.clinicId);
  const areaIds = Array.from(new Set(assignments.map(a => a.clinic.areaId).filter(Boolean))) as string[];

  // Failsafe: if a user is not SUPER_ADMIN and has no clinic assignments,
  // they should not see any scoped data.
  if (clinicIds.length === 0) {
    return { id: "00000000-0000-0000-0000-000000000000" };
  }

  // Derive allowed clinics/areas based on role
  let allowedClinicIds = clinicIds;
  let allowedAreaIds = areaIds;

  if (role === "AREA_ADMIN") {
    // AREA_ADMIN sees everything in their assigned areas
    const areaClinics = await prisma.clinic.findMany({
      where: { areaId: { in: areaIds }, deletedAt: null },
      select: { id: true },
    });
    allowedClinicIds = areaClinics.map(c => c.id);
  }

  // Scopes based on module type
  if (module === "area") {
    return { id: { in: allowedAreaIds }, deletedAt: null };
  }

  if (module === "program") {
    return {
      OR: [
        { clinicId: { in: allowedClinicIds } },
        { areaId: { in: allowedAreaIds } },
        { clinicId: null, areaId: null },
      ],
      deletedAt: null,
    };
  }

  if (module === "clinic") {
    return { id: { in: allowedClinicIds }, deletedAt: null };
  }

  if (module === "user") {
    return {
      clinicAssignments: {
        some: { clinicId: { in: allowedClinicIds }, deletedAt: null },
      },
      deletedAt: null,
    };
  }

  if (role === "DOCTOR") {
    if (module === "patient" || module === "dashboard") {
      return { doctorAssignments: { some: { doctorId: userId, deletedAt: null } } };
    }
    if (module === "appointment" || module === "consultation") {
      return { doctorId: userId };
    }
    if (module === "outcome" || module === "task") {
      return {
        patient: {
          doctorAssignments: { some: { doctorId: userId, deletedAt: null } },
        },
      };
    }
  }

  // For CLINIC_ADMIN, AREA_ADMIN (if clinicId scoped above), OPERATOR, and STAFF
  if (module === "patient" || module === "dashboard" || module === "appointment" || module === "consultation") {
    return { clinicId: { in: allowedClinicIds } };
  }

  if (module === "outcome" || module === "task") {
    return {
      patient: {
        clinicId: { in: allowedClinicIds },
      },
    };
  }

  return { id: "00000000-0000-0000-0000-000000000000" };
}

