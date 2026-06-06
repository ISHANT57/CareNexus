import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { SUPER_ADMIN_ONLY } from "../middlewares/rbac.js";
import { validateBody } from "../middlewares/validate.js";
import { Errors, paginate, paginationMeta } from "../types/index.js";
import { createAuditLog } from "../lib/audit.js";

const router = Router();
router.use(authenticate, SUPER_ADMIN_ONLY);

const TenantSchema = z.object({
  name: z.string().min(2).max(100),
  domain: z.string().min(2).max(255),
  logoUrl: z.string().url().optional().nullable(),
  onboardingSmsTemplate: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

const UpdateTenantSchema = TenantSchema.partial();

// GET /api/tenants
router.get("/", async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const q = req.query["q"] as string | undefined;

    const where = {
      deletedAt: null,
      ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    };

    const [total, tenants] = await Promise.all([
      prisma.tenant.count({ where }),
      prisma.tenant.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { users: true, patients: true, areas: true } },
        },
      }),
    ]);

    res.json({ data: tenants, meta: paginationMeta(total, page, limit) });
  } catch (err) {
    next(err);
  }
});

// GET /api/tenants/:id
router.get("/:id", async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: { id: req.params["id"] as string, deletedAt: null },
      include: { _count: { select: { users: true, patients: true, areas: true, programs: true } } },
    });
    if (!tenant) throw Errors.notFound("Tenant");
    res.json(tenant);
  } catch (err) {
    next(err);
  }
});

// POST /api/tenants
router.post("/", validateBody(TenantSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof TenantSchema>;
    const existing = await prisma.tenant.findUnique({ where: { domain: data.domain } });
    if (existing) throw Errors.conflict("Domain already in use");

    const tenant = await prisma.tenant.create({ data });
    await createAuditLog({ req, entityType: "Tenant", entityId: tenant.id, action: "CREATE", after: data });
    res.status(201).json(tenant);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tenants/:id
router.patch("/:id", validateBody(UpdateTenantSchema), async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!tenant) throw Errors.notFound("Tenant");

    const updated = await prisma.tenant.update({ where: { id: tenant.id }, data: req.body });
    await createAuditLog({ req, entityType: "Tenant", entityId: tenant.id, action: "UPDATE", before: tenant, after: req.body });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tenants/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!tenant) throw Errors.notFound("Tenant");

    await prisma.tenant.update({ where: { id: tenant.id }, data: { deletedAt: new Date() } });
    await createAuditLog({ req, entityType: "Tenant", entityId: tenant.id, action: "DELETE" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
