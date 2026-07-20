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

const AreaSchema = z.object({
  name: z.string().min(1).max(100),
  tenantId: z.string().uuid().optional(),
});

router.get("/", authorizePermission("areas", "read"), async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const q = req.query["q"] as string | undefined;
    const reqTenantId = req.query["tenantId"] as string | undefined;
    const roleScope = await getRoleScope(req, "area");
    const where = {
      deletedAt: null,
      ...(req.tenantId ? { tenantId: req.tenantId } : reqTenantId ? { tenantId: reqTenantId } : {}),
      ...roleScope,
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

router.get("/:id", authorizePermission("areas", "read"), async (req, res, next) => {
  try {
    const roleScope = await getRoleScope(req, "area");
    const area = await prisma.area.findFirst({
      where: { id: req.params["id"] as string, tenantId: req.tenantId!, deletedAt: null, ...roleScope },
      include: { clinics: { where: { deletedAt: null } }, _count: { select: { patients: true } } },
    });
    if (!area) throw Errors.notFound("Area");
    res.json(area);
  } catch (err) { next(err); }
});

router.post("/", authorizePermission("areas", "write"), validateBody(AreaSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof AreaSchema>;
    const targetTenantId = data.tenantId || req.tenantId;
    if (!targetTenantId) throw Errors.badRequest("Tenant ID is required");

    const area = await prisma.area.create({
      data: { tenantId: targetTenantId, name: data.name },
    });
    await createAuditLog({ req, entityType: "Area", entityId: area.id, action: "CREATE", after: data });
    res.status(201).json(area);
  } catch (err) { next(err); }
});

router.patch("/:id", authorizePermission("areas", "write"), validateBody(AreaSchema.partial()), async (req, res, next) => {
  try {
    const area = await prisma.area.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!area) throw Errors.notFound("Area");
    assertTenantMatch(req, area.tenantId);
    const updated = await prisma.area.update({ where: { id: area.id }, data: req.body });
    await createAuditLog({ req, entityType: "Area", entityId: area.id, action: "UPDATE", before: area, after: req.body });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete("/:id", authorizePermission("areas", "write"), async (req, res, next) => {
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
