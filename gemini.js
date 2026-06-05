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

    // Monta o prompt do sistema combinado com a pergunta atual
    const conteudo = [
        {
            role: "user",
            parts: [{
                text: `Você é um tutor de inglês para brasileiros.\n\nRegras:\n- Responda em português\n- Seja didático e amigável\n- Inclua pronúncia\n\nNível atual do aluno: ${nivel}`
            }]
        },
        ...historicoFormatado,
        {
            role: "user",
            parts: [{ text: `Nível: ${nivel}\nPergunta: ${pergunta}` }]
        }
    ];

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
