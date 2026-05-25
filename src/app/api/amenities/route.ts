// ============================================================================
// Amenities API — GET (list) | POST (create)
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { unauthorizedResponse, forbiddenResponse, successResponse, errorResponse } from "@/lib/auth-helpers";
import { createAmenitySchema } from "@/validations";
import { amenityService } from "@/services";

export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  const result = await amenityService.getAll();
  if (!result.success) return errorResponse(result.error ?? "Failed to fetch amenities", 500);
  return successResponse(result.data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session.user as any).role;
  if (role !== "admin" && role !== "manager") return forbiddenResponse();

  try {
    const body = await req.json();
    const parsed = createAmenitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const result = await amenityService.create(parsed.data);
    if (!result.success) return errorResponse(result.error ?? "Failed to create amenity", 400);
    return successResponse(result.data, 201);
  } catch {
    return errorResponse("Invalid request body", 400);
  }
}