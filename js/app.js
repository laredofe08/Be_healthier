/*===entregas===*/
let nomeCidade;
let taxaEntrega;
let tempoEntrega;
const listaCidades = [
    { nome: "Joinville", tempoEntrega: 50, taxaEntrega: 5 },
    { nome: "Araquari", tempoEntrega: 40, taxaEntrega: 3 },
    { nome: "São Francisco do Sul", tempoEntrega: 60, taxaEntrega: 7 }
]
function calcularEntrega(cidadeSelecionada) {
for (const cidade of listaCidades) {
    if (cidadeSelecionada == cidade.nome) {
        nomeCidade = cidade.nome;
        taxaEntrega = cidade.taxaEntrega;
        tempoEntrega = cidade.tempoEntrega;
        return {nomeCidade, taxaEntrega, tempoEntrega };
    }    
    
}
}
const botoesCidade = document.querySelectorAll(".opcaoCidade");

for (const botao of botoesCidade) {
    botao.onclick = function() {
        let cidadeSelecionada = botao.dataset.valor;
        let entrega = calcularEntrega(cidadeSelecionada);
    };
} 