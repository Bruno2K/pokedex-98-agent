export type WindowId = "pokedex" | "calculator" | "calendar" | "video";

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowState {
  id: WindowId;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: WindowPosition | null;
  size: WindowSize | null;
  zIndex: number;
}

export interface WindowConfig {
  id: WindowId;
  title: string;
  initialSize?: WindowSize;
  minSize?: WindowSize;
  maxSize?: WindowSize;
  resizable?: boolean;
  draggable?: boolean;
}

export type WindowAction = 
  | { type: "OPEN"; windowId: WindowId; position?: WindowPosition }
  | { type: "CLOSE"; windowId: WindowId }
  | { type: "MINIMIZE"; windowId: WindowId }
  | { type: "MAXIMIZE"; windowId: WindowId }
  | { type: "FOCUS"; windowId: WindowId }
  | { type: "SET_POSITION"; windowId: WindowId; position: WindowPosition }
  | { type: "SET_SIZE"; windowId: WindowId; size: WindowSize };
