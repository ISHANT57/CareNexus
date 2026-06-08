import { mysqlPool } from "../lib/mysql.js";
import { prisma } from "../lib/prisma.js";

async function runAudit() {
  console.log("=== MYSQL DATABASE_SYNC_AUDIT ROWS ===");
  const [myAudit] = await mysqlPool.execute('SELECT * FROM database_sync_audit ORDER BY createdAt DESC LIMIT 5');
  console.log(JSON.stringify(myAudit, null, 2));

  console.log("\n=== POSTGRES DATABASE_SYNC_AUDIT ROWS ===");
  const pgAudit = await prisma.databaseSyncAudit.findMany({
    orderBy: { createdAt: "desc" },
    take: 5
  });
  console.log(JSON.stringify(pgAudit, null, 2));

  console.log("\n=== MYSQL PATIENTS ROWS ===");
  const [myPatients] = await mysqlPool.execute('SELECT id, firstName, deletedAt FROM patients ORDER BY createdAt DESC LIMIT 5');
  console.log(JSON.stringify(myPatients, null, 2));

  process.exit(0);
}

runAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
