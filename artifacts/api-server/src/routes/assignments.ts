import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { ADMIN_ROLES } from "../middlewares/rbac.js";
import { requireTenant } from "../middlewares/tenantScope.js";
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
    const { doctorId, clinicId, areaId } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { tenantId: req.tenantId!, deletedAt: null };
    if (doctorId) where["doctorId"] = doctorId;
    if (clinicId) where["clinicId"] = clinicId;
    if (areaId) where["areaId"] = areaId;

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

router.post("/", ADMIN_ROLES, validateBody(AssignmentSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof AssignmentSchema>;

    // Soft-delete existing active assignment for patient
    await prisma.doctorPatientAssignment.updateMany({
      where: { patientId: data.patientId, tenantId: req.tenantId!, deletedAt: null },
      data: { deletedAt: new Date() },
    });

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

router.delete("/:id", ADMIN_ROLES, async (req, res, next) => {
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
