-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'FACULTY', 'STUDENT') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Patent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `applicationNo` VARCHAR(191) NOT NULL,
    `status` ENUM('PUBLISHED', 'GRANTED') NOT NULL DEFAULT 'PUBLISHED',
    `inventorName` TEXT NOT NULL,
    `patentTitle` TEXT NOT NULL,
    `applicantName` TEXT NOT NULL,
    `filedDate` DATETIME(3) NOT NULL,
    `publicationDate` DATETIME(3) NOT NULL,
    `publicationNo` VARCHAR(191) NOT NULL,
    `institueAffiliation` TEXT NOT NULL,
    `driveLink` TEXT NOT NULL,
    `year` INTEGER NOT NULL,
    `patentType` ENUM('UTILITY', 'DESIGN') NOT NULL,
    `patentSession` TEXT NOT NULL,
    `weblink` TEXT NOT NULL,
    `country` TEXT NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Patent_applicationNo_key`(`applicationNo`),
    UNIQUE INDEX `Patent_publicationNo_key`(`publicationNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Patent` ADD CONSTRAINT `Patent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
