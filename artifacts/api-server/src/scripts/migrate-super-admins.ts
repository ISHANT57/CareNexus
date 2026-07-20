import { prisma } from "../lib/prisma.js";

async function main() {
  const users = await prisma.user.findMany({
    include: { role: true, tenant: true }
  });

  const superAdmins = users.filter(u => u.role.name === "SUPER_ADMIN");
  console.log(`Found ${superAdmins.length} SUPER_ADMIN accounts.`);

  const clinicAdminRole = await prisma.role.findFirst({
    where: { name: "CLINIC_ADMIN", isSystem: true },
  });

  if (!clinicAdminRole) {
    throw new Error("CLINIC_ADMIN system role not found.");
  }

  let migratedCount = 0;

  for (const user of superAdmins) {
    // Preserve the legitimate platform seed
    if (user.email === "admin@northgate.nhs.uk") {
      console.log(`[PRESERVED] ${user.email} is the legitimate platform admin.`);
      continue;
    }

    console.log(`[MIGRATING] Downgrading ${user.email} (Tenant: ${user.tenant.name}) to CLINIC_ADMIN`);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { roleId: clinicAdminRole.id },
    });

    migratedCount++;
  }

  console.log(`\nMigration complete. Successfully downgraded ${migratedCount} accounts to CLINIC_ADMIN.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
