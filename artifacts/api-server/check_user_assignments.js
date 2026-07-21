import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "aashirwadhospital@gmail.com" },
    include: {
      clinicAssignments: {
        include: {
          clinic: true
        }
      }
    }
  });

  if (!user) {
    console.log("User aashirwadhospital@gmail.com not found!");
    return;
  }

  console.log(`USER: ${user.firstName} ${user.lastName} (Role: ${user.roleId})`);
  console.log(`Clinic assignments count: ${user.clinicAssignments.length}`);
  for (const a of user.clinicAssignments) {
    console.log(`- Assigned to clinic: ${a.clinic.name} (${a.clinicId})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
