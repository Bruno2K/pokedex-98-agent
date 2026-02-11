import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function getAvailableModel() {
  const apiKey = process.env.GEMINI_API_KEY || "";
  
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
    }
  } catch (e) {
    // Ignore errors
  }
  
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
  
  const modelsToTry = availableModels.length > 0
    ? modelNames.filter(name => {
        const cleanName = name.replace("models/", "");
        return availableModels.includes(cleanName);
      }).concat(availableModels.slice(0, 3))
    : modelNames;
  
  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      return model;
    } catch (e) {
      continue;
    }
  }
  
  if (availableModels.length > 0) {
    for (const modelName of availableModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        return model;
      } catch (e) {
        continue;
      }
    }
  }
  
  throw new Error(`Nenhum modelo disponível`);
}

const BROWSER_SYSTEM_PROMPT = `Você é um gerador de páginas HTML fake que imita sites reais da internet dos anos 90/2000, especialmente o Google.

Quando receber uma URL, você deve gerar uma página HTML completa e funcional que imite o site solicitado, mas com estilo dos anos 90/2000.

Regras importantes:
1. SEMPRE retorne APENAS HTML válido, sem markdown, sem explicações, sem código adicional
2. Use estilos inline ou tags <style> dentro do HTML
3. Imite o visual clássico do Google dos anos 90/2000: fundo branco, logo colorido, barra de pesquisa centralizada
4. Se for Google, inclua um logo "Google" grande e colorido, uma barra de pesquisa centralizada dentro de um <form>, e botões "Google Search" e "I'm Feeling Lucky"
5. O formulário de pesquisa DEVE ter: <form action="http://www.google.com/search" method="get"> com um campo <input type="text" name="q" /> e botões de submit
6. Use cores vibrantes e design simples típico dos anos 90/2000
7. Inclua elementos típicos da época: tabelas para layout, fontes serifadas, links azuis sublinhados
8. Se for outro site, adapte o estilo mas mantenha a estética dos anos 90/2000
9. O HTML deve ser completo e autocontido (incluir <!DOCTYPE html>, <html>, <head>, <body>)
10. Mantenha o conteúdo em português brasileiro
11. Links devem ter href válidos (mesmo que sejam fake)
12. Formulários devem ter action e method definidos

Exemplo de estrutura para Google:
- Logo Google grande e colorido no topo
- Formulário com barra de pesquisa centralizada (input name="q") e botões de submit
- Links simples no rodapé
- Design limpo e minimalista estilo anos 90

Retorne APENAS o HTML, sem nenhum texto adicional antes ou depois.`;

// Função para injetar JavaScript que intercepta eventos no iframe
function injectBrowserInterception(html: string): string {
  const interceptionScript = `
<script>
(function() {
  // Aguardar DOM carregar
  function init() {
    // Interceptar todos os cliques em links
    document.addEventListener('click', function(e) {
      const target = e.target.closest('a');
      if (target && target.href && !target.href.startsWith('javascript:')) {
        e.preventDefault();
        e.stopPropagation();
        
        // Enviar mensagem para o parent (React component)
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'browser-navigate',
            url: target.href,
            text: target.textContent || ''
          }, '*');
        }
      }
    }, true);

    // Interceptar submissão de formulários
    document.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const form = e.target;
      if (!form || form.tagName !== 'FORM') return;
      
      const formData = new FormData(form);
      const query = formData.get('q') || formData.get('query') || formData.get('search') || formData.get('text') || '';
      const action = form.action || form.getAttribute('action') || window.location.href;
      
      // Enviar mensagem para o parent
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'browser-search',
          url: action,
          query: query.toString().trim()
        }, '*');
      }
    }, true);

    // Interceptar cliques em botões de submit dentro de formulários
    document.addEventListener('click', function(e) {
      const target = e.target;
      if (target && (target.type === 'submit' || target.getAttribute('type') === 'submit' || target.tagName === 'BUTTON')) {
        const form = target.closest('form');
        if (form) {
          // Prevenir comportamento padrão e disparar submit manualmente
          e.preventDefault();
          e.stopPropagation();
          
          const formData = new FormData(form);
          const query = formData.get('q') || formData.get('query') || formData.get('search') || formData.get('text') || '';
          const action = form.action || form.getAttribute('action') || window.location.href;
          
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({
              type: 'browser-search',
              url: action,
              query: query.toString().trim()
            }, '*');
          }
        }
      }
    }, true);

    // Interceptar Enter no campo de pesquisa
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        const target = e.target;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
          const form = target.closest('form');
          if (form) {
            e.preventDefault();
            e.stopPropagation();
            
            const formData = new FormData(form);
            const query = formData.get('q') || formData.get('query') || formData.get('search') || formData.get('text') || target.value || '';
            const action = form.action || form.getAttribute('action') || window.location.href;
            
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({
                type: 'browser-search',
                url: action,
                query: query.toString().trim()
              }, '*');
            }
          }
        }
      }
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>`;

  // Injetar o script antes do fechamento do </body> ou no final do HTML
  if (html.includes('</body>')) {
    html = html.replace('</body>', interceptionScript + '</body>');
  } else if (html.includes('</html>')) {
    html = html.replace('</html>', interceptionScript + '</html>');
  } else {
    html = html + interceptionScript;
  }

  return html;
}

export async function POST(request: NextRequest) {
  try {
    const { url, query, articleTitle } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL é obrigatória" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada" },
        { status: 500 }
      );
    }

    const model = await getAvailableModel();

    // Determinar qual site está sendo solicitado
    const isGoogle = url.includes("google.com") || url.includes("google");
    const siteName = isGoogle ? "Google" : new URL(url).hostname;

    // Se há um título de artigo, gerar página de artigo
    if (articleTitle && typeof articleTitle === "string" && articleTitle.trim()) {
      const articlePrompt = `Você é um gerador de páginas HTML fake que imita artigos de sites dos anos 90/2000.

Gere uma página HTML completa de um ARTIGO/MATÉRIA estilo anos 90/2000 sobre "${articleTitle}".

Regras importantes:
1. SEMPRE retorne APENAS HTML válido, sem markdown, sem explicações, sem código adicional
2. Use estilos inline ou tags <style> dentro do HTML
3. O HTML deve ser completo e autocontido (incluir <!DOCTYPE html>, <html>, <head>, <body>)
4. Mantenha o conteúdo em português brasileiro

A página deve incluir:
- Título principal grande e destacado no topo (h1)
- Cabeçalho com data de publicação fake (ex: "Publicado em 15 de março de 1998")
- Autor fake (ex: "Por João Silva" ou "Redação")
- Conteúdo do artigo completo e detalhado (4-7 parágrafos) sobre o tema "${articleTitle}"
- Estilo de jornal/blog dos anos 90/2000: fonte serifada (Times New Roman, Georgia), texto justificado
- Layout simples com largura fixa centralizada (max-width: 800px, margin: 0 auto)
- Cores típicas: texto preto, fundo branco ou bege claro
- Links relacionados no final (opcional, estilo anos 90)
- Design limpo e simples estilo anos 90/2000
- O conteúdo deve ser informativo, interessante e detalhado sobre o tema, mas claramente fake/imaginário
- Use tags HTML semânticas: <h1>, <h2>, <p>, <strong>, <em>, etc.
- Inclua alguns subtítulos (h2) para organizar o conteúdo

Exemplo de estrutura:
- Cabeçalho com título, data e autor
- Introdução (1 parágrafo)
- Desenvolvimento (3-5 parágrafos com subtítulos)
- Conclusão (1 parágrafo)
- Links relacionados (opcional)

Retorne APENAS o HTML, sem nenhum texto adicional antes ou depois.`;

      const result = await model.generateContent(articlePrompt);
      const response = await result.response;
      let html = response.text();
      
      // Limpar possíveis markdown ou explicações extras
      html = html.trim();
      
      // Remover markdown code blocks se existirem
      if (html.startsWith("```html")) {
        html = html.replace(/^```html\n?/, "").replace(/\n?```$/, "");
      } else if (html.startsWith("```")) {
        html = html.replace(/^```\n?/, "").replace(/\n?```$/, "");
      }

      // Garantir que começa com <!DOCTYPE ou <html
      if (!html.includes("<!DOCTYPE") && !html.includes("<html")) {
        html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${articleTitle}</title>
  <style>
    body { font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #fefefe; line-height: 1.6; }
    h1 { color: #000; font-size: 28px; margin-bottom: 10px; }
    h2 { color: #333; font-size: 20px; margin-top: 20px; margin-bottom: 10px; }
    p { text-align: justify; margin-bottom: 15px; }
    .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
      }
      
      // Injetar JavaScript para interceptar cliques e formulários
      html = injectBrowserInterception(html);
      
      return NextResponse.json({ html });
    }

    // Se há uma query, gerar página de resultados de pesquisa
    if (query && typeof query === "string" && query.trim()) {
      const searchPrompt = `${BROWSER_SYSTEM_PROMPT}

URL solicitada: ${url}
Site: ${siteName}
Query de pesquisa: ${query}

Gere uma página HTML completa de RESULTADOS DE PESQUISA do Google estilo anos 90/2000 com os resultados para "${query}".

A página deve incluir:
- Logo Google no topo
- Formulário de pesquisa com o campo de input PREENCHIDO com "${query}" (value="${query}")
- Barra de pesquisa deve estar dentro de um <form action="http://www.google.com/search" method="get"> com <input type="text" name="q" value="${query}" />
- Botões "Google Search" e "I'm Feeling Lucky"
- Mostrar algo como "Cerca de 1.234 resultados (0,45 segundos)" no topo dos resultados
- Lista de resultados de pesquisa fake (5-10 resultados) com:
  * Cada resultado deve ter um título clicável como link <a href="http://exemplo.com/artigo">Título do Resultado</a>
  * URL do resultado abaixo do título (ex: "http://exemplo.com/artigo")
  * Descrição curta (1-2 linhas) sobre o conteúdo
  * Os links devem ter URLs diferentes e criativas (ex: http://noticias1998.com/artigo, http://info.com.br/materia)
  * Os títulos devem ser relevantes à query "${query}" mas claramente fake/imaginários
  * Cada resultado deve estar em uma div ou parágrafo separado
- Design simples estilo anos 90/2000
- Resultados devem ser relevantes à query mas claramente fake/imaginários

Retorne APENAS o HTML, sem markdown, sem explicações.`;

      const result = await model.generateContent(searchPrompt);
      const response = await result.response;
      let html = response.text();
      
      // Injetar JavaScript para interceptar cliques e formulários
      html = injectBrowserInterception(html);
      
      return NextResponse.json({ html });
    }

    const prompt = `${BROWSER_SYSTEM_PROMPT}

URL solicitada: ${url}
Site: ${siteName}

Gere uma página HTML completa imitando ${siteName} com estilo dos anos 90/2000. Retorne APENAS o HTML, sem markdown, sem explicações.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let html = response.text();

    // Limpar possíveis markdown ou explicações extras
    html = html.trim();
    
    // Remover markdown code blocks se existirem
    if (html.startsWith("```html")) {
      html = html.replace(/^```html\n?/, "").replace(/\n?```$/, "");
    } else if (html.startsWith("```")) {
      html = html.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }

    // Garantir que começa com <!DOCTYPE ou <html
    if (!html.includes("<!DOCTYPE") && !html.includes("<html")) {
      // Se não tem estrutura HTML completa, criar uma básica
      html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${siteName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: white; }
    h1 { color: #4285f4; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
    }

    // Injetar JavaScript para interceptar cliques e formulários
    html = injectBrowserInterception(html);

    return NextResponse.json({ html });
  } catch (error: any) {
    console.error("Erro ao gerar página HTML:", error);
    
    const errorMessage = error?.message || "Erro desconhecido";
    
    // Retornar uma página de erro HTML
    const errorHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Erro</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; background: #f0f0f0; text-align: center; }
    h1 { color: #d32f2f; }
    p { color: #666; }
  </style>
</head>
<body>
  <h1>Erro ao carregar página</h1>
  <p>Não foi possível gerar o conteúdo solicitado.</p>
  <p style="font-size: 12px; color: #999;">${errorMessage}</p>
</body>
</html>`;

    return NextResponse.json({ html: errorHtml });
  }
}
