import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { ADMIN_ROLES , authorizePermission } from "../middlewares/rbac.js";
import { requireTenant } from "../middlewares/tenantScope.js";
import { getRoleScope } from "../middlewares/roleScope.js";
import { validateBody } from "../middlewares/validate.js";
import { Errors, paginate, paginationMeta } from "../types/index.js";
import { createAuditLog } from "../lib/audit.js";

const router = Router();
router.use(authenticate, requireTenant);

const AssignmentSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  clinicId: z.string().uuid(),
  areaId: z.string().uuid(),
  isTemp: z.boolean().optional(),
});

router.get("/", async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const { doctorId, clinicId, areaId, patientId } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { tenantId: req.tenantId!, deletedAt: null };
    // RBAC: non-super users only see assignments for patients within their scope
    // (a doctor therefore sees the full care team of their assigned patients, no others).
    if (req.user?.role !== "SUPER_ADMIN") {
      const patientScope = await getRoleScope(req, "patient");
      where["patient"] = patientScope;
    }
    if (doctorId) where["doctorId"] = doctorId;
    if (clinicId) where["clinicId"] = clinicId;
    if (areaId) where["areaId"] = areaId;
    if (patientId) where["patientId"] = patientId;

    const [total, assignments] = await Promise.all([
      prisma.doctorPatientAssignment.count({ where }),
      prisma.doctorPatientAssignment.findMany({
        where, skip, take, orderBy: { createdAt: "desc" },
        include: {
          doctor: { select: { id: true, firstName: true, lastName: true } },
          patient: { select: { id: true, firstName: true, lastName: true, nhsNumber: true } },
          clinic: { select: { id: true, name: true } },
          area: { select: { id: true, name: true } },
        },
      }),
    ]);
    res.json({ data: assignments, meta: paginationMeta(total, page, limit) });
  } catch (err) { next(err); }
});

router.post("/", authorizePermission("tasks", "write"), validateBody(AssignmentSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof AssignmentSchema>;

    // CRIT-002: A specific tenant must be selected (super-admin "ALL" mode has no tenantId)
    if (!req.tenantId) {
      throw Errors.validation("A specific tenant must be selected to perform this action. Please select a tenant from the switcher.");
    }

    // HIGH-005: Only users with the DOCTOR role in this tenant may be assigned as clinicians
    const doctor = await prisma.user.findFirst({
      where: { id: data.doctorId, tenantId: req.tenantId, deletedAt: null, role: { name: "DOCTOR" } },
    });
    if (!doctor) throw Errors.validation("Selected clinician is not a doctor in this tenant");

    // Hierarchy: the patient must belong to this tenant, and the clinic must belong to the area + tenant.
    const patient = await prisma.patient.findFirst({ where: { id: data.patientId, tenantId: req.tenantId, deletedAt: null } });
    if (!patient) throw Errors.validation("Selected patient does not belong to this tenant");
    const clinic = await prisma.clinic.findFirst({ where: { id: data.clinicId, tenantId: req.tenantId, areaId: data.areaId, deletedAt: null } });
    if (!clinic) throw Errors.validation("Selected clinic/area is invalid for this tenant");

    // HIGH-002: Support multiple doctors per patient — reject only exact duplicate (patient, doctor) pairs
    // instead of soft-deleting the patient's entire care team.
    const existing = await prisma.doctorPatientAssignment.findFirst({
      where: { patientId: data.patientId, doctorId: data.doctorId, tenantId: req.tenantId, deletedAt: null },
    });
    if (existing) throw Errors.conflict("This doctor is already assigned to this patient");

    const assignment = await prisma.doctorPatientAssignment.create({
      data: { ...data, tenantId: req.tenantId! },
      include: {
        doctor: { select: { id: true, firstName: true, lastName: true } },
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await createAuditLog({ req, entityType: "DoctorPatientAssignment", entityId: assignment.id, action: "CREATE", after: data });

    // FEAT-011: Trigger notification to assigned doctor
    try {
      await prisma.notification.create({
        data: {
          tenantId: req.tenantId!,
          userId: data.doctorId,
          title: "New patient assignment",
          message: `You have been assigned a new patient: ${assignment.patient.firstName} ${assignment.patient.lastName}`,
          type: "INFO",
        },
      });
    } catch (_) { /* non-critical */ }

    res.status(201).json(assignment);
  } catch (err) { next(err); }
});

router.delete("/:id", authorizePermission("tasks", "write"), async (req, res, next) => {
  try {
    const assignment = await prisma.doctorPatientAssignment.findFirst({
      where: { id: req.params["id"] as string, tenantId: req.tenantId!, deletedAt: null },
    });
    if (!assignment) throw Errors.notFound("Assignment");
    await prisma.doctorPatientAssignment.update({ where: { id: assignment.id }, data: { deletedAt: new Date() } });
    await createAuditLog({ req, entityType: "DoctorPatientAssignment", entityId: assignment.id, action: "DELETE" });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
