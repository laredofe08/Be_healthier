/* ============================================================================
   BeHealthier - app.js

   Lógica compartilhada por todas as páginas. A página atual é definida em
   <body data-pagina="...">. Depende de js/receitas-data.js, que define:
   `receitas`, `imagensReceitas` e `imagensGerais`.

   Como ler este arquivo (de cima para baixo):
    1. Configurações e constantes
    2. Estado: o que é salvo (estado) e o que só vale na tela (estadoTela)
    3. Funções utilitárias
    4. Receitas: campos calculados, restrições alimentares e imagens
    5. Metas e totais do cardápio
    6. Montagem de HTML: cards, listas e barras
    7. Janelas (modais): receita, escolha de receita, sacola e "Mais"
    8. Pedido e acompanhamento da entrega
    9. Páginas: uma função para cada página
   10. Renderização
   11. Conta: api, cadastro e login
   12. Dados salvos por versões antigas do site
   13. Ações dos botões (valor do atributo data-acao)
   14. Eventos
   15. Inicialização
   ============================================================================ */

/* ============================================================================
   1. CONFIGURAÇÕES E CONSTANTES
   ============================================================================ */

// Nome da página atual, lido de <body data-pagina>. Decide qual função de página vai rodar.
// Onde: Todas as páginas.
const paginaAtual = document.body.dataset.pagina;

// Nomes curtos dos dias, na ordem do cardápio (Seg = 0).
// Onde: Cardápio, Equilíbrio e janela da receita (escolha do dia).
const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

// Nomes das 4 refeições do dia.
// Onde: Cardápio e janela da receita (escolha da refeição).
const refeicoes = ['Café da manhã', 'Almoço', 'Lanche', 'Jantar'];

// Valor da entrega para cada cidade atendida (em reais)
// Onde: Entrega e janela da sacola.
const taxaEntregaPorCidade = { Joinville: 6, 'São Francisco do Sul': 9, Araquari: 8 };

// Links do modal "Mais" (no celular). Início, Receitas, Cardápio e Equilíbrio já estão na barra inferior.
// Onde: Celular, em todas as páginas (aba "Mais").
const linksDoMenuMais = [
    { arquivo: 'dicas.html', texto: 'Dicas', icone: 'lampada' },
    { arquivo: 'entrega.html', texto: 'Entrega', icone: 'entrega' },
    { arquivo: 'videos.html', texto: 'Vídeos', icone: 'Play' },
    { arquivo: 'sobre.html', texto: 'Sobre nós', icone: 'sobre' },
    { arquivo: 'contato.html', texto: 'Contato', icone: 'contato' },
];

// IDs dos vídeos do YouTube (os 11 caracteres depois de v=). Adicione aqui.
// Onde: Vídeos.
const idsVideosYoutube = [];

// Chaves usadas para guardar dados no navegador
// Onde: Todas as páginas.
const chavesArmazenamento = {
    estadoVisitante: 'behealthierEstadoVisitante',
    usuarios: 'behealthierUsuarios',
    token: 'behealthierToken',
    sessao: 'behealthierSessao',
    visitante: 'behealthierVisitante',
    contatos: 'behealthierMensagensContato',
    lembretes: 'behealthierLembretes',
    diaSelecionado: 'behealthierDiaSelecionado', // fica no sessionStorage
};

// Quantas receitas aparecem de cada vez na página Receitas (e quanto soma o botão "Ver mais")
// Onde: Receitas.
const receitasPorPagina = 24;

// Quantas receitas recomendadas aparecem.
// Onde: Início.
const limiteReceitasRecomendadas = 8;
// Máximo de receitas na lista de escolha.
// Onde: Cardápio (janela do botão "+ Adicionar").
const limiteListaDeEscolha = 30;
// Máximo de pratos mostrados para pedir.
// Onde: Entrega.
const limitePratosDeEntrega = 30;

// Categorias de receitas que podem ser pedidas na página Entrega
// Onde: Entrega.
const categoriasDeEntrega = [
    'Frango',
    'Carne bovina',
    'Veganas/vegetarianas',
    'Peixes e frutos do mar',
    'Pratos diversos',
];

// Categorias aceitas em cada refeição ao sugerir a semana (mesma ordem de `refeicoes`)
// Onde: Cardápio (botão "Sugerir semana").
const categoriasPorRefeicao = [
    ['Ovos e café da manhã', 'Bebidas e café da manhã', 'Doces, sobremesas e lanches'],
    ['Frango', 'Carne bovina', 'Veganas/vegetarianas', 'Peixes e frutos do mar', 'Pratos diversos'],
    ['Doces, sobremesas e lanches', 'Bebidas e café da manhã'],
    ['Frango', 'Veganas/vegetarianas', 'Pratos diversos', 'Tortas e quiches'],
];

// Quanto das calorias do dia cada refeição pode ter, no máximo, ao sugerir a semana
// Onde: Cardápio (botão "Sugerir semana").
const limiteDeCaloriasPorRefeicao = [0.3, 0.4, 0.2, 0.35];

// Nomes das etapas do pedido, em ordem.
// Onde: Entrega (acompanhamento do pedido).
const etapasDoPedido = ['Confirmado', 'Preparando', 'A caminho', 'Entregue'];

// Tempos (em milissegundos)
// Onde: Todas as páginas.
const duracaoDoAviso = 2200;
// Tempo para o pedido passar para a próxima etapa.
// Onde: Entrega.
const duracaoDeCadaEtapaDoPedido = 6000;
// Depois desse tempo o pedido já terminou e o acompanhamento para de atualizar.
// Onde: Entrega.
const duracaoDaAnimacaoDoPedido = 26000;
// De quanto em quanto tempo o acompanhamento do pedido é atualizado.
// Onde: Entrega.
const intervaloDoRastreio = 3000;

/* ============================================================================
   2. ESTADO
   ============================================================================ */

// Cria um estado vazio: sem favoritas, cardápio, sacola nem pedido.
// Onde: Todas as páginas; também usado ao criar uma conta (Login).
function criarEstadoPadrao() {
    return {
        perfil: {},
        favoritas: [],
        cardapio: {}, // { indiceDoDia: [[indiceDaRefeicao, idDaReceita], ...] }
        sacola: {}, // { idDaReceita: quantidade }
        cidade: 'Joinville',
        pedido: null,
    };
}

// O que é salvo (no navegador ou na api): perfil, favoritas, cardápio, sacola, cidade e pedido
// Onde: Todas as páginas.
let estado = criarEstadoPadrao();

// Quem está logado ({ nome, email }) ou null quando é visitante
// Onde: Todas as páginas.
let usuarioLogado = null;

// O que só vale enquanto a página está aberta (filtros, dia escolhido...). Não é salvo.
// Onde: Receitas (filtros), Cardápio e Equilíbrio (dia), Dicas (objetivo).
const estadoTela = {
    busca: '',
    categoria: '',
    restricoes: [],
    somenteFavoritas: false,
    quantidadeVisivel: receitasPorPagina,
    dia: descobrirDiaInicial(),
    objetivo: 'manter',
};

// Índice do dia da semana de hoje, com a segunda-feira sendo 0 (o JavaScript começa no domingo)
// Onde: Cardápio, Equilíbrio e janela da receita.
function diaDeHoje() {
    return (new Date().getDay() + 6) % 7;
}

// O dia escolhido fica guardado enquanto a aba estiver aberta; sem isso, usa o dia de hoje
// Onde: Cardápio, Equilíbrio e janela da receita.
function descobrirDiaInicial() {
    let diaSalvo = null;
    try {
        diaSalvo = sessionStorage.getItem(chavesArmazenamento.diaSelecionado);
    } catch (erro) {}
    if (diaSalvo === null) return diaDeHoje();
    return +diaSalvo;
}

// Guarda o dia escolhido enquanto a aba estiver aberta, para não voltar para hoje ao trocar de página.
// Onde: Cardápio, Equilíbrio e janela da receita.
function salvarDiaSelecionado() {
    try {
        sessionStorage.setItem(chavesArmazenamento.diaSelecionado, estadoTela.dia);
    } catch (erro) {}
}

// Salva o estado: na api (se estiver logado) ou no navegador (se for visitante)
// Onde: Todas as páginas.
function persistirEstado() {
    if (usuarioLogado) {
        api.salvarEstado(usuarioLogado.email, estado);
        return;
    }
    try {
        localStorage.setItem(chavesArmazenamento.estadoVisitante, JSON.stringify(estado));
    } catch (erro) {}
}

/* ============================================================================
   3. FUNÇÕES UTILITÁRIAS
   ============================================================================ */

// Atalho para document.querySelector.
// Onde: Todas as páginas.
function selecionar(seletor) {
    return document.querySelector(seletor);
}

// Troca o texto de todos os elementos que combinam com o seletor
// Onde: Todas as páginas.
function definirTexto(seletor, texto) {
    document.querySelectorAll(seletor).forEach(elemento => {
        elemento.textContent = texto;
    });
}

// Evita que texto digitado pela pessoa vire HTML (ex.: um nome com "<")
// Onde: Menu "Mais", janela da sacola e Entrega (nome digitado pela pessoa).
function escaparHtml(texto) {
    return String(texto).replace(/[&<>"']/g, caractere => '&#' + caractere.charCodeAt(0) + ';');
}

// Arredonda para número inteiro.
// Onde: Todas as páginas.
function arredondar(numero) {
    return Math.round(numero);
}

// 7.5 -> "R$ 7,50"
// Onde: Entrega e janelas da receita e da sacola.
function formatarReais(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
}

// Marca com a classe "ativo" os elementos que cumprem a condição (e desmarca os demais)
// Onde: Receitas, Cardápio, Dicas, Entrega e Login (botões de opção).
function marcarAtivoSe(seletor, condicao) {
    document.querySelectorAll(seletor).forEach(elemento => {
        elemento.classList.toggle('ativo', condicao(elemento));
    });
}

// Mostra a mensagem rápida no rodapé da tela e some depois de um tempo
// Onde: Todas as páginas.
function mostrarAviso(mensagem) {
    const aviso = selecionar('#avisoTemporario');
    aviso.textContent = mensagem;
    aviso.classList.add('ativo');
    clearTimeout(aviso.temporizador);
    aviso.temporizador = setTimeout(() => aviso.classList.remove('ativo'), duracaoDoAviso);
}

/* ============================================================================
   4. RECEITAS
   ============================================================================ */

// Palavras que identificam cada restrição alimentar (procuradas no nome e nos ingredientes)
// Onde: Início, Receitas e Cardápio.
const regexRestricoes = {
    lactose:
        /leite|queijo|iogurte|manteiga|requeij|creme de leite|ricota|cottage|nata\b|mussarela|parmes|whey|chantilly/,
    gluten: /trigo|aveia|p[ãa]o\b|pães|macarr|massa|torrada|cevada|centeio|biscoito|granola|panko/,
    ovo: /\bovos?\b|claras?\b|gemas?\b/,
    vegetariano:
        /frango|carne|peixe|atum|salm[ãa]o|camar[ãa]o|bacon|presunto|peru\b|porco|lingui[çc]a|patinho|fil[ée]|til[áa]pia|bovin|sardinha|bife|hamb[úu]rguer|coxa|peito de|acém|alcatra/,
};

// Acrescenta a cada receita três campos que não vêm do arquivo de dados:
//   gorduras   -> calculada: o que sobra das calorias depois das proteínas e carboidratos (9 kcal por grama)
//   textoBusca -> nome + ingredientes em minúsculas, usado na busca e nas restrições
//                 ("leite de coco" e "leite vegetal" são retirados para não contarem como lactose)
//   preco      -> R$ 12 mais um valor proporcional às proteínas
// Onde: Todas as páginas. Roda uma vez para cada receita ao carregar.
function prepararReceita(receita) {
    receita.gorduras = Math.max(
        0,
        Math.round((receita.calorias - 4 * receita.proteinas - 4 * receita.carboidratos) / 9),
    );
    receita.textoBusca = (receita.nome + ' ' + receita.ingredientes)
        .toLowerCase()
        .replace(/leite (de|vegetal)[a-zçã ]*/g, '');
    receita.preco = 12 + Math.round(receita.proteinas * 0.4);
}

// Mesmas receitas, mas indexadas pelo id: receitasPorId[12] -> receita de id 12
// Onde: Todas as páginas.
const receitasPorId = {};
receitas.forEach(receita => {
    prepararReceita(receita);
    receitasPorId[receita.id] = receita;
});

// A receita só entra se não tiver nenhuma das restrições escolhidas
// Onde: Início, Receitas e Cardápio.
function respeitaRestricoes(receita, restricoes) {
    return restricoes.every(restricao => !regexRestricoes[restricao].test(receita.textoBusca));
}

// Foto da receita; as que não têm foto própria usam a imagem reserva
// Onde: Início, Receitas, Cardápio, Entrega e janelas da receita e da sacola.
function imagemDaReceita(receita) {
    return imagensReceitas[receita.id] || imagensGerais.mesa;
}

// Nome sem o trecho entre parênteses ("Muffins (Rende 4)" -> "Muffins")
// Onde: Início, Receitas, Cardápio, Entrega e janelas.
function nomeCurtoDaReceita(receita) {
    return receita.nome.replace(/ \(.*\)/, '');
}

/* ============================================================================
   5. METAS E TOTAIS DO CARDÁPIO
   ============================================================================ */

// Metas diárias de calorias, proteínas e água, calculadas com o perfil da pessoa.
// Sem peso, altura e idade, devolve valores de referência (valoresPadrao = 1).
// Onde: Cardápio, Equilíbrio e "Sugerir semana".
function calcularMetas() {
    const perfil = estado.perfil;
    if (!(perfil.peso && perfil.altura && perfil.idade)) {
        return { calorias: 2000, proteinas: 75, agua: 2000, valoresPadrao: 1 };
    }

    const objetivo = perfil.objetivo || 'manter';

    // Gasto em repouso (fórmula de Mifflin-St Jeor)
    const ajusteDoSexo = perfil.sexo == 'f' ? -161 : 5;
    const gastoEmRepouso = 10 * perfil.peso + 6.25 * perfil.altura - 5 * perfil.idade + ajusteDoSexo;

    // Gasto do dia todo: depende do nível de atividade (0 a 3; sem escolha usa 1)
    const multiplicadoresDeAtividade = [1.2, 1.375, 1.55, 1.725];
    const gastoTotal = gastoEmRepouso * multiplicadoresDeAtividade[perfil.atividade ?? 1];

    // Quanto somar ou tirar das calorias, conforme o objetivo
    const ajusteDoObjetivo = { perder: -400, manter: 0, ganhar: 300, musculo: 250 };

    // Gramas de proteína por quilo, conforme o objetivo (padrão: 1,4)
    const proteinaPorQuilo = { musculo: 2, perder: 1.8 };

    return {
        calorias: arredondar(gastoTotal + ajusteDoObjetivo[objetivo]),
        proteinas: arredondar(perfil.peso * (proteinaPorQuilo[objetivo] ?? 1.4)),
        agua: arredondar(perfil.peso * 35),
    };
}

// Itens planejados em um dia: [{ refeicao: índice da refeição, receita }]
// Onde: Cardápio e Equilíbrio.
function itensDoDia(dia) {
    const itensSalvos = estado.cardapio[dia] || [];
    return itensSalvos.map(item => ({
        refeicao: item[0],
        receita: receitasPorId[item[1]],
    }));
}

// Soma calorias, proteínas, carboidratos e gorduras de tudo o que foi planejado no dia
// Onde: Cardápio e Equilíbrio.
function totaisDoDia(dia) {
    const totais = { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 };
    itensDoDia(dia).forEach(item => {
        totais.calorias += item.receita.calorias;
        totais.proteinas += item.receita.proteinas;
        totais.carboidratos += item.receita.carboidratos;
        totais.gorduras += item.receita.gorduras;
    });
    return totais;
}

// Coloca uma receita em um dia e refeição do cardápio e salva.
// Onde: Cardápio (escolha de receita), janela da receita (qualquer página) e "Sugerir semana".
function adicionarAoCardapio(dia, refeicao, idReceita) {
    if (!estado.cardapio[dia]) estado.cardapio[dia] = [];
    estado.cardapio[dia].push([+refeicao, +idReceita]);
    persistirEstado();
}

/* ============================================================================
   6. MONTAGEM DE HTML
   ============================================================================ */

// Os três números de uma receita: "<b>250</b> kcal", "P 10g", "C 32g"
// Onde: Cards e janela da receita (Início, Receitas e Entrega).
function htmlMacros(receita) {
    return (
        `<span><b>${arredondar(receita.calorias)}</b> kcal</span>` +
        `<span>P ${arredondar(receita.proteinas)}g</span>` +
        `<span>C ${arredondar(receita.carboidratos)}g</span>`
    );
}

// Card de receita usado no Início e na página Receitas (clicar abre a receita; o coração favorita)
// Onde: Início e Receitas.
function htmlCardReceita(receita) {
    const classeDaFavorita = estado.favoritas.includes(receita.id) ? 'ativo' : '';
    return (
        `<article class="cardReceita" data-acao="abrirReceita" data-id="${receita.id}">` +
        `<img loading="lazy" src="${imagemDaReceita(receita)}" alt="">` +
        `<div class="corpoCardReceita">` +
        `<h4>${nomeCurtoDaReceita(receita)}</h4>` +
        `<div class="textoSecundario">${htmlMacros(receita)}</div>` +
        `</div>` +
        `<button class="botaoFavoritar ${classeDaFavorita}" data-acao="favoritar" data-id="${receita.id}">♥</button>` +
        `</article>`
    );
}

// Card de prato da página Entrega (tem preço e botão para pôr na sacola)
// Onde: Entrega.
function htmlCardPratoDeEntrega(receita) {
    return (
        `<article class="cardReceita" data-acao="abrirReceita" data-id="${receita.id}">` +
        `<img loading="lazy" src="${imagemDaReceita(receita)}" alt="">` +
        `<div class="corpoCardReceita">` +
        `<h4>${nomeCurtoDaReceita(receita)}</h4>` +
        `<div class="textoSecundario">${arredondar(receita.calorias)} kcal · P ${arredondar(receita.proteinas)}g</div>` +
        `<div class="preco">${formatarReais(receita.preco)}` +
        `<button class="botao botaoPequeno botaoAmarelo" data-acao="adicionarASacola" data-id="${receita.id}">+ Sacola</button>` +
        `</div>` +
        `</div>` +
        `</article>`
    );
}

// Barra de progresso. O JS só informa a porcentagem (data-largura); o CSS desenha a barra.
// Onde: Cardápio e Equilíbrio.
function htmlBarraProgresso(valor, limite) {
    const classeDeExcesso = valor > limite ? 'acimaDaMeta' : '';
    const porcentagem = Math.min(100, limite ? (valor / limite) * 100 : 0);
    return (
        `<div class="barraProgresso">` +
        `<i class="${classeDeExcesso}" data-largura="${porcentagem}"></i>` +
        `</div>`
    );
}

// Receitas da página Receitas, de acordo com a busca e os filtros escolhidos
// Onde: Receitas.
function receitasFiltradas() {
    return receitas.filter(receita => {
        const passaNasRestricoes = respeitaRestricoes(receita, estadoTela.restricoes);
        const passaNaCategoria =
            !estadoTela.categoria || receita.categoria == estadoTela.categoria;
        const passaNasFavoritas =
            !estadoTela.somenteFavoritas || estado.favoritas.includes(receita.id);
        const passaNaBusca =
            !estadoTela.busca || receita.textoBusca.includes(estadoTela.busca.toLowerCase());
        return passaNasRestricoes && passaNaCategoria && passaNasFavoritas && passaNaBusca;
    });
}

// Grade de cards (só as primeiras `quantidadeVisivel`) com o botão "Ver mais (N)" quando sobram receitas
// Onde: Receitas.
function htmlListaReceitas() {
    const encontradas = receitasFiltradas();
    if (encontradas.length == 0) {
        return '<div class="estadoVazio">Nenhuma receita encontrada 🥲</div>';
    }

    const cards = encontradas
        .slice(0, estadoTela.quantidadeVisivel)
        .map(htmlCardReceita)
        .join('');

    const quantasFaltam = encontradas.length - estadoTela.quantidadeVisivel;
    let botaoVerMais = '';
    if (quantasFaltam > 0) {
        botaoVerMais =
            '<p class="areaVerMais">' +
            `<button class="botao botaoAmarelo" data-acao="verMaisReceitas">Ver mais (${quantasFaltam})</button>` +
            '</p>';
    }

    return `<div class="gradeReceitas">${cards}</div>${botaoVerMais}`;
}

// Foto da receita no modal, com o selo "Conteúdo gerado por IA" (só nas fotos geradas; a imagem reserva não leva selo)
// Onde: Janela da receita.
function htmlImagemReceita(receita) {
    const selo = imagensReceitas[receita.id]
        ? '<span class="seloIa">Conteúdo gerado por IA</span>'
        : '';
    return `<span class="imagemIa"><img src="${imagemDaReceita(receita)}" alt="">${selo}</span>`;
}

/* ============================================================================
   7. JANELAS (MODAIS)
   ============================================================================ */

// Abre a janela (modal) com o HTML recebido.
// Onde: Todas as páginas.
function abrirModal(html) {
    selecionar('#caixaModalConteudo').innerHTML =
        '<button class="botaoFecharModal" data-acao="fechar">×</button>' + html;
    selecionar('#sobreposicaoModal').classList.add('ativo');
}

// Fecha a janela.
// Onde: Todas as páginas.
function fecharModal() {
    selecionar('#sobreposicaoModal').classList.remove('ativo');
}

// Diz se há uma janela aberta no momento.
// Onde: Todas as páginas.
function modalEstaAberto() {
    return selecionar('#sobreposicaoModal').classList.contains('ativo');
}

// ----- Receita -----

// Escolha do dia e da refeição + botão "+ Cardápio"
// Onde: Janela da receita.
function htmlBarraAdicionarAoCardapio(id) {
    const opcoesDeDia = diasSemana
        .map((dia, indice) => {
            const selecionado = indice == estadoTela.dia ? 'selected' : '';
            return `<option value="${indice}" ${selecionado}>${dia}</option>`;
        })
        .join('');
    const opcoesDeRefeicao = refeicoes
        .map((refeicao, indice) => `<option value="${indice}">${refeicao}</option>`)
        .join('');
    return (
        `<div class="barraFerramentas">` +
        `<select id="seletorDia">${opcoesDeDia}</select>` +
        `<select id="seletorRefeicao">${opcoesDeRefeicao}</select>` +
        `<button class="botao botaoPequeno botaoAmarelo" data-acao="adicionarAoCardapio" data-id="${id}">+ Cardápio</button>` +
        `</div>`
    );
}

// Botões "Favoritar" e "Sacola"
// Onde: Janela da receita.
function htmlBarraFavoritarEComprar(receita, id) {
    const textoFavoritar = estado.favoritas.includes(id) ? '♥ Favorita' : '♡ Favoritar';
    return (
        `<div class="barraFerramentas">` +
        `<button class="botao botaoPequeno botaoContorno" data-acao="favoritar" data-id="${id}">${textoFavoritar}</button>` +
        `<button class="botao botaoPequeno" data-acao="adicionarASacola" data-id="${id}">🛍️ Sacola ${formatarReais(receita.preco)}</button>` +
        `</div>`
    );
}

// Abre a janela com os detalhes da receita: foto, números, ingredientes, preparo e botões.
// Onde: Início, Receitas e Entrega (clique em um card); também redesenha a janela ao favoritar.
function abrirReceita(id) {
    const receita = receitasPorId[id];
    const resumoNutricional =
        `<p class="textoSecundario resumoNutricionalModal">` +
        `<span>${receita.categoria}</span>${htmlMacros(receita)}<span>G ${receita.gorduras}g</span>` +
        `</p>`;
    const detalhes =
        `<h2>${receita.nome}</h2>` +
        resumoNutricional +
        `<h4>Ingredientes</h4><pre>${receita.ingredientes}</pre>` +
        `<h4>Modo de preparo</h4><pre>${receita.preparo}</pre>`;

    // As duas barras de botões ficam separadas por uma quebra de linha, como no HTML original
    const barras = [htmlBarraAdicionarAoCardapio(id), htmlBarraFavoritarEComprar(receita, id)];

    abrirModal(
        `${htmlImagemReceita(receita)}` +
            `<div class="conteudoModal">${detalhes}\n ${barras.join('\n ')}</div>`,
    );
}

// ----- Escolha de receita para uma refeição do cardápio -----

// Abre a janela com a lista de receitas para colocar em uma refeição.
// Onde: Cardápio (botão "+ Adicionar" de uma refeição).
function abrirEscolhaDeReceita(indiceRefeicao) {
    abrirModal(
        `<div class="conteudoModal">` +
            `<h2>Adicionar ao ${refeicoes[indiceRefeicao]}</h2>` +
            `<div class="barraFerramentas">` +
            `<input id="campoBuscaEscolha" placeholder="🔍 Buscar" data-refeicao="${indiceRefeicao}">` +
            `</div>` +
            `<div id="listaEscolhaReceitas">${htmlListaEscolhaReceitas(indiceRefeicao, '')}</div>` +
            `</div>`,
    );
}

// Lista de receitas do modal de escolha: respeita as restrições do perfil e a busca digitada
// Onde: Cardápio.
function htmlListaEscolhaReceitas(indiceRefeicao, busca) {
    const restricoes = estado.perfil.restricoes || [];
    return receitas
        .filter(
            receita =>
                respeitaRestricoes(receita, restricoes) &&
                receita.textoBusca.includes(busca.toLowerCase()),
        )
        .slice(0, limiteListaDeEscolha)
        .map(
            receita =>
                `<div class="linhaItem linhaItemSelecionavel" data-acao="adicionarEscolhida" data-id="${receita.id}" data-refeicao="${indiceRefeicao}">` +
                `<img src="${imagemDaReceita(receita)}" alt="">` +
                `<div><b>${nomeCurtoDaReceita(receita)}</b>` +
                `<span class="textoSecundario">${arredondar(receita.calorias)} kcal · P ${arredondar(receita.proteinas)}g</span></div>` +
                `</div>`,
        )
        .join('');
}

// ----- Confirmação para limpar a semana -----

// Abre a janela que pergunta se a pessoa quer mesmo limpar a semana.
// Onde: Cardápio (botão "Limpar").
function abrirConfirmacaoDeLimparSemana() {
    abrirModal(
        `<div class="conteudoModal">` +
            `<h2>Limpar a semana?</h2>` +
            `<p class="textoSecundario textoModalConfirmacao">Todos os pratos dos 7 dias serão removidos do cardápio.</p>` +
            `<div class="barraFerramentas">` +
            `<button class="botao" data-acao="confirmarLimparSemana">Sim, limpar</button>` +
            `<button class="botao botaoContorno" data-acao="fechar">Cancelar</button>` +
            `</div>` +
            `</div>`,
    );
}

// Abre a lista de compras da semana: os ingredientes de cada receita planejada, com caixinhas para ir marcando.
// Onde: Cardápio (botão "Lista de compras").
function abrirListaDeCompras() {
    const diasPorReceita = new Map(); // idDaReceita -> ['Seg', 'Qua', ...]
    diasSemana.forEach((nomeDoDia, dia) => {
        itensDoDia(dia).forEach(item => {
            const dias = diasPorReceita.get(item.receita.id) || [];
            if (!dias.includes(nomeDoDia)) dias.push(nomeDoDia);
            diasPorReceita.set(item.receita.id, dias);
        });
    });

    if (!diasPorReceita.size) {
        mostrarAviso('Planeje alguns pratos para gerar a lista 🛒');
        return;
    }

    const blocos = [...diasPorReceita]
        .map(([id, dias]) => {
            const receita = receitasPorId[id];
            const linhas = receita.ingredientes
                .split('\n')
                .map(linha => linha.trim())
                .filter(Boolean)
                .map(linha => `<label class="itemCompra"><input type="checkbox"> <span>${escaparHtml(linha)}</span></label>`)
                .join('');
            return (
                `<div class="blocoCompras">` +
                `<h4>${nomeCurtoDaReceita(receita)}</h4>` +
                `<span class="textoSecundario">${dias.join(', ')}</span>` +
                linhas +
                `</div>`
            );
        })
        .join('');

    abrirModal(
        `<div class="conteudoModal">` +
            `<h2>Lista de compras</h2>` +
            `<p class="textoSecundario textoModalConfirmacao">${diasPorReceita.size} receita(s) na semana. Marque o que você já tem em casa.</p>` +
            blocos +
            `</div>`,
    );
}

// Abre a janela para escolher em qual dia colar os pratos do dia que está aberto.
// Onde: Cardápio (botão "Copiar este dia para…").
function abrirCopiarDia() {
    if (!(estado.cardapio[estadoTela.dia] || []).length) {
        mostrarAviso('Este dia ainda não tem pratos para copiar');
        return;
    }
    const botoes = diasSemana
        .map((nomeDoDia, dia) => ({ nomeDoDia, dia }))
        .filter(item => item.dia != estadoTela.dia)
        .map(item => `<button class="botaoOpcao" data-acao="copiarDiaPara" data-indice="${item.dia}">${item.nomeDoDia}</button>`)
        .join('');

    abrirModal(
        `<div class="conteudoModal">` +
            `<h2>Copiar ${diasSemana[estadoTela.dia]} para…</h2>` +
            `<p class="textoSecundario textoModalConfirmacao">Os pratos do dia escolhido substituem o que já estiver planejado nele.</p>` +
            `<div class="listaOpcoes">${botoes}</div>` +
            `</div>`,
    );
}

// ----- Menu "Mais" (celular) -----

// Abre a janela com as páginas que não cabem na barra inferior e o usuário.
// Onde: Celular, em todas as páginas (aba "Mais").
function abrirMenuMais() {
    const links = linksDoMenuMais
        .map(
            link =>
                `<a class="linhaItem" href="${link.arquivo}" data-acao="fechar">` +
                `<img class="iconeMais" src="Imagens/icons-preto/${link.icone}.svg" alt="">` +
                `<div><b>${link.texto}</b></div>` +
                `</a>`,
        )
        .join('');

    const nome = usuarioLogado ? escaparHtml(usuarioLogado.nome) : 'Visitante';
    const detalhe = usuarioLogado ? escaparHtml(usuarioLogado.email) : 'Progresso só neste aparelho';
    const textoDoBotao = usuarioLogado ? 'Sair' : 'Entrar';
    const caixaDoUsuario =
        `<div class="linhaItem">` +
        `<img class="iconeMais" src="Imagens/icons-preto/User.svg" alt="">` +
        `<div><b>${nome}</b><span class="textoSecundario">${detalhe}</span></div>` +
        `<button class="botao botaoPequeno botaoContorno" data-acao="sair">${textoDoBotao}</button>` +
        `</div>`;

    abrirModal(`<div class="conteudoModal"><h2>Mais</h2>${links}${caixaDoUsuario}</div>`);
}

/* ============================================================================
   8. SACOLA, PEDIDO E ACOMPANHAMENTO DA ENTREGA
   ============================================================================ */

// Total de itens na sacola (somando as quantidades)
// Onde: Todas as páginas. (contador da sacola).
function quantidadeNaSacola() {
    let total = 0;
    Object.values(estado.sacola).forEach(quantidade => {
        total += quantidade;
    });
    return total;
}

// Soma preço x quantidade de cada item da sacola (sem a entrega)
// Onde: Janela da sacola e pedido (Entrega).
function calcularSubtotal(idsDaSacola) {
    let subtotal = 0;
    idsDaSacola.forEach(id => {
        subtotal += receitasPorId[id].preco * estado.sacola[id];
    });
    return subtotal;
}

// Linha de um item da sacola, com os botões − e +
// Onde: Janela da sacola.
function htmlItemDaSacola(id) {
    const receita = receitasPorId[id];
    return (
        `<div class="linhaItem">` +
        `<img src="${imagemDaReceita(receita)}" alt="">` +
        `<div><b>${nomeCurtoDaReceita(receita)}</b><span class="textoSecundario">${formatarReais(receita.preco)}</span></div>` +
        `<button class="botaoOpcao" data-acao="diminuirItem" data-id="${id}">−</button>` +
        `<b>${estado.sacola[id]}</b>` +
        `<button class="botaoOpcao" data-acao="aumentarItem" data-id="${id}">+</button>` +
        `</div>`
    );
}

// Formulário de entrega (nome, bairro, endereço e forma de pagamento)
// Onde: Janela da sacola.
function htmlFormularioDoPedido() {
    const nomeInicial = usuarioLogado ? escaparHtml(usuarioLogado.nome) : '';
    return (
        `<form class="gradeFormulario" id="formularioPedido">` +
        `<label>Nome<input name="nome" value="${nomeInicial}"></label>` +
        `<label>Bairro<input name="bairro"></label>` +
        `<label class="larguraTotal">Endereço<input name="endereco"></label>` +
        `<label class="larguraTotal">Pagamento` +
        `<select name="pagamento"><option>Pix</option><option>Cartão</option><option>Dinheiro</option></select>` +
        `</label>` +
        `</form>`
    );
}

// Abre a janela da sacola: itens, total e dados de entrega (ou aviso de sacola vazia).
// Onde: Todas as páginas. (botão da sacola).
function abrirSacola() {
    const ids = Object.keys(estado.sacola);
    const taxaEntrega = taxaEntregaPorCidade[estado.cidade];
    const subtotal = calcularSubtotal(ids);

    let conteudo;
    if (ids.length == 0) {
        conteudo =
            '<div class="estadoVazio">Sua sacola está vazia 🛍️<br><br>' +
            '<a class="botao botaoPequeno botaoAmarelo" href="entrega.html" data-acao="fechar">Ver pratos</a>' +
            '</div>';
    } else {
        const itens = ids.map(htmlItemDaSacola).join('');
        const resumo =
            `<p class="resumoSacola">Subtotal ${formatarReais(subtotal)} · Taxa ${formatarReais(taxaEntrega)}<br>` +
            `<b class="numeroGrande totalSacola">Total ${formatarReais(subtotal + taxaEntrega)}</b></p>`;
        const botaoFinalizar =
            '<button class="botao botaoFinalizarPedido" data-acao="finalizarPedido">Finalizar pedido</button>';
        conteudo = itens + resumo + htmlFormularioDoPedido() + botaoFinalizar;
    }

    abrirModal(
        `<div class="conteudoModal"><h2>Sua sacola</h2>` +
            `<p class="textoSecundario">Entrega em ${estado.cidade}</p>${conteudo}</div>`,
    );
}

// Desenha o acompanhamento do pedido (Confirmado -> Preparando -> A caminho -> Entregue).
// A etapa avança sozinha com o tempo desde a criação do pedido.
// Onde: Entrega.
function atualizarRastreioPedido() {
    const area = selecionar('#areaRastreioPedido');
    if (!area) return; // só existe na página Entrega

    const pedido = estado.pedido;
    if (!pedido) {
        area.innerHTML = '';
        return;
    }

    const ultimaEtapa = etapasDoPedido.length - 1;
    const etapaAtual = Math.min(
        ultimaEtapa,
        Math.floor((Date.now() - pedido.criadoEm) / duracaoDeCadaEtapaDoPedido),
    );

    const etapas = etapasDoPedido
        .map((etapa, indice) => {
            const classe = indice <= etapaAtual ? 'etapaConcluida' : '';
            return `<div class="${classe}"><i></i>${etapa}</div>`;
        })
        .join('');

    const botaoNovoPedido =
        etapaAtual == ultimaEtapa
            ? '<button class="botao botaoPequeno botaoNovoPedido" data-acao="novoPedido">Novo pedido</button>'
            : '';

    area.innerHTML =
        `<div class="painel">` +
        `<h3 class="tituloPainel">Pedido #${pedido.numero} · ${formatarReais(pedido.total)}</h3>` +
        `<p class="textoSecundario">${pedido.quantidadeItens} itens · entrega em ${escaparHtml(pedido.cidade)} para ${escaparHtml(pedido.nome)}</p>` +
        `<div class="etapasPedido">${etapas}</div>` +
        botaoNovoPedido +
        `</div>`;
}

/* ============================================================================
   9. PÁGINAS
   O HTML de cada página já traz o menu e os textos fixos. Cada função abaixo
   preenche só os "espaços" (ids) que existem na sua página.
   ============================================================================ */

// Menu, cidade, usuário, contador da sacola e ano do rodapé (presentes em várias páginas)
// Onde: Todas as páginas.
function atualizarElementosComuns() {
    const quantidade = quantidadeNaSacola();

    definirTexto('.anoAtual', new Date().getFullYear());

    document.querySelectorAll('.contadorSacola').forEach(elemento => {
        elemento.textContent = quantidade;
        // o selo do menu lateral só aparece quando há itens na sacola
        if (elemento.classList.contains('seloContador')) elemento.hidden = !quantidade;
    });

    definirTexto('.cidadeAtual', '📍 ' + estado.cidade + ' ▾');
    definirTexto('.nomeUsuario', usuarioLogado ? usuarioLogado.nome : 'Visitante');
    definirTexto('.detalheUsuario', usuarioLogado ? usuarioLogado.email : 'Progresso só neste aparelho');
    definirTexto('.botaoUsuario', usuarioLogado ? 'Sair' : 'Entrar / criar conta');

    // Lembrete do rodapé: quem está logado já vê o próprio e-mail no campo
    document.querySelectorAll('[data-formulario="lembreteRodape"] input[name="email"]').forEach(campo => {
        if (usuarioLogado && !campo.value) campo.value = usuarioLogado.email;
    });
}

// ----- Início -----

// Transforma o texto "frango, banana; aveia" em ['frango', 'banana', 'aveia']
// Onde: Início.
function listarGostos(texto) {
    return texto
        .toLowerCase()
        .split(/[,;\n]+/)
        .map(gosto => gosto.trim())
        .filter(Boolean);
}

// Monta a página Início: saudação, número de favoritas e receitas recomendadas.
// Onde: Início.
function montarPaginaInicio() {
    const perfil = estado.perfil;
    const gostos = listarGostos(perfil.gostos || '');
    const restricoes = perfil.restricoes || [];
    const temPerfil = gostos.length > 0 || restricoes.length > 0;

    selecionar('#saudacaoUsuario').textContent = usuarioLogado
        ? 'Olá, ' + usuarioLogado.nome.split(' ')[0] + ' 👋'
        : '';
    selecionar('#totalFavoritas').textContent = estado.favoritas.length;
    selecionar('#tituloRecomendadas').textContent = temPerfil ? 'Para você' : 'Para começar';
    selecionar('#subtituloRecomendadas').textContent = temPerfil
        ? 'Baseado no seu perfil'
        : 'Preencha o Equilíbrio para receber sugestões personalizadas';

    // Quantos dos gostos da pessoa aparecem na receita (quanto mais, mais perto do topo)
    const pontosDeGosto = receita =>
        gostos.filter(gosto => receita.textoBusca.includes(gosto)).length;

    selecionar('#listaReceitasRecomendadas').innerHTML = receitas
        .filter(receita => respeitaRestricoes(receita, restricoes))
        .sort((a, b) => pontosDeGosto(b) - pontosDeGosto(a) || a.id - b.id)
        .slice(0, limiteReceitasRecomendadas)
        .map(htmlCardReceita)
        .join('');
}

// ----- Receitas -----

// Monta a página Receitas: marca os filtros ligados e desenha a lista.
// Onde: Receitas.
function montarPaginaReceitas() {
    marcarAtivoSe('[data-acao=filtroRestricao]', botao =>
        estadoTela.restricoes.includes(botao.dataset.valor),
    );
    selecionar('[data-acao=filtroFavoritas]').classList.toggle('ativo', estadoTela.somenteFavoritas);
    selecionar('#listaReceitas').innerHTML = htmlListaReceitas();
}

// ----- Cardápio -----

// Uma refeição do dia: título, botão "+ Adicionar" e os itens já planejados nela
// Onde: Cardápio.
function htmlRefeicaoDoDia(nomeRefeicao, indiceRefeicao, itensDoDiaTodo) {
    const cabecalho =
        `<div class="cabecalhoRefeicao"><h4>${nomeRefeicao}</h4>` +
        `<button class="botao botaoPequeno botaoAmarelo" data-acao="escolherReceita" data-refeicao="${indiceRefeicao}">+ Adicionar</button></div>`;

    const itensDaRefeicao = itensDoDiaTodo
        .map((item, indiceNoDia) => ({ ...item, indiceNoDia })) // guarda a posição para poder remover
        .filter(item => item.refeicao == indiceRefeicao)
        .map(item => {
            const receita = item.receita;
            return (
                `<div class="linhaItem">` +
                `<img src="${imagemDaReceita(receita)}" alt="">` +
                `<div><b>${nomeCurtoDaReceita(receita)}</b>` +
                `<span class="textoSecundario">${arredondar(receita.calorias)} kcal · P ${arredondar(receita.proteinas)}g · C ${arredondar(receita.carboidratos)}g</span></div>` +
                `<button class="botaoRemover" data-acao="removerDoCardapio" data-indice="${item.indiceNoDia}">×</button>` +
                `</div>`
            );
        })
        .join('');

    return cabecalho + (itensDaRefeicao || '<p class="textoSecundario refeicaoVazia">Nada planejado</p>');
}

// Totais do dia com barras de progresso (calorias e proteínas contra a meta; carboidratos 50% e gorduras 30% das calorias)
// Onde: Cardápio.
function htmlResumoDoDia(totais, metas) {
    const limiteDeCarboidratos = (metas.calorias * 0.5) / 4;
    const limiteDeGorduras = (metas.calorias * 0.3) / 9;
    return (
        `<div class="numeroGrande">${arredondar(totais.calorias)} <small class="metaCaloriasDia">/ ${metas.calorias} kcal</small></div>` +
        htmlBarraProgresso(totais.calorias, metas.calorias) +
        `<div class="textoSecundario">Proteínas ${arredondar(totais.proteinas)}g</div>` +
        htmlBarraProgresso(totais.proteinas, metas.proteinas) +
        `<div class="textoSecundario">Carboidratos ${arredondar(totais.carboidratos)}g</div>` +
        htmlBarraProgresso(totais.carboidratos, limiteDeCarboidratos) +
        `<div class="textoSecundario">Gorduras ${arredondar(totais.gorduras)}g</div>` +
        htmlBarraProgresso(totais.gorduras, limiteDeGorduras)
    );
}

// Painel "Sua semana": total de pratos, média diária e uma barra de calorias por dia.
// Clicar em uma linha abre aquele dia (usa a mesma ação dos botões Seg a Dom).
// Onde: Cardápio.
function htmlResumoDaSemana(metas) {
    let totalDePratos = 0;
    let diasCompletos = 0;
    let somaDeCalorias = 0;
    let diasComPratos = 0;

    const linhasDosDias = diasSemana
        .map((nomeDoDia, dia) => {
            const itens = itensDoDia(dia);
            const calorias = totaisDoDia(dia).calorias;
            const refeicoesPreenchidas = new Set(itens.map(item => item.refeicao)).size;

            totalDePratos += itens.length;
            if (itens.length) {
                diasComPratos++;
                somaDeCalorias += calorias;
            }
            if (refeicoesPreenchidas == refeicoes.length) diasCompletos++;

            const classeDoDia = dia == estadoTela.dia ? 'ativo' : '';
            return (
                `<button class="linhaDiaSemana ${classeDoDia}" data-acao="selecionarDia" data-indice="${dia}">` +
                `<b>${nomeDoDia}</b>` +
                htmlBarraProgresso(calorias, metas.calorias) +
                `<span>${arredondar(calorias)} kcal</span>` +
                `</button>`
            );
        })
        .join('');

    const mediaDiaria = diasComPratos ? arredondar(somaDeCalorias / diasComPratos) : 0;
    return (
        `<div class="estatisticasSemana">` +
        `<div><div class="numeroGrande">${totalDePratos}</div><span class="textoSecundario">pratos planejados</span></div>` +
        `<div><div class="numeroGrande">${mediaDiaria}</div><span class="textoSecundario">kcal por dia (média)</span></div>` +
        `<div><div class="numeroGrande">${diasCompletos}/7</div><span class="textoSecundario">dias completos</span></div>` +
        `</div>` +
        linhasDosDias
    );
}

// Monta a página Cardápio: botões dos dias, refeições e resumo do dia.
// Onde: Cardápio.
function montarPaginaCardapio() {
    const totais = totaisDoDia(estadoTela.dia);
    const metas = calcularMetas();
    const itens = itensDoDia(estadoTela.dia);

    // Botões dos dias: o escolhido fica ativo e os que têm pratos ganham um "•"
    document.querySelectorAll('[data-acao=selecionarDia]').forEach(botao => {
        const indice = +botao.dataset.indice;
        const temPratos = (estado.cardapio[indice] || []).length > 0;
        botao.classList.toggle('ativo', indice == estadoTela.dia);
        botao.textContent = diasSemana[indice] + (temPratos ? ' •' : '');
    });

    selecionar('#nomeDiaSelecionado').textContent = diasSemana[estadoTela.dia];
    selecionar('#listaRefeicoes').innerHTML = refeicoes
        .map((nomeRefeicao, indiceRefeicao) => htmlRefeicaoDoDia(nomeRefeicao, indiceRefeicao, itens))
        .join('');
    selecionar('#resumoDoDia').innerHTML = htmlResumoDoDia(totais, metas);
    selecionar('#resumoDaSemana').innerHTML = htmlResumoDaSemana(metas);
}

// ----- Equilíbrio -----

// Coloca no formulário os dados já salvos no perfil
// Onde: Equilíbrio.
function preencherFormularioDoPerfil(perfil) {
    const formulario = selecionar('#formularioPerfil');
    const campos = ['peso', 'altura', 'idade', 'sexo', 'atividade', 'objetivo', 'gostos'];
    campos.forEach(campo => {
        if (perfil[campo] !== undefined && perfil[campo] !== '') {
            formulario.elements[campo].value = perfil[campo];
        }
    });
    const restricoesDoPerfil = perfil.restricoes || [];
    formulario.querySelectorAll('[name=restricoes]').forEach(caixa => {
        caixa.checked = restricoesDoPerfil.includes(caixa.value);
    });
}

// Gráfico de colunas com as calorias de cada dia da semana
// Onde: Equilíbrio.
function htmlGraficoSemanal(caloriasPorDia, metaDiaria) {
    return caloriasPorDia
        .map((calorias, indice) => {
            const classeDoDia = indice == estadoTela.dia ? 'diaAtual' : '';
            const classeDeExcesso = calorias > metaDiaria ? 'acimaDaMeta' : '';
            const altura = Math.min(100, (calorias / metaDiaria) * 75);
            return (
                `<div class="${classeDoDia}"><span>${arredondar(calorias)}</span>` +
                `<i class="${classeDeExcesso}" data-altura="${altura}"></i>${diasSemana[indice]}</div>`
            );
        })
        .join('');
}

// Monta a página Equilíbrio: formulário do perfil, avisos, painel da semana e metas diárias.
// Onde: Equilíbrio.
function montarPaginaEquilibrio(primeiraVez) {
    const perfil = estado.perfil;
    if (primeiraVez) preencherFormularioDoPerfil(perfil);

    const metas = calcularMetas();
    const totaisDeHoje = totaisDoDia(estadoTela.dia);
    const caloriasPorDia = diasSemana.map((_, indice) => totaisDoDia(indice).calorias);
    let caloriasNaSemana = 0;
    caloriasPorDia.forEach(calorias => {
        caloriasNaSemana += calorias;
    });
    const metaDaSemana = metas.calorias * 7;
    const excesso = totaisDeHoje.calorias - metas.calorias;
    const peso = perfil.peso || 70;

    // Aviso: metas de referência (perfil incompleto)
    let avisoDeReferencia = '';
    if (metas.valoresPadrao) {
        avisoDeReferencia =
            '<div class="alerta">Preencha peso, altura e idade para calcular metas personalizadas. Por enquanto usamos valores de referência (2000 kcal).</div>';
    }

    // Aviso: passou da meta de hoje, com sugestões de atividade para compensar
    let avisoDeExcesso = '';
    if (excesso > 0) {
        const minutosDeCaminhada = arredondar(excesso / (peso * 0.05));
        const minutosDeBicicleta = arredondar(excesso / (peso * 0.09));
        const minutosDeCorrida = arredondar(excesso / (peso * 0.13));
        avisoDeExcesso =
            `<div class="alerta"><b>Você passou ${arredondar(excesso)} kcal hoje 😉</b> Sem culpa! Uma forma leve de compensar: ` +
            `${minutosDeCaminhada} min de caminhada, ${minutosDeBicicleta} min de bicicleta ou ${minutosDeCorrida} min de corrida leve.</div>`;
    }

    const painelDaSemana =
        `<div class="painel"><h3 class="tituloPainel">Semana: ${arredondar(caloriasNaSemana)} de ${metaDaSemana} kcal</h3>` +
        htmlBarraProgresso(caloriasNaSemana, metaDaSemana) +
        `<p class="textoSecundario">Você ainda pode consumir <b>${Math.max(0, metaDaSemana - caloriasNaSemana)}</b> kcal esta semana.</p>` +
        `<div class="graficoSemanal">${htmlGraficoSemanal(caloriasPorDia, metas.calorias)}</div></div>`;

    const ferroDiario = perfil.sexo == 'f' ? 18 : 8;
    const restamHoje = Math.max(0, metas.calorias - arredondar(totaisDeHoje.calorias));
    const painelDasMetas =
        `<div class="painel"><h3 class="tituloPainel">Metas diárias</h3>` +
        `<p>💧 Água: <b>${(metas.agua / 1000).toFixed(1)} L</b></p>` +
        `<p>🥩 Proteínas: <b>${metas.proteinas} g</b></p>` +
        `<p>🌾 Fibras: <b>25 g</b></p>` +
        `<p>🍊 Vitamina C: <b>90 mg</b></p>` +
        `<p>🥛 Cálcio: <b>1000 mg</b></p>` +
        `<p>🩸 Ferro: <b>${ferroDiario} mg</b></p>` +
        `<p class="textoSecundario resumoDiaEquilibrio">Hoje (${diasSemana[estadoTela.dia]}): ${arredondar(totaisDeHoje.calorias)} kcal · restam ${restamHoje}</p></div>`;

    // IMC: só aparece com peso e altura preenchidos
    let painelDoImc = '';
    if (perfil.peso && perfil.altura) {
        const alturaEmMetros = perfil.altura / 100;
        const imc = perfil.peso / (alturaEmMetros * alturaEmMetros);
        const faixas = [
            [18.5, 'Abaixo do peso'],
            [25, 'Peso normal'],
            [30, 'Sobrepeso'],
            [35, 'Obesidade grau I'],
            [40, 'Obesidade grau II'],
            [Infinity, 'Obesidade grau III'],
        ];
        const faixa = faixas.find(([limite]) => imc < limite)[1];
        const pesoMinimo = (18.5 * alturaEmMetros * alturaEmMetros).toFixed(1);
        const pesoMaximo = (24.9 * alturaEmMetros * alturaEmMetros).toFixed(1);
        painelDoImc =
            `<div class="painel"><h3 class="tituloPainel">Seu IMC</h3>` +
            `<p>⚖️ IMC: <b>${imc.toFixed(1).replace('.', ',')} kg/m²</b> · ${faixa}</p>` +
            `<p class="textoSecundario">Faixa de peso considerada normal para a sua altura: ${pesoMinimo.replace('.', ',')} a ${pesoMaximo.replace('.', ',')} kg.</p>` +
            `<p class="textoSecundario">O IMC é uma referência geral e não considera massa muscular nem outros fatores. Não substitui a avaliação de um nutricionista ou médico.</p></div>`;
    }

    // Os dois painéis ficam separados por uma quebra de linha, como no HTML original
    selecionar('#painelEquilibrio').innerHTML =
        avisoDeReferencia +
        avisoDeExcesso +
        painelDoImc +
        `<div class="duasColunas">${painelDaSemana}\n  ${painelDasMetas}</div>`;
}

// ----- Dicas -----

// Monta a página Dicas: marca o objetivo escolhido e mostra só as dicas dele.
// Onde: Dicas.
function montarPaginaDicas() {
    marcarAtivoSe(
        '[data-acao=selecionarObjetivo]',
        botao => botao.dataset.valor == estadoTela.objetivo,
    );
    // Só o grupo de dicas do objetivo escolhido fica visível
    document.querySelectorAll('.dicasDoObjetivo').forEach(grupo => {
        grupo.hidden = grupo.dataset.objetivo != estadoTela.objetivo;
    });
}

// ----- Entrega -----

// Monta a página Entrega: cidade escolhida, acompanhamento do pedido e pratos.
// Onde: Entrega.
function montarPaginaEntrega() {
    marcarAtivoSe('[data-acao=selecionarCidade]', botao => botao.dataset.valor == estado.cidade);
    atualizarRastreioPedido();
    selecionar('#listaPratosEntrega').innerHTML = receitas
        .filter(receita => categoriasDeEntrega.includes(receita.categoria))
        .slice(0, limitePratosDeEntrega)
        .map(htmlCardPratoDeEntrega)
        .join('');
}

// ----- Vídeos -----

// Monta a página Vídeos: vídeos extras ou o aviso "Em breve".
// Onde: Vídeos.
function montarPaginaVideos() {
    let html;
    if (idsVideosYoutube.length > 0) {
        const videos = idsVideosYoutube
            .map(
                idVideo =>
                    `<div><iframe src="https://www.youtube-nocookie.com/embed/${idVideo}" allowfullscreen loading="lazy"></iframe></div>`,
            )
            .join('');
        html = `<div class="gradeVideos">${videos}</div>`;
    } else {
        html = '<div class="estadoVazio painel">▶️<br>Em breve, novos vídeos por aqui!</div>';
    }
    selecionar('#areaVideosDinamicos').innerHTML = html;
}

// Qual função monta cada página (Sobre e Login não têm nada para montar)
// Onde: Todas as páginas.
const paginas = {
    inicio: montarPaginaInicio,
    receitas: montarPaginaReceitas,
    cardapio: montarPaginaCardapio,
    equilibrio: montarPaginaEquilibrio,
    dicas: montarPaginaDicas,
    entrega: montarPaginaEntrega,
    videos: montarPaginaVideos,
};

/* ============================================================================
   10. RENDERIZAÇÃO
   ============================================================================ */

// Barras de progresso e gráfico semanal: o JS só informa o número (data-largura / data-altura);
// quem aplica width e height é o CSS, usando as variáveis --largura e --altura
// Onde: Cardápio e Equilíbrio (barras de progresso e gráfico da semana).
function aplicarMedidasDinamicas() {
    document.querySelectorAll('[data-largura]').forEach(elemento => {
        elemento.style.setProperty('--largura', elemento.dataset.largura + '%');
    });
    document.querySelectorAll('[data-altura]').forEach(elemento => {
        elemento.style.setProperty('--altura', elemento.dataset.altura + '%');
    });
}

// Desenha a página atual. `primeiraVez` é true só na primeira renderização (preenche o formulário do perfil).
// Onde: Todas as páginas.
function renderizar(primeiraVez) {
    atualizarElementosComuns();
    if (paginas[paginaAtual]) paginas[paginaAtual](primeiraVez);
    aplicarMedidasDinamicas();
}

// Desenha de novo sem perder a posição da rolagem
// Onde: Todas as páginas.
function renderizarMantendoRolagem() {
    const rolagem = scrollY;
    renderizar();
    scrollTo(0, rolagem);
}

/* ============================================================================
   11. CONTA: API, CADASTRO E LOGIN
   ============================================================================ */

/* Guarda e consulta contas e estados. Dois modos:
   - urlBase vazia (padrão): tudo fica no navegador (localStorage).
   - urlBase preenchida: usa o backend com MongoDB (ex.: 'http://localhost:3000/api'). */
// Guarda e consulta contas e estados, no navegador ou no backend.
// Onde: Login (cadastro e entrada) e todas as páginas (carregar e salvar o estado de quem está logado).
const api = {
    urlBase: '',

    // Senha -> código SHA-256 (no modo local a senha nunca é guardada em texto)
    async gerarHash(senha) {
        const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(senha));
        return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('');
    },

    // Chamada ao backend, enviando o token da sessão
    async requisitar(metodo, caminho, corpo) {
        const token = localStorage.getItem(chavesArmazenamento.token) || '';
        const resposta = await fetch(this.urlBase + caminho, {
            method: metodo,
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
            body: corpo && JSON.stringify(corpo),
        });
        const json = await resposta.json();
        if (!resposta.ok) throw new Error(json.erro || 'Erro no servidor');
        return json;
    },

    // Modo local: todas as contas criadas neste navegador, { email: { nome, hashSenha, estado } }
    obterUsuarios() {
        try {
            return JSON.parse(localStorage.getItem(chavesArmazenamento.usuarios) || '{}');
        } catch (erro) {
            return {};
        }
    },

    async cadastrar(nome, email, senha) {
        if (this.urlBase) {
            const json = await this.requisitar('POST', '/cadastro', { nome, email, senha });
            localStorage.setItem(chavesArmazenamento.token, json.token);
            return json.usuario;
        }
        const usuarios = this.obterUsuarios();
        if (usuarios[email]) throw new Error('Este e-mail já está cadastrado');
        usuarios[email] = { nome, hashSenha: await this.gerarHash(senha), estado: criarEstadoPadrao() };
        localStorage.setItem(chavesArmazenamento.usuarios, JSON.stringify(usuarios));
        return { nome, email };
    },

    async entrar(email, senha) {
        if (this.urlBase) {
            const json = await this.requisitar('POST', '/entrar', { email, senha });
            localStorage.setItem(chavesArmazenamento.token, json.token);
            return json.usuario;
        }
        const usuario = this.obterUsuarios()[email];
        if (!usuario || usuario.hashSenha !== (await this.gerarHash(senha))) {
            throw new Error('E-mail ou senha incorretos');
        }
        return { nome: usuario.nome, email };
    },

    async carregarEstado(email) {
        if (this.urlBase) {
            const json = await this.requisitar('GET', '/estado');
            return json.estado;
        }
        const usuario = this.obterUsuarios()[email] || {};
        return usuario.estado;
    },

    salvarEstado(email, novoEstado) {
        if (this.urlBase) {
            this.requisitar('PUT', '/estado', { estado: novoEstado }).catch(() => {});
            return;
        }
        const usuarios = this.obterUsuarios();
        if (!usuarios[email]) return;
        usuarios[email].estado = novoEstado;
        try {
            localStorage.setItem(chavesArmazenamento.usuarios, JSON.stringify(usuarios));
        } catch (erro) {}
    },
};

// Começa a usar o site como `usuario` (null = visitante): carrega o estado salvo e desenha a página.
// Na página de login, vai direto para o Início.
// Onde: Todas as páginas. No Login, depois de entrar, leva para o Início.
async function iniciarSessao(usuario) {
    usuarioLogado = usuario;

    let dadosSalvos;
    if (usuario) {
        dadosSalvos = await api.carregarEstado(usuario.email);
    } else {
        try {
            dadosSalvos = JSON.parse(
                localStorage.getItem(chavesArmazenamento.estadoVisitante) || '{}',
            );
        } catch (erro) {
            dadosSalvos = {};
        }
    }

    estado = Object.assign(criarEstadoPadrao(), converterEstadoAntigo(dadosSalvos) || {});
    estadoTela.restricoes = [...(estado.perfil.restricoes || [])];
    estadoTela.objetivo = estado.perfil.objetivo || 'manter';

    if (paginaAtual == 'login') {
        location.href = 'index.html';
        return;
    }
    renderizar(true);
}

// Botão "Entrar" / "Criar conta" da página de login
// Onde: Login.
async function autenticar() {
    const formulario = new FormData(selecionar('#formularioAutenticacao'));
    const cadastrando = document.body.dataset.modo == 'cadastro';
    const email = (formulario.get('email') || '').trim().toLowerCase();
    const senha = formulario.get('senha') || '';
    const nome = (formulario.get('nome') || '').trim();
    const mensagemDeErro = selecionar('#erroAutenticacao');

    try {
        if (!email || !senha || (cadastrando && !nome)) throw new Error('Preencha todos os campos');
        if (cadastrando && senha.length < 6) {
            throw new Error('A senha precisa ter 6 ou mais caracteres');
        }

        const usuario = cadastrando
            ? await api.cadastrar(nome, email, senha)
            : await api.entrar(email, senha);

        localStorage.setItem(chavesArmazenamento.sessao, JSON.stringify(usuario));
        await iniciarSessao(usuario);
    } catch (erro) {
        mensagemDeErro.textContent = erro.message;
    }
}

/* ============================================================================
   12. DADOS SALVOS POR VERSÕES ANTIGAS DO SITE
   Versões antigas salvavam o estado com nomes abreviados (p, fav, plan, cart,
   city, ord) e em outras chaves do navegador. As funções abaixo convertem tudo
   para os nomes atuais, para ninguém perder favoritas, cardápio, sacola ou conta.
   ============================================================================ */

// Tradução dos nomes abreviados do perfil antigo para os atuais.
// Onde: Todas as páginas. (conversão de dados antigos).
const nomesAntigosDoPerfil = {
    alt: 'altura',
    ativ: 'atividade',
    obj: 'objetivo',
    rest: 'restricoes',
    gosta: 'gostos',
};

// Estado no formato antigo -> formato atual (se já estiver no atual, devolve como está)
// Onde: Todas as páginas. (conversão de dados antigos).
function converterEstadoAntigo(dados) {
    if (!dados || typeof dados != 'object') return dados;

    const nomesAntigos = ['p', 'fav', 'plan', 'cart', 'city', 'ord'];
    const ehFormatoAntigo = nomesAntigos.some(nome => nome in dados);
    if (!ehFormatoAntigo) return dados;

    const perfil = {};
    Object.entries(dados.p || {}).forEach(([nomeAntigo, valor]) => {
        perfil[nomesAntigosDoPerfil[nomeAntigo] || nomeAntigo] = valor;
    });

    const pedidoAntigo = dados.ord;
    let pedido = null;
    if (pedidoAntigo) {
        pedido = {
            numero: pedidoAntigo.id,
            criadoEm: pedidoAntigo.t,
            quantidadeItens: pedidoAntigo.n,
            cidade: pedidoAntigo.city,
            nome: pedidoAntigo.nome,
            total: pedidoAntigo.total,
        };
    }

    return {
        perfil,
        favoritas: dados.fav || [],
        cardapio: dados.plan || {},
        sacola: dados.cart || {},
        cidade: dados.city || 'Joinville',
        pedido,
    };
}

// Move os dados das chaves antigas do navegador para as atuais (uma única vez)
// Onde: Todas as páginas. Roda uma vez ao abrir qualquer página.
function migrarDadosAntigos() {
    try {
        // Copia o valor da chave antiga para a nova (sem sobrescrever uma nova já existente) e apaga a antiga
        const mover = (chaveAntiga, chaveNova, converter) => {
            const valor = localStorage.getItem(chaveAntiga);
            if (valor === null) return;
            if (localStorage.getItem(chaveNova) === null) {
                localStorage.setItem(chaveNova, converter ? converter(valor) : valor);
            }
            localStorage.removeItem(chaveAntiga);
        };

        // Estado do visitante
        mover('bh', chavesArmazenamento.estadoVisitante, valor =>
            JSON.stringify(converterEstadoAntigo(JSON.parse(valor))),
        );

        // Contas criadas neste navegador (o campo "hash" passou a se chamar "hashSenha")
        mover('bhu', chavesArmazenamento.usuarios, valor => {
            const usuarios = JSON.parse(valor);
            Object.values(usuarios).forEach(usuario => {
                if ('hash' in usuario) {
                    usuario.hashSenha = usuario.hash;
                    delete usuario.hash;
                }
                usuario.estado = converterEstadoAntigo(usuario.estado);
            });
            return JSON.stringify(usuarios);
        });

        mover('bhk', chavesArmazenamento.token);
        mover('bhs', chavesArmazenamento.sessao);
        mover('bhg', chavesArmazenamento.visitante);
    } catch (erro) {}
}

/* ============================================================================
   13. AÇÕES DOS BOTÕES
   Cada botão do HTML tem data-acao="nome". Quando alguém clica, a função com
   esse nome (tabela `acoes`, no fim desta seção) é chamada com:
     evento -> o clique;  dados -> os atributos data-* do botão;  id -> data-id como número
   ============================================================================ */

// ----- Gerais -----

// Abre o menu "Mais".
// Onde: Celular, em todas as páginas (aba "Mais").
function acaoMais({ evento }) {
    evento.preventDefault(); // o link "Mais" tem href="#"
    abrirMenuMais();
}

// ----- Receitas -----

// Abre a receita clicada.
// Onde: Início, Receitas e Entrega (clique no card).
function acaoAbrirReceita({ id }) {
    abrirReceita(id);
}

// Favorita ou desfavorita uma receita.
// Onde: Início, Receitas, Entrega e janela da receita (coração).
function acaoFavoritar({ evento, id }) {
    evento.stopPropagation();
    if (estado.favoritas.includes(id)) {
        estado.favoritas = estado.favoritas.filter(favorita => favorita != id);
    } else {
        estado.favoritas = [...estado.favoritas, id];
    }
    persistirEstado();

    const ficouFavorita = estado.favoritas.includes(id);
    mostrarAviso(ficouFavorita ? '♥ Adicionada às favoritas' : 'Removida das favoritas');

    // Dentro da receita aberta, redesenha a janela; fora dela, redesenha a página
    if (modalEstaAberto()) abrirReceita(id);
    else renderizarMantendoRolagem();
}

// Liga/desliga uma restrição (sem lactose, sem glúten...) no filtro da página Receitas
// Onde: Receitas.
function acaoFiltroRestricao({ dados }) {
    if (estadoTela.restricoes.includes(dados.valor)) {
        estadoTela.restricoes = estadoTela.restricoes.filter(restricao => restricao != dados.valor);
    } else {
        estadoTela.restricoes = [...estadoTela.restricoes, dados.valor];
    }
    estadoTela.quantidadeVisivel = receitasPorPagina;
    renderizarMantendoRolagem();
}

// Liga ou desliga o filtro "só favoritas".
// Onde: Receitas.
function acaoFiltroFavoritas() {
    estadoTela.somenteFavoritas = !estadoTela.somenteFavoritas;
    estadoTela.quantidadeVisivel = receitasPorPagina;
    renderizarMantendoRolagem();
}

// Mostra mais 24 receitas na lista.
// Onde: Receitas.
function acaoVerMaisReceitas() {
    estadoTela.quantidadeVisivel += receitasPorPagina;
    selecionar('#listaReceitas').innerHTML = htmlListaReceitas();
}

// ----- Cardápio -----

// Escolhe o dia que está sendo mostrado.
// Onde: Cardápio.
function acaoSelecionarDia({ dados }) {
    estadoTela.dia = +dados.indice;
    salvarDiaSelecionado();
    renderizarMantendoRolagem();
}

// Abre a lista para escolher uma receita da refeição clicada.
// Onde: Cardápio.
function acaoEscolherReceita({ dados }) {
    abrirEscolhaDeReceita(+dados.refeicao);
}

// Clique em uma receita da lista de escolha: entra no dia que está aberto
// Onde: Cardápio.
function acaoAdicionarEscolhida({ dados, id }) {
    adicionarAoCardapio(estadoTela.dia, dados.refeicao, id);
    fecharModal();
    mostrarAviso('Adicionado ao cardápio ✔');
    renderizarMantendoRolagem();
}

// Botão "+ Cardápio" da receita: usa o dia e a refeição escolhidos na janela
// Onde: Janela da receita (qualquer página).
function acaoAdicionarAoCardapio({ id }) {
    const dia = selecionar('#seletorDia').value;
    const refeicao = selecionar('#seletorRefeicao').value;
    adicionarAoCardapio(dia, refeicao, id);

    estadoTela.dia = +dia;
    salvarDiaSelecionado();
    fecharModal();
    mostrarAviso('Adicionado ao cardápio de ' + diasSemana[estadoTela.dia] + ' ✔');

    // Só as páginas que mostram o cardápio precisam ser redesenhadas
    if (['cardapio', 'equilibrio'].includes(paginaAtual)) renderizarMantendoRolagem();
}

// Tira um prato do dia escolhido.
// Onde: Cardápio.
function acaoRemoverDoCardapio({ dados }) {
    estado.cardapio[estadoTela.dia].splice(+dados.indice, 1);
    persistirEstado();
    renderizarMantendoRolagem();
}

// Copia os pratos do dia aberto para o dia escolhido na janela (substitui o que havia nele).
// Onde: Cardápio.
function acaoCopiarDiaPara({ dados }) {
    const destino = +dados.indice;
    const origem = estadoTela.dia;
    estado.cardapio[destino] = (estado.cardapio[origem] || []).map(item => [...item]);
    persistirEstado();

    estadoTela.dia = destino;
    salvarDiaSelecionado();
    fecharModal();
    mostrarAviso(diasSemana[origem] + ' copiado para ' + diasSemana[destino] + ' ✔');
    renderizarMantendoRolagem();
}

// Abre a lista de compras da semana.
// Onde: Cardápio.
function acaoAbrirListaDeCompras() {
    abrirListaDeCompras();
}

// Abre a janela para escolher o dia que vai receber a cópia.
// Onde: Cardápio.
function acaoAbrirCopiarDia() {
    abrirCopiarDia();
}

// Pede a confirmação para limpar a semana.
// Onde: Cardápio.
function acaoLimparSemana() {
    abrirConfirmacaoDeLimparSemana();
}

// Apaga todos os pratos da semana.
// Onde: Cardápio.
function acaoConfirmarLimparSemana() {
    estado.cardapio = {};
    persistirEstado();
    fecharModal();
    mostrarAviso('Cardápio limpo 🧹');
    renderizarMantendoRolagem();
}

// Monta uma semana inteira: para cada dia e refeição, sorteia uma receita que caiba
// nas restrições do perfil e que não passe do limite de calorias daquela refeição
// Onde: Cardápio.
function acaoSugerirSemana() {
    const metas = calcularMetas();
    const restricoes = estado.perfil.restricoes || [];
    const embaralhar = lista => lista.sort(() => Math.random() - 0.5);

    estado.cardapio = {};
    for (let dia = 0; dia < 7; dia++) {
        categoriasPorRefeicao.forEach((categorias, indiceRefeicao) => {
            const limiteDeCalorias = metas.calorias * limiteDeCaloriasPorRefeicao[indiceRefeicao];
            const candidatas = embaralhar(
                receitas.filter(
                    receita =>
                        categorias.includes(receita.categoria) &&
                        respeitaRestricoes(receita, restricoes) &&
                        receita.calorias < limiteDeCalorias,
                ),
            );
            if (candidatas[0]) adicionarAoCardapio(dia, indiceRefeicao, candidatas[0].id);
        });
    }

    persistirEstado();
    mostrarAviso('Semana sugerida! Ajuste como quiser ✨');
    renderizarMantendoRolagem();
}

// ----- Perfil e equilíbrio -----

// Lê o formulário do perfil: números viram número; texto, sexo e objetivo continuam texto
// Onde: Equilíbrio.
function acaoSalvarPerfil() {
    const formulario = new FormData(selecionar('#formularioPerfil'));
    const camposDeTexto = ['gostos', 'sexo', 'objetivo'];
    const perfil = {};

    formulario.forEach((valor, campo) => {
        if (campo == 'restricoes') return; // as caixas marcadas são lidas abaixo
        const ehTexto = isNaN(valor) || valor === '' || camposDeTexto.includes(campo);
        perfil[campo] = ehTexto ? valor : +valor;
    });
    perfil.restricoes = formulario.getAll('restricoes');

    estado.perfil = perfil;
    estadoTela.restricoes = [...perfil.restricoes];
    estadoTela.objetivo = perfil.objetivo;
    persistirEstado();
    mostrarAviso('Perfil salvo! Metas atualizadas ✔');
    renderizarMantendoRolagem();
}

// Dicas
// Onde: Dicas.
function acaoSelecionarObjetivo({ dados }) {
    estadoTela.objetivo = dados.valor;
    renderizarMantendoRolagem();
}

// ----- Entrega -----

// Escolhe a cidade da entrega (muda a taxa).
// Onde: Entrega.
function acaoSelecionarCidade({ dados }) {
    estado.cidade = dados.valor;
    persistirEstado();
    renderizarMantendoRolagem();
}

// Vai para a página Entrega.
// Onde: Celular, em todas as páginas (botão da cidade na barra superior).
function acaoIrParaEntrega() {
    location.href = 'entrega.html';
}

// ----- Sacola e pedido -----

// Põe uma unidade da receita na sacola.
// Onde: Entrega (botão "+ Sacola") e janela da receita.
function acaoAdicionarASacola({ evento, id }) {
    evento.stopPropagation();
    estado.sacola[id] = (estado.sacola[id] || 0) + 1;
    persistirEstado();
    mostrarAviso('🛍️ Adicionado à sacola');
    renderizarMantendoRolagem();
}

// Aumenta a quantidade de um item.
// Onde: Janela da sacola.
function acaoAumentarItem({ id }) {
    estado.sacola[id]++;
    persistirEstado();
    abrirSacola();
    renderizarMantendoRolagem();
}

// Diminui um item; quando chega a zero, ele sai da sacola
// Onde: Janela da sacola.
function acaoDiminuirItem({ id }) {
    estado.sacola[id]--;
    if (estado.sacola[id] < 1) delete estado.sacola[id];
    persistirEstado();
    abrirSacola();
    renderizarMantendoRolagem();
}

// Cria o pedido com o que está na sacola, esvazia a sacola e vai para a página Entrega
// Onde: Janela da sacola.
function acaoFinalizarPedido() {
    const formulario = new FormData(selecionar('#formularioPedido'));
    if (!formulario.get('nome') || !formulario.get('endereco')) {
        mostrarAviso('Preencha nome e endereço');
        return;
    }

    const ids = Object.keys(estado.sacola);
    const taxaEntrega = taxaEntregaPorCidade[estado.cidade];

    estado.pedido = {
        numero: Math.floor(1000 + Math.random() * 9000),
        criadoEm: Date.now(),
        quantidadeItens: quantidadeNaSacola(),
        cidade: estado.cidade,
        nome: formulario.get('nome'),
        total: calcularSubtotal(ids) + taxaEntrega,
    };
    estado.sacola = {};
    persistirEstado();
    fecharModal();
    location.href = 'entrega.html';
}

// Limpa o pedido terminado para poder fazer outro.
// Onde: Entrega.
function acaoNovoPedido() {
    estado.pedido = null;
    persistirEstado();
    renderizarMantendoRolagem();
}

// ----- Conta -----

// Troca entre as abas "Entrar" e "Criar conta" da página de login
// Onde: Login.
function acaoAlternarAbaAutenticacao({ dados }) {
    const cadastrando = dados.valor == 'cadastro';
    document.body.dataset.modo = dados.valor;
    marcarAtivoSe(
        '[data-acao=alternarAbaAutenticacao]',
        aba => aba.dataset.valor == dados.valor,
    );
    selecionar('#tituloAutenticacao').textContent = cadastrando ? 'Criar conta' : 'Bem-vindo de volta';
    selecionar('#botaoAutenticar').textContent = cadastrando ? 'Criar conta' : 'Entrar';
}

// Entra no site como visitante (sem conta).
// Onde: Login.
function acaoContinuarVisitante() {
    localStorage.setItem(chavesArmazenamento.visitante, 1);
    iniciarSessao(null);
}

// Sair: quem estava logado volta ao Início como visitante; visitante vai para a tela de login
// Onde: Menu lateral (computador) e janela "Mais" (celular), em todas as páginas.
function acaoSair() {
    const estavaLogado = !!usuarioLogado;
    localStorage.removeItem(chavesArmazenamento.sessao);
    localStorage.removeItem(chavesArmazenamento.token);
    location.href = estavaLogado ? 'index.html' : 'login.html';
}

// ----- Contato -----

// Valida e envia a mensagem de contato (página Entre em contato).
// Com backend (api.urlBase) envia para /api/contato; sem backend guarda a mensagem neste navegador.
// Onde: Contato.
async function acaoEnviarContato({ evento }) {
    evento.preventDefault(); // evita enviar a página; Enter nos campos também passa por aqui (clique no botão submit)
    const elemento = evento.target.closest('[data-acao]');
    const formulario = elemento.closest('form');
    const retorno = selecionar('#retornoContato');
    const dados = Object.fromEntries(new FormData(formulario));
    const mostrar = (texto, tipo) => {
        retorno.textContent = texto;
        retorno.classList.toggle('erro', tipo == 'erro');
        retorno.classList.toggle('sucesso', tipo == 'sucesso');
    };

    formulario.querySelectorAll('.campoInvalido').forEach(campo => campo.classList.remove('campoInvalido'));
    const invalidos = ['nome', 'email', 'mensagem'].filter(nome => {
        const valor = (dados[nome] || '').trim();
        return !valor || (nome == 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor));
    });
    if (invalidos.length) {
        invalidos.forEach(nome => formulario.elements[nome].classList.add('campoInvalido'));
        formulario.elements[invalidos[0]].focus();
        mostrar('Preencha nome, um e-mail válido e a mensagem.', 'erro');
        return;
    }

    const mensagem = { ...dados, pagina: location.pathname.split('/').pop() || 'index.html', data: new Date().toISOString() };
    elemento.disabled = true;
    try {
        if (api.urlBase) {
            await api.requisitar('POST', '/api/contato', mensagem);
        } else {
            const lista = JSON.parse(localStorage.getItem(chavesArmazenamento.contatos) || '[]');
            lista.push(mensagem);
            localStorage.setItem(chavesArmazenamento.contatos, JSON.stringify(lista));
        }
        formulario.reset();
        mostrar('Mensagem enviada! Obrigado pelo contato.', 'sucesso');
        mostrarAviso('Mensagem enviada');
    } catch (erro) {
        mostrar(erro.message || 'Não foi possível enviar. Tente de novo.', 'erro');
    }
    elemento.disabled = false;
}

// Pede o e-mail e guarda o pedido de lembrete (mini formulário do rodapé).
// Com backend (api.urlBase) envia para /api/lembrete; sem backend guarda neste navegador.
// Onde: Todas as páginas (rodapé).
async function acaoEnviarLembrete({ evento }) {
    evento.preventDefault();
    const elemento = evento.target.closest('[data-acao]');
    const formulario = elemento.closest('form');
    const campo = formulario.elements.email;
    const retorno = formulario.querySelector('.rodapeFormularioRetorno');
    const email = campo.value.trim().toLowerCase();
    const mostrar = (texto, tipo) => {
        retorno.textContent = texto;
        retorno.classList.toggle('erro', tipo == 'erro');
        retorno.classList.toggle('sucesso', tipo == 'sucesso');
    };

    campo.classList.remove('campoInvalido');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        campo.classList.add('campoInvalido');
        campo.focus();
        mostrar('Digite um e-mail válido.', 'erro');
        return;
    }

    elemento.disabled = true;
    try {
        if (api.urlBase) {
            await api.requisitar('POST', '/api/lembrete', { email, pagina: location.pathname.split('/').pop() || 'index.html' });
        } else {
            const lista = JSON.parse(localStorage.getItem(chavesArmazenamento.lembretes) || '[]');
            if (!lista.includes(email)) lista.push(email);
            localStorage.setItem(chavesArmazenamento.lembretes, JSON.stringify(lista));
        }
        mostrar('Pronto! Vamos te lembrar por e-mail.', 'sucesso');
        mostrarAviso('Lembrete ativado');
    } catch (erro) {
        mostrar(erro.message || 'Não foi possível salvar. Tente de novo.', 'erro');
    }
    elemento.disabled = false;
}

// valor de data-acao -> função que cuida do clique
// Onde: Todas as páginas.
const acoes = {
    // gerais (todas as páginas)
    fechar: fecharModal,
    mais: acaoMais,

    // Receitas (também Início e Entrega, nos cards)
    abrirReceita: acaoAbrirReceita,
    favoritar: acaoFavoritar,
    filtroRestricao: acaoFiltroRestricao,
    filtroFavoritas: acaoFiltroFavoritas,
    verMaisReceitas: acaoVerMaisReceitas,

    // Cardápio
    selecionarDia: acaoSelecionarDia,
    escolherReceita: acaoEscolherReceita,
    adicionarEscolhida: acaoAdicionarEscolhida,
    adicionarAoCardapio: acaoAdicionarAoCardapio,
    removerDoCardapio: acaoRemoverDoCardapio,
    limparSemana: acaoLimparSemana,
    confirmarLimparSemana: acaoConfirmarLimparSemana,
    sugerirSemana: acaoSugerirSemana,
    abrirListaDeCompras: acaoAbrirListaDeCompras,
    abrirCopiarDia: acaoAbrirCopiarDia,
    copiarDiaPara: acaoCopiarDiaPara,

    // Equilíbrio (perfil) e Dicas (objetivo)
    salvarPerfil: acaoSalvarPerfil,
    selecionarObjetivo: acaoSelecionarObjetivo,

    // Entrega
    selecionarCidade: acaoSelecionarCidade,
    irParaEntrega: acaoIrParaEntrega,

    // Sacola (janela, em todas as páginas) e pedido (Entrega)
    abrirSacola: abrirSacola,
    adicionarASacola: acaoAdicionarASacola,
    aumentarItem: acaoAumentarItem,
    diminuirItem: acaoDiminuirItem,
    finalizarPedido: acaoFinalizarPedido,
    novoPedido: acaoNovoPedido,

    // Login (e botão Sair, em todas as páginas)
    autenticar: autenticar,
    alternarAbaAutenticacao: acaoAlternarAbaAutenticacao,
    continuarVisitante: acaoContinuarVisitante,
    sair: acaoSair,

    // Contato (página Entre em contato) e lembrete por e-mail (rodapé)
    enviarContato: acaoEnviarContato,
    enviarLembrete: acaoEnviarLembrete,
};

/* ============================================================================
   14. EVENTOS
   ============================================================================ */

// Botão "Limpar" dos formulários de contato: também apaga erros e mensagens
document.addEventListener('reset', evento => {
    const formulario = evento.target;
    if (!formulario.dataset.formulario) return;
    formulario.querySelectorAll('.campoInvalido').forEach(campo => campo.classList.remove('campoInvalido'));
    const retorno = formulario.querySelector('.rodapeFormularioRetorno') || selecionar('#retornoContato');
    retorno.textContent = '';
    retorno.classList.remove('erro', 'sucesso');
});

// Cliques: clicar fora da janela fecha; clicar em algo com data-acao chama a ação correspondente
document.addEventListener('click', evento => {
    const elemento = evento.target.closest('[data-acao]');

    if (evento.target.id == 'sobreposicaoModal') {
        fecharModal();
        return;
    }
    if (!elemento) return;

    const nomeDaAcao = elemento.dataset.acao;
    const acao = acoes[nomeDaAcao];
    if (!acao) return;

    // Link que fecha a janela: fecha e deixa o navegador seguir o link
    if (elemento.tagName == 'A' && nomeDaAcao == 'fechar') {
        fecharModal();
        return;
    }

    acao({ evento, dados: elemento.dataset, id: +elemento.dataset.id });
});

// Digitação: busca da página Receitas e busca do modal de escolha de receita
document.addEventListener('input', evento => {
    if (evento.target.id == 'campoBuscaReceitas') {
        estadoTela.busca = evento.target.value;
        estadoTela.quantidadeVisivel = receitasPorPagina;
        selecionar('#listaReceitas').innerHTML = htmlListaReceitas();
    }
    if (evento.target.id == 'campoBuscaEscolha') {
        selecionar('#listaEscolhaReceitas').innerHTML = htmlListaEscolhaReceitas(
            evento.target.dataset.refeicao,
            evento.target.value,
        );
    }
});

// Troca do filtro de categoria na página Receitas
document.addEventListener('change', evento => {
    if (evento.target.id == 'filtroCategoria') {
        estadoTela.categoria = evento.target.value;
        estadoTela.quantidadeVisivel = receitasPorPagina;
        selecionar('#listaReceitas').innerHTML = htmlListaReceitas();
    }
});

// Enter no formulário de login
document.addEventListener('keydown', evento => {
    if (evento.key == 'Enter' && evento.target.closest('#formularioAutenticacao')) autenticar();
});

// Anima o acompanhamento do pedido na página Entrega enquanto ele ainda está andando
setInterval(() => {
    const estaNaPaginaEntrega = paginaAtual == 'entrega';
    const pedidoAindaAndando =
        estado.pedido && Date.now() - estado.pedido.criadoEm < duracaoDaAnimacaoDoPedido;
    const estaDigitando = document.activeElement.closest?.('input,select');

    if (estaNaPaginaEntrega && pedidoAindaAndando && !modalEstaAberto() && !estaDigitando) {
        atualizarRastreioPedido();
    }
}, intervaloDoRastreio);

/* ============================================================================
   15. INICIALIZAÇÃO
   ============================================================================ */

// Marca a aba certa na barra inferior (o HTML deixava "Início" sempre ativo)
// Onde: Celular, em todas as páginas.
function marcarAbaAtivaDaBarraInferior() {
    const arquivoAtual = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('#menuInferior a[href]').forEach(link => {
        link.classList.toggle('ativo', link.getAttribute('href') === arquivoAtual);
    });
}

// Quem já fez login volta direto para a sessão; os demais entram como visitante.
// Na página de login, sem sessão, não faz nada (a pessoa vai escolher entrar, criar conta ou continuar como visitante).
// Onde: Todas as páginas.
async function iniciarPagina() {
    try {
        const usuarioSalvo = JSON.parse(localStorage.getItem(chavesArmazenamento.sessao) || 'null');
        if (usuarioSalvo) await iniciarSessao(usuarioSalvo);
        else if (paginaAtual != 'login') await iniciarSessao(null);
    } catch (erro) {
        if (paginaAtual != 'login') await iniciarSessao(null);
    }
}

marcarAbaAtivaDaBarraInferior();
migrarDadosAntigos();
iniciarPagina();
