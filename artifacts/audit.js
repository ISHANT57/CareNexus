const { PrismaClient } = require('./api-server/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const orphanAreas = await prisma.area.count({ where: { clinics: { none: {} } } });
  const orphanClinics = await prisma.clinic.count({ where: { userClinicAssignments: { none: {} } } });
  const orphanUsers = await prisma.user.count({ where: { clinicAssignments: { none: {} }, role: { name: { notIn: ['SUPER_ADMIN', 'AREA_ADMIN'] } } } });

  console.log(JSON.stringify({ orphanAreas, orphanClinics, orphanUsers }));
  await prisma.$disconnect();
}
run();
