let carregando = false;

async function enviarPergunta() {

    if (carregando) return;
    carregando = true;

    const nivel = document.getElementById("nivel").value;
    const input = document.getElementById("prompt");
    const chat = document.getElementById("chat");
    const botao = document.getElementById("btnEnviar");

    const pergunta = input.value.trim();

    if (!pergunta) {
        carregando = false;
        return;
    }

    input.disabled = true;
    botao.disabled = true;

    chat.innerHTML += `
        <div class="mensagem usuario">${pergunta}</div>
    `;

    input.value = "";

    const digitando = document.createElement("div");
    digitando.className = "mensagem tutor";
    digitando.innerHTML = "⌨️ Tutor está pensando...";
    chat.appendChild(digitando);

    chat.scrollTop = chat.scrollHeight;

    try {

        const respostaIA = await perguntarIA(pergunta, nivel);

        const respostaFormatada = respostaIA
            .replace(/#{1,6}\s?/g, "")
            .replace(/\*\*/g, "")
            .replace(/\*/g, "")
            .replace(/---/g, "");

        digitando.remove();

        chat.innerHTML += `
            <div class="mensagem tutor">
                ${respostaFormatada.replace(/\n/g, "<br>")}
            </div>
        `;

        localStorage.setItem("chatHTML", chat.innerHTML);

    } catch (erro) {

        digitando.remove();

        chat.innerHTML += `
            <div class="mensagem tutor">
                ❌ Erro ao consultar a IA.
            </div>
        `;

        console.error(erro);

    } finally {

        botao.disabled = false;
        input.disabled = false;
        carregando = false;
    }

    chat.scrollTop = chat.scrollHeight;
}

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
