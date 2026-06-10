const { PrismaClient } = require('./api-server/node_modules/@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const tenants = await prisma.tenant.findMany({ select: { name: true } });
  console.log(JSON.stringify(tenants.map(t => t.name), null, 2));
  await prisma.$disconnect();
}
run();
