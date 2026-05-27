"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  disabled?: boolean;
  label?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 10,
  disabled = false,
  label = "Property Images",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      if (disabled) return;

      const remaining = maxFiles - value.length;
      if (remaining <= 0) {
        setError(`Maximum ${maxFiles} images allowed`);
        return;
      }

      const selectedFiles = Array.from(files).slice(0, remaining);
      setUploading(true);
      setError(null);

      try {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append("files", file));

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        if (!result.success) {
          setError(result.error ?? "Upload failed");
          return;
        }

        const newUrls = result.data?.files ?? [];
        onChange([...value, ...newUrls]);
      } catch {
        setError("Failed to upload images. Please try again.");
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [value, maxFiles, disabled, onChange]
  );

  const removeImage = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
      setError(null);
    },
    [value, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  return (
    <div className="space-y-3">
      {label && (
        <label className="text-sm font-medium leading-none">{label}</label>
      )}

      {/* Preview Grid */}
      <AnimatePresence>
        {value.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
          >
            {value.map((url, index) => (
              <motion.div
                key={`${url}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "group relative aspect-square rounded-xl overflow-hidden border-2 border-border",
                  dragIndex === index && "opacity-50 scale-95"
                )}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragEnd={() => setDragIndex(null)}
              >
                <img
                  src={url}
                  alt={`Property image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  {index === 0 && (
                    <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="rounded-full bg-destructive/90 p-1.5 text-destructive-foreground hover:bg-destructive transition-colors"
                    disabled={disabled}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
                    {index + 1} / {value.length}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Area */}
      {value.length < maxFiles && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={disabled || uploading}
          />

          <motion.div
            animate={uploading ? { scale: [1, 1.05, 1] } : {}}
            className="flex flex-col items-center gap-3"
          >
            {uploading ? (
              <>
                <div className="rounded-full bg-primary/10 p-3">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
                <div>
                  <p className="font-semibold">Uploading images...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please wait while we process your files
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-full bg-muted p-3">
                  {isDragging ? (
                    <Plus className="h-6 w-6 text-primary" />
                  ) : (
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">
                    {isDragging
                      ? "Drop images here"
                      : "Drag & drop images or click to browse"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    JPEG, PNG, WebP, AVIF, GIF • Max 5MB each
                    <br />
                    {value.length}/{maxFiles} images selected
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  className="mt-2"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Select Files
                </Button>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-auto rounded-md p-0.5 hover:bg-destructive/20"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}