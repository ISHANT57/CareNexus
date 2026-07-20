import { Request } from "express";
import { prisma } from "../lib/prisma.js";

/**
 * Returns a Prisma `where` clause fragment that enforces per-role visibility (RBAC scoping)
 * WITHIN a tenant. The caller is responsible for also applying `tenantId` / `deletedAt`.
 *
 * Role scopes (hierarchy: Tenant → Area → Clinic → Program → Doctor → Patient):
 * - SUPER_ADMIN  : everything in the tenant            → {}
 * - AREA_ADMIN   : assigned AREAS only — derived from the areas of their assigned clinics,
 *                  then expanded to EVERY clinic in those areas.
 * - CLINIC_ADMIN : their assigned CLINICS only.
 * - DOCTOR       : their assigned PATIENTS only (DoctorPatientAssignment), and the
 *                  appointments / consultations they personally own.
 * - OPERATOR/STAFF: their assigned clinics (and assigned programs as their "workflows").
 *
 * `module` shapes the fragment so it is valid against the target model:
 *   'patient' | 'appointment' | 'consultation' | 'clinic' | 'area' | 'program' | 'user' | 'dashboard'
 *
 * A user with no relevant assignment receives an impossible filter (sees nothing) rather
 * than an empty filter (which would leak the whole tenant).
 */
export type ScopeModule =
  | "patient"
  | "appointment"
  | "consultation"
  | "clinic"
  | "area"
  | "program"
  | "user"
  | "dashboard";

// A filter that can never match — used so an unscoped role sees nothing instead of everything.
const IMPOSSIBLE = { id: "00000000-0000-0000-0000-000000000000" } as const;

export async function getRoleScope(req: Request, module: ScopeModule): Promise<Record<string, unknown>> {
  if (!req.user) return IMPOSSIBLE;

  const role = req.user.role;
  const userId = req.user.userId;

  // SUPER_ADMIN: unrestricted within the tenant (tenant scope applied by callers).
  if (role === "SUPER_ADMIN") return {};

  // Resolve this user's direct clinic + program assignments.
  const [clinicAssign, programAssign] = await Promise.all([
    prisma.userClinicAssignment.findMany({ where: { userId, deletedAt: null }, select: { clinicId: true } }),
    prisma.userProgramAssignment.findMany({ where: { userId, deletedAt: null }, select: { programId: true } }),
  ]);
  const clinicIds = clinicAssign.map((a) => a.clinicId);
  const programIds = programAssign.map((a) => a.programId);

  // ── DOCTOR: only patients explicitly assigned to them ────────────────────────
  if (role === "DOCTOR") {
    switch (module) {
      case "patient":
      case "dashboard":
        return { doctorAssignments: { some: { doctorId: userId, deletedAt: null } } };
      case "appointment":
      case "consultation":
        return { doctorId: userId };
      case "clinic":
        return clinicIds.length ? { id: { in: clinicIds } } : IMPOSSIBLE;
      case "area":
        return clinicIds.length ? { clinics: { some: { id: { in: clinicIds }, deletedAt: null } } } : IMPOSSIBLE;
      case "program":
        return programIds.length ? { id: { in: programIds } } : IMPOSSIBLE;
      case "user":
        return { clinicAssignments: { some: { clinicId: { in: clinicIds }, deletedAt: null } } };
    }
  }

  // ── AREA_ADMIN: assigned areas (every clinic in those areas) ──────────────────
  if (role === "AREA_ADMIN") {
    if (clinicIds.length === 0) return IMPOSSIBLE;
    // Areas the admin's assigned clinics belong to …
    const assignedClinics = await prisma.clinic.findMany({ where: { id: { in: clinicIds } }, select: { areaId: true } });
    const areaIds = [...new Set(assignedClinics.map((c) => c.areaId))];
    if (areaIds.length === 0) return IMPOSSIBLE;
    // … then EVERY clinic within those areas.
    const areaClinics = await prisma.clinic.findMany({ where: { areaId: { in: areaIds }, deletedAt: null }, select: { id: true } });
    const areaClinicIds = areaClinics.map((c) => c.id);
    switch (module) {
      case "patient":
      case "dashboard":
        return { areaId: { in: areaIds } };
      case "appointment":
      case "consultation":
        return { clinicId: { in: areaClinicIds } };
      case "clinic":
        return { areaId: { in: areaIds } };
      case "area":
        return { id: { in: areaIds } };
      case "program":
        return { OR: [{ areaId: { in: areaIds } }, { clinicId: { in: areaClinicIds } }] };
      case "user":
        return { clinicAssignments: { some: { clinicId: { in: areaClinicIds }, deletedAt: null } } };
    }
  }

  // ── CLINIC_ADMIN / OPERATOR / STAFF: assigned clinics only ───────────────────
  if (clinicIds.length > 0) {
    switch (module) {
      case "patient":
      case "appointment":
      case "consultation":
      case "dashboard":
        return { clinicId: { in: clinicIds } };
      case "clinic":
        return { id: { in: clinicIds } };
      case "area":
        return { clinics: { some: { id: { in: clinicIds }, deletedAt: null } } };
      case "program":
        // Operators' "workflows" = their assigned programs (fall back to clinic-bound programs).
        return programIds.length ? { id: { in: programIds } } : { clinicId: { in: clinicIds } };
      case "user":
        return { clinicAssignments: { some: { clinicId: { in: clinicIds }, deletedAt: null } } };
    }
  }

  // No assignments → see nothing.
  return IMPOSSIBLE;
}
