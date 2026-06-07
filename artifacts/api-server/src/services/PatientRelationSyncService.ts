import { mysqlPool } from "../lib/mysql.js";

function getScalars(data: any) {
  const scalars: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === null || typeof v === "number" || typeof v === "boolean" || v instanceof Date) {
      scalars[k] = v;
    } else if (typeof v === "string") {
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
        scalars[k] = new Date(v);
      } else {
        scalars[k] = v;
      }
    }
  }
  return scalars;
}

export class PatientRelationSyncService {
  async syncRelations(patientId: string, payload: any) {
    if (payload.gpDetails) {
      await this.upsertRelation('patient_gp_details', patientId, payload.gpDetails, 'patientId');
    }
    if (payload.referrals && Array.isArray(payload.referrals)) {
      for (const ref of payload.referrals) {
        await this.upsertRelation('patient_referrals', patientId, ref, 'id');
      }
    }
    if (payload.journeyEvents && Array.isArray(payload.journeyEvents)) {
      for (const event of payload.journeyEvents) {
        await this.upsertRelation('patient_journey_events', patientId, event, 'id');
      }
    }
  }

  private async upsertRelation(table: string, patientId: string, data: any, primaryKeyField: string = 'id') {
    const scalars = getScalars(data);
    if (!scalars.patientId) {
      scalars.patientId = patientId;
    }
    
    // Ensure we have an ID for the upsert
    if (primaryKeyField === 'id' && !scalars.id) {
      // If no ID is provided for array elements, it might be problematic if we don't have it.
      // Typically Prisma creation payloads might not have ID yet, but after creation they do.
      // So this payload MUST be the created entity from Prisma.
      return; 
    }

    const keys = Object.keys(scalars);
    if (keys.length === 0) return;
    
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map(k => scalars[k]);
    
    const updates = keys.map(k => `\`${k}\` = VALUES(\`${k}\`)`).join(', ');
    
    const sql = `INSERT INTO \`${table}\` (${keys.map(k => `\`${k}\``).join(', ')}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updates}`;
    
    await mysqlPool.execute(sql, values);
  }
}
