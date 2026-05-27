// ============================================================================
// Cloudinary Configuration — Image & File Upload Service
// ============================================================================

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  api_key: process.env.CLOUDINARY_API_KEY ?? "",
  api_secret: process.env.CLOUDINARY_API_SECRET ?? "",
});

export { cloudinary };

/**
 * Extract the public_id from a Cloudinary URL.
 * Example URL: https://res.cloudinary.com/cloud-name/image/upload/v12345/folder/public_id.jpg
 */
export function extractPublicId(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Path format: /image/upload/v12345/folder/public_id.ext
    const pathParts = parsed.pathname.split("/");
    // Remove the leading empty string, "image", "upload", "vXXXXX"
    const uploadIndex = pathParts.indexOf("upload");
    if (uploadIndex === -1) return null;
    const relevantParts = pathParts.slice(uploadIndex + 2); // skip "upload/v12345"
    const fullPath = relevantParts.join("/");
    // Remove file extension
    const lastDot = fullPath.lastIndexOf(".");
    return lastDot > 0 ? fullPath.substring(0, lastDot) : fullPath;
  } catch {
    return null;
  }
}

/**
 * Delete a file from Cloudinary by its URL.
 * Returns true if deletion was successful, false otherwise.
 */
export async function deleteCloudinaryFile(url: string): Promise<boolean> {
  const publicId = extractPublicId(url);
  if (!publicId) return false;

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("[CLOUDINARY] Delete failed:", error);
    return false;
  }
}

/**
 * Delete multiple Cloudinary files by their URLs.
 * Returns count of successfully deleted files.
 */
export async function deleteCloudinaryFiles(urls: string[]): Promise<number> {
  const results = await Promise.all(urls.map((url) => deleteCloudinaryFile(url)));
  return results.filter(Boolean).length;
}