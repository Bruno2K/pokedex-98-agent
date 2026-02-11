import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const PROFESSOR_OAK_SYSTEM_PROMPT = `Você é o Professor Oak, um pesquisador Pokémon experiente e amigável do mundo Pokémon. Você é conhecido por sua sabedoria, paixão pela pesquisa Pokémon e por ajudar treinadores iniciantes.

Características do Professor Oak:
- Você é gentil, paciente e encorajador
- Você adora compartilhar conhecimento sobre Pokémon
- Você fala de forma amigável e acessível, mas com autoridade científica
- Você costuma fazer perguntas sobre os Pokémon favoritos do treinador
- Você oferece dicas e conselhos sobre treinamento Pokémon
- Você pode mencionar sua pesquisa e descobertas
- Você mantém um tom positivo e entusiasmado sobre Pokémon

Responda sempre como o Professor Oak, mantendo o personagem consistente. Seja conciso mas amigável nas respostas.`;

async function getAvailableModel() {
  const apiKey = process.env.GEMINI_API_KEY || "";
  
  // Tentar listar modelos via API REST diretamente
  let availableModels: string[] = [];
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    if (response.ok) {
      const data = await response.json();
      availableModels = (data.models || [])
        .map((m: any) => m.name?.replace("models/", "") || "")
        .filter((name: string) => name && name.includes("gemini"));
      console.log("Modelos disponíveis na API:", availableModels);
    } else {
      const errorText = await response.text();
      console.log("Erro ao listar modelos:", response.status, errorText.substring(0, 200));
    }
  } catch (e) {
    console.log("Erro ao listar modelos via REST:", e);
  }
  
  // Tentar diferentes modelos em ordem de preferência
  const modelNames = [
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest", 
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
    "models/gemini-1.5-flash-latest",
    "models/gemini-1.5-pro-latest",
    "models/gemini-1.5-flash",
    "models/gemini-1.5-pro",
    "models/gemini-pro",
  ];
  
  // Se temos lista de modelos disponíveis, filtrar apenas os disponíveis
  const modelsToTry = availableModels.length > 0
    ? modelNames.filter(name => {
        const cleanName = name.replace("models/", "");
        return availableModels.includes(cleanName);
      }).concat(availableModels.slice(0, 3)) // Adicionar primeiros 3 disponíveis
    : modelNames;
  
  console.log("Modelos que serão testados:", modelsToTry);
  
  // Tentar cada modelo
  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      // Testar se o modelo realmente funciona fazendo uma chamada simples
      console.log(`✓ Modelo ${modelName} inicializado com sucesso`);
      return model;
    } catch (e: any) {
      const errorMsg = e?.message?.substring(0, 150) || "erro desconhecido";
      console.log(`✗ Modelo ${modelName} falhou: ${errorMsg}`);
      continue;
    }
  }
  
  // Se nenhum funcionou, tentar usar qualquer modelo da lista disponível
  if (availableModels.length > 0) {
    for (const modelName of availableModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        console.log(`Usando modelo disponível: ${modelName}`);
        return model;
      } catch (e) {
        continue;
      }
    }
  }
  
  throw new Error(`Nenhum modelo disponível. Modelos tentados: ${modelsToTry.join(", ")}. Verifique sua API key e região.`);
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Mensagem é obrigatória" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada. Por favor, configure a variável de ambiente GEMINI_API_KEY no arquivo .env.local" },
        { status: 500 }
      );
    }

    // Obter modelo disponível
    const model = await getAvailableModel();

    // Construir histórico de conversa
    const chatHistory = history || [];
    
    // Preparar histórico para o Gemini, garantindo que sempre comece com "user"
    let geminiHistory = chatHistory
      .filter((msg: { role: string; content: string }) => msg.content && msg.content.trim())
      .map((msg: { role: string; content: string }) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

    // CRÍTICO: Garantir que o histórico sempre comece com "user"
    // Se começar com "model", remover todas as mensagens iniciais do modelo até encontrar um "user"
    while (geminiHistory.length > 0 && geminiHistory[0].role === "model") {
      geminiHistory = geminiHistory.slice(1);
    }

    // Debug: log do histórico preparado
    if (process.env.NODE_ENV === "development") {
      console.log("Histórico preparado:", JSON.stringify(geminiHistory.map(h => ({ role: h.role, preview: h.parts[0]?.text?.substring(0, 50) })), null, 2));
    }

    // Se após remover mensagens do modelo não sobrar nada, ou se o histórico estiver vazio
    // inicializar com o prompt do sistema
    let chat;
    if (geminiHistory.length === 0) {
      // Primeira conversa - incluir o prompt do sistema
      chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: `${PROFESSOR_OAK_SYSTEM_PROMPT}\n\nOlá!` }],
          },
          {
            role: "model",
            parts: [{ text: "Olá! Sou o Professor Oak. É um prazer conhecê-lo! Como posso ajudá-lo hoje com seus Pokémon?" }],
          },
        ],
      });
    } else {
      // Verificar novamente se começa com "user" (deve estar garantido pelo while acima)
      if (geminiHistory[0].role !== "user") {
        // Se ainda assim não começar com user, forçar inicialização
        chat = model.startChat({
          history: [
            {
              role: "user",
              parts: [{ text: `${PROFESSOR_OAK_SYSTEM_PROMPT}\n\nOlá!` }],
            },
            {
              role: "model",
              parts: [{ text: "Olá! Sou o Professor Oak. Como posso ajudá-lo?" }],
            },
            ...geminiHistory,
          ],
        });
      } else {
        // Histórico válido, usar diretamente
        chat = model.startChat({
          history: geminiHistory,
        });
      }
    }

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Resposta vazia do Gemini");
    }

    return NextResponse.json({ message: text });
  } catch (error: any) {
    console.error("Erro ao comunicar com Gemini:", error);
    
    // Retornar mensagem de erro mais detalhada
    const errorMessage = error?.message || "Erro desconhecido";
    const errorCode = error?.code || error?.status || "UNKNOWN";
    
    // Mensagens de erro mais amigáveis
    let userFriendlyMessage = "Erro ao processar mensagem";
    
    if (errorMessage.includes("API_KEY") || errorMessage.includes("API key")) {
      userFriendlyMessage = "API Key do Gemini não configurada ou inválida. Verifique o arquivo .env.local";
    } else if (errorMessage.includes("quota") || errorMessage.includes("rate limit") || errorMessage.includes("429")) {
      userFriendlyMessage = "Limite de requisições excedido. Tente novamente mais tarde.";
    } else if (errorMessage.includes("model") || errorMessage.includes("404") || errorMessage.includes("Nenhum modelo")) {
      userFriendlyMessage = "Modelo do Gemini não disponível. Verifique sua API key e região. Verifique o console do servidor para ver quais modelos estão disponíveis.";
    } else if (errorMessage.includes("403") || errorMessage.includes("permission")) {
      userFriendlyMessage = "Permissão negada. Verifique se sua API key tem acesso ao Gemini.";
    }
    
    return NextResponse.json(
      { 
        error: userFriendlyMessage,
        details: errorMessage,
        code: errorCode,
        ...(process.env.NODE_ENV === "development" && { 
          stack: error?.stack,
        })
      },
      { status: 500 }
    );
  }
}
