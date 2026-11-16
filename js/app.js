/*  animação de seleção  */
function mudarCor(botao) {
  botao.style.backgroundColor = "#5e7745";
  botao.style.color = "#FFFFFF";
  botao.querySelector(".textoSecundario").style.color = "#FFFFFF";
}

/*=== Entregas ===*/

let nomeCidade;
let taxaEntrega;
let tempoEntrega;

const listaCidades = [
  { nome: "Joinville", tempoEntrega: 35, taxaEntrega: 6 },
  { nome: "Araquari", tempoEntrega: 45, taxaEntrega: 8 },
  { nome: "São Francisco do Sul", tempoEntrega: 50, taxaEntrega: 9 },
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

const botoesCidade = document.querySelectorAll(".opcaoCidade");
for (const botao of botoesCidade) {
  botao.addEventListener("click", function () {
    let cidadeSelecionada = botao.dataset.valor;
    let entrega = calcularEntrega(cidadeSelecionada);

    if (entrega) {
      console.log(entrega.nomeCidade);
      console.log(entrega.taxaEntrega);
      console.log(entrega.tempoEntrega);
    }
  });
}

/*=== Perfil do usuário ===*/

const listaObjetivos = [
  { nome: "Perder peso", objKal: 0.8, objProteina: 1 },
  { nome: "Manter peso", objKal: 1, objProteina: 1 },
  { nome: "Ganhar peso", objKal: 1.4, objProteina: 1 },
  { nome: "Ganhar musculo", objKal: 1.2, objProteina: 1.3 },
];

const listaRestricoesAlimentares = ["glúten", "lactose", "vegetariano", "ovo"];

const listaNiveisAtividadeFisica = [
  { nome: "Sedentário", fatorAtividade: 1 },
  { nome: "Leve", fatorAtividade: 1.2 },
  { nome: "Moderada", fatorAtividade: 1.325 },
  { nome: "Intensa", fatorAtividade: 1.5 },
];

const objetivosPorValor = {
  perder: "Perder peso",
  manter: "Manter peso",
  ganhar: "Ganhar peso",
  musculo: "Ganhar musculo",
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
    (nivel) => nivel.nome === nivelAtividadeFisicaUsuario,
  );

  let objetivo = listaObjetivos.find((item) => item.nome === objetivoUsuario);

  if (!atividade || !objetivo) {
    return 0;
  }

  let calorias = metabolismo * atividade.fatorAtividade * objetivo.objKal;

  return calorias;
}

function calcularProteina() {
  let peso = Number(pesoUsuario);

  let objetivo = listaObjetivos.find((item) => item.nome === objetivoUsuario);

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
    document.getElementById("atividade").value,
  );

  const objetivoSelecionado = document.getElementById("objetivo").value;

  nivelAtividadeFisicaUsuario =
    listaNiveisAtividadeFisica[atividadeSelecionada].nome;

  objetivoUsuario = objetivosPorValor[objetivoSelecionado];

  restricaoAlimentarUsuario = Array.from(
    document.querySelectorAll('input[name="restricoes"]:checked'),
  ).map((input) => input.value);
}

/*=== Salvar perfil ===*/

function salvarPerfil() {
  calcularPerfilUsuario();

  if (!pesoUsuario || !alturaUsuario || !idadeUsuario) {
    alert("Preencha todos os campos obrigatórios!");
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
    nivelAtividadeFisicaUsuario,
  );

  localStorage.setItem("objetivoUsuario", objetivoUsuario);

  localStorage.setItem(
    "restricaoAlimentarUsuario",
    JSON.stringify(restricaoAlimentarUsuario),
  );

  localStorage.setItem(
    "gostosUsuario",
    document.getElementById("gostos").value,
  );
}

const botaoSalvarPerfil = document.getElementById("salvarPerfil");

if (botaoSalvarPerfil) {
  botaoSalvarPerfil.addEventListener("click", salvarPerfil);
}

/*=== Recuperar perfil do usuário ===*/

document.addEventListener("DOMContentLoaded", function () {
  // Recuperar informações do localStorage
  pesoUsuario = localStorage.getItem("pesoUsuario");
  alturaUsuario = localStorage.getItem("alturaUsuario");
  idadeUsuario = localStorage.getItem("idadeUsuario");
  sexoUsuario = localStorage.getItem("sexoUsuario");

  nivelAtividadeFisicaUsuario = localStorage.getItem(
    "nivelAtividadeFisicaUsuario",
  );

  objetivoUsuario = localStorage.getItem("objetivoUsuario");

  restricaoAlimentarUsuario = JSON.parse(
    localStorage.getItem("restricaoAlimentarUsuario") || "[]",
  );

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
    (nivel) => nivel.nome === nivelAtividadeFisicaUsuario,
  );

  if (indiceAtividade !== -1) {
    document.getElementById("atividade").value = indiceAtividade;
  }

  // Recuperar objetivo
  const valorObjetivo = Object.keys(objetivosPorValor).find(
    (key) => objetivosPorValor[key] === objetivoUsuario,
  );

  if (valorObjetivo) {
    document.getElementById("objetivo").value = valorObjetivo;
  }

  // Recuperar restrições alimentares
  document.querySelectorAll('input[name="restricoes"]').forEach((checkbox) => {
    checkbox.checked = restricaoAlimentarUsuario.includes(checkbox.value);
  });
});

/*=== Filtro de Dicas ===*/

const botoesObjetivo = document.querySelectorAll(
  '[data-acao="selecionarObjetivo"]',
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

/*=== Exibir receitas ===*/

document.addEventListener("DOMContentLoaded", function () {
  const lista = document.getElementById("listaReceitas");

  if (!lista || typeof receitas === "undefined") {
    return;
  }

  lista.classList.add("gradeReceitas");

  lista.innerHTML = receitas
    .map(
      (receita) => `
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
    `,
    )
    .join("");

  lista.querySelectorAll("img").forEach((imagem) => {
    imagem.addEventListener("error", function () {
      this.style.display = "none";
    });
  });
});
/*=== Exibir receitas e modal ===*/

document.addEventListener("DOMContentLoaded", function () {
  const lista = document.getElementById("listaReceitas");

  if (!lista || typeof receitas === "undefined") {
    return;
  }

  lista.classList.add("gradeReceitas");

  // 1. Renderiza os cards injetando o data-id correto em cada receita
  lista.innerHTML = receitas
    .map(
      (receita) => `
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
    `,
    )
    .join("");

  // Oculta imagens que falharem ao carregar
  lista.querySelectorAll("img").forEach((imagem) => {
    imagem.addEventListener("error", function () {
      this.style.display = "none";
    });
  });

  // 2. Função para criar e abrir a janela da receita
  function abrirReceita(receita) {
    const modal = document.createElement("div");
    modal.className = "modalReceita";

    modal.innerHTML = `
            <div class="conteudoModalReceita">

                <button class="fecharModal" aria-label="Fechar">
                    &times;
                </button>

                <img
                    class="imagemModalReceita"
                    src="Imagens/receitas/cards/${receita.id}.jpg"
                    alt="${receita.nome}"
                >

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

    // Tira o scroll do fundo da página enquanto o modal estiver aberto
    document.body.style.overflow = "hidden";

    function fecharReceita() {
      modal.remove();
      document.body.style.overflow = "";
      document.removeEventListener("keydown", fecharComEsc);
    }

    // Fechar pelo botão de fechar
    modal.querySelector(".fecharModal").addEventListener("click", () => {
      fecharReceita();
    });

    // Fechar tocando na área externa do modal
    modal.addEventListener("click", (evento) => {
      if (evento.target === modal) {
        fecharReceita();
      }
    });

    // Fechar com a tecla ESC
    function fecharComEsc(evento) {
      if (evento.key === "Escape") {
        fecharReceita();
        document.removeEventListener("keydown", fecharComEsc);
      }
    }

    document.addEventListener("keydown", fecharComEsc);
  }

  // 3. Ouvinte para abrir a receita ao clicar ou tocar no card
  lista.addEventListener("click", function (evento) {
    const card = evento.target.closest(".cardReceita");

    if (!card) return;

    const id = Number(card.dataset.id);
    const receita = receitas.find((item) => item.id === id);

    if (receita) {
      abrirReceita(receita);
    }
  });

  // 4. Permitir abrir usando Enter ou Espaço (acessibilidade)
  lista.addEventListener("keydown", function (evento) {
    if (
      evento.target.classList.contains("cardReceita") &&
      (evento.key === "Enter" || evento.key === " ")
    ) {
      evento.preventDefault();
      evento.target.click();
    }
  });
});





/*=== Exibir receitas na página de Entrega ===*/

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
let somenteFavoritas = false;

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

let favoritas = lerEscolhas("receitasFavoritas", []);

if (!Array.isArray(favoritas)) {
    favoritas = [];
}

for (let indice = 0; indice < favoritas.length; indice++) {
    favoritas[indice] = Number(favoritas[indice]);
}

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

function buscarReceita(id) {
    if (typeof receitas === "undefined") {
        return;
    }

    for (const receita of receitas) {
        if (Number(receita.id) === id) {
            return receita;
        }
    }
}

function exibirReceitasEntrega() {
    const lista = document.querySelector("#listaPratosEntrega");

    if (!lista || typeof receitas === "undefined") {
        return;
    }

    let conteudo = "";

    for (const receita of receitas.slice(0, 8)) {
        conteudo += `
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

                    <p class="textoSecundario">
                        ${receita.ingredientes}
                    </p>
                </div>
            </article>
        `;
    }

    lista.innerHTML = conteudo;
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
                <h4>${refeicoesCardapio[indice]}</h4>

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
                    <div class="linhaItem">
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
                    </div>
                `;
            }
        }

        if (itens === "") {
            itens = `
                <p class="textoSecundario refeicaoVazia">
                    Nenhuma receita adicionada.
                </p>
            `;
        }

        conteudo += itens;
    }

    lista.innerHTML = conteudo;

    const total = calcularResumo(diaCardapio);
    const resumoDia = document.querySelector("#resumoDoDia");

    if (resumoDia) {
        resumoDia.textContent =
            `${Math.round(total.calorias)} kcal · ` +
            `${Math.round(total.proteinas)} g de proteínas · ` +
            `${Math.round(total.carboidratos)} g de carboidratos`;
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

    modal.innerHTML = `
        <form>
            <h3>Adicionar ao cardápio</h3>

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

function filtrarReceitas() {
    const campoBusca = document.querySelector("#campoBuscaReceitas");
    const filtroCategoria = document.querySelector("#filtroCategoria");

    let busca = "";
    let categoria = "";

    if (campoBusca) {
        busca = campoBusca.value.trim().toLocaleLowerCase("pt-BR");
    }

    if (filtroCategoria) {
        categoria = filtroCategoria.value;
    }

    const cards = document.querySelectorAll("#listaReceitas .cardReceita");

    for (const card of cards) {
        const id = Number(card.dataset.id);
        const receita = buscarReceita(id);

        if (!receita) {
            card.hidden = true;
            continue;
        }

        const texto = `${receita.nome} ${receita.ingredientes}`
            .toLocaleLowerCase("pt-BR");

        let mostrar = true;

        if (somenteFavoritas && !favoritas.includes(id)) {
            mostrar = false;
        }

        if (categoria !== "" && receita.categoria !== categoria) {
            mostrar = false;
        }

        if (!texto.includes(busca)) {
            mostrar = false;
        }

        card.hidden = !mostrar;
    }
}

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

        if (Number.isInteger(indice) && indice >= 0 &&
            indice < diasCardapio.length) {
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

document.addEventListener("DOMContentLoaded", function () {
    exibirReceitasEntrega();

    const cards = document.querySelectorAll("#listaReceitas .cardReceita");

    for (const card of cards) {
        const corpo = card.querySelector(".corpoCardReceita");
        const id = Number(card.dataset.id);

        if (corpo && !corpo.querySelector(".acoesReceita")) {
            corpo.insertAdjacentHTML("beforeend", botoesDaReceita(id));
        }
    }

    atualizarFavoritas();
    exibirCardapio();

    const campoBusca = document.querySelector("#campoBuscaReceitas");
    const filtroCategoria = document.querySelector("#filtroCategoria");

    if (campoBusca) {
        campoBusca.addEventListener("input", filtrarReceitas);
    }

    if (filtroCategoria) {
        filtroCategoria.addEventListener("change", filtrarReceitas);
    }

    document.addEventListener("click", tratarCliqueReceitas, true);
});