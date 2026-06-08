import cron from "node-cron";
import { prisma } from "../lib/prisma.js";
import { calculateAllPatientRisks } from "../services/RiskScoringService.js";
import { logger } from "../lib/logger.js";

/**
 * Scheduled job: recalculate risk scores for ALL active tenants.
 * Runs every day at 02:00 AM (server local time).
 * Risk weights are documented in RiskScoringService.ts.
 */
export function startRiskScoringScheduler(): void {
  cron.schedule("0 2 * * *", async () => {
    logger.info("[RiskScheduler] Starting nightly risk score recalculation...");

    const tenants = await prisma.tenant.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true, name: true },
    });

    for (const tenant of tenants) {
      try {
        const result = await calculateAllPatientRisks(tenant.id);
        logger.info(`[RiskScheduler] Tenant "${tenant.name}": processed=${result.processed} errors=${result.errors}`);
      } catch (err) {
        logger.error(`[RiskScheduler] Failed for tenant "${tenant.name}":`, err);
      }
    }

    logger.info("[RiskScheduler] Nightly risk recalculation complete.");
  });

  logger.info("[RiskScheduler] Nightly risk scoring job registered (daily 02:00).");
}
