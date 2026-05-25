import "dotenv/config";

// Prisma 5 configuration — reads DATABASE_URL from environment
export default {
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env["DATABASE_URL"],
  },
};