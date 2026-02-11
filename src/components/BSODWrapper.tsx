"use client";

import { usePathname } from "next/navigation";
import { Win98Desktop } from "@/components/Win98Desktop";

export function BSODWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  if (pathname === "/bsod") {
    return <>{children}</>;
  }
  
  return <Win98Desktop>{children}</Win98Desktop>;
}
