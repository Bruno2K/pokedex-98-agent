"use client";

import { useEffect, useRef } from "react";

type ContextMenuProps = {
  x: number;
  y: number;
  items: Array<{
    label: string;
    onClick: () => void;
    disabled?: boolean;
  }>;
  onClose: () => void;
};

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // Add listeners after a small delay to avoid immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Adjust position to keep menu within viewport
  const adjustedX = Math.min(x, window.innerWidth - 150);
  const adjustedY = Math.min(y, window.innerHeight - items.length * 22 - 10);

  return (
    <div
      ref={menuRef}
      className="win98-context-menu"
      style={{
        position: "fixed",
        left: adjustedX,
        top: adjustedY,
        zIndex: 10000,
      }}
      role="menu"
    >
      {items.map((item, index) => (
        <button
          key={index}
          type="button"
          className={`win98-context-menu-item ${item.disabled ? "win98-context-menu-item-disabled" : ""}`}
          onClick={() => {
            if (!item.disabled) {
              item.onClick();
              onClose();
            }
          }}
          disabled={item.disabled}
          role="menuitem"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
