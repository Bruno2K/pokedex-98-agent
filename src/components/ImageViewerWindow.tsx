"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useDragWindow } from "@/hooks/useDragWindow";
import { useResizeWindow } from "@/hooks/useResizeWindow";

type ImageViewerWindowProps = {
  imagePath: string;
  imageList: string[];
  initialIndex: number;
  onClose: () => void;
  zIndex?: number;
  isMinimized?: boolean;
  onFocus?: () => void;
  onMinimize?: () => void;
};

export function ImageViewerWindow({
  imagePath,
  imageList,
  initialIndex,
  onClose,
  zIndex = 100,
  isMinimized = false,
  onFocus,
  onMinimize,
}: ImageViewerWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { position, elementRef: dragElementRef, startDrag } = useDragWindow({
    initialPosition: null,
  });
  const { size, startResize } = useResizeWindow({
    initialWidth: 800,
    initialHeight: 600,
    minWidth: 400,
    minHeight: 300,
    elementRef: containerRef,
  });

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(100);
  const [imageError, setImageError] = useState(false);

  // Update index when initialIndex changes (new image opened)
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setImageError(false);
    setZoom(100);
  }, [initialIndex, imagePath]);

  // Sync refs
  const setRefs = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    (dragElementRef as any).current = node;
  };

  const handleTitlePointerDown = (e: React.PointerEvent) => {
    startDrag(e);
    onFocus?.();
  };

  const currentImage = imageList[currentIndex] || imagePath;

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setImageError(false);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < imageList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setImageError(false);
    }
  }, [currentIndex, imageList.length]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 25, 400));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 25, 25));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(100);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        handleResetZoom();
      }
    };

    if (!isMinimized) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [handlePrevious, handleNext, handleZoomIn, handleZoomOut, handleResetZoom, isMinimized]);

  const style = {
    zIndex,
    ...(position
      ? {
          left: position.x,
          top: position.y,
          transform: "none" as const,
        }
      : {}),
    ...(size
      ? {
          width: size.width,
          height: size.height,
        }
      : {}),
    ...(isMinimized ? { visibility: "hidden" as const, pointerEvents: "none" as const } : {}),
  };

  return (
    <div
      ref={setRefs}
      className="image-viewer-window win98-resizable"
      style={style}
      role="dialog"
      aria-label="Visualizador de Imagem"
      onClick={onFocus}
    >
      {/* Resize handles */}
      <div className="win98-resize-handle win98-resize-handle-n" onPointerDown={(e) => startResize(e, "n")} />
      <div className="win98-resize-handle win98-resize-handle-s" onPointerDown={(e) => startResize(e, "s")} />
      <div className="win98-resize-handle win98-resize-handle-w" onPointerDown={(e) => startResize(e, "w")} />
      <div className="win98-resize-handle win98-resize-handle-e" onPointerDown={(e) => startResize(e, "e")} />
      <div className="win98-resize-handle win98-resize-handle-nw" onPointerDown={(e) => startResize(e, "nw")} />
      <div className="win98-resize-handle win98-resize-handle-ne" onPointerDown={(e) => startResize(e, "ne")} />
      <div className="win98-resize-handle win98-resize-handle-sw" onPointerDown={(e) => startResize(e, "sw")} />
      <div className="win98-resize-handle win98-resize-handle-se" onPointerDown={(e) => startResize(e, "se")} />

      <div
        className="win98-title-bar image-viewer-title-bar win98-title-bar-draggable"
        onPointerDown={handleTitlePointerDown}
        role="presentation"
      >
        <span className="win98-title-bar-text">
          {currentImage.split("/").pop() || "Imagem"} ({currentIndex + 1} de {imageList.length})
        </span>
        <div className="win98-title-buttons">
          <button
            type="button"
            className="win98-title-btn"
            aria-label="Minimizar"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize?.();
            }}
          >
            −
          </button>
          <button type="button" className="win98-title-btn" aria-label="Maximizar">□</button>
          <button
            type="button"
            className="win98-title-btn win98-title-btn-close"
            aria-label="Fechar"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            ×
          </button>
        </div>
      </div>

      <div className="image-viewer-toolbar">
        <button
          type="button"
          className="image-viewer-btn"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          title="Anterior (←)"
        >
          ← Anterior
        </button>
        <button
          type="button"
          className="image-viewer-btn"
          onClick={handleNext}
          disabled={currentIndex === imageList.length - 1}
          title="Próximo (→)"
        >
          Próximo →
        </button>
        <div className="image-viewer-separator" />
        <button type="button" className="image-viewer-btn" onClick={handleZoomIn} title="Zoom In (+)">
          Zoom +
        </button>
        <button type="button" className="image-viewer-btn" onClick={handleZoomOut} title="Zoom Out (-)">
          Zoom −
        </button>
        <button type="button" className="image-viewer-btn" onClick={handleResetZoom} title="Reset Zoom (0)">
          Zoom 100%
        </button>
        <div className="image-viewer-separator" />
        <span className="image-viewer-zoom-info">{zoom}%</span>
      </div>

      <div className="image-viewer-body">
        <div className="image-viewer-content">
          {imageError ? (
            <div className="image-viewer-error">Erro ao carregar imagem</div>
          ) : (
            <div className="image-viewer-image-container" style={{ transform: `scale(${zoom / 100})` }}>
              <Image
                src={currentImage}
                alt={currentImage.split("/").pop() || "Imagem"}
                fill
                style={{ objectFit: "contain" }}
                onError={() => setImageError(true)}
                unoptimized
              />
            </div>
          )}
        </div>
      </div>

      <div className="image-viewer-status-bar">
        <div className="image-viewer-status-left">
          {currentImage.split("/").pop() || "Imagem"} • {zoom}%
        </div>
        <div className="image-viewer-status-right">
          {currentIndex + 1} de {imageList.length}
        </div>
      </div>
    </div>
  );
}
