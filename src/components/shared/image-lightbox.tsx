"use client";

import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

export interface LightboxImage {
  src: string;
  alt?: string;
  caption?: string;
}

interface LightboxContextType {
  open: (images: LightboxImage[], initialIndex?: number) => void;
  close: () => void;
  isOpen: boolean;
}

const LightboxContext = createContext<LightboxContextType>({
  open: () => {},
  close: () => {},
  isOpen: false,
});

export function useLightbox() {
  return useContext(LightboxContext);
}

// ── Lightbox Provider ──────────────────────────────────────────────────────

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<LightboxImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const open = useCallback((imgs: LightboxImage[], initialIndex = 0) => {
    setImages(imgs);
    setCurrentIndex(Math.max(0, Math.min(initialIndex, imgs.length - 1)));
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "";
    // Small delay to clear images after animation
    setTimeout(() => {
      setImages([]);
      setCurrentIndex(0);
    }, 200);
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [images.length]);

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.5, 5));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.5, 0.5));
  }, []);

  const rotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          close();
          break;
        case "ArrowRight":
          if (images.length > 1) goNext();
          break;
        case "ArrowLeft":
          if (images.length > 1) goPrev();
          break;
        case "+":
        case "=":
          zoomIn();
          break;
        case "-":
          zoomOut();
          break;
        case "0":
          setZoom(1);
          setPosition({ x: 0, y: 0 });
          break;
        case "r":
          rotate();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, images.length, close, goNext, goPrev, zoomIn, zoomOut, rotate]);

  // Mouse drag for panning when zoomed
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom > 1) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      }
    },
    [zoom, position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && zoom > 1) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, zoom, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const currentImage = images[currentIndex];

  const handleDownload = useCallback(async () => {
    if (!currentImage) return;
    try {
      const response = await fetch(currentImage.src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentImage.alt || "image";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(currentImage.src, "_blank");
    }
  }, [currentImage]);

  return (
    <LightboxContext.Provider value={{ open, close, isOpen }}>
      {children}

      {/* Lightbox Overlay */}
      {isOpen && currentImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={close}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Close button */}
          <button
            onClick={close}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white/80 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute left-4 top-4 z-10 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white/80 backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Toolbar */}
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/10 px-2 py-1.5 backdrop-blur-sm">
            <button
              onClick={(e) => {
                e.stopPropagation();
                zoomOut();
              }}
              className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setZoom(1);
                setPosition({ x: 0, y: 0 });
              }}
              className="rounded-full px-2 py-1 text-xs text-white/70 transition-colors hover:bg-white/20 hover:text-white"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                zoomIn();
              }}
              className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <div className="mx-1 h-5 w-px bg-white/20" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                rotate();
              }}
              className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
              aria-label="Rotate"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            <div className="mx-1 h-5 w-px bg-white/20" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
              aria-label="Download"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white/80 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white/80 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className={cn(
              "flex max-h-[90vh] max-w-[90vw] select-none items-center justify-center",
              zoom > 1 ? "cursor-grab" : "",
              isDragging && "cursor-grabbing"
            )}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
          >
            <img
              src={currentImage.src}
              alt={currentImage.alt || "Preview"}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              }}
              draggable={false}
            />
          </div>

          {/* Caption */}
          {currentImage.caption && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              {currentImage.caption}
            </div>
          )}
        </div>
      )}
    </LightboxContext.Provider>
  );
}

export default LightboxProvider;