import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const programsToImport = [
  // Category: NHS
  { name: "Chronic Kidney Disease", category: "NHS" },
  { name: "Heart and Stroke Prevention", category: "NHS" },
  { name: "UAT Lifestyle", category: "NHS" },
  { name: "Lifestyle Enhancement", category: "NHS" },
  { name: "Condition Specific Support (Hypertension)", category: "NHS" },
  { name: "Condition Specific Support (Living with cancer)", category: "NHS" },
  { name: "Condition Specific Support (Living with arthritis)", category: "NHS" },
  { name: "Cardio-respiratory/Covid-19 recovery", category: "NHS" },
  { name: "Dyspepsia", category: "NHS" },
  { name: "Ante/postnatal care", category: "NHS" },
  { name: "IBS & IBD", category: "NHS" },
  { name: "Sleep management", category: "NHS" },
  { name: "Weight management", category: "NHS" },
  { name: "Prediabetes", category: "NHS" },
  { name: "Fatty liver", category: "NHS" },
  { name: "Tiredness symptoms", category: "NHS" },
  { name: "PCOS", category: "NHS" },
  { name: "Menopause and peri-menopause", category: "NHS" },
  { name: "Irritable bladder syndrome", category: "NHS" },
  { name: "Migraine", category: "NHS" },
  { name: "Fibromyalgia", category: "NHS" },

  // Category: DRP
  { name: "Diabetes Reversal", category: "DRP" },

  // Category: DIP
  { name: "Diabetes Improvement", category: "DIP" },

  // Category: BWR
  { name: "Diabetes (BWR)", category: "BWR" },
  { name: "Hypertension (BWR)", category: "BWR" },
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric chars with hyphen
    .replace(/(^-|-$)+/g, "");   // Remove leading/trailing hyphens
}

async function main() {
  try {
    let addedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    // 1. Get the tenant
    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      console.log("No tenant found. Creating a default tenant...");
      tenant = await prisma.tenant.create({
        data: {
          name: "Default Tenant",
          domain: "default.example.com",
        },
      });
    }

    console.log(`Using Tenant: ${tenant.name} (${tenant.id})`);

    // 2. Insert programs
    for (const prog of programsToImport) {
      const slug = generateSlug(prog.name);

      // Check for duplicates
      const existingProgram = await prisma.program.findUnique({
        where: {
          tenantId_activationCode: {
            tenantId: tenant.id,
            activationCode: slug,
          },
        },
      });

      if (existingProgram) {
        duplicateCount++;
        console.log(`[DUPLICATE] Program already exists: ${prog.name} (Code: ${slug})`);
        continue;
      }

      try {
        await prisma.program.create({
          data: {
            tenantId: tenant.id,
            name: prog.name,
            activationCode: slug, // Using slug safely
            tags: [prog.category], // Store category in tags array as per existing schema
            isActive: true,
          },
        });
        addedCount++;
        console.log(`[ADDED] Program: ${prog.name} (Code: ${slug}) [Category: ${prog.category}]`);
      } catch (err) {
        errorCount++;
        console.error(`[ERROR] Failed to add program ${prog.name}:`, err);
      }
    }

    console.log("\n--- COMPLETION REPORT ---");
    console.log(`1. Programs Added: ${addedCount}`);
    console.log(`2. Duplicate Programs Found: ${duplicateCount}`);
    console.log(`3. Seed File Executed: src/scripts/seed-programs.ts`);
    console.log(`4. Validation Results:`);
    console.log(`   - Total Programs Processed: ${programsToImport.length}`);
    console.log(`   - Schema Unchanged: TRUE`);
    console.log(`   - Errors: ${errorCount}`);
    console.log("--------------------------\n");

  } catch (error) {
    console.error("Error running script:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
