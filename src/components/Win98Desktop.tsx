"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { PokedexShell } from "@/components/PokedexShell";
import { Taskbar } from "@/components/Taskbar";
import type { TaskbarWindow } from "@/components/Taskbar";
import { VideoChatWindow } from "@/components/VideoChatWindow";

import recycleIcon from "@/img/recycle_bin_empty_cool-0.png";
import globeIcon from "@/img/globe_map-5.png";
import directoryIcon from "@/img/directory_closed-3.png";
import videoIcon from "@/img/camera3_vid-3.png";
import computerIcon from "@/img/computer_explorer-2.png";
import trainerIcon from "@/img/msagent-3.png";
import gymIcon from "@/img/minesweeper-0.png";
import centerIcon from "@/img/tree-0.png";
import shopIcon from "@/img/msn3-5.png";
import settingsIcon from "@/img/server_gear-1.png";

const DESKTOP_ICONS = [
  { label: "Meu Computador", x: "24px", y: "24px", id: "pc" },
  { label: "Bate-papo por vídeo", x: "24px", y: "120px", id: "video" },
  { label: "Lixeira", x: "24px", y: "216px", id: "trash" },
  { label: "Internet", x: "24px", y: "312px", id: "internet" },
  { label: "Meus Documentos", x: "24px", y: "408px", id: "docs" },
  { label: "Treinador", x: "calc(100% - 100px)", y: "24px", id: "trainer" },
  { label: "Ginásios", x: "calc(100% - 100px)", y: "120px", id: "gym" },
  { label: "Centro Pokémon", x: "calc(100% - 100px)", y: "216px", id: "center" },
  { label: "Loja", x: "calc(100% - 100px)", y: "312px", id: "shop" },
  { label: "Configurações", x: "calc(100% - 100px)", y: "408px", id: "settings" },
] as const;

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
    const list: TaskbarWindow[] = [{ id: POKEDEX_ID, title: "Pokédex - 151 Pokémon" }];
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
        if (!videoChatOpen) {
          setVideoChatOpen(true);
          setActiveWindowId(VIDEO_CHAT_ID);
          setMinimizedVideo(false);
          return;
        }
        if (activeWindowId === VIDEO_CHAT_ID) {
          setMinimizedVideo((m) => !m);
        } else {
          setActiveWindowId(VIDEO_CHAT_ID);
          setMinimizedVideo(false);
        }
      }
    },
    [activeWindowId, videoChatOpen]
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
            onClick={
              item.id === "video"
                ? () => {
                    setVideoChatOpen(true);
                    setActiveWindowId(VIDEO_CHAT_ID);
                    setMinimizedVideo(false);
                  }
                : undefined
            }
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
            <span className="win98-desktop-icon-img">
              {item.id === "pc" && (
                <Image src={computerIcon} alt="Meu Computador" width={32} height={32} />
              )}
              {item.id === "trash" && (
                <Image src={recycleIcon} alt="Lixeira" width={32} height={32} />
              )}
              {item.id === "internet" && (
                <Image src={globeIcon} alt="Internet" width={32} height={32} />
              )}
              {item.id === "docs" && (
                <Image src={directoryIcon} alt="Meus Documentos" width={32} height={32} />
              )}
              {item.id === "video" && (
                <Image src={videoIcon} alt="Bate-papo por vídeo" width={32} height={32} />
              )}
              {item.id === "trainer" && (
                <Image src={trainerIcon} alt="Treinador" width={32} height={32} />
              )}
              {item.id === "gym" && (
                <Image src={gymIcon} alt="Ginásios" width={32} height={32} />
              )}
              {item.id === "center" && (
                <Image src={centerIcon} alt="Centro Pokémon" width={32} height={32} />
              )}
              {item.id === "shop" && (
                <Image src={shopIcon} alt="Loja" width={32} height={32} />
              )}
              {item.id === "settings" && (
                <Image src={settingsIcon} alt="Configurações" width={32} height={32} />
              )}
            </span>
            <span className="win98-desktop-icon-label">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="win98-desktop-window">
        <PokedexShell
          zIndex={activeWindowId === POKEDEX_ID ? 20 : 10}
          isMinimized={minimizedPokedex}
          onFocus={() => {
            setActiveWindowId(POKEDEX_ID);
            setMinimizedPokedex(false);
          }}
        >
          {children}
        </PokedexShell>
      </div>
      {videoChatOpen && (
        <VideoChatWindow
          onClose={handleVideoClose}
          zIndex={activeWindowId === VIDEO_CHAT_ID ? 30 : 15}
          isMinimized={minimizedVideo}
          onFocus={() => {
            setActiveWindowId(VIDEO_CHAT_ID);
            setMinimizedVideo(false);
          }}
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

