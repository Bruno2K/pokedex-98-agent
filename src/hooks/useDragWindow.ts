"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Position = { x: number; y: number };

type UseDragWindowOptions = {
  /** Initial position when not dragging (e.g. for centered window, pass null) */
  initialPosition: Position | null;
  /** When false, use getBoundingClientRect() on first drag to get current position */
  useInitialPosition?: boolean;
};

export function useDragWindow(options: UseDragWindowOptions) {
  const { initialPosition, useInitialPosition = false } = options;
  const [position, setPosition] = useState<Position | null>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement | null>(null);

  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest("button")) return;

      const el = elementRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const currentX = position?.x ?? rect.left;
      const currentY = position?.y ?? rect.top;

      offsetRef.current = {
        x: e.clientX - currentX,
        y: e.clientY - currentY,
      };
      setPosition({ x: currentX, y: currentY });
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      e.preventDefault();
    },
    [position]
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: PointerEvent) => {
      setPosition({
        x: e.clientX - offsetRef.current.x,
        y: e.clientY - offsetRef.current.y,
      });
    };

    const onUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [isDragging]);

  return { position, isDragging, elementRef, startDrag };
}
