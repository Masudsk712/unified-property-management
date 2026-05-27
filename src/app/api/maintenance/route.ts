// ============================================================================
// Maintenance API — GET (list) | POST (create)
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { unauthorizedResponse, successResponse, errorResponse } from "@/lib/auth-helpers";
import { createMaintenanceSchema } from "@/validations";
import { maintenanceService } from "@/services";
import { emitMaintenanceEvent, broadcastActivity } from "@/lib/socket-server";
import { SOCKET_EVENTS } from "@/lib/socket-types";

export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  const result = await maintenanceService.getAll();
  if (!result.success) return errorResponse(result.error ?? "Failed to fetch maintenance requests", 500);
  return successResponse(result.data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const parsed = createMaintenanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const result = await maintenanceService.create(parsed.data);
    if (!result.success) return errorResponse(result.error ?? "Failed to create maintenance request", 400);

    // Emit real-time maintenance event
    emitMaintenanceEvent(SOCKET_EVENTS.MAINTENANCE_CREATED, result.data as Parameters<typeof emitMaintenanceEvent>[1]);

    // Broadcast activity
    await broadcastActivity({
      userId: session.user.id!,
      userName: session.user.name ?? "Unknown",
      userAvatar: session.user.image ?? null,
      action: "submitted maintenance request for",
      target: `${parsed.data.propertyName} - ${parsed.data.unit}`,
      type: "maintenance",
    });

    return successResponse(result.data, 201);
  } catch {
    return errorResponse("Invalid request body", 400);
  }
}
