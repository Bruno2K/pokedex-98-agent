"use client";

import Image from "next/image";
import oakImage from "@/img/oak.png";
import { useDragWindow } from "@/hooks/useDragWindow";

type VideoChatWindowProps = {
  onClose: () => void;
  zIndex?: number;
  isMinimized?: boolean;
  onFocus?: () => void;
  onMinimize?: () => void;
};

export function VideoChatWindow({ onClose, zIndex = 100, isMinimized = false, onFocus, onMinimize }: VideoChatWindowProps) {
  const { position, elementRef, startDrag } = useDragWindow({
    initialPosition: null,
  });

  const handleTitlePointerDown = (e: React.PointerEvent) => {
    startDrag(e);
    onFocus?.();
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
    ...(isMinimized ? { visibility: "hidden" as const, pointerEvents: "none" as const } : {}),
  };

  return (
    <div
      ref={elementRef}
      className="video-chat-window"
      style={style}
      role="dialog"
      aria-label="Bate-papo com Professor Oak"
      onClick={onFocus}
    >
      <div
        className="win98-title-bar video-chat-title-bar win98-title-bar-draggable"
        onPointerDown={handleTitlePointerDown}
        role="presentation"
      >
        <span className="win98-title-bar-text">Bate-papo - Professor Oak</span>
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
      <div className="video-chat-body">
        <div className="video-chat-video-wrap">
          <div className="video-chat-video video-chat-video-oak">
            <div className="video-chat-pixel-frame" />
            <div className="video-chat-avatar video-chat-avatar-oak">
              <Image
                src={oakImage}
                alt="Professor Oak"
                width={120}
                height={120}
                className="video-chat-oak-img"
              />
            </div>
            <span className="video-chat-label">Professor Oak</span>
            <span className="video-chat-status">Conectado</span>
          </div>
          <div className="video-chat-video video-chat-video-you">
            <div className="video-chat-pixel-frame" />
            <div className="video-chat-avatar video-chat-avatar-you">📷</div>
            <span className="video-chat-label">Você</span>
            <span className="video-chat-status">Ao vivo</span>
          </div>
        </div>
        <div className="video-chat-bar">
          <button type="button" className="btn-8bit video-chat-btn" title="Mutar">
            🔇
          </button>
          <button type="button" className="btn-8bit video-chat-btn" title="Desligar câmera">
            📷
          </button>
          <button type="button" className="btn-8bit video-chat-btn video-chat-btn-end" onClick={onClose}>
            Desligar
          </button>
        </div>
      </div>
    </div>
  );
}
