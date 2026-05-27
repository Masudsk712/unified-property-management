// ============================================================================
// Bookings API — GET (list) | POST (create)
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { unauthorizedResponse, successResponse, errorResponse } from "@/lib/auth-helpers";
import { createBookingSchema } from "@/validations";
import { bookingService } from "@/services";
import { emitBookingEvent, broadcastActivity } from "@/lib/socket-server";
import { SOCKET_EVENTS } from "@/lib/socket-types";

export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  const result = await bookingService.getAll();
  if (!result.success) return errorResponse(result.error ?? "Failed to fetch bookings", 500);
  return successResponse(result.data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const parsed = createBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const result = await bookingService.create(parsed.data);
    if (!result.success) return errorResponse(result.error ?? "Failed to create booking", 400);

    // Emit real-time booking event
    emitBookingEvent(SOCKET_EVENTS.BOOKING_CREATED, result.data as Parameters<typeof emitBookingEvent>[1]);

    // Broadcast activity
    await broadcastActivity({
      userId: session.user.id!,
      userName: session.user.name ?? "Unknown",
      userAvatar: session.user.image ?? null,
      action: "booked",
      target: parsed.data.amenityName,
      type: "booking",
    });

    return successResponse(result.data, 201);
  } catch {
    return errorResponse("Invalid request body", 400);
  }
}
