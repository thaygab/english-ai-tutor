let carregando = false;
async function enviarPergunta() {

  if (carregando) return;

    carregando = true;

    const nivel = document.getElementById("nivel").value;
    const input = document.getElementById("prompt");
    input.disabled = true;
    const pergunta = input.value.trim();
    const chat = document.getElementById("chat");

    if (!pergunta) return;

    const botao = document.getElementById("btnEnviar");
    botao.disabled = true;

    chat.innerHTML += `
        <div class="mensagem usuario">
            ${pergunta}
        </div>
    `;

    localStorage.setItem(
        "chatHTML",
        chat.innerHTML
    );

    input.value = "";

    const digitando = document.createElement("div");

    digitando.className = "mensagem tutor";
    digitando.innerHTML = "⌨️ Tutor está pensando...";

    chat.appendChild(digitando);

    chat.scrollTop = chat.scrollHeight;

    try {

        const respostaIA = await perguntarIA(pergunta, nivel);

        let respostaFormatada = respostaIA
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

        localStorage.setItem(
            "chatHTML",
            chat.innerHTML
        );

    } catch (erro) {

        digitando.remove();

        chat.innerHTML += `
            <div class="mensagem tutor">
                ❌ Erro ao consultar o Gemini.
            </div>
        `;

        console.error(erro);

    } finally {

        botao.disabled = false;
        carregando = false;
        input.disabled = false;

    }

    chat.scrollTop = chat.scrollHeight;
}

document
.getElementById("prompt")
.addEventListener("keydown", function(event) {

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        enviarPergunta();

    }

});

document
.getElementById("novaConversa")
.addEventListener("click", () => {

    window.historico.length = 0;

    localStorage.removeItem("chatHTML");
    localStorage.removeItem("historico");

    document.getElementById("chat").innerHTML = `
        <div class="mensagem tutor">
            👋 Nova conversa iniciada!

            <br><br>

            Escolha um tema ou faça uma pergunta em inglês.
        </div>
    `;

});

const chatSalvo = localStorage.getItem("chatHTML");

if (chatSalvo) {

    document.getElementById("chat").innerHTML = chatSalvo;

}