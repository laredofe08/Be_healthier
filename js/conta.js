const chaveSessao = "beHealthier.sessao";
const prefixoConta = "beHealthier.conta.";

async function verificarSenha(senha, sal) {
    const chave = await crypto.subtle.importKey(
        "raw", new TextEncoder().encode(senha), "PBKDF2", false, ["deriveBits"]
    );
    const resultado = await crypto.subtle.deriveBits({
        name: "PBKDF2",
        hash: "SHA-256",
        salt: Uint8Array.from(sal),
        iterations: 600000
    }, chave, 256);

    return Array.from(new Uint8Array(resultado)).join("-");
}

function atualizarConta() {
    const email = localStorage.getItem(chaveSessao);
    const conta = email && lerEscolhas(prefixoConta + email, null);
    const nome = typeof conta?.nome === "string" ? conta.nome.trim() : "";

    for (const rotulo of document.querySelectorAll(".nomeUsuario")) {
        rotulo.textContent = nome || "Visitante";
    }

    for (const link of document.querySelectorAll('a.botaoUsuario[href="login.html"]')) {
        link.textContent = nome ? "Minha conta" : "Acessar conta";
    }

    const formulario = document.getElementById("formularioAutenticacao");
    if (!formulario) return;

    document.getElementById("areaEntrada").hidden = Boolean(nome);
    document.getElementById("botaoSair").hidden = !nome;
    document.querySelector(".botaoVisitante").textContent = nome
        ? "Voltar ao início" : "Continuar como visitante";

    const tituloEntrada = document.body.dataset.modo === "cadastro"
        ? "Crie sua conta" : "Bem-vindo de volta";
    document.getElementById("tituloAutenticacao").textContent = nome ? "Olá, " + nome : tituloEntrada;
}

const formularioConta = document.getElementById("formularioAutenticacao");

if (formularioConta) {
    const campos = formularioConta.elements;
    const abas = document.querySelectorAll('[data-acao="alternarAbaAutenticacao"]');
    const botao = document.getElementById("botaoAutenticar");
    const aviso = document.getElementById("erroAutenticacao");

    function mudarModo(modo) {
        const cadastro = modo === "cadastro";
        document.body.dataset.modo = modo;
        campos.nome.disabled = !cadastro;
        campos.nome.required = cadastro;
        campos.senha.minLength = cadastro ? 8 : 1;
        campos.senha.autocomplete = cadastro ? "new-password" : "current-password";
        campos.senha.value = "";
        aviso.textContent = "";
        botao.textContent = cadastro ? "Criar conta" : "Entrar";
        document.getElementById("tituloAutenticacao").textContent = cadastro
            ? "Crie sua conta" : "Bem-vindo de volta";

        for (const aba of abas) {
            const ativa = aba.dataset.valor === modo;
            aba.classList.toggle("ativo", ativa);
            aba.setAttribute("aria-pressed", String(ativa));
        }
    }

    for (const aba of abas) {
        aba.addEventListener("click", () => mudarModo(aba.dataset.valor));
    }

    formularioConta.addEventListener("submit", async function (evento) {
        evento.preventDefault();
        if (botao.disabled) return;

        const email = campos.email.value.trim().toLowerCase();
        const senha = campos.senha.value;
        const nome = campos.nome.value.trim();
        const cadastro = document.body.dataset.modo === "cadastro";
        const chave = prefixoConta + email;
        botao.disabled = true;
        for (const aba of abas) aba.disabled = true;

        try {
            if (!window.crypto?.subtle) {
                aviso.textContent = "Abra o site pelo Live Server em localhost ou use HTTPS.";
                return;
            }

            const conta = JSON.parse(localStorage.getItem(chave));

            if (cadastro) {
                if (!nome || conta) {
                    aviso.textContent = conta ? "Este e-mail já tem uma conta." : "Informe seu nome.";
                    return;
                }

                const sal = Array.from(crypto.getRandomValues(new Uint8Array(16)));
                const verificador = await verificarSenha(senha, sal);
                localStorage.setItem(chave, JSON.stringify({ nome, sal, verificador }));
            } else if (!conta || await verificarSenha(senha, conta.sal) !== conta.verificador) {
                aviso.textContent = "E-mail ou senha incorretos.";
                return;
            }

            localStorage.setItem(chaveSessao, email);
            window.location.assign("index.html");
        } catch {
            aviso.textContent = "Não foi possível acessar a conta neste navegador.";
        } finally {
            botao.disabled = false;
            for (const aba of abas) aba.disabled = false;
        }
    });

    document.getElementById("botaoSair").addEventListener("click", function () {
        localStorage.removeItem(chaveSessao);
        formularioConta.reset();
        mudarModo("entrar");
        atualizarConta();
    });

    mudarModo("entrar");
}

atualizarConta();

window.addEventListener("pageshow", function (evento) {
    if (evento.persisted) atualizarConta();
});

window.addEventListener("storage", function (evento) {
    if (!evento.key || evento.key === chaveSessao || evento.key.startsWith(prefixoConta)) {
        atualizarConta();
    }
});
