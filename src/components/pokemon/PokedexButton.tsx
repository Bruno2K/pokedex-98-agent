"use client";

import Link from "next/link";
import { playPokedexButtonSound } from "@/lib/pokedex-sound";

type PokedexButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function PokedexButton({ href, children, className, style }: PokedexButtonProps) {
  return (
    <Link
      href={href}
      className={`btn-8bit ${className || ""}`}
      style={{ textDecoration: "none", color: "inherit", ...style }}
      onClick={playPokedexButtonSound}
    >
      {children}
    </Link>
  );
}

export function PokedexLink({ href, children, className, style }: PokedexButtonProps) {
  return (
    <Link href={href} className={className} style={{ textDecoration: "none", color: "inherit", ...style }} onClick={playPokedexButtonSound}>
      {children}
    </Link>
  );
}
