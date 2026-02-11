import { notFound } from "next/navigation";
import { fetchPokemonById } from "@/lib/pokeapi/client";
import { toPokemonDetail } from "@/lib/pokeapi/normalize";
import { TypeBadge } from "@/components/pokemon/TypeBadge";
import { StatBar } from "@/components/pokemon/StatBar";
import { PokedexButton, PokedexLink } from "@/components/pokemon/PokedexButton";

const ROLE_LABEL: Record<string, string> = {
  sweeper: "Sweeper",
  tank: "Tank",
  support: "Support",
  mixed: "Mixed",
};

export async function generateStaticParams() {
  return Array.from({ length: 151 }, (_, i) => ({ id: String(i + 1) }));
}

export default async function PokemonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (Number.isNaN(numId) || numId < 1 || numId > 151) notFound();

  const raw = await fetchPokemonById(numId);
  const pokemon = await toPokemonDetail(raw);

  const name = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  const prevId = numId > 1 ? numId - 1 : null;
  const nextId = numId < 151 ? numId + 1 : null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <PokedexLink href="/" className="btn-8bit">
          Voltar
        </PokedexLink>
        <div style={{ display: "flex", gap: 8 }}>
          {prevId && <PokedexButton href={`/pokemon/${prevId}`}>Anterior</PokedexButton>}
          {nextId && <PokedexButton href={`/pokemon/${nextId}`}>Próximo</PokedexButton>}
        </div>
      </div>

      <div className="pokemon-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ textAlign: "center" }}>
          <div className="sprite-wrap sprite-bounce" style={{ width: 160, height: 160, margin: "0 auto 8px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pokemon.sprite}
              alt={name}
              width={160}
              height={160}
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            />
          </div>
          <h1 style={{ fontSize: 12, marginBottom: 4 }}>#{String(pokemon.id).padStart(3, "0")} {name}</h1>
          <div style={{ marginBottom: 4 }}>
            {pokemon.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
          <p style={{ fontSize: 8 }}>Role: {ROLE_LABEL[pokemon.role] ?? pokemon.role}</p>
        </div>

        <div>
          <h2 style={{ fontSize: 10, marginBottom: 8 }}>Stats</h2>
          <StatBar label="HP" value={pokemon.stats.hp} />
          <StatBar label="Ataque" value={pokemon.stats.attack} />
          <StatBar label="Defesa" value={pokemon.stats.defense} />
          <StatBar label="Sp. Ataque" value={pokemon.stats["special-attack"]} />
          <StatBar label="Sp. Defesa" value={pokemon.stats["special-defense"]} />
          <StatBar label="Velocidade" value={pokemon.stats.speed} />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 10, marginBottom: 8 }}>Fraquezas</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {pokemon.weaknesses.length ? pokemon.weaknesses.map((t) => <TypeBadge key={t} type={t} />) : <span style={{ fontSize: 8 }}>Nenhuma</span>}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 10, marginBottom: 8 }}>Resistências</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {pokemon.resistances.length ? pokemon.resistances.map((t) => <TypeBadge key={t} type={t} />) : <span style={{ fontSize: 8 }}>Nenhuma</span>}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 10, marginBottom: 8 }}>Moves</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 8, lineHeight: 1.6 }}>
          {pokemon.moves.map((m) => (
            <li key={m.name} style={{ marginBottom: 4 }}>
              <TypeBadge type={m.type} /> {m.name.replace(/-/g, " ")}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 style={{ fontSize: 10, marginBottom: 8 }}>Habilidades</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 8, lineHeight: 1.6 }}>
          {pokemon.abilities.map((a) => (
            <li key={a.name} style={{ marginBottom: 4 }}>
              {a.name.replace(/-/g, " ")}
              {a.description && ` — ${a.description}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
