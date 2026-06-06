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

const ClinicSchema = z.object({
  areaId: z.string().uuid(),
  name: z.string().min(1).max(100),
  address: z.string().max(500).optional().nullable(),
});

router.get("/", async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const areaId = req.query["areaId"] as string | undefined;
    const q = req.query["q"] as string | undefined;
    const where = {
      tenantId: req.tenantId!,
      deletedAt: null,
      ...(areaId ? { areaId } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    };
    const [total, clinics] = await Promise.all([
      prisma.clinic.count({ where }),
      prisma.clinic.findMany({
        where, skip, take, orderBy: { name: "asc" },
        include: {
          area: { select: { id: true, name: true } },
          _count: { select: { patients: true, userClinicAssignments: true } },
        },
      }),
    ]);
    res.json({ data: clinics, meta: paginationMeta(total, page, limit) });
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const clinic = await prisma.clinic.findFirst({
      where: { id: req.params["id"] as string, tenantId: req.tenantId!, deletedAt: null },
      include: {
        area: { select: { id: true, name: true } },
        userClinicAssignments: {
          where: { deletedAt: null },
          include: { user: { select: { id: true, firstName: true, lastName: true, role: { select: { name: true } } } } },
        },
        _count: { select: { patients: true } },
      },
    });
    if (!clinic) throw Errors.notFound("Clinic");
    res.json(clinic);
  } catch (err) { next(err); }
});

router.post("/", ADMIN_ROLES, validateBody(ClinicSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof ClinicSchema>;
    const area = await prisma.area.findFirst({ where: { id: data.areaId, tenantId: req.tenantId!, deletedAt: null } });
    if (!area) throw Errors.notFound("Area");
    const clinic = await prisma.clinic.create({ data: { ...data, tenantId: req.tenantId! } });
    await createAuditLog({ req, entityType: "Clinic", entityId: clinic.id, action: "CREATE", after: data });
    res.status(201).json(clinic);
  } catch (err) { next(err); }
});

router.patch("/:id", ADMIN_ROLES, validateBody(ClinicSchema.partial()), async (req, res, next) => {
  try {
    const clinic = await prisma.clinic.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!clinic) throw Errors.notFound("Clinic");
    assertTenantMatch(req, clinic.tenantId);
    const updated = await prisma.clinic.update({ where: { id: clinic.id }, data: req.body });
    await createAuditLog({ req, entityType: "Clinic", entityId: clinic.id, action: "UPDATE", before: clinic, after: req.body });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete("/:id", ADMIN_ROLES, async (req, res, next) => {
  try {
    const clinic = await prisma.clinic.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!clinic) throw Errors.notFound("Clinic");
    assertTenantMatch(req, clinic.tenantId);
    await prisma.clinic.update({ where: { id: clinic.id }, data: { deletedAt: new Date() } });
    await createAuditLog({ req, entityType: "Clinic", entityId: clinic.id, action: "DELETE" });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
