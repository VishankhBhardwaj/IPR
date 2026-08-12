/*
  Warnings:

  - You are about to drop the column `institueAffiliation` on the `patent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `patent` DROP COLUMN `institueAffiliation`;

-- AlterTable
ALTER TABLE `patentinventor` ADD COLUMN `instituteAffiliation` VARCHAR(255) NOT NULL DEFAULT '';

-- AddForeignKey
-- ALTER TABLE `Patent` ADD CONSTRAINT `Patent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
-- ALTER TABLE `PatentInventor` ADD CONSTRAINT `PatentInventor_patentId_fkey` FOREIGN KEY (`patentId`) REFERENCES `Patent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
-- ALTER TABLE `InventorDepartment` ADD CONSTRAINT `InventorDepartment_inventorId_fkey` FOREIGN KEY (`inventorId`) REFERENCES `PatentInventor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
-- ALTER TABLE `InventorDepartment` ADD CONSTRAINT `InventorDepartment_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
