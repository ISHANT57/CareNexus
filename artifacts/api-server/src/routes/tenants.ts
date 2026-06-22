import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { requireTenant } from "../middlewares/tenantScope.js";
import { SUPER_ADMIN_ONLY } from "../middlewares/rbac.js";
import { validateBody } from "../middlewares/validate.js";
import { Errors, paginate, paginationMeta } from "../types/index.js";
import { createAuditLog } from "../lib/audit.js";

const router = Router();
router.use(authenticate);
router.use(requireTenant);

const TenantSchema = z.object({
  name: z.string().min(2).max(100),
  domain: z.string().min(2).max(255),
  logoUrl: z.string().url().optional().nullable(),
  onboardingSmsTemplate: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

const UpdateTenantSchema = TenantSchema.partial();

const OnboardTenantSchema = z.object({
  tenant: TenantSchema,
  areas: z.array(z.string().min(1).max(100)),
  clinics: z.array(z.object({
    name: z.string().min(1).max(100),
    areaIndex: z.number().int().min(0),
  })),
  adminUser: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

// GET /api/tenants
router.get("/", async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const q = req.query["q"] as string | undefined;

    const where = {
      deletedAt: null,
      ...(req.tenantId ? { id: req.tenantId } : {}),
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
          _count: { select: { users: true, patients: true, areas: true, clinics: true } },
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
    // HIGH-004: non-super-admins may only read their own tenant's metadata
    if (req.user?.role !== "SUPER_ADMIN" && req.params["id"] !== req.tenantId) {
      throw Errors.forbidden("You do not have access to this tenant");
    }
    const tenant = await prisma.tenant.findFirst({
      where: { id: req.params["id"] as string, deletedAt: null },
      include: { _count: { select: { users: true, patients: true, areas: true, clinics: true, programs: true } } },
    });
    if (!tenant) throw Errors.notFound("Tenant");
    res.json(tenant);
  } catch (err) {
    next(err);
  }
});

// POST /api/tenants
router.post("/", SUPER_ADMIN_ONLY, validateBody(TenantSchema), async (req, res, next) => {
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

// POST /api/tenants/onboard
router.post("/onboard", SUPER_ADMIN_ONLY, validateBody(OnboardTenantSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof OnboardTenantSchema>;
    const existing = await prisma.tenant.findUnique({ where: { domain: data.tenant.domain } });
    if (existing) throw Errors.conflict("Domain already in use");

    const existingUser = await prisma.user.findUnique({ where: { email: data.adminUser.email } });
    if (existingUser) throw Errors.conflict("Admin email already in use");

    const role = await prisma.role.findFirst({ where: { name: "CLINIC_ADMIN" } });
    if (!role) throw Errors.notFound("CLINIC_ADMIN role not found");

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Tenant
      const tenant = await tx.tenant.create({ data: data.tenant });

      // 2. Create Areas
      const createdAreas = await Promise.all(
        data.areas.map(name => tx.area.create({ data: { name, tenantId: tenant.id } }))
      );

      // 3. Create Clinics
      const createdClinics = await Promise.all(
        data.clinics.map(c => tx.clinic.create({
          data: { name: c.name, areaId: createdAreas[c.areaIndex]!.id, tenantId: tenant.id }
        }))
      );

      // 4. Create Clinic Admin
      const { default: bcrypt } = await import("bcryptjs");
      const hashed = await bcrypt.hash(data.adminUser.password, 12);
      const admin = await tx.user.create({
        data: {
          ...data.adminUser,
          password: hashed,
          roleId: role.id,
          tenantId: tenant.id,
          clinicAssignments: {
            create: createdClinics.map(c => ({ clinicId: c.id }))
          }
        }
      });

      return { tenant, areas: createdAreas, clinics: createdClinics, admin };
    });

    await createAuditLog({ req, entityType: "Tenant", entityId: result.tenant.id, action: "CREATE", after: data });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tenants/:id
router.patch("/:id", SUPER_ADMIN_ONLY, validateBody(UpdateTenantSchema), async (req, res, next) => {
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
router.delete("/:id", SUPER_ADMIN_ONLY, async (req, res, next) => {
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
