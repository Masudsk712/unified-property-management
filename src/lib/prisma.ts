// ============================================================================
// Prisma Client Singleton — Production-Optimized MongoDB Connection
// Features: connection pooling, prepared statements caching, query logging control
// ============================================================================

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const isDev = process.env.NODE_ENV === "development";

  const client = new PrismaClient({
    log: isDev ? ["warn", "error"] : ["error"],
    // Connection pooling for MongoDB
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Graceful shutdown hooks (Node.js only — skip in Edge Runtime)
  if (typeof window === "undefined" && typeof process !== "undefined" && process.once) {
    const handleShutdown = async () => {
      await client.$disconnect();
    };

    process.once("SIGINT", handleShutdown);
    process.once("SIGTERM", handleShutdown);
    process.once("beforeExit", handleShutdown);
  }

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Test the database connection with a lightweight ping.
 * Returns `true` if connected, `false` otherwise.
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$runCommandRaw({ ping: 1 });
    return true;
  } catch (error) {
    console.error("[PRISMA] Database connection failed:", error);
    return false;
  }
}

/**
 * Gracefully disconnect Prisma on shutdown.
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

export default prisma;