import type { ReactNode } from "react";
import "./globals.css";
import { Win98Desktop } from "@/components/Win98Desktop";

export const metadata = {
  title: "Pokédex 8-bit",
  description: "Pokédex dos 151 primeiros Pokémon em estilo 8 bits.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Win98Desktop>{children}</Win98Desktop>
      </body>
    </html>
  );
}

