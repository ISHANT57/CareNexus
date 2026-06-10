import { PrismaClient } from '@prisma/client';
import { signAccessToken } from './src/lib/jwt.js';

const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findFirst({where: {email: 'ishantbhoyar59@gmail.com'}, include: {role: true}});
  const token = signAccessToken({userId: user.id, tenantId: user.tenantId, email: user.email, role: user.role.name});
  
  console.log("Fetching WITH ALL header...");
  const res = await fetch('http://localhost:5000/api/tenants?limit=1000', {
    headers: { Authorization: 'Bearer ' + token, 'x-tenant-id': 'ALL' }
  });
  const data = await res.json();
  console.log(`Status: ${res.status}`);
  console.log(`Total count from API: ${data.data?.length}`);
  console.log(data.data?.map(t => t.name));

  console.log("Fetching WITHOUT ALL header...");
  const res2 = await fetch('http://localhost:5000/api/tenants?limit=1000', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const data2 = await res2.json();
  console.log(`Status: ${res2.status}`);
  console.log(`Total count from API: ${data2.data?.length}`);
  console.log(data2.data?.map(t => t.name));
}

run();
