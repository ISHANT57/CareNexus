import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { CLINICAL_ROLES, ADMIN_ROLES } from "../middlewares/rbac.js";
import { requireTenant, assertTenantMatch } from "../middlewares/tenantScope.js";
import { Errors, paginate, paginationMeta } from "../types/index.js";
import { createAuditLog } from "../lib/audit.js";
import { calculateRiskScore, calculateAndPersistRisk, calculateAllPatientRisks } from "../services/RiskScoringService.js";

const router = Router();
router.use(authenticate, requireTenant);

// GET /api/risk-scores — list patients with their risk scores
router.get("/", CLINICAL_ROLES, async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const { riskLevel } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { tenantId: req.tenantId!, deletedAt: null };
    if (riskLevel) where["riskLevel"] = riskLevel;

    const [total, patients] = await Promise.all([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where, skip, take,
        orderBy: [{ riskScore: "desc" }, { lastName: "asc" }],
        select: {
          id: true, firstName: true, lastName: true, nhsNumber: true,
          riskScore: true, riskLevel: true, lastCalculatedAt: true,
          clinic: { select: { id: true, name: true } },
          program: { select: { id: true, name: true } },
        },
      }),
    ]);
    res.json({ data: patients, meta: paginationMeta(total, page, limit) });
  } catch (err) { next(err); }
});

// GET /api/risk-scores/:patientId — get risk details for a patient
router.get("/:patientId", CLINICAL_ROLES, async (req, res, next) => {
  try {
    const patient = await prisma.patient.findFirst({
      where: { id: req.params["patientId"] as string, tenantId: req.tenantId!, deletedAt: null },
      select: { id: true, firstName: true, lastName: true, nhsNumber: true, riskScore: true, riskLevel: true, lastCalculatedAt: true },
    });
    if (!patient) throw Errors.notFound("Patient");
    const { factors } = await calculateRiskScore(patient.id, req.tenantId!);
    res.json({ ...patient, factors });
  } catch (err) { next(err); }
});

// POST /api/risk-scores/:patientId/calculate — recalculate one patient
router.post("/:patientId/calculate", CLINICAL_ROLES, async (req, res, next) => {
  try {
    const patient = await prisma.patient.findFirst({
      where: { id: req.params["patientId"] as string, tenantId: req.tenantId!, deletedAt: null },
    });
    if (!patient) throw Errors.notFound("Patient");

    await calculateAndPersistRisk(patient.id, req.tenantId!);
    const updated = await prisma.patient.findUnique({
      where: { id: patient.id },
      select: { id: true, firstName: true, lastName: true, riskScore: true, riskLevel: true, lastCalculatedAt: true },
    });

    await createAuditLog({ req, entityType: "Patient", entityId: patient.id, action: "UPDATE", after: { riskScore: updated?.riskScore, riskLevel: updated?.riskLevel } });
    res.json(updated);
  } catch (err) { next(err); }
});

// POST /api/risk-scores/recalculate-all — bulk recalculate for entire tenant
router.post("/recalculate-all", ADMIN_ROLES, async (req, res, next) => {
  try {
    const result = await calculateAllPatientRisks(req.tenantId!);
    await createAuditLog({ req, entityType: "System", entityId: req.tenantId!, action: "UPDATE", after: { action: "bulk-risk-recalculation", ...result } });
    res.json({ ok: true, ...result });
  } catch (err) { next(err); }
});

export { router as riskScoresRouter };
