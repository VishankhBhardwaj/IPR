const prisma = require('./src/config/prisma.js');
const xlsx = require('xlsx');

function excelDateToJSDate(serial) {
  if (!serial || isNaN(serial)) return new Date();
  // Excel starts counting days from Dec 30, 1899
  const utc_days  = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;                                        
  const date_info = new Date(utc_value * 1000);
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
}

async function main() {
  // Check if we have an admin user, if not create one
  let user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@example.com',
        password: 'password123', // In a real app this should be hashed
        role: 'ADMIN',
      },
    });
  }

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

      const filedDate = typeof row['Filed Date (DD/MM/YYYY) '] === 'number' 
        ? excelDateToJSDate(row['Filed Date (DD/MM/YYYY) ']) 
        : new Date(row['Filed Date (DD/MM/YYYY) '] || Date.now());

      const pubDateKey = Object.keys(row).find(k => k.includes('Published/ Grant Date'));
      const publicationDate = typeof row[pubDateKey] === 'number'
        ? excelDateToJSDate(row[pubDateKey])
        : new Date(row[pubDateKey] || Date.now());

      await prisma.patent.upsert({
        where: { applicationNo: applicationNo },
        update: {}, // don't update if it already exists to avoid overriding manual edits, or update if you want
        create: {
          applicationNo: applicationNo,
          status: status,
          inventorName: String(row['Inventor/s Name'] || ''),
          patentTitle: String(row['Title of the Patent'] || ''),
          applicantName: String(row['Applicant/s Name'] || ''),
          filedDate: filedDate,
          publicationDate: publicationDate,
          publicationNo: publicationNo || applicationNo, // publicationNo is unique, fallback to applicationNo if missing
          institueAffiliation: String(row['Institute Affiliation'] || ''),
          driveLink: String(row['Drive Link'] || ''),
          year: parseInt(row['Year'] || new Date().getFullYear()),
          patentType: patentType,
          patentSession: String(row['Session'] || ''),
          weblink: String(row['Web link'] || ''),
          country: String(row['Country'] || ''),
          userId: user.id
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
