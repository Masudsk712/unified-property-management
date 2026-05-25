// ============================================================================
// Prisma Client Singleton — Local MongoDB Connection
// Prevents exhausting database connections during Next.js hot-reloads.
// Uses LOCAL MongoDB Compass (mongodb://127.0.0.1:27017/propertypro)
// ============================================================================

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });

  // Log the connection URL (without credentials, which don't exist for local)
  const dbUrl = process.env.DATABASE_URL ?? "not set";
  console.log("[PRISMA] Initializing Prisma client...");
  console.log("[PRISMA] DATABASE_URL:", dbUrl);
  console.log("[PRISMA] Provider: MongoDB (local)");

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Test the database connection.
 * Returns `true` if connected, `false` otherwise.
 * Call this on startup or health-check endpoints.
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    console.log("[PRISMA] Testing database connection...");
    // Run a lightweight raw command to verify connectivity
    await prisma.$runCommandRaw({ ping: 1 });
    console.log("[PRISMA] Database connection successful.");
    return true;
  } catch (error) {
    console.error("[PRISMA] Database connection failed:", error);
    return false;
  }
}

/**
 * Gracefully disconnect Prisma on shutdown.
 * Call this in process termination handlers if needed.
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
  console.log("[PRISMA] Disconnected from database.");
}

export default prisma;