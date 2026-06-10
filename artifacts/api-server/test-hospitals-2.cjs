const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const clinics = await prisma.clinic.findMany({
    where: { name: { contains: 'Aggarwal' } },
    include: { area: { include: { tenant: true } } }
  });
  console.log(JSON.stringify(clinics, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
