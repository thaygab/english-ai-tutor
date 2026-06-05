window.conversas = JSON.parse(localStorage.getItem("conversas")) || {};
window.chatAtual = "default";

if (!window.conversas["default"]) {
    window.conversas["default"] = [];
}

let carregando = false;

// 🔵 ENVIAR PERGUNTA
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

    if (!window.conversas[window.chatAtual]) {
        window.conversas[window.chatAtual] = [];
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
window.conversas[window.chatAtual].push({
    role: "user",
    text: pergunta
});

window.conversas[window.chatAtual].push({
    role: "assistant",
    text: respostaFormatada
});
        localStorage.setItem("conversas", JSON.stringify(window.conversas));

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

// 🔵 LIMPAR CONVERSA ATUAL
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

// 🔵 NOVA CONVERSA
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

// 🔵 RENDERIZAR SIDEBAR
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

           chat.innerHTML = window.conversas[id].map(msg => {

    if (msg.role === "user") {
        return `<div class="mensagem usuario">${msg.text}</div>`;
    }

    return `<div class="mensagem tutor">${msg.text}</div>`;

}).join("");
:`
               
                <div class="mensagem tutor">
                    👋 Conversa carregada
                </div>
            `;
        };

        lista.appendChild(btn);
    });
}

// 🔵 INICIALIZAÇÃO
window.addEventListener("DOMContentLoaded", () => {

    renderizarConversas();

    const chat = document.getElementById("chat");

    if (window.conversas[window.chatAtual]?.length > 0) {
        chat.innerHTML = window.conversas[window.chatAtual]
            .map(item => item.html)
            .join("");
    }
});
