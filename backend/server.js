const express = require('express'),
    mongoose = require('mongoose'),
    bcrypt = require('bcryptjs'),
    jwt = require('jsonwebtoken'),
    cors = require('cors');

const aplicacao = express();
aplicacao.use(cors(), express.json({ limit: '2mb' }));

const segredoJwt = process.env.JWT_SECRET || 'troque-este-segredo';

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

const Contato = mongoose.model(
    'Contato',
    new mongoose.Schema({ nome: String, email: String, telefone: String, assunto: String, mensagem: String, pagina: String, data: { type: Date, default: Date.now } }),
    'contatos',
);

const Lembrete = mongoose.model(
    'Lembrete',
    new mongoose.Schema({ email: { type: String, unique: true, lowercase: true }, pagina: String, data: { type: Date, default: Date.now } }),
    'lembretes',
);

const respostaDeSessao = usuario => ({
    token: jwt.sign({ id: usuario._id }, segredoJwt, { expiresIn: '30d' }),
    usuario: { nome: usuario.nome, email: usuario.email },
});

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

aplicacao.post('/api/entrar', async (requisicao, resposta) => {
    const usuario = await Usuario.findOne({ email: (requisicao.body.email || '').toLowerCase() });
    if (!usuario || !(await bcrypt.compare(requisicao.body.senha || '', usuario.senha)))
        return resposta.status(401).json({ erro: 'E-mail ou senha incorretos' });
    resposta.json(respostaDeSessao(usuario));
});

aplicacao.get('/api/estado', exigirAutenticacao, async (requisicao, resposta) =>
    resposta.json({ estado: (await Usuario.findById(requisicao.idUsuario)).estado }),
);

aplicacao.put('/api/estado', exigirAutenticacao, async (requisicao, resposta) => {
    await Usuario.findByIdAndUpdate(requisicao.idUsuario, { estado: requisicao.body.estado });
    resposta.json({ ok: true });
});

aplicacao.post('/api/contato', async (requisicao, resposta) => {
    const { nome, email, telefone, assunto, mensagem, pagina } = requisicao.body;
    if (!nome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '') || !mensagem)
        return resposta.status(400).json({ erro: 'Dados inválidos' });
    await Contato.create({ nome, email, telefone, assunto, mensagem, pagina });
    resposta.json({ ok: true });
});

aplicacao.post('/api/lembrete', async (requisicao, resposta) => {
    const { email, pagina } = requisicao.body;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) return resposta.status(400).json({ erro: 'E-mail inválido' });
    await Lembrete.updateOne({ email: email.toLowerCase() }, { $setOnInsert: { pagina } }, { upsert: true });
    resposta.json({ ok: true });
});

mongoose
    .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/behealthier')
    .then(() => aplicacao.listen(3000, () => console.log('API em http://localhost:3000')));
