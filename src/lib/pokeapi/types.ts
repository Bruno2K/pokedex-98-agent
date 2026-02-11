/** Tipos de Pokémon (nomes da PokeAPI, normalizados). */
export type PokemonType =
  | "normal"
  | "fire"
  | "water"
  | "electric"
  | "grass"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon";

/** Papel do Pokémon no combate. */
export type Role = "sweeper" | "tank" | "support" | "mixed";

/** Stats base (nomes da API). */
export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  "special-attack": number;
  "special-defense": number;
  speed: number;
}

/** Habilidade com nome e descrição opcional. */
export interface Ability {
  name: string;
  description?: string;
}

/** Movimento com nome e tipo. */
export interface Move {
  name: string;
  type: PokemonType;
}

/** Entrada resumida para listagem. */
export interface PokemonBasic {
  id: number;
  name: string;
  types: PokemonType[];
  sprite: string;
  role: Role;
}

/** Entrada completa para página de detalhes. */
export interface PokemonDetail extends PokemonBasic {
  stats: PokemonStats;
  abilities: Ability[];
  moves: Move[];
  weaknesses: PokemonType[];
  resistances: PokemonType[];
}
