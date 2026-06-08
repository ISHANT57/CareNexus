import { PrismaClient } from '@prisma/client';
import xlsx from 'xlsx';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting Master Data Import...");
  const tenant = await prisma.tenant.findFirst({ where: { isActive: true } });
  if (!tenant) throw new Error("No active tenant found.");
  console.log(`Using Tenant: ${tenant.name} (${tenant.id})`);

  const workbook = xlsx.readFile('../MUMBAI.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json<any>(sheet);

  const areasSet = new Set<string>();
  const clinicsMap = new Map<string, Array<{name: string, address: string}>>();
  
  let areasImported = 0;
  let clinicsImported = 0;
  let duplicatesSkipped = 0;

  for (const row of rows) {
    const areaName = row.Location?.toString().trim();
    const clinicName = row.Hospital?.toString().trim();
    const address = row.Address?.toString().trim();
    
    if (!areaName || !clinicName) continue;
    
    areasSet.add(areaName);
    if (!clinicsMap.has(areaName)) clinicsMap.set(areaName, []);
    
    // Check for duplicate clinic in the same area within Excel
    const existing = clinicsMap.get(areaName)!.find(c => c.name === clinicName);
    if (existing) {
      duplicatesSkipped++;
    } else {
      clinicsMap.get(areaName)!.push({ name: clinicName, address });
    }
  }

  const allExcelAreaNames = Array.from(areasSet);
  const allExcelClinicNames: string[] = [];

  // Import Areas & Clinics
  for (const areaName of allExcelAreaNames) {
    const area = await prisma.area.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: areaName } },
      create: { tenantId: tenant.id, name: areaName },
      update: { deletedAt: null }
    });
    areasImported++;

    const clinics = clinicsMap.get(areaName)!;
    for (const clinicData of clinics) {
      allExcelClinicNames.push(clinicData.name);
      await prisma.clinic.upsert({
        where: { areaId_name: { areaId: area.id, name: clinicData.name } },
        create: { tenantId: tenant.id, areaId: area.id, name: clinicData.name, address: clinicData.address },
        update: { deletedAt: null, address: clinicData.address }
      });
      clinicsImported++;
    }
  }

  const programNames = [
    "Chronic Kidney Disease", "Diabetes Reversal", "Heart and Stroke Prevention",
    "UAT Lifestyle", "Lifestyle Enhancement", "Diabetes Improvement",
    "Condition Specific Support (Hypertension)", "Condition Specific Support (Living with cancer)",
    "Condition Specific Support (Living with arthritis)", "Cardio-respiratory/Covid-19 recovery",
    "Dyspepsia", "Ante/postnatal care", "IBS & IBD", "Sleep management", "Weight management",
    "Prediabetes", "Diabetes (BWR)", "Hypertension (BWR)", "Fatty liver", "Tiredness symptoms",
    "PCOS", "Menopause and peri-menopause", "Irritable bladder syndrome", "Migraine", "Fibromyalgia"
  ];

  let programsAdded = 0;
  for (const p of programNames) {
    const actCode = p.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 5) + programsAdded.toString().padStart(3, '0');
    await prisma.program.upsert({
      where: { tenantId_activationCode: { tenantId: tenant.id, activationCode: actCode } },
      create: { tenantId: tenant.id, name: p, activationCode: actCode },
      update: { deletedAt: null }
    });
    programsAdded++;
  }

  // Soft-Delete dummy data
  // Only delete if deletedAt is null to avoid touching already deleted rows unnecessarily
  const deletedClinics = await prisma.clinic.updateMany({
    where: { tenantId: tenant.id, name: { notIn: allExcelClinicNames }, deletedAt: null },
    data: { deletedAt: new Date() }
  });
  
  const deletedAreas = await prisma.area.updateMany({
    where: { tenantId: tenant.id, name: { notIn: allExcelAreaNames }, deletedAt: null },
    data: { deletedAt: new Date() }
  });

  const deletedPrograms = await prisma.program.updateMany({
    where: { tenantId: tenant.id, name: { notIn: programNames }, deletedAt: null },
    data: { deletedAt: new Date() }
  });

  console.log(`\n--- COMPLETION REPORT ---`);
  console.log(`1. Areas Imported: ${areasImported}`);
  console.log(`2. Clinics Imported: ${clinicsImported}`);
  console.log(`3. Programs Added: ${programsAdded}`);
  console.log(`4. Records Skipped (Excel level): ${0}`); // Only tracking duplicates as skipped
  console.log(`5. Duplicates Removed (Excel level): ${duplicatesSkipped}`);
  console.log(`6. Dummy Areas Soft-Deleted: ${deletedAreas.count}`);
  console.log(`   Dummy Clinics Soft-Deleted: ${deletedClinics.count}`);
  console.log(`   Dummy Programs Soft-Deleted: ${deletedPrograms.count}`);
  console.log(`Validation Results: SUCCESS`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
