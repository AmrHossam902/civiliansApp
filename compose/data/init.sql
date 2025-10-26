
create schema `civilDb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

use `civilDb`;

CREATE TABLE `person` (
  `id` binary(16) NOT NULL,
  `firstName` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `lastName` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `middleName` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ssn` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gender` tinyint DEFAULT NULL,
  `birthDate` datetime DEFAULT NULL,
  `deathDate` datetime DEFAULT NULL,
  `address` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `father_id` binary(16) DEFAULT NULL,
  `mother_id` binary(16) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updateAt` datetime NOT NULL,
  `fullName` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci GENERATED ALWAYS AS (concat(`firstName`,_utf8mb4' ',`middleName`,_utf8mb4' ',`lastName`)) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `person_ssn` (`ssn`) USING BTREE,
  KEY `person_first_name` (`firstName`) USING BTREE,
  KEY `person_last_name` (`lastName`) USING BTREE,
  KEY `person_middle_name` (`middleName`) USING BTREE,
  KEY `person_gender` (`gender`) USING BTREE,
  KEY `firstName_id_index` (`firstName`,`id`),
  KEY `fullName_index` (`fullName`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `marriageRecord` (
  `id` binary(16) NOT NULL,
  `husbandId` binary(16) DEFAULT NULL,
  `wifeId` binary(16) DEFAULT NULL,
  `mDate` datetime DEFAULT NULL,
  `rType` tinyint DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `marriageRecord_ibfk_2` (`wifeId`),
  KEY `marriageRecord_ibfk_1` (`husbandId`),
  CONSTRAINT `marriageRecord_ibfk_1` FOREIGN KEY (`husbandId`) REFERENCES `person` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `marriageRecord_ibfk_2` FOREIGN KEY (`wifeId`) REFERENCES `person` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



CREATE TABLE `role` (
  `id` binary(16) NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `permissions` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `user` (
  `id` binary(16) NOT NULL,
  `name` varchar(50) NOT NULL,
  `accountId` int NOT NULL,
  `passwordHash` varchar(100) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `user_role` (
  `id` binary(16) NOT NULL,
  `roleId` binary(16) DEFAULT NULL,
  `userId` binary(16) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_user_role_roleId` (`roleId`),
  KEY `FK_user_role_userId` (`userId`),
  CONSTRAINT `FK_user_role_roleId` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_user_role_userId` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



LOCK TABLES `role` WRITE;
INSERT INTO `role` VALUES (0xAA6030B36E2711F09624546CEBADF4FD,'Employee','[\"READ_CIVILIANS\", \"POST_CIVILIANS\"]');
UNLOCK TABLES;


LOCK TABLES `user` WRITE;
INSERT INTO `user` VALUES (0x2107B3656C9111F09624546CEBADF4FD,'Salem Mohamed',1294864264,'$2b$04$fhmtNT.QbkN.0/2Gh.PCOe0c1BDqTCT9Bnw/XricTS9y3NGTaUJd2','2025-07-29 18:31:42','2025-07-29 18:31:42');
UNLOCK TABLES;


LOCK TABLES `user_role` WRITE;
INSERT INTO `user_role` VALUES (0x7D9326B16E2811F09624546CEBADF4FD,0xAA6030B36E2711F09624546CEBADF4FD,0x2107B3656C9111F09624546CEBADF4FD);
UNLOCK TABLES;

