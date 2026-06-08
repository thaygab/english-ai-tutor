// ============================================================================
// CONFIGURAÇÃO INICIAL E RECUPERAÇÃO DE DADOS
// ============================================================================

// Recupera todas as conversas salvas no LocalStorage
window.conversas =
    JSON.parse(localStorage.getItem("conversas")) || {};

// Recupera o chat atualmente selecionado
window.chatAtual =
    localStorage.getItem("chatAtual") || "default";

// Garante que o chat atual exista
if (!window.conversas[window.chatAtual]) {
    window.conversas[window.chatAtual] = [];
}

// Controla requisições simultâneas
let carregando = false;


// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/*
|--------------------------------------------------------------------------
| FUNÇÃO: formatarTexto()
|--------------------------------------------------------------------------
|
| Objetivo:
| Converter quebras de linha (\n) em <br>
| para exibição correta dentro do HTML.
|
| Parâmetro:
| texto (string)
|
| Retorno:
| string formatada
|
*/
function formatarTexto(texto) {
    return texto.replace(/\n/g, "<br>");
}


// ============================================================================
// FUNÇÃO PRINCIPAL: enviarPergunta()
// ============================================================================

/*
|--------------------------------------------------------------------------
| Fluxo da função
|--------------------------------------------------------------------------
|
| 1. Verifica se já existe envio em andamento
| 2. Captura elementos da interface
| 3. Valida a pergunta
| 4. Exibe a mensagem do usuário
| 5. Mostra indicador de carregamento
| 6. Consulta a IA
| 7. Exibe resposta
| 8. Salva conversa
| 9. Atualiza sidebar
|
*/
async function enviarPergunta() {

    // ------------------------------------------------------------------------
    // BLOCO 1 - EVITA DUPLOS ENVIOS
    // ------------------------------------------------------------------------

    if (carregando) return;

    carregando = true;

    // ------------------------------------------------------------------------
    // BLOCO 2 - ELEMENTOS DA INTERFACE
    // ------------------------------------------------------------------------

    const input = document.getElementById("prompt");
    const chat = document.getElementById("chat");
    const botao = document.getElementById("btnEnviar");
    const nivel = document.getElementById("nivel").value;

    // ------------------------------------------------------------------------
    // BLOCO 3 - VALIDAÇÃO DA PERGUNTA
    // ------------------------------------------------------------------------

    const pergunta = input.value.trim();

    if (!pergunta) {
        carregando = false;
        return;
    }

    // ------------------------------------------------------------------------
    // BLOCO 4 - GARANTE QUE A CONVERSA EXISTA
    // ------------------------------------------------------------------------

    if (!window.conversas[window.chatAtual]) {
        window.conversas[window.chatAtual] = [];
    }

    // ------------------------------------------------------------------------
    // BLOCO 5 - BLOQUEIA CONTROLES
    // ------------------------------------------------------------------------

    input.disabled = true;
    botao.disabled = true;

    // ------------------------------------------------------------------------
    // BLOCO 6 - EXIBE A PERGUNTA DO USUÁRIO
    // ------------------------------------------------------------------------

    chat.innerHTML += `
        <div class="mensagem usuario">
            ${formatarTexto(pergunta)}
        </div>
    `;

    input.value = "";

    // ------------------------------------------------------------------------
    // BLOCO 7 - INDICADOR DE PROCESSAMENTO
    // ------------------------------------------------------------------------

    const digitando = document.createElement("div");

    digitando.className = "mensagem tutor";
    digitando.innerText = "⌨️ Tutor está pensando...";

    chat.appendChild(digitando);

    chat.scrollTop = chat.scrollHeight;

    // ------------------------------------------------------------------------
    // BLOCO 8 - CONSULTA À IA
    // ------------------------------------------------------------------------

    try {

        const resposta =
            await perguntarIA(pergunta, nivel);

        digitando.remove();

        // --------------------------------------------------------------------
        // BLOCO 9 - EXIBE RESPOSTA DA IA
        // --------------------------------------------------------------------

        chat.innerHTML += `
            <div class="mensagem tutor">
                ${formatarTexto(resposta)}
            </div>
        `;

        // --------------------------------------------------------------------
        // BLOCO 10 - SALVAMENTO DA CONVERSA
        // --------------------------------------------------------------------

        window.conversas[window.chatAtual].push({
            role: "user",
            text: pergunta
        });

        window.conversas[window.chatAtual].push({
            role: "assistant",
            text: resposta
        });

        localStorage.setItem(
            "conversas",
            JSON.stringify(window.conversas)
        );

        renderizarConversas();
    }

    // ------------------------------------------------------------------------
    // BLOCO 11 - TRATAMENTO DE ERROS
    // ------------------------------------------------------------------------

    catch (erro) {

        digitando.remove();

        chat.innerHTML += `
            <div class="mensagem tutor">
                ❌ Erro ao consultar IA
            </div>
        `;

        console.error(erro);
    }

    // ------------------------------------------------------------------------
    // BLOCO 12 - FINALIZAÇÃO
    // ------------------------------------------------------------------------

    finally {

        botao.disabled = false;
        input.disabled = false;

        carregando = false;

        chat.scrollTop = chat.scrollHeight;
    }
}


// ============================================================================
// GERENCIAMENTO DE CONVERSAS
// ============================================================================

/*
|--------------------------------------------------------------------------
| FUNÇÃO: novaConversa()
|--------------------------------------------------------------------------
|
| Objetivo:
| Criar uma nova conversa utilizando timestamp
| como identificador único.
|
*/
function novaConversa() {

    const id = "chat_" + Date.now();

    window.conversas[id] = [];

    window.chatAtual = id;

    localStorage.setItem(
        "conversas",
        JSON.stringify(window.conversas)
    );

    localStorage.setItem(
        "chatAtual",
        window.chatAtual
    );

    const chat = document.getElementById("chat");

    chat.innerHTML = `
        <div class="mensagem tutor">
            👋 Nova conversa criada! Como posso ajudar seu inglês hoje?
        </div>
    `;

    renderizarConversas();
}


/*
|--------------------------------------------------------------------------
| FUNÇÃO: limparConversa()
|--------------------------------------------------------------------------
|
| Objetivo:
| Apagar todas as mensagens da conversa atual.
|
*/
function limparConversa() {

    window.conversas[window.chatAtual] = [];

    localStorage.setItem(
        "conversas",
        JSON.stringify(window.conversas)
    );

    const chat = document.getElementById("chat");

    chat.innerHTML = `
        <div class="mensagem tutor">
            👋 Conversa limpa!
        </div>
    `;

    renderizarConversas();
}


// ============================================================================
// RENDERIZAÇÃO DA SIDEBAR
// ============================================================================

/*
|--------------------------------------------------------------------------
| FUNÇÃO: renderizarConversas()
|--------------------------------------------------------------------------
|
| Objetivo:
| Atualizar a lista de conversas exibida na sidebar.
|
*/
function renderizarConversas() {

    const lista =
        document.getElementById("listaConversas");

    if (!lista) return;

    lista.innerHTML = "";

    Object.keys(window.conversas).forEach(id => {

        const btn = document.createElement("button");

        // Destaca o chat ativo
        if (id === window.chatAtual) {
            btn.style.fontWeight = "bold";
        }

        btn.innerText =
            id === "default"
                ? "Conversa inicial"
                : "Conversa " + id.slice(-4);

        btn.onclick = () => {

            window.chatAtual = id;

            localStorage.setItem(
                "chatAtual",
                id
            );

            const chat =
                document.getElementById("chat");

            // Conversa vazia
            if (window.conversas[id].length === 0) {

                chat.innerHTML = `
                    <div class="mensagem tutor">
                        👋 Conversa vazia.
                    </div>
                `;
            }

            // Conversa com histórico
            else {

                chat.innerHTML =
                    window.conversas[id]
                        .map(msg => `
                            <div class="mensagem ${
                                msg.role === "user"
                                    ? "usuario"
                                    : "tutor"
                            }">
                                ${formatarTexto(msg.text)}
                            </div>
                        `)
                        .join("");
            }

            renderizarConversas();
        };

        lista.appendChild(btn);
    });
}


// ============================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ============================================================================

/*
|--------------------------------------------------------------------------
| DOMContentLoaded
|--------------------------------------------------------------------------
|
| Executado quando a página termina de carregar.
|
| Responsabilidades:
| - Renderizar sidebar
| - Restaurar conversa ativa
|
*/
window.addEventListener("DOMContentLoaded", () => {

    renderizarConversas();

    const chat =
        document.getElementById("chat");

    if (
        window.conversas[window.chatAtual]?.length > 0
    ) {

        chat.innerHTML =
            window.conversas[window.chatAtual]
                .map(msg => `
                    <div class="mensagem ${
                        msg.role === "user"
                            ? "usuario"
                            : "tutor"
                    }">
                        ${formatarTexto(msg.text)}
                    </div>
                `)
                .join("");
    }
});


// ============================================================================
// FLUXOGRAMA GERAL DO SCRIPT
// ============================================================================

/*

[ Página Carrega ]
          │
          ▼
[ Recupera Conversas ]
          │
          ▼
[ Renderiza Sidebar ]
          │
          ▼
[ Usuário Digita ]
          │
          ▼
[ enviarPergunta() ]
          │
          ▼
[ Exibe Pergunta ]
          │
          ▼
[ Tutor Pensando... ]
          │
          ▼
[ perguntarIA() ]
          │
          ▼
      ┌─────────────┐
      │ Resposta OK │
      └──────┬──────┘
             ▼
[ Exibe Resposta ]
             │
             ▼
[ Salva Histórico ]
             │
             ▼
[ Atualiza Sidebar ]

*/