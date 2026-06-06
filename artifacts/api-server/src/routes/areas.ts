import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { ADMIN_ROLES } from "../middlewares/rbac.js";
import { requireTenant, assertTenantMatch } from "../middlewares/tenantScope.js";
import { validateBody } from "../middlewares/validate.js";
import { Errors, paginate, paginationMeta } from "../types/index.js";
import { createAuditLog } from "../lib/audit.js";

const router = Router();
router.use(authenticate, requireTenant);

const AreaSchema = z.object({ name: z.string().min(1).max(100) });

router.get("/", async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const q = req.query["q"] as string | undefined;
    const where = {
      tenantId: req.tenantId!,
      deletedAt: null,
      ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    };
    const [total, areas] = await Promise.all([
      prisma.area.count({ where }),
      prisma.area.findMany({
        where, skip, take, orderBy: { name: "asc" },
        include: { _count: { select: { clinics: true, patients: true } } },
      }),
    ]);
    res.json({ data: areas, meta: paginationMeta(total, page, limit) });
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const area = await prisma.area.findFirst({
      where: { id: req.params["id"] as string, tenantId: req.tenantId!, deletedAt: null },
      include: { clinics: { where: { deletedAt: null } }, _count: { select: { patients: true } } },
    });
    if (!area) throw Errors.notFound("Area");
    res.json(area);
  } catch (err) { next(err); }
});

router.post("/", ADMIN_ROLES, validateBody(AreaSchema), async (req, res, next) => {
  try {
    const area = await prisma.area.create({
      data: { tenantId: req.tenantId!, name: req.body.name },
    });
    await createAuditLog({ req, entityType: "Area", entityId: area.id, action: "CREATE", after: req.body });
    res.status(201).json(area);
  } catch (err) { next(err); }
});

router.patch("/:id", ADMIN_ROLES, validateBody(AreaSchema.partial()), async (req, res, next) => {
  try {
    const area = await prisma.area.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!area) throw Errors.notFound("Area");
    assertTenantMatch(req, area.tenantId);
    const updated = await prisma.area.update({ where: { id: area.id }, data: req.body });
    await createAuditLog({ req, entityType: "Area", entityId: area.id, action: "UPDATE", before: area, after: req.body });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete("/:id", ADMIN_ROLES, async (req, res, next) => {
  try {
    const area = await prisma.area.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!area) throw Errors.notFound("Area");
    assertTenantMatch(req, area.tenantId);
    await prisma.area.update({ where: { id: area.id }, data: { deletedAt: new Date() } });
    await createAuditLog({ req, entityType: "Area", entityId: area.id, action: "DELETE" });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
