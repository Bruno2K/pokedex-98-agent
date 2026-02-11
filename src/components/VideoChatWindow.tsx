"use client";

import Image from "next/image";
import { useDragWindow } from "@/hooks/useDragWindow";
import { useState, useRef, useEffect } from "react";

const oakImage = "/icons/oak.png";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

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

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! Sou o Professor Oak. É um prazer conhecê-lo! Como posso ajudá-lo hoje com seus Pokémon?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTitlePointerDown = (e: React.PointerEvent) => {
    startDrag(e);
    onFocus?.();
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Criar histórico, garantindo que sempre comece com uma mensagem do usuário
      // Se a primeira mensagem for do assistente (mensagem de boas-vindas), removê-la
      let historyMessages = messages;
      if (messages.length > 0 && messages[0].role === "assistant") {
        historyMessages = messages.slice(1);
      }
      
      const history = historyMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          history,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || "Erro ao enviar mensagem");
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.details || data.error);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Desculpe, ocorreu um erro: ${error?.message || "Erro desconhecido"}. Por favor, verifique se a API key do Gemini está configurada corretamente.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const emojis = ["😊", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾"];

  const insertEmoji = (emoji: string) => {
    setInputValue((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // Função para renderizar markdown básico
  const renderMarkdown = (text: string) => {
    if (!text) return { __html: "" };

    // Escape HTML primeiro
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Processar listas primeiro (antes de outras formatações)
    const lines = html.split("\n");
    const processedLines: string[] = [];
    let inList = false;
    let listItems: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const listMatch = line.match(/^[-*]\s(.+)$/);
      const numberedMatch = line.match(/^\d+\.\s(.+)$/);

      if (listMatch || numberedMatch) {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        listItems.push(listMatch ? listMatch[1] : numberedMatch![1]);
      } else {
        if (inList) {
          processedLines.push(`<ul>${listItems.map(item => `<li>${item}</li>`).join("")}</ul>`);
          listItems = [];
          inList = false;
        }
        processedLines.push(line);
      }
    }

    if (inList && listItems.length > 0) {
      processedLines.push(`<ul>${listItems.map(item => `<li>${item}</li>`).join("")}</ul>`);
    }

    html = processedLines.join("\n");

    // Negrito **texto** ou __texto__ (processar primeiro)
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");

    // Código inline `código`
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Itálico *texto* (apenas asteriscos simples, não duplos)
    // Processar apenas se não estiver dentro de tags HTML
    html = html.replace(/([^*]|^)\*([^*\n]+?)\*([^*]|$)/g, "$1<em>$2</em>$3");

    // Quebras de linha
    html = html.replace(/\n/g, "<br />");

    return { __html: html };
  };

  // Fechar emoji picker ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

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
      {/* Title Bar - Blue gradient Windows XP style */}
      <div
        className="video-chat-title-bar win98-title-bar-draggable"
        onPointerDown={handleTitlePointerDown}
        role="presentation"
      >
        <span className="video-chat-title-text">Bate-papo - Professor Oak</span>
        <div className="video-chat-title-buttons">
          <button
            type="button"
            className="video-chat-title-btn"
            aria-label="Minimizar"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize?.();
            }}
          >
            −
          </button>
          <button type="button" className="video-chat-title-btn" aria-label="Maximizar">□</button>
          <button
            type="button"
            className="video-chat-title-btn video-chat-title-btn-close"
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

      {/* Menu Bar */}
      <div className="video-chat-menu-bar">
        <button className="video-chat-menu-item">Arquivo</button>
        <button className="video-chat-menu-item">Editar</button>
        <button className="video-chat-menu-item">Ações</button>
        <button className="video-chat-menu-item">Ferramentas</button>
        <button className="video-chat-menu-item">Ajuda</button>
      </div>

      {/* Toolbar with glossy 3D icons */}
      <div className="video-chat-toolbar">
        <button className="video-chat-toolbar-btn" title="Convidar">
          <span className="video-chat-toolbar-icon">👥</span>
          <span className="video-chat-toolbar-label">Convidar</span>
        </button>
        <button className="video-chat-toolbar-btn" title="Enviar Arquivo">
          <span className="video-chat-toolbar-icon">📎</span>
          <span className="video-chat-toolbar-label">Enviar Arquivo</span>
        </button>
        <button className="video-chat-toolbar-btn video-chat-toolbar-btn-active" title="Vídeo">
          <span className="video-chat-toolbar-icon">📹</span>
          <span className="video-chat-toolbar-label">Vídeo</span>
        </button>
        <button className="video-chat-toolbar-btn" title="Voz">
          <span className="video-chat-toolbar-icon">🎤</span>
          <span className="video-chat-toolbar-label">Voz</span>
        </button>
        <button className="video-chat-toolbar-btn" title="Atividades">
          <span className="video-chat-toolbar-icon">🎮</span>
          <span className="video-chat-toolbar-label">Atividades</span>
        </button>
        <button className="video-chat-toolbar-btn" title="Jogos">
          <span className="video-chat-toolbar-icon">🎯</span>
          <span className="video-chat-toolbar-label">Jogos</span>
        </button>
        <div className="video-chat-toolbar-logo">MSN</div>
      </div>

      {/* Main Content Area */}
      <div className="video-chat-body">
        <div className="video-chat-main-content">
          {/* Chat Area */}
          <div className="video-chat-chat-area">
            <div className="video-chat-to-label">Para: Professor Oak</div>
            <div className="video-chat-message-display">
              {messages.map((message, index) => (
                <div key={message.id} className="video-chat-message-item">
                  <div className="video-chat-message-header">
                    <span className="video-chat-message-sender">
                      {message.role === "user" ? "Você" : "Professor Oak"}
                    </span>
                    <span className="video-chat-message-separator">:</span>
                  </div>
                  <div className="video-chat-message-content">
                    <span 
                      className="video-chat-message-text"
                      dangerouslySetInnerHTML={renderMarkdown(message.content)}
                    />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="video-chat-message-item">
                  <div className="video-chat-message-header">
                    <span className="video-chat-message-sender">Professor Oak</span>
                    <span className="video-chat-message-separator">:</span>
                  </div>
                  <div className="video-chat-message-content">
                    <span className="video-chat-message-text">Digitando...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message Input Area */}
            <div className="video-chat-input-area">
              <input 
                ref={inputRef}
                type="text" 
                className="video-chat-input" 
                placeholder="Digite sua mensagem..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <div className="video-chat-input-buttons">
                <div className="video-chat-emoji-wrapper" ref={emojiPickerRef}>
                  <button 
                    className="video-chat-emoji-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEmojiPicker(!showEmojiPicker);
                    }}
                    title="Emoticons"
                    type="button"
                  >
                    😊
                  </button>
                  {showEmojiPicker && (
                    <div className="video-chat-emoji-picker">
                      <div className="video-chat-emoji-grid">
                        {emojis.map((emoji, index) => (
                          <button
                            key={index}
                            className="video-chat-emoji-item"
                            onClick={() => insertEmoji(emoji)}
                            type="button"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  className="video-chat-send-btn"
                  onClick={sendMessage}
                  disabled={isLoading || !inputValue.trim()}
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Avatars */}
          <div className="video-chat-sidebar">
            <div className="video-chat-avatar-card">
              <div className="video-chat-avatar-container">
                <Image
                  src={oakImage}
                  alt="Professor Oak"
                  width={80}
                  height={80}
                  className="video-chat-avatar-img"
                />
              </div>
              <div className="video-chat-avatar-name">Professor Oak</div>
              <div className="video-chat-avatar-status">Conectado</div>
            </div>
            <div className="video-chat-avatar-card">
              <div className="video-chat-avatar-container video-chat-avatar-you">
                <div className="video-chat-avatar-placeholder">📷</div>
              </div>
              <div className="video-chat-avatar-name">Você</div>
              <div className="video-chat-avatar-status">Ao vivo</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="video-chat-footer">
        Clique para novos Emoticons e Pacotes de Temas
      </div>
    </div>
  );
}
