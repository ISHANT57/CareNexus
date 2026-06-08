import { prisma } from "../lib/prisma.js";

async function run() {
  const p = await prisma.patient.findFirst({ where: { nhsNumber: '0000000002' } });
  console.log("PRAGATI:", JSON.stringify(p, null, 2));
  
  // also get sync logs for this patient
  if (p) {
    const logs = await prisma.databaseSyncAudit.findMany({ where: { entityId: p.id }});
    console.log("SYNC LOGS:", logs);
  }
}

run().catch(console.error);
