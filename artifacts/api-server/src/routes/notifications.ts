import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { requireTenant } from "../middlewares/tenantScope.js";
import { paginate, paginationMeta } from "../types/index.js";
import { Errors } from "../lib/errors.js";

const router = Router();
router.use(authenticate, requireTenant);

router.get("/", async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const unreadOnly = req.query["unread"] === "true";
    const where = {
      userId: req.user!.userId,
      tenantId: req.tenantId!,
      ...(unreadOnly ? { isRead: false } : {}),
    };
    const [total, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    ]);
    const unreadCount = await prisma.notification.count({ where: { userId: req.user!.userId, tenantId: req.tenantId!, isRead: false } });
    res.json({ data: notifications, meta: { ...paginationMeta(total, page, limit), unreadCount } });
  } catch (err) { next(err); }
});

router.patch("/:id/read", async (req, res, next) => {
  try {
    const notification = await prisma.notification.findFirst({
      where: { id: req.params["id"], userId: req.user!.userId, tenantId: req.tenantId! },
    });
    if (!notification) throw Errors.notFound("Notification");
    const updated = await prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: true, readAt: new Date() },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

router.patch("/read-all", async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, tenantId: req.tenantId!, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    res.json({ message: "All notifications marked as read" });
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const notification = await prisma.notification.findFirst({
      where: { id: req.params["id"], userId: req.user!.userId, tenantId: req.tenantId! },
    });
    if (!notification) throw Errors.notFound("Notification");
    await prisma.notification.delete({ where: { id: notification.id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
