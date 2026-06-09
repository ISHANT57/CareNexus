import { prisma } from "../lib/prisma.js";
import { mysqlPool } from "../lib/mysql.js";

async function main() {
  console.log("PostgreSQL Database Sync Audits (latest 10):");
  const pgAudits = await prisma.databaseSyncAudit.findMany({
    take: 10,
    orderBy: { createdAt: "desc" }
  });
  console.log(JSON.stringify(pgAudits, null, 2));

  console.log("PostgreSQL Sync Queue Items (latest 10):");
  const pgQueue = await prisma.syncQueueItem.findMany({
    take: 10,
    orderBy: { createdAt: "desc" }
  });
  console.log(JSON.stringify(pgQueue, null, 2));

  console.log("MySQL database_sync_audit (latest 10):");
  try {
    const [myAudits]: any = await mysqlPool.execute("SELECT * FROM database_sync_audit ORDER BY createdAt DESC LIMIT 10");
    console.log(JSON.stringify(myAudits, null, 2));
  } catch (e: any) {
    console.error("Error reading MySQL database_sync_audit:", e.message);
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
