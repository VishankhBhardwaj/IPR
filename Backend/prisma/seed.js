import dotenv from "dotenv";

dotenv.config();
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const password = process.env.DB_PASSWORD;

const adapter = new PrismaMariaDb({
  host: "localhost",
  port: Number(process.env.DB_PORT),
  user: "root",
  password: password,
  database: "ipr_db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.inventorDepartment.deleteMany();
  await prisma.patentInventor.deleteMany();
  await prisma.department.deleteMany();
  await prisma.patent.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      role: "ADMIN",
    },
  });

  const faculty = await prisma.user.create({
    data: {
      name: "Dr. John Smith",
      email: "faculty@example.com",
      password: "faculty123",
      role: "FACULTY",
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "student@example.com",
      password: "student123",
      role: "STUDENT",
    },
  });

  const departments = await Promise.all([
    prisma.department.create({ data: { name: "Computer Science" } }),
    prisma.department.create({ data: { name: "Electronics" } }),
    prisma.department.create({ data: { name: "Mechanical Engineering" } }),
  ]);

  const [csDepartment, electronicsDepartment, mechanicalDepartment] = departments;

  const patentSeedData = [
    {
      applicationNo: "IN202600001",
      status: "PUBLISHED",
      inventorName: "TEST INVENTOR",
      patentTitle: "AI Based Patent Analysis System",
      applicantName: "ABC University",
      filedDate: new Date("2026-01-10"),
      publicationDate: new Date("2026-03-15"),
      publicationNo: "PUB202600001",
      institueAffiliation: "Department of Computer Science",
      driveLink: "https://drive.google.com/demo1",
      year: 2026,
      patentType: "UTILITY",
      patentSession: "2025-26",
      weblink: "https://example.com/patent1",
      country: "India",
      userId: admin.id,
      inventors: [
        {
          name: "Dr. Rahul Sharma",
          designation: "PROFESSOR",
          departmentIds: [csDepartment.id, electronicsDepartment.id],
        },
        {
          name: "Ms. Priya Nair",
          designation: "ASSISTANT_PROFESSOR",
          departmentIds: [csDepartment.id],
        },
      ],
    },
    {
      applicationNo: "IN202600002",
      status: "GRANTED",
      inventorName: "John Smith",
      patentTitle: "Smart Irrigation System",
      applicantName: "XYZ Institute",
      filedDate: new Date("2025-08-20"),
      publicationDate: new Date("2026-02-05"),
      publicationNo: "PUB202600002",
      institueAffiliation: "Department of Electronics",
      driveLink: "https://drive.google.com/demo2",
      year: 2026,
      patentType: "UTILITY",
      patentSession: "2025-26",
      weblink: "https://example.com/patent2",
      country: "India",
      userId: faculty.id,
      inventors: [
        {
          name: "Dr. John Smith",
          designation: "ASSOCIATE_PROFESSOR",
          departmentIds: [electronicsDepartment.id],
        },
      ],
    },
    {
      applicationNo: "IN202600003",
      status: "PUBLISHED",
      inventorName: "Alice Johnson",
      patentTitle: "Portable Water Purifier Design",
      applicantName: "DEF College",
      filedDate: new Date("2026-02-12"),
      publicationDate: new Date("2026-05-01"),
      publicationNo: "PUB202600003",
      institueAffiliation: "Mechanical Engineering Department",
      driveLink: "https://drive.google.com/demo3",
      year: 2026,
      patentType: "DESIGN",
      patentSession: "2025-26",
      weblink: "https://example.com/patent3",
      country: "India",
      userId: student.id,
      inventors: [
        {
          name: "Alice Johnson",
          designation: "STUDENT",
          departmentIds: [mechanicalDepartment.id],
        },
        {
          name: "Prof. Arun Kumar",
          designation: "PROFESSOR",
          departmentIds: [mechanicalDepartment.id],
        },
      ],
    },
  ];

  for (const patentData of patentSeedData) {
    const { inventors, ...patentFields } = patentData;

    await prisma.patent.create({
      data: {
        ...patentFields,
        inventors: {
          create: inventors.map((inventor) => ({
            name: inventor.name,
            designation: inventor.designation,
            departments: {
              create: inventor.departmentIds.map((departmentId) => ({
                department: {
                  connect: { id: departmentId },
                },
              })),
            },
          })),
        },
      },
    });
  }

  console.log("Demo data seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });