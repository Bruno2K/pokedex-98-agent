const BASE = "https://pokeapi.co/api/v2";

export interface PokeApiPokemon {
  id: number;
  name: string;
  types: { type: { name: string } }[];
  sprites: {
    front_default: string | null;
    other?: { "official-artwork"?: { front_default?: string } };
    versions?: {
      "generation-v"?: {
        "black-white"?: {
          animated?: { front_default?: string };
          front_default?: string;
        };
      };
    };
  };
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { ability: { name: string; url: string }; is_hidden: boolean }[];
  moves: {
    move: { name: string; url: string };
    version_group_details: {
      level_learned_at: number;
      move_learn_method: { name: string };
    }[];
  }[];
}

export interface PokeApiListResult {
  results: { name: string; url: string }[];
}

/** Lista os primeiros `limit` Pokémon (por ID). */
export async function fetchPokemonList(limit: number): Promise<PokeApiPokemon[]> {
  const out: PokeApiPokemon[] = [];
  for (let id = 1; id <= limit; id++) {
    const p = await fetchPokemonById(id);
    out.push(p);
  }
  return out;
}

/** Busca um Pokémon por ID. */
export async function fetchPokemonById(id: number): Promise<PokeApiPokemon> {
  const res = await fetch(`${BASE}/pokemon/${id}`, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Pokemon ${id}: ${res.status}`);
  return res.json();
}

/** Busca espécie por ID (para flavor text, etc.). */
export async function fetchSpeciesById(
  id: number
): Promise<{ flavor_text_entries?: { flavor_text: string; language: { name: string } }[] }> {
  const res = await fetch(`${BASE}/pokemon-species/${id}`, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Species ${id}: ${res.status}`);
  return res.json();
}

const moveTypeCache = new Map<string, string>();

/** Retorna o tipo do movimento (ex: "grass"). Usa cache. */
export async function fetchMoveType(moveUrl: string): Promise<string> {
  const cached = moveTypeCache.get(moveUrl);
  if (cached) return cached;
  const res = await fetch(moveUrl, { cache: "force-cache" });
  if (!res.ok) return "normal";
  const data = await res.json();
  const type = (data?.type?.name ?? "normal") as string;
  moveTypeCache.set(moveUrl, type);
  return type;
}
