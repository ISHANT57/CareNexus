-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql:3306
-- Generation Time: Jun 05, 2026 at 09:32 AM
-- Server version: 8.0.46
-- PHP Version: 8.3.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pms2`
--

-- --------------------------------------------------------

--
-- Table structure for table `goqii_corporate_program`
--

CREATE TABLE `goqii_corporate_program` (
  `programId` int NOT NULL,
  `companyId` int NOT NULL,
  `channelId` int NOT NULL,
  `programName` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `programLogo` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `orderNumber` bigint NOT NULL,
  `activationCode` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `priority` int NOT NULL,
  `tags` text CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `isDeleted` enum('Y','N') CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT 'N',
  `createdTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lovable_refrence_id` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `goqii_doctor_patient_rel`
--

CREATE TABLE `goqii_doctor_patient_rel` (
  `doctorPatientRelId` int NOT NULL,
  `areaId` int NOT NULL,
  `clinicId` int NOT NULL,
  `doctorId` int NOT NULL,
  `patientId` int NOT NULL,
  `nhsGroupId` int NOT NULL,
  `isDeleted` enum('Y','N') NOT NULL DEFAULT 'N',
  `firstLoginTime` datetime NOT NULL,
  `createdTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `temp` enum('Y','N') NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `goqii_file_uploader_nhs`
--

CREATE TABLE `goqii_file_uploader_nhs` (
  `id` int NOT NULL,
  `uid` bigint NOT NULL,
  `preDocId` bigint NOT NULL,
  `caseBlock` varchar(50) NOT NULL,
  `link` varchar(500) NOT NULL,
  `uploaderId` int NOT NULL,
  `queueStatus` tinyint NOT NULL DEFAULT '0',
  `rawData` text NOT NULL,
  `type` varchar(30) NOT NULL,
  `createdTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `isTest` enum('Y','N') NOT NULL DEFAULT 'N',
  `isDeleted` enum('Y','N') NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `goqii_nhs_sms_communication`
--

CREATE TABLE `goqii_nhs_sms_communication` (
  `id` int NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `smsText` text NOT NULL,
  `counter` int NOT NULL,
  `status` varchar(25) NOT NULL,
  `twillioId` varchar(50) NOT NULL,
  `companyId` int NOT NULL,
  `isDeleted` enum('Y','N') NOT NULL DEFAULT 'N',
  `createdTime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `goqii_nhs_user_account_created_details`
--

CREATE TABLE `goqii_nhs_user_account_created_details` (
  `id` int NOT NULL,
  `uploadUniqueId` int NOT NULL,
  `uploader_id` int NOT NULL,
  `programId` int NOT NULL,
  `userId` int NOT NULL,
  `nhsId` bigint NOT NULL,
  `mobile` varchar(30) NOT NULL,
  `email` varchar(100) NOT NULL,
  `rawJson` text NOT NULL,
  `status` varchar(20) NOT NULL,
  `statusResponse` text NOT NULL,
  `statusCode` int NOT NULL,
  `statusMsg` text NOT NULL,
  `source` varchar(50) NOT NULL,
  `isTest` enum('Y','N') NOT NULL DEFAULT 'N',
  `isDeleted` enum('Y','N') NOT NULL DEFAULT 'N',
  `createdTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `goqii_pms_clinic_rel`
--

CREATE TABLE `goqii_pms_clinic_rel` (
  `pmsClinicRelId` int NOT NULL,
  `pmsUserId` int NOT NULL,
  `clinicId` int NOT NULL,
  `createdTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `goqii_pms_user`
--

CREATE TABLE `goqii_pms_user` (
  `pmsUserId` int UNSIGNED NOT NULL,
  `companyId` int NOT NULL,
  `clinicId` varchar(100) NOT NULL,
  `doctorId` int NOT NULL,
  `areaId` varchar(100) NOT NULL,
  `userName` varchar(100) NOT NULL DEFAULT '',
  `is_super_admin` tinyint NOT NULL DEFAULT '0',
  `firstName` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `userImageUrl` varchar(200) NOT NULL,
  `lastLoginTime` datetime NOT NULL,
  `area` varchar(255) NOT NULL,
  `email` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(10) NOT NULL,
  `role` enum('superadmin','areaadmin','clinicadmin','doctor','adminsettings','cliniconly','doctoronly','patientonly','admin','operator','staff') CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT 'doctor',
  `passwordUpdateCount` int NOT NULL,
  `status` enum('active','inactive') NOT NULL,
  `temporaryProgramId` int NOT NULL,
  `isTest` enum('Y','N') NOT NULL DEFAULT 'N',
  `updatedBy` int NOT NULL,
  `verificationToken` varchar(20) NOT NULL,
  `isEmailVerified` enum('Y','N') NOT NULL DEFAULT 'N',
  `forgetPasswordToken` varchar(30) NOT NULL,
  `forgetPasswordTime` datetime NOT NULL,
  `isDeleted` enum('Y','N') NOT NULL DEFAULT 'N',
  `updatedTime` datetime NOT NULL,
  `createdTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `goqii_pms_user_program_rel`
--

CREATE TABLE `goqii_pms_user_program_rel` (
  `id` int UNSIGNED NOT NULL,
  `userId` int UNSIGNED NOT NULL,
  `programId` int UNSIGNED NOT NULL,
  `isDeleted` enum('Y','N') NOT NULL DEFAULT 'N',
  `updatedTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `goqii_uk_company`
--

CREATE TABLE `goqii_uk_company` (
  `id` int NOT NULL,
  `companyName` varchar(100) NOT NULL,
  `domain` varchar(255) NOT NULL,
  `logo` varchar(255) NOT NULL,
  `onboardingSms` text NOT NULL,
  `isDeleted` enum('Y','N') NOT NULL DEFAULT 'N',
  `createdTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `goqii_user`
--

CREATE TABLE `goqii_user` (
  `userId` int UNSIGNED NOT NULL,
  `nhsNumber` varchar(20) NOT NULL,
  `title` varchar(20) NOT NULL,
  `firstName` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `lastName` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `altEmail` varchar(100) NOT NULL,
  `userLogin` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `doctorId` int NOT NULL,
  `userImageUrl` varchar(250) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `termCondition` enum('Y','N') NOT NULL DEFAULT 'N',
  `status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
  `statusActiveTime` datetime NOT NULL,
  `imei` varchar(50) NOT NULL,
  `role` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `twitterConnected` enum('Y','N') NOT NULL DEFAULT 'N',
  `twId` int NOT NULL,
  `twScreenName` varchar(50) NOT NULL,
  `twOfflineAccessToken` varchar(500) NOT NULL,
  `twOfflineAccessSecret` varchar(500) NOT NULL,
  `facebookConnected` enum('Y','N') NOT NULL DEFAULT 'N',
  `fbId` bigint NOT NULL,
  `fbUserName` varchar(50) NOT NULL,
  `fbAccessToken` varchar(300) NOT NULL,
  `linkedinConnected` enum('Y','N') NOT NULL DEFAULT 'N',
  `googleConnect` enum('Y','N') NOT NULL DEFAULT 'N',
  `googleId` varchar(50) NOT NULL,
  `googleUserName` varchar(50) NOT NULL,
  `deviceConnected` enum('Y','N') NOT NULL DEFAULT 'N',
  `lastActivityTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `karmaPoints` int UNSIGNED NOT NULL,
  `karmaDonate` int NOT NULL,
  `maxKarmaInADay` int NOT NULL,
  `maxKarmaInAWeek` int NOT NULL,
  `totalSteps` int NOT NULL,
  `maxStepsInADay` int NOT NULL,
  `maxStepsInaWeek` int NOT NULL,
  `maxSleepInADay` int NOT NULL,
  `registrationDate` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `gender` enum('male','female','other') NOT NULL DEFAULT 'male',
  `dob` date NOT NULL,
  `country` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `city` varchar(20) NOT NULL,
  `state` varchar(100) NOT NULL,
  `postalCode` varchar(11) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `phoneCode` varchar(20) NOT NULL,
  `extentionNumber` varchar(10) NOT NULL,
  `altMobile` varchar(15) NOT NULL,
  `encryptedUserID` varchar(30) NOT NULL,
  `accessToken` varchar(100) NOT NULL,
  `accessTokenSecret` varchar(100) NOT NULL,
  `height` float NOT NULL,
  `userHeightUnit` varchar(20) NOT NULL,
  `userHeightSelectedUnit` varchar(30) NOT NULL COMMENT 'mi,cm,feet',
  `userWeight` float NOT NULL,
  `userWeightUnit` varchar(20) NOT NULL,
  `userWeightSelectedUnit` varchar(30) NOT NULL COMMENT '"lb" : "kg"',
  `userWaterSelectedUnit` varchar(20) NOT NULL DEFAULT 'lts' COMMENT '"oz" : "lts"',
  `userDistancePreference` varchar(50) NOT NULL,
  `weekStartOn` varchar(20) NOT NULL DEFAULT 'monday',
  `timeFormat` varchar(50) NOT NULL,
  `timeZone` varchar(50) NOT NULL DEFAULT '57',
  `timezoneTitle` varchar(255) NOT NULL,
  `timeZone_offset` varchar(50) NOT NULL,
  `timeZone_name` varchar(50) NOT NULL,
  `dayLightSaving` enum('Y','N') NOT NULL DEFAULT 'N',
  `userStepsTarget` int NOT NULL,
  `userDistanceTarget` int NOT NULL,
  `userCaloriesTarget` int NOT NULL,
  `userWaterTarget` int NOT NULL,
  `userSleepTarget` int NOT NULL,
  `userWeightTarget` int NOT NULL,
  `synDate` date NOT NULL,
  `coachId` int UNSIGNED NOT NULL,
  `coachIntensity` varchar(50) NOT NULL COMMENT '1,2,3, where 3 is hard and 1 is easy 2 is medium',
  `expertId` int UNSIGNED NOT NULL,
  `verificationToken` varchar(20) NOT NULL,
  `forgetPasswordToken` varchar(20) NOT NULL,
  `forgetPasswordTime` datetime NOT NULL,
  `emailVerification` enum('Y','N') NOT NULL DEFAULT 'N',
  `mobileVerification` enum('Y','N') NOT NULL DEFAULT 'N',
  `firebase` enum('Y','N') NOT NULL DEFAULT 'N',
  `deviceLastSync` datetime NOT NULL,
  `serverLastSync` datetime NOT NULL,
  `batteryStatus` int NOT NULL,
  `personalInfo` enum('Y','N') NOT NULL DEFAULT 'N',
  `lifeStyle` enum('Y','N') NOT NULL DEFAULT 'N',
  `goalSelection` enum('Y','N') NOT NULL DEFAULT 'N',
  `firstActiveDate` datetime NOT NULL,
  `sessionTime` datetime NOT NULL,
  `isCoachOrExpert` int NOT NULL,
  `plan` varchar(100) NOT NULL,
  `activationDate` datetime NOT NULL,
  `subscriptionStartDate` datetime NOT NULL,
  `subscriptionEndDate` datetime NOT NULL,
  `recordInserted` varchar(50) NOT NULL,
  `orderNumber` varchar(200) NOT NULL,
  `pinNumber` varchar(255) NOT NULL,
  `activatedBy` int NOT NULL,
  `userLastClanChatTime` datetime NOT NULL,
  `batteryAlertTime` datetime NOT NULL,
  `skype` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `aboutme` text NOT NULL,
  `utm_campaign` varchar(255) NOT NULL,
  `utm_medium` varchar(255) NOT NULL,
  `utm_source` varchar(255) NOT NULL,
  `website` varchar(255) NOT NULL,
  `personalInfoMail` enum('Y','N') NOT NULL DEFAULT 'N',
  `lifeStyleMail` enum('Y','N') NOT NULL DEFAULT 'N',
  `userAgent` varchar(500) NOT NULL,
  `accountStatus` enum('activate','deactivate') NOT NULL DEFAULT 'activate',
  `userAutomatedNotify` enum('Y','N') NOT NULL DEFAULT 'N' COMMENT 'notify to user registeration after 1 hour meand email trigger notification A warm welcome from your coach',
  `callIntro` enum('Y','N','E') NOT NULL DEFAULT 'N' COMMENT 'if call have done by user then update to Y',
  `callIntroDate` datetime NOT NULL COMMENT 'call intro date on update Y or scheduled call intro',
  `callIntroRemender` datetime NOT NULL COMMENT 'if call scheduled then date and time will show here and in case call done then empty here',
  `reviewCallIntro` enum('Y','N') NOT NULL DEFAULT 'N' COMMENT 'review call intro will be Y after one month and all paremetr will reset call intro. its mean call intro is in circle now',
  `subscriptionFinish` enum('Y','N') NOT NULL DEFAULT 'N',
  `userPersionType` varchar(50) NOT NULL,
  `activationCodeRegion` varchar(50) NOT NULL DEFAULT 'india',
  `isEvent` enum('Y','N') NOT NULL DEFAULT 'N',
  `eventName` varchar(50) NOT NULL DEFAULT 'b2c',
  `channelType` varchar(20) NOT NULL,
  `isSurvey` enum('Y','N') NOT NULL DEFAULT 'N',
  `corporateId` int NOT NULL,
  `remark` text NOT NULL,
  `callRequestTime` datetime NOT NULL,
  `customerCareRenewalLink` enum('Y','N') NOT NULL DEFAULT 'N',
  `agentId` int NOT NULL,
  `introCall` enum('Y','N') NOT NULL DEFAULT 'N' COMMENT 'this is updated in cocah api (exotel_communication_connect)',
  `passiveState` enum('Y','N') NOT NULL DEFAULT 'N',
  `coachService` enum('Y','N') NOT NULL DEFAULT 'Y',
  `insidePushNumber` int NOT NULL,
  `region` int NOT NULL,
  `channel` int NOT NULL,
  `business` int NOT NULL,
  `bmi` float NOT NULL,
  `playerType` enum('free','paid') NOT NULL DEFAULT 'paid',
  `currentPlayerType` varchar(50) NOT NULL DEFAULT 'paid',
  `conversion` enum('Y','N') NOT NULL DEFAULT 'N',
  `conversionDate` datetime NOT NULL,
  `freeTrialEndDate` datetime NOT NULL,
  `consentDateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `maintenanceMode` enum('N','Y') NOT NULL DEFAULT 'N',
  `conferenceId` varchar(50) NOT NULL,
  `conferencePassword` varchar(200) NOT NULL,
  `conversationId` varchar(50) NOT NULL,
  `socialFriend` enum('Y','N') NOT NULL DEFAULT 'N',
  `flowType` int NOT NULL DEFAULT '1',
  `coachSelectionDate` datetime NOT NULL,
  `userRole` varchar(255) NOT NULL,
  `familyId` int NOT NULL,
  `oldSubscriptionEndDate` datetime NOT NULL,
  `coachSource` varchar(30) NOT NULL,
  `userType` enum('private','rtc','icb-contract') CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `assessmentcount` int NOT NULL,
  `gp_selected` tinyint(1) NOT NULL,
  `gp_text` text NOT NULL,
  `icb_selected` tinyint(1) NOT NULL,
  `icb_text` text NOT NULL,
  `referralSource` varchar(100) NOT NULL,
  `referralText` text NOT NULL,
  `contract` varchar(50) NOT NULL,
  `referralDate` date NOT NULL,
  `emis` varchar(50) NOT NULL,
  `ethnicity` varchar(100) NOT NULL,
  `latitude` varchar(100) NOT NULL,
  `longitude` varchar(100) NOT NULL,
  `contractOther` varchar(100) NOT NULL,
  `gpOrganizationName` varchar(100) NOT NULL,
  `gpNationalPracticeCode` varchar(100) NOT NULL,
  `gpEmail` varchar(100) NOT NULL,
  `gpPostCode` varchar(50) NOT NULL,
  `gpCity` varchar(50) NOT NULL,
  `gpDistrict` varchar(50) NOT NULL,
  `gpCountry` varchar(50) NOT NULL,
  `gpAddress` varchar(500) NOT NULL,
  `gpName` varchar(100) NOT NULL,
  `userTypeTime` datetime NOT NULL,
  `isTest` enum('Y','N') NOT NULL DEFAULT 'N',
  `isNhsClinic` enum('Y','N') NOT NULL DEFAULT 'N',
  `inviteSent` int NOT NULL,
  `patient_group` enum('new_patient','referred_for_review','transition_from_CAMHS','transition_adult') DEFAULT NULL,
  `patient_journy_status` enum('New','PSI','Discharge','Medication Required') DEFAULT 'New',
  `first_consultation_date` date DEFAULT NULL,
  `lovableReferenceId` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `goqii_user_ready_data`
--

CREATE TABLE `goqii_user_ready_data` (
  `id` int NOT NULL,
  `enrollmentId` int NOT NULL,
  `userId` int UNSIGNED NOT NULL,
  `encId` varchar(100) NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `userImageUrl` varchar(255) NOT NULL,
  `fullName` varchar(100) NOT NULL,
  `nhsNumber` varchar(30) NOT NULL,
  `mobile` varchar(30) NOT NULL,
  `email` varchar(50) NOT NULL,
  `status` varchar(20) NOT NULL,
  `gender` varchar(20) NOT NULL,
  `statusActiveTime` datetime NOT NULL,
  `registrationDate` datetime NOT NULL,
  `dob` date NOT NULL,
  `age` int NOT NULL,
  `sessionTime` datetime NOT NULL,
  `coachId` int NOT NULL,
  `coachName` varchar(50) NOT NULL,
  `coachingStartDate` datetime NOT NULL,
  `coachingEndDate` datetime NOT NULL,
  `subscriptionStartDate` datetime NOT NULL,
  `subscriptionEndDate` datetime NOT NULL,
  `noOfCalls` int NOT NULL,
  `firstConsultation` datetime NOT NULL,
  `lastConsultation` datetime NOT NULL,
  `coachFeedbackRating` float NOT NULL,
  `programId` int UNSIGNED NOT NULL,
  `programName` varchar(50) NOT NULL,
  `areaId` int UNSIGNED NOT NULL,
  `areaName` varchar(50) NOT NULL,
  `clinicId` int UNSIGNED NOT NULL,
  `clinicName` varchar(50) NOT NULL,
  `doctorId` int NOT NULL,
  `doctorName` varchar(50) NOT NULL,
  `smsSentDate` datetime NOT NULL,
  `smsDeliverDate` datetime NOT NULL,
  `smsStatus` varchar(30) NOT NULL,
  `loginDate` datetime NOT NULL,
  `onboardedDate` datetime NOT NULL,
  `userLastActiveTime` datetime DEFAULT NULL,
  `whatsappDateSent` datetime NOT NULL,
  `whatsappDeliveryDate` datetime NOT NULL,
  `whatsappStatus` varchar(30) NOT NULL,
  `uploadUniqueId` int NOT NULL,
  `uploader_id` int NOT NULL,
  `logDate` date NOT NULL,
  `isDeleted` enum('N','Y') NOT NULL DEFAULT 'N',
  `isTest` varchar(10) NOT NULL,
  `optOut` enum('N','Y') NOT NULL DEFAULT 'N',
  `optOutDate` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `referalType` varchar(50) NOT NULL,
  `referalText` varchar(100) NOT NULL,
  `assessmentcount` int NOT NULL,
  `gp_selected` tinyint(1) NOT NULL,
  `gp_text` text NOT NULL,
  `icb_selected` tinyint(1) NOT NULL,
  `icb_text` text NOT NULL,
  `referralSource` varchar(100) NOT NULL,
  `referralText` text NOT NULL,
  `contract` varchar(50) NOT NULL,
  `contractOther` varchar(100) NOT NULL,
  `referralDate` date NOT NULL,
  `gpOrganizationName` varchar(100) NOT NULL,
  `gpNationalPracticeCode` varchar(100) NOT NULL,
  `userType` enum('private','rtc','icb-contract') DEFAULT NULL,
  `userTypeTime` datetime NOT NULL,
  `emis` varchar(50) NOT NULL,
  `gpName` varchar(100) NOT NULL,
  `ethnicity` varchar(100) NOT NULL,
  `latitude` varchar(100) NOT NULL,
  `longitude` varchar(100) NOT NULL,
  `postalCode` varchar(50) NOT NULL,
  `gpEmail` varchar(100) NOT NULL,
  `gpPostCode` varchar(50) NOT NULL,
  `gpCity` varchar(50) NOT NULL,
  `gpDistrict` varchar(50) NOT NULL,
  `gpCountry` varchar(50) NOT NULL,
  `gpAddress` varchar(500) NOT NULL,
  `registerBy` enum('sms','whatsapp','other') DEFAULT NULL,
  `registerByFlag` tinyint NOT NULL DEFAULT '0',
  `lastUpdatedTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `country` varchar(50) NOT NULL,
  `address` varchar(100) NOT NULL,
  `city` varchar(50) NOT NULL,
  `state` varchar(100) NOT NULL,
  `inviteSent` int NOT NULL,
  `inviteDateTime` datetime DEFAULT NULL,
  `patient_group` enum('new_patient','referred_for_review','transition_from_CAMHS','transition_adult') DEFAULT NULL,
  `patient_journy_status` enum('New','PSI','Discharge','Medication Required') DEFAULT 'New',
  `first_consultation_date` date DEFAULT NULL,
  `lovableReferenceId` varchar(100) DEFAULT NULL,
  `patient_discharge` enum('N','Y') NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `goqii_corporate_program`
--
ALTER TABLE `goqii_corporate_program`
  ADD PRIMARY KEY (`programId`);

--
-- Indexes for table `goqii_doctor_patient_rel`
--
ALTER TABLE `goqii_doctor_patient_rel`
  ADD PRIMARY KEY (`doctorPatientRelId`),
  ADD KEY `doctorId` (`doctorId`),
  ADD KEY `patientId` (`patientId`),
  ADD KEY `temp` (`temp`),
  ADD KEY `areaId` (`areaId`),
  ADD KEY `clinicId` (`clinicId`),
  ADD KEY `isDeleted` (`isDeleted`);

--
-- Indexes for table `goqii_file_uploader_nhs`
--
ALTER TABLE `goqii_file_uploader_nhs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `isTest` (`isTest`,`isDeleted`) USING BTREE,
  ADD KEY `uid` (`uid`),
  ADD KEY `preUid` (`preDocId`);

--
-- Indexes for table `goqii_nhs_sms_communication`
--
ALTER TABLE `goqii_nhs_sms_communication`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mobile` (`mobile`,`counter`,`status`),
  ADD KEY `twillioId` (`twillioId`),
  ADD KEY `companyId` (`companyId`);

--
-- Indexes for table `goqii_nhs_user_account_created_details`
--
ALTER TABLE `goqii_nhs_user_account_created_details`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `goqii_pms_clinic_rel`
--
ALTER TABLE `goqii_pms_clinic_rel`
  ADD PRIMARY KEY (`pmsClinicRelId`),
  ADD KEY `clinicId` (`clinicId`),
  ADD KEY `userId` (`pmsUserId`);

--
-- Indexes for table `goqii_pms_user`
--
ALTER TABLE `goqii_pms_user`
  ADD PRIMARY KEY (`pmsUserId`),
  ADD UNIQUE KEY `userName_2` (`userName`),
  ADD KEY `clinicId` (`clinicId`),
  ADD KEY `doctorId` (`doctorId`),
  ADD KEY `role` (`role`),
  ADD KEY `userName` (`userName`);

--
-- Indexes for table `goqii_pms_user_program_rel`
--
ALTER TABLE `goqii_pms_user_program_rel`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`,`programId`);

--
-- Indexes for table `goqii_uk_company`
--
ALTER TABLE `goqii_uk_company`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `goqii_user`
--
ALTER TABLE `goqii_user`
  ADD PRIMARY KEY (`userId`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD KEY `email` (`email`,`password`),
  ADD KEY `userId` (`userId`,`createdTime`),
  ADD KEY `orderNumber` (`orderNumber`),
  ADD KEY `coachId` (`coachId`,`country`),
  ADD KEY `subscriptionStartDate` (`subscriptionStartDate`),
  ADD KEY `subscriptionEndDate` (`subscriptionEndDate`),
  ADD KEY `subscriptionFinish` (`subscriptionFinish`),
  ADD KEY `timeZone` (`timeZone`),
  ADD KEY `corporateId` (`corporateId`,`emailVerification`),
  ADD KEY `expertId` (`expertId`),
  ADD KEY `status` (`status`),
  ADD KEY `playerType` (`playerType`,`accountStatus`),
  ADD KEY `coachId_2` (`coachId`,`subscriptionFinish`,`passiveState`),
  ADD KEY `mobileVerification` (`mobileVerification`),
  ADD KEY `mobile` (`mobile`),
  ADD KEY `phoneCode` (`phoneCode`),
  ADD KEY `familyId` (`familyId`),
  ADD KEY `verificationToken` (`verificationToken`,`emailVerification`),
  ADD KEY `imei` (`imei`),
  ADD KEY `isNhsClinic` (`isNhsClinic`);

--
-- Indexes for table `goqii_user_ready_data`
--
ALTER TABLE `goqii_user_ready_data`
  ADD PRIMARY KEY (`id`,`createdTime`),
  ADD KEY `userId` (`userId`),
  ADD KEY `isTest` (`isTest`,`isDeleted`),
  ADD KEY `userId_2` (`userId`,`isTest`,`isDeleted`),
  ADD KEY `programId` (`programId`),
  ADD KEY `areaId` (`areaId`),
  ADD KEY `clinicId` (`clinicId`),
  ADD KEY `status` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `goqii_corporate_program`
--
ALTER TABLE `goqii_corporate_program`
  MODIFY `programId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `goqii_doctor_patient_rel`
--
ALTER TABLE `goqii_doctor_patient_rel`
  MODIFY `doctorPatientRelId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `goqii_file_uploader_nhs`
--
ALTER TABLE `goqii_file_uploader_nhs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `goqii_nhs_sms_communication`
--
ALTER TABLE `goqii_nhs_sms_communication`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `goqii_nhs_user_account_created_details`
--
ALTER TABLE `goqii_nhs_user_account_created_details`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `goqii_pms_clinic_rel`
--
ALTER TABLE `goqii_pms_clinic_rel`
  MODIFY `pmsClinicRelId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `goqii_pms_user`
--
ALTER TABLE `goqii_pms_user`
  MODIFY `pmsUserId` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `goqii_pms_user_program_rel`
--
ALTER TABLE `goqii_pms_user_program_rel`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `goqii_uk_company`
--
ALTER TABLE `goqii_uk_company`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `goqii_user`
--
ALTER TABLE `goqii_user`
  MODIFY `userId` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `goqii_user_ready_data`
--
ALTER TABLE `goqii_user_ready_data`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
