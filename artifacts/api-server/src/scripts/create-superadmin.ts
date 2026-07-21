import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Owner account: bypasses every permission/tenant-scope check in the app
// (SUPER_ADMIN role short-circuits authorizePermission() and getRoleScope()
// — see src/middlewares/rbac.ts and roleScope.ts). This script only needs
// to get the account itself into the right state.
const EMAIL = process.env.SUPERADMIN_EMAIL;
const PASSWORD = process.env.SUPERADMIN_PASSWORD;

async function main() {
  if (!EMAIL || !PASSWORD) {
    throw new Error("Set SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD env vars before running this script.");
  }
  // The system SUPER_ADMIN role is global (tenantId: null) — match it
  // exactly. A fuzzy "contains Admin" fallback here would risk silently
  // assigning AREA_ADMIN/CLINIC_ADMIN instead, which is the opposite of
  // what an owner account needs.
  const role = await prisma.role.findFirst({ where: { name: "SUPER_ADMIN", tenantId: null } });
  if (!role) throw new Error("System role SUPER_ADMIN not found — run the base seed first.");

  // User.tenantId is a required column, but SUPER_ADMIN's access is not
  // restricted by it (roleScope.ts returns {} for SUPER_ADMIN and the
  // tenant switcher lets it view any tenant). Any existing tenant works
  // as the "home" row value.
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) throw new Error("No tenant found — run the base seed first.");

  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: {
      password: passwordHash,
      roleId: role.id,
      tenantId: tenant.id,
      status: "ACTIVE",
      emailVerified: true,
      deletedAt: null,
    },
    create: {
      email: EMAIL,
      password: passwordHash,
      roleId: role.id,
      tenantId: tenant.id,
      firstName: "Ishant",
      lastName: "Bhoyar",
      status: "ACTIVE",
      emailVerified: true,
    },
  });

  console.log(`✅ SUPER_ADMIN ready: ${user.email} (role: ${role.name}, home tenant: ${tenant.name})`);
  console.log(`   Full unrestricted access — bypasses all authorizePermission() and role-scope checks.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
