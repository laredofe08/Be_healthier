# Dicionário de nomes — BeHealthier

Todos os nomes do projeto seguem **camelCase**, em português, e dizem a função do elemento na página (`cardReceita`, `menuLateral`, `botaoFavoritar`...). Esta tabela mostra **o nome original → o nome atual**, para a equipe se achar no código.

Os **nomes de arquivos e pastas não foram alterados** (`css/style.css`, `css/reset.css`, `css/auth.css`, `js/app.js`, `Imagens/icons/`...).

## Convenções

| O quê | Padrão | Exemplos |
|---|---|---|
| Classes e IDs | camelCase | `cardReceita`, `#menuLateral`, `#campoBuscaReceitas` |
| Valores de `data-acao` (o que o botão faz) | camelCase | `abrirReceita`, `adicionarAoCardapio`, `selecionarDia` |
| Atributos `data-*` | uma palavra, minúscula (o HTML não diferencia maiúsculas) | `data-acao`, `data-valor`, `data-indice`, `data-refeicao` |
| Variáveis CSS | camelCase | `--salviaSuave`, `--textoSuave`, `--ambarEscuro` |
| Variáveis, funções e constantes no JS | camelCase | `estadoTela`, `calcularMetas()`, `diasSemana`, `receitas` |
| Chaves salvas no navegador | camelCase | `behealthierEstadoVisitante` |

## CSS: como o arquivo está organizado

O CSS é escrito **mobile primeiro** e dividido **por página** (ou por componente compartilhado, quando começa com "geral"):

```css
/* ====== receitas mobile ====== */
  ...toda a formatação do celular (vale para qualquer largura)...

@media (min-width: 900px) {
    /*~~~~ receitas desktop ~~~~*/
    ...só o que muda no computador...
}
```

Existem ainda, quando necessário, `/*~~~~ pagina tablet ~~~~*/` (de 900px a 1100px) e `/*~~~~ pagina mobile ate 420px ~~~~*/` / `ate 600px`.

**Nenhum estilo é escrito direto no HTML** (nem nos trechos de HTML montados pelo JS). Onde havia `style="..."`, agora há uma classe:

| Antes (`style="..."`) | Classe | Onde |
|---|---|---|
| ícone 1.2em do carrinho | `iconeSacolaTopo` | barra superior |
| ícone 1.1em do carrinho | `iconeBotaoSacola` | botões "Sacola" |
| ícone de localização | `iconeLocalizacao` | entrega |
| `margin-top:0` em títulos de painel | `tituloPainel` | vários |
| título das dicas (58 vezes) | regra `.cardDica h3` | dicas |
| grade das dicas | `gradeDicas` | dicas |
| imagem de fundo do banner | `bannerInicio`, `bannerSobre` | início, sobre |
| imagem de fundo dos cards | `cardDestaqueReceitas`, `cardDestaqueCardapio`, `cardDestaqueEquilibrio`, `cardDestaqueEntrega` | início |
| margem da lista de cidades | `listaCidades` | entrega |
| painel do mapa | `painelMapa` | entrega |
| botão "Ver mais" | `areaVerMais` | receitas |
| "Nada planejado" | `refeicaoVazia` | cardápio |
| texto do modal de confirmação | `textoModalConfirmacao` | modal |
| resumo nutricional do modal | `resumoNutricionalModal` | modal |
| resumo da sacola | `resumoSacola`, `totalSacola` | modal |
| botão finalizar / novo pedido | `botaoFinalizarPedido`, `botaoNovoPedido` | modal, entrega |
| restante de calorias | `resumoDiaEquilibrio`, `metaCaloriasDia` | equilíbrio, cardápio |
| lista de receitas clicável | `linhaItemSelecionavel` | modal |
| formulário do pedido | `#formularioPedido` | modal |

**Barras de progresso e gráfico semanal:** a largura/altura depende de um cálculo feito no JS. O HTML só leva o número (`data-largura`, `data-altura`); a função `aplicarMedidasDinamicas()` entrega esse número ao CSS como variável (`--largura`, `--altura`), e é o CSS (`.barraProgresso i`, `.graficoSemanal i`) que aplica `width`/`height`.


## Classes

| Antes | Agora |
|---|---|
| `.active` | `.ativo` |
| `.badge` | `.seloContador` |
| `.cart-count` | `.contadorSacola` |
| `.user-box` | `.caixaUsuario` |
| `.user-name` | `.nomeUsuario` |
| `.user-detail` | `.detalheUsuario` |
| `.user-button` | `.botaoUsuario` |
| `.city-button` | `.botaoCidade` |
| `.city-now` | `.cidadeAtual` |
| `.cart-button` | `.botaoSacola` |
| `.sidebar-footer` | `.rodapeMenuLateral` |
| `.hero` | `.bannerPrincipal` |
| `.stats` | `.estatisticas` |
| `.feature-grid` | `.gradeDestaques` |
| `.feature-card` | `.cardDestaque` |
| `.btn` | `.botao` |
| `.btn-outline-light` | `.botaoContornoClaro` |
| `.btn-green` | `.botaoAmarelo` |
| `.btn-small` | `.botaoPequeno` |
| `.btn-outlined` | `.botaoContorno` |
| `.page-title` | `.tituloPagina` |
| `.muted-text` | `.textoSecundario` |
| `.big-number` | `.numeroGrande` |
| `.price` | `.preco` |
| `.recipe-grid` | `.gradeReceitas` |
| `.recipe-card` | `.cardReceita` |
| `.recipe-card-body` | `.corpoCardReceita` |
| `.favorite-button` | `.botaoFavoritar` |
| `.toolbar` | `.barraFerramentas` |
| `.chip` | `.botaoOpcao` |
| `.chip-list` | `.listaOpcoes` |
| `.panel` | `.painel` |
| `.two-columns` | `.duasColunas` |
| `.three-columns` | `.tresColunas` |
| `.form-grid` | `.gradeFormulario` |
| `.check-group` | `.grupoCheckbox` |
| `.check-item` | `.itemCheckbox` |
| `.full-width` | `.larguraTotal` |
| `.progress-bar` | `.barraProgresso` |
| `.over-limit` | `.acimaDaMeta` |
| `.week-chart` | `.graficoSemanal` |
| `.current-day` | `.diaAtual` |
| `.alert` | `.alerta` |
| `.item-row` | `.linhaItem` |
| `.remove-button` | `.botaoRemover` |
| `.meal-header` | `.cabecalhoRefeicao` |
| `.overlay` | `.sobreposicao` |
| `.modal-box` | `.caixaModal` |
| `.modal-content` | `.conteudoModal` |
| `.modal-close` | `.botaoFecharModal` |
| `.toast` | `.aviso` |
| `.ai-img` | `.imagemIa` |
| `.ai-badge` | `.seloIa` |
| `.more-icon` | `.iconeMais` |
| `.tip-card` | `.cardDica` |
| `.goal` | `.dicasDoObjetivo` |
| `.city-option` | `.opcaoCidade` |
| `.order-tracker` | `.etapasPedido` |
| `.step-done` | `.etapaConcluida` |
| `.video-grid` | `.gradeVideos` |
| `.videos` | `.secaoVideos` |
| `.vdos` | `.listaVideosYoutube` |
| `.empty-state` | `.estadoVazio` |
| `.auth-page` | `.paginaAutenticacao` |
| `.auth-hero` | `.bannerAutenticacao` |
| `.auth-logo` | `.logoAutenticacao` |
| `.auth-form-area` | `.areaFormularioAutenticacao` |
| `.auth-box` | `.caixaAutenticacao` |
| `.only-register` | `.somenteCadastro` |
| `.guest-button` | `.botaoVisitante` |

## IDs

| Antes | Agora |
|---|---|
| `#app` | `#aplicacao` |
| `#sb` | `#menuLateral` |
| `#tb` | `#barraSuperior` |
| `#v` | `#conteudoPrincipal` |
| `#tabs` | `#menuInferior` |
| `#ov` | `#sobreposicaoModal` |
| `#mb` | `#caixaModalConteudo` |
| `#tt` | `#avisoTemporario` |
| `#hi` | `#saudacaoUsuario` |
| `#nfav` | `#totalFavoritas` |
| `#rec-t` | `#tituloRecomendadas` |
| `#rec-s` | `#subtituloRecomendadas` |
| `#rec` | `#listaReceitasRecomendadas` |
| `#q` | `#campoBuscaReceitas` |
| `#cat` | `#filtroCategoria` |
| `#rl` | `#listaReceitas` |
| `#sd` | `#seletorDia` |
| `#sm` | `#seletorRefeicao` |
| `#pf` | `#formularioPerfil` |
| `#eq` | `#painelEquilibrio` |
| `#dishes` | `#listaPratosEntrega` |
| `#trk` | `#areaRastreioPedido` |
| `#vl` | `#areaVideosDinamicos` |
| `#dia` | `#nomeDiaSelecionado` |
| `#meals` | `#listaRefeicoes` |
| `#resumo` | `#resumoDoDia` |
| `#ttl` | `#tituloAutenticacao` |
| `#af` | `#formularioAutenticacao` |
| `#ae` | `#erroAutenticacao` |
| `#go` | `#botaoAutenticar` |
| `#pq` | `#campoBuscaEscolha` |
| `#pl` | `#listaEscolhaReceitas` |
| `#ck` | `#formularioPedido` |

## Ações dos botões (`data-acao`, antes `data-a`)

O valor diz o que o botão faz ao ser clicado. O JS reage a ele no objeto `acoes`, em `js/app.js`.

| Antes | Agora |
|---|---|
| `x` | `fechar` |
| `more` | `mais` |
| `open` | `abrirReceita` |
| `fav` | `favoritar` |
| `rf` | `filtroRestricao` |
| `fvf` | `filtroFavoritas` |
| `more2` | `verMaisReceitas` |
| `day` | `selecionarDia` |
| `pick` | `escolherReceita` |
| `padd` | `adicionarEscolhida` |
| `addp` | `adicionarAoCardapio` |
| `rm` | `removerDoCardapio` |
| `clr` | `limparSemana` |
| `clrok` | `confirmarLimparSemana` |
| `auto` | `sugerirSemana` |
| `save` | `salvarPerfil` |
| `goal` | `selecionarObjetivo` |
| `city` | `selecionarCidade` |
| `citym` | `irParaEntrega` |
| `cart` | `abrirSacola` |
| `cadd` | `adicionarASacola` |
| `cinc` | `aumentarItem` |
| `cdec` | `diminuirItem` |
| `buy` | `finalizarPedido` |
| `ordx` | `novoPedido` |
| `auth` | `autenticar` |
| `atab` | `alternarAbaAutenticacao` |
| `guest` | `continuarVisitante` |
| `logout` | `sair` |

## Variáveis de cor do CSS

| Antes | Agora |
|---|---|
| `--forest` | `--floresta` |
| `--leaf` | `--folha` |
| `--sage-soft` | `--salviaSuave` |
| `--sage` | `--salvia` |
| `--ink` | `--tinta` |
| `--peach` | `--pessego` |
| `--sand` | `--areia` |
| `--bg` | `--fundo` |
| `--white` | `--branco` |
| `--muted` | `--textoSuave` |
| `--line` | `--borda` |
| `--danger` | `--perigo` |
| `--amber-deep` | `--ambarEscuro` |
| `--amber-soft` | `--ambarSuave` |
| `--amber` | `--ambar` |
| `--shadow` | `--sombra` |

## Atributos `data-*`

| Antes | Agora |
|---|---|
| `data-a` | `data-acao` |
| `data-k` | `data-valor` |
| `data-i` | `data-indice` |
| `data-m` | `data-refeicao` |
| `data-g` | `data-objetivo` |
| `data-page` | `data-pagina` |
| `data-mode` | `data-modo` |

## Campos de formulário (`name`)

| Antes | Agora |
|---|---|
| `alt` | `altura` |
| `ativ` | `atividade` |
| `obj` | `objetivo` |
| `rest` | `restricoes` |
| `gosta` | `gostos` |
| `end` | `endereco` |
| `pg` | `pagamento` |

## Campos de cada receita (`js/receitas-data.js`)

Agora iguais aos de `receitas.json`.

| Antes | Agora |
|---|---|
| `n` | `nome` |
| `cat` | `categoria` |
| `i` | `ingredientes` |
| `pp` | `preparo` |
| `k` | `calorias` |
| `p` | `proteinas` |
| `c` | `carboidratos` |

## JavaScript

`js/app.js` está dividido em 15 seções numeradas (o mapa fica no topo do arquivo): configurações, estado, utilitários, receitas, metas, montagem de HTML, modais, sacola e pedido, páginas, renderização, conta (`api`), dados antigos, ações dos botões, eventos e inicialização.

**Como o clique funciona:** cada botão do HTML tem `data-acao="nome"`. A tabela `acoes` liga esse nome a uma função `acaoNome(...)`, que recebe `{ evento, dados, id }`. Para achar o que um botão faz, procure o nome dele em `acoes`.

**Como cada página é montada:** a tabela `paginas` liga o nome da página a uma função `montarPaginaNome()` (`montarPaginaInicio`, `montarPaginaReceitas`, `montarPaginaCardapio`, `montarPaginaEquilibrio`, `montarPaginaDicas`, `montarPaginaEntrega`, `montarPaginaVideos`).

| Antes | Agora |
|---|---|
| `R`, `RM` | `receitas`, `receitasPorId` |
| `IM`, `H` | `imagensReceitas`, `imagensGerais` |
| `S` (estado salvo) | `estado` — com `perfil`, `favoritas`, `cardapio`, `sacola`, `cidade`, `pedido` |
| `U` | `estadoTela` (filtros e dia selecionado; não é salvo) |
| `ME` | `usuarioLogado` |
| `P` (uma função por página) | `paginas` + uma função `montarPagina...()` para cada página |
| `PAGINA_ATUAL`, `DIAS_SEMANA`, `REFEICOES` | `paginaAtual`, `diasSemana`, `refeicoes` |
| `PAGINAS_MENU` (lista de listas) | `linksDoMenuMais` (lista de objetos `{ arquivo, texto, icone }`, só as 4 páginas do modal "Mais") |
| `IDS_VIDEOS_YOUTUBE`, `TAXA_ENTREGA_POR_CIDADE` | `idsVideosYoutube`, `taxaEntregaPorCidade` |
| números soltos (`24`, `30`, `8`, `2200`, `6000`, `26000`, `3000`) | `receitasPorPagina`, `limiteListaDeEscolha` / `limitePratosDeEntrega`, `limiteReceitasRecomendadas`, `duracaoDoAviso`, `duracaoDeCadaEtapaDoPedido`, `duracaoDaAnimacaoDoPedido`, `intervaloDoRastreio` |
| listas dentro de funções | `categoriasDeEntrega`, `categoriasPorRefeicao`, `limiteDeCaloriasPorRefeicao`, `etapasDoPedido` |
| `API` | `api` |
| `meta()` | `calcularMetas()` |
| `card()` | `htmlCardReceita()` (Início e Receitas) e `htmlCardPratoDeEntrega()` (Entrega) |
| `openR()`, `openM()`, `closeM()` | `abrirReceita()`, `abrirModal()`, `fecharModal()` |
| `cartM()`, `trk()` | `abrirSacola()`, `atualizarRastreioPedido()` |
| `sv()` | `persistirEstado()` |
| `chrome()`, `render()`, `rerender()` | `atualizarElementosComuns()`, `renderizar()`, `renderizarMantendoRolagem()` |
| `doAuth()`, `enter()` | `autenticar()`, `iniciarSessao()` |
| (novas) | `aplicarMedidasDinamicas()`, `receitasFiltradas()`, `prepararReceita()`, `htmlMacros()`, `htmlItemDaSacola()`, `htmlFormularioDoPedido()`, `abrirMenuMais()`, `abrirConfirmacaoDeLimparSemana()`, `modalEstaAberto()`, `definirTexto()`, `diaDeHoje()`, `iniciarPagina()` |
| Campos de cada receita: `n`, `cat`, `i`, `pp`, `k`, `p`, `c`, `f`, `t`, `pr` | `nome`, `categoria`, `ingredientes`, `preparo`, `calorias`, `proteinas`, `carboidratos`, `gorduras`, `textoBusca`, `preco` |

Removidos por não serem usados em lugar nenhum: `logoEsquilo`, `rotulosRestricoes`, `categoriasReceitas`.

## Backend (`backend/server.js`)

| Antes | Agora |
|---|---|
| `POST /api/register` | `POST /api/cadastro` |
| `POST /api/login` | `POST /api/entrar` |
| `GET/PUT /api/state` | `GET/PUT /api/estado` |
| resposta `{ token, user }` | `{ token, usuario }` |
| `JWT_SECRET` (variável de ambiente) | continua `JWT_SECRET`; no código vira `segredoJwt` |
| model `User` | `Usuario` (continua usando a coleção `users` do MongoDB, então os cadastros existentes não se perdem) |

## Comentários: como achar o que cada coisa faz

Todos os arquivos dizem **em qual página** cada trecho atua e **o que ele faz**.

| Arquivo | Como está comentado | Como procurar |
|---|---|---|
| `*.html` | Comentário no topo (`PÁGINA: Receitas (receitas.html)` + o que a página é) e antes de cada bloco grande (menu lateral, barra superior, conteúdo, rodapé, janela, aviso e as partes próprias da página). Os "espaços" que o JS preenche dizem qual função preenche. | procure `PÁGINA:` |
| `css/style.css`, `css/auth.css` | Cada bloco tem `/* ====== nome mobile ====== */` + duas linhas (`Onde:` e `O que faz:`). Cada regra tem uma linha dizendo o que formata. O `@media` tem `/*~~~~ nome desktop ~~~~*/`. | procure `======` |
| `css/reset.css` | Cabeçalho explicando que é a base para todas as páginas. | no topo |
| `js/app.js` | Banner de cada seção (15 seções). Toda função e constante tem `// Onde: página(s)` e uma descrição do que faz. | procure `Onde:` |
| `js/receitas-data.js` | Cabeçalho explicando as 3 partes dos dados. | no topo |
| `backend/server.js` | Cabeçalho (quando o backend é usado) e uma linha em cada rota dizendo a página que a chama. | no topo |

Exemplos: procurar `Onde: Cardápio` no `app.js` mostra tudo o que é só do Cardápio; procurar `receitas mobile` no `style.css` leva ao estilo da página Receitas no celular.

## Rodapé

O rodapé fica no fim do `<main>` de todas as páginas (menos o login) e é o mesmo HTML em todas. O CSS está em `geral rodape mobile` / `geral rodape desktop`, em `css/style.css`.

| Classe | Função |
|---|---|
| `rodape` | cartão verde do rodapé |
| `rodapeConteudo` | grade dos blocos (1 coluna no celular, 4 no desktop) |
| `rodapeMarca`, `rodapeLogo`, `rodapeLogoLink` | logo (link para o início) |
| `rodapeProjeto` | linha "Projeto da SEPE-IFC 2026" |
| `rodapeEquipe` | nomes da equipe, um embaixo do outro, cada um com link (GitHub) |
| `rodapeNavegacao` | links das páginas |
| `rodapeConta` | conta de quem está usando (`nomeUsuario`, `detalheUsuario`, `botaoUsuario`, preenchidos pelo JS) |
| `rodapeLembrete`, `rodapeFormulario`, `rodapeFormularioRetorno` | formulário "Quer lembrete por e-mail?" (`acaoEnviarLembrete`) |
| `rodapeTitulo` | títulos dos blocos |
| `rodapeDireitos` | linha final com o ano |
| `anoAtual` | o JS preenche com o ano corrente (`atualizarElementosComuns()`) |

## Dados já salvos no navegador

Quem já usou o site tem favoritas, cardápio, sacola e conta salvos com as chaves antigas (`bh`, `bhu`, `bhs`, `bhk`, `bhg`). Na primeira visita, `migrarDadosAntigos()` converte tudo para as chaves novas (`behealthierEstadoVisitante`, `behealthierUsuarios`, `behealthierSessao`, `behealthierToken`, `behealthierVisitante`) e mantém a senha e os dados da conta.

## Cardápio: painel "Sua semana" (novo)

| Nome | O que é |
|---|---|
| `painelSemana`, `#resumoDaSemana` | painel novo no fim do Cardápio |
| `htmlResumoDaSemana()` | monta os 3 números e as 7 barras de calorias |
| `estatisticasSemana`, `linhaDiaSemana` | classes do resumo (clicar numa linha abre o dia) |
| `abrirListaDeCompras()`, `data-acao="abrirListaDeCompras"` | janela com os ingredientes das receitas da semana |
| `blocoCompras`, `itemCompra` | classes da lista de compras (caixinha que risca o item) |
| `abrirCopiarDia()`, `acaoCopiarDiaPara()` | copia os pratos do dia aberto para outro dia |

## Sobre nós: equipe

Cada integrante é um `cardMembro` com `fotoMembro` (imagem), `nomeMembro` (título) e `descricaoMembro` (texto), dentro da `gradeEquipe`. `gradeMissaoValores` e `tituloSecao` organizam o resto da página. As fotos ficam em `Imagens/equipe/` (por enquanto todas usam `foto-padrao.svg`).
