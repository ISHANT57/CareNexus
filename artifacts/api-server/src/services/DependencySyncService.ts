import { mysqlPool } from "../lib/mysql.js";
import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";

export class DependencySyncService {
  async ensureDependencies(payload: any) {
    if (!payload) return;

    logger.info("[DEPENDENCY CHECK] Starting pre-insert verification...");

    const { tenantId, programId, areaId, clinicId } = payload;

    if (tenantId) await this.verifyAndSyncTenant(tenantId);
    if (programId) await this.verifyAndSyncProgram(programId);
    if (areaId) await this.verifyAndSyncArea(areaId);
    if (clinicId) await this.verifyAndSyncClinic(clinicId);

    logger.info("[DEPENDENCY CHECK] Pre-insert verification complete.");
  }

  private async verifyAndSyncTenant(id: string) {
    const [rows]: any = await mysqlPool.execute('SELECT id FROM tenants WHERE id = ?', [id]);
    if (rows.length > 0) {
      logger.info(`[DEPENDENCY CHECK] Tenant ${id}: FOUND`);
      return;
    }

    logger.info(`[DEPENDENCY CHECK] Tenant ${id}: MISSING. Auto-syncing...`);
    const pgRecord = await prisma.tenant.findUnique({ where: { id } });
    if (!pgRecord) throw new Error(`Tenant ${id} not found in Postgres!`);

    await mysqlPool.execute(
      `INSERT INTO tenants (id, name, domain, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
      [pgRecord.id, pgRecord.name, pgRecord.domain, pgRecord.isActive ? 1 : 0, pgRecord.createdAt, pgRecord.updatedAt]
    );
    logger.info(`[DEPENDENCY CHECK] Tenant Sync SUCCESS`);
  }

  private async verifyAndSyncProgram(id: string) {
    const [rows]: any = await mysqlPool.execute('SELECT id FROM programs WHERE id = ?', [id]);
    if (rows.length > 0) {
      logger.info(`[DEPENDENCY CHECK] Program ${id}: FOUND`);
      return;
    }

    logger.info(`[DEPENDENCY CHECK] Program ${id}: MISSING. Auto-syncing...`);
    const pgRecord = await prisma.program.findUnique({ where: { id } });
    if (!pgRecord) throw new Error(`Program ${id} not found in Postgres!`);

    await mysqlPool.execute(
      `INSERT INTO programs (id, tenantId, name, activationCode, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [pgRecord.id, pgRecord.tenantId, pgRecord.name, pgRecord.activationCode, pgRecord.isActive ? 1 : 0, pgRecord.createdAt, pgRecord.updatedAt]
    );
    logger.info(`[DEPENDENCY CHECK] Program Sync SUCCESS`);
  }

  private async verifyAndSyncArea(id: string) {
    const [rows]: any = await mysqlPool.execute('SELECT id FROM areas WHERE id = ?', [id]);
    if (rows.length > 0) {
      logger.info(`[DEPENDENCY CHECK] Area ${id}: FOUND`);
      return;
    }

    logger.info(`[DEPENDENCY CHECK] Area ${id}: MISSING. Auto-syncing...`);
    const pgRecord = await prisma.area.findUnique({ where: { id } });
    if (!pgRecord) throw new Error(`Area ${id} not found in Postgres!`);

    await mysqlPool.execute(
      `INSERT INTO areas (id, tenantId, name, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
      [pgRecord.id, pgRecord.tenantId, pgRecord.name, pgRecord.createdAt, pgRecord.updatedAt]
    );
    logger.info(`[DEPENDENCY CHECK] Area Sync SUCCESS`);
  }

  private async verifyAndSyncClinic(id: string) {
    const [rows]: any = await mysqlPool.execute('SELECT id FROM clinics WHERE id = ?', [id]);
    if (rows.length > 0) {
      logger.info(`[DEPENDENCY CHECK] Clinic ${id}: FOUND`);
      return;
    }

    logger.info(`[DEPENDENCY CHECK] Clinic ${id}: MISSING. Auto-syncing...`);
    const pgRecord = await prisma.clinic.findUnique({ where: { id } });
    if (!pgRecord) throw new Error(`Clinic ${id} not found in Postgres!`);

    await mysqlPool.execute(
      `INSERT INTO clinics (id, tenantId, areaId, name, address, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [pgRecord.id, pgRecord.tenantId, pgRecord.areaId, pgRecord.name, pgRecord.address, pgRecord.createdAt, pgRecord.updatedAt]
    );
    logger.info(`[DEPENDENCY CHECK] Clinic Sync SUCCESS`);
  }
}
