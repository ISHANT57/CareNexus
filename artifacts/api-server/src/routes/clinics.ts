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

const ClinicSchema = z.object({
  tenantId: z.string().uuid().optional(),
  areaId: z.string().uuid(),
  name: z.string().min(1).max(100),
  address: z.string().max(500).optional().nullable(),
});

router.get("/", authorizePermission("clinics", "read"), async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const areaId = req.query["areaId"] as string | undefined;
    const q = req.query["q"] as string | undefined;
    const reqTenantId = req.query["tenantId"] as string | undefined;
    const where = {
      deletedAt: null,
      ...(req.tenantId ? { tenantId: req.tenantId } : reqTenantId ? { tenantId: reqTenantId } : {}),
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

router.get("/:id", authorizePermission("clinics", "read"), async (req, res, next) => {
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

router.post("/", authorizePermission("clinics", "write"), validateBody(ClinicSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof ClinicSchema>;
    // HIGH-008: non-super-admins may only create within their own tenant
    const isSuperAdmin = req.user?.role === "SUPER_ADMIN";
    if (!isSuperAdmin && data.tenantId && data.tenantId !== req.tenantId) {
      throw Errors.forbidden("You cannot create clinics in another tenant");
    }
    let targetTenantId = isSuperAdmin ? (data.tenantId || req.tenantId) : req.tenantId;

    if (!targetTenantId) {
      // If SUPER_ADMIN didn't pass tenantId, infer it from the Area
      const area = await prisma.area.findUnique({ where: { id: data.areaId } });
      if (!area || area.deletedAt) throw Errors.notFound("Area");
      targetTenantId = area.tenantId;
    }

    const area = await prisma.area.findFirst({ where: { id: data.areaId, tenantId: targetTenantId, deletedAt: null } });
    if (!area) throw Errors.notFound("Area");
    
    const clinic = await prisma.clinic.create({ data: { ...data, tenantId: targetTenantId } });
    await createAuditLog({ req, entityType: "Clinic", entityId: clinic.id, action: "CREATE", after: data });
    res.status(201).json(clinic);
  } catch (err) { next(err); }
});

router.patch("/:id", authorizePermission("clinics", "write"), validateBody(ClinicSchema.partial()), async (req, res, next) => {
  try {
    const clinicScope = await getRoleScope(req, "clinic");
    const clinic = await prisma.clinic.findFirst({ where: { AND: [{ id: req.params["id"] as string, deletedAt: null }, clinicScope] } });
    if (!clinic) throw Errors.notFound("Clinic");
    assertTenantMatch(req, clinic.tenantId);

    let updateData = req.body;
    if (updateData.areaId && updateData.areaId !== clinic.areaId) {
      const area = await prisma.area.findFirst({ where: { id: updateData.areaId, tenantId: clinic.tenantId, deletedAt: null } });
      if (!area) throw Errors.validation("Area does not belong to this tenant");
    }

    const updated = await prisma.clinic.update({ where: { id: clinic.id }, data: updateData });
    await createAuditLog({ req, entityType: "Clinic", entityId: clinic.id, action: "UPDATE", before: clinic, after: updateData });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete("/:id", authorizePermission("clinics", "write"), async (req, res, next) => {
  try {
    const clinicScope = await getRoleScope(req, "clinic");
    const clinic = await prisma.clinic.findFirst({ where: { AND: [{ id: req.params["id"] as string, deletedAt: null }, clinicScope] } });
    if (!clinic) throw Errors.notFound("Clinic");
    assertTenantMatch(req, clinic.tenantId);
    await prisma.clinic.update({ where: { id: clinic.id }, data: { deletedAt: new Date() } });
    await createAuditLog({ req, entityType: "Clinic", entityId: clinic.id, action: "DELETE" });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
