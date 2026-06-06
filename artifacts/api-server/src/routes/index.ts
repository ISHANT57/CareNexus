import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import rolesRouter from "./roles.js";
import tenantsRouter from "./tenants.js";

const router: IRouter = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/roles", rolesRouter);
router.use("/tenants", tenantsRouter);

export default router;