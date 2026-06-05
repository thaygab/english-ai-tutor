async function perguntarIA(pergunta, nivel) {
    // Busca o histórico específico da conversa atual para enviar à IA
    const conversaAtual = window.conversas[window.chatAtual] || [];
    
    // Mapeia o histórico do script.js para o formato que a sua API (Gemini) espera
    const historicoFormatado = conversaAtual.map(msg => {
        return {
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
        };
    });

    // O SEU PROMPT EXATAMENTE COMO ESTAVA ANTES:
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
- NÃO use Markdown, asteriscos ou hashtags.
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
        ...historicoFormatado
    ];

    // Adiciona a pergunta atual ao final do histórico antes de enviar
    conteudo.push({
        role: "user",
        parts: [{ text: `Nível: ${nivel}\nPergunta: ${pergunta}` }]
    });

    const resposta = await fetch(
        "https://english-ai-tutor-i0tv.onrender.com/perguntar",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conteudo })
        }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(dados.erro || "Erro no servidor");
    }

    return dados.resposta;
}
