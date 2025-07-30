
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

CREATE TABLE `user` (
  `id` binary(16) NOT NULL,
  `name` varchar(50) NOT NULL,
  `accountId` int NOT NULL,
  `passwordHash` varchar(100) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
