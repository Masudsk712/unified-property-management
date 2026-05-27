// ============================================================================
// Health Check API — Production Monitoring Endpoint
// Used by: Vercel, monitoring tools, load balancers, uptime checkers
// GET /api/health
// ============================================================================

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database: {
      status: "connected" | "disconnected";
      latency?: number;
    };
    memory: {
      used: string;
      total: string;
      percent: number;
    };
  };
}

export async function GET(): Promise<NextResponse> {
  const startTime = Date.now();

  const services: HealthStatus["services"] = {
    database: { status: "disconnected" },
    memory: {
      used: "N/A",
      total: "N/A",
      percent: 0,
    },
  };

  // ── Database Health Check ──────────────────────────────────────────────
  try {
    const pingStart = Date.now();
    await prisma.$runCommandRaw({ ping: 1 });
    services.database = {
      status: "connected",
      latency: Date.now() - pingStart,
    };
  } catch (error) {
    logger.error("Health check: database ping failed", error as Error);
    services.database = { status: "disconnected" };
  }

  // ── Memory Check ───────────────────────────────────────────────────────
  if (typeof process !== "undefined" && process.memoryUsage) {
    try {
      const mem = process.memoryUsage();
      const usedMB = Math.round(mem.heapUsed / 1024 / 1024);
      const totalMB = Math.round(mem.heapTotal / 1024 / 1024);
      services.memory = {
        used: `${usedMB} MB`,
        total: `${totalMB} MB`,
        percent: totalMB > 0 ? Math.round((usedMB / totalMB) * 100) : 0,
      };
    } catch {
      // memory usage not available (Edge runtime)
    }
  }

  // ── Determine Overall Status ───────────────────────────────────────────
  const dbOK = services.database.status === "connected";
  const memoryOK = services.memory.percent < 90;
  let overallStatus: HealthStatus["status"];

  if (dbOK && memoryOK) {
    overallStatus = "healthy";
  } else if (dbOK && !memoryOK) {
    overallStatus = "degraded";
  } else {
    overallStatus = "unhealthy";
  }

  const response: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "development",
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || "local",
    services,
  };

  logger.info("Health check completed", {
    path: "/api/health",
    method: "GET",
    statusCode: overallStatus === "healthy" ? 200 : 503,
    duration: Date.now() - startTime,
    context: { status: overallStatus },
  });

  return NextResponse.json(response, {
    status: overallStatus === "healthy" ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Response-Time": `${Date.now() - startTime}ms`,
    },
  });
}