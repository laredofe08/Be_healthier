/*=== entregas ===*/
let nomeCidade;
let taxaEntrega;
let tempoEntrega;
const listaCidades = [
    { nome: "Joinville", tempoEntrega: 35, taxaEntrega: 6 },
    { nome: "Araquari", tempoEntrega: 45, taxaEntrega: 8 },
    { nome: "São Francisco do Sul", tempoEntrega: 50, taxaEntrega: 9 }
]
function calcularEntrega(cidadeSelecionada) {
    for (const cidade of listaCidades) {
        if (cidadeSelecionada == cidade.nome) {
            nomeCidade = cidade.nome;
            taxaEntrega = cidade.taxaEntrega;
            tempoEntrega = cidade.tempoEntrega;
            return { nomeCidade, taxaEntrega, tempoEntrega };
        }

    }
}
const botoesCidade = document.querySelectorAll(".opcaoCidade");

for (const botao of botoesCidade) {
    botao.onclick = function () {
        let cidadeSelecionada = botao.dataset.valor;
        let entrega = calcularEntrega(cidadeSelecionada);
        console.log(entrega.nomeCidade);
        console.log(entrega.taxaEntrega);
        console.log(entrega.tempoEntrega)
    };
}









/*=== Perfil do usuário ===*/

const listaObjetivos = [
    { nome: "Perder peso", objKal: 0.8, objProteina: 1},
    { nome: "Manter peso", objKal: 1, objProteina: 1},
    { nome: "Ganhar peso", objKal: 1.4, objProteina: 1},
    { nome: "Ganhar musculo", objKal: 1.2, objProteina: 1.3}
]
const listaRestricoesAlimentares = [
    "glúten", "lactose", "vegetariano", "ovo"
]

const listaNiveisAtividadeFisica = [
    { nome: "Sedentário", fatorAtividade: 1 },
    { nome: "Leve", fatorAtividade: 1.2 },
    { nome: "Moderada", fatorAtividade: 1.325 },
    { nome: "Intensa", fatorAtividade: 1.5 },
]
let pesoUsuario;
let alturaUsuario;
let idadeUsuario;
let sexoUsuario;
let nivelAtividadeFisicaUsuario;
let objetivoUsuario = [];
let restricaoAlimentarUsuario = [];


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
        nivel => nivel.nome === nivelAtividadeFisicaUsuario
    );

    let objetivo = listaObjetivos.find(
        item => item.nome === objetivoUsuario
    );

    let calorias = metabolismo * atividade.fatorAtividade * objetivo.objKal;

    return calorias;
}

function calcularProteina() {
    let peso = Number(pesoUsuario);

    let objetivo = listaObjetivos.find(
        item => item.nome === objetivoUsuario
    );

    let proteina = peso * 1.2 * objetivo.objProteina;

    return proteina;
}

function calcularAgua() {
    let peso = Number(pesoUsuario);

    let agua = peso * 35;

    return agua;
}











/*=== Calculo Dietas ===*/

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
    metaCarboidrato = (metaCalorias * 0.50) / 4;

    return metaCarboidrato;
}

function calcularMetaGordura() {
    metaGordura = (metaCalorias * 0.30) / 9;

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

function calcularPerfilUsuario() {
    pesoUsuario = document.getElementById("peso").value;
    alturaUsuario = document.getElementById("altura").value;
    idadeUsuario = document.getElementById("idade").value;
    sexoUsuario = document.getElementById("sexo").value;

    const atividadeSelecionada = Number(
        document.getElementById("atividade").value
    );

    const objetivosPorValor = {
        perder: "Perder peso",
        manter: "Manter peso",
        ganhar: "Ganhar peso",
        musculo: "Ganhar musculo"
    };

    const objetivoSelecionado =
        document.getElementById("objetivo").value;

    nivelAtividadeFisicaUsuario =
        listaNiveisAtividadeFisica[atividadeSelecionada].nome;

    objetivoUsuario = objetivosPorValor[objetivoSelecionado];

    restricaoAlimentarUsuario = Array.from(
        document.querySelectorAll(
            'input[name="restricoes"]:checked'
        )
    ).map(input => input.value);
}

/*=== botao salvar ===*/

function salvarPerfil() {
    calcularPerfilUsuario();
    calcularMetaCalorias();
    calcularMetaProteina();
    calcularMetaCarboidrato();
    calcularMetaGordura();
    calcularMetaFibras();
    calcularMetaSodio();
}
document.getElementById("salvarPerfil")
    .addEventListener("click", salvarPerfil);
