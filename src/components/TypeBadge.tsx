import type { PokemonType } from "@/lib/pokeapi/types";

export const TYPE_COLORS: Record<PokemonType, string> = {
  normal: "#a8a878",
  fire: "#f08030",
  water: "#6890f0",
  electric: "#f8d030",
  grass: "#78c850",
  ice: "#98d8d8",
  fighting: "#c03028",
  poison: "#a040a0",
  ground: "#e0c068",
  flying: "#a890f0",
  psychic: "#f85888",
  bug: "#a8b820",
  rock: "#b8a038",
  ghost: "#705898",
  dragon: "#7038f8",
};

export function TypeBadge({ type }: { type: PokemonType }) {
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  return (
    <span
      className="type-badge"
      style={{ background: TYPE_COLORS[type] ?? "#a8a878" }}
    >
      {label}
    </span>
  );
}
