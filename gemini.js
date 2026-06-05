window.historico =
    JSON.parse(localStorage.getItem("historico")) || [];

async function perguntarIA(pergunta, nivel) {

    window.historico.push({
        role: "user",
        parts: [{ text: `Nível: ${nivel}\nPergunta: ${pergunta}` }]
    });

    const conteudo = [
        {
            role: "user",
            parts: [{
                text: `
Você é um tutor de inglês para brasileiros.

Regras:
- Responda em português
- Seja didático e amigável
- Inclua pronúncia

Nível: ${nivel}
`
            }]
        },
        ...window.historico
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

    const texto = dados.resposta;

    window.historico.push({
        role: "model",
        parts: [{ text: texto }]
    });

    localStorage.setItem("historico", JSON.stringify(window.historico));

    return texto;
}
