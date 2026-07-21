import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const patients = await prisma.patient.findMany({
    include: {
      tenant: true
    }
  });

  console.log("PATIENTS IN DB:");
  for (const p of patients) {
    console.log(`- [${p.id}] ${p.firstName} ${p.lastName}`);
    console.log(`  Tenant: ${p.tenant.name} (${p.tenant.id})`);
    console.log(`  NHS: ${p.nhsNumber}`);
    console.log(`  AreaId: ${p.areaId}, ClinicId: ${p.clinicId}, ProgramId: ${p.programId}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
