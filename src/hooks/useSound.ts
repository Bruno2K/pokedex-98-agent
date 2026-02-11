"use client";

import { useCallback, useRef } from "react";

type UseSoundOptions = {
  volume?: number;
};

export function useSound(src: string, options: UseSoundOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    // Criar novo elemento de áudio a cada play para permitir múltiplas reproduções
    const audio = new Audio(src);
    audio.volume = options.volume ?? 0.5;
    audio.play().catch((error) => {
      console.warn("Erro ao reproduzir som:", error);
    });
    audioRef.current = audio;
  }, [src, options.volume]);

  return { play };
}
