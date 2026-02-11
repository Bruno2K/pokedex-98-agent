# Arquitetura Recomendada - Pokédex Agent

## 📁 Estrutura de Pastas Proposta

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Layout raiz
│   ├── page.tsx                 # Página inicial
│   ├── pokemon/
│   │   └── [id]/
│   │       └── page.tsx         # Página de detalhes do Pokémon
│   └── globals.css              # Estilos globais
│
├── components/                   # Componentes React
│   ├── desktop/                 # Componentes do desktop
│   │   ├── Win98Desktop.tsx
│   │   ├── DesktopIcon.tsx      # Ícone do desktop (extrair)
│   │   └── DesktopIcons.tsx     # Lista de ícones (extrair)
│   │
│   ├── windows/                 # Componentes de janelas
│   │   ├── base/
│   │   │   ├── WindowFrame.tsx  # Frame base reutilizável
│   │   │   └── WindowTitleBar.tsx
│   │   ├── CalculatorWindow.tsx
│   │   ├── CalendarWindow.tsx
│   │   ├── VideoChatWindow.tsx
│   │   └── PokedexShell.tsx
│   │
│   ├── pokemon/                 # Componentes relacionados a Pokémon
│   │   ├── PokemonCard.tsx
│   │   ├── PokemonListClient.tsx
│   │   ├── StatBar.tsx
│   │   └── TypeBadge.tsx
│   │
│   ├── ui/                      # Componentes UI genéricos
│   │   ├── Button8bit.tsx
│   │   ├── Taskbar.tsx
│   │   └── ResizeHandles.tsx    # Extrair handles de resize
│   │
│   └── shared/                  # Componentes compartilhados
│       └── Image.tsx            # Wrapper para Next Image se necessário
│
├── hooks/                       # Custom hooks
│   ├── window/
│   │   ├── useDragWindow.ts
│   │   ├── useResizeWindow.ts
│   │   └── useWindowManager.ts  # Hook para gerenciar múltiplas janelas
│   ├── pokemon/
│   │   └── usePokemon.ts        # Hook para dados de Pokémon
│   └── desktop/
│       └── useDesktopIcons.ts   # Hook para ícones do desktop
│
├── store/                       # Gerenciamento de estado (opcional)
│   ├── windowStore.ts           # Estado das janelas
│   └── desktopStore.ts          # Estado do desktop
│
├── lib/                         # Bibliotecas e utilitários
│   ├── pokeapi/                 # Cliente da API Pokémon
│   │   ├── client.ts
│   │   ├── types.ts
│   │   ├── normalize.ts
│   │   └── ...
│   ├── utils/                   # Funções utilitárias
│   │   ├── date.ts              # Utilitários de data
│   │   ├── calculator.ts        # Lógica da calculadora
│   │   └── constants.ts         # Constantes do projeto
│   └── types/                   # Types compartilhados
│       ├── window.ts
│       └── desktop.ts
│
├── assets/                      # Assets estáticos
│   ├── images/
│   │   ├── icons/               # Ícones
│   │   └── pokemon/             # Imagens de Pokémon
│   └── fonts/                   # Fontes customizadas
│
└── styles/                      # Estilos organizados
    ├── globals.css
    ├── components/
    │   ├── desktop.css
    │   ├── windows.css
    │   └── pokemon.css
    └── themes/
        └── win98.css            # Tema Windows 98
```

## 🏗️ Princípios Arquiteturais

### 1. **Separação de Responsabilidades**
- **Desktop**: Gerencia o ambiente desktop e ícones
- **Windows**: Componentes de janelas individuais
- **Pokemon**: Lógica específica de Pokémon
- **UI**: Componentes reutilizáveis genéricos

### 2. **Componentização**
- Extrair componentes menores e reutilizáveis
- Criar um `WindowFrame` base para todas as janelas
- Separar lógica de apresentação

### 3. **Gerenciamento de Estado**

#### Opção A: Context API (Recomendado para este projeto)
```typescript
// store/WindowContext.tsx
export const WindowContext = createContext<WindowContextType>();

// Uso em componentes
const { windows, openWindow, closeWindow } = useWindowContext();
```

#### Opção B: Zustand (Se precisar de mais controle)
```typescript
// store/windowStore.ts
import { create } from 'zustand';

export const useWindowStore = create((set) => ({
  windows: [],
  openWindow: (id) => set(...),
  closeWindow: (id) => set(...),
}));
```

### 4. **Hooks Customizados**
- `useWindowManager`: Gerencia estado de múltiplas janelas
- `useDesktopIcons`: Configuração e lógica dos ícones
- `usePokemon`: Fetch e cache de dados de Pokémon

## 🔄 Refatorações Recomendadas

### 1. **Extrair WindowFrame Base**
```typescript
// components/windows/base/WindowFrame.tsx
export function WindowFrame({
  title,
  icon,
  children,
  onClose,
  onMinimize,
  onFocus,
  zIndex,
  isMinimized,
  resizable = true,
}) {
  // Lógica comum de drag, resize, etc.
}
```

### 2. **Criar Window Manager**
```typescript
// hooks/window/useWindowManager.ts
export function useWindowManager() {
  const [windows, setWindows] = useState<Window[]>([]);
  
  const openWindow = (id: string, config: WindowConfig) => {...};
  const closeWindow = (id: string) => {...};
  const minimizeWindow = (id: string) => {...};
  const focusWindow = (id: string) => {...};
  
  return { windows, openWindow, closeWindow, ... };
}
```

### 3. **Separar Configuração de Ícones**
```typescript
// lib/utils/desktopIcons.ts
export const DESKTOP_ICONS_CONFIG = [
  {
    id: "pokedex",
    label: "Pokédex",
    icon: pokedexIcon,
    position: { x: "24px", y: "24px" },
    action: () => openWindow("pokedex"),
  },
  // ...
] as const;
```

### 4. **Extrair Lógica da Calculadora**
```typescript
// lib/utils/calculator.ts
export class Calculator {
  private state: CalculatorState;
  
  inputNumber(num: string): void {...}
  inputOperation(op: string): void {...}
  calculate(): number {...}
  clear(): void {...}
}

// Uso no componente
const calculator = useMemo(() => new Calculator(), []);
```

## 📦 Dependências Recomendadas

### Essenciais
- ✅ Next.js 16+ (já está)
- ✅ React 19+ (já está)
- ✅ TypeScript (já está)

### Opcionais (conforme necessidade)
- `zustand` - Gerenciamento de estado leve
- `react-query` ou `swr` - Cache e fetch de dados
- `clsx` ou `classnames` - Manipulação de classes CSS
- `date-fns` - Manipulação de datas (para calendário)

## 🎨 Organização de Estilos

### Estratégia: CSS Modules ou Styled Components
```typescript
// styles/components/windows.module.css
.window {
  /* estilos base */
}

.titleBar {
  /* estilos da barra de título */
}
```

Ou manter globals.css mas organizado por seções:
```css
/* ============================================
   DESKTOP
   ============================================ */

/* ============================================
   WINDOWS
   ============================================ */

/* ============================================
   POKEMON
   ============================================ */
```

## 🔐 Type Safety

### Criar tipos compartilhados
```typescript
// lib/types/window.ts
export type WindowId = "pokedex" | "calculator" | "calendar" | "video";

export interface WindowConfig {
  id: WindowId;
  title: string;
  component: React.ComponentType;
  initialSize?: { width: number; height: number };
  minSize?: { width: number; height: number };
}

// lib/types/desktop.ts
export interface DesktopIcon {
  id: string;
  label: string;
  icon: StaticImageData;
  position: { x: string; y: string };
  action?: () => void;
}
```

## 🚀 Próximos Passos

1. **Fase 1: Organização**
   - Criar estrutura de pastas proposta
   - Mover arquivos para locais apropriados

2. **Fase 2: Refatoração**
   - Extrair WindowFrame base
   - Criar useWindowManager
   - Separar configurações

3. **Fase 3: Melhorias**
   - Adicionar Context API ou Zustand
   - Implementar cache de dados
   - Otimizar performance

4. **Fase 4: Testes**
   - Adicionar testes unitários
   - Testes de integração
   - E2E tests (opcional)

## 📝 Convenções de Código

- **Componentes**: PascalCase (`CalculatorWindow.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useWindowManager.ts`)
- **Utils**: camelCase (`calculate.ts`)
- **Types**: PascalCase (`WindowConfig.ts`)
- **Constantes**: UPPER_SNAKE_CASE (`DESKTOP_ICONS`)

## 🎯 Benefícios desta Arquitetura

1. **Manutenibilidade**: Código organizado e fácil de encontrar
2. **Escalabilidade**: Fácil adicionar novas janelas/features
3. **Reutilização**: Componentes e hooks compartilhados
4. **Testabilidade**: Lógica separada facilita testes
5. **Performance**: Melhor code splitting e lazy loading
6. **Type Safety**: TypeScript bem estruturado
