"use client";

import { useCallback, useMemo, useState } from "react";
import { PokedexShell } from "@/components/PokedexShell";
import { Taskbar } from "@/components/Taskbar";
import type { TaskbarWindow } from "@/components/Taskbar";
import { VideoChatWindow } from "@/components/VideoChatWindow";

const DESKTOP_ICONS = [
  { label: "Meu Computador", icon: "🖥️", x: "24px", y: "24px", id: "pc" },
  { label: "Bate-papo por vídeo", icon: "📹", x: "24px", y: "120px", id: "video" },
  { label: "Lixeira", icon: "🗑️", x: "24px", y: "216px", id: "trash" },
  { label: "Internet", icon: "🌐", x: "24px", y: "312px", id: "internet" },
  { label: "Meus Documentos", icon: "📁", x: "24px", y: "408px", id: "docs" },
  { label: "Treinador", icon: "👤", x: "calc(100% - 100px)", y: "24px", id: "trainer" },
  { label: "Ginásios", icon: "🏆", x: "calc(100% - 100px)", y: "120px", id: "gym" },
  { label: "Centro Pokémon", icon: "🏥", x: "calc(100% - 100px)", y: "216px", id: "center" },
  { label: "Loja", icon: "🛒", x: "calc(100% - 100px)", y: "312px", id: "shop" },
  { label: "Configurações", icon: "⚙️", x: "calc(100% - 100px)", y: "408px", id: "settings" },
];

const POKEDEX_ID = "pokedex";
const VIDEO_CHAT_ID = "video";

type Win98DesktopProps = {
  children: React.ReactNode;
};

export function Win98Desktop({ children }: Win98DesktopProps) {
  const [videoChatOpen, setVideoChatOpen] = useState(false);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(POKEDEX_ID);
  const [minimizedPokedex, setMinimizedPokedex] = useState(false);
  const [minimizedVideo, setMinimizedVideo] = useState(false);

  const taskbarWindows = useMemo<TaskbarWindow[]>(() => {
    const list: TaskbarWindow[] = [
      { id: POKEDEX_ID, title: "Pokédex - 151 Pokémon" },
    ];
    if (videoChatOpen) {
      list.push({ id: VIDEO_CHAT_ID, title: "Bate-papo - Professor Oak" });
    }
    return list;
  }, [videoChatOpen]);

  const handleTaskbarWindowClick = useCallback(
    (id: string) => {
      if (id === POKEDEX_ID) {
        if (activeWindowId === POKEDEX_ID) {
          setMinimizedPokedex((m) => !m);
        } else {
          setActiveWindowId(POKEDEX_ID);
          setMinimizedPokedex(false);
        }
      } else if (id === VIDEO_CHAT_ID) {
        if (activeWindowId === VIDEO_CHAT_ID) {
          setMinimizedVideo((m) => !m);
        } else {
          setActiveWindowId(VIDEO_CHAT_ID);
          setMinimizedVideo(false);
        }
      }
    },
    [activeWindowId]
  );

  const handleVideoClose = useCallback(() => {
    setVideoChatOpen(false);
    setMinimizedVideo(false);
    if (activeWindowId === VIDEO_CHAT_ID) {
      setActiveWindowId(POKEDEX_ID);
    }
  }, [activeWindowId]);

  return (
    <div className="win98-desktop">
      <div className="win98-desktop-icons" aria-hidden>
        {DESKTOP_ICONS.map((item) => (
          <div
            key={item.id}
            className="win98-desktop-icon"
            style={{ left: item.x, top: item.y }}
            onClick={item.id === "video" ? () => { setVideoChatOpen(true); setActiveWindowId(VIDEO_CHAT_ID); setMinimizedVideo(false); } : undefined}
            onKeyDown={
              item.id === "video"
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setVideoChatOpen(true);
                      setActiveWindowId(VIDEO_CHAT_ID);
                      setMinimizedVideo(false);
                    }
                  }
                : undefined
            }
            role={item.id === "video" ? "button" : undefined}
            tabIndex={item.id === "video" ? 0 : undefined}
            aria-label={item.id === "video" ? "Abrir bate-papo por vídeo com Professor Oak" : undefined}
          >
            <span className="win98-desktop-icon-img">{item.icon}</span>
            <span className="win98-desktop-icon-label">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="win98-desktop-window">
        <PokedexShell
          zIndex={activeWindowId === POKEDEX_ID ? 20 : 10}
          isMinimized={minimizedPokedex}
          onFocus={() => { setActiveWindowId(POKEDEX_ID); setMinimizedPokedex(false); }}
        >
          {children}
        </PokedexShell>
      </div>
      {videoChatOpen && (
        <VideoChatWindow
          onClose={handleVideoClose}
          zIndex={activeWindowId === VIDEO_CHAT_ID ? 20 : 10}
          isMinimized={minimizedVideo}
          onFocus={() => { setActiveWindowId(VIDEO_CHAT_ID); setMinimizedVideo(false); }}
        />
      )}
      <Taskbar
        windows={taskbarWindows}
        activeWindowId={activeWindowId}
        onWindowClick={handleTaskbarWindowClick}
      />
    </div>
  );
}
