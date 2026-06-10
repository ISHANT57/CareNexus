const { PrismaClient } = require('./api-server/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const tenants = await prisma.tenant.count();
  const areas = await prisma.area.count();
  const clinics = await prisma.clinic.count();
  const programs = await prisma.program.count();
  console.log(JSON.stringify({ tenants, areas, clinics, programs }));
  await prisma.$disconnect();
}
run();
