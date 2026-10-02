// Comandos do servidor.
// Formato: [sintaxe(s), descrição]. Palavras entre {chaves} são argumentos:
// aparecem em itálico e não entram no texto copiado.
// Para mais de uma sintaxe na mesma linha, use uma lista.
const COMMANDS = [
    {
        cat: 'Conta',
        items: [
            ['/register {senha} {senha}', 'Cria sua conta (se a tela não aparecer).'],
            ['/login {senha}', 'Entra na sua conta (se a tela não aparecer).'],
            ['/changepassword {atual} {nova}', 'Troca sua senha.'],
            ['/spawn', 'Volta para o spawn.'],
            ['/kit terreno', 'Pega uma pá de ouro (a cada 2 horas).'],
            ['/help', 'Lista os comandos.'],
        ],
    },
    {
        cat: 'Convites',
        items: [
            ['/convidar {nick}', 'Coloca um amigo na whitelist.'],
            ['/convidar cancelar {nick}', 'Cancela um convite errado (até 10 minutos, antes da pessoa entrar).'],
            ['/convites', 'Mostra quem você convidou.'],
        ],
    },
    {
        cat: 'Terrenos',
        items: [
            ['/trust {nick}', 'Deixa o jogador construir no terreno onde você está (fora de terrenos, vale para todos os seus).'],
            ['/containertrust {nick}', 'Libera baús, fornalhas e animais, sem deixar construir.'],
            ['/accesstrust {nick}', 'Libera só portas, botões, alavancas e camas.'],
            ['/permissiontrust {nick}', 'Deixa o jogador dar permissões no seu terreno.'],
            ['/untrust {nick}', 'Tira as permissões do jogador.'],
            ['/trustlist', 'Mostra quem tem permissão no terreno.'],
            ['/claimslist', 'Lista seus terrenos e quantos blocos sobram.'],
            ['/abandonclaim', 'Apaga o terreno onde você está e devolve os blocos.'],
            ['/abandonallclaims', 'Apaga todos os seus terrenos.'],
            ['/subdivideclaims', 'Cria áreas internas com permissões próprias.'],
            ['/basicclaims', 'Volta a pá ao modo normal.'],
            ['/trapped', 'Tira você do terreno de alguém quando fica preso.'],
            ['/unlockdrops', 'Deixa outros jogadores pegarem os itens que você dropou.'],
            ['/givepet {nick}', 'Passa um pet seu para outro jogador.'],
        ],
    },
    {
        cat: 'Dinheiro e chat',
        items: [
            ['/money', 'Mostra seu saldo.'],
            ['/pay {nick} {valor}', 'Manda dinheiro para outro jogador.'],
            ['/baltop', 'Ranking dos mais ricos.'],
            ['/msg {nick} {mensagem}', 'Mensagem privada.'],
            ['/r {mensagem}', 'Responde a última mensagem privada.'],
            ['/ignoreplayer {nick}', 'Para de ver as mensagens de um jogador.'],
            ['/afk', 'Marca você como ausente (acontece sozinho após 3 minutos parado).'],
            ['/ping', 'Mostra sua latência.'],
        ],
    },
    {
        cat: 'Loja',
        items: [
            ['/ah', 'Abre a loja dos jogadores.'],
            ['/ah sell {preço}', 'Anuncia o item da sua mão.'],
            ['/ah active', 'Seus anúncios ativos (clique para cancelar).'],
            ['/ah expired', 'Pega de volta o que não vendeu.'],
            ['/ah redeem', 'Resgata itens comprados e devolvidos.'],
            ['/ah view {nick}', 'Anúncios de um jogador.'],
            ['/ah watch', 'Avisa quando aparecer o item que você procura.'],
            ['/ah history', 'Seu histórico de compras e vendas.'],
        ],
    },
    {
        cat: 'Clans',
        note: 'Os comandos em inglês (<code>/clan create</code>, <code>/clan invite</code>...) também funcionam. <code>/clan ajuda</code> mostra todos.',
        items: [
            ['/clan', 'Abre o menu do clan.'],
            ['/clan criar {tag} {nome}', 'Cria um clan.'],
            ['/clan convidar {nick}', 'Convida alguém (líder).'],
            [['/accept', '/deny'], 'Aceita ou recusa um convite de clan.'],
            ['/. {mensagem}', 'Fala no chat do clan.'],
            ['/ally {mensagem}', 'Fala no chat das alianças.'],
            ['/clan listar', 'Lista os clans do servidor.'],
            ['/clan perfil', 'Perfil do seu clan.'],
            ['/clan membros', 'Membros do clan.'],
            [['/clan ff permitir', '/clan ff auto'], 'Liga ou desliga o fogo amigo.'],
            ['/clan aliado adicionar {tag}', 'Propõe aliança (líder).'],
            ['/clan rival adicionar {tag}', 'Declara rivalidade (líder).'],
            ['/clan expulsar {nick}', 'Expulsa um membro (líder).'],
            ['/clan promover {nick}', 'Promove um membro a líder.'],
            ['/clan abandonar', 'Sai do clan.'],
            ['/clan debandar', 'Desfaz o clan (líder).'],
        ],
    },
    {
        cat: 'Visual',
        items: [
            ['/skin {nick}', 'Usa a skin de outro jogador.'],
            ['/skin url {link}', 'Usa uma skin a partir de um link de imagem.'],
            ['/skin clear', 'Volta para a sua skin.'],
            ['/skins', 'Abre o menu de skins.'],
            ['/namecolor', 'Muda a cor do seu nome no chat.'],
        ],
    },
];

const ALL = 'Todos';

// ---------- Utilidades ----------
const normalize = (s) =>
    s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const escapeHtml = (s) =>
    s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Texto copiado: tudo antes do primeiro argumento.
const copyText = (syntax) => syntax.split('{')[0].trim();

const syntaxHtml = (syntax) =>
    escapeHtml(syntax).replace(/\{([^}]+)\}/g, '<span class="arg">$1</span>');

// ---------- Copiar ----------
const toast = document.getElementById('toast');
let toastTimer;
function showToast(msg, isError) {
    toast.textContent = msg;
    toast.classList.toggle('error', !!isError);
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

async function copy(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Fallback para navegadores sem a API de clipboard
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, text.length);
        let ok = false;
        try { ok = document.execCommand('copy'); } catch { ok = false; }
        ta.remove();
        return ok;
    }
}

document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    const text = btn.dataset.copy;
    const ok = await copy(text);
    if (!ok) {
        showToast('Não deu para copiar. Copie na mão.', true);
        return;
    }
    showToast(`Copiado: ${text}`);
    const original = btn.textContent;
    btn.classList.add('is-copied');
    btn.textContent = 'Copiado!';
    clearTimeout(btn._t);
    btn._t = setTimeout(() => {
        btn.classList.remove('is-copied');
        btn.textContent = original;
    }, 1500);
});

// ---------- Lista de comandos ----------
const list = document.getElementById('cmd-list');
const chips = document.getElementById('cmd-chips');
const search = document.getElementById('cmd-search');
const count = document.getElementById('cmd-count');
const empty = document.getElementById('cmd-empty');

const entries = COMMANDS.flatMap((group) =>
    group.items.map(([syntax, desc]) => {
        const syntaxes = Array.isArray(syntax) ? syntax : [syntax];
        return {
            cat: group.cat,
            syntaxes,
            desc,
            haystack: normalize(`${syntaxes.join(' ').replace(/[{}]/g, '')} ${desc} ${group.cat}`),
        };
    })
);

let activeCat = ALL;

function renderChips() {
    const cats = [ALL, ...COMMANDS.map((g) => g.cat)];
    chips.innerHTML = cats
        .map((cat) => {
            const n = cat === ALL ? entries.length : entries.filter((e) => e.cat === cat).length;
            return `<button type="button" class="chip" data-cat="${escapeHtml(cat)}" aria-pressed="${cat === activeCat}">${escapeHtml(cat)}<span class="n">${n}</span></button>`;
        })
        .join('');
}

function renderList() {
    const terms = normalize(search.value).split(/\s+/).filter(Boolean);
    const visible = entries.filter(
        (e) => (activeCat === ALL || e.cat === activeCat) && terms.every((t) => e.haystack.includes(t))
    );

    const html = COMMANDS.map((group) => {
        const items = visible.filter((e) => e.cat === group.cat);
        if (!items.length) return '';
        const rows = items
            .map((e) => {
                const syn = e.syntaxes
                    .map((s) => {
                        const c = copyText(s);
                        return `<span class="cmd-syntax"><code>${syntaxHtml(s)}</code><button type="button" class="copy-btn" data-copy="${escapeHtml(c)}" aria-label="Copiar ${escapeHtml(c)}">copiar</button></span>`;
                    })
                    .join('');
                return `<li class="cmd"><div class="cmd-syntaxes">${syn}</div><p class="cmd-desc">${escapeHtml(e.desc)}</p></li>`;
            })
            .join('');
        const note = group.note && !terms.length ? `<p class="cmd-note">${group.note}</p>` : '';
        return `<div class="cmd-group"><h3>${escapeHtml(group.cat)}</h3><ul class="cmd-items">${rows}</ul>${note}</div>`;
    }).join('');

    list.innerHTML = html;
    empty.hidden = visible.length > 0;
    count.textContent =
        visible.length === entries.length
            ? `${entries.length} comandos`
            : `${visible.length} de ${entries.length} comandos`;
}

chips.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    activeCat = chip.dataset.cat;
    chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', c === chip));
    renderList();
});

search.addEventListener('input', renderList);

renderChips();
renderList();

// ---------- Links ----------
// Externos abrem em nova aba.
document.querySelectorAll('a[href]').forEach((a) => {
    if (/^https?:\/\//.test(a.getAttribute('href')) && a.host !== location.host) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
    }
});

// ---------- Navegação: destaca a seção atual ----------
const navLinks = [...document.querySelectorAll('.nav a')];
const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href')));

function setActive(id) {
    navLinks.forEach((a) => {
        const on = a.getAttribute('href') === `#${id}`;
        a.classList.toggle('active', on);
        if (on) {
            a.setAttribute('aria-current', 'true');
            // mantém o link ativo visível na barra rolável do celular
            const nav = a.parentElement;
            const left = a.offsetLeft - nav.clientWidth / 2 + a.clientWidth / 2;
            nav.scrollTo({ left, behavior: 'smooth' });
        } else {
            a.removeAttribute('aria-current');
        }
    });
}

let current = null;
function onScroll() {
    const line = window.innerHeight * 0.3;
    let id = null;
    for (const s of sections) {
        if (s.getBoundingClientRect().top <= line) id = s.id;
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        id = sections[sections.length - 1].id;
    }
    if (id !== current) {
        current = id;
        setActive(id);
    }
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
