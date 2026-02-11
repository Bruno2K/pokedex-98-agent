"use client";

import Image from "next/image";
import windowsIcon from "@/img/windows_slanted-1.png";

export type TaskbarWindow = {
  id: string;
  title: string;
};

type TaskbarProps = {
  windows: TaskbarWindow[];
  activeWindowId: string | null;
  onWindowClick: (id: string) => void;
};

export function Taskbar({ windows, activeWindowId, onWindowClick }: TaskbarProps) {
  return (
    <footer className="win98-taskbar" role="navigation" aria-label="Barra de tarefas">
      <button type="button" className="win98-taskbar-start" aria-label="Start">
        <span className="win98-taskbar-start-icon">
          <Image src={windowsIcon} alt="Windows" width={16} height={16} />
        </span>
        <span className="win98-taskbar-start-text">Start</span>
      </button>
      <div className="win98-taskbar-windows">
        {windows.map((win) => (
          <button
            key={win.id}
            type="button"
            className={`win98-taskbar-btn ${activeWindowId === win.id ? "win98-taskbar-btn-active" : ""}`}
            onClick={() => onWindowClick(win.id)}
            title={win.title}
          >
            {win.title}
          </button>
        ))}
      </div>
      <div className="win98-taskbar-tray" aria-hidden>
        <div className="win98-taskbar-tray-icon" />
        <div className="win98-taskbar-clock">10:06</div>
      </div>
    </footer>
  );
}

