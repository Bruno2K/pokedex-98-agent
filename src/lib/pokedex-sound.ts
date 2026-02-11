export function playPokedexButtonSound() {
  const audio = new Audio("/effects/tmpq91k5v_6.mp3");
  audio.volume = 0.3; // Volume moderado
  audio.play().catch(() => {
    // Ignore errors if audio fails to play
  });
}
