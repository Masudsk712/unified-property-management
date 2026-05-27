// ============================================================================
// File Validation Utilities — Size limits, type checks, and validation helpers
// ============================================================================

/** Maximum file size in bytes (10 MB) */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/** Maximum image size in bytes (5 MB) */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

/** Maximum document size in bytes (10 MB) */
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10 MB

/** Maximum number of files per upload batch */
export const MAX_FILES_PER_UPLOAD = 10;

/** Allowed image MIME types */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
] as const;

/** Allowed document MIME types */
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
] as const;

/** Allowed image file extensions */
export const ALLOWED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
  ".svg",
] as const;

/** Allowed document file extensions */
export const ALLOWED_DOCUMENT_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".txt",
  ".csv",
] as const;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface FileValidationRules {
  maxSize?: number;
  allowedTypes?: readonly string[];
  allowedExtensions?: readonly string[];
  maxFiles?: number;
  folder?: "properties" | "tenants" | "maintenance" | "general";
}

/**
 * Validate a single file against the provided rules.
 */
export function validateFile(
  file: File,
  rules: FileValidationRules = {}
): FileValidationResult {
  const {
    maxSize = MAX_FILE_SIZE,
    allowedTypes,
    allowedExtensions,
  } = rules;

  // Check file size
  if (file.size > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File "${file.name}" exceeds ${maxMB} MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
    };
  }

  // Check MIME type
  if (allowedTypes && allowedTypes.length > 0) {
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type "${file.type}" is not allowed for "${file.name}". Allowed: ${allowedTypes.join(", ")}`,
      };
    }
  }

  // Check extension
  if (allowedExtensions && allowedExtensions.length > 0) {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext as any)) {
      return {
        valid: false,
        error: `File extension "${ext}" is not allowed for "${file.name}". Allowed: ${allowedExtensions.join(", ")}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validate a batch of files against the provided rules.
 * Returns a list of validation results, one per file.
 */
export function validateFiles(
  files: File[],
  rules: FileValidationRules = {}
): FileValidationResult[] {
  const { maxFiles = MAX_FILES_PER_UPLOAD } = rules;

  if (files.length > maxFiles) {
    return [
      {
        valid: false,
        error: `Maximum ${maxFiles} files allowed per upload. You selected ${files.length}.`,
      },
    ];
  }

  return files.map((file) => validateFile(file, rules));
}

/**
 * Get the folder name for Cloudinary upload based on entity type.
 */
export function getUploadFolder(entityType: string): string {
  const folderMap: Record<string, string> = {
    property: "properties",
    tenant: "tenants",
    maintenance: "maintenance",
  };
  return folderMap[entityType] ?? "general";
}

/**
 * Get validation rules for a specific upload context.
 */
export function getValidationRules(
  context: "property-images" | "tenant-documents" | "maintenance-images"
): FileValidationRules {
  switch (context) {
    case "property-images":
      return {
        maxSize: MAX_IMAGE_SIZE,
        allowedTypes: ALLOWED_IMAGE_TYPES,
        allowedExtensions: ALLOWED_IMAGE_EXTENSIONS,
        maxFiles: MAX_FILES_PER_UPLOAD,
        folder: "properties",
      };
    case "tenant-documents":
      return {
        maxSize: MAX_DOCUMENT_SIZE,
        allowedTypes: [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES],
        maxFiles: MAX_FILES_PER_UPLOAD,
        folder: "tenants",
      };
    case "maintenance-images":
      return {
        maxSize: MAX_IMAGE_SIZE,
        allowedTypes: ALLOWED_IMAGE_TYPES,
        allowedExtensions: ALLOWED_IMAGE_EXTENSIONS,
        maxFiles: MAX_FILES_PER_UPLOAD,
        folder: "maintenance",
      };
  }
}

/**
 * Format file size to human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${size} ${units[i]}`;
}