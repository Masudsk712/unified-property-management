// ============================================================================
// Bookings [id] — PATCH (update status) | DELETE
// Emits real-time events on status changes
// ============================================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { unauthorizedResponse, successResponse, errorResponse } from "@/lib/auth-helpers";
import { updateBookingSchema } from "@/validations";
import { bookingService } from "@/services";
import { emitBookingEvent, broadcastActivity, sendRealTimeNotification, refreshDashboard } from "@/lib/socket-server";
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
    const parsed = updateBookingSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ success: false, error: "Validation failed", details: parsed.error.flatten() }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await bookingService.update(id, parsed.data);
    if (!result.success) return errorResponse(result.error ?? "Failed to update booking", 400);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedBooking = result.data as any;
    const newStatus = parsed.data.status ?? updatedBooking.status;

    // Emit appropriate event based on status
    if (newStatus === "cancelled") {
      emitBookingEvent(SOCKET_EVENTS.BOOKING_CANCELLED, updatedBooking);
    } else {
      emitBookingEvent(SOCKET_EVENTS.BOOKING_UPDATED, updatedBooking);
    }

    // Broadcast activity
    await broadcastActivity({
      userId: session.user.id!,
      userName: session.user.name ?? "Unknown",
      userAvatar: session.user.image ?? null,
      action: `${newStatus === "cancelled" ? "cancelled" : "updated"} booking for`,
      target: `${updatedBooking.amenityName ?? "amenity"}`,
      type: "booking",
    });

    // Notify the user who booked
    if (updatedBooking.userId) {
      await sendRealTimeNotification(
        updatedBooking.userId as string,
        {
          userId: updatedBooking.userId as string,
          title: "Booking Updated",
          message: `Your booking for "${updatedBooking.amenityName ?? "amenity"}" is now ${newStatus}`,
          type: newStatus === "cancelled" ? "warning" : "success",
          read: false,
          link: `/amenities/bookings`,
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
  const result = await bookingService.delete(id);
  if (!result.success) return errorResponse(result.error ?? "Failed to delete booking", 400);

  // Refresh dashboard
  const dashResult = await dashboardService.getStats();
  if (dashResult.success) {
    refreshDashboard(dashResult.data as Parameters<typeof refreshDashboard>[0]);
  }

  return successResponse({ deleted: true });
}