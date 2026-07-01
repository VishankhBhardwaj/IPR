ALTER TABLE `Patent` MODIFY `country` VARCHAR(100) NOT NULL;

CREATE INDEX `Patent_year_status_idx` ON `Patent`(`year`, `status`);
CREATE INDEX `Patent_patentType_year_status_idx` ON `Patent`(`patentType`, `year`, `status`);
CREATE INDEX `Patent_patentType_country_status_idx` ON `Patent`(`patentType`, `country`, `status`);
CREATE INDEX `Patent_userId_idx` ON `Patent`(`userId`);
