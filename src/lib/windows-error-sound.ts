export function playWindowsErrorSound() {
  if (typeof window === "undefined") return;

  const audio = new Audio("/effects/windows-98-error.mp3");
  audio.volume = 0.35;
  audio.play().catch(() => {
    // Ignore errors if audio fails to play
  });
}

