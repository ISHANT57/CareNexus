import { PrismaClient } from "@prisma/client";
import { createHash, randomBytes } from "crypto";

// ── bcryptjs via require (ESM-compatible workaround) ──────────────────────────
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // ── 1. Tenant ────────────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { domain: "northgate.nhs.uk" },
    update: {},
    create: {
      id: "e727eb86-cd40-487a-b651-1db925c58376",
      name: "Northgate Mental Health Trust",
      domain: "northgate.nhs.uk",
      isActive: true,
    },
  });
  console.log("✅ Tenant:", tenant.name);

  // ── 2. System Roles ──────────────────────────────────────────────────────────
  const roleNames = [
    "SUPER_ADMIN",
    "AREA_ADMIN",
    "CLINIC_ADMIN",
    "DOCTOR",
    "OPERATOR",
    "STAFF",
  ];

  const roles = {};
  for (const name of roleNames) {
    let role = await prisma.role.findFirst({ where: { name, tenantId: null } });
    if (!role) {
      role = await prisma.role.create({
        data: { tenantId: null, name, description: `${name} system role`, isSystem: true },
      });
    }
    roles[name] = role;
  }
  console.log("✅ Roles created:", Object.keys(roles).join(", "));

  // ── 3. Admin User ────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("Admin1234!", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@northgate.nhs.uk" },
    update: {},
    create: {
      tenantId: tenant.id,
      roleId: roles["SUPER_ADMIN"].id,
      firstName: "System",
      lastName: "Administrator",
      email: "admin@northgate.nhs.uk",
      password: passwordHash,
      status: "ACTIVE",
      emailVerified: true,
    },
  });
  console.log("✅ Admin user:", adminUser.email);

  // Doctor user
  const doctorUser = await prisma.user.upsert({
    where: { email: "dr.smith@northgate.nhs.uk" },
    update: {},
    create: {
      tenantId: tenant.id,
      roleId: roles["DOCTOR"].id,
      firstName: "James",
      lastName: "Smith",
      email: "dr.smith@northgate.nhs.uk",
      password: passwordHash,
      status: "ACTIVE",
      emailVerified: true,
    },
  });
  console.log("✅ Doctor user:", doctorUser.email);

  // ── 4. Areas ─────────────────────────────────────────────────────────────────
  const areaNames = ["North London", "South London", "East Midlands", "West Yorkshire"];
  const areas = [];
  for (const name of areaNames) {
    const area = await prisma.area.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name } },
      update: {},
      create: { tenantId: tenant.id, name },
    });
    areas.push(area);
  }
  console.log("✅ Areas:", areas.map((a) => a.name).join(", "));

  // ── 5. Clinics ───────────────────────────────────────────────────────────────
  const clinicDefs = [
    { areaIdx: 0, name: "Highbury CMHT", address: "12 Highbury Park, London N5 2AA" },
    { areaIdx: 1, name: "Brixton Wellbeing Centre", address: "45 Coldharbour Lane, London SE5 9NR" },
    { areaIdx: 2, name: "Leicester Gateway", address: "88 St Mathews Way, Leicester LE1 2RD" },
    { areaIdx: 3, name: "Bradford Recovery Hub", address: "22 Manningham Lane, Bradford BD1 3BW" },
  ];
  const clinics = [];
  for (const def of clinicDefs) {
    const area = areas[def.areaIdx];
    const clinic = await prisma.clinic.upsert({
      where: { areaId_name: { areaId: area.id, name: def.name } },
      update: {},
      create: { tenantId: tenant.id, areaId: area.id, name: def.name, address: def.address },
    });
    clinics.push(clinic);
  }
  console.log("✅ Clinics:", clinics.map((c) => c.name).join(", "));

  // ── 6. Programs ──────────────────────────────────────────────────────────────
  const programDefs = [
    { name: "MSK Physiotherapy", activationCode: "MSK-2024", tags: ["musculoskeletal", "physiotherapy"] },
    { name: "Diabetes Prevention", activationCode: "DIAB-PREV", tags: ["diabetes", "prevention"] },
    { name: "IAPT Talking Therapies", activationCode: "IAPT-TTH", tags: ["mental-health", "therapy"] },
    { name: "Cardiac Rehab", activationCode: "CARD-REHAB", tags: ["cardiac", "rehabilitation"] },
    { name: "CAMHS Transitions", activationCode: "CAMHS-TR", tags: ["camhs", "transition"] },
  ];
  const programs = [];
  for (const def of programDefs) {
    const program = await prisma.program.upsert({
      where: { tenantId_activationCode: { tenantId: tenant.id, activationCode: def.activationCode } },
      update: {},
      create: { tenantId: tenant.id, ...def, isActive: true, priority: programs.length },
    });
    programs.push(program);
  }
  console.log("✅ Programs:", programs.map((p) => p.name).join(", "));

  // ── 7. Patients ──────────────────────────────────────────────────────────────
  const patientDefs = [
    { nhsNumber: "9000000001", firstName: "Alice", lastName: "Thompson", gender: "FEMALE", status: "ACTIVE", programIdx: 0, clinicIdx: 0, areaIdx: 0 },
    { nhsNumber: "9000000002", firstName: "Bob", lastName: "Patel", gender: "MALE", status: "ACTIVE", programIdx: 1, clinicIdx: 1, areaIdx: 1 },
    { nhsNumber: "9000000003", firstName: "Carol", lastName: "Wright", gender: "FEMALE", status: "INACTIVE", programIdx: 2, clinicIdx: 2, areaIdx: 2 },
    { nhsNumber: "9000000004", firstName: "David", lastName: "Singh", gender: "MALE", status: "ACTIVE", programIdx: 3, clinicIdx: 3, areaIdx: 3 },
    { nhsNumber: "9000000005", firstName: "Emma", lastName: "Brown", gender: "FEMALE", status: "ACTIVE", programIdx: 0, clinicIdx: 0, areaIdx: 0 },
    { nhsNumber: "9000000006", firstName: "Frank", lastName: "Jones", gender: "MALE", status: "INACTIVE", programIdx: 4, clinicIdx: 1, areaIdx: 1 },
    { nhsNumber: "9000000007", firstName: "Grace", lastName: "Williams", gender: "FEMALE", status: "ACTIVE", programIdx: 2, clinicIdx: 2, areaIdx: 2 },
    { nhsNumber: "9000000008", firstName: "Henry", lastName: "Davis", gender: "MALE", status: "ACTIVE", programIdx: 1, clinicIdx: 3, areaIdx: 3 },
  ];

  const patients = [];
  for (const def of patientDefs) {
    const patient = await prisma.patient.upsert({
      where: { tenantId_nhsNumber: { tenantId: tenant.id, nhsNumber: def.nhsNumber } },
      update: {},
      create: {
        tenantId: tenant.id,
        nhsNumber: def.nhsNumber,
        firstName: def.firstName,
        lastName: def.lastName,
        gender: def.gender,
        status: def.status,
        mobile: `+447${def.nhsNumber.slice(-9)}`,
        email: `${def.firstName.toLowerCase()}.${def.lastName.toLowerCase()}@example.com`,
        programId: programs[def.programIdx].id,
        clinicId: clinics[def.clinicIdx].id,
        areaId: areas[def.areaIdx].id,
        country: "UK",
        registrationDate: new Date(),
        createdBy: adminUser.id,
      },
    });
    patients.push(patient);

    // Journey event for each patient
    const existing = await prisma.patientJourneyEvent.findFirst({ where: { patientId: patient.id } });
    if (!existing) {
      await prisma.patientJourneyEvent.create({
        data: {
          patientId: patient.id,
          status: "NEW",
          notes: "Initial registration",
          actedBy: adminUser.id,
        },
      });
    }
  }
  console.log("✅ Patients:", patients.map((p) => `${p.firstName} ${p.lastName}`).join(", "));

  // ── 8. Audit Log entries ─────────────────────────────────────────────────────
  const existing = await prisma.auditLog.findFirst({ where: { tenantId: tenant.id } });
  if (!existing) {
    await prisma.auditLog.createMany({
      data: [
        { tenantId: tenant.id, entityType: "User", entityId: adminUser.id, action: "CREATE", actorId: adminUser.id, afterValue: { email: adminUser.email } },
        { tenantId: tenant.id, entityType: "User", entityId: adminUser.id, action: "LOGIN", actorId: adminUser.id },
        ...patients.slice(0, 5).map((p) => ({
          tenantId: tenant.id,
          entityType: "Patient",
          entityId: p.id,
          action: "CREATE",
          actorId: adminUser.id,
          afterValue: { nhsNumber: p.nhsNumber, name: `${p.firstName} ${p.lastName}` },
        })),
      ],
    });
    console.log("✅ Audit logs seeded");
  }

  console.log("\n🎉 Seed complete!");
  console.log("────────────────────────────");
  console.log("Login:    admin@northgate.nhs.uk");
  console.log("Password: Admin1234!");
  console.log("────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
