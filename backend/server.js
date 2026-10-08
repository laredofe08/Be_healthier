// BeHealthier - backend (Express + MongoDB). Rodar: npm i && node server.js
//
// Onde é usado: só quando o site está no "modo backend" (api.urlBase preenchido em js/app.js).
//   - página Login: cadastro (aba "Criar conta") e entrada (aba "Entrar")
//   - todas as demais páginas: carregar o estado de quem está logado ao abrir, e salvar a cada mudança
//     (favoritar, cardápio, sacola, perfil, pedido...)
// Sem o backend, o site funciona igual, guardando tudo no navegador (localStorage).

// Bibliotecas: express (servidor), mongoose (MongoDB), bcryptjs (senha criptografada),
// jsonwebtoken (token de sessão) e cors (deixa o site chamar esta API de outro endereço)
const express = require('express'),
    mongoose = require('mongoose'),
    bcrypt = require('bcryptjs'),
    jwt = require('jsonwebtoken'),
    cors = require('cors');

// Cria o servidor. O cors libera as chamadas do site; o express.json lê o corpo das requisições (JSON)
const aplicacao = express();
aplicacao.use(cors(), express.json({ limit: '2mb' }));

// Chave que assina os tokens de sessão. Em produção, defina a variável de ambiente JWT_SECRET
const segredoJwt = process.env.JWT_SECRET || 'troque-este-segredo';

// O terceiro argumento mantém a coleção "users" que já existia no MongoDB (não perde os dados cadastrados)
const Usuario = mongoose.model(
    'Usuario',
    new mongoose.Schema(
        {
            nome: String,
            email: { type: String, unique: true, lowercase: true },
            senha: String,
            estado: { type: mongoose.Schema.Types.Mixed, default: {} },
        },
        { minimize: false },
    ),
    'users',
);

// Mensagens do formulário de contato (página Contato)
const Contato = mongoose.model(
    'Contato',
    new mongoose.Schema({ nome: String, email: String, telefone: String, assunto: String, mensagem: String, pagina: String, data: { type: Date, default: Date.now } }),
    'contatos',
);

// E-mails que pediram lembrete (formulário do rodapé)
const Lembrete = mongoose.model(
    'Lembrete',
    new mongoose.Schema({ email: { type: String, unique: true, lowercase: true }, pagina: String, data: { type: Date, default: Date.now } }),
    'lembretes',
);

// Resposta de login/cadastro: token de sessão + dados públicos do usuário
const respostaDeSessao = usuario => ({
    token: jwt.sign({ id: usuario._id }, segredoJwt, { expiresIn: '30d' }),
    usuario: { nome: usuario.nome, email: usuario.email },
});

// Middleware: exige um token válido e guarda o id do usuário em requisicao.idUsuario
const exigirAutenticacao = (requisicao, resposta, proximo) => {
    try {
        requisicao.idUsuario = jwt.verify(
            (requisicao.headers.authorization || '').slice(7),
            segredoJwt,
        ).id;
        proximo();
    } catch (erro) {
        resposta.status(401).json({ erro: 'Sessão inválida' });
    }
};

// POST /api/cadastro - Login, aba "Criar conta": valida os dados, guarda a senha criptografada e devolve o token
aplicacao.post('/api/cadastro', async (requisicao, resposta) => {
    const { nome, email, senha } = requisicao.body;
    if (!nome || !email || !senha || senha.length < 6)
        return resposta.status(400).json({ erro: 'Dados inválidos' });
    if (await Usuario.findOne({ email }))
        return resposta.status(409).json({ erro: 'Este e-mail já está cadastrado' });
    resposta.json(
        respostaDeSessao(await Usuario.create({ nome, email, senha: await bcrypt.hash(senha, 10) })),
    );
});

// POST /api/entrar - Login, aba "Entrar": confere e-mail e senha e devolve o token
aplicacao.post('/api/entrar', async (requisicao, resposta) => {
    const usuario = await Usuario.findOne({ email: (requisicao.body.email || '').toLowerCase() });
    if (!usuario || !(await bcrypt.compare(requisicao.body.senha || '', usuario.senha)))
        return resposta.status(401).json({ erro: 'E-mail ou senha incorretos' });
    resposta.json(respostaDeSessao(usuario));
});

// GET /api/estado - todas as páginas: devolve favoritas, cardápio, sacola, perfil e pedido de quem está logado
aplicacao.get('/api/estado', exigirAutenticacao, async (requisicao, resposta) =>
    resposta.json({ estado: (await Usuario.findById(requisicao.idUsuario)).estado }),
);

// PUT /api/estado - todas as páginas: salva o estado novo sempre que a pessoa muda alguma coisa
aplicacao.put('/api/estado', exigirAutenticacao, async (requisicao, resposta) => {
    await Usuario.findByIdAndUpdate(requisicao.idUsuario, { estado: requisicao.body.estado });
    resposta.json({ ok: true });
});

// POST /api/contato - Contato: guarda a mensagem (não exige login)
aplicacao.post('/api/contato', async (requisicao, resposta) => {
    const { nome, email, telefone, assunto, mensagem, pagina } = requisicao.body;
    if (!nome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '') || !mensagem)
        return resposta.status(400).json({ erro: 'Dados inválidos' });
    await Contato.create({ nome, email, telefone, assunto, mensagem, pagina });
    resposta.json({ ok: true });
});

// POST /api/lembrete - Rodapé: guarda o e-mail de quem quer lembrete (não exige login)
aplicacao.post('/api/lembrete', async (requisicao, resposta) => {
    const { email, pagina } = requisicao.body;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) return resposta.status(400).json({ erro: 'E-mail inválido' });
    await Lembrete.updateOne({ email: email.toLowerCase() }, { $setOnInsert: { pagina } }, { upsert: true });
    resposta.json({ ok: true });
});

// Conecta ao MongoDB e só então começa a atender na porta 3000
mongoose
    .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/behealthier')
    .then(() => aplicacao.listen(3000, () => console.log('API em http://localhost:3000')));
