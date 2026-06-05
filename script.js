window.conversas = JSON.parse(localStorage.getItem("conversas")) || {};
window.chatAtual = "default";

if (!window.conversas["default"]) {
    window.conversas["default"] = [];
}

let carregando = false;

async function enviarPergunta() {

    if (carregando) return;
    carregando = true;

        if (!window.conversas[window.chatAtual]) {

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

      window.conversas[window.chatAtual].push({
    role: "ui",
    html: chat.innerHTML
});

localStorage.setItem(
    "conversas",
    JSON.stringify(window.conversas)
);

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

    window.conversas[window.chatAtual] = [];

    localStorage.setItem("conversas", JSON.stringify(window.conversas));

    const chat = document.getElementById("chat");

    chat.innerHTML = `
        <div class="mensagem tutor">
            👋 Conversa limpa!
        </div>
    `;
};

    
window.conversas[window.chatAtual] = [];

localStorage.setItem("conversas", JSON.stringify(window.conversas));

const chat = document.getElementById("chat");

if (chat) {
    chat.innerHTML = `
        <div class="mensagem tutor">
            👋 Conversa limpa!
        </div>
    `;
}
window.novaConversa = function () {

    const id = "chat_" + Date.now();

    window.conversas[id] = [];

    window.chatAtual = id;

    localStorage.setItem("conversas", JSON.stringify(window.conversas));

    const chat = document.getElementById("chat");

    chat.innerHTML = `
        <div class="mensagem tutor">
            👋 Nova conversa criada!
        </div>
    `;
};

window.addEventListener("DOMContentLoaded", () => {

    const chat = document.getElementById("chat");

    const chatSalvo = localStorage.getItem("chatHTML");
    const historicoSalvo = localStorage.getItem("historico");

    if (historicoSalvo) {
        window.historico = JSON.parse(historicoSalvo);
    }

    if (chatSalvo && chat) {
        chat.innerHTML = chatSalvo;
    }
});

function renderizarConversas() {

    const lista = document.getElementById("listaConversas");
    if (!lista) return;

    lista.innerHTML = "";

    Object.keys(window.conversas).forEach((id) => {

        const btn = document.createElement("button");

        btn.innerText = id === "default"
            ? "Conversa inicial"
            : id.replace("chat_", "Conversa ");

        btn.style.display = "block";
        btn.style.margin = "5px 0";
        btn.style.width = "100%";

        btn.onclick = () => {

            window.chatAtual = id;

            const chat = document.getElementById("chat");

            chat.innerHTML = localStorage.getItem("chat_" + id) || `
                <div class="mensagem tutor">
                    👋 Conversa carregada
                </div>
            `;
        };

        lista.appendChild(btn);
    });
}
