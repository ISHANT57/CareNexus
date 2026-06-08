import { prisma } from "../lib/prisma.js";
import { DependencySyncService } from "../services/DependencySyncService.js";
import { SyncQueue } from "../services/SyncQueue.js";
import { logger } from "../lib/logger.js";

const dependencySync = new DependencySyncService();
const queue = new SyncQueue();

async function runRepair() {
  logger.info("Scanning failed audit records for foreign key dependencies...");

  // Scan DatabaseSyncAudit for FAILED mysqlStatus
  const failedAudits = await prisma.databaseSyncAudit.findMany({
    where: { mysqlStatus: 'FAILED', entityType: 'Patient' },
    orderBy: { createdAt: 'desc' } // process newest failures first
  });

  const processedIds = new Set();
  let repairedCount = 0;

  for (const audit of failedAudits) {
    if (processedIds.has(audit.entityId)) continue;
    processedIds.add(audit.entityId);

    logger.info(`Analyzing failed Patient sync: ${audit.entityId}`);

    // Fetch from Postgres
    const patient = await prisma.patient.findUnique({
      where: { id: audit.entityId }
    });

    if (!patient) {
      logger.warn(`Patient ${audit.entityId} not found in Postgres. Skipping.`);
      continue;
    }

    // 1. Identify and synchronize missing parent entities
    await dependencySync.ensureDependencies(patient);

    // 2. Retry failed patient sync by pushing to the Queue
    await queue.enqueue('Patient', patient.id, 'CREATE', patient);
    repairedCount++;
    logger.info(`Successfully synchronized dependencies and re-queued Patient ${patient.id}.`);
  }

  // Also scan DeadLetterQueue items for patients
  const dlqItems = await prisma.deadLetterQueueItem.findMany({
    where: { entityType: 'Patient' }
  });

  for (const item of dlqItems) {
    if (processedIds.has(item.entityId)) continue;
    processedIds.add(item.entityId);

    const patient = await prisma.patient.findUnique({
      where: { id: item.entityId }
    });

    if (patient) {
      await dependencySync.ensureDependencies(patient);
      await queue.enqueue('Patient', patient.id, item.operation, patient);
      await prisma.deadLetterQueueItem.delete({ where: { id: item.id } });
      repairedCount++;
      logger.info(`Recovered DLQ Patient ${patient.id} and re-queued.`);
    }
  }

  logger.info(`--- Repair Report ---`);
  logger.info(`Failed Records Analyzed: ${failedAudits.length + dlqItems.length}`);
  logger.info(`Dependencies Repaired & Patients Re-queued: ${repairedCount}`);
  process.exit(0);
}

runRepair().catch(err => {
  logger.error({ err }, "Repair script failed");
  process.exit(1);
});
