import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { ADMIN_ROLES , authorizePermission } from "../middlewares/rbac.js";
import { requireTenant } from "../middlewares/tenantScope.js";
import { validateBody } from "../middlewares/validate.js";
import { Errors, paginate, paginationMeta } from "../types/index.js";

const router = Router();
router.use(authenticate, requireTenant);

const RoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(300).optional().nullable(),
});

const SYSTEM_ROLES = ["SUPER_ADMIN", "AREA_ADMIN", "CLINIC_ADMIN", "DOCTOR", "OPERATOR", "STAFF"];

const ROLE_HIERARCHY: Record<string, string[]> = {
  SUPER_ADMIN: ["SUPER_ADMIN", "AREA_ADMIN", "CLINIC_ADMIN", "DOCTOR", "OPERATOR", "STAFF"],
  AREA_ADMIN: ["CLINIC_ADMIN", "DOCTOR", "OPERATOR", "STAFF"],
  CLINIC_ADMIN: ["DOCTOR", "OPERATOR", "STAFF"],
};

router.get("/", async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const where: any = { OR: [{ tenantId: req.tenantId! }, { isSystem: true }] };
    // Filter out roles the user isn't allowed to see based on hierarchy
    const userRole = req.user?.role ?? "";
    const allowedRoles = ROLE_HIERARCHY[userRole] || [];
    
    where.name = { in: allowedRoles };
    const [total, roles] = await Promise.all([
      prisma.role.count({ where }),
      prisma.role.findMany({
        where, skip, take, orderBy: { name: "asc" },
        include: { _count: { select: { userAssignments: true } } },
      }),
    ]);
    res.json({ data: roles, meta: paginationMeta(total, page, limit) });
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const role = await prisma.role.findFirst({
      where: { id: req.params["id"] as string },
      include: { rolePermissions: { include: { permission: true } } },
    });
    if (!role) throw Errors.notFound("Role");
    res.json(role);
  } catch (err) { next(err); }
});

router.post("/", authorizePermission("roles", "write"), validateBody(RoleSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof RoleSchema>;
    if (SYSTEM_ROLES.includes(data.name.toUpperCase())) {
      throw Errors.conflict("Cannot create role with a reserved system role name");
    }
    const role = await prisma.role.create({ data: { ...data, tenantId: req.tenantId! } });
    res.status(201).json(role);
  } catch (err) { next(err); }
});

router.patch("/:id", authorizePermission("roles", "write"), validateBody(RoleSchema.partial()), async (req, res, next) => {
  try {
    const role = await prisma.role.findFirst({ where: { id: req.params["id"] as string } });
    if (!role) throw Errors.notFound("Role");
    if (role.isSystem) throw Errors.forbidden("Cannot modify system roles");
    const updated = await prisma.role.update({ where: { id: role.id }, data: req.body });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete("/:id", authorizePermission("roles", "write"), async (req, res, next) => {
  try {
    const role = await prisma.role.findFirst({ where: { id: req.params["id"] as string } });
    if (!role) throw Errors.notFound("Role");
    if (role.isSystem) throw Errors.forbidden("Cannot delete system roles");
    await prisma.role.delete({ where: { id: role.id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

// ── Role Permissions CRUD ─────────────────────────────────────────────────────

const PermissionSchema = z.object({
  resource: z.string().min(1).max(100),
  action: z.string().min(1).max(100),
});

// GET /api/roles/:id/permissions
router.get("/:id/permissions", async (req, res, next) => {
  try {
    const role = await prisma.role.findFirst({ where: { id: req.params["id"] as string } });
    if (!role) throw Errors.notFound("Role");
    const permissions = await prisma.rolePermission.findMany({
      where: { roleId: role.id },
      include: { permission: true },
      orderBy: { permission: { module: "asc" } },
    });
    const mapped = permissions.map((rp) => ({
      id: rp.id,
      roleId: rp.roleId,
      resource: rp.permission.module,
      action: rp.permission.action,
      createdAt: rp.createdAt,
    }));
    res.json({ data: mapped });
  } catch (err) { next(err); }
});

// POST /api/roles/:id/permissions
router.post("/:id/permissions", authorizePermission("roles", "write"), validateBody(PermissionSchema), async (req, res, next) => {
  try {
    const role = await prisma.role.findFirst({ where: { id: req.params["id"] as string } });
    if (!role) throw Errors.notFound("Role");
    if (role.isSystem) throw Errors.forbidden("Cannot modify system role permissions");

    const { resource, action } = req.body as z.infer<typeof PermissionSchema>;
    const module = resource;

    // Upsert the permission record
    let permission = await prisma.permission.findFirst({ where: { module, action } });
    if (!permission) {
      permission = await prisma.permission.create({ data: { module, action } });
    }

    // Check if already granted
    const existing = await prisma.rolePermission.findFirst({ 
      where: { roleId: role.id, permissionId: permission.id },
      include: { permission: true }
    });
    if (existing) { 
      res.json({
        id: existing.id,
        roleId: existing.roleId,
        resource: existing.permission.module,
        action: existing.permission.action,
        createdAt: existing.createdAt,
      }); 
      return; 
    }

    const rolePermission = await prisma.rolePermission.create({
      data: { roleId: role.id, permissionId: permission.id },
      include: { permission: true },
    });
    res.status(201).json({
      id: rolePermission.id,
      roleId: rolePermission.roleId,
      resource: rolePermission.permission.module,
      action: rolePermission.permission.action,
      createdAt: rolePermission.createdAt,
    });
  } catch (err) { next(err); }
});

// DELETE /api/roles/:id/permissions/:permissionId
router.delete("/:id/permissions/:permissionId", authorizePermission("roles", "write"), async (req, res, next) => {
  try {
    const rolePermission = await prisma.rolePermission.findFirst({
      where: { 
        roleId: req.params["id"] as string,
        OR: [
          { id: req.params["permissionId"] as string },
          { permissionId: req.params["permissionId"] as string }
        ]
      },
    });
    if (!rolePermission) throw Errors.notFound("Permission");
    await prisma.rolePermission.delete({ where: { id: rolePermission.id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;

