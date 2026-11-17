/*  animação de seleção  */

function mudarCor(botao) {
    for (const opcao of document.querySelectorAll(".opcaoCidade")) {
        const selecionada = opcao === botao;

        opcao.classList.toggle("selecionado", selecionada);
        opcao.setAttribute("aria-pressed", selecionada);
    }
}

/*=== Entregas ===*/

let nomeCidade;
let taxaEntrega;
let tempoEntrega;

const listaCidades = [
    { nome: "Joinville", tempoEntrega: 35, taxaEntrega: 6 },
    { nome: "Araquari", tempoEntrega: 45, taxaEntrega: 8 },
    { nome: "São Francisco do Sul", tempoEntrega: 50, taxaEntrega: 9 }
];

function calcularEntrega(cidadeSelecionada) {
    for (const cidade of listaCidades) {
        if (cidadeSelecionada === cidade.nome) {
            nomeCidade = cidade.nome;
            taxaEntrega = cidade.taxaEntrega;
            tempoEntrega = cidade.tempoEntrega;

            return { nomeCidade, taxaEntrega, tempoEntrega };
        }
    }

    return null;
}

function iniciarCidades() {
    for (const botao of document.querySelectorAll(".opcaoCidade")) {
        botao.addEventListener("click", function () {
            const entrega = calcularEntrega(botao.dataset.valor);

            if (entrega) {
                salvarDadosSacola("cidadeEntrega", entrega.nomeCidade);
                atualizarCidadeEntrega();
            }
        });
    }
}

/*=== Perfil do usuário ===*/

const listaObjetivos = [
    { nome: "Perder peso", objKal: 0.8, objProteina: 1 },
    { nome: "Manter peso", objKal: 1, objProteina: 1 },
    { nome: "Ganhar peso", objKal: 1.4, objProteina: 1 },
    { nome: "Ganhar musculo", objKal: 1.2, objProteina: 1.3 }
];

const listaRestricoesAlimentares = [
    "glúten",
    "lactose",
    "vegetariano",
    "ovo"
];

const listaNiveisAtividadeFisica = [
    { nome: "Sedentário", fatorAtividade: 1 },
    { nome: "Leve", fatorAtividade: 1.2 },
    { nome: "Moderada", fatorAtividade: 1.325 },
    { nome: "Intensa", fatorAtividade: 1.5 }
];

const objetivosPorValor = {
    perder: "Perder peso",
    manter: "Manter peso",
    ganhar: "Ganhar peso",
    musculo: "Ganhar musculo"
};

let pesoUsuario;
let alturaUsuario;
let idadeUsuario;
let sexoUsuario;
let nivelAtividadeFisicaUsuario;
let objetivoUsuario;
let restricaoAlimentarUsuario = [];

/*=== Cálculos do perfil ===*/

function calcularCalorias() {
    let peso = Number(pesoUsuario);
    let altura = Number(alturaUsuario);
    let idade = Number(idadeUsuario);
    let metabolismo;

    if (sexoUsuario === "m") {
        metabolismo = 10 * peso + 6.25 * altura - 5 * idade + 5;
    } else {
        metabolismo = 10 * peso + 6.25 * altura - 5 * idade - 161;
    }

    let atividade = listaNiveisAtividadeFisica.find(
        (nivel) => nivel.nome === nivelAtividadeFisicaUsuario
    );

    let objetivo = listaObjetivos.find(
        (item) => item.nome === objetivoUsuario
    );

    if (!atividade || !objetivo) {
        return 0;
    }

    let calorias = metabolismo * atividade.fatorAtividade * objetivo.objKal;

    return calorias;
}

function calcularProteina() {
    let peso = Number(pesoUsuario);

    let objetivo = listaObjetivos.find(
        (item) => item.nome === objetivoUsuario
    );

    if (!objetivo) {
        return 0;
    }

    let proteina = peso * 1.2 * objetivo.objProteina;

    return proteina;
}

function calcularAgua() {
    let peso = Number(pesoUsuario);

    let agua = peso * 35;

    return agua;
}

/*=== Cálculo das metas ===*/

let metaProteina;
let metaCarboidrato;
let metaGordura;
let metaCalorias;
let metaFibras;
let metaSodio;

function calcularMetaCalorias() {
    metaCalorias = calcularCalorias();
    return metaCalorias;
}

function calcularMetaProteina() {
    metaProteina = calcularProteina();
    return metaProteina;
}

function calcularMetaCarboidrato() {
    metaCarboidrato = (metaCalorias * 0.5) / 4;
    return metaCarboidrato;
}

function calcularMetaGordura() {
    metaGordura = (metaCalorias * 0.3) / 9;
    return metaGordura;
}

function calcularMetaFibras() {
    metaFibras = (metaCalorias / 1000) * 14;
    return metaFibras;
}

function calcularMetaSodio() {
    metaSodio = 2000;
    return metaSodio;
}

/*=== Capturar informações do formulário ===*/

function calcularPerfilUsuario() {
    pesoUsuario = document.getElementById("peso").value;
    alturaUsuario = document.getElementById("altura").value;
    idadeUsuario = document.getElementById("idade").value;
    sexoUsuario = document.getElementById("sexo").value;

    const atividadeSelecionada = Number(
        document.getElementById("atividade").value
    );

    const objetivoSelecionado = document.getElementById("objetivo").value;

    nivelAtividadeFisicaUsuario =
        listaNiveisAtividadeFisica[atividadeSelecionada]?.nome;

    objetivoUsuario = objetivosPorValor[objetivoSelecionado];

    restricaoAlimentarUsuario = Array.from(
        document.querySelectorAll('input[name="restricoes"]:checked')
    ).map((input) => input.value);
}

/*=== Salvar perfil ===*/

function salvarPerfil() {
    calcularPerfilUsuario();

    if (
        !Number.isFinite(Number(pesoUsuario)) || Number(pesoUsuario) <= 0 ||
        !Number.isFinite(Number(alturaUsuario)) || Number(alturaUsuario) <= 0 ||
        !Number.isFinite(Number(idadeUsuario)) || Number(idadeUsuario) <= 0 ||
        !nivelAtividadeFisicaUsuario || !objetivoUsuario ||
        (sexoUsuario !== "m" && sexoUsuario !== "f")
    ) {
        alert("Preencha todos os campos obrigatórios com valores válidos!");
        return;
    }

    calcularMetaCalorias();
    calcularMetaProteina();
    calcularMetaCarboidrato();
    calcularMetaGordura();
    calcularMetaFibras();
    calcularMetaSodio();

    localStorage.setItem("pesoUsuario", pesoUsuario);
    localStorage.setItem("alturaUsuario", alturaUsuario);
    localStorage.setItem("idadeUsuario", idadeUsuario);
    localStorage.setItem("sexoUsuario", sexoUsuario);

    localStorage.setItem(
        "nivelAtividadeFisicaUsuario",
        nivelAtividadeFisicaUsuario
    );

    localStorage.setItem("objetivoUsuario", objetivoUsuario);

    localStorage.setItem(
        "restricaoAlimentarUsuario",
        JSON.stringify(restricaoAlimentarUsuario)
    );

    localStorage.setItem(
        "gostosUsuario",
        document.getElementById("gostos").value
    );
}

/*=== Recuperar perfil do usuário ===*/

function recuperarPerfilUsuario() {
    // Recuperar informações do localStorage
    pesoUsuario = localStorage.getItem("pesoUsuario");
    alturaUsuario = localStorage.getItem("alturaUsuario");
    idadeUsuario = localStorage.getItem("idadeUsuario");
    sexoUsuario = localStorage.getItem("sexoUsuario");

    nivelAtividadeFisicaUsuario = localStorage.getItem(
        "nivelAtividadeFisicaUsuario"
    );

    objetivoUsuario = localStorage.getItem("objetivoUsuario");

    restricaoAlimentarUsuario = lerEscolhas("restricaoAlimentarUsuario", []);

    if (!Array.isArray(restricaoAlimentarUsuario)) {
        restricaoAlimentarUsuario = [];
    }

    const gostosUsuario = localStorage.getItem("gostosUsuario");

    // Verificar se existe perfil salvo
    if (pesoUsuario === null) {
        return;
    }

    if (!document.getElementById("peso")) {
        return;
    }

    // Preencher campos do formulário
    document.getElementById("peso").value = pesoUsuario;
    document.getElementById("altura").value = alturaUsuario;
    document.getElementById("idade").value = idadeUsuario;
    document.getElementById("sexo").value = sexoUsuario;

    document.getElementById("gostos").value = gostosUsuario || "";

    // Recuperar atividade física
    const indiceAtividade = listaNiveisAtividadeFisica.findIndex(
        (nivel) => nivel.nome === nivelAtividadeFisicaUsuario
    );

    if (indiceAtividade !== -1) {
        document.getElementById("atividade").value = indiceAtividade;
    }

    // Recuperar objetivo
    const valorObjetivo = Object.keys(objetivosPorValor).find(
        (key) => objetivosPorValor[key] === objetivoUsuario
    );

    if (valorObjetivo) {
        document.getElementById("objetivo").value = valorObjetivo;
    }

    // Recuperar restrições alimentares
    document.querySelectorAll('input[name="restricoes"]').forEach((checkbox) => {
        checkbox.checked = restricaoAlimentarUsuario.includes(checkbox.value);
    });
}

/*=== Filtro de Dicas ===*/

function iniciarFiltroDicas() {
    const botoesObjetivo = document.querySelectorAll(
        '[data-acao="selecionarObjetivo"]'
    );

    const gruposDicas = document.querySelectorAll(".dicasDoObjetivo");

    for (const botao of botoesObjetivo) {
        botao.addEventListener("click", function () {
            let objetivoSelecionado = botao.dataset.valor;

            for (const grupo of gruposDicas) {
                if (grupo.dataset.objetivo === objetivoSelecionado) {
                    grupo.style.display = "grid";
                } else {
                    grupo.style.display = "none";
                }
            }
        });
    }
}

/*=== Exibir receitas ===*/

document.addEventListener("DOMContentLoaded", function () {
    const lista = document.getElementById("listaReceitas");

    if (!lista || typeof receitas === "undefined") {
        return;
    }

    lista.classList.add("gradeReceitas");

    lista.innerHTML = receitas.map(receita => `
        <article class="cardReceita">
            <img
                src="Imagens/receitas/cards/${receita.id}.jpg"
                alt="${receita.nome}"
                loading="lazy"
            >

            <div class="corpoCardReceita">
                <h4>${receita.nome}</h4>

                <p class="textoSecundario">
                    ${receita.categoria}
                </p>

                <p class="textoSecundario">
                    ${receita.calorias} kcal ·
                    ${receita.proteinas}g de proteína
                </p>
            </div>
        </article>
    `).join("");

    lista.querySelectorAll("img").forEach(imagem => {
        imagem.addEventListener("error", function () {
            this.style.display = "none";
        });
    });
});
/*=== Exibir receitas, modal e pesquisa ===*/

function exibirReceitas() {
    const lista = document.getElementById("listaReceitas");
    const campoBusca = document.getElementById("campoBuscaReceitas");
    const filtroCategoria = document.getElementById("filtroCategoria");

    if (!lista || typeof receitas === "undefined") {
        return;
    }

    lista.classList.add("gradeReceitas");

    
    function normalizarTexto(texto) {
        return (texto || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function renderizarReceitas(listaParaExibir) {
        if (listaParaExibir.length === 0) {
            lista.innerHTML = `<p class="textoSecundario">Nenhuma receita encontrada para esta pesquisa.</p>`;
            return;
        }

        lista.innerHTML = listaParaExibir.map(receita => `
            <article class="cardReceita" data-id="${receita.id}" tabindex="0">
                <img
                    src="Imagens/receitas/cards/${receita.id}.jpg"
                    alt="${receita.nome}"
                    loading="lazy"
                >

                <div class="corpoCardReceita">
                    <h4>${receita.nome}</h4>

                    <p class="textoSecundario">
                        ${receita.categoria}
                    </p>

                    <p class="textoSecundario">
                        ${receita.calorias} kcal ·
                        ${receita.proteinas}g de proteína
                    </p>
                </div>
            </article>
        `).join("");

        // Oculta imagens que falharem ao carregar
        lista.querySelectorAll("img").forEach(imagem => {
            imagem.addEventListener("error", function () {
                this.style.display = "none";
            });
        });
    }

    function filtrarReceitas() {
        const termo = normalizarTexto(campoBusca ? campoBusca.value : "");
        const categoriaSelecionada = filtroCategoria ? filtroCategoria.value : "";

        const receitasFiltradas = receitas.filter(receita => {
            const nome = normalizarTexto(receita.nome);
            const ingredientes = normalizarTexto(receita.ingredientes);

            const correspondeTexto = nome.includes(termo) || ingredientes.includes(termo);
            const correspondeCategoria = categoriaSelecionada === "" || receita.categoria === categoriaSelecionada;

            return correspondeTexto && correspondeCategoria;
        });

        renderizarReceitas(receitasFiltradas);
    }

    if (campoBusca) {
        campoBusca.addEventListener("input", filtrarReceitas);
    }

    if (filtroCategoria) {
        filtroCategoria.addEventListener("change", filtrarReceitas);
    }

    renderizarReceitas(receitas);

    function abrirReceita(receita) {
        const modal = document.createElement("div");
        modal.className = "modalReceita";

        modal.innerHTML = `
            <div class="conteudoModalReceita">
                <button class="fecharModal" aria-label="Fechar">&times;</button>
                <img class="imagemModalReceita" src="Imagens/receitas/cards/${receita.id}.jpg" alt="${receita.nome}">
                <div class="informacoesModalReceita">
                    <p class="textoSecundario">${receita.categoria}</p>
                    <h2>${receita.nome}</h2>
                    <div class="dadosNutricionais">
                        <div><strong>${receita.calorias}</strong><span>Calorias</span></div>
                        <div><strong>${receita.proteinas}g</strong><span>Proteínas</span></div>
                        <div><strong>${receita.carboidratos}g</strong><span>Carboidratos</span></div>
                    </div>
                    <h3>Ingredientes</h3>
                    <p>${receita.ingredientes || "Ingredientes não informados."}</p>
                    <h3>Modo de preparo</h3>
                    <p>${receita.preparo || "Modo de preparo não informado."}</p>
                </div>
                <div class="acoesReceita">
                    <button type="button" class="botaoFavoritar" aria-pressed="${favoritos.includes(receita.id)}">
                        <span aria-hidden="true">${favoritos.includes(receita.id) ? "♥" : "♡"}</span>
                        <span>${favoritos.includes(receita.id) ? "Curtido" : "Curtir"}</span>
                    </button>
                    <button type="button" class="botaoAdicionarCardapio" aria-expanded="false" aria-controls="formularioCardapio">
                        ＋ Adicionar ao cardápio
                    </button>
                </div>
                <form id="formularioCardapio" class="formularioCardapio" hidden>
                    <label>
                        Dia
                        <select name="dia">
                            ${Object.entries(nomesDias).map(([valor, nome]) => `<option value="${valor}">${nome}</option>`).join("")}
                        </select>
                    </label>
                    <label>
                        Refeição
                        <select name="refeicao">
                            ${Object.entries(nomesRefeicoes).map(([valor, nome]) => `<option value="${valor}">${nome}</option>`).join("")}
                        </select>
                    </label>
                    <button type="submit" class="botaoAdicionarCardapio">Adicionar</button>
                </form>
                <p class="retornoCardapio" role="status"></p>
            </div>
        `;

        document.body.appendChild(modal);

        const curtir = modal.querySelector(".botaoFavoritar");
        curtir.addEventListener("click", () => {
            const ativo = favoritar(receita.id);
            curtir.setAttribute("aria-pressed", String(ativo));
            curtir.firstElementChild.textContent = ativo ? "♥" : "♡";
            curtir.lastElementChild.textContent = ativo ? "Curtido" : "Curtir";
        });

        const adicionar = modal.querySelector(".botaoAdicionarCardapio");
        const formulario = modal.querySelector("form");
        adicionar.addEventListener("click", () => {
            formulario.hidden = !formulario.hidden;
            adicionar.setAttribute("aria-expanded", String(!formulario.hidden));
            if (!formulario.hidden) formulario.elements.dia.focus();
        });

        formulario.addEventListener("submit", evento => {
            evento.preventDefault();
            const dia = formulario.elements.dia.value;
            const refeicao = formulario.elements.refeicao.value;
            const itens = cardapioSemanal[dia][refeicao];
            const repetida = itens.includes(receita.id);

            if (!repetida) {
                itens.push(receita.id);
                localStorage.setItem("cardapioSemanal", JSON.stringify(cardapioSemanal));
            }

            modal.querySelector(".retornoCardapio").textContent = repetida
                ? "Esta receita já está nesta refeição."
                : `Adicionado: ${nomesDias[dia]}, ${nomesRefeicoes[refeicao].toLowerCase()}.`;
        });

        const scrollAnterior = document.body.style.overflow;
        const focoAnterior = document.activeElement;

        function fecharReceita() {
            modal.remove();
            document.body.style.overflow = scrollAnterior;
            document.removeEventListener("keydown", fecharComEsc);
            focoAnterior?.focus();
        }

        const conteudoModal = modal.querySelector(".conteudoModalReceita");
        conteudoModal.setAttribute("role", "dialog");
        conteudoModal.setAttribute("aria-modal", "true");
        modal.querySelector("h2").id = "tituloReceita";
        conteudoModal.setAttribute("aria-labelledby", "tituloReceita");
        modal.querySelector(".fecharModal").focus();
        document.body.style.overflow = "hidden";

        modal.querySelector(".fecharModal").addEventListener("click", fecharReceita);
        modal.addEventListener("click", evento => {
            if (evento.target === modal) fecharReceita();
        });

        function fecharComEsc(evento) {
            if (evento.key === "Escape") {
                fecharReceita();
                document.removeEventListener("keydown", fecharComEsc);
            if (
                evento.key === "Escape" &&
                !document.querySelector(".seletorCardapio[open]")
            ) {
                fecharReceita();
            }
        }
        document.addEventListener("keydown", fecharComEsc);
    }

    lista.addEventListener("click", function (evento) {
        const card = evento.target.closest(".cardReceita");
        if (!card) return;
        const id = Number(card.dataset.id);
        const receita = receitas.find(item => item.id === id);
        if (receita) abrirReceita(receita);
    });

    lista.addEventListener("keydown", function (evento) {
        if (evento.target.classList.contains("cardReceita") && (evento.key === "Enter" || evento.key === " ")) {
            evento.preventDefault();
            evento.target.click();
        }
    });
});

/*=== favoritar ===*/

function lerListaSalva(chave) {
    try {
        return JSON.parse(localStorage.getItem(chave));
    } catch {
        return null;
    }
}

let favoritos = lerListaSalva("favoritos");

if (!Array.isArray(favoritos)) {
    favoritos = [];
}

function favoritar(id) {
    favoritos = favoritos.includes(id)
        ? favoritos.filter(item => item !== id)
        : [...favoritos, id];

    localStorage.setItem("favoritos", JSON.stringify(favoritos));

    return favoritos.includes(id);
}

const nomesDias = {
    segunda: "Segunda-feira",
    terca: "Terça-feira",
    quarta: "Quarta-feira",
    quinta: "Quinta-feira",
    sexta: "Sexta-feira",
    sabado: "Sábado",
    domingo: "Domingo"
};

const nomesRefeicoes = {
    cafeDaManha: "Café da manhã",
    almoco: "Almoço",
    lancheDaTarde: "Lanche da tarde",
    jantar: "Jantar"
};

const cardapioSemanal = {
    segunda: {
        cafeDaManha: [],
        almoco: [],
        lancheDaTarde: [],
        jantar: []
    },
    terca: {
        cafeDaManha: [],
        almoco: [],
        lancheDaTarde: [],
        jantar: []
    },
    quarta: {
        cafeDaManha: [],
        almoco: [],
        lancheDaTarde: [],
        jantar: []
    },
    quinta: {
        cafeDaManha: [],
        almoco: [],
        lancheDaTarde: [],
        jantar: []
    },
    sexta: {
        cafeDaManha: [],
        almoco: [],
        lancheDaTarde: [],
        jantar: []
    },
    sabado: {
        cafeDaManha: [],
        almoco: [],
        lancheDaTarde: [],
        jantar: []
    },
    domingo: {
        cafeDaManha: [],
        almoco: [],
        lancheDaTarde: [],
        jantar: []
    }
};

const semanaSalva = lerListaSalva("cardapioSemanal");

for (const dia of Object.keys(cardapioSemanal)) {
    for (const refeicao of Object.keys(nomesRefeicoes)) {
        const itens = semanaSalva?.[dia]?.[refeicao];

        if (Array.isArray(itens)) {
            cardapioSemanal[dia][refeicao] = itens.filter(Number.isInteger);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const lista = document.getElementById("listaRefeicoes");

    if (!lista || typeof receitas === "undefined") {
        return;
    }

    function mostrarDia(dia) {
        document.getElementById("nomeDiaSelecionado").textContent =
            nomesDias[dia];

        let calorias = 0;

        lista.replaceChildren();

        for (const [refeicao, nome] of Object.entries(nomesRefeicoes)) {
            const bloco = document.createElement("section");
            const titulo = document.createElement("h3");

            titulo.textContent = nome;
            bloco.append(titulo);

            const itens = cardapioSemanal[dia][refeicao]
                .map(id => receitas.find(receita => receita.id === id))
                .filter(Boolean);

            const texto = document.createElement("p");

            texto.textContent = itens.length
                ? itens.map(item => item.nome).join(" • ")
                : "Nenhuma receita adicionada.";

            bloco.append(texto);
            lista.append(bloco);

            calorias += itens.reduce(
                (total, item) => total + Number(item.calorias || 0),
                0
            );
        }

        document.getElementById("resumoDoDia").textContent =
            `${calorias.toFixed(0)} kcal nas receitas adicionadas.`;

        document.querySelectorAll(
            '[data-acao="selecionarDia"]'
        ).forEach(botao => {
            const ativo =
                Object.keys(nomesDias)[Number(botao.dataset.indice)] === dia;

            botao.classList.toggle("ativo", ativo);
            botao.setAttribute("aria-pressed", String(ativo));
        });
    }

    document.querySelectorAll(
        '[data-acao="selecionarDia"]'
    ).forEach(botao => {
        botao.addEventListener("click", () => {
            mostrarDia(
                Object.keys(nomesDias)[Number(botao.dataset.indice)]
            );
        });
    });

    mostrarDia("segunda");
});
/*Pesquisa das receitas*/
