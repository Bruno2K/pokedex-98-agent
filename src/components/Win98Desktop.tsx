"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { PokedexShell } from "@/components/PokedexShell";
import { Taskbar } from "@/components/Taskbar";
import type { TaskbarWindow } from "@/components/Taskbar";
import { VideoChatWindow } from "@/components/VideoChatWindow";
import { CalculatorWindow } from "@/components/CalculatorWindow";
import { CalendarWindow } from "@/components/CalendarWindow";

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
import calculatorIcon from "@/img/calculator-0.png";
import calendarIcon from "@/img/calendar-0.png";
import pokedexIcon from "@/img/search_directory-0.png";

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

type Win98DesktopProps = {
  children: React.ReactNode;
};

export function Win98Desktop({ children }: Win98DesktopProps) {
  const [pokedexOpen, setPokedexOpen] = useState(false);
  const [videoChatOpen, setVideoChatOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [minimizedPokedex, setMinimizedPokedex] = useState(false);
  const [minimizedVideo, setMinimizedVideo] = useState(false);
  const [minimizedCalculator, setMinimizedCalculator] = useState(false);
  const [minimizedCalendar, setMinimizedCalendar] = useState(false);

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
    return list;
  }, [pokedexOpen, videoChatOpen, calculatorOpen, calendarOpen]);

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
      }
    },
    [activeWindowId, pokedexOpen, videoChatOpen, calculatorOpen, calendarOpen]
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
                      : undefined
            }
            role={item.id === "pokedex" || item.id === "video" || item.id === "calculator" || item.id === "calendar" ? "button" : undefined}
            tabIndex={item.id === "pokedex" || item.id === "video" || item.id === "calculator" || item.id === "calendar" ? 0 : undefined}
            aria-label={
              item.id === "pokedex"
                ? "Abrir Pokédex"
                : item.id === "video"
                  ? "Abrir bate-papo por vídeo com Professor Oak"
                  : item.id === "calculator"
                    ? "Abrir calculadora"
                    : item.id === "calendar"
                      ? "Abrir calendário"
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
      <Taskbar
        windows={taskbarWindows}
        activeWindowId={activeWindowId}
        onWindowClick={handleTaskbarWindowClick}
      />
    </div>
  );
}

