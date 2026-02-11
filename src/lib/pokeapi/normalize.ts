import type { PokeApiPokemon } from "./client";
import { fetchMoveType } from "./client";
import { pickMainMoves } from "./moves";
import { getRoleFromStats } from "./roles";
import { getWeaknesses, getResistances } from "./typeChart";
import type {
  Ability,
  Move,
  PokemonBasic,
  PokemonDetail,
  PokemonStats,
  PokemonType,
} from "./types";

const VALID_TYPES: PokemonType[] = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting",
  "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon"
];

const typeSet = new Set<string>(VALID_TYPES);

function toPokemonType(name: string): PokemonType {
  const lower = name.toLowerCase();
  return typeSet.has(lower) ? (lower as PokemonType) : "normal";
}

function parseTypes(api: PokeApiPokemon): PokemonType[] {
  return api.types.map((t) => toPokemonType(t.type.name)).filter(Boolean);
}

function getSprite(api: PokeApiPokemon): string {
  const v = api.sprites?.versions?.["generation-v"]?.["black-white"];
  const animated = v?.animated?.front_default;
  if (animated) return animated;
  const fallback = api.sprites?.front_default ?? "";
  return fallback;
}

function parseStats(api: PokeApiPokemon): PokemonStats {
  const map: Record<string, number> = {};
  for (const s of api.stats) {
    const name = s.stat.name;
    if (name === "special-attack" || name === "special-defense") map[name] = s.base_stat;
    else map[name] = s.base_stat;
  }
  return {
    hp: map.hp ?? 0,
    attack: map.attack ?? 0,
    defense: map.defense ?? 0,
    "special-attack": map["special-attack"] ?? 0,
    "special-defense": map["special-defense"] ?? 0,
    speed: map.speed ?? 0,
  };
}

function parseAbilities(api: PokeApiPokemon): Ability[] {
  return api.abilities
    .filter((a) => !a.is_hidden)
    .map((a) => ({ name: a.ability.name }));
}

/** Converte resposta da API em PokemonBasic (para listagem). */
export function toPokemonBasic(api: PokeApiPokemon): PokemonBasic {
  const types = parseTypes(api);
  const stats = parseStats(api);
  const role = getRoleFromStats(stats);
  return {
    id: api.id,
    name: api.name,
    types,
    sprite: getSprite(api),
    role,
  };
}

/** Converte resposta da API em PokemonDetail (para página de detalhes). Inclui fetch dos tipos dos moves. */
export async function toPokemonDetail(api: PokeApiPokemon): Promise<PokemonDetail> {
  const basic = toPokemonBasic(api);
  const stats = parseStats(api);
  const abilities = parseAbilities(api);
  const types = parseTypes(api);
  const weaknesses = getWeaknesses(types);
  const resistances = getResistances(types);

  const picked = pickMainMoves(api.moves);
  const moves: Move[] = [];
  for (const entry of picked) {
    const typeName = await fetchMoveType(entry.move.url);
    moves.push({
      name: entry.move.name,
      type: toPokemonType(typeName),
    });
  }

  return {
    ...basic,
    stats,
    abilities,
    moves,
    weaknesses,
    resistances,
  };
}
