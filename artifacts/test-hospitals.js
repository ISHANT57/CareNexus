const { PrismaClient } = require('./api-server/node_modules/@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const c1 = await prisma.clinic.findFirst({ where: { name: { contains: 'Oscar' } } });
  console.log('Oscar Clinic:', c1);
  const c2 = await prisma.clinic.findFirst({ where: { name: { contains: 'Ramkrishna' } } });
  console.log('Ramkrishna Clinic:', c2);
  const t1 = await prisma.tenant.findFirst({ where: { name: { contains: 'Oscar' } } });
  console.log('Oscar Tenant:', t1);
  await prisma.$disconnect();
}
run();
