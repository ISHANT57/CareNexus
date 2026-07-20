import { prisma } from "../lib/prisma.js";

async function main() {
  const users = await prisma.user.findMany({
    include: { tenantAssignments: { include: { role: true, tenant: true } } }
  });

  const superAdmins = users.filter(u => u.tenantAssignments.some(a => a.role.name === "SUPER_ADMIN"));
  console.log(`Found ${superAdmins.length} SUPER_ADMIN accounts.`);

  for (const user of superAdmins) {
    const adminAssignment = user.tenantAssignments.find(a => a.role.name === "SUPER_ADMIN");
    console.log(`- ${user.email} (Tenant: ${adminAssignment?.tenant.name})`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
