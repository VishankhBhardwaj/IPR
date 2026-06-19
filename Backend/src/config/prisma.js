require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}
const dbUrl = new URL(process.env.DATABASE_URL);

const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: dbUrl.port ? parseInt(dbUrl.port) : 3306,
  user: dbUrl.username,
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.substring(1),
  allowPublicKeyRetrieval: true
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;