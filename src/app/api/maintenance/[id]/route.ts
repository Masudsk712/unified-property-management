// ============================================================================
// Maintenance [id] — PATCH (update status) | DELETE
// Emits real-time events on status changes
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { unauthorizedResponse, successResponse, errorResponse } from "@/lib/auth-helpers";
import { updateMaintenanceSchema } from "@/validations";
import { maintenanceService } from "@/services";
import { emitMaintenanceEvent, broadcastActivity, sendRealTimeNotification, refreshDashboard } from "@/lib/socket-server";
import { SOCKET_EVENTS } from "@/lib/socket-types";
import { dashboardService } from "@/services";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = updateMaintenanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await maintenanceService.update(id, parsed.data);
    if (!result.success) return errorResponse(result.error ?? "Failed to update maintenance request", 400);

    const updatedRequest = result.data as Record<string, unknown>;

    // Determine which event to emit based on status
    const newStatus = parsed.data.status ?? updatedRequest.status;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventData = updatedRequest as any;
    if (newStatus === "resolved" || newStatus === "closed") {
      emitMaintenanceEvent(SOCKET_EVENTS.MAINTENANCE_RESOLVED, eventData);
    } else {
      emitMaintenanceEvent(SOCKET_EVENTS.MAINTENANCE_UPDATED, eventData);
    }

    // Broadcast activity
    await broadcastActivity({
      userId: session.user.id!,
      userName: session.user.name ?? "Unknown",
      userAvatar: session.user.image ?? null,
      action: `updated maintenance status to ${newStatus} for`,
      target: `${updatedRequest.title ?? "maintenance request"}`,
      type: "maintenance",
    });

    // Send notification to the requester
    if (updatedRequest.requestedBy) {
      await sendRealTimeNotification(
        updatedRequest.requestedBy as string,
        {
          userId: updatedRequest.requestedBy as string,
          title: "Maintenance Updated",
          message: `Your request "${updatedRequest.title ?? "Maintenance request"}" is now ${newStatus}`,
          type: newStatus === "resolved" ? "success" : "info",
          read: false,
          link: `/maintenance/${id}`,
        }
      );
    }

    // Refresh dashboard
    const dashResult = await dashboardService.getStats();
    if (dashResult.success) {
      refreshDashboard(dashResult.data as Parameters<typeof refreshDashboard>[0]);
    }

    return successResponse(result.data);
  } catch {
    return errorResponse("Invalid request body", 400);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  const { id } = await params;
  const result = await maintenanceService.delete(id);
  if (!result.success) return errorResponse(result.error ?? "Failed to delete maintenance request", 400);

  // Refresh dashboard
  const dashResult = await dashboardService.getStats();
  if (dashResult.success) {
    refreshDashboard(dashResult.data as Parameters<typeof refreshDashboard>[0]);
  }

  return successResponse({ deleted: true });
}