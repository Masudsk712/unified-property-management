// ============================================================================
// Upload API — Image Upload Endpoint
// Stores base64-encoded images as data URLs (suitable for MongoDB)
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { unauthorizedResponse, errorResponse, successResponse } from "@/lib/auth-helpers";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  try {
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      // Handle multipart upload
      const formData = await req.formData();
      const files: string[] = [];
      const uploadDir = join(process.cwd(), "public", "uploads");

      // Ensure upload directory exists
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch {
        // Directory exists
      }

      const fileEntries = formData.getAll("files") as File[];

      for (const file of fileEntries) {
        if (!file || typeof file === "string") continue;

        if (!ALLOWED_TYPES.includes(file.type)) {
          return errorResponse(`File type ${file.type} is not allowed. Allowed: ${ALLOWED_TYPES.join(", ")}`, 400);
        }

        if (file.size > MAX_FILE_SIZE) {
          return errorResponse(`File size exceeds 5MB limit`, 400);
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = file.type.split("/")[1] || "jpg";
        const filename = `${uuidv4()}.${ext}`;
        const filepath = join(uploadDir, filename);

        await writeFile(filepath, buffer);
        files.push(`/uploads/${filename}`);
      }

      return successResponse({ files }, 201);
    }

    // Handle base64 JSON upload
    const body = await req.json();
    const { images } = body as { images?: string[] };

    if (!images || !Array.isArray(images) || images.length === 0) {
      return errorResponse("No images provided", 400);
    }

    const savedPaths: string[] = [];
    const uploadDir = join(process.cwd(), "public", "uploads");

    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // Directory exists
    }

    for (const base64 of images) {
      if (!base64 || typeof base64 !== "string") continue;

      // Handle data URLs (e.g., data:image/png;base64,...)
      let imageBuffer: Buffer;
      let ext = "jpg";

      if (base64.startsWith("data:")) {
        const matches = base64.match(/^data:image\/([\w]+);base64,(.+)$/);
        if (!matches) continue;
        ext = matches[1];
        imageBuffer = Buffer.from(matches[2], "base64");
      } else {
        imageBuffer = Buffer.from(base64, "base64");
      }

      // Check file size
      if (imageBuffer.length > MAX_FILE_SIZE) {
        return errorResponse("One or more images exceed 5MB limit", 400);
      }

      const filename = `${uuidv4()}.${ext}`;
      const filepath = join(uploadDir, filename);
      await writeFile(filepath, imageBuffer);
      savedPaths.push(`/uploads/${filename}`);
    }

    return successResponse({ files: savedPaths }, 201);
  } catch (error) {
    console.error("[UPLOAD] Error:", error);
    return errorResponse("Failed to upload images", 500);
  }
}