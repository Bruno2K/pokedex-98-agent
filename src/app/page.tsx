import { fetchPokemonList } from "@/lib/pokeapi/client";
import { toPokemonBasic } from "@/lib/pokeapi/normalize";
import { PokemonListClient } from "@/components/PokemonListClient";

const LIMIT = 151;

export default async function HomePage() {
  const raw = await fetchPokemonList(LIMIT);
  const list = raw.map(toPokemonBasic);
  return <PokemonListClient list={list} />;
}
