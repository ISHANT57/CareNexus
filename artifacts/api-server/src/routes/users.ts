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

const UpdateUserSchema = CreateUserSchema.omit({ password: true, email: true }).partial();

const safeUser = { id: true, email: true, firstName: true, lastName: true, mobile: true, avatarUrl: true, status: true, lastLoginAt: true, createdAt: true };

router.get("/", authorizePermission("users", "read"), async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const roleId = req.query["roleId"] as string | undefined;
    const clinicId = req.query["clinicId"] as string | undefined;
    const q = req.query["q"] as string | undefined;

    const roleScope = await getRoleScope(req, "user");
    const where: Record<string, unknown> = { tenantAssignments: { some: { tenantId: req.tenantId!, status: 'ACTIVE' } }, deletedAt: null, ...roleScope };
    if (roleId) where["tenantAssignments"] = { some: { tenantId: req.tenantId!, roleId, status: 'ACTIVE' } };
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
          tenantAssignments: { where: { tenantId: req.tenantId! }, include: { tenant: { select: { id: true, name: true } }, role: { select: { id: true, name: true } } } },
          clinicAssignments: { where: { deletedAt: null }, include: { clinic: { select: { id: true, name: true } } } },
        },
      }),
    ]);
    res.json({ data: users, meta: paginationMeta(total, page, limit) });
  } catch (err) { next(err); }
});

router.get("/:id", authorizePermission("users", "read"), async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.params["id"] as string, tenantAssignments: { some: { tenantId: req.tenantId! } }, deletedAt: null },
      select: {
        ...safeUser,
        tenantAssignments: { where: { tenantId: req.tenantId! }, include: { tenant: { select: { id: true, name: true } }, role: { select: { id: true, name: true } } } },
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
    const targetTenantId = data.tenantId || req.tenantId;
    if (!targetTenantId) throw Errors.badRequest("Tenant ID is required");

    const role = await prisma.role.findUnique({ where: { id: data.roleId } });
    if (!role) throw Errors.notFound("Role");

    let user = await prisma.user.findUnique({ where: { email: data.email } });
    if (user) {
      const existingAssignment = await prisma.userTenantAssignment.findUnique({
        where: { userId_tenantId: { userId: user.id, tenantId: targetTenantId } }
      });
      if (existingAssignment) {
        throw Errors.conflict("User is already assigned to this tenant");
      }

      await prisma.userTenantAssignment.create({
        data: { userId: user.id, tenantId: targetTenantId, roleId: data.roleId }
      });

      if (role.name === "CLINIC_ADMIN") {
        const tenantClinics = await prisma.clinic.findMany({
          where: { tenantId: targetTenantId, deletedAt: null }
        });
        for (const clinic of tenantClinics) {
          await prisma.userClinicAssignment.upsert({
            where: { userId_clinicId: { userId: user.id, clinicId: clinic.id } },
            update: { deletedAt: null },
            create: { userId: user.id, clinicId: clinic.id }
          });
        }
      }

      await createAuditLog({ req, entityType: "UserTenantAssignment", entityId: user.id, action: "CREATE", after: { email: data.email, roleId: data.roleId, tenantId: targetTenantId } });
      res.status(200).json({ message: "Existing user linked to tenant", id: user.id });
      return;
    }

    const { clinicIds, programIds, tenantId, roleId, ...rest } = data;
    const hashed = await bcrypt.hash(data.password, 12);

    let finalClinicIds = clinicIds || [];
    if (role.name === "CLINIC_ADMIN") {
      const tenantClinics = await prisma.clinic.findMany({
        where: { tenantId: targetTenantId, deletedAt: null },
        select: { id: true }
      });
      finalClinicIds = Array.from(new Set([...finalClinicIds, ...tenantClinics.map(c => c.id)]));
    }

    const newUser = await prisma.user.create({
      data: {
        ...rest,
        password: hashed,
        tenantAssignments: {
          create: { tenantId: targetTenantId, roleId: data.roleId }
        },
        clinicAssignments: finalClinicIds.length
          ? { create: finalClinicIds.map((clinicId) => ({ clinicId })) }
          : undefined,
        programAssignments: programIds?.length
          ? { create: programIds.map((programId) => ({ programId })) }
          : undefined,
      },
      select: { ...safeUser, tenantAssignments: { include: { role: { select: { id: true, name: true } } } } },
    });

    await createAuditLog({ req, entityType: "User", entityId: newUser.id, action: "CREATE", after: { email: data.email, roleId: data.roleId } });
    res.status(201).json(newUser);
  } catch (err) { next(err); }
});

router.patch("/:id", authorizePermission("users", "write"), validateBody(UpdateUserSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!user) throw Errors.notFound("User");
    const assignment = await prisma.userTenantAssignment.findUnique({ where: { userId_tenantId: { userId: user.id, tenantId: req.tenantId! } } });
    if (!assignment && req.user?.role !== "SUPER_ADMIN") throw Errors.tenantMismatch();

    const { clinicIds, programIds, roleId, ...rest } = req.body as z.infer<typeof UpdateUserSchema>;

    // Prevent non-super-admins from assigning SUPER_ADMIN role
    if (roleId) {
      const targetRole = await prisma.role.findUnique({ where: { id: roleId } });
      if (!targetRole) throw Errors.notFound("Role");

      const userRole = req.user?.role ?? "";
      const allowedRoles = ROLE_HIERARCHY[userRole] || [];
      
      if (!allowedRoles.includes(targetRole.name)) {
        throw Errors.forbidden(`Your role (${userRole}) is not permitted to assign the ${targetRole.name} role`);
      }
      
      await prisma.userTenantAssignment.update({
        where: { userId_tenantId: { userId: user.id, tenantId: req.tenantId! } },
        data: { roleId }
      });

      if (targetRole.name === "CLINIC_ADMIN") {
        const tenantClinics = await prisma.clinic.findMany({
          where: { tenantId: req.tenantId!, deletedAt: null }
        });
        for (const clinic of tenantClinics) {
          await prisma.userClinicAssignment.upsert({
            where: { userId_clinicId: { userId: user.id, clinicId: clinic.id } },
            update: { deletedAt: null },
            create: { userId: user.id, clinicId: clinic.id }
          });
        }
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: rest,
      select: { ...safeUser, tenantAssignments: { where: { tenantId: req.tenantId! }, include: { role: { select: { id: true, name: true } } } } },
    });

    await createAuditLog({ req, entityType: "User", entityId: user.id, action: "UPDATE", before: {}, after: rest });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete("/:id", authorizePermission("users", "write"), async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!user) throw Errors.notFound("User");
    const assignment = await prisma.userTenantAssignment.findUnique({ where: { userId_tenantId: { userId: user.id, tenantId: req.tenantId! } } });
    if (!assignment && req.user?.role !== "SUPER_ADMIN") throw Errors.tenantMismatch();
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
    
    const clinic = await prisma.clinic.findFirst({ where: { id: clinicId, tenantId: req.tenantId!, deletedAt: null } });
    if (!clinic) throw Errors.validation("Clinic does not belong to this tenant");

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

    const program = await prisma.program.findFirst({ where: { id: programId, tenantId: req.tenantId!, deletedAt: null } });
    if (!program) throw Errors.validation("Program does not belong to this tenant");

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
