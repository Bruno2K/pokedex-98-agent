"use client";

import { useState, useRef, useMemo } from "react";
import Image from "next/image";
import { useDragWindow } from "@/hooks/useDragWindow";
import { useResizeWindow } from "@/hooks/useResizeWindow";
import { playWindowsErrorSound } from "@/lib/windows-error-sound";

type ExplorerWindowProps = {
  onClose: () => void;
  zIndex?: number;
  isMinimized?: boolean;
  onFocus?: () => void;
  onMinimize?: () => void;
  onOpenImage?: (imagePath: string, imageList: string[], index: number) => void;
};

type FileItem = {
  name: string;
  type: "folder" | "file";
  size?: string;
  fileType?: string;
  path?: string;
  iconPath?: string;
  canOpenImage?: boolean;
};

const FOLDERS = [
  { name: "Desktop", icon: "🖥️" },
  { name: "Meu Computador", icon: "💻" },
  { name: "Meus Documentos", icon: "📁" },
  { name: "Lixeira", icon: "🗑️" },
];

// Ícones do desktop dentro do Explorer (mesmos da tela inicial)
const DESKTOP_ITEMS: FileItem[] = [
  { name: "Pokédex", type: "file", iconPath: "/icons/search_directory-0.png" },
  { name: "Meu Computador", type: "file", iconPath: "/icons/computer_explorer-2.png" },
  { name: "Bate-papo por vídeo", type: "file", iconPath: "/icons/camera3_vid-3.png" },
  { name: "Lixeira", type: "file", iconPath: "/icons/recycle_bin_empty_cool-0.png" },
  { name: "Internet", type: "file", iconPath: "/icons/globe_map-5.png" },
  { name: "Meus Documentos", type: "file", iconPath: "/icons/directory_closed-3.png" },
  { name: "Calculadora", type: "file", iconPath: "/icons/calculator-0.png" },
  { name: "Calendário", type: "file", iconPath: "/icons/calendar-0.png" },
  { name: "Treinador", type: "file", iconPath: "/icons/msagent-3.png" },
  { name: "Ginásios", type: "file", iconPath: "/icons/minesweeper-0.png" },
  { name: "Centro Pokémon", type: "file", iconPath: "/icons/tree-0.png" },
  { name: "Loja", type: "file", iconPath: "/icons/msn3-5.png" },
  { name: "Configurações", type: "file", iconPath: "/icons/server_gear-1.png" },
];

// Lista de imagens da pasta gallery (Meus Documentos)
const GALLERY_IMAGES = [
  "0b83dc5234ffc06f303fc6083424cd57.jpg",
  "1240b2d7e825a4c1cd273988a6688f15.jpg",
  "1fe0f644372e758c68d0989e920180d2.jpg",
  "4bc2729fe0dc0fedee1a2e4199dcf19a.jpg",
  "517dcf03f964d9e4e8d01660c2eeaf34.jpg",
  "771467351739bc46a86c946622acae98.jpg",
  "8528b0b604b02e15488dd540689739e8.jpg",
  "bc48734f659a757e4b3d07181f735367.jpg",
  "c039494fe1a46a2b51542f699a25143b.jpg",
  "c89d70cbd7519abf26efabd1e1892bd5.jpg",
  "c9c52f58fd0e0840a45ce290b564714e.jpg",
  "cf56d49589cf266f9493b7277c233c2f.jpg",
  "d791d6b3129e2b3416383ab54e674478.jpg",
  "fbbe5d8a5936434e1ee96898a35ac275.jpg",
];

const DOCUMENT_FILES: FileItem[] = GALLERY_IMAGES.map((filename) => ({
  name: filename,
  type: "file" as const,
  size: "~50 KB",
  fileType: "JPEG Image",
  path: `/gallery/${filename}`,
  iconPath: "/icons/kodak_imaging_file-0.png",
  canOpenImage: true,
}));

export function ExplorerWindow({ onClose, zIndex = 100, isMinimized = false, onFocus, onMinimize, onOpenImage }: ExplorerWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { position, elementRef: dragElementRef, startDrag } = useDragWindow({
    initialPosition: null,
  });
  const { size, startResize } = useResizeWindow({
    initialWidth: 600,
    initialHeight: 400,
    minWidth: 500,
    minHeight: 300,
    elementRef: containerRef,
  });

  const [selectedFolder, setSelectedFolder] = useState("Meus Documentos");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["Desktop", "Meus Documentos"]));

  const filesForSelectedFolder = useMemo<FileItem[]>(() => {
    if (selectedFolder === "Desktop") return DESKTOP_ITEMS;
    if (selectedFolder === "Meus Documentos") return DOCUMENT_FILES;
    // Meu Computador e Lixeira: sem conteúdo navegável (apenas som de erro)
    return [];
  }, [selectedFolder]);

  // Sync refs
  const setRefs = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    (dragElementRef as any).current = node;
  };

  const handleTitlePointerDown = (e: React.PointerEvent) => {
    startDrag(e);
    onFocus?.();
  };

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderName)) {
        newSet.delete(folderName);
      } else {
        newSet.add(folderName);
      }
      return newSet;
    });
  };

  const handleFolderClick = (folderName: string) => {
    setSelectedFolder(folderName);
    if (folderName === "Meu Computador" || folderName === "Lixeira") {
      playWindowsErrorSound();
    }
  };

  const style = {
    zIndex,
    ...(position
      ? {
          left: position.x,
          top: position.y,
          transform: "none" as const,
        }
      : {}),
    ...(size
      ? {
          width: size.width,
          height: size.height,
        }
      : {}),
    ...(isMinimized ? { visibility: "hidden" as const, pointerEvents: "none" as const } : {}),
  };

  return (
    <div
      ref={setRefs}
      className="explorer-window win98-resizable"
      style={style}
      role="dialog"
      aria-label="Explorador de Arquivos"
      onClick={onFocus}
    >
      {/* Resize handles */}
      <div className="win98-resize-handle win98-resize-handle-n" onPointerDown={(e) => startResize(e, "n")} />
      <div className="win98-resize-handle win98-resize-handle-s" onPointerDown={(e) => startResize(e, "s")} />
      <div className="win98-resize-handle win98-resize-handle-w" onPointerDown={(e) => startResize(e, "w")} />
      <div className="win98-resize-handle win98-resize-handle-e" onPointerDown={(e) => startResize(e, "e")} />
      <div className="win98-resize-handle win98-resize-handle-nw" onPointerDown={(e) => startResize(e, "nw")} />
      <div className="win98-resize-handle win98-resize-handle-ne" onPointerDown={(e) => startResize(e, "ne")} />
      <div className="win98-resize-handle win98-resize-handle-sw" onPointerDown={(e) => startResize(e, "sw")} />
      <div className="win98-resize-handle win98-resize-handle-se" onPointerDown={(e) => startResize(e, "se")} />

      <div
        className="win98-title-bar explorer-title-bar win98-title-bar-draggable"
        onPointerDown={handleTitlePointerDown}
        role="presentation"
      >
        <span className="win98-title-bar-text">Exploring - Meus Documentos</span>
        <div className="win98-title-buttons">
          <button
            type="button"
            className="win98-title-btn"
            aria-label="Minimizar"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize?.();
            }}
          >
            −
          </button>
          <button type="button" className="win98-title-btn" aria-label="Maximizar">□</button>
          <button
            type="button"
            className="win98-title-btn win98-title-btn-close"
            aria-label="Fechar"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            ×
          </button>
        </div>
      </div>

      <div className="explorer-menu-bar">
        <button type="button" className="explorer-menu-item">F&ile</button>
        <button type="button" className="explorer-menu-item">&Edit</button>
        <button type="button" className="explorer-menu-item">&View</button>
        <button type="button" className="explorer-menu-item">&Tools</button>
        <button type="button" className="explorer-menu-item">&Help</button>
      </div>

      <div className="explorer-toolbar">
        <div className="explorer-toolbar-buttons">
          <button type="button" className="explorer-toolbar-btn" title="Voltar">←</button>
          <button type="button" className="explorer-toolbar-btn" title="Avançar">→</button>
          <button type="button" className="explorer-toolbar-btn" title="Acima">↑</button>
          <div className="explorer-toolbar-separator" />
          <button type="button" className="explorer-toolbar-btn" title="Cortar">✂</button>
          <button type="button" className="explorer-toolbar-btn" title="Copiar">📋</button>
          <button type="button" className="explorer-toolbar-btn" title="Colar">📄</button>
          <button type="button" className="explorer-toolbar-btn" title="Desfazer">↶</button>
          <div className="explorer-toolbar-separator" />
          <button type="button" className="explorer-toolbar-btn" title="Deletar">🗑</button>
          <button type="button" className="explorer-toolbar-btn" title="Propriedades">⚙</button>
          <div className="explorer-toolbar-separator" />
          <button type="button" className="explorer-toolbar-btn" title="Visualização">👁</button>
        </div>
      </div>

      <div className="explorer-body">
        <div className="explorer-sidebar">
          <div className="explorer-sidebar-header">
            <span className="explorer-sidebar-title">Folders</span>
            <button type="button" className="explorer-sidebar-close" aria-label="Fechar painel">×</button>
          </div>
          <div className="explorer-tree">
            {FOLDERS.map((folder) => (
              <div key={folder.name} className="explorer-tree-item">
                <button
                  type="button"
                  className={`explorer-tree-folder ${selectedFolder === folder.name ? "explorer-tree-folder-selected" : ""}`}
                  onClick={() => handleFolderClick(folder.name)}
                >
                  <span className="explorer-tree-icon">{folder.icon}</span>
                  <span className="explorer-tree-label">{folder.name}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="explorer-content">
          <div className="explorer-content-header">
            <div className="explorer-column-header explorer-column-name">Name</div>
            <div className="explorer-column-header explorer-column-size">Size</div>
            <div className="explorer-column-header explorer-column-type">Type</div>
          </div>
          <div className="explorer-file-list">
            {filesForSelectedFolder.map((file, index) => (
              <div
                key={index}
                className="explorer-file-item"
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1.5fr",
                  gap: "8px",
                  padding: "2px 4px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (file.type === "file" && file.path && file.canOpenImage && onOpenImage) {
                    const imageList = GALLERY_IMAGES.map((f) => `/gallery/${f}`);
                    onOpenImage(file.path, imageList, index);
                  }
                }}
                onDoubleClick={() => {
                  if (file.type === "file" && file.path && file.canOpenImage && onOpenImage) {
                    const imageList = GALLERY_IMAGES.map((f) => `/gallery/${f}`);
                    onOpenImage(file.path, imageList, index);
                  }
                }}
              >
                <div className="explorer-file-name">
                  {file.iconPath ? (
                    <Image
                      src={file.iconPath}
                      alt=""
                      width={16}
                      height={16}
                      style={{ marginRight: "4px", display: "inline-block", verticalAlign: "middle" }}
                    />
                  ) : file.type === "folder" ? (
                    <span style={{ marginRight: "4px" }}>📁</span>
                  ) : (
                    <span style={{ marginRight: "4px" }}>📄</span>
                  )}
                  {file.name}
                </div>
                <div className="explorer-file-size">{file.size || ""}</div>
                <div className="explorer-file-type">{file.fileType || (file.type === "folder" ? "File Folder" : "")}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="explorer-status-bar">
        <div className="explorer-status-left">{filesForSelectedFolder.length} object(s)</div>
        <div className="explorer-status-right">{selectedFolder}</div>
      </div>
    </div>
  );
}
