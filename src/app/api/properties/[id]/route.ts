// ============================================================================
// Properties [id] — GET | PATCH | DELETE
// ============================================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { unauthorizedResponse, forbiddenResponse, successResponse, errorResponse, notFoundResponse } from "@/lib/auth-helpers";
import { updatePropertySchema } from "@/validations";
import { propertyService } from "@/services";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  const { id } = await params;
  const result = await propertyService.getById(id);
  if (!result.success) return notFoundResponse("Property");
  return successResponse(result.data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session.user as any).role;
  if (role !== "admin" && role !== "manager") return forbiddenResponse();

  const { id } = await params;
  const body = await req.json();
  const parsed = updatePropertySchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("Validation failed: " + JSON.stringify(parsed.error.flatten()), 400);
  }

  const result = await propertyService.update(id, parsed.data);
  if (!result.success) return errorResponse(result.error ?? "Update failed", 400);
  return successResponse(result.data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session.user as any).role;
  if (role !== "admin") return forbiddenResponse();

  const { id } = await params;
  const result = await propertyService.delete(id);
  if (!result.success) return errorResponse(result.error ?? "Delete failed", 400);
  return successResponse({ deleted: true });
}