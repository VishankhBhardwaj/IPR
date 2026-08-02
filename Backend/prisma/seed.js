import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import xlsx from "xlsx";
import bcrypt from "bcrypt";

const password = process.env.DB_PASSWORD;

const adapter = new PrismaMariaDb({
  host: "localhost",
  port: Number(process.env.DB_PORT),
  user: "root",
  password: password,
  database: "ipr_db",
});

const prisma = new PrismaClient({ adapter });

function excelDateToJSDate(serial) {
  if (!serial || isNaN(serial)) return new Date();
  const utc_days  = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;                                        
  const date_info = new Date(utc_value * 1000);
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
}

function parseExcelOrStrDate(val) {
  if (val === undefined || val === null || val === '') return new Date();
  if (typeof val === 'number') {
    return excelDateToJSDate(val);
  }
  const dateStr = String(val).trim();
  if (!dateStr) return new Date();
  
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
      return new Date(y, m, d);
    }
  }
  
  const dashParts = dateStr.split('-');
  if (dashParts.length === 3) {
    if (dashParts[0].length === 4) {
      const y = parseInt(dashParts[0], 10);
      const m = parseInt(dashParts[1], 10) - 1;
      const d = parseInt(dashParts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d);
      }
    } else {
      const d = parseInt(dashParts[0], 10);
      const m = parseInt(dashParts[1], 10) - 1;
      const y = parseInt(dashParts[2], 10);
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
        return new Date(y, m, d);
      }
    }
  }

  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    return new Date();
  }
  return parsed;
}

function parseInventors(inventorStr) {
  if (!inventorStr) return [];
  // Clean up common typos like ". Dr." or ". Prof." and replace with a comma
  let cleanStr = String(inventorStr).replace(/\.\s+(Dr\.|Prof\.)/gi, ', $1');
  cleanStr = cleanStr.replace(/;/g, ',');
  
  return cleanStr.split(',')
    .map(name => name.trim())
    .filter(name => name.length > 0);
}

async function main() {
  console.log("Truncating previous patent and user data...");
  await prisma.inventorDepartment.deleteMany();
  await prisma.patentInventor.deleteMany();
  await prisma.department.deleteMany();
  await prisma.patent.deleteMany();
  await prisma.user.deleteMany();

  console.log("Resetting database auto-increment counters to 1...");
  await prisma.$executeRawUnsafe('ALTER TABLE User AUTO_INCREMENT = 1;');
  await prisma.$executeRawUnsafe('ALTER TABLE Patent AUTO_INCREMENT = 1;');
  await prisma.$executeRawUnsafe('ALTER TABLE PatentInventor AUTO_INCREMENT = 1;');
  await prisma.$executeRawUnsafe('ALTER TABLE Department AUTO_INCREMENT = 1;');

  console.log("Creating standard users (Admin, Faculty, Student)...");
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  });

  const faculty = await prisma.user.create({
    data: {
      name: "Dr. John Smith",
      email: "faculty@example.com",
      password: await bcrypt.hash("faculty123", 10),
      role: "FACULTY",
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "student@example.com",
      password: await bcrypt.hash("student123", 10),
      role: "STUDENT",
    },
  });

  console.log("Creating standard departments...");
  const csDept = await prisma.department.create({ data: { name: "Computer Science" } });
  const electronicsDept = await prisma.department.create({ data: { name: "Electronics" } });
  const mechanicalDept = await prisma.department.create({ data: { name: "Mechanical Engineering" } });

  console.log("Loading Excel data...");
  const wb = xlsx.readFile('../IPR_Data_For_Project.xlsx');
  const sheetName = wb.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { raw: true });

  let successCount = 0;
  let failCount = 0;

  const usedApplicationNos = new Set();
  const usedPublicationNos = new Set();

  for (const row of data) {
    try {
      let applicationNo = String(row['Application No.'] || '').trim();
      if (!applicationNo) continue;

      // Handle duplicate application numbers in excel (if any)
      if (usedApplicationNos.has(applicationNo)) {
        console.warn(`Duplicate application number found: ${applicationNo}, skipping.`);
        continue;
      }
      usedApplicationNos.add(applicationNo);

      const statusStr = String(row['Published / Granted'] || '').toUpperCase().trim();
      const status = statusStr.includes('GRANT') ? 'GRANTED' : 'PUBLISHED';

      const typeStr = String(row['Utility/\r\nDesign'] || row['Utility/Design'] || '').toUpperCase().trim();
      const patentType = typeStr.startsWith('D') ? 'DESIGN' : 'UTILITY';

      let publicationNo = String(row['Publication\r\n/Grant Number'] || row['Publication/Grant Number'] || '').trim();
      if (!publicationNo) {
        publicationNo = applicationNo;
      }

      // Handle unique publication number constraint
      if (usedPublicationNos.has(publicationNo)) {
        publicationNo = `${publicationNo}_${applicationNo}`;
      }
      usedPublicationNos.add(publicationNo);

      const filedDate = parseExcelOrStrDate(row['Filed Date (DD/MM/YYYY) ']);

      const pubDateKey = Object.keys(row).find(k => k.includes('Published/ Grant Date'));
      const publicationDate = parseExcelOrStrDate(row[pubDateKey]);

      // Determine patent owner based on inventor name
      let userId;
      const lowerInventor = String(row['Inventor/s Name'] || '').toLowerCase();
      if (lowerInventor.includes('dr.') || lowerInventor.includes('prof.')) {
        userId = faculty.id;
      } else if (lowerInventor.includes('alice') || lowerInventor.includes('johnson') || lowerInventor.includes('student')) {
        userId = student.id;
      } else {
        userId = (successCount % 2 === 0) ? admin.id : student.id;
      }

      const title = String(row['Title of the Patent'] || '');

      // Determine department category based on title heuristics
      let matchingDeptId = csDept.id;
      const lowerTitle = title.toLowerCase();
      if (
        lowerTitle.includes("cloud") ||
        lowerTitle.includes("computing") ||
        lowerTitle.includes("software") ||
        lowerTitle.includes("ai") ||
        lowerTitle.includes("algorithm") ||
        lowerTitle.includes("network") ||
        lowerTitle.includes("machine learning") ||
        lowerTitle.includes("data") ||
        lowerTitle.includes("deep learning") ||
        lowerTitle.includes("neural")
      ) {
        matchingDeptId = csDept.id;
      } else if (
        lowerTitle.includes("plug") ||
        lowerTitle.includes("iot") ||
        lowerTitle.includes("irrigation") ||
        lowerTitle.includes("electronics") ||
        lowerTitle.includes("circuit") ||
        lowerTitle.includes("smart") ||
        lowerTitle.includes("device") ||
        lowerTitle.includes("sensor") ||
        lowerTitle.includes("hardware") ||
        lowerTitle.includes("multipoint")
      ) {
        matchingDeptId = electronicsDept.id;
      } else if (
        lowerTitle.includes("mechanical") ||
        lowerTitle.includes("water purifier") ||
        lowerTitle.includes("design") ||
        lowerTitle.includes("machine") ||
        lowerTitle.includes("vehicle") ||
        lowerTitle.includes("structure") ||
        lowerTitle.includes("engine")
      ) {
        matchingDeptId = mechanicalDept.id;
      }

      // Parse list of inventors
      const inventorsList = parseInventors(row['Inventor/s Name']);

      // Create the patent record first
      const patent = await prisma.patent.create({
        data: {
          applicationNo: applicationNo,
          status: status,
          inventorName: String(row['Inventor/s Name'] || ''),
          patentTitle: title,
          applicantName: String(row['Applicant/s Name'] || ''),
          filedDate: filedDate,
          publicationDate: publicationDate,
          publicationNo: publicationNo,
          institueAffiliation: String(row['Institute Affiliation'] || ''),
          driveLink: String(row['Drive Link'] || ''),
          year: parseInt(row['Year'] || new Date().getFullYear()),
          patentType: patentType,
          patentSession: String(row['Session'] || ''),
          weblink: String(row['Web link'] || ''),
          country: String(row['Country'] || ''),
          userId: userId
        }
      });

      // Insert all individual inventors and connect them to the department
      for (const invName of inventorsList) {
        const lowerName = invName.toLowerCase();
        const designation = (lowerName.includes("dr.") || lowerName.includes("prof.")) ? "PROFESSOR" : "STUDENT";

        await prisma.patentInventor.create({
          data: {
            name: invName,
            designation: designation,
            patentId: patent.id,
            departments: {
              create: {
                departmentId: matchingDeptId
              }
            }
          }
        });
      }

      successCount++;
    } catch (e) {
      console.error(`Error processing row with application number ${row['Application No.']}:`, e);
      failCount++;
    }
  }

  console.log(`Seeding finished. Successfully inserted ${successCount} patents with structured inventors. Failed: ${failCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });