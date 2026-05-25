// ============================================================================
// Dashboard Stats API — GET aggregate portfolio statistics
// ============================================================================

import { auth } from "@/lib/auth";
import { unauthorizedResponse, successResponse, errorResponse } from "@/lib/auth-helpers";
import { dashboardService } from "@/services";
import { activityService } from "@/services";

export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  try {
    const [statsResult, activityResult] = await Promise.all([
      dashboardService.getStats(),
      activityService.getAll(10),
    ]);

    if (!statsResult.success) {
      return errorResponse(statsResult.error ?? "Failed to fetch dashboard stats", 500);
    }

    return successResponse({
      stats: statsResult.data,
      recentActivity: activityResult.success ? activityResult.data : [],
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return errorResponse("Failed to load dashboard", 500);
  }
}