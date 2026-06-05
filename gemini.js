window.historico =
    JSON.parse(
        localStorage.getItem("historico")
    ) || [];

async function perguntarIA(pergunta, nivel) {

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
- Coloque sempre a pronuncia em ingles, exemplo de formatação:

Em inglês: She'd lied to you, lied to me
Pronúncia: Xid láid tu iu, láid tu mi
Tradução: Ela mentiu para você, mentiu para mim

Adapte ao nível do aluno:

Iniciante:
- frases simples
- vocabulário básico
- explicações em português

Intermediário:
- frases médias
- mais vocabulário

Avançado:
- frases naturais
- menos explicação em português

Nível atual do aluno: ${nivel}
`
                }
            ]
        },
        ...window.historico
    ];

    const resposta = await fetch(
<<<<<<< HEAD
        "https://english-ai-tutor-i0tv.onrender.com",
=======
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
        throw new Error(
            dados.erro || "Erro no servidor"
        );
    }

    const textoResposta = dados.resposta;

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
