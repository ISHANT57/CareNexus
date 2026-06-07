import { prisma } from "../lib/prisma.js";
import { mysqlPool } from "../lib/mysql.js";
import { SyncQueue } from "./SyncQueue.js";
import { logger } from "../lib/logger.js";

const queue = new SyncQueue();

export class ReconciliationService {
  async reconcilePatients(autoRepair = false) {
    logger.info("Starting Patient Reconciliation...");
    
    // 1. Record Count
    const pgCount = await prisma.patient.count();
    const [myCountResult]: any = await mysqlPool.execute('SELECT COUNT(*) as count FROM patients');
    const myCount = myCountResult[0].count;

    let missingRecords = 0;
    let mismatchedRecords = 0;
    let repairedRecords = 0;

    // 2. Fetch all PG IDs
    const pgPatients = await prisma.patient.findMany({ select: { id: true, updatedAt: true } });
    
    // 3. Compare with MySQL
    for (const pg of pgPatients) {
      const [myPatient]: any = await mysqlPool.execute('SELECT id, updatedAt FROM patients WHERE id = ?', [pg.id]);
      
      if (myPatient.length === 0) {
        missingRecords++;
        if (autoRepair) {
          const fullPatient = await prisma.patient.findUnique({ where: { id: pg.id } });
          await queue.enqueue("Patient", pg.id, "CREATE", fullPatient);
          repairedRecords++;
        }
      } else {
        const myUpdated = new Date(myPatient[0].updatedAt).getTime();
        const pgUpdated = new Date(pg.updatedAt).getTime();
        
        // Allow a small drift window (e.g., 2000ms) for async writes
        if (Math.abs(pgUpdated - myUpdated) > 2000) {
          mismatchedRecords++;
          if (autoRepair) {
            const fullPatient = await prisma.patient.findUnique({ where: { id: pg.id } });
            await queue.enqueue("Patient", pg.id, "UPDATE", fullPatient);
            repairedRecords++;
          }
        }
      }
    }

    const report = {
      recordCountPg: pgCount,
      recordCountMy: myCount,
      missingRecords,
      mismatchedRecords,
      repairedRecords
    };
    
    logger.info(report, "Reconciliation Complete");
    return report;
  }
}
