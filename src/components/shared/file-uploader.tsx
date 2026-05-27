"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useFileUpload, type UseFileUploadOptions } from "@/hooks/useFileUpload";
import { formatFileSize } from "@/lib/file-validations";
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Eye,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

export interface FileUploaderProps extends UseFileUploadOptions {
  /** Additional CSS classes for the drop zone */
  className?: string;
  /** Label shown in the drop zone */
  label?: string;
  /** Description shown in the drop zone */
  description?: string;
  /** Whether the uploader is disabled */
  disabled?: boolean;
  /** Whether to show the upload button */
  showUploadButton?: boolean;
  /** Custom upload button text */
  uploadButtonText?: string;
  /** Whether to show file previews inline */
  showPreviews?: boolean;
}

// ── Helper Components ──────────────────────────────────────────────────────

function FilePreview({
  file,
  onRemove,
  onDelete,
  onView,
}: {
  file: ReturnType<typeof useFileUpload>["files"][number];
  onRemove: () => void;
  onDelete?: () => void;
  onView?: () => void;
}) {
  const isImage = file.file.type.startsWith("image/");
  const isPending = file.status === "pending" || file.status === "uploading";
  const isSuccess = file.status === "success";
  const isError = file.status === "error";

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (file.previewUrl && file.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(file.previewUrl);
      }
    };
  }, [file.previewUrl]);

  const previewSrc = isSuccess && file.serverFile?.url
    ? file.serverFile.url
    : file.previewUrl;

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 rounded-lg border p-3 bg-background transition-all",
        isError && "border-destructive/50 bg-destructive/5",
        isSuccess && "border-green-500/30 bg-green-500/5",
        isPending && "border-blue-500/30 bg-blue-500/5"
      )}
    >
      {/* Thumbnail / Icon */}
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
        {isImage && (previewSrc) ? (
          <img
            src={previewSrc}
            alt={file.file.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {file.file.type.includes("pdf") ? (
              <FileText className="h-8 w-8 text-red-500" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
        )}

        {/* Status overlay */}
        {file.status === "uploading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
        {isSuccess && (
          <div className="absolute right-1 top-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
        )}
        {isError && (
          <div className="absolute right-1 top-1">
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" title={file.file.name}>
          {file.file.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.file.size)}
        </p>

        {/* Progress bar */}
        {isPending && file.progress > 0 && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${file.progress}%` }}
            />
          </div>
        )}

        {/* Error message */}
        {isError && file.error && (
          <p className="mt-1 text-xs text-destructive">{file.error}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-shrink-0 items-center gap-1">
        {isSuccess && onView && (
          <button
            type="button"
            onClick={onView}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="View full size"
          >
            <Eye className="h-4 w-4" />
          </button>
        )}
        {isSuccess && onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            title="Delete file"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onRemove}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function FilePreviewGrid({
  files,
  onRemove,
  onDelete,
}: {
  files: ReturnType<typeof useFileUpload>["files"];
  onRemove: (id: string) => void;
  onDelete?: (id: string, serverFileId: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {files.map((file) => (
        <FilePreview
          key={file.id}
          file={file}
          onRemove={() => onRemove(file.id)}
          onDelete={
            onDelete && file.serverFile?.id
              ? () => onDelete(file.id, file.serverFile!.id)
              : undefined
          }
        />
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function FileUploader({
  className,
  label = "Upload Files",
  description = "Drag & drop files here, or click to browse",
  disabled = false,
  showUploadButton = true,
  uploadButtonText = "Upload Files",
  showPreviews = true,
  ...options
}: FileUploaderProps) {
  const {
    files,
    uploadedFiles,
    pendingFiles,
    errorFiles,
    isDragging,
    isUploading,
    fileInputRef,
    removeFile,
    clearFiles,
    openFileDialog,
    handleFileChange,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    uploadFiles,
    deleteServerFile,
  } = useFileUpload(options);

  const hasFiles = files.length > 0;
  const hasPending = pendingFiles.length > 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={
          options.context === "tenant-documents"
            ? ".jpg,.jpeg,.png,.webp,.avif,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            : ".jpg,.jpeg,.png,.webp,.avif,.gif,.svg"
        }
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Drop Zone */}
      <div
        onClick={disabled ? undefined : openFileDialog}
        onDragEnter={disabled ? undefined : handleDragEnter}
        onDragLeave={disabled ? undefined : handleDragLeave}
        onDragOver={disabled ? undefined : handleDragOver}
        onDrop={disabled ? undefined : handleDrop}
        className={cn(
          "relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/10 scale-[1.02]"
            : "border-muted-foreground/25 bg-muted/30 hover:border-primary/50 hover:bg-muted/50",
          disabled && "cursor-not-allowed opacity-60",
          className
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              "rounded-full p-4 transition-colors",
              isDragging ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            )}
          >
            <Upload className="h-8 w-8" />
          </div>
          <div>
            <p className="text-base font-semibold">{label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isUploading}
            onClick={(e) => {
              e.stopPropagation();
              openFileDialog();
            }}
          >
            Browse Files
          </Button>
        </div>
      </div>

      {/* File Previews */}
      {showPreviews && hasFiles && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-medium">
                {files.length} file{files.length !== 1 ? "s" : ""} selected
              </span>
              {uploadedFiles.length > 0 && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {uploadedFiles.length} uploaded
                </span>
              )}
              {errorFiles.length > 0 && (
                <span className="flex items-center gap-1 text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errorFiles.length} failed
                </span>
              )}
            </div>
            {hasFiles && (
              <button
                type="button"
                onClick={clearFiles}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            )}
          </div>

          <FilePreviewGrid
            files={files}
            onRemove={removeFile}
            onDelete={deleteServerFile}
          />
        </div>
      )}

      {/* Upload Button & Action Bar */}
      {showUploadButton && hasPending && (
        <div className="flex items-center justify-end gap-3">
          {uploadedFiles.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFiles}
              disabled={isUploading}
            >
              Clear Completed
            </Button>
          )}
          <Button
            type="button"
            onClick={uploadFiles}
            disabled={isUploading || disabled}
            loading={isUploading}
          >
            {isUploading ? "Uploading..." : uploadButtonText}
          </Button>
        </div>
      )}
    </div>
  );
}

export default FileUploader;