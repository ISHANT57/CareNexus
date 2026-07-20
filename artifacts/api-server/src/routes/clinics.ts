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
    const roleScope = await getRoleScope(req, "clinic");
    const where = {
      deletedAt: null,
      ...(req.tenantId ? { tenantId: req.tenantId } : reqTenantId ? { tenantId: reqTenantId } : {}),
      ...roleScope,
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
    const roleScope = await getRoleScope(req, "clinic");
    const clinic = await prisma.clinic.findFirst({
      where: { id: req.params["id"] as string, tenantId: req.tenantId!, deletedAt: null, ...roleScope },
      include: {
        area: { select: { id: true, name: true } },
        userClinicAssignments: {
          where: { deletedAt: null },
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, mobile: true } } },
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
    let targetTenantId = data.tenantId || req.tenantId;

    if (!targetTenantId) {
      // If SUPER_ADMIN didn't pass tenantId, infer it from the Area
      const area = await prisma.area.findUnique({ where: { id: data.areaId } });
      if (!area || area.deletedAt) throw Errors.notFound("Area");
      targetTenantId = area.tenantId;
    }

    const area = await prisma.area.findFirst({ where: { id: data.areaId, tenantId: targetTenantId, deletedAt: null } });
    if (!area) throw Errors.validation("Area does not belong to this tenant");
    
    const clinic = await prisma.clinic.create({ data: { ...data, tenantId: targetTenantId } });

    // Auto-assign existing CLINIC_ADMINs of the tenant to the new clinic,
    // and AREA_ADMINs if applicable.
    const tenantAdmins = await prisma.userTenantAssignment.findMany({
      where: {
        tenantId: targetTenantId,
        role: { name: { in: ["CLINIC_ADMIN", "AREA_ADMIN"] } },
        status: "ACTIVE",
        user: { deletedAt: null }
      },
      include: { role: true }
    });

    for (const assignment of tenantAdmins) {
      let shouldAssign = assignment.role.name === "CLINIC_ADMIN";

      if (assignment.role.name === "AREA_ADMIN") {
        if (req.user && assignment.userId === req.user.userId) {
          shouldAssign = true;
        } else {
          const hasAreaAssignment = await prisma.userClinicAssignment.findFirst({
            where: {
              userId: assignment.userId,
              deletedAt: null,
              clinic: { areaId: clinic.areaId }
            }
          });
          if (hasAreaAssignment) {
            shouldAssign = true;
          }
        }
      }

      if (shouldAssign) {
        await prisma.userClinicAssignment.upsert({
          where: {
            userId_clinicId: {
              userId: assignment.userId,
              clinicId: clinic.id
            }
          },
          update: { deletedAt: null },
          create: {
            userId: assignment.userId,
            clinicId: clinic.id
          }
        });
      }
    }

    await createAuditLog({ req, entityType: "Clinic", entityId: clinic.id, action: "CREATE", after: data });
    res.status(201).json(clinic);
  } catch (err) { next(err); }
});

router.patch("/:id", authorizePermission("clinics", "write"), validateBody(ClinicSchema.partial()), async (req, res, next) => {
  try {
    const clinic = await prisma.clinic.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!clinic) throw Errors.notFound("Clinic");
    assertTenantMatch(req, clinic.tenantId);
    
    let updateData = req.body;
    if (updateData.areaId && updateData.areaId !== clinic.areaId) {
      const area = await prisma.area.findFirst({ where: { id: updateData.areaId, tenantId: clinic.tenantId, deletedAt: null } });
      if (!area) throw Errors.validation("Area does not belong to this tenant");
      // ensure clinic is moved to the new area's tenant
      updateData.tenantId = area.tenantId;
    }

    const updated = await prisma.clinic.update({ where: { id: clinic.id }, data: updateData });
    await createAuditLog({ req, entityType: "Clinic", entityId: clinic.id, action: "UPDATE", before: clinic, after: updateData });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete("/:id", authorizePermission("clinics", "write"), async (req, res, next) => {
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
