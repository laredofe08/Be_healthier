/* BeHealthier - lógica compartilhada por todas as páginas (a página é definida por <body data-page>). Depende de receitas-data.js */

/*=== base ===*/

const PAGE = document.body.dataset.page;

const LOGO = '<img src="Imagens/esquilo-logo.svg" alt="">';

const $ = s => document.querySelector(s);

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const MEALS = ['Café da manhã', 'Almoço', 'Lanche', 'Jantar'];

const PG = [
    ['home', 'Início', '🏠'],
    ['receitas', 'Receitas', '🍽️'],
    ['cardapio', 'Cardápio', '📅'],
    ['equilibrio', 'Equilíbrio', '⚖️'],
    ['dicas', 'Dicas', '💡'],
    ['entrega', 'Entrega', '🛵'],
    ['videos', 'Vídeos', '▶️'],
    ['sobre', 'Sobre nós', '🐿️'],
];

// IDs dos vídeos do YouTube (os 11 caracteres depois de v=). Adicione aqui.
const VIDEOS = [];

/*=== estado ===*/

const D = () => ({ p: {}, fav: [], plan: {}, cart: {}, city: 'Joinville', ord: null });

let S = D();
let ME = null;

const U = {
    q: '',
    cat: '',
    rf: [...(S.p.rest || [])],
    fv: false,
    n: 24,
    day: +(
        (() => {
            try {
                return sessionStorage.bhd;
            } catch (e) {}
        })() ?? (new Date().getDay() + 6) % 7
    ),
    goal: S.p.obj || 'manter',
};

const sv = () => {
    if (ME) API.save(ME.email, S);
    else
        try {
            localStorage.bh = JSON.stringify(S);
        } catch (e) {}
};

/*=== dados das receitas ===*/

const RX = {
    lactose:
        /leite|queijo|iogurte|manteiga|requeij|creme de leite|ricota|cottage|nata\b|mussarela|parmes|whey|chantilly/,
    gluten: /trigo|aveia|p[ãa]o\b|pães|macarr|massa|torrada|cevada|centeio|biscoito|granola|panko/,
    ovo: /\bovos?\b|claras?\b|gemas?\b/,
    vegetariano:
        /frango|carne|peixe|atum|salm[ãa]o|camar[ãa]o|bacon|presunto|peru\b|porco|lingui[çc]a|patinho|fil[ée]|til[áa]pia|bovin|sardinha|bife|hamb[úu]rguer|coxa|peito de|acém|alcatra/,
};

const RL = {
    lactose: 'Sem lactose',
    gluten: 'Sem glúten',
    ovo: 'Sem ovo',
    vegetariano: 'Vegetariano',
};

const RM = {};
R.forEach(r => {
    r.f = Math.max(0, Math.round((r.k - 4 * r.p - 4 * r.c) / 9));
    r.t = (r.n + ' ' + r.i).toLowerCase().replace(/leite (de|vegetal)[a-zçã ]*/g, '');
    r.pr = 12 + Math.round(r.p * 0.4);
    RM[r.id] = r;
});

const CATS = [...new Set(R.map(r => r.cat))];

const ok = (r, rs) => rs.every(k => !RX[k].test(r.t));

const img = r => IM[r.id] || H.mesa;

/*=== utilitários ===*/

const esc = s => String(s).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');

const fm = n => Math.round(n);

const brl = n => 'R$ ' + n.toFixed(2).replace('.', ',');

const onIf = (s, f) => document.querySelectorAll(s).forEach(e => e.classList.toggle('active', f(e)));

const toast = m => {
    const t = $('#tt');
    t.textContent = m;
    t.classList.add('active');
    clearTimeout(t._);
    t._ = setTimeout(() => t.classList.remove('active'), 2200);
};

/*=== metas e cardápio ===*/

function meta() {
    const p = S.p;
    if (!(p.peso && p.alt && p.idade)) return { k: 2000, prot: 75, agua: 2000, def: 1 };
    const b = 10 * p.peso + 6.25 * p.alt - 5 * p.idade + (p.sexo == 'f' ? -161 : 5),
        t = b * [1.2, 1.375, 1.55, 1.725][p.ativ ?? 1],
        o = p.obj || 'manter';
    return {
        k: fm(t + { perder: -400, manter: 0, ganhar: 300, musculo: 250 }[o]),
        prot: fm(p.peso * (o == 'musculo' ? 2 : o == 'perder' ? 1.8 : 1.4)),
        agua: fm(p.peso * 35),
    };
}

const dayItems = d => (S.plan[d] || []).map(x => ({ m: x[0], r: RM[x[1]] }));

const tot = d =>
    dayItems(d).reduce(
        (a, x) => ({ k: a.k + x.r.k, p: a.p + x.r.p, c: a.c + x.r.c, f: a.f + x.r.f }),
        { k: 0, p: 0, c: 0, f: 0 },
    );

const addP = (d, m, id) => {
    (S.plan[d] = S.plan[d] || []).push([+m, +id]);
    sv();
};

/*=== componentes ===*/

const card = r =>
    `<article class="recipe-card" data-a="open" data-id="${r.id}"><img loading="lazy" src="${img(r)}" alt=""><div class="recipe-card-body"><h4>${r.n.replace(/ \(.*\)/, '')}</h4><div class="muted-text"><span><b>${fm(r.k)}</b> kcal</span><span>P ${fm(r.p)}g</span><span>C ${fm(r.c)}g</span></div></div><button class="favorite-button ${S.fav.includes(r.id) ? 'active' : ''}" data-a="fav" data-id="${r.id}">♥</button></article>`;

const bar = (v, m) =>
    `<div class="progress-bar"><i class="${v > m ? 'over-limit' : ''}" style="width:${Math.min(100, m ? (v / m) * 100 : 0)}%"></i></div>`;

function recList() {
    let l = R.filter(
        r =>
            ok(r, U.rf) &&
            (!U.cat || r.cat == U.cat) &&
            (!U.fv || S.fav.includes(r.id)) &&
            (!U.q || r.t.includes(U.q.toLowerCase())),
    );
    return l.length
        ? `<div class="recipe-grid">${l.slice(0, U.n).map(card).join('')}</div>${l.length > U.n ? '<p style="text-align:center;margin-top:20px"><button class="btn btn-green" data-a="more2">Ver mais (' + (l.length - U.n) + ')</button></p>' : ''}`
        : '<div class="empty-state">Nenhuma receita encontrada 🥲</div>';
}

/*=== modal ===*/

const openM = h => {
    $('#mb').innerHTML = '<button class="modal-close" data-a="x">×</button>' + h;
    $('#ov').classList.add('active');
};
const closeM = () => $('#ov').classList.remove('active');

function openR(id) {
    const r = RM[id];
    openM(`<img src="${img(r)}" alt=""><div class="modal-content"><h2>${r.n}</h2><p class="muted-text" style="margin:8px 0 16px;font-size:.95rem"><span>${r.cat}</span><span><b>${fm(r.k)}</b> kcal</span><span>P ${fm(r.p)}g</span><span>C ${fm(r.c)}g</span><span>G ${r.f}g</span></p><h4>Ingredientes</h4><pre>${r.i}</pre><h4>Modo de preparo</h4><pre>${r.pp}</pre>
 <div class="toolbar"><select id="sd">${DAYS.map((d, i) => `<option value="${i}" ${i == U.day ? 'selected' : ''}>${d}</option>`).join('')}</select><select id="sm">${MEALS.map((m, i) => `<option value="${i}">${m}</option>`).join('')}</select><button class="btn btn-small btn-green" data-a="addp" data-id="${id}">+ Cardápio</button></div>
 <div class="toolbar"><button class="btn btn-small btn-outlined" data-a="fav" data-id="${id}">${S.fav.includes(id) ? '♥ Favorita' : '♡ Favoritar'}</button><button class="btn btn-small" data-a="cadd" data-id="${id}">🛍️ Sacola ${brl(r.pr)}</button></div></div>`);
}

function pickM(mi) {
    openM(
        `<div class="modal-content"><h2>Adicionar ao ${MEALS[mi]}</h2><div class="toolbar"><input id="pq" placeholder="🔍 Buscar" data-m="${mi}"></div><div id="pl">${pl(mi, '')}</div></div>`,
    );
}

const pl = (mi, q) =>
    R.filter(r => ok(r, S.p.rest || []) && r.t.includes(q.toLowerCase()))
        .slice(0, 30)
        .map(
            r =>
                `<div class="item-row" data-a="padd" data-id="${r.id}" data-m="${mi}" style="cursor:pointer"><img src="${img(r)}" alt=""><div><b>${r.n.replace(/ \(.*\)/, '')}</b><span class="muted-text">${fm(r.k)} kcal · P ${fm(r.p)}g</span></div></div>`,
        )
        .join('');

/*=== sacola e pedido ===*/

const cn = () => Object.values(S.cart).reduce((a, b) => a + b, 0);

function cartM() {
    const ids = Object.keys(S.cart),
        fee = { Joinville: 6, 'São Francisco do Sul': 9, Araquari: 8 }[S.city],
        sub = ids.reduce((a, i) => a + RM[i].pr * S.cart[i], 0);
    openM(
        `<div class="modal-content"><h2>Sua sacola</h2><p class="muted-text">Entrega em ${S.city}</p>${ids.length ? ids.map(i => `<div class="item-row"><img src="${img(RM[i])}" alt=""><div><b>${RM[i].n.replace(/ \(.*\)/, '')}</b><span class="muted-text">${brl(RM[i].pr)}</span></div><button class="chip" data-a="cdec" data-id="${i}">−</button><b>${S.cart[i]}</b><button class="chip" data-a="cinc" data-id="${i}">+</button></div>`).join('') + `<p style="margin:14px 0">Subtotal ${brl(sub)} · Taxa ${brl(fee)}<br><b class="big-number" style="font-size:1.6rem">Total ${brl(sub + fee)}</b></p><form class="form-grid" style="grid-template-columns:1fr 1fr" id="ck"><label>Nome<input name="nome" value="${ME ? esc(ME.nome) : ''}"></label><label>Bairro<input name="bairro"></label><label class="full-width">Endereço<input name="end"></label><label class="full-width">Pagamento<select name="pg"><option>Pix</option><option>Cartão</option><option>Dinheiro</option></select></label></form><button class="btn" style="margin-top:16px;width:100%;justify-content:center" data-a="buy">Finalizar pedido</button>` : '<div class="empty-state">Sua sacola está vazia 🛍️<br><br><a class="btn btn-small btn-green" href="entrega.html" data-a="x">Ver pratos</a></div>'}</div>`,
    );
}

function trk() {
    const o = S.ord,
        e = $('#trk');
    if (!e) return;
    if (!o) {
        e.innerHTML = '';
        return;
    }
    const st = Math.min(3, Math.floor((Date.now() - o.t) / 6000));
    e.innerHTML = `<div class="panel"><h3 style="margin-top:0">Pedido #${o.id} · ${brl(o.total)}</h3><p class="muted-text">${o.n} itens · entrega em ${esc(o.city)} para ${esc(o.nome)}</p><div class="order-tracker">${['Confirmado', 'Preparando', 'A caminho', 'Entregue'].map((s, i) => `<div class="${i <= st ? 'step-done' : ''}"><i></i>${s}</div>`).join('')}</div>${st == 3 ? '<button class="btn btn-small" style="margin-top:14px" data-a="ordx">Novo pedido</button>' : ''}</div>`;
}

/*=== páginas ===*/

/* O HTML já traz menu e textos. Aqui o JS só atualiza contador da sacola, cidade e usuário */
function chrome() {
    const n = cn();
    document.querySelectorAll('.cart-count').forEach(e => {
        e.textContent = n;
        if (e.classList.contains('badge')) e.hidden = !n;
    });
    document.querySelectorAll('.city-now').forEach(e => (e.textContent = '📍 ' + S.city + ' ▾'));
    document
        .querySelectorAll('.user-name')
        .forEach(e => (e.textContent = ME ? ME.nome : 'Visitante'));
    document
        .querySelectorAll('.user-detail')
        .forEach(e => (e.textContent = ME ? ME.email : 'Progresso só neste aparelho'));
    document
        .querySelectorAll('.user-button')
        .forEach(e => (e.textContent = ME ? 'Sair' : 'Entrar / criar conta'));
}

/* Uma função por página. Cada uma preenche só os "espaços" (ids) que existem no HTML daquela página */
const P = {
    home() {
        const p = S.p,
            lk = (p.gosta || '')
                .toLowerCase()
                .split(/[,;\n]+/)
                .map(s => s.trim())
                .filter(Boolean),
            rs = p.rest || [];
        $('#hi').textContent = ME ? 'Olá, ' + ME.nome.split(' ')[0] + ' 👋' : '';
        $('#nfav').textContent = S.fav.length;
        $('#rec-t').textContent = lk.length || rs.length ? 'Para você' : 'Para começar';
        $('#rec-s').textContent =
            lk.length || rs.length
                ? 'Baseado no seu perfil'
                : 'Preencha o Equilíbrio para receber sugestões personalizadas';
        $('#rec').innerHTML = R.filter(r => ok(r, rs))
            .sort(
                (a, b) =>
                    lk.filter(w => b.t.includes(w)).length -
                        lk.filter(w => a.t.includes(w)).length || a.id - b.id,
            )
            .slice(0, 8)
            .map(card)
            .join('');
    },
    receitas() {
        onIf('[data-a=rf]', e => U.rf.includes(e.dataset.k));
        $('[data-a=fvf]').classList.toggle('active', U.fv);
        $('#rl').innerHTML = recList();
    },
    cardapio() {
        const t = tot(U.day),
            m = meta(),
            it = dayItems(U.day);
        document.querySelectorAll('[data-a=day]').forEach(e => {
            const i = +e.dataset.i;
            e.classList.toggle('active', i == U.day);
            e.textContent = DAYS[i] + ((S.plan[i] || []).length ? ' •' : '');
        });
        $('#dia').textContent = DAYS[U.day];
        $('#meals').innerHTML = MEALS.map(
            (mn, mi) =>
                `<div class="meal-header"><h4>${mn}</h4><button class="btn btn-small btn-green" data-a="pick" data-m="${mi}">+ Adicionar</button></div>` +
                (it
                    .map((x, ix) => ({ ...x, ix }))
                    .filter(x => x.m == mi)
                    .map(
                        x =>
                            `<div class="item-row"><img src="${img(x.r)}" alt=""><div><b>${x.r.n.replace(/ \(.*\)/, '')}</b><span class="muted-text">${fm(x.r.k)} kcal · P ${fm(x.r.p)}g · C ${fm(x.r.c)}g</span></div><button class="remove-button" data-a="rm" data-i="${x.ix}">×</button></div>`,
                    )
                    .join('') || '<p class="muted-text" style="padding:10px 0">Nada planejado</p>'),
        ).join('');
        $('#resumo').innerHTML =
            `<div class="big-number">${fm(t.k)} <small style="font-size:1rem;color:var(--muted)">/ ${m.k} kcal</small></div>${bar(t.k, m.k)}<div class="muted-text">Proteínas ${fm(t.p)}g</div>${bar(t.p, m.prot)}<div class="muted-text">Carboidratos ${fm(t.c)}g</div>${bar(t.c, (m.k * 0.5) / 4)}<div class="muted-text">Gorduras ${fm(t.f)}g</div>${bar(t.f, (m.k * 0.3) / 9)}`;
    },
    equilibrio(first) {
        const p = S.p;
        if (first) {
            const f = $('#pf');
            ['peso', 'alt', 'idade', 'sexo', 'ativ', 'obj', 'gosta'].forEach(k => {
                if (p[k] !== undefined && p[k] !== '') f.elements[k].value = p[k];
            });
            f.querySelectorAll('[name=rest]').forEach(
                c => (c.checked = (p.rest || []).includes(c.value)),
            );
        }
        const m = meta(),
            t = tot(U.day),
            wk = DAYS.map((_, i) => tot(i).k),
            ws = wk.reduce((a, b) => a + b, 0),
            over = t.k - m.k,
            pe = p.peso || 70;
        $('#eq').innerHTML =
            (m.def
                ? '<div class="alert">Preencha peso, altura e idade para calcular metas personalizadas. Por enquanto usamos valores de referência (2000 kcal).</div>'
                : '') +
            (over > 0
                ? `<div class="alert"><b>Você passou ${fm(over)} kcal hoje 😉</b> Sem culpa! Uma forma leve de compensar: ${fm(over / (pe * 0.05))} min de caminhada, ${fm(over / (pe * 0.09))} min de bicicleta ou ${fm(over / (pe * 0.13))} min de corrida leve.</div>`
                : '') +
            `<div class="two-columns"><div class="panel"><h3 style="margin-top:0">Semana: ${fm(ws)} de ${m.k * 7} kcal</h3>${bar(ws, m.k * 7)}<p class="muted-text">Você ainda pode consumir <b>${Math.max(0, m.k * 7 - ws)}</b> kcal esta semana.</p><div class="week-chart">${wk.map((k, i) => `<div class="${i == U.day ? 'current-day' : ''}"><span>${fm(k)}</span><i class="${k > m.k ? 'over-limit' : ''}" style="height:${Math.min(100, (k / m.k) * 75)}%"></i>${DAYS[i]}</div>`).join('')}</div></div>
  <div class="panel"><h3 style="margin-top:0">Metas diárias</h3><p>💧 Água: <b>${(m.agua / 1000).toFixed(1)} L</b></p><p>🥩 Proteínas: <b>${m.prot} g</b></p><p>🌾 Fibras: <b>25 g</b></p><p>🍊 Vitamina C: <b>90 mg</b></p><p>🥛 Cálcio: <b>1000 mg</b></p><p>🩸 Ferro: <b>${p.sexo == 'f' ? 18 : 8} mg</b></p><p class="muted-text" style="margin-top:10px">Hoje (${DAYS[U.day]}): ${fm(t.k)} kcal · restam ${Math.max(0, m.k - fm(t.k))}</p></div></div>`;
    },
    dicas() {
        onIf('[data-a=goal]', e => e.dataset.k == U.goal);
        document.querySelectorAll('.goal').forEach(e => (e.hidden = e.dataset.g != U.goal));
    },
    entrega() {
        onIf('[data-a=city]', e => e.dataset.k == S.city);
        trk();
        $('#dishes').innerHTML = R.filter(r =>
            [
                'Frango',
                'Carne bovina',
                'Veganas/vegetarianas',
                'Peixes e frutos do mar',
                'Pratos diversos',
            ].includes(r.cat),
        )
            .slice(0, 30)
            .map(
                r =>
                    `<article class="recipe-card" data-a="open" data-id="${r.id}"><img loading="lazy" src="${img(r)}" alt=""><div class="recipe-card-body"><h4>${r.n.replace(/ \(.*\)/, '')}</h4><div class="muted-text">${fm(r.k)} kcal · P ${fm(r.p)}g</div><div class="price">${brl(r.pr)}<button class="btn btn-small btn-green" data-a="cadd" data-id="${r.id}">+ Sacola</button></div></div></article>`,
            )
            .join('');
    },
    videos() {
        $('#vl').innerHTML = VIDEOS.length
            ? `<div class="video-grid">${VIDEOS.map(v => `<div><iframe src="https://www.youtube-nocookie.com/embed/${v}" allowfullscreen loading="lazy"></iframe></div>`).join('')}</div>`
            : '<div class="empty-state panel">▶️<br>Em breve, novos vídeos por aqui!</div>';
    },
};

function render(first) {
    chrome();
    if (P[PAGE]) P[PAGE](first);
}

function rerender() {
    const y = scrollY;
    render();
    scrollTo(0, y);
}

/*=== API ===*/

/* base vazio = modo local (localStorage). Para usar o MongoDB, aponte para o backend, ex: 'http://localhost:3000/api' */
const API = {
    base: '',
    async h(p) {
        const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(p));
        return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
    },
    async req(m, p, b) {
        const r = await fetch(this.base + p, {
                method: m,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + (localStorage.bhk || ''),
                },
                body: b && JSON.stringify(b),
            }),
            j = await r.json();
        if (!r.ok) throw new Error(j.erro || 'Erro no servidor');
        return j;
    },
    users() {
        try {
            return JSON.parse(localStorage.bhu || '{}');
        } catch (e) {
            return {};
        }
    },
    async register(nome, email, senha) {
        if (this.base) {
            const j = await this.req('POST', '/register', { nome, email, senha });
            localStorage.bhk = j.token;
            return j.user;
        }
        const u = this.users();
        if (u[email]) throw new Error('Este e-mail já está cadastrado');
        u[email] = { nome, hash: await this.h(senha), estado: D() };
        localStorage.bhu = JSON.stringify(u);
        return { nome, email };
    },
    async login(email, senha) {
        if (this.base) {
            const j = await this.req('POST', '/login', { email, senha });
            localStorage.bhk = j.token;
            return j.user;
        }
        const u = this.users()[email];
        if (!u || u.hash !== (await this.h(senha))) throw new Error('E-mail ou senha incorretos');
        return { nome: u.nome, email };
    },
    async load(email) {
        if (this.base) return (await this.req('GET', '/state')).estado;
        return (this.users()[email] || {}).estado;
    },
    save(email, s) {
        if (this.base) this.req('PUT', '/state', { estado: s }).catch(() => {});
        else {
            const u = this.users();
            if (u[email]) {
                u[email].estado = s;
                try {
                    localStorage.bhu = JSON.stringify(u);
                } catch (e) {}
            }
        }
    },
};

/*=== conta e login ===*/

async function enter(u) {
    ME = u;
    let d;
    if (u) d = await API.load(u.email);
    else
        try {
            d = JSON.parse(localStorage.bh || '{}');
        } catch (e) {
            d = {};
        }
    S = Object.assign(D(), d || {});
    U.rf = [...(S.p.rest || [])];
    U.goal = S.p.obj || 'manter';
    if (PAGE == 'login') {
        location.href = 'index.html';
        return;
    }
    render(true);
}

async function doAuth() {
    const f = new FormData($('#af')),
        reg = document.body.dataset.mode == 'reg',
        e = (f.get('email') || '').trim().toLowerCase(),
        s = f.get('senha') || '',
        n = (f.get('nome') || '').trim(),
        m = $('#ae');
    try {
        if (!e || !s || (reg && !n)) throw new Error('Preencha todos os campos');
        if (reg && s.length < 6) throw new Error('A senha precisa ter 6 ou mais caracteres');
        const u = reg ? await API.register(n, e, s) : await API.login(e, s);
        localStorage.bhs = JSON.stringify(u);
        await enter(u);
    } catch (x) {
        m.textContent = x.message;
    }
}

/*=== eventos ===*/

document.addEventListener('click', e => {
    const t = e.target.closest('[data-a]');
    if (e.target.id == 'ov') return closeM();
    if (!t) return;
    const a = t.dataset.a,
        d = t.dataset,
        id = +d.id;
    const A = {
        // geral
        x: closeM,
        more: () => {
            e.preventDefault();
            openM(
                `<div class="modal-content"><h2>Mais</h2>${PG.slice(4)
                    .map(
                        p =>
                            `<a class="item-row" href="${p[0] == 'home' ? 'index' : p[0]}.html" data-a="x"><span style="font-size:1.8rem">${p[2]}</span><div><b>${p[1]}</b></div></a>`,
                    )
                    .join(
                        '',
                    )}<div class="item-row"><span style="font-size:1.8rem">👤</span><div><b>${ME ? esc(ME.nome) : 'Visitante'}</b><span class="muted-text">${ME ? esc(ME.email) : 'Progresso só neste aparelho'}</span></div><button class="btn btn-small btn-outlined" data-a="logout">${ME ? 'Sair' : 'Entrar'}</button></div></div>`,
            );
        },

        // receitas
        open: () => openR(id),
        fav: () => {
            e.stopPropagation();
            S.fav = S.fav.includes(id) ? S.fav.filter(x => x != id) : [...S.fav, id];
            sv();
            toast(S.fav.includes(id) ? '♥ Adicionada às favoritas' : 'Removida das favoritas');
            $('#ov').classList.contains('active') ? openR(id) : rerender();
        },
        rf: () => {
            U.rf = U.rf.includes(d.k) ? U.rf.filter(x => x != d.k) : [...U.rf, d.k];
            U.n = 24;
            rerender();
        },
        fvf: () => {
            U.fv = !U.fv;
            U.n = 24;
            rerender();
        },
        more2: () => {
            U.n += 24;
            $('#rl').innerHTML = recList();
        },

        // cardápio
        day: () => {
            U.day = +d.i;
            try {
                sessionStorage.bhd = U.day;
            } catch (e) {}
            rerender();
        },
        pick: () => pickM(+d.m),
        padd: () => {
            addP(U.day, d.m, id);
            closeM();
            toast('Adicionado ao cardápio ✔');
            rerender();
        },
        addp: () => {
            addP($('#sd').value, $('#sm').value, id);
            U.day = +$('#sd').value;
            try {
                sessionStorage.bhd = U.day;
            } catch (e) {}
            closeM();
            toast('Adicionado ao cardápio de ' + DAYS[U.day] + ' ✔');
            if (['cardapio', 'equilibrio'].includes(PAGE)) rerender();
        },
        rm: () => {
            S.plan[U.day].splice(+d.i, 1);
            sv();
            rerender();
        },
        clr: () =>
            openM(
                `<div class="modal-content"><h2>Limpar a semana?</h2><p class="muted-text" style="margin:8px 0 18px;font-size:1rem">Todos os pratos dos 7 dias serão removidos do cardápio.</p><div class="toolbar"><button class="btn" data-a="clrok">Sim, limpar</button><button class="btn btn-outlined" data-a="x">Cancelar</button></div></div>`,
            ),
        clrok: () => {
            S.plan = {};
            sv();
            closeM();
            toast('Cardápio limpo 🧹');
            rerender();
        },
        auto: () => {
            const m = meta(),
                rs = S.p.rest || [],
                P = [
                    [
                        'Ovos e café da manhã',
                        'Bebidas e café da manhã',
                        'Doces, sobremesas e lanches',
                    ],
                    [
                        'Frango',
                        'Carne bovina',
                        'Veganas/vegetarianas',
                        'Peixes e frutos do mar',
                        'Pratos diversos',
                    ],
                    ['Doces, sobremesas e lanches', 'Bebidas e café da manhã'],
                    ['Frango', 'Veganas/vegetarianas', 'Pratos diversos', 'Tortas e quiches'],
                ],
                sh = a => a.sort(() => Math.random() - 0.5);
            S.plan = {};
            for (let i = 0; i < 7; i++)
                P.forEach((c, mi) => {
                    const l = sh(
                        R.filter(
                            r =>
                                c.includes(r.cat) &&
                                ok(r, rs) &&
                                r.k < m.k * [0.3, 0.4, 0.2, 0.35][mi],
                        ),
                    );
                    if (l[0]) addP(i, mi, l[0].id);
                });
            sv();
            toast('Semana sugerida! Ajuste como quiser ✨');
            rerender();
        },

        // perfil e equilíbrio
        save: () => {
            const f = new FormData($('#pf')),
                p = {};
            f.forEach((v, k) => {
                if (k != 'rest')
                    p[k] =
                        isNaN(v) || v === '' || ['gosta'].includes(k) || ['sexo', 'obj'].includes(k)
                            ? v
                            : +v;
            });
            p.rest = f.getAll('rest');
            S.p = p;
            U.rf = [...p.rest];
            U.goal = p.obj;
            sv();
            toast('Perfil salvo! Metas atualizadas ✔');
            rerender();
        },
        goal: () => {
            U.goal = d.k;
            rerender();
        },

        // entrega
        city: () => {
            S.city = d.k;
            sv();
            rerender();
        },
        citym: () => {
            location.href = 'entrega.html';
        },

        // sacola e pedido
        cart: cartM,
        cadd: () => {
            e.stopPropagation();
            S.cart[id] = (S.cart[id] || 0) + 1;
            sv();
            toast('🛍️ Adicionado à sacola');
            rerender();
        },
        cinc: () => {
            S.cart[id]++;
            sv();
            cartM();
            rerender();
        },
        cdec: () => {
            if (--S.cart[id] < 1) delete S.cart[id];
            sv();
            cartM();
            rerender();
        },
        buy: () => {
            const f = new FormData($('#ck'));
            if (!f.get('nome') || !f.get('end')) return toast('Preencha nome e endereço');
            const ids = Object.keys(S.cart),
                fee = { Joinville: 6, 'São Francisco do Sul': 9, Araquari: 8 }[S.city];
            S.ord = {
                id: Math.floor(1000 + Math.random() * 9000),
                t: Date.now(),
                n: cn(),
                city: S.city,
                nome: f.get('nome'),
                total: ids.reduce((a, i) => a + RM[i].pr * S.cart[i], 0) + fee,
            };
            S.cart = {};
            sv();
            closeM();
            location.href = 'entrega.html';
        },
        ordx: () => {
            S.ord = null;
            sv();
            rerender();
        },

        // conta
        auth: doAuth,
        atab: () => {
            document.body.dataset.mode = d.k;
            onIf('[data-a=atab]', e => e.dataset.k == d.k);
            $('#ttl').textContent = d.k == 'reg' ? 'Criar conta' : 'Bem-vindo de volta';
            $('#go').textContent = d.k == 'reg' ? 'Criar conta' : 'Entrar';
        },
        guest: () => {
            localStorage.bhg = 1;
            enter(null);
        },
        logout: () => {
            const on = !!ME;
            localStorage.removeItem('bhs');
            localStorage.removeItem('bhk');
            location.href = on ? 'index.html' : 'login.html';
        },
    };
    if (A[a]) {
        if (t.tagName == 'A' && a == 'x') {
            closeM();
            return;
        }
        A[a]();
    }
});

document.addEventListener('input', e => {
    if (e.target.id == 'q') {
        U.q = e.target.value;
        U.n = 24;
        $('#rl').innerHTML = recList();
    }
    if (e.target.id == 'pq') $('#pl').innerHTML = pl(e.target.dataset.m, e.target.value);
});

document.addEventListener('change', e => {
    if (e.target.id == 'cat') {
        U.cat = e.target.value;
        U.n = 24;
        $('#rl').innerHTML = recList();
    }
});

document.addEventListener('keydown', e => {
    if (e.key == 'Enter' && e.target.closest('#af')) doAuth();
});

setInterval(() => {
    if (
        S.ord &&
        PAGE == 'entrega' &&
        !$('#ov').classList.contains('active') &&
        Date.now() - S.ord.t < 26000 &&
        !document.activeElement.closest?.('input,select')
    )
        trk();
}, 3000);

/*=== inicialização ===*/

(async () => {
    try {
        const u = JSON.parse(localStorage.bhs || 'null');
        if (u) await enter(u);
        else if (PAGE == 'login') {
        } else await enter(null);
    } catch (e) {
        if (PAGE != 'login') await enter(null);
    }
})();
