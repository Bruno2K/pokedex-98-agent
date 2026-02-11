"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PokedexShell } from "@/components/PokedexShell";
import { Taskbar } from "@/components/Taskbar";
import type { TaskbarWindow } from "@/components/Taskbar";
import { VideoChatWindow } from "@/components/VideoChatWindow";
import { CalculatorWindow } from "@/components/CalculatorWindow";
import { CalendarWindow } from "@/components/CalendarWindow";
import { ExplorerWindow } from "@/components/ExplorerWindow";
import { ImageViewerWindow } from "@/components/ImageViewerWindow";
import { BrowserWindow } from "@/components/BrowserWindow";

import { ContextMenu } from "@/components/ContextMenu";
import { playWindowsErrorSound } from "@/lib/windows-error-sound";

const recycleIconEmpty = "/icons/recycle_bin_empty_cool-0.png";
const recycleIconFull = "/icons/recycle_bin_full-2.png";
const globeIcon = "/icons/globe_map-5.png";
const directoryIcon = "/icons/directory_closed-3.png";
const videoIcon = "/icons/camera3_vid-3.png";
const computerIcon = "/icons/computer_explorer-2.png";
const trainerIcon = "/icons/msagent-3.png";
const gymIcon = "/icons/minesweeper-0.png";
const centerIcon = "/icons/tree-0.png";
const shopIcon = "/icons/msn3-5.png";
const settingsIcon = "/icons/server_gear-1.png";
const calculatorIcon = "/icons/calculator-0.png";
const calendarIcon = "/icons/calendar-0.png";
const pokedexIcon = "/icons/search_directory-0.png";

const DESKTOP_ICONS = [
  { label: "Pokédex", x: "24px", y: "24px", id: "pokedex" },
  { label: "Meu Computador", x: "24px", y: "120px", id: "pc" },
  { label: "Bate-papo por vídeo", x: "24px", y: "216px", id: "video" },
  { label: "Lixeira", x: "24px", y: "312px", id: "trash" },
  { label: "Internet", x: "24px", y: "408px", id: "internet" },
  { label: "Meus Documentos", x: "24px", y: "504px", id: "docs" },
  { label: "Calculadora", x: "24px", y: "600px", id: "calculator" },
  { label: "Calendário", x: "24px", y: "696px", id: "calendar" },
  { label: "Treinador", x: "calc(100% - 100px)", y: "24px", id: "trainer" },
  { label: "Ginásios", x: "calc(100% - 100px)", y: "120px", id: "gym" },
  { label: "Centro Pokémon", x: "calc(100% - 100px)", y: "216px", id: "center" },
  { label: "Loja", x: "calc(100% - 100px)", y: "312px", id: "shop" },
  { label: "Configurações", x: "calc(100% - 100px)", y: "408px", id: "settings" },
] as const;

const POKEDEX_ID = "pokedex";
const VIDEO_CHAT_ID = "video";
const CALCULATOR_ID = "calculator";
const CALENDAR_ID = "calendar";
const EXPLORER_ID = "explorer";
const IMAGE_VIEWER_ID = "image-viewer";
const BROWSER_ID = "browser";

type Win98DesktopProps = {
  children: React.ReactNode;
};

export function Win98Desktop({ children }: Win98DesktopProps) {
  const router = useRouter();
  const [pokedexOpen, setPokedexOpen] = useState(false);
  const [videoChatOpen, setVideoChatOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [imageViewerData, setImageViewerData] = useState<{ imagePath: string; imageList: string[]; index: number } | null>(null);
  const [browserOpen, setBrowserOpen] = useState(false);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [minimizedPokedex, setMinimizedPokedex] = useState(false);
  const [minimizedVideo, setMinimizedVideo] = useState(false);
  const [minimizedCalculator, setMinimizedCalculator] = useState(false);
  const [minimizedCalendar, setMinimizedCalendar] = useState(false);
  const [minimizedExplorer, setMinimizedExplorer] = useState(false);
  const [minimizedImageViewer, setMinimizedImageViewer] = useState(false);
  const [minimizedBrowser, setMinimizedBrowser] = useState(false);
  const [trashIsEmpty, setTrashIsEmpty] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const taskbarWindows = useMemo<TaskbarWindow[]>(() => {
    const list: TaskbarWindow[] = [];
    if (pokedexOpen) {
      list.push({ id: POKEDEX_ID, title: "Pokédex - 151 Pokémon" });
    }
    if (videoChatOpen) {
      list.push({ id: VIDEO_CHAT_ID, title: "Bate-papo - Professor Oak" });
    }
    if (calculatorOpen) {
      list.push({ id: CALCULATOR_ID, title: "Calculadora" });
    }
    if (calendarOpen) {
      list.push({ id: CALENDAR_ID, title: "Calendário" });
    }
    if (explorerOpen) {
      list.push({ id: EXPLORER_ID, title: "Exploring - Meus Documentos" });
    }
    if (imageViewerOpen && imageViewerData) {
      list.push({ id: IMAGE_VIEWER_ID, title: imageViewerData.imagePath.split("/").pop() || "Imagem" });
    }
    if (browserOpen) {
      list.push({ id: BROWSER_ID, title: "Internet Explorer" });
    }
    return list;
  }, [pokedexOpen, videoChatOpen, calculatorOpen, calendarOpen, explorerOpen, imageViewerOpen, imageViewerData, browserOpen]);

  const handleTaskbarWindowClick = useCallback(
    (id: string) => {
      if (id === POKEDEX_ID) {
        if (!pokedexOpen) {
          setPokedexOpen(true);
          setActiveWindowId(POKEDEX_ID);
          setMinimizedPokedex(false);
          return;
        }
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
      } else if (id === CALCULATOR_ID) {
        if (!calculatorOpen) {
          setCalculatorOpen(true);
          setActiveWindowId(CALCULATOR_ID);
          setMinimizedCalculator(false);
          return;
        }
        if (activeWindowId === CALCULATOR_ID) {
          setMinimizedCalculator((m) => !m);
        } else {
          setActiveWindowId(CALCULATOR_ID);
          setMinimizedCalculator(false);
        }
      } else if (id === CALENDAR_ID) {
        if (!calendarOpen) {
          setCalendarOpen(true);
          setActiveWindowId(CALENDAR_ID);
          setMinimizedCalendar(false);
          return;
        }
        if (activeWindowId === CALENDAR_ID) {
          setMinimizedCalendar((m) => !m);
        } else {
          setActiveWindowId(CALENDAR_ID);
          setMinimizedCalendar(false);
        }
      } else if (id === BROWSER_ID) {
        if (!browserOpen) {
          setBrowserOpen(true);
          setActiveWindowId(BROWSER_ID);
          setMinimizedBrowser(false);
          return;
        }
        if (activeWindowId === BROWSER_ID) {
          setMinimizedBrowser((m) => !m);
        } else {
          setActiveWindowId(BROWSER_ID);
          setMinimizedBrowser(false);
        }
      }
    },
    [activeWindowId, pokedexOpen, videoChatOpen, calculatorOpen, calendarOpen, explorerOpen, browserOpen]
  );

  const handleVideoClose = useCallback(() => {
    setVideoChatOpen(false);
    setMinimizedVideo(false);
    if (activeWindowId === VIDEO_CHAT_ID) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  const handleCalculatorClose = useCallback(() => {
    setCalculatorOpen(false);
    setMinimizedCalculator(false);
    if (activeWindowId === CALCULATOR_ID) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  const handleCalendarClose = useCallback(() => {
    setCalendarOpen(false);
    setMinimizedCalendar(false);
    if (activeWindowId === CALENDAR_ID) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  const handlePokedexClose = useCallback(() => {
    setPokedexOpen(false);
    setMinimizedPokedex(false);
    if (activeWindowId === POKEDEX_ID) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  const handleExplorerClose = useCallback(() => {
    setExplorerOpen(false);
    setMinimizedExplorer(false);
    if (activeWindowId === EXPLORER_ID) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  const handleOpenImage = useCallback((imagePath: string, imageList: string[], index: number) => {
    setImageViewerData({ imagePath, imageList, index });
    setImageViewerOpen(true);
    setActiveWindowId(IMAGE_VIEWER_ID);
    setMinimizedImageViewer(false);
  }, []);

  const handleImageViewerClose = useCallback(() => {
    setImageViewerOpen(false);
    setMinimizedImageViewer(false);
    setImageViewerData(null);
    if (activeWindowId === IMAGE_VIEWER_ID) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  const handleBrowserClose = useCallback(() => {
    setBrowserOpen(false);
    setMinimizedBrowser(false);
    if (activeWindowId === BROWSER_ID) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  const handleEmptyTrash = useCallback(() => {
    const audio = new Audio("/effects/windows-xp-recycle-bin.mp3");
    audio.play().catch(() => {
      // Ignore errors if audio fails to play
    });
    setTrashIsEmpty(true);
    setContextMenu(null);
  }, []);

  const handleTrashContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <div className="win98-desktop">
      <div className="win98-desktop-icons" aria-hidden>
        {DESKTOP_ICONS.map((item) => (
          <div
            key={item.id}
            className="win98-desktop-icon"
            style={{ left: item.x, top: item.y }}
            onClick={
              item.id === "pokedex"
                ? () => {
                    setPokedexOpen(true);
                    setActiveWindowId(POKEDEX_ID);
                    setMinimizedPokedex(false);
                  }
                : item.id === "video"
                  ? () => {
                      setVideoChatOpen(true);
                      setActiveWindowId(VIDEO_CHAT_ID);
                      setMinimizedVideo(false);
                    }
                  : item.id === "pc"
                    ? () => {
                        playWindowsErrorSound();
                      }
                  : item.id === "trash"
                    ? () => {
                        playWindowsErrorSound();
                      }
                  : item.id === "calculator"
                    ? () => {
                        setCalculatorOpen(true);
                        setActiveWindowId(CALCULATOR_ID);
                        setMinimizedCalculator(false);
                      }
                    : item.id === "calendar"
                      ? () => {
                          setCalendarOpen(true);
                          setActiveWindowId(CALENDAR_ID);
                          setMinimizedCalendar(false);
                        }
                      : item.id === "docs"
                        ? () => {
                            setExplorerOpen(true);
                            setActiveWindowId(EXPLORER_ID);
                            setMinimizedExplorer(false);
                          }
                        : item.id === "internet"
                          ? () => {
                              setBrowserOpen(true);
                              setActiveWindowId(BROWSER_ID);
                              setMinimizedBrowser(false);
                            }
                          : item.id === "settings"
                            ? () => {
                                router.push("/bsod");
                              }
                            : undefined
            }
            onKeyDown={
              item.id === "pokedex"
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setPokedexOpen(true);
                      setActiveWindowId(POKEDEX_ID);
                      setMinimizedPokedex(false);
                    }
                  }
                : item.id === "video"
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setVideoChatOpen(true);
                        setActiveWindowId(VIDEO_CHAT_ID);
                        setMinimizedVideo(false);
                      }
                    }
                  : item.id === "pc"
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          playWindowsErrorSound();
                        }
                      }
                  : item.id === "trash"
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          playWindowsErrorSound();
                        }
                      }
                  : item.id === "calculator"
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setCalculatorOpen(true);
                          setActiveWindowId(CALCULATOR_ID);
                          setMinimizedCalculator(false);
                        }
                      }
                : item.id === "calendar"
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setCalendarOpen(true);
                        setActiveWindowId(CALENDAR_ID);
                        setMinimizedCalendar(false);
                      }
                    }
                  : item.id === "docs"
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setExplorerOpen(true);
                          setActiveWindowId(EXPLORER_ID);
                          setMinimizedExplorer(false);
                        }
                      }
                    : item.id === "internet"
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setBrowserOpen(true);
                            setActiveWindowId(BROWSER_ID);
                            setMinimizedBrowser(false);
                          }
                        }
                      : item.id === "settings"
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              router.push("/bsod");
                            }
                          }
                        : undefined
            }
            onContextMenu={item.id === "trash" ? handleTrashContextMenu : undefined}
            role={
              item.id === "pokedex" ||
              item.id === "video" ||
              item.id === "calculator" ||
              item.id === "calendar" ||
              item.id === "settings" ||
              item.id === "pc" ||
              item.id === "trash" ||
              item.id === "internet"
                ? "button"
                : undefined
            }
            tabIndex={
              item.id === "pokedex" ||
              item.id === "video" ||
              item.id === "calculator" ||
              item.id === "calendar" ||
              item.id === "settings" ||
              item.id === "pc" ||
              item.id === "trash" ||
              item.id === "internet"
                ? 0
                : undefined
            }
            aria-label={
              item.id === "pokedex"
                ? "Abrir Pokédex"
                : item.id === "video"
                  ? "Abrir bate-papo por vídeo com Professor Oak"
                  : item.id === "pc"
                    ? "Meu Computador (não disponível)"
                  : item.id === "trash"
                    ? "Lixeira (não disponível)"
                  : item.id === "calculator"
                    ? "Abrir calculadora"
                    : item.id === "calendar"
                      ? "Abrir calendário"
                      : item.id === "internet"
                        ? "Abrir navegador Internet Explorer"
                        : item.id === "settings"
                          ? "Abrir configurações"
                          : undefined
            }
          >
            <span className="win98-desktop-icon-img">
              {item.id === "pokedex" && (
                <Image src={pokedexIcon} alt="Pokédex" width={32} height={32} />
              )}
              {item.id === "pc" && (
                <Image src={computerIcon} alt="Meu Computador" width={32} height={32} />
              )}
              {item.id === "trash" && (
                <Image
                  src={trashIsEmpty ? recycleIconEmpty : recycleIconFull}
                  alt="Lixeira"
                  width={32}
                  height={32}
                />
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
              {item.id === "calculator" && (
                <Image src={calculatorIcon} alt="Calculadora" width={32} height={32} />
              )}
              {item.id === "calendar" && (
                <Image src={calendarIcon} alt="Calendário" width={32} height={32} />
              )}
            </span>
            <span className="win98-desktop-icon-label">{item.label}</span>
          </div>
        ))}
      </div>
      {pokedexOpen && (
        <div className="win98-desktop-window">
          <PokedexShell
            zIndex={activeWindowId === POKEDEX_ID ? 20 : 10}
            isMinimized={minimizedPokedex}
            onFocus={() => {
              setActiveWindowId(POKEDEX_ID);
              setMinimizedPokedex(false);
            }}
            onClose={handlePokedexClose}
            onMinimize={() => {
              setMinimizedPokedex((m) => !m);
            }}
          >
            {children}
          </PokedexShell>
        </div>
      )}
      {videoChatOpen && (
        <VideoChatWindow
          onClose={handleVideoClose}
          zIndex={activeWindowId === VIDEO_CHAT_ID ? 30 : 15}
          isMinimized={minimizedVideo}
          onFocus={() => {
            setActiveWindowId(VIDEO_CHAT_ID);
            setMinimizedVideo(false);
          }}
          onMinimize={() => {
            setMinimizedVideo((m) => !m);
          }}
        />
      )}
      {calculatorOpen && (
        <CalculatorWindow
          onClose={handleCalculatorClose}
          zIndex={activeWindowId === CALCULATOR_ID ? 30 : 15}
          isMinimized={minimizedCalculator}
          onFocus={() => {
            setActiveWindowId(CALCULATOR_ID);
            setMinimizedCalculator(false);
          }}
          onMinimize={() => {
            setMinimizedCalculator((m) => !m);
          }}
        />
      )}
      {calendarOpen && (
        <CalendarWindow
          onClose={handleCalendarClose}
          zIndex={activeWindowId === CALENDAR_ID ? 30 : 15}
          isMinimized={minimizedCalendar}
          onFocus={() => {
            setActiveWindowId(CALENDAR_ID);
            setMinimizedCalendar(false);
          }}
          onMinimize={() => {
            setMinimizedCalendar((m) => !m);
          }}
        />
      )}
      {explorerOpen && (
        <ExplorerWindow
          onClose={handleExplorerClose}
          zIndex={activeWindowId === EXPLORER_ID ? 30 : 15}
          isMinimized={minimizedExplorer}
          onFocus={() => {
            setActiveWindowId(EXPLORER_ID);
            setMinimizedExplorer(false);
          }}
          onMinimize={() => {
            setMinimizedExplorer((m) => !m);
          }}
          onOpenImage={handleOpenImage}
        />
      )}
      {imageViewerOpen && imageViewerData && (
        <ImageViewerWindow
          imagePath={imageViewerData.imagePath}
          imageList={imageViewerData.imageList}
          initialIndex={imageViewerData.index}
          onClose={handleImageViewerClose}
          zIndex={activeWindowId === IMAGE_VIEWER_ID ? 30 : 15}
          isMinimized={minimizedImageViewer}
          onFocus={() => {
            setActiveWindowId(IMAGE_VIEWER_ID);
            setMinimizedImageViewer(false);
          }}
          onMinimize={() => {
            setMinimizedImageViewer((m) => !m);
          }}
        />
      )}
      {browserOpen && (
        <BrowserWindow
          onClose={handleBrowserClose}
          zIndex={activeWindowId === BROWSER_ID ? 30 : 15}
          isMinimized={minimizedBrowser}
          onFocus={() => {
            setActiveWindowId(BROWSER_ID);
            setMinimizedBrowser(false);
          }}
          onMinimize={() => {
            setMinimizedBrowser((m) => !m);
          }}
        />
      )}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={[
            {
              label: trashIsEmpty ? "Lixeira vazia" : "Esvaziar Lixeira",
              onClick: handleEmptyTrash,
              disabled: trashIsEmpty,
            },
          ]}
          onClose={() => setContextMenu(null)}
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

