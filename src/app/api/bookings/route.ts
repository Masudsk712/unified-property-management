// ============================================================================
// Bookings API — GET (list) | POST (create)
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { unauthorizedResponse, successResponse, errorResponse } from "@/lib/auth-helpers";
import { createBookingSchema } from "@/validations";
import { bookingService } from "@/services";

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
    return successResponse(result.data, 201);
  } catch {
    return errorResponse("Invalid request body", 400);
  }
}