"use client";

import { useMemo, useState } from "react";
import type { PokemonBasic, PokemonType, Role } from "@/lib/pokeapi/types";
import { PokemonCard } from "./PokemonCard";
import { TypeBadge, TYPE_COLORS } from "./TypeBadge";
import { Button8bit } from "@/components/Button8bit";
import { playPokedexButtonSound } from "@/lib/pokedex-sound";

const TYPES: PokemonType[] = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting",
  "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon",
];

const ROLES: Role[] = ["sweeper", "tank", "support", "mixed"];

const ROLE_LABEL: Record<Role, string> = {
  sweeper: "Sweeper",
  tank: "Tank",
  support: "Support",
  mixed: "Mixed",
};

export function PokemonListClient({ list }: { list: PokemonBasic[] }) {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<PokemonType | "">("");
  const [selectedRole, setSelectedRole] = useState<Role | "">("");

  const filtered = useMemo(() => {
    let result = list;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          String(p.id) === q
      );
    }
    if (selectedType) {
      result = result.filter((p) => p.types.includes(selectedType));
    }
    if (selectedRole) {
      result = result.filter((p) => p.role === selectedRole);
    }
    return result;
  }, [list, query, selectedType, selectedRole]);

  return (
    <div>
      <h1 style={{ fontSize: 12, marginBottom: 12 }}>Pokédex (151)</h1>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 8, display: "block", marginBottom: 4 }}>Buscar (nome ou ID)</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: pikachu ou 25"
          className="btn-8bit"
          style={{ width: "100%", maxWidth: 280 }}
        />
      </div>
      <div style={{ marginBottom: 8, flexWrap: "wrap", display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 8, marginRight: 8 }}>Tipo:</span>
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            className="type-badge"
            onClick={() => {
              playPokedexButtonSound();
              setSelectedType(selectedType === t ? "" : t);
            }}
            style={{
              cursor: "pointer",
              opacity: selectedType && selectedType !== t ? 0.5 : 1,
              background: TYPE_COLORS[t],
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 8, marginRight: 8 }}>Role:</span>
        {ROLES.map((r) => (
          <Button8bit
            key={r}
            onClick={() => {
              playPokedexButtonSound();
              setSelectedRole(selectedRole === r ? "" : r);
            }}
            style={{ marginRight: 4, opacity: selectedRole && selectedRole !== r ? 0.6 : 1 }}
          >
            {ROLE_LABEL[r]}
          </Button8bit>
        ))}
      </div>
      <p style={{ fontSize: 8, marginBottom: 8 }}>Exibindo {filtered.length} de {list.length}</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 8,
        }}
      >
        {filtered.map((p) => (
          <PokemonCard key={p.id} pokemon={p} />
        ))}
      </div>
    </div>
  );
}