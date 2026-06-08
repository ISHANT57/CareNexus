import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import tenantsRouter from "./tenants.js";
import areasRouter from "./areas.js";
import clinicsRouter from "./clinics.js";
import rolesRouter from "./roles.js";
import usersRouter from "./users.js";
import programsRouter from "./programs.js";
import patientsRouter from "./patients.js";
import assignmentsRouter from "./assignments.js";
import communicationsRouter from "./communications.js";
import notificationsRouter from "./notifications.js";
import auditLogsRouter from "./auditLogs.js";
import reportsRouter from "./reports.js";
import filesRouter from "./files.js";
import importRouter from "./import.js";

const router: IRouter = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/tenants", tenantsRouter);
router.use("/areas", areasRouter);
router.use("/clinics", clinicsRouter);
router.use("/roles", rolesRouter);
router.use("/users", usersRouter);
router.use("/programs", programsRouter);
router.use("/patients", patientsRouter);
router.use("/assignments", assignmentsRouter);
router.use("/communications", communicationsRouter);
router.use("/notifications", notificationsRouter);
router.use("/audit-logs", auditLogsRouter);
router.use("/reports", reportsRouter);
router.use("/files", filesRouter);
router.use("/import", importRouter);

export default router;
