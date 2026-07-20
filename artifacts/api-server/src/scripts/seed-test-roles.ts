import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

// Shared dev password for all test-role accounts.
const PASSWORD = "Caremesh@123";

// One test login per role. DOCTOR/CLINIC_ADMIN/STAFF/AREA_ADMIN are all
// clinic-scoped (see roleScope.ts): a non-SUPER_ADMIN with no clinic
// assignment sees nothing, so every account below gets wired to a real
// clinic that actually has patients.
const ACCOUNTS = [
  { role: "AREA_ADMIN",   email: "areaadmin@caremesh.test",   firstName: "Ava",   lastName: "AreaAdmin" },
  { role: "CLINIC_ADMIN", email: "clinicadmin@caremesh.test", firstName: "Cara",  lastName: "ClinicAdmin" },
  { role: "DOCTOR",       email: "doctor@caremesh.test",      firstName: "Dev",   lastName: "Doctor" },
  { role: "STAFF",        email: "staff@caremesh.test",       firstName: "Sam",   lastName: "Staff" },
];

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  // Any clinic that actually has patients works for scoping. (This Prisma
  // build rejects null literals in filters, so we filter in JS instead.)
  const candidates = await prisma.patient.findMany({
    where: { deletedAt: null },
    select: { clinicId: true, tenantId: true, areaId: true },
    take: 200,
  });
  const sample = candidates.find((p) => p.clinicId && p.tenantId && p.areaId);
  if (!sample) throw new Error("No patient with clinic+area+tenant found — seed base data first.");
  const { clinicId, tenantId, areaId } = sample as { clinicId: string; tenantId: string; areaId: string };

  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId }, select: { name: true } });
  console.log(`Target clinic: ${clinic?.name} (${clinicId}) in area ${areaId}, tenant ${tenantId}`);

  const roles = await prisma.role.findMany({
    where: { name: { in: ACCOUNTS.map((a) => a.role) } },
  });
  const roleByName = new Map(roles.map((r) => [r.name, r]));

  for (const acct of ACCOUNTS) {
    const role = roleByName.get(acct.role);
    if (!role) { console.warn(`⚠️  Role ${acct.role} not found — skipping ${acct.email}`); continue; }

    // NOTE: the live `users` table still carries stale NOT-NULL `tenantId`
    // and `roleId` columns that the current Prisma model dropped. Prisma
    // can't populate columns it doesn't model, so create/update via raw SQL.
    const rows = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `INSERT INTO users (id,"tenantId","roleId","firstName","lastName",email,password,status,"emailVerified","updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,'ACTIVE',true,now())
       ON CONFLICT (email) DO UPDATE SET
         password=EXCLUDED.password, status='ACTIVE', "emailVerified"=true,
         "deletedAt"=NULL, "tenantId"=EXCLUDED."tenantId", "roleId"=EXCLUDED."roleId", "updatedAt"=now()
       RETURNING id;`,
      randomUUID(), tenantId, role.id, acct.firstName, acct.lastName, acct.email, passwordHash
    );
    const user = { id: rows[0].id };

    // Role within tenant.
    await prisma.userTenantAssignment.upsert({
      where: { userId_tenantId: { userId: user.id, tenantId } },
      update: { roleId: role.id, status: "ACTIVE" },
      create: { userId: user.id, tenantId, roleId: role.id, status: "ACTIVE" },
    });

    // Clinic assignment — required for all scoped roles to see any data.
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
          where: { clinicId, deletedAt: null },
          select: { id: true },
          take: 25,
        });
        await prisma.doctorPatientAssignment.createMany({
          data: patients.map((p) => ({ tenantId, areaId, clinicId, doctorId: user.id, patientId: p.id })),
        });
        console.log(`  → assigned ${patients.length} patients to doctor`);
      }
    }

    console.log(`✅ ${acct.role.padEnd(13)} ${acct.email}`);
  }

  console.log("\n──────────────────────────────────────────────");
  console.log(`All accounts share password: ${PASSWORD}`);
  console.log("──────────────────────────────────────────────");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
