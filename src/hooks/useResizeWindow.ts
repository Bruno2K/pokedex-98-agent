"use client";

import { useCallback, useEffect, useRef, useState, RefObject } from "react";

type Size = { width: number; height: number };

type ResizeDirection = "n" | "s" | "w" | "e" | "nw" | "ne" | "sw" | "se";

type UseResizeWindowOptions = {
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  elementRef?: RefObject<HTMLDivElement | null>;
};

export function useResizeWindow(options: UseResizeWindowOptions = {}) {
  const {
    initialWidth = 400,
    initialHeight = 300,
    minWidth = 200,
    minHeight = 150,
    maxWidth,
    maxHeight,
    elementRef: externalRef,
  } = options;

  const [size, setSize] = useState<Size | null>({ width: initialWidth, height: initialHeight });
  const [isResizing, setIsResizing] = useState(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startSizeRef = useRef({ width: 0, height: 0 });
  const directionRef = useRef<ResizeDirection>("se");
  const internalRef = useRef<HTMLDivElement | null>(null);
  const elementRef = externalRef || internalRef;

  const startResize = useCallback(
    (e: React.PointerEvent, direction: ResizeDirection) => {
      if (e.button !== 0) return;

      const el = elementRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const currentWidth = size?.width ?? rect.width;
      const currentHeight = size?.height ?? rect.height;

      startPosRef.current = { x: e.clientX, y: e.clientY };
      startSizeRef.current = { width: currentWidth, height: currentHeight };
      directionRef.current = direction;
      setIsResizing(true);

      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      e.preventDefault();
      e.stopPropagation();
    },
    [size, elementRef]
  );

  useEffect(() => {
    if (!isResizing) return;

    const onMove = (e: PointerEvent) => {
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;
      const direction = directionRef.current;

      let newWidth = startSizeRef.current.width;
      let newHeight = startSizeRef.current.height;

      // Handle horizontal resizing
      if (direction.includes("w")) {
        newWidth = startSizeRef.current.width - deltaX;
      } else if (direction.includes("e")) {
        newWidth = startSizeRef.current.width + deltaX;
      }

      // Handle vertical resizing
      if (direction.includes("n")) {
        newHeight = startSizeRef.current.height - deltaY;
      } else if (direction.includes("s")) {
        newHeight = startSizeRef.current.height + deltaY;
      }

      // Apply constraints
      if (newWidth < minWidth) newWidth = minWidth;
      if (maxWidth && newWidth > maxWidth) newWidth = maxWidth;
      if (newHeight < minHeight) newHeight = minHeight;
      if (maxHeight && newHeight > maxHeight) newHeight = maxHeight;

      setSize({ width: newWidth, height: newHeight });
    };

    const onUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [isResizing, minWidth, minHeight, maxWidth, maxHeight]);

  return { size, isResizing, elementRef, startResize };
}
