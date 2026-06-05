window.conversas = JSON.parse(localStorage.getItem("conversas")) || {};
window.chatAtual = localStorage.getItem("chatAtual") || "default";

if (!window.conversas[window.chatAtual]) {
    window.conversas[window.chatAtual] = [];
}

let carregando = false;

// Função auxiliar para injetar as quebras de linha nas mensagens salvas
function formatarTexto(texto) {
    return texto.replace(/\n/g, "<br>");
}

// =======================
// ENVIAR MENSAGEM
// =======================
async function enviarPergunta() {
    if (carregando) return;
    carregando = true;

    const input = document.getElementById("prompt");
    const chat = document.getElementById("chat");
    const botao = document.getElementById("btnEnviar");
    const nivel = document.getElementById("nivel").value;

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

    chat.innerHTML += `<div class="mensagem usuario">${formatarTexto(pergunta)}</div>`;
    input.value = "";

    const digitando = document.createElement("div");
    digitando.className = "mensagem tutor";
    digitando.innerText = "⌨️ Tutor está pensando...";
    chat.appendChild(digitando);
    chat.scrollTop = chat.scrollHeight; // Scroll para baixo

    try {
        const resposta = await perguntarIA(pergunta, nivel);
        digitando.remove();

        chat.innerHTML += `<div class="mensagem tutor">${formatarTexto(resposta)}</div>`;

        // Salva no histórico local da conversa ativa
        window.conversas[window.chatAtual].push({ role: "user", text: pergunta });
        window.conversas[window.chatAtual].push({ role: "assistant", text: resposta });

        localStorage.setItem("conversas", JSON.stringify(window.conversas));
        renderizarConversas();

    } catch (erro) {
        digitando.remove();
        chat.innerHTML += `<div class="mensagem tutor">❌ Erro ao consultar IA</div>`;
        console.error(erro);
    } finally {
        botao.disabled = false;
        input.disabled = false;
        carregando = false;
        chat.scrollTop = chat.scrollHeight;
    }
}

// =======================
// NOVA CONVERSA
// =======================
function novaConversa() {
    const id = "chat_" + Date.now();
    window.conversas[id] = [];
    window.chatAtual = id;

    localStorage.setItem("conversas", JSON.stringify(window.conversas));
    localStorage.setItem("chatAtual", window.chatAtual);

    const chat = document.getElementById("chat");
    chat.innerHTML = `<div class="mensagem tutor">👋 Nova conversa criada! Como posso ajudar seu inglês hoje?</div>`;

    renderizarConversas();
}

// =======================
// LIMPAR CONVERSA ATUAL
// =======================
function limparConversa() {
    window.conversas[window.chatAtual] = [];
    localStorage.setItem("conversas", JSON.stringify(window.conversas));

    const chat = document.getElementById("chat");
    chat.innerHTML = `<div class="mensagem tutor">👋 Conversa limpa!</div>`;
    
    renderizarConversas();
}

// =======================
// RENDER SIDEBAR
// =======================
function renderizarConversas() {
    const lista = document.getElementById("listaConversas");
    if (!lista) return;

    lista.innerHTML = "";

    Object.keys(window.conversas).forEach(id => {
        const btn = document.createElement("button");
        
        // Destaca visualmente o botão do chat ativo (opcional, bom para o CSS)
        if (id === window.chatAtual) {
            btn.style.fontWeight = "bold";
        }

        btn.innerText = id === "default" ? "Conversa inicial" : "Conversa " + id.slice(-4);

        btn.onclick = () => {
            window.chatAtual = id;
            localStorage.setItem("chatAtual", id);

            const chat = document.getElementById("chat");

            if (window.conversas[id].length === 0) {
                chat.innerHTML = `<div class="mensagem tutor">👋 Conversa vazia.</div>`;
            } else {
                chat.innerHTML = window.conversas[id]
                    .map(msg => `<div class="mensagem ${msg.role === "user" ? "usuario" : "tutor"}">${formatarTexto(msg.text)}</div>`)
                    .join("");
            }
            renderizarConversas(); // Recarrega para atualizar o negrito
        };

        lista.appendChild(btn);
    });
}

// =======================
// INICIALIZAÇÃO
// =======================
window.addEventListener("DOMContentLoaded", () => {
    renderizarConversas();
    const chat = document.getElementById("chat");

    if (window.conversas[window.chatAtual]?.length > 0) {
        chat.innerHTML = window.conversas[window.chatAtual]
            .map(msg => `<div class="mensagem ${msg.role === "user" ? "usuario" : "tutor"}">${formatarTexto(msg.text)}</div>`)
            .join("");
    }
});
