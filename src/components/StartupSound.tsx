"use client";

import { useEffect } from "react";

export function StartupSound() {
  useEffect(() => {
    const audio = new Audio("/effects/microsoft-windows-98-startup-soundmp3_160k.mp3");
    audio.volume = 0.5; // Reduzir volume para não ser muito alto
    audio.play().catch(() => {
      // Ignore errors if audio fails to play (e.g., autoplay restrictions)
    });
  }, []);

  return null;
}
