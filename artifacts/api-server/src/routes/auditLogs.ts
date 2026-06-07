import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize } from "../middlewares/rbac.js";
import { requireTenant } from "../middlewares/tenantScope.js";
import { ok, paginate, paginationMeta } from "../types/index.js";

const router = Router();
router.use(authenticate, requireTenant, authorize("SUPER_ADMIN", "AREA_ADMIN"));

router.get("/", async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const { entityType, entityId, actorId, action } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { tenantId: req.tenantId! };
    if (entityType) where["entityType"] = entityType;
    if (entityId) where["entityId"] = entityId;
    if (actorId) where["actorId"] = actorId;
    if (action) where["action"] = action;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where, skip, take, orderBy: { createdAt: "desc" },
        include: { actor: { select: { id: true, firstName: true, lastName: true, email: true } } },
      }),
    ]);
    res.json({ data: logs, meta: paginationMeta(total, page, limit) });
  } catch (err) { next(err); }
});

export default router;
