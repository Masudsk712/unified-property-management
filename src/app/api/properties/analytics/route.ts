// ============================================================================
// Property Analytics API — GET analytics data for the property dashboard
// ============================================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { unauthorizedResponse, successResponse, errorResponse } from "@/lib/auth-helpers";
import { propertyService } from "@/services";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  const result = await propertyService.getAnalytics();
  if (!result.success) return errorResponse(result.error ?? "Failed to fetch analytics", 500);
  return successResponse(result.data);
}