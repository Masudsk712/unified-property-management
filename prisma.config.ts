import "dotenv/config";

// Prisma 7 configuration — connection URL provided via datasource.url
export default {
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env["DATABASE_URL"],
  },
};
