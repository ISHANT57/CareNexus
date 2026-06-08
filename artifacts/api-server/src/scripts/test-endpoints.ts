import app from "../app.js";
import { connectDB, disconnectDB } from "../lib/prisma.js";
import { connectMySQL, disconnectMySQL } from "../lib/mysql.js";

async function testEndpoints() {
  await connectDB();
  await connectMySQL();

  const server = app.listen(5001, async () => {
    console.log("Test server started on port 5001");
    try {
      const fetchJson = async (url: string) => {
        const r = await fetch(url);
        return await r.json();
      };
      
      const pg = await fetchJson("http://localhost:5001/api/health/postgres");
      console.log("POSTGRES HEALTH:", pg);

      const my = await fetchJson("http://localhost:5001/api/health/mysql");
      console.log("MYSQL HEALTH:", my);

      const sync = await fetchJson("http://localhost:5001/api/health/database-sync");
      console.log("SYNC HEALTH:", sync);

      await disconnectDB();
      await disconnectMySQL();
      server.close();
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });
}

testEndpoints();
