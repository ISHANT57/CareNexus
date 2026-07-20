import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { authorizePermission } from "../middlewares/rbac.js";
import { requireTenant, assertTenantMatch } from "../middlewares/tenantScope.js";
import { validateBody } from "../middlewares/validate.js";
import { Errors, paginate, paginationMeta } from "../types/index.js";
import { createAuditLog } from "../lib/audit.js";
import { getRoleScope } from "../middlewares/roleScope.js";

const router = Router();
router.use(authenticate, requireTenant);

const OutcomeSchema = z.object({
  patientId: z.string().uuid(),
  programId: z.string().uuid(),
  outcomeMetricId: z.string().uuid(),
  doctorId: z.string().uuid().optional().nullable(),
  baselineValue: z.number(),
  currentValue: z.number(),
  targetValue: z.number(),
  measuredAt: z.string().datetime().optional(),
  notes: z.string().max(1000).optional().nullable(),
});

// Compute improvement metrics
function computeImprovements(baselineValue: number, currentValue: number, targetValue: number) {
  const range = targetValue - baselineValue;
  const progress = currentValue - baselineValue;
  const improvementPct = range !== 0 ? Math.round((progress / range) * 1000) / 10 : 0;
  const progressPct = range !== 0 ? Math.min(100, Math.round((Math.abs(progress) / Math.abs(range)) * 100)) : 0;
  const targetAchieved = range !== 0
    ? Math.sign(range) === Math.sign(progress) && Math.abs(progress) >= Math.abs(range)
    : false;
  return { improvementPct, progressPct, targetAchieved };
}

// GET /api/outcomes
router.get("/", authorizePermission("outcomes", "read"), async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const { patientId, programId, outcomeMetricId } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { tenantId: req.tenantId!, deletedAt: null };
    // RBAC: non-super users only see outcomes for patients in their scope, or ones they recorded.
    if (req.user?.role !== "SUPER_ADMIN") {
      const patientScope = await getRoleScope(req, "patient");
      where["OR"] = [{ doctorId: req.user!.userId }, { patient: patientScope }];
    }
    if (patientId) where["patientId"] = patientId;
    if (programId) where["programId"] = programId;
    if (outcomeMetricId) where["outcomeMetricId"] = outcomeMetricId;

    const [total, outcomes] = await Promise.all([
      prisma.patientOutcome.count({ where }),
      prisma.patientOutcome.findMany({
        where, skip, take,
        orderBy: { measuredAt: "desc" },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, nhsNumber: true } },
          program: { select: { id: true, name: true } },
          doctor: { select: { id: true, firstName: true, lastName: true } },
          outcomeMetric: { select: { id: true, name: true, code: true, unit: true, category: true } },
        },
      }),
    ]);

    const data = outcomes.map(o => ({
      ...o,
      ...computeImprovements(o.baselineValue, o.currentValue, o.targetValue),
      unit: o.outcomeMetric?.unit ?? "",
    }));

    res.json({ data, meta: paginationMeta(total, page, limit) });
  } catch (err) { next(err); }
});

// GET /api/outcomes/:id
router.get("/:id", authorizePermission("outcomes", "read"), async (req, res, next) => {
  try {
    const outcome = await prisma.patientOutcome.findFirst({
      where: { id: req.params["id"] as string, tenantId: req.tenantId!, deletedAt: null },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, nhsNumber: true } },
        program: { select: { id: true, name: true } },
        doctor: { select: { id: true, firstName: true, lastName: true } },
        outcomeMetric: { select: { id: true, name: true, code: true, unit: true, category: true } },
      },
    });
    if (!outcome) throw Errors.notFound("Outcome");
    res.json({ ...outcome, ...computeImprovements(outcome.baselineValue, outcome.currentValue, outcome.targetValue) });
  } catch (err) { next(err); }
});

// POST /api/outcomes
router.post("/", authorizePermission("outcomes", "write"), validateBody(OutcomeSchema), async (req, res, next) => {
  try {
    if (!req.tenantId) throw Errors.validation("A specific tenant must be selected to perform this action. Please select a tenant from the switcher.");
    const data = req.body as z.infer<typeof OutcomeSchema>;

    // HIGH-007: a doctorId supplied in the body must belong to the current tenant
    if (data.doctorId) {
      const doctor = await prisma.user.findFirst({ where: { id: data.doctorId, tenantId: req.tenantId, deletedAt: null } });
      if (!doctor) throw Errors.validation("The specified doctor does not belong to this tenant");
    }

    const outcome = await prisma.patientOutcome.create({
      data: {
        tenantId: req.tenantId!,
        patientId: data.patientId,
        programId: data.programId,
        outcomeMetricId: data.outcomeMetricId,
        doctorId: data.doctorId ?? req.user!.userId,
        baselineValue: data.baselineValue,
        currentValue: data.currentValue,
        targetValue: data.targetValue,
        measuredAt: data.measuredAt ? new Date(data.measuredAt) : undefined,
        notes: data.notes,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        program: { select: { id: true, name: true } },
        doctor: { select: { id: true, firstName: true, lastName: true } },
        outcomeMetric: { select: { id: true, name: true, code: true, unit: true } },
      },
    });

    await createAuditLog({ req, entityType: "PatientOutcome", entityId: outcome.id, action: "CREATE", after: { outcomeMetricId: outcome.outcomeMetricId, patientId: outcome.patientId } });

    // Notify assigned doctor if different from recorder
    if (outcome.doctorId && outcome.doctorId !== req.user!.userId) {
      await prisma.notification.create({
        data: {
          tenantId: req.tenantId!,
          userId: outcome.doctorId,
          title: "New Outcome Recorded",
          message: `${outcome.outcomeMetric?.name ?? "Outcome"} recorded for ${outcome.patient?.firstName} ${outcome.patient?.lastName}.`,
          type: "INFO",
        },
      });
    }

    res.status(201).json({ ...outcome, ...computeImprovements(outcome.baselineValue, outcome.currentValue, outcome.targetValue) });
  } catch (err) { next(err); }
});

// PATCH /api/outcomes/:id
router.patch("/:id", authorizePermission("outcomes", "write"), validateBody(OutcomeSchema.partial()), async (req, res, next) => {
  try {
    const outcome = await prisma.patientOutcome.findFirst({ where: { id: req.params["id"] as string, tenantId: req.tenantId!, deletedAt: null } });
    if (!outcome) throw Errors.notFound("Outcome");
    assertTenantMatch(req, outcome.tenantId);

    const data = req.body as Partial<z.infer<typeof OutcomeSchema>>;
    const updated = await prisma.patientOutcome.update({
      where: { id: outcome.id },
      data: {
        ...(data.outcomeMetricId !== undefined && { outcomeMetricId: data.outcomeMetricId }),
        ...(data.baselineValue !== undefined && { baselineValue: data.baselineValue }),
        ...(data.currentValue !== undefined && { currentValue: data.currentValue }),
        ...(data.targetValue !== undefined && { targetValue: data.targetValue }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.measuredAt !== undefined && { measuredAt: new Date(data.measuredAt!) }),
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        program: { select: { id: true, name: true } },
        doctor: { select: { id: true, firstName: true, lastName: true } },
        outcomeMetric: { select: { id: true, name: true, code: true, unit: true } },
      },
    });

    await createAuditLog({ req, entityType: "PatientOutcome", entityId: outcome.id, action: "UPDATE", before: outcome, after: req.body });
    res.json({ ...updated, ...computeImprovements(updated.baselineValue, updated.currentValue, updated.targetValue) });
  } catch (err) { next(err); }
});

// DELETE /api/outcomes/:id (soft-delete)
router.delete("/:id", authorizePermission("outcomes", "write"), async (req, res, next) => {
  try {
    const outcome = await prisma.patientOutcome.findFirst({ where: { id: req.params["id"] as string, tenantId: req.tenantId!, deletedAt: null } });
    if (!outcome) throw Errors.notFound("Outcome");
    assertTenantMatch(req, outcome.tenantId);
    await prisma.patientOutcome.update({ where: { id: outcome.id }, data: { deletedAt: new Date() } });
    await createAuditLog({ req, entityType: "PatientOutcome", entityId: outcome.id, action: "DELETE", before: outcome });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
