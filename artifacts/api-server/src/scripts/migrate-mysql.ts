import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function createTable() {
  const MYSQL_URL = process.env.MYSQL_DATABASE_URL || "mysql://root@localhost:3306/pms2";
  const pool = mysql.createPool({ uri: MYSQL_URL });
  
  try {
    const sqlAudit = `
    CREATE TABLE IF NOT EXISTS \`database_sync_audit\` (
      \`id\`              CHAR(36)     NOT NULL,
      \`entityType\`      VARCHAR(100) NOT NULL,
      \`entityId\`        CHAR(36)     NOT NULL,
      \`operation\`       VARCHAR(100) NOT NULL,
      \`postgresStatus\`  VARCHAR(50)  NOT NULL,
      \`mysqlStatus\`     VARCHAR(50)  NOT NULL,
      \`errorMessage\`    LONGTEXT              DEFAULT NULL,
      \`createdAt\`       TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`sync_entityType_entityId_idx\` (\`entityType\`, \`entityId\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.execute(sqlAudit);

    const sqlSync = `
    CREATE TABLE IF NOT EXISTS \`sync_queue_items\` (
      \`id\`              CHAR(36)     NOT NULL,
      \`entityType\`      VARCHAR(100) NOT NULL,
      \`entityId\`        CHAR(36)     NOT NULL,
      \`operation\`       VARCHAR(100) NOT NULL,
      \`payload\`         JSON         NOT NULL,
      \`retryCount\`      INT          NOT NULL DEFAULT 0,
      \`status\`          VARCHAR(50)  NOT NULL DEFAULT 'PENDING',
      \`error\`           LONGTEXT              DEFAULT NULL,
      \`createdAt\`       TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\`       TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`sync_queue_status_idx\` (\`status\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.execute(sqlSync);

    const sqlDLQ = `
    CREATE TABLE IF NOT EXISTS \`dead_letter_queue_items\` (
      \`id\`              CHAR(36)     NOT NULL,
      \`entityType\`      VARCHAR(100) NOT NULL,
      \`entityId\`        CHAR(36)     NOT NULL,
      \`operation\`       VARCHAR(100) NOT NULL,
      \`payload\`         JSON         NOT NULL,
      \`retryCount\`      INT          NOT NULL,
      \`error\`           LONGTEXT     NOT NULL,
      \`createdAt\`       TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.execute(sqlDLQ);

    console.log("MySQL Database Sync & Queue tables created.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    await pool.end();
  }
}

createTable();
