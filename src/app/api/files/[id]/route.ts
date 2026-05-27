// ============================================================================
// File by ID API — GET (single file) | DELETE (remove file)
// ============================================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  unauthorizedResponse,
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/lib/auth-helpers";
import { fileService } from "@/services/file.service";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/files/[id]
 * Retrieve a single file's metadata by its database ID.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  try {
    const { id } = await params;
    if (!id) return errorResponse("File ID is required", 400);

    const result = await fileService.getByUser(session.user.id!);
    if (!result.success || !result.data) {
      return errorResponse(result.error ?? "Failed to fetch file", 500);
    }

    const file = result.data.find((f) => f.id === id);
    if (!file) return notFoundResponse("File");

    return successResponse(file);
  } catch (error) {
    console.error("[FILES API] Get file error:", error);
    return errorResponse("Failed to retrieve file", 500);
  }
}

/**
 * DELETE /api/files/[id]
 * Delete a file (Cloudinary + soft-delete in DB).
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  try {
    const { id } = await params;
    if (!id) return errorResponse("File ID is required", 400);

    const result = await fileService.delete(id, session.user.id!);
    if (!result.success) {
      return errorResponse(result.error ?? "Failed to delete file", 500);
    }

    return successResponse({ deleted: true, id });
  } catch (error) {
    console.error("[FILES API] Delete error:", error);
    return errorResponse("Failed to delete file", 500);
  }
}