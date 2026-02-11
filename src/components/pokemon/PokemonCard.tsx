"use client";

import Link from "next/link";
import type { PokemonBasic } from "@/lib/pokeapi/types";
import { TypeBadge } from "./TypeBadge";
import { playPokedexButtonSound } from "@/lib/pokedex-sound";

const ROLE_LABEL: Record<PokemonBasic["role"], string> = {
  sweeper: "Sweeper",
  tank: "Tank",
  support: "Support",
  mixed: "Mixed",
};

export function PokemonCard({ pokemon }: { pokemon: PokemonBasic }) {
  const name = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  return (
    <Link
      href={`/pokemon/${pokemon.id}`}
      className="pokemon-card"
      style={{ textDecoration: "none", color: "inherit" }}
      onClick={playPokedexButtonSound}
    >
      <div className="sprite-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pokemon.sprite}
          alt={name}
          width={64}
          height={64}
        />
      </div>
      <div className="name">#{String(pokemon.id).padStart(3, "0")} {name}</div>
      <div>
        {pokemon.types.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </div>
      <div style={{ fontSize: 5, marginTop: 4 }}>{ROLE_LABEL[pokemon.role]}</div>
    </Link>
  );
}
