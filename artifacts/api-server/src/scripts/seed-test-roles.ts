import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Shared dev password for all test-role accounts.
const PASSWORD = "Caremesh@123";

// One test login per role. Every non-SUPER_ADMIN role is clinic-scoped
// (see roleScope.ts): a user with no clinic assignment sees nothing, so
// each account below is wired to a real clinic that has patients.
const ACCOUNTS = [
  { role: "AREA_ADMIN",   email: "areaadmin@caremesh.test",   firstName: "Ava",  lastName: "AreaAdmin" },
  { role: "CLINIC_ADMIN", email: "clinicadmin@caremesh.test", firstName: "Cara", lastName: "ClinicAdmin" },
  { role: "DOCTOR",       email: "doctor@caremesh.test",      firstName: "Dev",  lastName: "Doctor" },
  { role: "STAFF",        email: "staff@caremesh.test",       firstName: "Sam",  lastName: "Staff" },
];

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  // Any clinic that actually has patients works for scoping.
  const candidates = await prisma.patient.findMany({
    where: { deletedAt: null },
    select: { clinicId: true, tenantId: true, areaId: true },
    take: 200,
  });
  const sample = candidates.find((p) => p.clinicId && p.tenantId && p.areaId);
  if (!sample) throw new Error("No patient with clinic+area+tenant found — seed base data first.");
  const { clinicId, tenantId, areaId } = sample as { clinicId: string; tenantId: string; areaId: string };

  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId }, select: { name: true } });
  console.log(`Target clinic: ${clinic?.name} (${clinicId})`);

  const roles = await prisma.role.findMany({ where: { name: { in: ACCOUNTS.map((a) => a.role) } } });
  const roleByName = new Map(roles.map((r) => [r.name, r]));

  for (const acct of ACCOUNTS) {
    const role = roleByName.get(acct.role);
    if (!role) { console.warn(`⚠️  Role ${acct.role} not found — skipping ${acct.email}`); continue; }

    const user = await prisma.user.upsert({
      where: { email: acct.email },
      update: {
        password: passwordHash, status: "ACTIVE", emailVerified: true,
        deletedAt: null, tenantId, roleId: role.id,
      },
      create: {
        firstName: acct.firstName, lastName: acct.lastName, email: acct.email,
        password: passwordHash, status: "ACTIVE", emailVerified: true,
        tenantId, roleId: role.id,
      },
    });

    // Clinic assignment — required for any non-super role to see data.
    await prisma.userClinicAssignment.upsert({
      where: { userId_clinicId: { userId: user.id, clinicId } },
      update: { deletedAt: null },
      create: { userId: user.id, clinicId },
    });

    // DOCTOR only sees patients via explicit doctor-patient assignments.
    if (acct.role === "DOCTOR") {
      const existing = await prisma.doctorPatientAssignment.count({
        where: { doctorId: user.id, deletedAt: null },
      });
      if (existing === 0) {
        const patients = await prisma.patient.findMany({
          where: { clinicId, deletedAt: null }, select: { id: true }, take: 25,
        });
        await prisma.doctorPatientAssignment.createMany({
          data: patients.map((p) => ({ tenantId, areaId, clinicId, doctorId: user.id, patientId: p.id })),
        });
        console.log(`  → assigned ${patients.length} patients to doctor`);
      }
    }

    console.log(`✅ ${acct.role.padEnd(13)} ${acct.email}`);
  }

  console.log(`\nAll accounts share password: ${PASSWORD}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
