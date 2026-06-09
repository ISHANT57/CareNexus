import { prisma } from "../lib/prisma.js";

async function main() {
  const programs = await prisma.program.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      tenantId: true,
      activationCode: true,
      createdAt: true
    }
  });
  console.log("Programs in Postgres:", JSON.stringify(programs, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
