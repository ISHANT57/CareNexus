-- ============================================================
-- CAREMESH PMS — MySQL 8 Mirror Schema
-- Database: pms2
-- Source of truth: artifacts/api-server/prisma/schema.prisma
-- Generated: 2026-06-06
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;
SET time_zone = "+00:00";
/*!40101 SET NAMES utf8mb4 */;

-- ============================================================
-- CREATE DATABASE
-- ============================================================
CREATE DATABASE IF NOT EXISTS `pms2`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `pms2`;

-- ============================================================
-- TABLE: tenants
-- ============================================================
CREATE TABLE `tenants` (
  `id`                    CHAR(36)     NOT NULL,
  `name`                  VARCHAR(255) NOT NULL,
  `domain`                VARCHAR(255) NOT NULL,
  `logoUrl`               VARCHAR(500)          DEFAULT NULL,
  `onboardingSmsTemplate` LONGTEXT              DEFAULT NULL,
  `isActive`              TINYINT(1)   NOT NULL DEFAULT 1,
  `createdAt`             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt`             TIMESTAMP NULL             DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenants_domain_unique` (`domain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: areas
-- ============================================================
CREATE TABLE `areas` (
  `id`        CHAR(36)     NOT NULL,
  `tenantId`  CHAR(36)     NOT NULL,
  `name`      VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL             DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `areas_tenantId_name_unique` (`tenantId`, `name`),
  KEY `areas_tenantId_idx` (`tenantId`),
  CONSTRAINT `fk_areas_tenantId` FOREIGN KEY (`tenantId`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: clinics
-- ============================================================
CREATE TABLE `clinics` (
  `id`        CHAR(36)     NOT NULL,
  `tenantId`  CHAR(36)     NOT NULL,
  `areaId`    CHAR(36)     NOT NULL,
  `name`      VARCHAR(255) NOT NULL,
  `address`   LONGTEXT              DEFAULT NULL,
  `createdAt` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL             DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clinics_areaId_name_unique` (`areaId`, `name`),
  KEY `clinics_tenantId_idx` (`tenantId`),
  KEY `clinics_areaId_idx` (`areaId`),
  CONSTRAINT `fk_clinics_areaId` FOREIGN KEY (`areaId`) REFERENCES `areas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: roles
-- ============================================================
CREATE TABLE `roles` (
  `id`          CHAR(36)     NOT NULL,
  `tenantId`    CHAR(36)              DEFAULT NULL,
  `name`        VARCHAR(100) NOT NULL,
  `description` LONGTEXT              DEFAULT NULL,
  `isSystem`    TINYINT(1)   NOT NULL DEFAULT 0,
  `createdAt`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_tenantId_name_unique` (`tenantId`, `name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: permissions
-- ============================================================
CREATE TABLE `permissions` (
  `id`          CHAR(36)     NOT NULL,
  `module`      VARCHAR(100) NOT NULL,
  `action`      VARCHAR(100) NOT NULL,
  `description` LONGTEXT              DEFAULT NULL,
  `createdAt`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_module_action_unique` (`module`, `action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: role_permissions
-- ============================================================
CREATE TABLE `role_permissions` (
  `id`           CHAR(36)  NOT NULL,
  `roleId`       CHAR(36)  NOT NULL,
  `permissionId` CHAR(36)  NOT NULL,
  `createdAt`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_permissions_roleId_permissionId_unique` (`roleId`, `permissionId`),
  CONSTRAINT `fk_role_permissions_roleId`       FOREIGN KEY (`roleId`)       REFERENCES `roles`       (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_permissions_permissionId` FOREIGN KEY (`permissionId`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE `users` (
  `id`                  CHAR(36)     NOT NULL,
  `tenantId`            CHAR(36)     NOT NULL,
  `roleId`              CHAR(36)     NOT NULL,
  `firstName`           VARCHAR(255) NOT NULL,
  `lastName`            VARCHAR(255) NOT NULL,
  `email`               VARCHAR(255) NOT NULL,
  `password`            VARCHAR(255) NOT NULL,
  `mobile`              VARCHAR(30)           DEFAULT NULL,
  `avatarUrl`           VARCHAR(500)          DEFAULT NULL,
  `status`              ENUM('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `lastLoginAt`         TIMESTAMP NULL             DEFAULT NULL,
  `resetToken`          VARCHAR(255)          DEFAULT NULL,
  `resetTokenExpiresAt` TIMESTAMP NULL             DEFAULT NULL,
  `emailVerified`       TINYINT(1)   NOT NULL DEFAULT 0,
  `verificationToken`   VARCHAR(255)          DEFAULT NULL,
  `createdAt`           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt`           TIMESTAMP NULL             DEFAULT NULL,
  `createdBy`           CHAR(36)              DEFAULT NULL,
  `updatedBy`           CHAR(36)              DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_tenantId_idx` (`tenantId`),
  KEY `users_email_idx` (`email`),
  CONSTRAINT `fk_users_tenantId` FOREIGN KEY (`tenantId`) REFERENCES `tenants` (`id`),
  CONSTRAINT `fk_users_roleId`   FOREIGN KEY (`roleId`)   REFERENCES `roles`   (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: programs
-- ============================================================
CREATE TABLE `programs` (
  `id`             CHAR(36)     NOT NULL,
  `tenantId`       CHAR(36)     NOT NULL,
  `channelId`      INT                   DEFAULT NULL,
  `name`           VARCHAR(255) NOT NULL,
  `logoUrl`        VARCHAR(500)          DEFAULT NULL,
  `activationCode` VARCHAR(100) NOT NULL,
  `priority`       INT          NOT NULL DEFAULT 0,
  `tags`           JSON                  DEFAULT NULL,
  `isActive`       TINYINT(1)   NOT NULL DEFAULT 1,
  `createdAt`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt`      TIMESTAMP NULL             DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `programs_tenantId_activationCode_unique` (`tenantId`, `activationCode`),
  KEY `programs_tenantId_idx` (`tenantId`),
  CONSTRAINT `fk_programs_tenantId` FOREIGN KEY (`tenantId`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: user_clinic_assignments
-- ============================================================
CREATE TABLE `user_clinic_assignments` (
  `id`        CHAR(36)  NOT NULL,
  `userId`    CHAR(36)  NOT NULL,
  `clinicId`  CHAR(36)  NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL          DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uca_userId_clinicId_unique` (`userId`, `clinicId`),
  CONSTRAINT `fk_uca_userId`   FOREIGN KEY (`userId`)   REFERENCES `users`   (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_uca_clinicId` FOREIGN KEY (`clinicId`) REFERENCES `clinics` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: user_program_assignments
-- ============================================================
CREATE TABLE `user_program_assignments` (
  `id`        CHAR(36)  NOT NULL,
  `userId`    CHAR(36)  NOT NULL,
  `programId` CHAR(36)  NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL          DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `upa_userId_programId_unique` (`userId`, `programId`),
  CONSTRAINT `fk_upa_userId`    FOREIGN KEY (`userId`)    REFERENCES `users`    (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_upa_programId` FOREIGN KEY (`programId`) REFERENCES `programs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: patients
-- ============================================================
CREATE TABLE `patients` (
  `id`                    CHAR(36)     NOT NULL,
  `tenantId`              CHAR(36)     NOT NULL,
  `programId`             CHAR(36)     NOT NULL,
  `clinicId`              CHAR(36)     NOT NULL,
  `areaId`                CHAR(36)     NOT NULL,
  `nhsNumber`             VARCHAR(20)  NOT NULL,
  `title`                 VARCHAR(20)           DEFAULT NULL,
  `firstName`             VARCHAR(255) NOT NULL,
  `lastName`              VARCHAR(255) NOT NULL,
  `email`                 VARCHAR(255)          DEFAULT NULL,
  `mobile`                VARCHAR(30)  NOT NULL,
  `altMobile`             VARCHAR(30)           DEFAULT NULL,
  `gender`                ENUM('MALE','FEMALE','OTHER') DEFAULT NULL,
  `dob`                   TIMESTAMP NULL             DEFAULT NULL,
  `address`               LONGTEXT              DEFAULT NULL,
  `city`                  VARCHAR(100)          DEFAULT NULL,
  `state`                 VARCHAR(100)          DEFAULT NULL,
  `postalCode`            VARCHAR(20)           DEFAULT NULL,
  `country`               VARCHAR(50)           DEFAULT 'UK',
  `ethnicity`             VARCHAR(100)          DEFAULT NULL,
  `latitude`              VARCHAR(100)          DEFAULT NULL,
  `longitude`             VARCHAR(100)          DEFAULT NULL,
  `status`                ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'INACTIVE',
  `accountStatus`         ENUM('ACTIVATE','DEACTIVATE') NOT NULL DEFAULT 'ACTIVATE',
  `patientGroup`          ENUM('NEW_PATIENT','REFERRED_FOR_REVIEW','TRANSITION_FROM_CAMHS','TRANSITION_ADULT') DEFAULT NULL,
  `userType`              ENUM('PRIVATE','RTC','ICB_CONTRACT') DEFAULT NULL,
  `emisId`                VARCHAR(100)          DEFAULT NULL,
  `isTest`                TINYINT(1)   NOT NULL DEFAULT 0,
  `optOut`                TINYINT(1)   NOT NULL DEFAULT 0,
  `optOutAt`              TIMESTAMP NULL             DEFAULT NULL,
  `registrationDate`      TIMESTAMP NULL             DEFAULT NULL,
  `activationDate`        TIMESTAMP NULL             DEFAULT NULL,
  `firstConsultationDate` TIMESTAMP NULL             DEFAULT NULL,
  `inviteSentCount`       INT          NOT NULL DEFAULT 0,
  `inviteSentAt`          TIMESTAMP NULL             DEFAULT NULL,
  `isDischarge`           TINYINT(1)   NOT NULL DEFAULT 0,
  `createdAt`             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt`             TIMESTAMP NULL             DEFAULT NULL,
  `createdBy`             CHAR(36)              DEFAULT NULL,
  `updatedBy`             CHAR(36)              DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `patients_tenantId_nhsNumber_unique` (`tenantId`, `nhsNumber`),
  KEY `patients_tenantId_idx`  (`tenantId`),
  KEY `patients_clinicId_idx`  (`clinicId`),
  KEY `patients_areaId_idx`    (`areaId`),
  KEY `patients_programId_idx` (`programId`),
  CONSTRAINT `fk_patients_tenantId`  FOREIGN KEY (`tenantId`)  REFERENCES `tenants`  (`id`),
  CONSTRAINT `fk_patients_programId` FOREIGN KEY (`programId`) REFERENCES `programs` (`id`),
  CONSTRAINT `fk_patients_clinicId`  FOREIGN KEY (`clinicId`)  REFERENCES `clinics`  (`id`),
  CONSTRAINT `fk_patients_areaId`    FOREIGN KEY (`areaId`)    REFERENCES `areas`    (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: patient_gp_details
-- ============================================================
CREATE TABLE `patient_gp_details` (
  `id`                     CHAR(36)     NOT NULL,
  `patientId`              CHAR(36)     NOT NULL,
  `gpName`                 VARCHAR(255)          DEFAULT NULL,
  `gpOrgName`              VARCHAR(255)          DEFAULT NULL,
  `gpNationalPracticeCode` VARCHAR(100)          DEFAULT NULL,
  `gpEmail`                VARCHAR(255)          DEFAULT NULL,
  `gpAddress`              LONGTEXT              DEFAULT NULL,
  `gpPostCode`             VARCHAR(20)           DEFAULT NULL,
  `gpCity`                 VARCHAR(100)          DEFAULT NULL,
  `gpDistrict`             VARCHAR(100)          DEFAULT NULL,
  `gpCountry`              VARCHAR(100)          DEFAULT NULL,
  `gpSelected`             TINYINT(1)   NOT NULL DEFAULT 0,
  `icbSelected`            TINYINT(1)   NOT NULL DEFAULT 0,
  `createdAt`              TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`              TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pgd_patientId_unique` (`patientId`),
  CONSTRAINT `fk_pgd_patientId` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: patient_referrals
-- ============================================================
CREATE TABLE `patient_referrals` (
  `id`             CHAR(36)  NOT NULL,
  `patientId`      CHAR(36)  NOT NULL,
  `referralSource` LONGTEXT           DEFAULT NULL,
  `referralText`   LONGTEXT           DEFAULT NULL,
  `referralDate`   TIMESTAMP NULL          DEFAULT NULL,
  `contract`       VARCHAR(100)       DEFAULT NULL,
  `contractOther`  VARCHAR(100)       DEFAULT NULL,
  `createdAt`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy`      CHAR(36)           DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pr_patientId_idx` (`patientId`),
  CONSTRAINT `fk_pr_patientId` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: patient_journey_events
-- ============================================================
CREATE TABLE `patient_journey_events` (
  `id`        CHAR(36)  NOT NULL,
  `patientId` CHAR(36)  NOT NULL,
  `status`    ENUM('NEW','PSI','DISCHARGE','MEDICATION_REQUIRED') NOT NULL,
  `notes`     LONGTEXT           DEFAULT NULL,
  `actedBy`   CHAR(36)  NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `pje_patientId_idx` (`patientId`),
  CONSTRAINT `fk_pje_patientId` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pje_actedBy`   FOREIGN KEY (`actedBy`)   REFERENCES `users`    (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: doctor_patient_assignments
-- ============================================================
CREATE TABLE `doctor_patient_assignments` (
  `id`           CHAR(36)   NOT NULL,
  `tenantId`     CHAR(36)   NOT NULL,
  `areaId`       CHAR(36)   NOT NULL,
  `clinicId`     CHAR(36)   NOT NULL,
  `doctorId`     CHAR(36)   NOT NULL,
  `patientId`    CHAR(36)   NOT NULL,
  `isTemp`       TINYINT(1) NOT NULL DEFAULT 0,
  `firstLoginAt` TIMESTAMP NULL           DEFAULT NULL,
  `createdAt`    TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`    TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt`    TIMESTAMP NULL           DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dpa_tenantId_idx`  (`tenantId`),
  KEY `dpa_doctorId_idx`  (`doctorId`),
  KEY `dpa_patientId_idx` (`patientId`),
  CONSTRAINT `fk_dpa_areaId`    FOREIGN KEY (`areaId`)    REFERENCES `areas`    (`id`),
  CONSTRAINT `fk_dpa_clinicId`  FOREIGN KEY (`clinicId`)  REFERENCES `clinics`  (`id`),
  CONSTRAINT `fk_dpa_doctorId`  FOREIGN KEY (`doctorId`)  REFERENCES `users`    (`id`),
  CONSTRAINT `fk_dpa_patientId` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: sms_communications
-- ============================================================
CREATE TABLE `sms_communications` (
  `id`           CHAR(36)     NOT NULL,
  `tenantId`     CHAR(36)     NOT NULL,
  `patientId`    CHAR(36)              DEFAULT NULL,
  `mobile`       VARCHAR(30)  NOT NULL,
  `messageText`  LONGTEXT     NOT NULL,
  `twilioSid`    VARCHAR(100)          DEFAULT NULL,
  `status`       ENUM('QUEUED','SENT','DELIVERED','FAILED','UNDELIVERED') NOT NULL DEFAULT 'QUEUED',
  `attemptCount` INT          NOT NULL DEFAULT 0,
  `sentAt`       TIMESTAMP NULL             DEFAULT NULL,
  `deliveredAt`  TIMESTAMP NULL             DEFAULT NULL,
  `createdAt`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sms_tenantId_idx`  (`tenantId`),
  KEY `sms_patientId_idx` (`patientId`),
  KEY `sms_twilioSid_idx` (`twilioSid`),
  CONSTRAINT `fk_sms_tenantId`  FOREIGN KEY (`tenantId`)  REFERENCES `tenants`  (`id`),
  CONSTRAINT `fk_sms_patientId` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: file_uploads
-- ============================================================
CREATE TABLE `file_uploads` (
  `id`         CHAR(36)     NOT NULL,
  `tenantId`   CHAR(36)     NOT NULL,
  `patientId`  CHAR(36)     NOT NULL,
  `uploaderId` CHAR(36)     NOT NULL,
  `fileKey`    VARCHAR(500) NOT NULL,
  `fileUrl`    VARCHAR(500) NOT NULL,
  `caseBlock`  VARCHAR(100)          DEFAULT NULL,
  `fileType`   VARCHAR(50)           DEFAULT NULL,
  `isTest`     TINYINT(1)   NOT NULL DEFAULT 0,
  `createdAt`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deletedAt`  TIMESTAMP NULL             DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fu_tenantId_idx`  (`tenantId`),
  KEY `fu_patientId_idx` (`patientId`),
  CONSTRAINT `fk_fu_patientId`  FOREIGN KEY (`patientId`)  REFERENCES `patients` (`id`),
  CONSTRAINT `fk_fu_uploaderId` FOREIGN KEY (`uploaderId`) REFERENCES `users`    (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: account_onboarding_logs
-- ============================================================
CREATE TABLE `account_onboarding_logs` (
  `id`            CHAR(36)     NOT NULL,
  `tenantId`      CHAR(36)     NOT NULL,
  `uploadBatchId` VARCHAR(100)          DEFAULT NULL,
  `uploaderId`    CHAR(36)              DEFAULT NULL,
  `programId`     CHAR(36)              DEFAULT NULL,
  `patientId`     CHAR(36)              DEFAULT NULL,
  `nhsId`         VARCHAR(20)           DEFAULT NULL,
  `mobile`        VARCHAR(30)           DEFAULT NULL,
  `email`         VARCHAR(255)          DEFAULT NULL,
  `status`        VARCHAR(50)  NOT NULL,
  `statusCode`    INT                   DEFAULT NULL,
  `statusMessage` LONGTEXT              DEFAULT NULL,
  `source`        VARCHAR(50)           DEFAULT NULL,
  `isTest`        TINYINT(1)   NOT NULL DEFAULT 0,
  `createdAt`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `aol_tenantId_idx`      (`tenantId`),
  KEY `aol_uploadBatchId_idx` (`uploadBatchId`),
  CONSTRAINT `fk_aol_patientId` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: audit_logs  (APPEND-ONLY — never DELETE rows)
-- ============================================================
CREATE TABLE `audit_logs` (
  `id`          CHAR(36)     NOT NULL,
  `tenantId`    CHAR(36)     NOT NULL,
  `entityType`  VARCHAR(100) NOT NULL,
  `entityId`    CHAR(36)     NOT NULL,
  `action`      ENUM('CREATE','UPDATE','DELETE','LOGIN','LOGOUT') NOT NULL,
  `actorId`     CHAR(36)              DEFAULT NULL,
  `beforeValue` JSON                  DEFAULT NULL,
  `afterValue`  JSON                  DEFAULT NULL,
  `ipAddress`   VARCHAR(45)           DEFAULT NULL,
  `userAgent`   VARCHAR(500)          DEFAULT NULL,
  `createdAt`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `al_tenantId_idx`          (`tenantId`),
  KEY `al_entityType_entityId_idx` (`entityType`, `entityId`),
  KEY `al_actorId_idx`           (`actorId`),
  CONSTRAINT `fk_al_tenantId` FOREIGN KEY (`tenantId`) REFERENCES `tenants` (`id`),
  CONSTRAINT `fk_al_actorId`  FOREIGN KEY (`actorId`)  REFERENCES `users`   (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE `notifications` (
  `id`        CHAR(36)     NOT NULL,
  `tenantId`  CHAR(36)     NOT NULL,
  `userId`    CHAR(36)     NOT NULL,
  `title`     VARCHAR(255) NOT NULL,
  `message`   LONGTEXT     NOT NULL,
  `type`      ENUM('INFO','WARNING','ERROR','SUCCESS') NOT NULL DEFAULT 'INFO',
  `isRead`    TINYINT(1)   NOT NULL DEFAULT 0,
  `readAt`    TIMESTAMP NULL             DEFAULT NULL,
  `createdAt` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `notif_tenantId_userId_idx` (`tenantId`, `userId`),
  KEY `notif_isRead_idx`          (`isRead`),
  CONSTRAINT `fk_notif_tenantId` FOREIGN KEY (`tenantId`) REFERENCES `tenants` (`id`),
  CONSTRAINT `fk_notif_userId`   FOREIGN KEY (`userId`)   REFERENCES `users`   (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: refresh_tokens
-- ============================================================
CREATE TABLE `refresh_tokens` (
  `id`        CHAR(36)     NOT NULL,
  `userId`    CHAR(36)     NOT NULL,
  `token`     VARCHAR(1000) NOT NULL,
  `expiresAt` TIMESTAMP    NOT NULL,
  `createdAt` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `revokedAt` TIMESTAMP NULL             DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rt_token_unique` (`token`(255)),
  KEY `rt_userId_idx` (`userId`),
  CONSTRAINT `fk_rt_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
