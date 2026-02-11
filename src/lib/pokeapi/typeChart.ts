import type { PokemonType } from "./types";

/** Multiplicador de dano: atacante -> defensor -> valor (0, 0.5, 1, 2). Gen I. */
const EFFECTIVENESS: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  normal: { fighting: 2, ghost: 0 },
  fire: { fire: 0.5, water: 2, grass: 0.5, ice: 0.5, ground: 2, bug: 0.5, rock: 2, dragon: 0.5 },
  water: { fire: 0.5, water: 0.5, grass: 2, electric: 2, ice: 0.5, dragon: 0.5 },
  electric: { water: 0.5, electric: 0.5, grass: 0.5, ground: 0, flying: 0.5, dragon: 0.5 },
  grass: { fire: 2, water: 0.5, grass: 0.5, electric: 0.5, ice: 2, poison: 2, ground: 0.5, flying: 2, bug: 2 },
  ice: { fire: 2, water: 0.5, grass: 0.5, ice: 0.5, fighting: 2, ground: 2, flying: 2 },
  fighting: { flying: 2, psychic: 2, bug: 0.5, rock: 0.5, ghost: 0, ice: 0.5 },
  poison: { grass: 0.5, fighting: 0.5, poison: 0.5, ground: 2, bug: 0.5, rock: 0.5, ghost: 0.5 },
  ground: { water: 2, grass: 2, electric: 0, ice: 2, poison: 0.5, rock: 0.5, flying: 0 },
  flying: { electric: 2, grass: 0.5, ice: 2, fighting: 0.5, ground: 0, bug: 0.5, rock: 2 },
  psychic: { fighting: 0.5, poison: 2, psychic: 0.5, bug: 2, ghost: 2 },
  bug: { fire: 2, grass: 0.5, fighting: 0.5, poison: 0.5, flying: 2, psychic: 2, ghost: 0.5 },
  rock: { normal: 0.5, fire: 0.5, water: 2, grass: 2, fighting: 2, poison: 0.5, ground: 2, flying: 0.5 },
  ghost: { normal: 0, psychic: 0, ghost: 2 },
  dragon: { fire: 0.5, water: 0.5, electric: 0.5, grass: 0.5, ice: 2, dragon: 2 },
};

const ALL_TYPES: PokemonType[] = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting",
  "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon"
];

function multiplier(attacker: PokemonType, defender: PokemonType): number {
  const row = EFFECTIVENESS[attacker];
  if (!row) return 1;
  const v = row[defender as keyof typeof row];
  return v ?? 1;
}

/** Dado os tipos do defensor, retorna os tipos de ataque que são superefetivos (2x ou 4x). */
export function getWeaknesses(types: PokemonType[]): PokemonType[] {
  return ALL_TYPES.filter((attacker) => {
    const product = types.reduce((acc, defender) => acc * multiplier(attacker, defender), 1);
    return product > 1;
  });
}

/** Dado os tipos do defensor, retorna os tipos de ataque que são resistidos (0.5x, 0.25x ou 0). */
export function getResistances(types: PokemonType[]): PokemonType[] {
  return ALL_TYPES.filter((attacker) => {
    const product = types.reduce((acc, defender) => acc * multiplier(attacker, defender), 1);
    return product < 1 && product > 0;
  });
}

/** Tipos que causam imunidade (0x). */
export function getImmunities(types: PokemonType[]): PokemonType[] {
  return ALL_TYPES.filter((attacker) => {
    const product = types.reduce((acc, defender) => acc * multiplier(attacker, defender), 1);
    return product === 0;
  });
}
