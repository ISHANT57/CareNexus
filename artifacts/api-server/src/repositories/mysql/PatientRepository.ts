import { mysqlPool } from "../../lib/mysql.js";

function getScalars(data: any) {
  const scalars: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === null || typeof v === "number" || typeof v === "boolean" || v instanceof Date) {
      scalars[k] = v;
    } else if (typeof v === "string") {
      // Check if it's an ISO date string
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
        scalars[k] = new Date(v);
      } else {
        scalars[k] = v;
      }
    }
  }
  return scalars;
}

export class MySQLPatientRepository {
  async create(data: any) {
    const scalars = getScalars(data);
    const keys = Object.keys(scalars);
    const values = keys.map(k => scalars[k]);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO patients (${keys.map(k => `\`${k}\``).join(', ')}) VALUES (${placeholders})`;
    
    await mysqlPool.execute(sql, values);
  }

  async update(id: string, data: any) {
    const scalars = getScalars(data);
    const keys = Object.keys(scalars);
    if (keys.length === 0) return;
    const updates = keys.map(k => `\`${k}\` = ?`).join(', ');
    const values = keys.map(k => scalars[k]);
    
    // Add optimistic concurrency check using updatedAt if it exists in the payload
    let sql = `UPDATE patients SET ${updates} WHERE id = ?`;
    values.push(id);

    if (scalars.updatedAt) {
      sql += ` AND (updatedAt <= ? OR updatedAt IS NULL)`;
      values.push(scalars.updatedAt);
    }
    
    const [result]: any = await mysqlPool.execute(sql, values);
    
    // If the record exists but affectedRows is 0, it means the stored updatedAt is newer
    if (result.affectedRows === 0 && scalars.updatedAt) {
      const [existing]: any = await mysqlPool.execute('SELECT id FROM patients WHERE id = ?', [id]);
      if (existing.length > 0) {
        throw new Error("Concurrency conflict: Stored record is newer than the incoming update.");
      }
    }
  }

  async softDelete(id: string) {
    const sql = 'UPDATE patients SET deletedAt = NOW() WHERE id = ?';
    await mysqlPool.execute(sql, [id]);
  }
}
