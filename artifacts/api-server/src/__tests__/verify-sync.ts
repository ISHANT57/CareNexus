import { PatientService } from "../services/PatientService.js";
import { prisma } from "../lib/prisma.js";
import { mysqlPool } from "../lib/mysql.js";

const service = new PatientService();

async function runTests() {
  console.log("Starting automated verification tests...");

  // Assume test tenant and program from Neon database, or create them.
  const tenant = await prisma.tenant.findFirst();
  const program = await prisma.program.findFirst();
  const clinic = await prisma.clinic.findFirst();
  const area = await prisma.area.findFirst();
  
  if (!tenant || !program || !clinic || !area) {
    console.error("Missing prerequisite data (Tenant/Program/Clinic/Area) in PostgreSQL. Exiting.");
    process.exit(1);
  }

  const testId = `test-${Date.now()}`;
  const nhsNumber = `NHS-${Math.floor(Math.random() * 1000000000)}`;

  const testPatient = {
    tenantId: tenant.id,
    programId: program.id,
    clinicId: clinic.id,
    areaId: area.id,
    nhsNumber,
    firstName: "Sync",
    lastName: "Test",
    mobile: "+447000000000",
    isTest: true,
  };

  try {
    await mysqlPool.execute('SET FOREIGN_KEY_CHECKS=0');
    await mysqlPool.execute('INSERT IGNORE INTO tenants (id, name, domain) VALUES (?, ?, ?)', [tenant.id, tenant.name, tenant.domain]);
    await mysqlPool.execute('INSERT IGNORE INTO programs (id, tenantId, name, activationCode) VALUES (?, ?, ?, ?)', [program.id, tenant.id, program.name, program.activationCode]);
    await mysqlPool.execute('INSERT IGNORE INTO areas (id, tenantId, name) VALUES (?, ?, ?)', [area.id, tenant.id, area.name]);
    await mysqlPool.execute('INSERT IGNORE INTO clinics (id, tenantId, areaId, name) VALUES (?, ?, ?, ?)', [clinic.id, tenant.id, area.id, clinic.name]);
    await mysqlPool.execute('SET FOREIGN_KEY_CHECKS=1');
  } catch (e) {
    console.warn("Could not insert parent records, test might fail due to FK constraints", e);
  }

  async function waitForSync(entityId: string, operation: string) {
    let attempts = 0;
    while (attempts < 20) {
      const myPatient = await mysqlPool.execute('SELECT * FROM patients WHERE id = ?', [entityId]) as any;
      if (operation === 'CREATE' || operation === 'UPDATE') {
        if (myPatient[0] && myPatient[0].length > 0) return myPatient[0];
      } else if (operation === 'DELETE') {
        if (myPatient[0] && myPatient[0].length > 0 && myPatient[0][0].deletedAt) return myPatient[0];
      }
      await new Promise(r => setTimeout(r, 1000));
      attempts++;
    }
    throw new Error(`Sync timeout for ${operation} on ${entityId}`);
  }

  try {
    // Start the worker in the background for the test
    const { SyncWorker } = await import("../services/SyncWorker.js");
    const worker = new SyncWorker();
    worker.start();

    // 1. Patient Create
    console.log(`Testing Patient Create for NHS Number: ${nhsNumber}`);
    const created = await service.createPatient(testPatient);
    
    // Verify Postgres
    const pgPatient = await prisma.patient.findUnique({ where: { id: created.id } });
    if (!pgPatient) throw new Error("Patient not found in Postgres after create");

    console.log("Waiting for async sync...");
    const myPatient = await waitForSync(created.id, 'CREATE');
    if (!myPatient || myPatient.length === 0) throw new Error("Patient not found in MySQL after create");

    console.log("✅ Patient Create Sync OK");

    // 2. Patient Update
    console.log(`Testing Patient Update`);
    await service.updatePatient(created.id, { firstName: "SyncUpdated", updatedAt: new Date() });
    
    console.log("Waiting for async sync...");
    await new Promise(r => setTimeout(r, 6000)); // Sleep extra to let worker pick up
    const [myUpdatedPatient] = await mysqlPool.execute('SELECT * FROM patients WHERE id = ?', [created.id]) as any;
    if (myUpdatedPatient[0].firstName !== "SyncUpdated") throw new Error("MySQL patient not updated");
    
    console.log("✅ Patient Update Sync OK");

    // 3. Duplicate Prevention
    console.log(`Testing Duplicate Prevention`);
    try {
      await service.createPatient(testPatient);
      throw new Error("Duplicate prevention failed - should have thrown");
    } catch (err: any) {
      if (err.message === "Duplicate prevention failed - should have thrown") throw err;
      console.log("✅ Duplicate Prevention OK");
    }

    // 4. Patient Delete
    console.log(`Testing Patient Delete`);
    await service.deletePatient(created.id);
    
    console.log("Waiting for async sync...");
    const myDeletedPatient = await waitForSync(created.id, 'DELETE');
    if (!myDeletedPatient[0].deletedAt) throw new Error("MySQL patient not soft deleted");

    console.log("✅ Patient Delete Sync OK");

    worker.stop();
    console.log("All synchronization verification tests passed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

runTests();
