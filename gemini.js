// ============================================================================
// INÍCIO DA FUNÇÃO: perguntarIA
// Parâmetros: 'pergunta' (o texto digitado) e 'nivel' (Iniciante, Intermediário, Avançado)
// ============================================================================
async function perguntarIA(pergunta, nivel) {
    
    // --- BLCO 1: RECUPERAÇÃO DE HISTÓRICO ---
    // Busca o histórico específico da conversa atual armazenado na memória do navegador (window)
    const conversaAtual = window.conversas[window.chatAtual] || [];
    
    
    // --- BLOCO 2: FORMATAÇÃO PARA A API ---
    // Transforma o formato de mensagens do seu app no formato que o Gemini/API exige ("user" ou "model")
    const historicoFormatado = conversaAtual.map(msg => {
        return {
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
        };
    });


    // --- BLOCO 3: CONFIGURAÇÃO DO PROMPT DE SISTEMA ---
    // Cria a estrutura que define a personalidade da IA (Tutor de Inglês) e suas regras rígidas
    const conteudo = [
        {
            role: "user",
            parts: [{
                text: `
Você é um tutor de inglês para brasileiros.

Regras:
- Responda sempre em português.
- Seja amigável e motivador.
- Use emojis moderadamente.
- Organize bem a resposta.
- NÃO use Markdown, não use asteriscos ou hashtags quando responder.
- Sempre coloque a tradução em portugues.
- Coloque sempre a pronuncia em ingles, exemplo de formatação:

Em inglês: She'd lied to you, lied to me
Pronúncia: Xid láid tu iu, láid tu mi
Tradução: Ela mentiu para você, mentiu para mim

Adapte ao nível do aluno:

Iniciante:
- frases simples
- vocabulário básico

Intermediário:
- frases médias
- mais vocabulário

Avançado:
- frases naturais

Nível: ${nivel}
`
            }]
        },
        // Insere todo o histórico de mensagens anteriores logo após as regras do tutor
        ...historicoFormatado
    ];


    // --- BLOCO 4: ADIÇÃO DA PERGUNTA ATUAL ---
    // Insere a última pergunta que o usuário acabou de fazer no final da estrutura
    conteudo.push({
        role: "user",
        parts: [{ text: `Nível: ${nivel}\nPergunta: ${pergunta}` }]
    });


    // --- BLOCO 5: COMUNICAÇÃO COM O SERVIDOR (API HTTP POST) ---
    // Faz a requisição web enviando todos os dados estruturados em formato JSON
    const resposta = await fetch(
        "https://english-ai-tutor-i0tv.onrender.com/perguntar",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conteudo })
        }
    );


    // --- BLOCO 6: TRATAMENTO DA RESPOSTA E ERROS ---
    // Transforma a resposta bruta do servidor em um objeto JavaScript utilizável
    const dados = await resposta.json();

    // Se o servidor retornar algum erro (status diferente de 200), interrompe e avisa o app
    if (!resposta.ok) {
        throw new Error(dados.erro || "Erro no servidor");
    }


    // --- BLOCO 7: RETORNO DOS DADOS (FIM DA FUNÇÃO) ---
    // Entrega apenas o texto final da resposta da IA para quem chamou a função
    return dados.resposta;
}
// ============================================================================
// FIM DA FUNÇÃO: perguntarIA
// ============================================================================


// ============================================================================
// FLUXOGRAMA DE EXECUÇÃO DA FUNÇÃO: perguntarIA
// ============================================================================
/*
  [ Entrada: Pergunta + Nível ]
                │
                ▼
  [ Busca histórico no sistema ] ──► [ Formata no padrão da IA ]
                                                  │
                                                  ▼
  [ Injeta o Prompt do Tutor ] ◄──────────────────┘
                │
                ▼
  [ Envia para o Render (Servidor) ]
                │
                ▼
      [ Verificação de Erro ]
         /               \
   (Sim) /               \ (Não)
        ▼                 ▼
 [ Lança Erro ]     [ Retorna Texto da IA ]
*/