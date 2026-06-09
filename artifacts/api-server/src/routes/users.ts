import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { ADMIN_ROLES } from "../middlewares/rbac.js";
import { requireTenant, assertTenantMatch } from "../middlewares/tenantScope.js";
import { validateBody } from "../middlewares/validate.js";
import { Errors, paginate, paginationMeta } from "../types/index.js";
import { createAuditLog } from "../lib/audit.js";

const ROLE_HIERARCHY: Record<string, string[]> = {
  SUPER_ADMIN: ["SUPER_ADMIN", "AREA_ADMIN", "CLINIC_ADMIN", "DOCTOR", "OPERATOR", "STAFF"],
  AREA_ADMIN: ["CLINIC_ADMIN", "DOCTOR", "OPERATOR", "STAFF"],
  CLINIC_ADMIN: ["DOCTOR", "OPERATOR", "STAFF"],
};

const router = Router();
router.use(authenticate, requireTenant);

const CreateUserSchema = z.object({
  roleId: z.string().uuid(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  mobile: z.string().max(20).optional().nullable(),
  clinicIds: z.array(z.string().uuid()).optional(),
  programIds: z.array(z.string().uuid()).optional(),
});

const UpdateUserSchema = CreateUserSchema.omit({ password: true, email: true }).partial();

const safeUser = { id: true, email: true, firstName: true, lastName: true, mobile: true, avatarUrl: true, status: true, lastLoginAt: true, createdAt: true };

router.get("/", async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const roleId = req.query["roleId"] as string | undefined;
    const clinicId = req.query["clinicId"] as string | undefined;
    const q = req.query["q"] as string | undefined;

    const where: Record<string, unknown> = { tenantId: req.tenantId!, deletedAt: null };
    if (roleId) where["roleId"] = roleId;
    if (clinicId) where["clinicAssignments"] = { some: { clinicId, deletedAt: null } };
    if (q) where["OR"] = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where, skip, take, orderBy: { createdAt: "desc" },
        select: {
          ...safeUser,
          role: { select: { id: true, name: true } },
          clinicAssignments: { where: { deletedAt: null }, include: { clinic: { select: { id: true, name: true } } } },
        },
      }),
    ]);
    res.json({ data: users, meta: paginationMeta(total, page, limit) });
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.params["id"] as string, tenantId: req.tenantId!, deletedAt: null },
      select: {
        ...safeUser,
        role: { select: { id: true, name: true } },
        clinicAssignments: { where: { deletedAt: null }, include: { clinic: { select: { id: true, name: true } } } },
        programAssignments: { where: { deletedAt: null }, include: { program: { select: { id: true, name: true } } } },
      },
    });
    if (!user) throw Errors.notFound("User");
    res.json(user);
  } catch (err) { next(err); }
});

router.post("/", ADMIN_ROLES, validateBody(CreateUserSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof CreateUserSchema>;
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw Errors.conflict("Email already in use");

    // Prevent non-super-admins from creating super admins
    const targetRole = await prisma.role.findUnique({ where: { id: data.roleId } });
    if (!targetRole) throw Errors.notFound("Role");
    
    const userRole = req.user?.role ?? "";
    const allowedRoles = ROLE_HIERARCHY[userRole] || [];
    
    if (!allowedRoles.includes(targetRole.name)) {
      throw Errors.forbidden(`Your role (${userRole}) is not permitted to create users with the ${targetRole.name} role`);
    }

    const hashed = await bcrypt.hash(data.password, 12);
    const { clinicIds, programIds, ...rest } = data;

    const user = await prisma.user.create({
      data: {
        ...rest,
        password: hashed,
        tenantId: req.tenantId!,
        clinicAssignments: clinicIds?.length
          ? { create: clinicIds.map((clinicId) => ({ clinicId })) }
          : undefined,
        programAssignments: programIds?.length
          ? { create: programIds.map((programId) => ({ programId })) }
          : undefined,
      },
      select: { ...safeUser, role: { select: { id: true, name: true } } },
    });

    await createAuditLog({ req, entityType: "User", entityId: user.id, action: "CREATE", after: { email: data.email, roleId: data.roleId } });
    res.status(201).json(user);
  } catch (err) { next(err); }
});

router.patch("/:id", ADMIN_ROLES, validateBody(UpdateUserSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!user) throw Errors.notFound("User");
    assertTenantMatch(req, user.tenantId);

    const { clinicIds, programIds, ...rest } = req.body as z.infer<typeof UpdateUserSchema>;

    // Prevent non-super-admins from assigning SUPER_ADMIN role
    if (rest.roleId) {
      const targetRole = await prisma.role.findUnique({ where: { id: rest.roleId } });
      if (!targetRole) throw Errors.notFound("Role");

      const userRole = req.user?.role ?? "";
      const allowedRoles = ROLE_HIERARCHY[userRole] || [];
      
      if (!allowedRoles.includes(targetRole.name)) {
        throw Errors.forbidden(`Your role (${userRole}) is not permitted to assign the ${targetRole.name} role`);
      }
    }
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: rest,
      select: { ...safeUser, role: { select: { id: true, name: true } } },
    });

    await createAuditLog({ req, entityType: "User", entityId: user.id, action: "UPDATE", before: { roleId: user.roleId }, after: rest });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete("/:id", ADMIN_ROLES, async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!user) throw Errors.notFound("User");
    assertTenantMatch(req, user.tenantId);
    if (user.id === req.user!.userId) throw Errors.forbidden("Cannot deactivate your own account");

    await prisma.user.update({ where: { id: user.id }, data: { deletedAt: new Date(), status: "INACTIVE" } });
    await createAuditLog({ req, entityType: "User", entityId: user.id, action: "DELETE" });
    res.status(204).send();
  } catch (err) { next(err); }
});

// Clinic assignments
router.post("/:id/clinics", ADMIN_ROLES, async (req, res, next) => {
  try {
    const { clinicId } = req.body as { clinicId: string };
    if (!clinicId) throw Errors.validation("clinicId is required");
    await prisma.userClinicAssignment.upsert({
      where: { userId_clinicId: { userId: req.params["id"] as string, clinicId } },
      update: { deletedAt: null },
      create: { userId: req.params["id"] as string, clinicId },
    });
    res.status(201).json({ message: "Clinic assigned" });
  } catch (err) { next(err); }
});

router.delete("/:id/clinics/:clinicId", ADMIN_ROLES, async (req, res, next) => {
  try {
    await prisma.userClinicAssignment.updateMany({
      where: { userId: req.params["id"] as string, clinicId: req.params["clinicId"] as string },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (err) { next(err); }
});

// Program assignments
router.post("/:id/programs", ADMIN_ROLES, async (req, res, next) => {
  try {
    const { programId } = req.body as { programId: string };
    if (!programId) throw Errors.validation("programId is required");
    await prisma.userProgramAssignment.upsert({
      where: { userId_programId: { userId: req.params["id"] as string, programId } },
      update: { deletedAt: null },
      create: { userId: req.params["id"] as string, programId },
    });
    res.status(201).json({ message: "Program assigned" });
  } catch (err) { next(err); }
});

router.delete("/:id/programs/:programId", ADMIN_ROLES, async (req, res, next) => {
  try {
    await prisma.userProgramAssignment.updateMany({
      where: { userId: req.params["id"] as string, programId: req.params["programId"] as string },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
