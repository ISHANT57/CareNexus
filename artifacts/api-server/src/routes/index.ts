import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import rolesRouter from "./roles.js";
import tenantsRouter from "./tenants.js";
import areasRouter from "./areas.js";
import clinicsRouter from "./clinics.js";
import programsRouter from "./programs.js";
import patientsRouter from "./patients.js";
import assignmentsRouter from "./assignments.js";
import communicationsRouter from "./communications.js";

const router: IRouter = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/roles", rolesRouter);
router.use("/tenants", tenantsRouter);
router.use("/areas", areasRouter);
router.use("/clinics", clinicsRouter);
router.use("/programs", programsRouter);
router.use("/patients", patientsRouter);
router.use("/assignments", assignmentsRouter);
router.use("/communications", communicationsRouter);

export default router;