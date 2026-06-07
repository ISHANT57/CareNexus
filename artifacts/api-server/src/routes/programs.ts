import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { ADMIN_ROLES } from "../middlewares/rbac.js";
import { requireTenant, assertTenantMatch } from "../middlewares/tenantScope.js";
import { validateBody } from "../middlewares/validate.js";
import { Errors, paginate, paginationMeta } from "../types/index.js";
import { createAuditLog } from "../lib/audit.js";

const router = Router();
router.use(authenticate, requireTenant);

const ProgramSchema = z.object({
  name: z.string().min(1).max(100),
  activationCode: z.string().max(50).optional().nullable(),
  channelId: z.number().int().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  priority: z.number().int().min(0).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

router.get("/", async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const q = req.query["q"] as string | undefined;
    const where = {
      tenantId: req.tenantId!, deletedAt: null,
      ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    };
    const [total, programs] = await Promise.all([
      prisma.program.count({ where }),
      prisma.program.findMany({
        where, skip, take, orderBy: [{ priority: "asc" }, { name: "asc" }],
        include: { _count: { select: { patients: true } } },
      }),
    ]);
    res.json({ data: programs, meta: paginationMeta(total, page, limit) });
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const program = await prisma.program.findFirst({
      where: { id: req.params["id"] as string, tenantId: req.tenantId!, deletedAt: null },
      include: { _count: { select: { patients: true } } },
    });
    if (!program) throw Errors.notFound("Program");
    res.json(program);
  } catch (err) { next(err); }
});

router.post("/", ADMIN_ROLES, validateBody(ProgramSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof ProgramSchema>;
    const activationCode = data.activationCode ?? `${data.name.toUpperCase().replace(/\s+/g, "_").slice(0, 20)}_${Date.now()}`;
    const program = await prisma.program.create({ data: { ...data, activationCode, tenantId: req.tenantId! } });
    await createAuditLog({ req, entityType: "Program", entityId: program.id, action: "CREATE", after: data });
    res.status(201).json(program);
  } catch (err) { next(err); }
});

router.patch("/:id", ADMIN_ROLES, validateBody(ProgramSchema.partial()), async (req, res, next) => {
  try {
    const program = await prisma.program.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!program) throw Errors.notFound("Program");
    assertTenantMatch(req, program.tenantId);
    const updated = await prisma.program.update({ where: { id: program.id }, data: req.body });
    await createAuditLog({ req, entityType: "Program", entityId: program.id, action: "UPDATE", before: program, after: req.body });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete("/:id", ADMIN_ROLES, async (req, res, next) => {
  try {
    const program = await prisma.program.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!program) throw Errors.notFound("Program");
    assertTenantMatch(req, program.tenantId);
    await prisma.program.update({ where: { id: program.id }, data: { deletedAt: new Date() } });
    await createAuditLog({ req, entityType: "Program", entityId: program.id, action: "DELETE" });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
