import "dotenv/config";
import app from "./app.js";
import { logger } from "./lib/logger.js";
import { connectDB, disconnectDB } from "./lib/prisma.js";
import { connectMySQL, disconnectMySQL } from "./lib/mysql.js";
import { SyncWorker } from "./services/SyncWorker.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const syncWorker = new SyncWorker();

async function main() {
  await connectDB();
  await connectMySQL();
  syncWorker.start();

  const server = app.listen(port, () => {
    logger.info({ port }, "Caremesh API server listening");
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutdown signal received");
    syncWorker.stop();
    server.close(async () => {
      await disconnectMySQL();
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  logger.error({ err }, "Fatal startup error");
  process.exit(1);
});
