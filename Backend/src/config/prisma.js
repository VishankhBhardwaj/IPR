const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const adapter = new PrismaMariaDb({
  host: "localhost",
  user: "root",
  password: "pratik196@", // adjust if user has a password
  database: "ipr_db",
  allowPublicKeyRetrieval: true
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;