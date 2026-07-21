USE `pms2`;

CREATE TABLE IF NOT EXISTS `database_sync_audit` (
  `id`              CHAR(36)     NOT NULL,
  `entityType`      VARCHAR(100) NOT NULL,
  `entityId`        CHAR(36)     NOT NULL,
  `operation`       VARCHAR(100) NOT NULL,
  `postgresStatus`  VARCHAR(50)  NOT NULL,
  `mysqlStatus`     VARCHAR(50)  NOT NULL,
  `errorMessage`    LONGTEXT              DEFAULT NULL,
  `createdAt`       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sync_entityType_entityId_idx` (`entityType`, `entityId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
