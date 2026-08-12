const prisma = require('./src/config/prisma.js');
const bcrypt = require('bcrypt');
const xlsx = require('xlsx');

function excelDateToJSDate(serial) {
  if (!serial || isNaN(serial)) return new Date();
  // Excel starts counting days from Dec 30, 1899
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
  
  // Try split by '/' (DD/MM/YYYY)
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
      return new Date(y, m, d);
    }
  }
  
  // Try split by '-' (DD-MM-YYYY or YYYY-MM-DD)
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

async function main() {
  console.log("Truncating previous patent data...");
  await prisma.patent.deleteMany();
  // await prisma.user.deleteMany();

  console.log("Resetting database auto-increment counters to 1...");
  // await prisma.$executeRawUnsafe('ALTER TABLE User AUTO_INCREMENT = 1;');
  await prisma.$executeRawUnsafe('ALTER TABLE Patent AUTO_INCREMENT = 1;');

  const firstUser = await prisma.user.findFirst();
  let defaultUserId = firstUser ? firstUser.id : 1;


  const wb = xlsx.readFile('../IPR_Data_For_Project.xlsx');
  const sheetName = wb.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { raw: true });

  let successCount = 0;
  let failCount = 0;

  for (const row of data) {
    try {
      const applicationNo = String(row['Application No.'] || '').trim();
      if (!applicationNo) continue;

      const statusStr = String(row['Published / Granted'] || '').toUpperCase().trim();
      const status = statusStr.includes('GRANT') ? 'GRANTED' : 'PUBLISHED';

      const typeStr = String(row['Utility/\r\nDesign'] || row['Utility/Design'] || '').toUpperCase().trim();
      const patentType = typeStr.startsWith('D') ? 'DESIGN' : 'UTILITY';

      const publicationNo = String(row['Publication\r\n/Grant Number'] || row['Publication/Grant Number'] || '').trim();

      const filedDate = parseExcelOrStrDate(row['Filed Date (DD/MM/YYYY) ']);

      const pubDateKey = Object.keys(row).find(k => k.includes('Published/ Grant Date'));
      const publicationDate = parseExcelOrStrDate(row[pubDateKey]);

      // Determine patent owner based on inventor name
      let userId = defaultUserId;

      await prisma.patent.upsert({
        where: { applicationNo: applicationNo },
        update: {},
        create: {
          applicationNo: applicationNo,
          status: status,
          inventorName: String(row['Inventor/s Name'] || ''),
          patentTitle: String(row['Title of the Patent'] || ''),
          applicantName: String(row['Applicant/s Name'] || ''),
          filedDate: filedDate,
          publicationDate: publicationDate,
          publicationNo: publicationNo || applicationNo,
          driveLink: String(row['Drive Link'] || ''),
          year: parseInt(row['Year'] || new Date().getFullYear()),
          patentType: patentType,
          patentSession: String(row['Session'] || ''),
          weblink: String(row['Web link'] || ''),
          country: String(row['Country'] || ''),
          userId: userId
        }
      });
      successCount++;
    } catch (e) {
      console.error(`Error processing row with application number ${row['Application No.']}:`, e.message);
      failCount++;
    }
  }

  console.log(`Seeding finished. Successfully inserted/upserted ${successCount} patents. Failed: ${failCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
