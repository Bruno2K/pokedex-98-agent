"use client";

import { useState, useRef, useEffect } from "react";
import { useDragWindow } from "@/hooks/useDragWindow";
import { useResizeWindow } from "@/hooks/useResizeWindow";

type BrowserWindowProps = {
  onClose: () => void;
  zIndex?: number;
  isMinimized?: boolean;
  onFocus?: () => void;
  onMinimize?: () => void;
};

export function BrowserWindow({ onClose, zIndex = 100, isMinimized = false, onFocus, onMinimize }: BrowserWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { position, elementRef: dragElementRef, startDrag } = useDragWindow({
    initialPosition: null,
  });
  const { size, startResize } = useResizeWindow({
    initialWidth: 800,
    initialHeight: 600,
    minWidth: 600,
    minHeight: 400,
    elementRef: containerRef,
  });

  const [currentUrl, setCurrentUrl] = useState("http://www.google.com");
  const [displayUrl, setDisplayUrl] = useState("http://www.google.com");
  const [pageContent, setPageContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>(["http://www.google.com"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dialUpAudioRef = useRef<HTMLAudioElement | null>(null);

  // Sync refs
  const setRefs = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    (dragElementRef as any).current = node;
  };

  const handleTitlePointerDown = (e: React.PointerEvent) => {
    startDrag(e);
    onFocus?.();
  };

  const playDialUpSound = () => {
    try {
      // Parar áudio anterior se estiver tocando
      if (dialUpAudioRef.current) {
        dialUpAudioRef.current.pause();
        dialUpAudioRef.current.currentTime = 0;
      }
      
      // Criar e tocar novo áudio
      const audio = new Audio("/effects/dial-up-internet.mp3");
      dialUpAudioRef.current = audio;
      audio.play().catch((error) => {
        console.log("Erro ao tocar áudio de dial-up:", error);
      });
    } catch (error) {
      console.log("Erro ao inicializar áudio de dial-up:", error);
    }
  };

  const stopDialUpSound = () => {
    if (dialUpAudioRef.current) {
      dialUpAudioRef.current.pause();
      dialUpAudioRef.current.currentTime = 0;
    }
  };

  const loadPage = async (url: string) => {
    setIsLoading(true);
    setCurrentUrl(url);
    setDisplayUrl(url);
    
    // Tocar som de dial-up
    playDialUpSound();

    try {
      const response = await fetch("/api/browser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar página");
      }

      const data = await response.json();
      setPageContent(data.html);

      // Atualizar histórico
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(url);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } catch (error) {
      console.error("Erro ao carregar página:", error);
      setPageContent(`
        <html>
          <head><title>Erro</title></head>
          <body style="font-family: Arial; padding: 20px;">
            <h1>Erro ao carregar página</h1>
            <p>Não foi possível carregar ${url}</p>
          </body>
        </html>
      `);
    } finally {
      setIsLoading(false);
      // Parar som de dial-up após um pequeno delay para efeito mais realista
      setTimeout(() => {
        stopDialUpSound();
      }, 500);
    }
  };

  const handleNavigate = () => {
    loadPage(displayUrl);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNavigate();
    }
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      loadPage(history[newIndex]);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      loadPage(history[newIndex]);
    }
  };

  const handleRefresh = () => {
    loadPage(currentUrl);
  };

  const handleHome = () => {
    loadPage("http://www.google.com");
  };

  useEffect(() => {
    // Carregar página inicial quando o componente montar
    loadPage("http://www.google.com");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Limpar áudio quando o componente desmontar
  useEffect(() => {
    return () => {
      stopDialUpSound();
    };
  }, []);

  useEffect(() => {
    // Escutar mensagens do iframe
    const handleMessage = (event: MessageEvent) => {
      // Verificar se é uma mensagem do nosso iframe
      if (event.data && typeof event.data === 'object') {
        if (event.data.type === 'browser-navigate') {
          // Navegar para uma nova URL
          const url = event.data.url;
          const text = event.data.text || '';
          if (url) {
            // Se há texto do link e não é Google, provavelmente é um resultado de busca - carregar como artigo
            // Também verificar se a URL parece ser de um artigo (não é google.com/search)
            const isGoogleSearch = url.includes('google.com') && (url.includes('/search') || url.includes('?q='));
            if (text.trim() && !isGoogleSearch) {
              loadArticle(url, text);
            } else {
              loadPage(url);
            }
          }
        } else if (event.data.type === 'browser-search') {
          // Processar pesquisa
          const query = event.data.query;
          const url = event.data.url || currentUrl;
          if (query) {
            // Carregar página de resultados de pesquisa
            loadSearchResults(url, query);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [currentUrl]);

  const loadSearchResults = async (url: string, query: string) => {
    setIsLoading(true);
    const searchUrl = `${url}?q=${encodeURIComponent(query)}`;
    setCurrentUrl(searchUrl);
    setDisplayUrl(searchUrl);
    
    // Tocar som de dial-up
    playDialUpSound();

    try {
      const response = await fetch("/api/browser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, query }),
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar resultados");
      }

      const data = await response.json();
      setPageContent(data.html);

      // Atualizar histórico
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(searchUrl);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } catch (error) {
      console.error("Erro ao carregar resultados:", error);
      setPageContent(`
        <html>
          <head><title>Erro</title></head>
          <body style="font-family: Arial; padding: 20px;">
            <h1>Erro ao carregar resultados</h1>
            <p>Não foi possível carregar resultados para "${query}"</p>
          </body>
        </html>
      `);
    } finally {
      setIsLoading(false);
      // Parar som de dial-up após um pequeno delay
      setTimeout(() => {
        stopDialUpSound();
      }, 500);
    }
  };

  const loadArticle = async (url: string, title: string) => {
    setIsLoading(true);
    setCurrentUrl(url);
    setDisplayUrl(url);
    
    // Tocar som de dial-up
    playDialUpSound();

    try {
      const response = await fetch("/api/browser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, articleTitle: title }),
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar artigo");
      }

      const data = await response.json();
      setPageContent(data.html);

      // Atualizar histórico
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(url);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } catch (error) {
      console.error("Erro ao carregar artigo:", error);
      setPageContent(`
        <html>
          <head><title>Erro</title></head>
          <body style="font-family: Arial; padding: 20px;">
            <h1>Erro ao carregar artigo</h1>
            <p>Não foi possível carregar "${title}"</p>
          </body>
        </html>
      `);
    } finally {
      setIsLoading(false);
      // Parar som de dial-up após um pequeno delay
      setTimeout(() => {
        stopDialUpSound();
      }, 500);
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
      className="browser-window win98-resizable"
      style={style}
      role="dialog"
      aria-label="Navegador Internet Explorer"
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
        className="win98-title-bar browser-title-bar win98-title-bar-draggable"
        onPointerDown={handleTitlePointerDown}
        role="presentation"
      >
        <span className="win98-title-bar-text">Internet Explorer - {currentUrl}</span>
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

      <div className="browser-menu-bar">
        <button type="button" className="browser-menu-item">F&ile</button>
        <button type="button" className="browser-menu-item">&Edit</button>
        <button type="button" className="browser-menu-item">&View</button>
        <button type="button" className="browser-menu-item">&Go</button>
        <button type="button" className="browser-menu-item">&Favorites</button>
        <button type="button" className="browser-menu-item">&Help</button>
      </div>

      <div className="browser-toolbar">
        <div className="browser-toolbar-buttons">
          <button
            type="button"
            className="browser-toolbar-btn"
            title="Voltar"
            onClick={handleBack}
            disabled={historyIndex === 0}
          >
            ←
          </button>
          <button
            type="button"
            className="browser-toolbar-btn"
            title="Avançar"
            onClick={handleForward}
            disabled={historyIndex === history.length - 1}
          >
            →
          </button>
          <button type="button" className="browser-toolbar-btn" title="Parar" onClick={() => setIsLoading(false)}>
            ⏹
          </button>
          <button type="button" className="browser-toolbar-btn" title="Atualizar" onClick={handleRefresh}>
            ↻
          </button>
          <button type="button" className="browser-toolbar-btn" title="Início" onClick={handleHome}>
            🏠
          </button>
          <div className="browser-toolbar-separator" />
          <button type="button" className="browser-toolbar-btn" title="Pesquisar">🔍</button>
          <button type="button" className="browser-toolbar-btn" title="Favoritos">⭐</button>
          <button type="button" className="browser-toolbar-btn" title="Histórico">📜</button>
        </div>
      </div>

      <div className="browser-address-bar">
        <label htmlFor="browser-url" className="browser-address-label">
          Address:
        </label>
        <input
          id="browser-url"
          type="text"
          className="browser-address-input"
          value={displayUrl}
          onChange={(e) => setDisplayUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite o endereço"
        />
        <button type="button" className="browser-go-btn" onClick={handleNavigate} disabled={isLoading}>
          {isLoading ? "..." : "Go"}
        </button>
      </div>

      <div className="browser-content">
        {isLoading && (
          <div className="browser-loading">
            <div className="browser-loading-text">Conectando a {displayUrl}...</div>
          </div>
        )}
        {pageContent && !isLoading ? (
          <iframe
            ref={iframeRef}
            className="browser-iframe"
            title="Browser Content"
            sandbox="allow-same-origin allow-scripts allow-forms"
            srcDoc={pageContent}
          />
        ) : (
          <iframe
            ref={iframeRef}
            className="browser-iframe"
            title="Browser Content"
            sandbox="allow-same-origin allow-scripts allow-forms"
            style={{ display: "none" }}
          />
        )}
      </div>

      <div className="browser-status-bar">
        <div className="browser-status-left">
          {isLoading ? "Carregando..." : "Concluído"}
        </div>
        <div className="browser-status-right">{currentUrl}</div>
      </div>
    </div>
  );
}
