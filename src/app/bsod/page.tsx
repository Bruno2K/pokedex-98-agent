"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BSODPage() {
  const router = useRouter();

  useEffect(() => {
    // Aplicar estilos ao body
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.body.style.backgroundColor = "#0000aa";

    // Tocar som do BSOD
    const audio = new Audio("/effects/blue-screen-of-death.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Ignore errors if audio fails to play
    });

    // Voltar para a página inicial após pressionar qualquer tecla
    const handleKeyPress = () => {
      router.push("/");
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      // Restaurar estilos do body
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.overflow = "";
      document.body.style.backgroundColor = "";
    };
  }, [router]);

  return (
    <div className="bsod-screen">
      <div className="bsod-content">
        <div className="bsod-windows-box">
          <div className="bsod-windows-text">Windows</div>
        </div>
        <div className="bsod-message">
          <p className="bsod-error-line">
            A fatal exception ØE has occurred at 0028:C0011E36 in UXD UMM(01) + 00010E36.
          </p>
          <p className="bsod-error-line">The current application will be terminated.</p>
          <div className="bsod-instructions">
            <p className="bsod-bullet">* Press any key to terminate the current application.</p>
            <p className="bsod-bullet">
              * Press CTRL+ALT+DEL again to restart your computer. You will lose any unsaved information in all applications.
            </p>
          </div>
          <div className="bsod-continue">
            Press any key to continue <span className="bsod-cursor">_</span>
          </div>
        </div>
      </div>
    </div>
  );
}
