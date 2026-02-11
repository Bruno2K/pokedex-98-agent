import type { PokemonStats, Role } from "./types";

/** Atribui role com base nos stats: sweeper, tank, support ou mixed. */
export function getRoleFromStats(stats: PokemonStats): Role {
  const atk = stats.attack + stats["special-attack"];
  const def = stats.defense + stats["special-defense"];
  const hp = stats.hp;
  const speed = stats.speed;
  const total = hp + stats.attack + stats.defense + stats["special-attack"] + stats["special-defense"] + speed;

  const off = atk / 2;
  const bulk = (hp + def) / 2;

  if (speed >= 90 && off >= 150 && bulk < 180) return "sweeper";
  if (bulk >= 200 && hp >= 80) return "tank";
  if (off <= 120 && def >= 80 && speed < 85) return "support";
  return "mixed";
}
