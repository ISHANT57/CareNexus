import { ReconciliationService } from "../services/ReconciliationService.js";
import { logger } from "../lib/logger.js";

async function backfill() {
  logger.info("Starting complete Postgres to MySQL backfill...");
  const service = new ReconciliationService();
  
  // Run with autoRepair = true to push all missing patients to the SyncQueue
  const report = await service.reconcilePatients(true);

  logger.info("--- Reconciliation Report ---");
  console.log(JSON.stringify(report, null, 2));
  
  process.exit(0);
}

backfill().catch(err => {
  logger.error({ err }, "Backfill script failed");
  process.exit(1);
});
