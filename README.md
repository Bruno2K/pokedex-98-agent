# Pokédex Agent

> Aplicação web interativa que simula um computador estilo **Windows 98** com uma Pokédex completa e assistente de chat com o **Professor Oak** powered by IA. Projeto de portfólio.

---

## Sobre o projeto

O **Pokédex Agent** combina nostalgia da interface Windows 98 com dados reais da [PokeAPI](https://pokeapi.co/) e conversação com personagem guiada por **Google Gemini**. O usuário navega em um desktop fictício, abre a Pokédex para consultar os 151 primeiros Pokémon, conversa com o Professor Oak em uma janela de “bate-papo por vídeo” e usa outros “programas” (calculadora, calendário, navegador simulado, etc.) integrados ao tema.

---

## Tecnologias utilizadas

| Área | Tecnologia |
|------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **UI** | [React 19](https://react.dev/) |
| **Linguagem** | [TypeScript](https://www.typescriptlang.org/) |
| **IA / Chat** | [Google Generative AI](https://ai.google.dev/) (Gemini) |
| **Dados Pokémon** | [PokeAPI](https://pokeapi.co/) (REST) |
| **Estilização** | CSS (tema visual Windows 98) |

- **Next.js**: SSR/SSG, API Routes, rotas dinâmicas e estáticas.
- **React**: componentes funcionais, hooks customizados, estado local.
- **Gemini**: chat com histórico (Professor Oak) e geração de “páginas” no navegador simulado.

---

## Funcionalidades

### Desktop e janelas
- **Desktop estilo Windows 98**: ícones, papel de parede e barra de tarefas.
- **Janelas arrastáveis e redimensionáveis**: hooks `useDragWindow` e `useResizeWindow`.
- **Barra de tarefas**: lista de janelas abertas, minimizar e trazer para frente.
- **Menu de contexto**: clique com botão direito no desktop.

### Pokédex
- **Listagem**: primeiros 151 Pokémon com imagem e tipos (página inicial).
- **Página de detalhes** por Pokémon (`/pokemon/[id]`): estatísticas, tipos, habilidades, movimentos e “role” (sweeper, tank, support, mixed).
- **Navegação**: anterior/próximo e link de volta; layout responsivo.

### Chat com o Professor Oak
- **Bate-papo por vídeo**: janela com avatar do Professor Oak.
- **Conversa com IA**: respostas via Google Gemini, mantendo personalidade e contexto.
- **Histórico**: mensagens persistidas durante a sessão e enviadas ao modelo.

### Navegador simulado
- **Janela “Internet”**: barra de endereço, botões voltar/avançar e som de dial-up.
- **Conteúdo gerado por IA**: Gemini gera texto da “página” a partir da URL (API Route `/api/browser`).

### Outros programas (mini-apps)
- **Calculadora**: operações básicas em janela Win98.
- **Calendário**: visualização mensal.
- **Visualizador de imagens**: abrir imagens (ex.: sprites) em janela.
- **Explorador** (Meus Documentos): estilo explorer do Windows.
- **Pac-Man**: minijogo em janela.

### Extras
- **Sons**: clique global, erro do Windows, dial-up ao “conectar” na internet, áudio da Pokédex.
- **Tela azul (BSOD)**: página de “erro” temática em `/bsod`.

---

## Como executar

### Pré-requisitos
- [Node.js](https://nodejs.org/) (LTS recomendado)
- Chave de API do [Google AI Studio](https://makersuite.google.com/app/apikey) (Gemini)

### Passos

1. **Clonar e instalar dependências**
   ```bash
   git clone <url-do-repositorio>
   cd pokedex-agent
   npm install
   ```

2. **Variáveis de ambiente**  
   Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   GEMINI_API_KEY=sua_chave_aqui
   ```

3. **Rodar em desenvolvimento**
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000).

4. **Build de produção**
   ```bash
   npm run build
   npm start
   ```

---

## Estrutura do projeto

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts    # POST: chat com Professor Oak (Gemini)
│   │   └── browser/route.ts # POST: “navegar” URL (conteúdo gerado por Gemini)
│   ├── pokemon/[id]/page.tsx  # Página de detalhe do Pokémon (SSG)
│   ├── bsod/page.tsx          # Tela azul (Easter egg)
│   ├── layout.tsx
│   └── page.tsx               # Lista de Pokémon (SSR)
├── components/
│   ├── Win98Desktop.tsx       # Desktop, ícones e orquestração de janelas
│   ├── Taskbar.tsx
│   ├── PokedexShell.tsx       # Moldura da Pokédex
│   ├── VideoChatWindow.tsx    # Janela do chat com Professor Oak
│   ├── BrowserWindow.tsx      # Navegador simulado
│   ├── CalculatorWindow.tsx, CalendarWindow.tsx, ...
│   └── pokemon/               # PokemonCard, TypeBadge, StatBar, etc.
├── hooks/
│   ├── useDragWindow.ts       # Arrastar janelas
│   ├── useResizeWindow.ts     # Redimensionar janelas
│   └── useSound.ts
└── lib/
    ├── pokeapi/               # client, normalize, types, moves, roles, typeChart
    ├── click-sound.ts
    ├── pokedex-sound.ts
    └── windows-error-sound.ts
```

---

## Destaques técnicos (para recrutadores)

- **Next.js App Router**: uso de Server Components na listagem e nas páginas de Pokémon, com `generateStaticParams` para os 151 IDs (SSG).
- **API Routes**: integração com Gemini (chat e “browser”), tratamento de histórico de mensagens e fallback de modelos.
- **Hooks reutilizáveis**: `useDragWindow` e `useResizeWindow` com TypeScript e refs tipados.
- **Tipagem forte**: tipos para respostas da PokeAPI, dados normalizados (PokemonBasic, PokemonDetail) e props de componentes.
- **Acessibilidade e UX**: uso de `role`, `aria-label` e feedback sonoro opcional.
- **Performance**: cache da PokeAPI (`force-cache`), carregamento sob demanda das janelas.

---

## Licença

Projeto de portfólio para fins de demonstração. Dados de Pokémon via [PokeAPI](https://pokeapi.co/); uso da API Google Gemini sujeito aos [termos do Google AI](https://ai.google.dev/terms).
