import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { CLINICAL_ROLES, ADMIN_ROLES } from "../middlewares/rbac.js";
import { requireTenant, assertTenantMatch } from "../middlewares/tenantScope.js";
import { validateBody } from "../middlewares/validate.js";
import { Errors, paginate, paginationMeta } from "../types/index.js";
import { createAuditLog } from "../lib/audit.js";

const router = Router();
router.use(authenticate, requireTenant);

const TaskSchema = z.object({
  patientId: z.string().uuid(),
  assignedTo: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  dueDate: z.string().datetime(),
});

// Helper — mark overdue tasks lazily at query time
function isOverdue(task: { status: string; dueDate: Date }) {
  return task.status === "PENDING" || task.status === "IN_PROGRESS"
    ? new Date(task.dueDate) < new Date()
    : false;
}

// GET /api/tasks
router.get("/", CLINICAL_ROLES, async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const { patientId, assignedTo, status } = req.query as Record<string, string>;
    const overdue = req.query["overdue"] === "true";

    const where: Record<string, unknown> = { tenantId: req.tenantId!, deletedAt: null };
    if (patientId) where["patientId"] = patientId;
    if (assignedTo) where["assignedTo"] = assignedTo;
    if (status) where["status"] = status;
    if (overdue) {
      where["dueDate"] = { lt: new Date() };
      where["status"] = { in: ["PENDING", "IN_PROGRESS"] };
    }

    const [total, tasks] = await Promise.all([
      prisma.careTask.count({ where }),
      prisma.careTask.findMany({
        where, skip, take,
        orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, nhsNumber: true } },
          creator: { select: { id: true, firstName: true, lastName: true } },
          assignee: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
    ]);

    const data = tasks.map(t => ({ ...t, isOverdue: isOverdue(t) }));
    res.json({ data, meta: paginationMeta(total, page, limit) });
  } catch (err) { next(err); }
});

// GET /api/tasks/:id
router.get("/:id", CLINICAL_ROLES, async (req, res, next) => {
  try {
    const task = await prisma.careTask.findFirst({
      where: { id: req.params["id"] as string, tenantId: req.tenantId!, deletedAt: null },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, nhsNumber: true } },
        creator: { select: { id: true, firstName: true, lastName: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!task) throw Errors.notFound("Task");
    res.json({ ...task, isOverdue: isOverdue(task) });
  } catch (err) { next(err); }
});

// POST /api/tasks
router.post("/", CLINICAL_ROLES, validateBody(TaskSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof TaskSchema>;
    const task = await prisma.careTask.create({
      data: {
        tenantId: req.tenantId!,
        patientId: data.patientId,
        assignedBy: req.user!.userId,
        assignedTo: data.assignedTo,
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: new Date(data.dueDate),
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        creator: { select: { id: true, firstName: true, lastName: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await createAuditLog({ req, entityType: "CareTask", entityId: task.id, action: "CREATE", after: { title: task.title, assignedTo: task.assignedTo } });

    // Notify assignee
    if (data.assignedTo !== req.user!.userId) {
      await prisma.notification.create({
        data: {
          tenantId: req.tenantId!,
          userId: data.assignedTo,
          title: "New Task Assigned",
          message: `You have been assigned: "${task.title}" for patient ${task.patient?.firstName} ${task.patient?.lastName}. Due: ${new Date(task.dueDate).toLocaleDateString()}.`,
          type: "INFO",
        },
      });
    }

    res.status(201).json({ ...task, isOverdue: false });
  } catch (err) { next(err); }
});

// PATCH /api/tasks/:id
router.patch("/:id", CLINICAL_ROLES, validateBody(TaskSchema.partial().extend({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "OVERDUE"]).optional(),
})), async (req, res, next) => {
  try {
    const task = await prisma.careTask.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!task) throw Errors.notFound("Task");
    assertTenantMatch(req, task.tenantId);

    const body = req.body as Partial<z.infer<typeof TaskSchema> & { status: string }>;
    const updated = await prisma.careTask.update({
      where: { id: task.id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.priority !== undefined && { priority: body.priority as any }),
        ...(body.dueDate !== undefined && { dueDate: new Date(body.dueDate) }),
        ...(body.assignedTo !== undefined && { assignedTo: body.assignedTo }),
        ...(body.status !== undefined && { status: body.status as any }),
        ...(body.status === "COMPLETED" && { completedAt: new Date() }),
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        creator: { select: { id: true, firstName: true, lastName: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await createAuditLog({ req, entityType: "CareTask", entityId: task.id, action: "UPDATE", before: task, after: req.body });
    res.json({ ...updated, isOverdue: isOverdue(updated) });
  } catch (err) { next(err); }
});

// PATCH /api/tasks/:id/complete
router.patch("/:id/complete", CLINICAL_ROLES, async (req, res, next) => {
  try {
    const task = await prisma.careTask.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!task) throw Errors.notFound("Task");
    assertTenantMatch(req, task.tenantId);

    const updated = await prisma.careTask.update({
      where: { id: task.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    await createAuditLog({ req, entityType: "CareTask", entityId: task.id, action: "UPDATE", before: task, after: { status: "COMPLETED" } });
    res.json(updated);
  } catch (err) { next(err); }
});

// PATCH /api/tasks/:id/reopen
router.patch("/:id/reopen", CLINICAL_ROLES, async (req, res, next) => {
  try {
    const task = await prisma.careTask.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!task) throw Errors.notFound("Task");
    assertTenantMatch(req, task.tenantId);

    const updated = await prisma.careTask.update({
      where: { id: task.id },
      data: { status: "IN_PROGRESS", completedAt: null },
    });

    await createAuditLog({ req, entityType: "CareTask", entityId: task.id, action: "UPDATE", before: task, after: { status: "IN_PROGRESS" } });
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/tasks/:id (soft-delete)
router.delete("/:id", ADMIN_ROLES, async (req, res, next) => {
  try {
    const task = await prisma.careTask.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!task) throw Errors.notFound("Task");
    assertTenantMatch(req, task.tenantId);
    await prisma.careTask.update({ where: { id: task.id }, data: { deletedAt: new Date() } });
    await createAuditLog({ req, entityType: "CareTask", entityId: task.id, action: "DELETE", before: task });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
