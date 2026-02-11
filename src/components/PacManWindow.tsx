"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useDragWindow } from "@/hooks/useDragWindow";
import { useResizeWindow } from "@/hooks/useResizeWindow";

type PacManWindowProps = {
  onClose: () => void;
  zIndex?: number;
  isMinimized?: boolean;
  onFocus?: () => void;
  onMinimize?: () => void;
};

const TILE_SIZE = 20;
const PACMAN_SPEED = 2;
const GHOST_SPEED = 1.5;
const POWER_DURATION = 6000; // 6 segundos

// Labirinto simples (1 = parede, 0 = caminho, 2 = ponto, 3 = power pellet)
const MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,2,2,1],
  [1,3,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
  [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
  [1,1,1,1,1,2,1,1,1,0,1,0,1,1,1,0,1,1,1,2,1,1,1,1,1],
  [0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
  [1,1,1,1,1,2,1,0,1,1,0,0,1,1,0,1,1,0,1,2,1,1,1,1,1],
  [0,0,0,0,0,2,0,0,1,0,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0],
  [1,1,1,1,1,2,1,0,1,1,1,1,1,1,1,1,1,0,1,2,1,1,1,1,1],
  [0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
  [1,1,1,1,1,2,1,0,1,1,1,1,1,1,1,1,1,0,1,2,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1],
  [1,3,2,2,1,2,2,2,2,2,0,2,2,2,2,2,2,2,2,2,1,2,2,3,1],
  [1,1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1],
  [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,1,2,1,2,1,1,1,2,1,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

type Position = { x: number; y: number };
type Direction = "up" | "down" | "left" | "right";

export function PacManWindow({ onClose, zIndex = 100, isMinimized = false, onFocus, onMinimize }: PacManWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { position, elementRef: dragElementRef, startDrag } = useDragWindow({
    initialPosition: null,
  });
  const { size, startResize } = useResizeWindow({
    initialWidth: 800,
    initialHeight: 700,
    minWidth: 600,
    minHeight: 500,
    elementRef: containerRef,
  });

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [pacmanPos, setPacmanPos] = useState<Position>({ x: 12, y: 15 });
  const [pacmanDir, setPacmanDir] = useState<Direction>("right");
  const [nextDir, setNextDir] = useState<Direction | null>(null);
  const [powerMode, setPowerMode] = useState(false);
  const [powerTimer, setPowerTimer] = useState<NodeJS.Timeout | null>(null);
  const [ghosts, setGhosts] = useState<Array<{ pos: Position; dir: Direction; color: string; eaten: boolean }>>([
    { pos: { x: 12, y: 9 }, dir: "left", color: "#FF0000", eaten: false },
    { pos: { x: 11, y: 9 }, dir: "right", color: "#FFB8FF", eaten: false },
    { pos: { x: 13, y: 9 }, dir: "up", color: "#00FFFF", eaten: false },
    { pos: { x: 12, y: 10 }, dir: "down", color: "#FFB851", eaten: false },
  ]);
  const [maze, setMaze] = useState(MAZE.map(row => [...row]));
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const wakaAudioRef = useRef<HTMLAudioElement | null>(null);
  const dieAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const powerAudioRef = useRef<HTMLAudioElement | null>(null);

  // Sync refs
  const setRefs = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    (dragElementRef as any).current = node;
  };

  const handleTitlePointerDown = (e: React.PointerEvent) => {
    startDrag(e);
    onFocus?.();
  };

  const playSound = (soundFile: string, ref: React.MutableRefObject<HTMLAudioElement | null>) => {
    try {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
      const audio = new Audio(soundFile);
      ref.current = audio;
      audio.play().catch(() => {
        // Ignore errors
      });
    } catch (error) {
      // Ignore errors
    }
  };

  const getTile = (x: number, y: number): number => {
    const tileX = Math.floor(x);
    const tileY = Math.floor(y);
    if (tileX < 0 || tileX >= MAZE[0].length || tileY < 0 || tileY >= MAZE.length) return 1;
    return maze[tileY][tileX];
  };

  const canMove = (x: number, y: number): boolean => {
    const tile = getTile(x, y);
    return tile !== 1;
  };

  const isAlignedToGrid = (pos: Position): boolean => {
    const tileX = Math.floor(pos.x);
    const tileY = Math.floor(pos.y);
    const diffX = Math.abs(pos.x - tileX);
    const diffY = Math.abs(pos.y - tileY);
    return diffX < 0.1 && diffY < 0.1;
  };

  const movePacman = useCallback(() => {
    setPacmanPos((prev) => {
      let newX = prev.x;
      let newY = prev.y;
      let dir = pacmanDir;

      // Verificar se está alinhado ao grid antes de mudar de direção
      if (isAlignedToGrid(prev) && nextDir) {
        const testX = Math.floor(prev.x) + (nextDir === "left" ? -1 : nextDir === "right" ? 1 : 0);
        const testY = Math.floor(prev.y) + (nextDir === "up" ? -1 : nextDir === "down" ? 1 : 0);
        if (canMove(testX, testY)) {
          dir = nextDir;
          setPacmanDir(nextDir);
          setNextDir(null);
          // Alinhar ao grid
          newX = Math.floor(prev.x);
          newY = Math.floor(prev.y);
        }
      }

      // Mover na direção atual
      const dx = dir === "left" ? -PACMAN_SPEED / TILE_SIZE : dir === "right" ? PACMAN_SPEED / TILE_SIZE : 0;
      const dy = dir === "up" ? -PACMAN_SPEED / TILE_SIZE : dir === "down" ? PACMAN_SPEED / TILE_SIZE : 0;

      const testX = newX + dx;
      const testY = newY + dy;

      // Verificar colisão com paredes ANTES de mover
      if (!canMove(testX, testY)) {
        // Tentar alinhar ao grid se possível
        if (isAlignedToGrid(prev)) {
          return prev;
        }
        // Continuar movimento até alinhar
        newX += dx;
        newY += dy;
        // Limitar ao grid
        newX = Math.max(0, Math.min(MAZE[0].length - 1, newX));
        newY = Math.max(0, Math.min(MAZE.length - 1, newY));
        return { x: newX, y: newY };
      }

      newX = testX;
      newY = testY;

      // Coletar pontos
      const tileX = Math.floor(newX);
      const tileY = Math.floor(newY);
      if (maze[tileY] && maze[tileY][tileX] === 2) {
        setMaze((m) => {
          const newMaze = m.map(row => [...row]);
          newMaze[tileY][tileX] = 0;
          
          // Verificar vitória após atualizar o maze
          const remainingDots = newMaze.flat().filter(tile => tile === 2 || tile === 3).length;
          if (remainingDots === 0) {
            setTimeout(() => {
              setGameWon(true);
              setGameStarted(false);
              playSound("/effects/pacman_AwvgsBv.mp3", winAudioRef);
            }, 0);
          }
          
          return newMaze;
        });
        setScore((s) => s + 10);
      } else if (maze[tileY] && maze[tileY][tileX] === 3) {
        setMaze((m) => {
          const newMaze = m.map(row => [...row]);
          newMaze[tileY][tileX] = 0;
          return newMaze;
        });
        setScore((s) => s + 50);
        setPowerMode(true);
        playSound("/effects/sor-pacman.mp3", powerAudioRef);
        
        // Resetar timer de poder
        if (powerTimer) {
          clearTimeout(powerTimer);
        }
        const timer = setTimeout(() => {
          setPowerMode(false);
        }, POWER_DURATION);
        setPowerTimer(timer);
      }

      // Wraparound nas laterais
      if (newX < 0) newX = MAZE[0].length - 1;
      if (newX >= MAZE[0].length) newX = 0;

      return { x: newX, y: newY };
    });
  }, [pacmanDir, nextDir, maze, powerTimer]);

  const moveGhosts = useCallback(() => {
    setGhosts((ghosts) =>
      ghosts.map((ghost) => {
        // Se fantasma foi comido, retornar à base
        if (ghost.eaten) {
          const baseX = 12;
          const baseY = 9;
          const distToBase = Math.sqrt(
            Math.pow(ghost.pos.x - baseX, 2) + Math.pow(ghost.pos.y - baseY, 2)
          );
          if (distToBase < 0.5) {
            return { ...ghost, eaten: false, pos: { x: baseX, y: baseY } };
          }
          // Mover em direção à base
          const dx = baseX - ghost.pos.x;
          const dy = baseY - ghost.pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const moveX = (dx / dist) * (GHOST_SPEED / TILE_SIZE);
          const moveY = (dy / dist) * (GHOST_SPEED / TILE_SIZE);
          return {
            ...ghost,
            pos: { x: ghost.pos.x + moveX, y: ghost.pos.y + moveY },
          };
        }

        let newX = ghost.pos.x;
        let newY = ghost.pos.y;
        let dir = ghost.dir;

        // Só mudar de direção quando alinhado ao grid
        if (isAlignedToGrid(ghost.pos)) {
          const possibleDirs: Direction[] = [];
          if (canMove(Math.floor(ghost.pos.x) - 1, Math.floor(ghost.pos.y))) possibleDirs.push("left");
          if (canMove(Math.floor(ghost.pos.x) + 1, Math.floor(ghost.pos.y))) possibleDirs.push("right");
          if (canMove(Math.floor(ghost.pos.x), Math.floor(ghost.pos.y) - 1)) possibleDirs.push("up");
          if (canMove(Math.floor(ghost.pos.x), Math.floor(ghost.pos.y) + 1)) possibleDirs.push("down");

          if (possibleDirs.length > 0) {
            // Se em modo poder, tentar fugir do Pac-Man
            if (powerMode) {
              possibleDirs.sort((a, b) => {
                const distA = Math.abs(
                  (Math.floor(ghost.pos.x) + (a === "left" ? -1 : a === "right" ? 1 : 0)) - pacmanPos.x
                ) + Math.abs(
                  (Math.floor(ghost.pos.y) + (a === "up" ? -1 : a === "down" ? 1 : 0)) - pacmanPos.y
                );
                const distB = Math.abs(
                  (Math.floor(ghost.pos.x) + (b === "left" ? -1 : b === "right" ? 1 : 0)) - pacmanPos.x
                ) + Math.abs(
                  (Math.floor(ghost.pos.y) + (b === "up" ? -1 : b === "down" ? 1 : 0)) - pacmanPos.y
                );
                return distB - distA; // Inverter: maior distância = melhor
              });
            } else {
              // Escolher direção que aproxima do Pac-Man
              possibleDirs.sort((a, b) => {
                const distA = Math.abs(
                  (Math.floor(ghost.pos.x) + (a === "left" ? -1 : a === "right" ? 1 : 0)) - pacmanPos.x
                ) + Math.abs(
                  (Math.floor(ghost.pos.y) + (a === "up" ? -1 : a === "down" ? 1 : 0)) - pacmanPos.y
                );
                const distB = Math.abs(
                  (Math.floor(ghost.pos.x) + (b === "left" ? -1 : b === "right" ? 1 : 0)) - pacmanPos.x
                ) + Math.abs(
                  (Math.floor(ghost.pos.y) + (b === "up" ? -1 : b === "down" ? 1 : 0)) - pacmanPos.y
                );
                return distA - distB;
              });
            }
            dir = possibleDirs[0];
            // Alinhar ao grid
            newX = Math.floor(ghost.pos.x);
            newY = Math.floor(ghost.pos.y);
          }
        }

        const dx = dir === "left" ? -GHOST_SPEED / TILE_SIZE : dir === "right" ? GHOST_SPEED / TILE_SIZE : 0;
        const dy = dir === "up" ? -GHOST_SPEED / TILE_SIZE : dir === "down" ? GHOST_SPEED / TILE_SIZE : 0;

        const testX = newX + dx;
        const testY = newY + dy;

        // Verificar colisão ANTES de mover
        if (!canMove(testX, testY)) {
          return { ...ghost, pos: { x: newX, y: newY }, dir };
        }

        newX = testX;
        newY = testY;

        // Wraparound
        if (newX < 0) newX = MAZE[0].length - 1;
        if (newX >= MAZE[0].length) newX = 0;

        return { ...ghost, pos: { x: newX, y: newY }, dir };
      })
    );
  }, [pacmanPos, powerMode]);

  const checkCollisions = useCallback(() => {
    ghosts.forEach((ghost, index) => {
      if (ghost.eaten) return;
      
      const dist = Math.sqrt(
        Math.pow(ghost.pos.x - pacmanPos.x, 2) + Math.pow(ghost.pos.y - pacmanPos.y, 2)
      );
      
      if (dist < 0.5) {
        if (powerMode) {
          // Comer fantasma
          playSound("/effects/pac-man-waka-waka.mp3", wakaAudioRef);
          setGhosts((ghosts) => {
            const newGhosts = [...ghosts];
            newGhosts[index] = { ...ghost, eaten: true };
            return newGhosts;
          });
          setScore((s) => s + 200);
        } else {
          // Morrer
          playSound("/effects/8d82b5_pacman_dies_sound_effect.mp3", dieAudioRef);
          setLives((l) => {
            const newLives = l - 1;
            if (newLives <= 0) {
              setGameOver(true);
              setGameStarted(false);
            } else {
              // Resetar posições
              setPacmanPos({ x: 12, y: 15 });
              setGhosts([
                { pos: { x: 12, y: 9 }, dir: "left", color: "#FF0000", eaten: false },
                { pos: { x: 11, y: 9 }, dir: "right", color: "#FFB8FF", eaten: false },
                { pos: { x: 13, y: 9 }, dir: "up", color: "#00FFFF", eaten: false },
                { pos: { x: 12, y: 10 }, dir: "down", color: "#FFB851", eaten: false },
              ]);
              setPowerMode(false);
              if (powerTimer) {
                clearTimeout(powerTimer);
                setPowerTimer(null);
              }
            }
            return newLives;
          });
        }
      }
    });
  }, [ghosts, pacmanPos, powerMode, powerTimer]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar labirinto
    for (let y = 0; y < MAZE.length; y++) {
      for (let x = 0; x < MAZE[0].length; x++) {
        const tile = maze[y][x];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        if (tile === 1) {
          ctx.fillStyle = "#0000FF";
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        } else if (tile === 2) {
          ctx.fillStyle = "#FFFF00";
          ctx.beginPath();
          ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (tile === 3) {
          ctx.fillStyle = "#FFFF00";
          ctx.beginPath();
          ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Desenhar Pac-Man
    ctx.fillStyle = "#FFFF00";
    ctx.beginPath();
    const pacmanAngle = pacmanDir === "right" ? 0 : pacmanDir === "down" ? Math.PI / 2 : pacmanDir === "left" ? Math.PI : -Math.PI / 2;
    ctx.arc(
      pacmanPos.x * TILE_SIZE + TILE_SIZE / 2,
      pacmanPos.y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE / 2 - 2,
      pacmanAngle + 0.3,
      pacmanAngle + Math.PI * 2 - 0.3
    );
    ctx.lineTo(
      pacmanPos.x * TILE_SIZE + TILE_SIZE / 2,
      pacmanPos.y * TILE_SIZE + TILE_SIZE / 2
    );
    ctx.fill();

    // Desenhar fantasmas
    ghosts.forEach((ghost) => {
      if (ghost.eaten) return; // Não desenhar fantasmas comidos
      
      ctx.fillStyle = powerMode ? "#0000FF" : ghost.color;
      ctx.beginPath();
      ctx.arc(
        ghost.pos.x * TILE_SIZE + TILE_SIZE / 2,
        ghost.pos.y * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
  }, [maze, pacmanPos, pacmanDir, ghosts, powerMode]);

  const gameLoop = useCallback(
    (currentTime: number) => {
      if (!gameStarted || gameOver || gameWon) {
        lastTimeRef.current = currentTime;
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        return;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      if (deltaTime >= 16) {
        // ~60 FPS
        movePacman();
        moveGhosts();
        checkCollisions();
        draw();
        lastTimeRef.current = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    },
    [gameStarted, gameOver, gameWon, movePacman, moveGhosts, checkCollisions, draw]
  );

  useEffect(() => {
    if (gameStarted && !gameOver && !gameWon) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [gameStarted, gameOver, gameWon, gameLoop]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!gameStarted || gameOver || gameWon) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setNextDir("up");
          break;
        case "ArrowDown":
          e.preventDefault();
          setNextDir("down");
          break;
        case "ArrowLeft":
          e.preventDefault();
          setNextDir("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          setNextDir("right");
          break;
      }
    },
    [gameStarted, gameOver, gameWon]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    return () => {
      if (powerTimer) {
        clearTimeout(powerTimer);
      }
    };
  }, [powerTimer]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setGameWon(false);
    setScore(0);
    setLives(3);
    setPacmanPos({ x: 12, y: 15 });
    setMaze(MAZE.map(row => [...row]));
    setPowerMode(false);
    if (powerTimer) {
      clearTimeout(powerTimer);
      setPowerTimer(null);
    }
    setGhosts([
      { pos: { x: 12, y: 9 }, dir: "left", color: "#FF0000", eaten: false },
      { pos: { x: 11, y: 9 }, dir: "right", color: "#FFB8FF", eaten: false },
      { pos: { x: 13, y: 9 }, dir: "up", color: "#00FFFF", eaten: false },
      { pos: { x: 12, y: 10 }, dir: "down", color: "#FFB851", eaten: false },
    ]);
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
      className="pacman-window win98-resizable"
      style={style}
      role="dialog"
      aria-label="Pac-Man"
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
        className="win98-title-bar pacman-title-bar win98-title-bar-draggable"
        onPointerDown={handleTitlePointerDown}
        role="presentation"
      >
        <span className="win98-title-bar-text">Pac-Man</span>
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

      <div className="pacman-body">
        <div className="pacman-info">
          <div className="pacman-score">Pontuação: {score}</div>
          <div className="pacman-lives">Vidas: {lives}</div>
          {powerMode && <div className="pacman-power">PODER ATIVO!</div>}
          {!gameStarted && !gameOver && !gameWon && (
            <button className="pacman-start-btn" onClick={startGame}>
              Iniciar Jogo
            </button>
          )}
          {gameOver && (
            <div className="pacman-game-over">
              <div>Game Over!</div>
              <button className="pacman-start-btn" onClick={startGame}>
                Jogar Novamente
              </button>
            </div>
          )}
          {gameWon && (
            <div className="pacman-game-won">
              <div>Você Venceu!</div>
              <button className="pacman-start-btn" onClick={startGame}>
                Jogar Novamente
              </button>
            </div>
          )}
        </div>
        <canvas
          ref={canvasRef}
          className="pacman-canvas"
          width={MAZE[0].length * TILE_SIZE}
          height={MAZE.length * TILE_SIZE}
        />
        <div className="pacman-instructions">
          Use as setas do teclado para mover
        </div>
      </div>
    </div>
  );
}
