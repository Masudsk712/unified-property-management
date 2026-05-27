// ============================================================================
// useFileUpload Hook — File upload state management, drag-and-drop, preview
// ============================================================================

"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  validateFiles,
  getValidationRules,
  type FileValidationRules,
} from "@/lib/file-validations";

export interface UploadFile {
  /** Client-side unique ID for tracking UI state */
  id: string;
  /** The native File object */
  file: File;
  /** Object URL for image preview */
  previewUrl: string;
  /** Upload progress percentage (0-100) */
  progress: number;
  /** Upload status */
  status: "pending" | "uploading" | "success" | "error";
  /** Server response after successful upload */
  serverFile?: {
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
  };
  /** Error message if upload failed */
  error?: string;
}

export interface UseFileUploadOptions {
  /** Maximum number of files allowed */
  maxFiles?: number;
  /** Entity type context */
  context?: "property-images" | "tenant-documents" | "maintenance-images";
  /** Associated entity ID */
  entityId?: string;
  /** Associated entity type */
  entityType?: string;
  /** Custom validation rules (override context-based rules) */
  validationRules?: FileValidationRules;
  /** Callback when files are successfully uploaded */
  onUploadComplete?: (files: UploadFile[]) => void;
  /** Callback when a file is removed */
  onFileRemove?: (fileId: string) => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const {
    maxFiles = 10,
    context = "property-images",
    entityId,
    entityType,
    validationRules,
    onUploadComplete,
    onFileRemove,
  } = options;

  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  /** Generate unique ID for file tracking */
  const generateId = useCallback(() => {
    return `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  /** Create preview URL for a file (images only) */
  const createPreviewUrl = useCallback((file: File): string => {
    if (file.type.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    return "";
  }, []);

  /** Revoke all preview URLs to prevent memory leaks */
  const revokePreviewUrls = useCallback((filesToRevoke: UploadFile[]) => {
    filesToRevoke.forEach((f) => {
      if (f.previewUrl && f.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(f.previewUrl);
      }
    });
  }, []);

  /** Get validation rules based on context */
  const getRules = useCallback((): FileValidationRules => {
    if (validationRules) return validationRules;
    return getValidationRules(context);
  }, [context, validationRules]);

  /** Add files to the upload queue */
  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const rules = getRules();
      const totalAfterAdd = files.length + fileArray.length;

      // Check max files
      if (totalAfterAdd > (rules.maxFiles ?? maxFiles)) {
        toast.error(`Maximum ${rules.maxFiles ?? maxFiles} files allowed`);
        return;
      }

      // Validate
      const results = validateFiles(fileArray, rules);
      const errors = results.filter((r) => !r.valid);

      if (errors.length > 0) {
        errors.forEach((e) => toast.error(e.error ?? "Invalid file"));
        return;
      }

      // Create upload entries
      const newUploadFiles: UploadFile[] = fileArray.map((file) => ({
        id: generateId(),
        file,
        previewUrl: createPreviewUrl(file),
        progress: 0,
        status: "pending" as const,
      }));

      setFiles((prev) => [...prev, ...newUploadFiles]);
    },
    [files.length, maxFiles, generateId, createPreviewUrl, getRules]
  );

  /** Remove a single file from the queue */
  const removeFile = useCallback(
    (fileId: string) => {
      setFiles((prev) => {
        const fileToRemove = prev.find((f) => f.id === fileId);
        if (fileToRemove?.previewUrl && fileToRemove.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(fileToRemove.previewUrl);
        }
        return prev.filter((f) => f.id !== fileId);
      });
      onFileRemove?.(fileId);
    },
    [onFileRemove]
  );

  /** Clear all files */
  const clearFiles = useCallback(() => {
    revokePreviewUrls(files);
    setFiles([]);
  }, [files, revokePreviewUrls]);

  /** Open file dialog */
  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /** Handle file input change */
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
        // Reset input so same file can be selected again
        e.target.value = "";
      }
    },
    [addFiles]
  );

  /** Drag-and-drop handlers */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  /** Upload all pending files to the server */
  const uploadFiles = useCallback(async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) {
      toast.error("No files to upload");
      return;
    }

    setIsUploading(true);

    // Mark all as uploading
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "pending" ? { ...f, status: "uploading" as const, progress: 0 } : f
      )
    );

    try {
      const formData = new FormData();

      // Append files
      pendingFiles.forEach((f) => {
        formData.append("files", f.file);
      });

      // Append metadata
      if (entityId) formData.append("entityId", entityId);
      if (entityType) formData.append("entityType", entityType);

      const folder = entityType ?? context.includes("property")
        ? "properties"
        : context.includes("tenant")
        ? "tenants"
        : context.includes("maintenance")
        ? "maintenance"
        : "general";

      formData.append("folder", folder);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) => {
            if (f.status === "uploading") {
              const newProgress = Math.min(f.progress + Math.random() * 20, 90);
              return { ...f, progress: newProgress };
            }
            return f;
          })
        );
      }, 300);

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(errorData.error ?? "Upload failed");
      }

      const result = await response.json();

      // Mark uploaded files as success with server data
      if (result.success && result.data?.files) {
        setFiles((prev) =>
          prev.map((f) => {
            if (f.status === "uploading") {
              // Match by original filename (closest we can do since server returns in order)
              const serverFile = result.data.files.find(
                (sf: any) => sf.originalName === f.file.name
              );
              return {
                ...f,
                status: "success" as const,
                progress: 100,
                serverFile: serverFile ?? undefined,
              };
            }
            return f;
          })
        );

        onUploadComplete?.(
          result.data.files.map((sf: any) => ({
            id: generateId(),
            file: new File([], sf.originalName),
            previewUrl: sf.mimeType?.startsWith("image/") ? sf.url : "",
            progress: 100,
            status: "success" as const,
            serverFile: sf,
          }))
        );

        toast.success(`${result.data.count} file(s) uploaded successfully`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";

      setFiles((prev) =>
        prev.map((f) =>
          f.status === "uploading"
            ? { ...f, status: "error" as const, error: message }
            : f
        )
      );

      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }, [files, entityId, entityType, context, generateId, onUploadComplete]);

  /** Delete a successfully uploaded file from server */
  const deleteServerFile = useCallback(
    async (fileId: string, serverFileId: string) => {
      try {
        const response = await fetch(`/api/files/${serverFileId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete file");
        }

        removeFile(fileId);
        toast.success("File deleted");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Delete failed";
        toast.error(message);
      }
    },
    [removeFile]
  );

  /** Get list of successfully uploaded files */
  const uploadedFiles = files.filter((f) => f.status === "success");
  const pendingFiles = files.filter((f) => f.status === "pending" || f.status === "uploading");
  const errorFiles = files.filter((f) => f.status === "error");

  return {
    /** All files in queue */
    files,
    /** Successfully uploaded files */
    uploadedFiles,
    /** Files pending upload */
    pendingFiles,
    /** Files with errors */
    errorFiles,
    /** Whether a file drag is over the drop zone */
    isDragging,
    /** Whether an upload is in progress */
    isUploading,
    /** Ref for hidden file input */
    fileInputRef,
    /** Add files to queue */
    addFiles,
    /** Remove a file from queue */
    removeFile,
    /** Clear all files */
    clearFiles,
    /** Open native file dialog */
    openFileDialog,
    /** Handle file input change event */
    handleFileChange,
    /** Drag-and-drop: drag enter */
    handleDragEnter,
    /** Drag-and-drop: drag leave */
    handleDragLeave,
    /** Drag-and-drop: drag over */
    handleDragOver,
    /** Drag-and-drop: drop */
    handleDrop,
    /** Upload all pending files */
    uploadFiles,
    /** Delete a server-side file */
    deleteServerFile,
  };
}