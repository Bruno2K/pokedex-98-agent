"use client";

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
      <button type="button" className="win98-taskbar-start" aria-label="Iniciar">
        <span className="win98-taskbar-start-icon">🪟</span>
        <span className="win98-taskbar-start-text">Iniciar</span>
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
    </footer>
  );
}
