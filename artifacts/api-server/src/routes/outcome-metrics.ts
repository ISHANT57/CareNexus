import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { authorizePermission } from "../middlewares/rbac.js";
import { requireTenant, assertTenantMatch } from "../middlewares/tenantScope.js";
import { validateBody } from "../middlewares/validate.js";
import { Errors, paginate, paginationMeta } from "../types/index.js";
import { createAuditLog } from "../lib/audit.js";

const router = Router();
router.use(authenticate, requireTenant);

const MetricSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(50),
  unit: z.string().min(1).max(30),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

// GET /api/outcome-metrics
router.get("/", authorizePermission("outcomes", "read"), async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const where = { tenantId: req.tenantId!, ...(req.query["inactive"] !== "true" ? { isActive: true } : {}) };
    const [total, metrics] = await Promise.all([
      prisma.outcomeMetric.count({ where }),
      prisma.outcomeMetric.findMany({ where, skip, take, orderBy: [{ category: "asc" }, { name: "asc" }] }),
    ]);
    res.json({ data: metrics, meta: paginationMeta(total, page, limit) });
  } catch (err) { next(err); }
});

// GET /api/outcome-metrics/:id
router.get("/:id", authorizePermission("outcomes", "read"), async (req, res, next) => {
  try {
    const metric = await prisma.outcomeMetric.findFirst({
      where: { id: req.params["id"] as string, tenantId: req.tenantId! },
    });
    if (!metric) throw Errors.notFound("OutcomeMetric");
    res.json(metric);
  } catch (err) { next(err); }
});

// POST /api/outcome-metrics
router.post("/", authorizePermission("outcomes", "write"), validateBody(MetricSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof MetricSchema>;
    const existing = await prisma.outcomeMetric.findUnique({
      where: { tenantId_code: { tenantId: req.tenantId!, code: data.code.toUpperCase() } },
    });
    if (existing) throw Errors.conflict(`Metric with code '${data.code}' already exists`);
    const metric = await prisma.outcomeMetric.create({
      data: { ...data, code: data.code.toUpperCase(), tenantId: req.tenantId! },
    });
    await createAuditLog({ req, entityType: "OutcomeMetric", entityId: metric.id, action: "CREATE", after: { code: metric.code, name: metric.name } });
    res.status(201).json(metric);
  } catch (err) { next(err); }
});

// PATCH /api/outcome-metrics/:id
router.patch("/:id", authorizePermission("outcomes", "write"), validateBody(MetricSchema.partial()), async (req, res, next) => {
  try {
    const metric = await prisma.outcomeMetric.findFirst({ where: { id: req.params["id"] as string, tenantId: req.tenantId! } });
    if (!metric) throw Errors.notFound("OutcomeMetric");
    assertTenantMatch(req, metric.tenantId);
    const updated = await prisma.outcomeMetric.update({ where: { id: metric.id }, data: req.body });
    await createAuditLog({ req, entityType: "OutcomeMetric", entityId: metric.id, action: "UPDATE", before: metric, after: req.body });
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/outcome-metrics/:id (soft deactivate)
router.delete("/:id", authorizePermission("outcomes", "write"), async (req, res, next) => {
  try {
    const metric = await prisma.outcomeMetric.findFirst({ where: { id: req.params["id"] as string, tenantId: req.tenantId! } });
    if (!metric) throw Errors.notFound("OutcomeMetric");
    assertTenantMatch(req, metric.tenantId);
    await prisma.outcomeMetric.update({ where: { id: metric.id }, data: { isActive: false } });
    await createAuditLog({ req, entityType: "OutcomeMetric", entityId: metric.id, action: "DELETE", before: metric });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
