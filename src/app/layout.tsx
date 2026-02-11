import type { ReactNode } from "react";
import "./globals.css";
import { BSODWrapper } from "@/components/BSODWrapper";
import { StartupSound } from "@/components/StartupSound";
import { GlobalClickSound } from "@/components/GlobalClickSound";

export const metadata = {
  title: "Pokédex 8-bit",
  description: "Pokédex dos 151 primeiros Pokémon em estilo 8 bits.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <StartupSound />
        <GlobalClickSound />
        <BSODWrapper>{children}</BSODWrapper>
      </body>
    </html>
  );
}

