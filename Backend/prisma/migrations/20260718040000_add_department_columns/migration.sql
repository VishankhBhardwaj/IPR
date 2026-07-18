-- AlterTable: Add department column to User
ALTER TABLE `User` ADD COLUMN `department` VARCHAR(191) NULL;

-- AlterTable: Add department column to Patent
ALTER TABLE `Patent` ADD COLUMN `department` VARCHAR(191) NULL;
