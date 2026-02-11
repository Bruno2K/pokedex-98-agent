"use client";

import { useEffect } from "react";
import { playClickSound } from "@/lib/click-sound";

export function GlobalClickSound() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Não tocar som em:
      // - Inputs de texto (para não ser intrusivo ao digitar)
      // - Área de texto
      // - Elementos dentro de inputs
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.closest("input") ||
        target.closest("textarea")
      ) {
        return;
      }
      
      // Tocar som para todos os outros cliques
      playClickSound();
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return null;
}
