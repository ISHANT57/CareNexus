import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { CLINICAL_ROLES , authorizePermission } from "../middlewares/rbac.js";
import { requireTenant, assertTenantMatch } from "../middlewares/tenantScope.js";
import { validateBody } from "../middlewares/validate.js";
import { Errors, paginate, paginationMeta } from "../types/index.js";
import { createAuditLog } from "../lib/audit.js";

const router = Router();
router.use(authenticate, requireTenant);

const EnrollmentSchema = z.object({
  patientId: z.string().uuid(),
  programId: z.string().uuid(),
  notes: z.string().optional(),
});

const UpdateEnrollmentSchema = z.object({
  notes: z.string().optional(),
});

router.get("/", authorizePermission("programs", "read"), async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const patientId = req.query["patientId"] as string | undefined;
    const programId = req.query["programId"] as string | undefined;
    const status = req.query["status"] as any | undefined;

    const where: any = { tenantId: req.tenantId!, deletedAt: null };
    if (patientId) where.patientId = patientId;
    if (programId) where.programId = programId;
    if (status) where.status = status;

    const [total, enrollments] = await Promise.all([
      prisma.programEnrollment.count({ where }),
      prisma.programEnrollment.findMany({
        where,
        skip,
        take,
        orderBy: { enrolledAt: "desc" },
        include: { program: true },
      }),
    ]);
    res.json({ data: enrollments, meta: paginationMeta(total, page, limit) });
  } catch (err) { next(err); }
});

router.post("/", authorizePermission("programs", "write"), validateBody(EnrollmentSchema), async (req, res, next) => {
  try {
    const { patientId, programId, notes } = req.body;

    // Verify patient belongs to tenant
    const patient = await prisma.patient.findFirst({ where: { id: patientId, tenantId: req.tenantId!, deletedAt: null } });
    if (!patient) throw Errors.notFound("Patient");

    // Verify program belongs to tenant
    const program = await prisma.program.findFirst({ where: { id: programId, tenantId: req.tenantId!, deletedAt: null } });
    if (!program) throw Errors.notFound("Program");

    // Check if already active
    const existing = await prisma.programEnrollment.findFirst({
      where: { patientId, programId, status: "ACTIVE", deletedAt: null }
    });
    if (existing) throw Errors.conflict("Patient is already enrolled in this program.");

    const enrollment = await prisma.programEnrollment.create({
      data: { tenantId: req.tenantId!, patientId, programId, notes, status: "ACTIVE", enrolledAt: new Date() },
      include: { program: true }
    });
    await createAuditLog({ req, entityType: "ProgramEnrollment", entityId: enrollment.id, action: "CREATE", after: req.body });
    
    // Also record a journey event for this
    await prisma.patientJourneyEvent.create({
      data: {
        patientId,
        status: "NEW",
        notes: `Enrolled in program: ${program.name}`,
        actedBy: req.user!.userId
      }
    });

    res.status(201).json(enrollment);
  } catch (err) { next(err); }
});

router.patch("/:id", authorizePermission("programs", "write"), validateBody(UpdateEnrollmentSchema), async (req, res, next) => {
  try {
    const enrollment = await prisma.programEnrollment.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!enrollment) throw Errors.notFound("ProgramEnrollment");
    assertTenantMatch(req, enrollment.tenantId);

    const updated = await prisma.programEnrollment.update({
      where: { id: enrollment.id },
      data: { notes: req.body.notes },
      include: { program: true }
    });
    await createAuditLog({ req, entityType: "ProgramEnrollment", entityId: enrollment.id, action: "UPDATE", before: enrollment, after: updated });
    res.json(updated);
  } catch (err) { next(err); }
});

router.post("/:id/complete", authorizePermission("programs", "write"), async (req, res, next) => {
  try {
    const enrollment = await prisma.programEnrollment.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!enrollment) throw Errors.notFound("ProgramEnrollment");
    assertTenantMatch(req, enrollment.tenantId);

    const updated = await prisma.programEnrollment.update({
      where: { id: enrollment.id },
      data: { status: "COMPLETED", completedAt: new Date() },
      include: { program: true }
    });
    await createAuditLog({ req, entityType: "ProgramEnrollment", entityId: enrollment.id, action: "UPDATE", before: enrollment, after: updated });
    res.json(updated);
  } catch (err) { next(err); }
});

router.post("/:id/cancel", authorizePermission("programs", "write"), async (req, res, next) => {
  try {
    const enrollment = await prisma.programEnrollment.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!enrollment) throw Errors.notFound("ProgramEnrollment");
    assertTenantMatch(req, enrollment.tenantId);

    const updated = await prisma.programEnrollment.update({
      where: { id: enrollment.id },
      data: { status: "CANCELLED", completedAt: new Date() },
      include: { program: true }
    });
    await createAuditLog({ req, entityType: "ProgramEnrollment", entityId: enrollment.id, action: "UPDATE", before: enrollment, after: updated });
    res.json(updated);
  } catch (err) { next(err); }
});

export default router;
