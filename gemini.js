window.historico =
    JSON.parse(localStorage.getItem("historico")) || [];

async function perguntarIA(pergunta, nivel) {

    // adiciona pergunta do usuário no histórico
    window.historico.push({
        role: "user",
        parts: [
            {
                text: `Nível: ${nivel}\nPergunta: ${pergunta}`
            }
        ]
    });

    localStorage.setItem(
        "historico",
        JSON.stringify(window.historico)
    );

    // prompt base + histórico
    const conteudo = [
        {
            role: "user",
            parts: [
                {
                    text: `
Você é um tutor de inglês para brasileiros.

Regras:
- Responda sempre em português.
- Seja amigável e motivador.
- Use emojis moderadamente.
- Organize bem a resposta.
- NÃO use Markdown, asteriscos ou hashtags.
- Sempre inclua pronúncia em inglês.

Exemplo:
Em inglês: She'd lied to you
Pronúncia: Xid láid tu iu
Tradução: Ela mentiu para você

Nível atual do aluno: ${nivel}
`
                }
            ]
        },
        ...window.historico
    ];

    // chamada API (CORRETO - sem duplicação de body)
    const resposta = await fetch(
        "https://english-ai-tutor-i0tv.onrender.com/perguntar",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                conteudo
            })
        }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(dados.erro || "Erro no servidor");
    }

    const textoResposta = dados.resposta;

    // adiciona resposta da IA no histórico
    window.historico.push({
        role: "model",
        parts: [
            {
                text: textoResposta
            }
        ]
    });

    localStorage.setItem(
        "historico",
        JSON.stringify(window.historico)
    );

    return textoResposta;
}

// função global para o botão funcionar
window.limparConversa = function () {
    window.historico = [];
    localStorage.removeItem("historico");
    localStorage.removeItem("chatHTML");

    const chat = document.getElementById("chat");

    if (chat) {
        chat.innerHTML = `
            <div class="mensagem tutor">
                👋 Nova conversa iniciada!
            </div>
        `;
    }
};

