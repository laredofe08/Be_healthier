/*=== Armazenamento local ===*/

function lerEscolhas(chave, padrao) {
    try {
        const dados = JSON.parse(localStorage.getItem(chave));

        if (dados === null) {
            return padrao;
        }

        return dados;
    } catch {
        return padrao;
    }
}

/*=== Cidades de entrega ===*/

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

function mudarCor(botao) {
    if (!botao) return;

    const ehFiltroDicas = botao.matches('[data-acao="selecionarObjetivo"]');
    const opcoes = document.querySelectorAll(
        ehFiltroDicas ? '[data-acao="selecionarObjetivo"]' : ".opcaoCidade"
    );

    for (const opcao of opcoes) {
        const selecionada = opcao === botao;

        opcao.classList.toggle(ehFiltroDicas ? "ativo" : "selecionado", selecionada);
        opcao.setAttribute("aria-pressed", selecionada);
    }
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

function atualizarCidadeEntrega() {
    for (const elemento of document.querySelectorAll(".cidadeAtual")) {
        elemento.textContent = nomeCidade || "Selecione a cidade";
    }

    const selecionado = Array.from(
        document.querySelectorAll(".opcaoCidade")
    ).find(
        botao => botao.dataset.valor === nomeCidade
    );

    mudarCor(selecionado);
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

/*=== Dados do formulário ===*/

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

/*=== Gravação do perfil ===*/

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

/*=== Restauração do perfil ===*/

function recuperarPerfilUsuario() {
    // Dados salvos
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

    // Disponibilidade do perfil
    if (pesoUsuario === null) {
        return;
    }

    if (!document.getElementById("peso")) {
        return;
    }

    // Campos do perfil
    document.getElementById("peso").value = pesoUsuario;
    document.getElementById("altura").value = alturaUsuario;
    document.getElementById("idade").value = idadeUsuario;
    document.getElementById("sexo").value = sexoUsuario;

    document.getElementById("gostos").value = gostosUsuario || "";

    // Atividade física
    const indiceAtividade = listaNiveisAtividadeFisica.findIndex(
        (nivel) => nivel.nome === nivelAtividadeFisicaUsuario
    );

    if (indiceAtividade !== -1) {
        document.getElementById("atividade").value = indiceAtividade;
    }

    // Objetivo
    const valorObjetivo = Object.keys(objetivosPorValor).find(
        (key) => objetivosPorValor[key] === objetivoUsuario
    );

    if (valorObjetivo) {
        document.getElementById("objetivo").value = valorObjetivo;
    }

    // Restrições alimentares
    document.querySelectorAll('input[name="restricoes"]').forEach((checkbox) => {
        checkbox.checked = restricaoAlimentarUsuario.includes(checkbox.value);
    });
}

/*=== Dicas por objetivo ===*/

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

/*=== Catálogo de receitas ===*/

const receitasPorId = new Map();

function buscarReceita(id) {
    return receitasPorId.get(Number(id));
}

/*=== Receitas e detalhes ===*/

function exibirReceitas() {
    const lista = document.getElementById("listaReceitas");

    if (!lista || typeof receitas === "undefined") {
        return;
    }

    lista.classList.add("gradeReceitas");

    // Cards das receitas
    lista.innerHTML = receitas
        .map(
            (receita) => `
                <li class="cardReceita" data-id="${receita.id}" tabindex="0">
                    <div class="imagemReceitaComCredito">
                        <img
                            src="Imagens/receitas/cards/${receita.id}.jpg"
                            alt="${receita.nome}"
                            loading="lazy"
                        >
                        <span class="creditoImagemIa">Midia gerada por I.A.</span>
                    </div>

                    <div class="corpoCardReceita">
                        <h3>${receita.nome}</h3>

                        <p class="textoSecundario">
                            ${receita.categoria}
                        </p>

                        <p class="textoSecundario">
                            ${receita.calorias} kcal ·
                            ${receita.proteinas}g de proteína
                        </p>

                        ${botoesDaReceita(Number(receita.id))}
                    </div>
                </li>
            `
        )
        .join("");

    // Falhas nas imagens
    lista.querySelectorAll("img").forEach((imagem) => {
        imagem.addEventListener("error", function () {
            this.style.display = "none";
        });
    });

    // Seleção do card
    lista.addEventListener("click", function (evento) {
        const card = evento.target.closest(".cardReceita");

        if (!card) return;

        const id = Number(card.dataset.id);
        const receita = buscarReceita(id);

        if (receita) {
            abrirReceita(receita);
        }
    });

    // Seleção pelo teclado
    lista.addEventListener("keydown", function (evento) {
        if (
            evento.target.classList.contains("cardReceita") &&
            (evento.key === "Enter" || evento.key === " ")
        ) {
            evento.preventDefault();
            evento.target.click();
        }
    });
}

/*=== Janela da receita ===*/

function abrirReceita(receita) {
    const modal = document.createElement("div");
    modal.className = "modalReceita";

    modal.innerHTML = `
        <div class="conteudoModalReceita">
            <button class="fecharModal" aria-label="Fechar">
                &times;
            </button>

            <div class="imagemModalComCredito">
                <img
                    class="imagemModalReceita"
                    src="Imagens/receitas/cards/${receita.id}.jpg"
                    alt="${receita.nome}"
                >
                <span class="creditoImagemIa">Midia gerada por I.A.</span>
            </div>

            <div class="informacoesModalReceita">
                <p class="textoSecundario">
                    ${receita.categoria}
                </p>

                <h2>${receita.nome}</h2>

                ${botoesDaReceita(receita.id)}

                <div class="dadosNutricionais">
                    <div>
                        <strong>${receita.calorias}</strong>
                        <span>Calorias</span>
                    </div>

                    <div>
                        <strong>${receita.proteinas}g</strong>
                        <span>Proteínas</span>
                    </div>

                    <div>
                        <strong>${receita.carboidratos}g</strong>
                        <span>Carboidratos</span>
                    </div>
                </div>

                <h3>Ingredientes</h3>
                <p>${receita.ingredientes || "Ingredientes não informados."}</p>

                <h3>Modo de preparo</h3>
                <p>${receita.preparo || "Modo de preparo não informado."}</p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Rolagem da página
    const rolagemAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function fecharReceita() {
        modal.remove();
        document.body.style.overflow = rolagemAnterior;
        document.removeEventListener("keydown", fecharComEsc);
    }

    // Botão de fechar
    modal.querySelector(".fecharModal").addEventListener("click", () => {
        fecharReceita();
    });

    // Clique fora da janela
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) {
            fecharReceita();
        }
    });

    // Tecla Escape
    function fecharComEsc(evento) {
        if (
            evento.key === "Escape" &&
            !document.querySelector(".seletorCardapio[open]")
        ) {
            fecharReceita();
        }
    }

    document.addEventListener("keydown", fecharComEsc);
}

/*=== Receitas favoritas ===*/

let somenteFavoritas = false;

let favoritas = lerEscolhas("receitasFavoritas", []);

if (!Array.isArray(favoritas)) {
    favoritas = [];
}

for (let indice = 0; indice < favoritas.length; indice++) {
    favoritas[indice] = Number(favoritas[indice]);
}

function botoesDaReceita(id) {
    const favorita = favoritas.includes(id);
    let texto = "♡ Favoritar";

    if (favorita) {
        texto = "♥ Favoritada";
    }

    return `
        <div class="acoesReceita">
            <button
                type="button"
                class="botao botaoPequeno botaoContorno"
                data-receita-acao="favoritar"
                data-id="${id}"
                aria-pressed="${favorita}"
            >
                ${texto}
            </button>

            <button
                type="button"
                class="botao botaoPequeno"
                data-receita-acao="adicionar"
                data-id="${id}"
            >
                + Cardápio
            </button>
        </div>
    `;
}

function atualizarFavoritas() {
    const botoes = document.querySelectorAll(
        '[data-receita-acao="favoritar"]'
    );

    for (const botao of botoes) {
        const id = Number(botao.dataset.id);
        const favorita = favoritas.includes(id);

        botao.setAttribute("aria-pressed", favorita);

        if (favorita) {
            botao.textContent = "♥ Favoritada";
        } else {
            botao.textContent = "♡ Favoritar";
        }
    }

    const total = document.querySelector("#totalFavoritas");

    if (total) {
        total.textContent = favoritas.length;
    }
}

function favoritarReceita(id) {
    if (!buscarReceita(id)) {
        return;
    }

    if (favoritas.includes(id)) {
        favoritas = favoritas.filter(function (item) {
            return item !== id;
        });
    } else {
        favoritas.push(id);
    }

    localStorage.setItem("receitasFavoritas", JSON.stringify(favoritas));

    atualizarFavoritas();
    filtrarReceitas();
}

/*=== Filtros das receitas ===*/

const restricoesPorId = new Map();
const restricoesSelecionadas = new Set();

async function iniciarFiltrosAlimentares() {
    const botoes = document.querySelectorAll('[data-acao="filtroRestricao"]');

    if (!botoes.length) return;

    const nomes = {
        lactose: "sem lactose",
        gluten: "sem gluten",
        ovo: "sem ovo",
        vegetariano: "vegetariano"
    };

    for (const botao of botoes) {
        botao.disabled = true;
        botao.setAttribute("aria-pressed", "false");
    }

    try {
        const resposta = await fetch("receitas.json");

        if (!resposta.ok) throw new Error("Falha ao carregar receitas.json");

        const catalogo = await resposta.json();
        const disponiveis = new Set();

        for (const receita of catalogo) {
            const restricoes = (receita.restricoes || []).map(normalizarTexto);
            restricoesPorId.set(Number(receita.id), restricoes);

            for (const restricao of restricoes) {
                disponiveis.add(restricao);
            }
        }

        for (const botao of botoes) {
            const restricao = nomes[botao.dataset.valor];

            if (!disponiveis.has(restricao)) {
                botao.title = "Nenhuma receita cadastrada com esse filtro";
                continue;
            }

            botao.disabled = false;
            botao.addEventListener("click", function () {
                const ativo = !restricoesSelecionadas.has(restricao);

                if (ativo) {
                    restricoesSelecionadas.add(restricao);
                } else {
                    restricoesSelecionadas.delete(restricao);
                }

                botao.classList.toggle("ativo", ativo);
                botao.setAttribute("aria-pressed", String(ativo));
                filtrarReceitas();
            });
        }
    } catch (erro) {
        console.error("Falha ao carregar os filtros alimentares.", erro);
        for (const botao of botoes) {
            botao.title = "Filtros alimentares indisponíveis";
        }
    }
}

function normalizarTexto(texto) {
    return (texto || "")
        .trim()
        .toLocaleLowerCase("pt-BR")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function filtrarReceitas() {
    const campoBusca = document.querySelector("#campoBuscaReceitas");
    const filtroCategoria = document.querySelector("#filtroCategoria");
    const filtrosAtivos = Array.from(restricoesSelecionadas);
    const termo = normalizarTexto(campoBusca?.value);
    const categoria = filtroCategoria?.value || "";
    const cards = document.querySelectorAll("#listaReceitas .cardReceita");

    for (const card of cards) {
        const id = Number(card.dataset.id);
        const receita = buscarReceita(id);

        if (!receita) {
            card.hidden = true;
            continue;
        }

        const correspondeTexto = normalizarTexto(receita.nome).includes(termo) ||
            normalizarTexto(receita.ingredientes).includes(termo);
        const correspondeCategoria = categoria === "" || receita.categoria === categoria;
        const correspondeFavoritas = !somenteFavoritas || favoritas.includes(id);

        const restricoes = restricoesPorId.get(id) || [];
        const correspondeRestricoes = filtrosAtivos.every(
            restricao => restricoes.includes(restricao)
        );

        card.hidden = !(correspondeTexto && correspondeCategoria &&
            correspondeFavoritas && correspondeRestricoes);
    }
}

/*=== Dias e refeições do cardápio ===*/

const diasCardapio = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
    "Domingo"
];

const refeicoesCardapio = [
    "Café da manhã",
    "Almoço",
    "Lanche",
    "Jantar"
];

let diaCardapio = 0;

const cardapioSalvo = lerEscolhas("cardapioSemanal", []);
let semanaCardapio = [];

for (let dia = 0; dia < diasCardapio.length; dia++) {
    semanaCardapio[dia] = [];

    for (let refeicao = 0; refeicao < refeicoesCardapio.length; refeicao++) {
        let itens = cardapioSalvo?.[dia]?.[refeicao];

        if (!Array.isArray(itens)) {
            itens = [];
        }

        semanaCardapio[dia][refeicao] = [];

        for (const id of itens) {
            semanaCardapio[dia][refeicao].push(Number(id));
        }
    }
}

/*=== Resumo e exibição do cardápio ===*/

function calcularResumo(dia) {
    const total = {
        calorias: 0,
        proteinas: 0,
        carboidratos: 0
    };

    for (const refeicao of semanaCardapio[dia]) {
        for (const id of refeicao) {
            const receita = buscarReceita(id);

            if (receita) {
                total.calorias += Number(receita.calorias) || 0;
                total.proteinas += Number(receita.proteinas) || 0;
                total.carboidratos += Number(receita.carboidratos) || 0;
            }
        }
    }

    return total;
}

function exibirCardapio() {
    const lista = document.querySelector("#listaRefeicoes");

    if (!lista || typeof receitas === "undefined") {
        return;
    }

    const nomeDia = document.querySelector("#nomeDiaSelecionado");

    if (nomeDia) {
        nomeDia.textContent = diasCardapio[diaCardapio];
    }

    const botoes = document.querySelectorAll(
        '[data-acao="selecionarDia"]'
    );

    for (const botao of botoes) {
        const selecionado = Number(botao.dataset.indice) === diaCardapio;

        botao.classList.toggle("ativo", selecionado);
        botao.setAttribute("aria-pressed", selecionado);
    }

    let conteudo = "";

    for (let indice = 0; indice < refeicoesCardapio.length; indice++) {
        conteudo += `
            <div class="cabecalhoRefeicao">
                <h3>${refeicoesCardapio[indice]}</h3>

                <a class="botao botaoPequeno" href="receitas.html">
                    + Receita
                </a>
            </div>
        `;

        let itens = "";

        for (const id of semanaCardapio[diaCardapio][indice]) {
            const receita = buscarReceita(id);

            if (receita) {
                itens += `
                    <li class="linhaItem">
                        <b>${receita.nome}</b>

                        <button
                            type="button"
                            class="botaoRemover"
                            data-remover-refeicao="${indice}"
                            data-id="${id}"
                            aria-label="Remover ${receita.nome}"
                        >
                            ×
                        </button>
                    </li>
                `;
            }
        }

        if (itens === "") {
            itens = `
                <p class="textoSecundario refeicaoVazia">
                    Nenhuma receita adicionada.
                </p>
            `;
        } else {
            itens = `<ul>${itens}</ul>`;
        }

        conteudo += itens;
    }

    lista.innerHTML = conteudo;

    const total = calcularResumo(diaCardapio);
    const resumoDia = document.querySelector("#resumoDoDia");

    if (resumoDia) {
        const calorias = Math.round(total.calorias);
        const proteinas = Math.round(total.proteinas);
        const carboidratos = Math.round(total.carboidratos);
        const percentualCalorias = Math.min((calorias / 2000) * 100, 100);
        const percentualProteinas = Math.min((proteinas / 100) * 100, 100);
        const percentualCarboidratos = Math.min((carboidratos / 250) * 100, 100);

        resumoDia.innerHTML = `
            <div class="resumoCalorias">
                <strong>${calorias}</strong>
                <span>/ 2000 kcal</span>
            </div>
            <div class="barraProgresso" role="progressbar" aria-label="Calorias" aria-valuenow="${calorias}" aria-valuemin="0" aria-valuemax="2000">
                <i style="--largura: ${percentualCalorias}%"></i>
            </div>
            <div class="resumoNutriente">
                <span>Proteínas ${proteinas}g</span>
                <div class="barraProgresso" role="progressbar" aria-label="Proteínas" aria-valuenow="${proteinas}" aria-valuemin="0" aria-valuemax="100">
                    <i style="--largura: ${percentualProteinas}%"></i>
                </div>
            </div>
            <div class="resumoNutriente">
                <span>Carboidratos ${carboidratos}g</span>
                <div class="barraProgresso" role="progressbar" aria-label="Carboidratos" aria-valuenow="${carboidratos}" aria-valuemin="0" aria-valuemax="250">
                    <i style="--largura: ${percentualCarboidratos}%"></i>
                </div>
            </div>
            <div class="resumoNutriente resumoSemDados">
                <span>Gorduras sem dados disponíveis</span>
                <div class="barraProgresso" aria-hidden="true"><i></i></div>
            </div>
        `;
    }

    const resumoSemana = document.querySelector("#resumoDaSemana");

    if (resumoSemana) {
        let conteudoSemana = "";

        for (let dia = 0; dia < diasCardapio.length; dia++) {
            const resumo = calcularResumo(dia);

            conteudoSemana += `
                <p>
                    ${diasCardapio[dia]}:
                    ${Math.round(resumo.calorias)} kcal
                </p>
            `;
        }

        resumoSemana.innerHTML = conteudoSemana;
    }
}

function salvarCardapio() {
    localStorage.setItem(
        "cardapioSemanal",
        JSON.stringify(semanaCardapio)
    );

    exibirCardapio();
}

/*=== Seleção de dia e refeição ===*/

function escolherRefeicao(id) {
    const receita = buscarReceita(id);

    if (!receita) {
        return;
    }

    let opcoesDias = "";
    let opcoesRefeicoes = "";

    for (let dia = 0; dia < diasCardapio.length; dia++) {
        opcoesDias += `
            <option value="${dia}">${diasCardapio[dia]}</option>
        `;
    }

    for (let indice = 0; indice < refeicoesCardapio.length; indice++) {
        opcoesRefeicoes += `
            <option value="${indice}">
                ${refeicoesCardapio[indice]}
            </option>
        `;
    }

    const modal = document.createElement("dialog");
    modal.className = "seletorCardapio";
    modal.setAttribute("aria-labelledby", "tituloAdicionarCardapio");

    modal.innerHTML = `
        <form>
            <h2 id="tituloAdicionarCardapio">Adicionar ao cardápio</h2>

            <p>${receita.nome}</p>

            <label>
                Dia
                <select name="dia">${opcoesDias}</select>
            </label>

            <label>
                Refeição
                <select name="refeicao">${opcoesRefeicoes}</select>
            </label>

            <p role="status"></p>

            <div class="acoesReceita">
                <button class="botao" type="submit">
                    Adicionar
                </button>

                <button class="botao botaoContorno" type="button">
                    Fechar
                </button>
            </div>
        </form>
    `;

    document.body.appendChild(modal);

    modal.addEventListener("close", function () {
        modal.remove();
    });

    modal.querySelector('[type="button"]').onclick = function () {
        modal.close();
    };

    modal.querySelector("form").onsubmit = function (evento) {
        evento.preventDefault();

        const dia = Number(modal.querySelector('[name="dia"]').value);
        const refeicao = Number(
            modal.querySelector('[name="refeicao"]').value
        );

        const itens = semanaCardapio[dia][refeicao];
        const mensagem = modal.querySelector('[role="status"]');

        if (itens.includes(id)) {
            mensagem.textContent = "Essa receita já está nessa refeição.";
            return;
        }

        itens.push(id);
        salvarCardapio();

        mensagem.textContent =
            `Adicionada em ${diasCardapio[dia]}, ` +
            `${refeicoesCardapio[refeicao]}.`;
    };

    modal.showModal();
}

/*=== Eventos das receitas e do cardápio ===*/

function tratarCliqueReceitas(evento) {
    const botao = evento.target.closest(
        "[data-receita-acao], [data-remover-refeicao], [data-acao]"
    );

    if (!botao) {
        return;
    }

    const id = Number(botao.dataset.id);

    if (botao.dataset.receitaAcao) {
        evento.stopPropagation();

        if (botao.dataset.receitaAcao === "favoritar") {
            favoritarReceita(id);
        } else if (botao.dataset.receitaAcao === "adicionar") {
            escolherRefeicao(id);
        }
    } else if (botao.hasAttribute("data-remover-refeicao")) {
        const indice = Number(botao.dataset.removerRefeicao);

        if (
            !Number.isInteger(indice) ||
            indice < 0 ||
            indice >= refeicoesCardapio.length
        ) {
            return;
        }

        semanaCardapio[diaCardapio][indice] =
            semanaCardapio[diaCardapio][indice].filter(function (item) {
                return item !== id;
            });

        salvarCardapio();
    } else if (botao.dataset.acao === "filtroFavoritas") {
        somenteFavoritas = !somenteFavoritas;

        botao.classList.toggle("ativo", somenteFavoritas);
        botao.setAttribute("aria-pressed", somenteFavoritas);

        filtrarReceitas();
    } else if (botao.dataset.acao === "selecionarDia") {
        const indice = Number(botao.dataset.indice);

        if (
            Number.isInteger(indice) &&
            indice >= 0 &&
            indice < diasCardapio.length
        ) {
            diaCardapio = indice;
            exibirCardapio();
        }
    } else if (botao.dataset.acao === "limparSemana") {
        for (const dia of semanaCardapio) {
            for (let refeicao = 0; refeicao < dia.length; refeicao++) {
                dia[refeicao] = [];
            }
        }

        salvarCardapio();
    }
}

function iniciarCardapio() {
    atualizarFavoritas();
    exibirCardapio();
    filtrarReceitas();

    const campoBusca = document.querySelector("#campoBuscaReceitas");
    const filtroCategoria = document.querySelector("#filtroCategoria");

    if (campoBusca) {
        campoBusca.addEventListener("input", filtrarReceitas);
    }

    if (filtroCategoria) {
        filtroCategoria.addEventListener("change", filtrarReceitas);
    }

    document.addEventListener("click", tratarCliqueReceitas, true);
}

/*=== Pratos para entrega ===*/

let receitasEntrega = [];

function exibirReceitasEntrega() {
    const lista = document.querySelector("#listaPratosEntrega");

    if (!lista || typeof receitas === "undefined") {
        return;
    }

    let conteudo = "";

    for (const receita of receitasEntrega) {
        conteudo += `
            <li class="cardReceita">
                <div class="imagemReceitaComCredito">
                    <img
                        src="Imagens/receitas/cards/${receita.id}.jpg"
                        alt="${receita.nome}"
                        loading="lazy"
                    >
                    <span class="creditoImagemIa">Midia gerada por I.A.</span>
                </div>

                <div class="corpoCardReceita">
                    <h3>${receita.nome}</h3>

                    <p class="textoSecundario">
                        ${receita.categoria}
                    </p>

                    <p class="textoSecundario">
                        ${receita.calorias} kcal ·
                        ${receita.proteinas}g de proteína
                    </p>

                    <p class="textoSecundario">
                        ${receita.ingredientes}
                    </p>

                    <p class="preco">
                        ${formatarDinheiro(precoPratoEntrega)}
                    </p>

                    <button
                        type="button"
                        class="botao"
                        data-sacola-acao="adicionar"
                        data-id="${receita.id}"
                    >
                        + Adicionar à sacola
                    </button>
                </div>
            </li>
        `;
    }

    lista.innerHTML = conteudo;
}

/*=== Configuração da sacola ===*/

const precoPratoEntrega = 20;

let sacola = [];
let focoAntesSacola;
let rolagemAntesSacola = "";
let temporizadorAviso;

/*=== Valores e avisos da sacola ===*/

function formatarDinheiro(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function avisarSacola(texto) {
    const aviso = document.getElementById("avisoTemporario");

    if (!aviso) return;

    aviso.setAttribute("role", "status");
    aviso.textContent = texto;
    aviso.classList.add("ativo");

    clearTimeout(temporizadorAviso);

    temporizadorAviso = setTimeout(() => {
        aviso.classList.remove("ativo");
    }, 3500);
}

function salvarDadosSacola(chave, valor) {
    try {
        localStorage.setItem(chave, JSON.stringify(valor));
    } catch {
        avisarSacola(
            "Não foi possível salvar neste navegador. " +
            "As alterações valem apenas enquanto esta página estiver aberta."
        );
    }
}

function pratoDisponivel(id) {
    for (const receita of receitasEntrega) {
        if (Number(receita.id) === id) {
            return true;
        }
    }

    return false;
}

/*=== Total e contadores da sacola ===*/

function calcularTotalSacola() {
    let quantidade = 0;

    for (const item of sacola) {
        quantidade += item.quantidade;
    }

    const subtotal =
        Math.round(quantidade * precoPratoEntrega * 100) / 100;

    const frete = quantidade > 0 && nomeCidade ? taxaEntrega : 0;

    return {
        quantidade,
        subtotal,
        frete,
        total: subtotal + frete
    };
}

function atualizarContadoresSacola() {
    const total = calcularTotalSacola();

    for (const contador of document.querySelectorAll(".contadorSacola")) {
        contador.textContent = total.quantidade;

        contador.hidden =
            contador.classList.contains("seloContador") &&
            total.quantidade === 0;
    }
}

/*=== Itens da sacola ===*/

function alterarSacola(id, acao) {
    if (!pratoDisponivel(id)) return;

    const item = sacola.find(prato => prato.id === id);

    if (acao === "adicionar") {
        if (item && item.quantidade >= 99) {
            avisarSacola("O limite é de 99 unidades por prato.");
            return;
        }

        if (item) {
            item.quantidade++;
        } else {
            sacola.push({
                id,
                quantidade: 1
            });
        }
    } else if (acao === "diminuir" && item) {
        item.quantidade--;
    } else if (acao === "remover" && item) {
        item.quantidade = 0;
    } else {
        return;
    }

    sacola = sacola.filter(prato => prato.quantidade > 0);

    salvarDadosSacola("sacolaEntrega", sacola);
    atualizarContadoresSacola();

    const sobreposicao = document.getElementById("sobreposicaoModal");

    if (sobreposicao?.classList.contains("ativo")) {
        exibirSacola();
    }
}

/*=== Exibição da sacola ===*/

function exibirSacola() {
    const modal = document.getElementById("caixaModalConteudo");

    if (!modal) return;

    const total = calcularTotalSacola();

    const linhas = sacola.map(item => {
        const receita = buscarReceita(item.id);

        return `
            <div class="linhaItem">
                <div>
                    <b>${receita.nome}</b>

                    <div class="quantidadeSacola">
                        <button
                            type="button"
                            class="botao botaoPequeno"
                            data-sacola-acao="diminuir"
                            data-id="${item.id}"
                            aria-label="Diminuir quantidade de ${receita.nome}"
                        >
                            −
                        </button>

                        <span>${item.quantidade}</span>

                        <button
                            type="button"
                            class="botao botaoPequeno"
                            data-sacola-acao="adicionar"
                            data-id="${item.id}"
                            aria-label="Aumentar quantidade de ${receita.nome}"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div class="valorItemSacola">
                    <b>
                        ${formatarDinheiro(
                            precoPratoEntrega * item.quantidade
                        )}
                    </b>

                    <button
                        type="button"
                        class="botaoRemover"
                        data-sacola-acao="remover"
                        data-id="${item.id}"
                        aria-label="Remover ${receita.nome}"
                    >
                        Remover
                    </button>
                </div>
            </div>
        `;
    }).join("");

    modal.innerHTML = `
        <div class="conteudoModal sacolaConteudo">
            <button
                type="button"
                class="botaoFecharModal"
                data-sacola-acao="fechar"
                aria-label="Fechar sacola"
            >
                ×
            </button>

            <h2 id="tituloSacola">Sua sacola</h2>

            <p class="textoSecundario">
                Compra simulada · sem cobrança
            </p>

            ${
                linhas ||
                `<p class="sacolaVazia">
                    Sua sacola está vazia.
                    Adicione um prato para começar.
                </p>`
            }

            <div class="resumoSacola" aria-live="polite">
                <p>
                    Subtotal
                    <b>${formatarDinheiro(total.subtotal)}</b>
                </p>

                <p>
                    Entrega

                    <b>
                        ${
                            nomeCidade
                                ? formatarDinheiro(total.frete)
                                : "Selecione a cidade"
                        }
                    </b>
                </p>

                <p>
                    Total
                    <b>${formatarDinheiro(total.total)}</b>
                </p>
            </div>

            ${
                total.quantidade
                    ? `
                        <label class="cidadeSacola">
                            Cidade de entrega

                            <select id="cidadeSacola">
                                <option value="">Selecione</option>

                                ${listaCidades.map(cidade => `
                                    <option
                                        value="${cidade.nome}"
                                        ${
                                            cidade.nome === nomeCidade
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${cidade.nome} —
                                        ${formatarDinheiro(
                                            cidade.taxaEntrega
                                        )}
                                    </option>
                                `).join("")}
                            </select>
                        </label>

                        <p class="textoSecundario">
                            ${
                                nomeCidade
                                    ? `Previsão: ${tempoEntrega} minutos.`
                                    : "Escolha a cidade para calcular " +
                                      "o total com entrega."
                            }
                        </p>

                        <button
                            type="button"
                            class="botao botaoFinalizarPedido"
                            data-sacola-acao="finalizar"
                            ${nomeCidade ? "" : "disabled"}
                        >
                            Finalizar simulação
                        </button>
                    `
                    : ""
            }
        </div>
    `;
}

function abrirSacola() {
    const sobreposicao = document.getElementById("sobreposicaoModal");
    const modal = document.getElementById("caixaModalConteudo");

    if (!sobreposicao || !modal) return;
    if (sobreposicao.classList.contains("ativo")) return;

    focoAntesSacola = document.activeElement;
    rolagemAntesSacola = document.body.style.overflow;

    exibirSacola();

    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "tituloSacola");

    sobreposicao.classList.add("ativo");
    document.body.style.overflow = "hidden";

    modal.querySelector("button").focus();
}

function fecharSacola() {
    const sobreposicao = document.getElementById("sobreposicaoModal");

    if (!sobreposicao?.classList.contains("ativo")) return;

    sobreposicao.classList.remove("ativo");
    document.body.style.overflow = rolagemAntesSacola;

    focoAntesSacola?.focus();
}

/*=== Finalização da compra simulada ===*/

function finalizarSimulacao() {
    const total = calcularTotalSacola();

    if (!total.quantidade || !nomeCidade) return;

    const area = document.getElementById("areaRastreioPedido");

    if (area) {
        area.setAttribute("role", "status");

        area.textContent =
            `Simulação concluída! ${total.quantidade} prato(s) ` +
            `para ${nomeCidade}. ` +
            `Total: ${formatarDinheiro(total.total)}. ` +
            `Previsão simulada: ${tempoEntrega} minutos. ` +
            "Nenhum pedido real foi enviado.";
    }

    sacola = [];

    salvarDadosSacola("sacolaEntrega", sacola);
    atualizarContadoresSacola();
    fecharSacola();

    avisarSacola("Simulação concluída, sem cobrança.");
}

/*=== Sacola salva ===*/

function recuperarSacola() {
    const dados = lerEscolhas("sacolaEntrega", []);

    if (Array.isArray(dados)) {
        for (const item of dados) {
            if (
                !item ||
                !Number.isInteger(item.id) ||
                !pratoDisponivel(item.id) ||
                !Number.isInteger(item.quantidade) ||
                item.quantidade < 1
            ) {
                continue;
            }

            const existente = sacola.find(
                prato => prato.id === item.id
            );

            if (existente) {
                existente.quantidade = Math.min(
                    99,
                    existente.quantidade + item.quantidade
                );
            } else {
                sacola.push({
                    id: item.id,
                    quantidade: Math.min(99, item.quantidade)
                });
            }
        }
    }

    calcularEntrega(lerEscolhas("cidadeEntrega", null));

    atualizarCidadeEntrega();
    atualizarContadoresSacola();

    const sobreposicao = document.getElementById("sobreposicaoModal");

    sobreposicao?.addEventListener("click", function (evento) {
        if (evento.target === sobreposicao) {
            fecharSacola();
        }
    });
}

/*=== Eventos da sacola ===*/

document.addEventListener("click", function (evento) {
    const botao = evento.target.closest(
        "[data-sacola-acao], [data-acao='abrirSacola']"
    );

    if (!botao) return;

    const acao = botao.dataset.sacolaAcao;

    if (botao.dataset.acao === "abrirSacola") {
        abrirSacola();
    } else if (acao === "fechar") {
        fecharSacola();
    } else if (acao === "finalizar") {
        finalizarSimulacao();
    } else {
        const id = Number(botao.dataset.id);

        alterarSacola(id, acao);

        const modal = document.getElementById("caixaModalConteudo");
        const sobreposicao = document.getElementById("sobreposicaoModal");

        if (sobreposicao?.classList.contains("ativo")) {
            const proximo = modal.querySelector(
                `[data-sacola-acao="${acao}"][data-id="${id}"]`
            );

            (proximo || modal.querySelector("button"))?.focus();
        }
    }
});

document.addEventListener("change", function (evento) {
    if (evento.target.id !== "cidadeSacola") return;

    const cidade = calcularEntrega(evento.target.value);

    if (!cidade) {
        nomeCidade = undefined;
        taxaEntrega = undefined;
        tempoEntrega = undefined;
    }

    salvarDadosSacola("cidadeEntrega", nomeCidade || null);

    atualizarCidadeEntrega();
    exibirSacola();

    document.getElementById("cidadeSacola")?.focus();
});

document.addEventListener("keydown", function (evento) {
    const sobreposicao = document.getElementById("sobreposicaoModal");

    if (!sobreposicao?.classList.contains("ativo")) return;

    if (evento.key === "Escape") {
        fecharSacola();
    }

    if (evento.key === "Tab") {
        const controles = sobreposicao.querySelectorAll(
            "button:not([disabled]), select"
        );

        const primeiro = controles[0];
        const ultimo = controles[controles.length - 1];

        if (evento.shiftKey && document.activeElement === primeiro) {
            evento.preventDefault();
            ultimo?.focus();
        } else if (
            !evento.shiftKey &&
            document.activeElement === ultimo
        ) {
            evento.preventDefault();
            primeiro?.focus();
        }
    }
});

/*=== Inicialização da página ===*/

function iniciarPagina() {
    if (typeof receitas !== "undefined") {
        for (const receita of receitas) {
            receitasPorId.set(Number(receita.id), receita);
        }

        receitasEntrega = receitas.slice(0, 8);
    }

    iniciarCidades();
    recuperarPerfilUsuario();
    iniciarFiltroDicas();
    exibirReceitas();
    iniciarFiltrosAlimentares();
    exibirReceitasEntrega();
    iniciarCardapio();
    recuperarSacola();

    const botaoSalvarPerfil = document.getElementById("salvarPerfil");

    if (botaoSalvarPerfil) {
        botaoSalvarPerfil.addEventListener("click", function (evento) {
            evento.preventDefault();
            salvarPerfil();
        });
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarPagina, {
        once: true
    });
} else {
    iniciarPagina();
}