-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'FACULTY', 'STUDENT');

-- CreateEnum
CREATE TYPE "PatentType" AS ENUM ('UTILITY', 'DESIGN');

-- CreateEnum
CREATE TYPE "PatentStatus" AS ENUM ('APPLIED', 'PUBLISHED', 'GRANTED');

-- CreateEnum
CREATE TYPE "Designation" AS ENUM ('STUDENT', 'ASSISTANT_PROFESSOR', 'ASSOCIATE_PROFESSOR', 'PROFESSOR');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "department" TEXT,
    "designation" "Designation",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patent" (
    "id" SERIAL NOT NULL,
    "applicationNo" TEXT NOT NULL,
    "status" "PatentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "inventorName" TEXT NOT NULL,
    "patentTitle" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "filedDate" TIMESTAMP(3) NOT NULL,
    "publicationDate" TIMESTAMP(3),
    "publicationNo" TEXT,
    "driveLink" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "patentType" "PatentType" NOT NULL,
    "patentSession" TEXT NOT NULL,
    "weblink" TEXT NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "department" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatentInventor" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "designation" "Designation" NOT NULL,
    "instituteAffiliation" VARCHAR(255) NOT NULL DEFAULT '',
    "patentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatentInventor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventorDepartment" (
    "inventorId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,

    CONSTRAINT "InventorDepartment_pkey" PRIMARY KEY ("inventorId","departmentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Patent_applicationNo_key" ON "Patent"("applicationNo");

-- CreateIndex
CREATE UNIQUE INDEX "Patent_publicationNo_key" ON "Patent"("publicationNo");

-- CreateIndex
CREATE INDEX "Patent_year_status_idx" ON "Patent"("year", "status");

-- CreateIndex
CREATE INDEX "Patent_patentType_year_status_idx" ON "Patent"("patentType", "year", "status");

-- CreateIndex
CREATE INDEX "Patent_patentType_country_status_idx" ON "Patent"("patentType", "country", "status");

-- CreateIndex
CREATE INDEX "Patent_userId_idx" ON "Patent"("userId");

-- CreateIndex
CREATE INDEX "PatentInventor_patentId_idx" ON "PatentInventor"("patentId");

-- CreateIndex
CREATE INDEX "PatentInventor_designation_idx" ON "PatentInventor"("designation");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE INDEX "InventorDepartment_departmentId_idx" ON "InventorDepartment"("departmentId");

-- AddForeignKey
ALTER TABLE "Patent" ADD CONSTRAINT "Patent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatentInventor" ADD CONSTRAINT "PatentInventor_patentId_fkey" FOREIGN KEY ("patentId") REFERENCES "Patent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventorDepartment" ADD CONSTRAINT "InventorDepartment_inventorId_fkey" FOREIGN KEY ("inventorId") REFERENCES "PatentInventor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventorDepartment" ADD CONSTRAINT "InventorDepartment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
