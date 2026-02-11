"use client";

import type { ReactNode } from "react";
import { useDragWindow } from "@/hooks/useDragWindow";

type PokedexShellProps = {
  children: ReactNode;
  zIndex?: number;
  isMinimized?: boolean;
  onFocus?: () => void;
  onClose?: () => void;
  onMinimize?: () => void;
};

export function PokedexShell({ children, zIndex = 10, isMinimized = false, onFocus, onClose, onMinimize }: PokedexShellProps) {
  const { position, elementRef, startDrag } = useDragWindow({
    initialPosition: null,
  });

  const handleTitlePointerDown = (e: React.PointerEvent) => {
    startDrag(e);
    onFocus?.();
  };

  return (
    <div
      ref={elementRef}
      className="pokedex-shell-wrapper"
      style={{
        ...(position
          ? {
              position: "fixed" as const,
              left: position.x,
              top: position.y,
              zIndex,
            }
          : { position: "relative" as const, zIndex }),
        ...(isMinimized ? { visibility: "hidden" as const, pointerEvents: "none" as const } : {}),
      }}
      onClick={onFocus}
      role="presentation"
    >
      <div className="pokedex-shell">
        <div
          className="win98-title-bar win98-title-bar-draggable"
          onPointerDown={handleTitlePointerDown}
          role="presentation"
        >
          <span className="win98-title-bar-text">Pokédex - 151 Pokémon</span>
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
                onClose?.();
              }}
            >
              ×
            </button>
          </div>
        </div>
        <div className="pokedex-screen">{children}</div>
      </div>
    </div>
  );
}
