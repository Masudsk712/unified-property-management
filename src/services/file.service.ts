// ============================================================================
// File Service — Cloudinary upload, delete, and Prisma persistence logic
// ============================================================================

import prisma from "@/lib/prisma";
import { cloudinary, extractPublicId, deleteCloudinaryFile } from "@/lib/cloudinary";
import { ApiResponse } from "@/types";
import { UploadApiResponse } from "cloudinary";

// ── Types ──────────────────────────────────────────────────────────────────

export interface UploadFileInput {
  file: Buffer;
  filename: string;
  originalName: string;
  mimeType: string;
  folder?: string;
  entityId?: string;
  entityType?: string;
  uploadedBy: string;
  resourceType?: "image" | "raw" | "video" | "auto";
}

export interface FileRecord {
  id: string;
  url: string;
  publicId: string | null;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  format: string | null;
  resourceType: string;
  folder: string;
  entityId: string | null;
  entityType: string | null;
  uploadedBy: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function handleError<T>(fn: () => Promise<T>): Promise<ApiResponse<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[FILE SERVICE]", message, error);
    return { success: false, error: message };
  }
}

function bufferToStream(buffer: Buffer): NodeJS.ReadableStream {
  const { Readable } = require("stream");
  return Readable.from(buffer);
}

/**
 * Upload a file buffer to Cloudinary and return the upload result.
 */
function uploadToCloudinary(input: UploadFileInput): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: input.folder ?? "general",
        resource_type: (input.resourceType as "image" | "raw" | "video" | "auto") ?? "image",
        public_id: `${Date.now()}-${input.filename.replace(/\.[^.]+$/, "")}`,
        transformation: input.resourceType === "image" || !input.resourceType
          ? [
              { quality: "auto:good" },
              { fetch_format: "auto" },
              { width: 1920, height: 1920, crop: "limit" },
            ]
          : undefined,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary upload returned no result"));
        resolve(result);
      }
    );

    const stream = bufferToStream(input.file);
    stream.pipe(uploadStream);
  });
}

// ── Service Methods ────────────────────────────────────────────────────────

export const fileService = {
  /**
   * Upload a single file to Cloudinary and persist metadata to MongoDB.
   */
  async upload(input: UploadFileInput): Promise<ApiResponse<FileRecord>> {
    return handleError(async () => {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(input);

      // Persist file metadata in MongoDB
      const file = await prisma.file.create({
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          filename: input.filename,
          originalName: input.originalName,
          mimeType: input.mimeType,
          size: result.bytes,
          width: result.width ?? null,
          height: result.height ?? null,
          format: result.format ?? null,
          resourceType: result.resource_type,
          folder: input.folder ?? "general",
          entityId: input.entityId ?? null,
          entityType: input.entityType ?? null,
          uploadedBy: input.uploadedBy,
        },
      });

      return file as unknown as FileRecord;
    });
  },

  /**
   * Upload multiple files. Returns array of created file records.
   */
  async uploadMultiple(
    inputs: UploadFileInput[]
  ): Promise<ApiResponse<FileRecord[]>> {
    return handleError(async () => {
      const results: FileRecord[] = [];

      for (const input of inputs) {
        const result = await fileService.upload(input);
        if (result.success && result.data) {
          results.push(result.data);
        } else {
          console.warn("[FILE SERVICE] Failed to upload file:", input.originalName, result.error);
        }
      }

      return results;
    });
  },

  /**
   * Delete a file by its database ID. Removes from Cloudinary and soft-deletes in DB.
   */
  async delete(fileId: string, userId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return handleError(async () => {
      const file = await prisma.file.findUnique({ where: { id: fileId } });

      if (!file) {
        throw new Error("File not found");
      }

      // Delete from Cloudinary
      if (file.url) {
        const cloudDeleted = await deleteCloudinaryFile(file.url);
        if (!cloudDeleted) {
          console.warn("[FILE SERVICE] Cloudinary deletion may have failed for:", file.url);
        }
      }

      // Soft-delete in database
      await prisma.file.update({
        where: { id: fileId },
        data: { isDeleted: true, updatedAt: new Date() },
      });

      return { deleted: true };
    });
  },

  /**
   * Get all non-deleted files for a specific entity (property, tenant, maintenance).
   */
  async getByEntity(
    entityId: string,
    entityType: string
  ): Promise<ApiResponse<FileRecord[]>> {
    return handleError(async () => {
      const files = await prisma.file.findMany({
        where: {
          entityId,
          entityType,
          isDeleted: false,
        },
        orderBy: { createdAt: "desc" },
      });

      return files as unknown as FileRecord[];
    });
  },

  /**
   * Get all non-deleted files by folder type.
   */
  async getByFolder(folder: string): Promise<ApiResponse<FileRecord[]>> {
    return handleError(async () => {
      const files = await prisma.file.findMany({
        where: {
          folder,
          isDeleted: false,
        },
        orderBy: { createdAt: "desc" },
      });

      return files as unknown as FileRecord[];
    });
  },

  /**
   * Get all non-deleted files uploaded by a specific user.
   */
  async getByUser(userId: string): Promise<ApiResponse<FileRecord[]>> {
    return handleError(async () => {
      const files = await prisma.file.findMany({
        where: {
          uploadedBy: userId,
          isDeleted: false,
        },
        orderBy: { createdAt: "desc" },
      });

      return files as unknown as FileRecord[];
    });
  },
};