import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Find or create tenant
    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: "Default Tenant",
          domain: "default.example.com",
        },
      });
      console.log(`Created default tenant: ${tenant.id}`);
    } else {
      console.log(`Found tenant: ${tenant.id} (${tenant.name})`);
    }

    // 2. Find or create superadmin role
    let role = await prisma.role.findFirst({
      where: { name: "Super Admin" },
    });
    
    if (!role) {
      // Let's see if we have ANY role to use, or just create one
      role = await prisma.role.findFirst({
        where: { name: { contains: "Admin", mode: "insensitive" } }
      });
      
      if (!role) {
        role = await prisma.role.create({
          data: {
            name: "Super Admin",
            description: "System super administrator",
            isSystem: true,
            tenantId: tenant.id,
          },
        });
        console.log(`Created Super Admin role: ${role.id}`);
      } else {
        console.log(`Found existing Admin role: ${role.id} (${role.name})`);
      }
    } else {
      console.log(`Found Super Admin role: ${role.id}`);
    }

    // 3. Create or update user
    const email = "ishantbhoyar59@gmail.com";
    const passwordHash = await bcrypt.hash("ishant@123", 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: passwordHash,
        firstName: "Ishant",
        lastName: "Superadmin",
        status: "ACTIVE",
      },
      create: {
        email,
        password: passwordHash,
        firstName: "Ishant",
        lastName: "Superadmin",
        status: "ACTIVE",
        emailVerified: true,
        tenantAssignments: { create: { tenantId: tenant.id, roleId: role.id } }
      },
    });

    console.log(`✅ Successfully created/updated superadmin user: ${user.email}`);
  } catch (error) {
    console.error("Error creating superadmin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
