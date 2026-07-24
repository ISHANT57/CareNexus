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
import programEnrollmentsRouter from "./programEnrollments.js";
import { appointmentsRouter } from "./appointments.js";
import { consultationsRouter } from "./consultations.js";
import outcomesRouter from "./outcomes.js";
import outcomeMetricsRouter from "./outcome-metrics.js";
import tasksRouter from "./tasks.js";
import { riskScoresRouter } from "./riskScores.js";

const router: IRouter = Router();

// Liveness probe for the platform health check (Render etc.) — deliberately
// has no DB dependency, so a transient DB blip doesn't get a healthy process
// killed. For dependency-aware checks see /health/postgres, /health/mysql.
router.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

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
router.use("/program-enrollments", programEnrollmentsRouter);
router.use("/appointments", appointmentsRouter);
router.use("/consultations", consultationsRouter);
router.use("/outcomes", outcomesRouter);
router.use("/outcome-metrics", outcomeMetricsRouter);
router.use("/tasks", tasksRouter);
router.use("/risk-scores", riskScoresRouter);

export default router;

