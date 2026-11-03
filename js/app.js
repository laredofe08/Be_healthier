
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

const botoesCidade = document.querySelectorAll(".opcaoCidade");

for (const botao of botoesCidade) {
    botao.onclick = function () {
        let cidadeSelecionada = botao.dataset.valor;
        let entrega = calcularEntrega(cidadeSelecionada);

        if (entrega) {
            console.log(entrega.nomeCidade);
            console.log(entrega.taxaEntrega);
            console.log(entrega.tempoEntrega);
        }
    };
}


/*=== Perfil do usuário ===*/

const listaObjetivos = [
    { nome: "Perder peso", objKal: 0.8, objProteina: 1 },
    { nome: "Manter peso", objKal: 1, objProteina: 1 },
    { nome: "Ganhar peso", objKal: 1.4, objProteina: 1 },
    { nome: "Ganhar musculo", objKal: 1.2, objProteina: 1.3 }
];

const listaRestricoesAlimentares = [
    "glúten", "lactose", "vegetariano", "ovo"
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
        nivel => nivel.nome === nivelAtividadeFisicaUsuario
    );

    let objetivo = listaObjetivos.find(
        item => item.nome === objetivoUsuario
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
        item => item.nome === objetivoUsuario
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


/*=== Capturar informações do formulário ===*/

function calcularPerfilUsuario() {
    pesoUsuario = document.getElementById("peso").value;
    alturaUsuario = document.getElementById("altura").value;
    idadeUsuario = document.getElementById("idade").value;
    sexoUsuario = document.getElementById("sexo").value;

    const atividadeSelecionada = Number(
        document.getElementById("atividade").value
    );

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

document.getElementById("salvarPerfil")
    .addEventListener("click", salvarPerfil);


/*=== Recuperar perfil do usuário ===*/

document.addEventListener("DOMContentLoaded", function() {

    // Recuperar informações
    pesoUsuario = localStorage.getItem("pesoUsuario");
    alturaUsuario = localStorage.getItem("alturaUsuario");
    idadeUsuario = localStorage.getItem("idadeUsuario");
    sexoUsuario = localStorage.getItem("sexoUsuario");

    nivelAtividadeFisicaUsuario =
        localStorage.getItem("nivelAtividadeFisicaUsuario");

    objetivoUsuario = localStorage.getItem("objetivoUsuario");

    restricaoAlimentarUsuario = JSON.parse(
        localStorage.getItem("restricaoAlimentarUsuario") || "[]"
    );

    const gostosUsuario = localStorage.getItem("gostosUsuario");

    // Verificar se existe perfil salvo
    if (pesoUsuario === null) {
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
        nivel => nivel.nome === nivelAtividadeFisicaUsuario
    );

    if (indiceAtividade !== -1) {
        document.getElementById("atividade").value = indiceAtividade;
    }

    // Recuperar objetivo
    const valorObjetivo = Object.keys(objetivosPorValor).find(
        key => objetivosPorValor[key] === objetivoUsuario
    );

    if (valorObjetivo) {
        document.getElementById("objetivo").value = valorObjetivo;
    }

    // Recuperar restrições alimentares
    document.querySelectorAll('input[name="restricoes"]').forEach(
        checkbox => {
            checkbox.checked = restricaoAlimentarUsuario.includes(
                checkbox.value
            );
        }
    );

});
