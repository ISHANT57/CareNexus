import { SyncWorker } from "../services/SyncWorker.js";
import { connectDB, disconnectDB } from "../lib/prisma.js";
import { connectMySQL, disconnectMySQL } from "../lib/mysql.js";

async function run() {
  await connectDB();
  await connectMySQL();
  const worker = new SyncWorker();
  worker.start();
  
  console.log("Worker started. Running for 15 seconds to flush queue...");
  await new Promise(r => setTimeout(r, 15000));
  
  worker.stop();
  await disconnectDB();
  await disconnectMySQL();
  console.log("Worker stopped. Queue flushed.");
  process.exit(0);
}

run().catch(console.error);
