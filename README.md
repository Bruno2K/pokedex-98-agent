# Pokédex Agent

Uma aplicação web estilo Windows 98 com Pokédex interativa e chat com o Professor Oak usando IA.

## Funcionalidades

- Pokédex interativa com informações de Pokémon
- Chat com o Professor Oak usando Google Gemini AI
- Interface estilo Windows 98
- Visualizador de imagens
- Calculadora e calendário

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar API Key do Google Gemini

1. Obtenha sua API Key em: https://makersuite.google.com/app/apikey
2. Crie um arquivo `.env.local` na raiz do projeto
3. Adicione a seguinte linha:

```
GEMINI_API_KEY=sua_chave_aqui
```

### 3. Executar o projeto

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Estrutura do Projeto

- `src/app/` - Rotas e páginas do Next.js
- `src/components/` - Componentes React
- `src/lib/` - Utilitários e clientes de API
- `src/hooks/` - Hooks customizados
- `public/` - Arquivos estáticos

## Chat com Professor Oak

O chat utiliza a API do Google Gemini para simular conversas com o Professor Oak. O sistema está configurado para manter o personagem consistente, respondendo como um pesquisador Pokémon experiente e amigável.
