// ============================================================================
// Files API — POST (upload single/multiple) | GET (list by entity/folder)
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { unauthorizedResponse, successResponse, errorResponse } from "@/lib/auth-helpers";
import { fileService } from "@/services/file.service";
import type { UploadFileInput } from "@/services/file.service";
import {
  validateFile,
  MAX_FILES_PER_UPLOAD,
} from "@/lib/file-validations";

/**
 * POST /api/files
 * Upload single or multiple files.
 * FormData fields:
 *   - files: File | File[] (required)
 *   - entityId: string (optional) — associated property/tenant/maintenance ID
 *   - entityType: string (optional) — "property" | "tenant" | "maintenance"
 *   - folder: string (optional) — "properties" | "tenants" | "maintenance" | "general"
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  try {
    const formData = await req.formData();
    const fileEntries = formData.getAll("files");

    if (!fileEntries || fileEntries.length === 0) {
      return errorResponse("No files provided", 400);
    }

    // Extract optional metadata fields
    const entityId = (formData.get("entityId") as string) ?? undefined;
    const entityType = (formData.get("entityType") as string) ?? undefined;
    const folder = (formData.get("folder") as string) ?? entityType ?? "general";

    // Extract all File objects from FormData
    const files: File[] = [];
    for (const entry of fileEntries) {
      if (entry instanceof File) {
        files.push(entry);
      }
    }

    if (files.length === 0) {
      return errorResponse("No valid files found in request", 400);
    }

    if (files.length > MAX_FILES_PER_UPLOAD) {
      return errorResponse(
        `Maximum ${MAX_FILES_PER_UPLOAD} files allowed per upload. Got ${files.length}.`,
        400
      );
    }

    // Validate each file
    for (const file of files) {
      const validation = validateFile(file, { folder: folder as any });
      if (!validation.valid) {
        return errorResponse(validation.error ?? "File validation failed", 400);
      }
    }

    // Convert to buffer-based input for the service
    const uploadInputs: UploadFileInput[] = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return {
          file: buffer,
          filename: file.name,
          originalName: file.name,
          mimeType: file.type,
          folder,
          entityId,
          entityType,
          uploadedBy: session.user.id!,
          resourceType: file.type.startsWith("image/") ? "image" : "raw",
        };
      })
    );

    // Upload files via service
    const result = await fileService.uploadMultiple(uploadInputs);

    if (!result.success) {
      return errorResponse(result.error ?? "Upload failed", 500);
    }

    return successResponse(
      {
        files: result.data,
        count: result.data?.length ?? 0,
      },
      201
    );
  } catch (error) {
    console.error("[FILES API] Upload error:", error);
    return errorResponse("Failed to process upload", 500);
  }
}

/**
 * GET /api/files?entityId=...&entityType=...&folder=...&userId=...
 * List files filtered by entity, folder, or user.
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(req.url);
    const entityId = searchParams.get("entityId");
    const entityType = searchParams.get("entityType");
    const folder = searchParams.get("folder");
    const userId = searchParams.get("userId");

    let result;

    if (entityId && entityType) {
      result = await fileService.getByEntity(entityId, entityType);
    } else if (folder) {
      result = await fileService.getByFolder(folder);
    } else if (userId) {
      result = await fileService.getByUser(userId);
    } else {
      // Default: return files by folder "general" or all accessible
      result = await fileService.getByFolder("general");
    }

    if (!result.success) {
      return errorResponse(result.error ?? "Failed to fetch files", 500);
    }

    return successResponse(result.data);
  } catch (error) {
    console.error("[FILES API] List error:", error);
    return errorResponse("Failed to retrieve files", 500);
  }
}