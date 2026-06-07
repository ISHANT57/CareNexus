import { SyncQueue } from "./SyncQueue.js";
import { MySQLPatientRepository } from "../repositories/mysql/PatientRepository.js";
import { PatientRelationSyncService } from "./PatientRelationSyncService.js";
import { DependencySyncService } from "./DependencySyncService.js";
import { logger } from "../lib/logger.js";
import { prisma } from "../lib/prisma.js";

const queue = new SyncQueue();
const patientRepo = new MySQLPatientRepository();
const relationSync = new PatientRelationSyncService();
const dependencySync = new DependencySyncService();

export class SyncWorker {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info("SyncWorker started");
    this.intervalId = setInterval(() => this.processQueue(), 5000);
  }

  stop() {
    this.isRunning = false;
    if (this.intervalId) clearInterval(this.intervalId);
    logger.info("SyncWorker stopped");
  }

  private async processQueue() {
    try {
      const items = await queue.fetchPendingBatch(10);
      for (const item of items) {
        await queue.markProcessing(item.id);
        
        try {
          if (item.entityType === "Patient") {
            if (item.operation === "CREATE" || item.operation === "UPDATE") {
              await dependencySync.ensureDependencies(item.payload);
            }

            if (item.operation === "CREATE") {
              await patientRepo.create(item.payload);
              await relationSync.syncRelations(item.entityId, item.payload);
            } else if (item.operation === "UPDATE") {
              await patientRepo.update(item.entityId, item.payload);
              await relationSync.syncRelations(item.entityId, item.payload);
            } else if (item.operation === "DELETE") {
              await patientRepo.softDelete(item.entityId);
            }
          }
          
          await queue.markCompleted(item.id);
          await this.logAudit(item.entityType, item.entityId, item.operation, "SUCCESS", "SUCCESS", null);
        } catch (err: any) {
          await queue.markFailed(item.id, err.message, item.retryCount, item.payload, item.entityType, item.entityId, item.operation);
          // Only log failed audit if it moves to DLQ or if we want every retry to be audited
          if (item.retryCount + 1 >= 3) {
            await this.logAudit(item.entityType, item.entityId, item.operation, "SUCCESS", "FAILED", err.message);
          }
        }
      }
    } catch (err) {
      logger.error({ err }, "SyncWorker encountered an error fetching items");
    }
  }

  private async logAudit(entityType: string, entityId: string, operation: string, pgStatus: string, myStatus: string, errorMsg: string | null) {
    try {
      await prisma.databaseSyncAudit.create({
        data: {
          entityType,
          entityId,
          operation,
          postgresStatus: pgStatus,
          mysqlStatus: myStatus,
          errorMessage: errorMsg ? String(errorMsg).substring(0, 500) : null,
        }
      });
      // Best effort dual audit
      import("../lib/mysql.js").then(async ({ mysqlPool }) => {
        try {
          const sql = `INSERT INTO database_sync_audit (id, entityType, entityId, operation, postgresStatus, mysqlStatus, errorMessage, createdAt) VALUES (UUID(), ?, ?, ?, ?, ?, ?, NOW())`;
          await mysqlPool.execute(sql, [entityType, entityId, operation, pgStatus, myStatus, errorMsg]);
        } catch (e) { /* ignore */ }
      });
    } catch (err) {
      logger.error({ err }, "Failed to write DatabaseSyncAudit");
    }
  }
}
