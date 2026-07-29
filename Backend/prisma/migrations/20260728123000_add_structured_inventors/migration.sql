CREATE TABLE `PatentInventor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `designation` ENUM('STUDENT', 'ASSISTANT_PROFESSOR', 'ASSOCIATE_PROFESSOR', 'PROFESSOR') NOT NULL,
    `patentId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PatentInventor_patentId_idx`(`patentId`),
    INDEX `PatentInventor_designation_idx`(`designation`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Department_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `InventorDepartment` (
    `inventorId` INTEGER NOT NULL,
    `departmentId` INTEGER NOT NULL,

    INDEX `InventorDepartment_departmentId_idx`(`departmentId`),
    PRIMARY KEY (`inventorId`, `departmentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `PatentInventor` ADD CONSTRAINT `PatentInventor_patentId_fkey` FOREIGN KEY (`patentId`) REFERENCES `Patent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `InventorDepartment` ADD CONSTRAINT `InventorDepartment_inventorId_fkey` FOREIGN KEY (`inventorId`) REFERENCES `PatentInventor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `InventorDepartment` ADD CONSTRAINT `InventorDepartment_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
