import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function safeExecute(pool: mysql.Pool, sql: string) {
  try {
    await pool.execute(sql);
  } catch (err: any) {
    // Ignore duplicate column name (1060) or duplicate key name (1061)
    if (err.errno === 1060 || err.errno === 1061) {
      return;
    }
    throw err;
  }
}

async function createTable() {
  const MYSQL_URL = process.env.MYSQL_DATABASE_URL || "mysql://root@localhost:3306/pms2";
  const pool = mysql.createPool({ uri: MYSQL_URL });
  
  try {
    // 1. Audit Table
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

    // 2. Sync Queue Table
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

    // 3. DLQ Table
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

    // 4. program_enrollments
    const sqlProgramEnrollments = `
    CREATE TABLE IF NOT EXISTS \`program_enrollments\` (
      \`id\`          CHAR(36)     NOT NULL,
      \`tenantId\`    CHAR(36)     NOT NULL,
      \`patientId\`   CHAR(36)     NOT NULL,
      \`programId\`   CHAR(36)     NOT NULL,
      \`enrolledAt\`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`completedAt\` TIMESTAMP    NULL     DEFAULT NULL,
      \`status\`      ENUM('ACTIVE','COMPLETED','CANCELLED') NOT NULL DEFAULT 'ACTIVE',
      \`notes\`       LONGTEXT              DEFAULT NULL,
      \`createdAt\`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      \`deletedAt\`   TIMESTAMP    NULL     DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`pe_tenantId_idx\` (\`tenantId\`),
      KEY \`pe_patientId_idx\` (\`patientId\`),
      KEY \`pe_programId_idx\` (\`programId\`),
      CONSTRAINT \`fk_pe_tenantId\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_pe_patientId\` FOREIGN KEY (\`patientId\`) REFERENCES \`patients\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_pe_programId\` FOREIGN KEY (\`programId\`) REFERENCES \`programs\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.execute(sqlProgramEnrollments);

    // 5. appointments
    const sqlAppointments = `
    CREATE TABLE IF NOT EXISTS \`appointments\` (
      \`id\`              CHAR(36)     NOT NULL,
      \`tenantId\`        CHAR(36)     NOT NULL,
      \`patientId\`       CHAR(36)     NOT NULL,
      \`doctorId\`        CHAR(36)     NOT NULL,
      \`clinicId\`        CHAR(36)     NOT NULL,
      \`appointmentDate\` TIMESTAMP    NOT NULL,
      \`durationMinutes\` INT          NOT NULL DEFAULT 30,
      \`status\`          ENUM('SCHEDULED','COMPLETED','CANCELLED','NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
      \`notes\`           LONGTEXT              DEFAULT NULL,
      \`createdAt\`       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\`       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      \`deletedAt\`       TIMESTAMP    NULL     DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`appt_tenantId_idx\` (\`tenantId\`),
      KEY \`appt_patientId_idx\` (\`patientId\`),
      KEY \`appt_doctorId_idx\` (\`doctorId\`),
      KEY \`appt_clinicId_idx\` (\`clinicId\`),
      CONSTRAINT \`fk_appt_tenantId\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_appt_patientId\` FOREIGN KEY (\`patientId\`) REFERENCES \`patients\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_appt_doctorId\` FOREIGN KEY (\`doctorId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_appt_clinicId\` FOREIGN KEY (\`clinicId\`) REFERENCES \`clinics\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.execute(sqlAppointments);

    // 6. consultations
    const sqlConsultations = `
    CREATE TABLE IF NOT EXISTS \`consultations\` (
      \`id\`                   CHAR(36)     NOT NULL,
      \`tenantId\`             CHAR(36)     NOT NULL,
      \`patientId\`            CHAR(36)     NOT NULL,
      \`appointmentId\`        CHAR(36)     NOT NULL,
      \`doctorId\`             CHAR(36)     NOT NULL,
      \`clinicId\`             CHAR(36)     NOT NULL,
      \`chiefComplaint\`       LONGTEXT     NOT NULL,
      \`symptoms\`             LONGTEXT     NOT NULL,
      \`observations\`         LONGTEXT     NOT NULL,
      \`diagnosis\`            LONGTEXT     NOT NULL,
      \`treatmentPlan\`        LONGTEXT     NOT NULL,
      \`medications\`          LONGTEXT     NOT NULL,
      \`followUpInstructions\` LONGTEXT     NOT NULL,
      \`consultationDate\`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`createdAt\`            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\`            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      \`deletedAt\`            TIMESTAMP    NULL     DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`cons_appointmentId_unique\` (\`appointmentId\`),
      KEY \`cons_tenantId_idx\` (\`tenantId\`),
      KEY \`cons_patientId_idx\` (\`patientId\`),
      KEY \`cons_doctorId_idx\` (\`doctorId\`),
      KEY \`cons_clinicId_idx\` (\`clinicId\`),
      CONSTRAINT \`fk_cons_tenantId\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_cons_patientId\` FOREIGN KEY (\`patientId\`) REFERENCES \`patients\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_cons_appointmentId\` FOREIGN KEY (\`appointmentId\`) REFERENCES \`appointments\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_cons_doctorId\` FOREIGN KEY (\`doctorId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_cons_clinicId\` FOREIGN KEY (\`clinicId\`) REFERENCES \`clinics\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.execute(sqlConsultations);

    // 7. outcome_metrics
    const sqlOutcomeMetrics = `
    CREATE TABLE IF NOT EXISTS \`outcome_metrics\` (
      \`id\`          CHAR(36)     NOT NULL,
      \`tenantId\`    CHAR(36)     NOT NULL,
      \`code\`        VARCHAR(100) NOT NULL,
      \`name\`        VARCHAR(255) NOT NULL,
      \`category\`    VARCHAR(255) NOT NULL,
      \`unit\`        VARCHAR(50)  NOT NULL,
      \`description\` LONGTEXT              DEFAULT NULL,
      \`isActive\`    TINYINT(1)   NOT NULL DEFAULT 1,
      \`createdAt\`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`om_tenantId_code_unique\` (\`tenantId\`, \`code\`),
      KEY \`om_tenantId_idx\` (\`tenantId\`),
      CONSTRAINT \`fk_om_tenantId\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.execute(sqlOutcomeMetrics);

    // 8. patient_outcomes
    const sqlPatientOutcomes = `
    CREATE TABLE IF NOT EXISTS \`patient_outcomes\` (
      \`id\`              CHAR(36)     NOT NULL,
      \`tenantId\`        CHAR(36)     NOT NULL,
      \`patientId\`       CHAR(36)     NOT NULL,
      \`programId\`       CHAR(36)     NOT NULL,
      \`outcomeMetricId\` CHAR(36)     NOT NULL,
      \`doctorId\`        CHAR(36)              DEFAULT NULL,
      \`baselineValue\`   DOUBLE       NOT NULL,
      \`currentValue\`    DOUBLE       NOT NULL,
      \`targetValue\`     DOUBLE       NOT NULL,
      \`measuredAt\`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`notes\`           LONGTEXT              DEFAULT NULL,
      \`createdAt\`       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\`       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      \`deletedAt\`       TIMESTAMP    NULL     DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`po_tenantId_idx\` (\`tenantId\`),
      KEY \`po_patientId_idx\` (\`patientId\`),
      KEY \`po_programId_idx\` (\`programId\`),
      KEY \`po_outcomeMetricId_idx\` (\`outcomeMetricId\`),
      CONSTRAINT \`fk_po_tenantId\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_po_patientId\` FOREIGN KEY (\`patientId\`) REFERENCES \`patients\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_po_programId\` FOREIGN KEY (\`programId\`) REFERENCES \`programs\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_po_outcomeMetricId\` FOREIGN KEY (\`outcomeMetricId\`) REFERENCES \`outcome_metrics\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_po_doctorId\` FOREIGN KEY (\`doctorId\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.execute(sqlPatientOutcomes);

    // 9. care_tasks
    const sqlCareTasks = `
    CREATE TABLE IF NOT EXISTS \`care_tasks\` (
      \`id\`          CHAR(36)     NOT NULL,
      \`tenantId\`    CHAR(36)     NOT NULL,
      \`patientId\`   CHAR(36)     NOT NULL,
      \`assignedBy\`  CHAR(36)              DEFAULT NULL,
      \`assignedTo\`  CHAR(36)              DEFAULT NULL,
      \`title\`       VARCHAR(255) NOT NULL,
      \`description\` LONGTEXT              DEFAULT NULL,
      \`priority\`    ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
      \`dueDate\`     TIMESTAMP    NOT NULL,
      \`status\`      ENUM('PENDING','IN_PROGRESS','COMPLETED','OVERDUE') NOT NULL DEFAULT 'PENDING',
      \`completedAt\` TIMESTAMP    NULL     DEFAULT NULL,
      \`createdAt\`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      \`deletedAt\`   TIMESTAMP    NULL     DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`ct_tenantId_idx\` (\`tenantId\`),
      KEY \`ct_patientId_idx\` (\`patientId\`),
      KEY \`ct_assignedTo_idx\` (\`assignedTo\`),
      KEY \`ct_dueDate_idx\` (\`dueDate\`),
      KEY \`ct_status_idx\` (\`status\`),
      CONSTRAINT \`fk_ct_tenantId\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_ct_patientId\` FOREIGN KEY (\`patientId\`) REFERENCES \`patients\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_ct_assignedBy\` FOREIGN KEY (\`assignedBy\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL,
      CONSTRAINT \`fk_ct_assignedTo\` FOREIGN KEY (\`assignedTo\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.execute(sqlCareTasks);

    // 10. ALTER patients table for missing columns
    console.log("Altering patients table in MySQL...");
    await safeExecute(pool, "ALTER TABLE patients ADD COLUMN riskScore DOUBLE DEFAULT 0");
    await safeExecute(pool, "ALTER TABLE patients ADD COLUMN riskLevel ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'LOW'");
    await safeExecute(pool, "ALTER TABLE patients ADD COLUMN lastCalculatedAt TIMESTAMP NULL DEFAULT NULL");

    // 11. ALTER programs table for description
    console.log("Altering programs table in MySQL...");
    await safeExecute(pool, "ALTER TABLE programs ADD COLUMN description LONGTEXT DEFAULT NULL");

    console.log("MySQL Database Sync, Queue, and Mirror tables fully created and updated.");
  } catch (err) {
    console.error("Error creating/altering tables:", err);
  } finally {
    await pool.end();
  }
}

createTable();
