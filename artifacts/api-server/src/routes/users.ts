import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { authorizePermission } from "../middlewares/rbac.js";
import { requireTenant, assertTenantMatch } from "../middlewares/tenantScope.js";
import { validateBody } from "../middlewares/validate.js";
import { Errors, paginate, paginationMeta } from "../types/index.js";
import { createAuditLog } from "../lib/audit.js";
import { getRoleScope } from "../middlewares/roleScope.js";

const ROLE_HIERARCHY: Record<string, string[]> = {
  SUPER_ADMIN: ["SUPER_ADMIN", "AREA_ADMIN", "CLINIC_ADMIN", "DOCTOR", "OPERATOR", "STAFF"],
  AREA_ADMIN: ["CLINIC_ADMIN", "DOCTOR", "OPERATOR", "STAFF"],
  CLINIC_ADMIN: ["DOCTOR", "OPERATOR", "STAFF"],
};

const router = Router();
router.use(authenticate, requireTenant);

const CreateUserSchema = z.object({
  tenantId: z.string().uuid().optional(),
  roleId: z.string().uuid(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  mobile: z.string().max(20).optional().nullable(),
  clinicIds: z.array(z.string().uuid()).optional(),
  programIds: z.array(z.string().uuid()).optional(),
});

const UpdateUserSchema = CreateUserSchema.omit({ password: true, email: true }).partial().extend({
  emailVerified: z.boolean().optional(),
});

const safeUser = { id: true, email: true, firstName: true, lastName: true, mobile: true, avatarUrl: true, status: true, lastLoginAt: true, emailVerified: true, createdAt: true };

router.get("/", authorizePermission("users", "read"), async (req, res, next) => {
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
          tenant: { select: { id: true, name: true } },
          role: { select: { id: true, name: true } },
          clinicAssignments: { where: { deletedAt: null }, include: { clinic: { select: { id: true, name: true } } } },
        },
      }),
    ]);
    res.json({ data: users, meta: paginationMeta(total, page, limit) });
  } catch (err) { next(err); }
});

router.get("/:id", authorizePermission("users", "read"), async (req, res, next) => {
  try {
    const userScope = await getRoleScope(req, "user");
    const user = await prisma.user.findFirst({
      where: { id: req.params["id"] as string, tenantId: req.tenantId!, deletedAt: null, ...userScope },
      select: {
        ...safeUser,
        tenant: { select: { id: true, name: true } },
        role: { select: { id: true, name: true } },
        clinicAssignments: { where: { deletedAt: null }, include: { clinic: { select: { id: true, name: true } } } },
        programAssignments: { where: { deletedAt: null }, include: { program: { select: { id: true, name: true } } } },
      },
    });
    if (!user) throw Errors.notFound("User");
    res.json(user);
  } catch (err) { next(err); }
});

router.post("/", authorizePermission("users", "write"), validateBody(CreateUserSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof CreateUserSchema>;
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw Errors.conflict("Email already in use");

    // HIGH-008: non-super-admins may only create users within their own tenant
    const isSuperAdmin = req.user?.role === "SUPER_ADMIN";
    if (!isSuperAdmin && data.tenantId && data.tenantId !== req.tenantId) {
      throw Errors.forbidden("You cannot create users in another tenant");
    }
    const targetTenantId = isSuperAdmin ? (data.tenantId || req.tenantId) : req.tenantId;
    if (!targetTenantId) throw Errors.badRequest("Tenant ID is required");

    // CRIT-005: target role must exist within the target tenant (or be a system role)
    const targetRole = await prisma.role.findFirst({ where: { id: data.roleId, OR: [{ tenantId: targetTenantId }, { isSystem: true }] } });
    if (!targetRole) throw Errors.notFound("Role");

    // CRIT-005: role hierarchy — cannot create a user with a role above your own
    const userRole = req.user?.role ?? "";
    const allowedRoles = ROLE_HIERARCHY[userRole] || [];
    if (!allowedRoles.includes(targetRole.name)) {
      throw Errors.forbidden(`Your role (${userRole}) is not permitted to create users with the ${targetRole.name} role`);
    }

    const hashed = await bcrypt.hash(data.password, 12);

    const { clinicIds, programIds, tenantId, ...rest } = data;

    const user = await prisma.user.create({
      data: {
        ...rest,
        password: hashed,
        tenantId: targetTenantId,
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

router.patch("/:id", authorizePermission("users", "write"), validateBody(UpdateUserSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({ where: { id: req.params["id"] as string, tenantId: req.tenantId!, deletedAt: null } });
    if (!user) throw Errors.notFound("User");
    assertTenantMatch(req, user.tenantId);

    const { clinicIds, programIds, ...rest } = req.body as z.infer<typeof UpdateUserSchema>;

    // Only SUPER_ADMIN may manually change a user's email-verified status.
    if (rest.emailVerified !== undefined && req.user?.role !== "SUPER_ADMIN") {
      throw Errors.forbidden("Only a Super Admin can change email verification status");
    }
    // Clearing the verification token alongside mirrors the token-based verify flow.
    const verificationPatch =
      rest.emailVerified === true ? { verificationToken: null } : {};

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
      data: { ...rest, ...verificationPatch },
      select: { ...safeUser, role: { select: { id: true, name: true } } },
    });

    await createAuditLog({ req, entityType: "User", entityId: user.id, action: "UPDATE", before: { roleId: user.roleId }, after: rest });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete("/:id", authorizePermission("users", "write"), async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({ where: { id: req.params["id"] as string, tenantId: req.tenantId!, deletedAt: null } });
    if (!user) throw Errors.notFound("User");
    assertTenantMatch(req, user.tenantId);
    if (user.id === req.user!.userId) throw Errors.forbidden("Cannot deactivate your own account");

    await prisma.user.update({ where: { id: user.id }, data: { deletedAt: new Date(), status: "INACTIVE" } });
    await createAuditLog({ req, entityType: "User", entityId: user.id, action: "DELETE" });
    res.status(204).send();
  } catch (err) { next(err); }
});

// Clinic assignments
router.post("/:id/clinics", authorizePermission("users", "write"), async (req, res, next) => {
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

router.delete("/:id/clinics/:clinicId", authorizePermission("users", "write"), async (req, res, next) => {
  try {
    await prisma.userClinicAssignment.updateMany({
      where: { userId: req.params["id"] as string, clinicId: req.params["clinicId"] as string },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (err) { next(err); }
});

// Program assignments
router.post("/:id/programs", authorizePermission("users", "write"), async (req, res, next) => {
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

router.delete("/:id/programs/:programId", authorizePermission("users", "write"), async (req, res, next) => {
  try {
    await prisma.userProgramAssignment.updateMany({
      where: { userId: req.params["id"] as string, programId: req.params["programId"] as string },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
