export function playClickSound() {
  const audio = new Audio("/effects/clicksoundeffect.mp3");
  audio.volume = 0.2; // Volume baixo para não ser intrusivo
  audio.play().catch(() => {
    // Ignore errors if audio fails to play
  });
}
