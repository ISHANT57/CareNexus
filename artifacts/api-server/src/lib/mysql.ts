import mysql from "mysql2/promise";
import { logger } from "./logger.js";

const MYSQL_URL = process.env.MYSQL_DATABASE_URL || "mysql://root@localhost:3306/pms2";

export const mysqlPool = mysql.createPool({
  uri: MYSQL_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function connectMySQL(): Promise<void> {
  try {
    const connection = await mysqlPool.getConnection();
    logger.info("MySQL Database connected");
    connection.release();
  } catch (err) {
    logger.error({ err }, "MySQL Database connection failed. Sync will retry later.");
    // We do NOT process.exit(1) here because MySQL is secondary. 
    // PostgreSQL is the primary source of truth, so we should allow graceful startup.
  }
}

export async function disconnectMySQL(): Promise<void> {
  await mysqlPool.end();
  logger.info("MySQL Database disconnected");
}
