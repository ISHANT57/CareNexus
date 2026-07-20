import { prisma } from "../lib/prisma.js";

async function main() {
  const users = await prisma.user.findMany({
    include: { role: true, tenant: true }
  });

  const superAdmins = users.filter(u => u.role.name === "SUPER_ADMIN");
  console.log(`Found ${superAdmins.length} SUPER_ADMIN accounts.`);

  for (const user of superAdmins) {
    console.log(`- ${user.email} (Tenant: ${user.tenant.name})`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
