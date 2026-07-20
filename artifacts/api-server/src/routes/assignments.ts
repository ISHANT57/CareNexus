import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { ADMIN_ROLES , authorizePermission } from "../middlewares/rbac.js";
import { requireTenant } from "../middlewares/tenantScope.js";
import { validateBody } from "../middlewares/validate.js";
import { Errors, paginate, paginationMeta } from "../types/index.js";
import { createAuditLog } from "../lib/audit.js";
import { getRoleScope } from "../middlewares/roleScope.js";

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
    const roleScope = await getRoleScope(req, "patient");
    const where: Record<string, unknown> = { tenantId: req.tenantId!, deletedAt: null, patient: roleScope };
    if (doctorId) where["doctorId"] = doctorId;
    if (clinicId) where["clinicId"] = clinicId;
    if (areaId) where["areaId"] = areaId;
    if (patientId) where["patientId"] = patientId;

    const [total, assignments] = await Promise.all([
      prisma.doctorPatientAssignment.count({ where }),
      prisma.doctorPatientAssignment.findMany({
        where, skip, take, orderBy: { createdAt: "desc" },
        include: {
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              tenantAssignments: {
                where: { tenantId: req.tenantId!, status: "ACTIVE" },
                include: { role: { select: { name: true } } },
              },
            },
          },
          patient: { select: { id: true, firstName: true, lastName: true, nhsNumber: true } },
          clinic: { select: { id: true, name: true } },
          area: { select: { id: true, name: true } },
        },
      }),
    ]);

    const data = assignments.map((a) => {
      const activeAssignment = a.doctor?.tenantAssignments?.[0];
      return {
        id: a.id,
        tenantId: a.tenantId,
        areaId: a.areaId,
        clinicId: a.clinicId,
        doctorId: a.doctorId,
        patientId: a.patientId,
        isTemp: a.isTemp,
        firstLoginAt: a.firstLoginAt,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        deletedAt: a.deletedAt,
        doctor: {
          id: a.doctor.id,
          firstName: a.doctor.firstName,
          lastName: a.doctor.lastName,
          role: activeAssignment?.role ? { name: activeAssignment.role.name } : null,
        },
        patient: a.patient,
        clinic: a.clinic,
        area: a.area,
      };
    });

    res.json({ data, meta: paginationMeta(total, page, limit) });
  } catch (err) { next(err); }
});

router.post("/", authorizePermission("tasks", "write"), validateBody(AssignmentSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof AssignmentSchema>;
    
    // Cross-tenant and hierarchy validation
    const patientRoleScope = await getRoleScope(req, "patient");
    const patient = await prisma.patient.findFirst({ where: { id: data.patientId, tenantId: req.tenantId!, deletedAt: null, ...patientRoleScope } });
    if (!patient) throw Errors.notFound("Patient");

    const doctor = await prisma.user.findFirst({ where: { id: data.doctorId, tenantAssignments: { some: { tenantId: req.tenantId! } }, deletedAt: null } });
    if (!doctor) throw Errors.notFound("Doctor");

    const area = await prisma.area.findFirst({ where: { id: data.areaId, tenantId: req.tenantId!, deletedAt: null } });
    if (!area) throw Errors.notFound("Area");

    const clinic = await prisma.clinic.findFirst({ where: { id: data.clinicId, tenantId: req.tenantId!, areaId: data.areaId, deletedAt: null } });
    if (!clinic) throw Errors.validation("Clinic does not belong to this tenant/area");

    // Prevent duplicate assignments: Check if doctor is already assigned
    const existing = await prisma.doctorPatientAssignment.findFirst({
      where: { patientId: data.patientId, doctorId: data.doctorId, tenantId: req.tenantId!, deletedAt: null },
    });
    if (existing) {
      res.status(200).json(existing);
      return;
    }

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
    const patientRoleScope = await getRoleScope(req, "patient");
    const assignment = await prisma.doctorPatientAssignment.findFirst({
      where: { id: req.params["id"] as string, tenantId: req.tenantId!, deletedAt: null, patient: patientRoleScope },
    });
    if (!assignment) throw Errors.notFound("Assignment");
    await prisma.doctorPatientAssignment.update({ where: { id: assignment.id }, data: { deletedAt: new Date() } });
    await createAuditLog({ req, entityType: "DoctorPatientAssignment", entityId: assignment.id, action: "DELETE" });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
