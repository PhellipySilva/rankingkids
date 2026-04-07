// 🔑 SENHA DO PAINEL ADMIN — troque para a sua senha
const SENHA_ADMIN = "beach2025";

// Bloqueio após X tentativas erradas
const MAX_TENTATIVAS    = 5;
const BLOQUEIO_MINUTOS  = 2;

/* ═══════════════════════════════════════════════════
   📋 DADOS DOS ALUNOS
   Edite à vontade. Categorias válidas: "Adulto" | "Kids"
═══════════════════════════════════════════════════ */
let alunos = [
  { id: 1,  nome: "Rafael Torres",  categoria: "Adulto", pontos: 1100 },
  { id: 2,  nome: "Bruna Santos",   categoria: "Adulto", pontos: 920  },
  { id: 3,  nome: "Diego Ferreira", categoria: "Adulto", pontos: 755  },
  { id: 4,  nome: "Ana Lima",       categoria: "Adulto", pontos: 680  },
  { id: 5,  nome: "Lucas Souza",    categoria: "Kids",   pontos: 850  },
  { id: 6,  nome: "Miguel Costa",   categoria: "Kids",   pontos: 720  },
  { id: 7,  nome: "Sofia Mendes",   categoria: "Kids",   pontos: 640  },
  { id: 8,  nome: "Pedro Alves",    categoria: "Kids",   pontos: 530  },
  { id: 9,  nome: "Julia Rocha",    categoria: "Kids",   pontos: 490  },
];

/* ═══════════════════════════════════════════════════
   ESTADO INTERNO
═══════════════════════════════════════════════════ */
let categoriaAtiva = "Todos";
let adminAberto    = false;
let proximoId      = 200;
let tentativas     = 0;
let bloqueadoAte   = null;

/* ═══════════════════════════════════════════════════
   UTILITÁRIOS — AVATAR
═══════════════════════════════════════════════════ */
const paleta = ["#1A6B4A","#1E7BB5","#7C3AED","#DB2777","#059669","#D97706","#0E7490","#B45309"];

function corAvatar(nome) {
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = nome.charCodeAt(i) + ((h << 5) - h);
  return paleta[Math.abs(h) % paleta.length];
}
function iniciais(nome) {
  return nome.trim().split(/\s+/).map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

/* ═══════════════════════════════════════════════════
   CORE — CALCULAR RANKING
   Regras:
   1. Ordena por pontos (maior → menor)
   2. Empates recebem a mesma posição
   3. Posição seguinte pula o número (ex: 1, 2, 2, 4)
═══════════════════════════════════════════════════ */
function calcularRanking(lista) {
  const sorted = [...lista].sort((a, b) => b.pontos - a.pontos);
  let posAtual = 1;
  return sorted.map((aluno, i) => {
    if (i > 0 && aluno.pontos < sorted[i - 1].pontos) posAtual = i + 1;
    return { ...aluno, posicao: posAtual };
  });
}

function pctPontos(pontos, max) {
  return max === 0 ? 0 : Math.round((pontos / max) * 100);
}

/* ═══════════════════════════════════════════════════
   FILTRAR POR CATEGORIA
═══════════════════════════════════════════════════ */
function filtrarAlunos() {
  return categoriaAtiva === "Todos"
    ? alunos
    : alunos.filter(a => a.categoria === categoriaAtiva);
}

/* ═══════════════════════════════════════════════════
   RENDER — ESTATÍSTICAS
═══════════════════════════════════════════════════ */
function renderStats(ranking) {
  const max  = ranking[0]?.pontos || 0;
  const cats = [...new Set(ranking.map(a => a.categoria))].length;
  document.getElementById("stats-row").innerHTML = `
    <div class="stat-card">
      <div class="stat-val">${ranking.length}</div>
      <div class="stat-lbl">Participantes</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">${max}</div>
      <div class="stat-lbl">Maior Pontuação</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">${cats}</div>
      <div class="stat-lbl">${cats === 1 ? "Categoria" : "Categorias"}</div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════
   RENDER — PÓDIO (top 3, só em categoria específica)
═══════════════════════════════════════════════════ */
function renderPodio(ranking) {
  const w = document.getElementById("podio-wrapper");
  if (categoriaAtiva === "Todos" || ranking.length < 3) { w.innerHTML = ""; return; }

  const top   = ranking.slice(0, 3);
  const ordem = [top[1], top[0], top[2]];      // visual: 2°, 1°, 3°
  const cls   = ["pos-2", "pos-1", "pos-3"];
  const med   = ["🥈",    "🥇",    "🥉"];

  w.innerHTML = `
    <div class="podio">
      ${ordem.map((a, i) => `
        <div class="podio-item ${cls[i]}">
          <div class="podio-avatar" style="background:${corAvatar(a.nome)}">
            ${iniciais(a.nome)}
            <span class="podio-medal">${med[i]}</span>
          </div>
          <div class="podio-nome">${a.nome}</div>
          <div class="podio-pontos">${a.pontos}</div>
          <div class="podio-label">pontos</div>
          <div class="podio-plataforma"></div>
        </div>
      `).join("")}
    </div>
  `;
}

/* ═══════════════════════════════════════════════════
   RENDER — TABELA
═══════════════════════════════════════════════════ */
function medalha(pos) {
  return pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : pos;
}
function classeRow(pos) {
  return pos === 1 ? "top1" : pos === 2 ? "top2" : pos === 3 ? "top3" : "";
}

function renderTabela(ranking) {
  const card   = document.getElementById("ranking-card");
  const maxPts = ranking[0]?.pontos || 1;

  if (ranking.length === 0) {
    card.innerHTML = `
      <div class="vazio">
        <div class="vazio-icon">🏖️</div>
        <div class="vazio-txt">Nenhum aluno nesta categoria ainda.</div>
      </div>`;
    return;
  }

  card.innerHTML = `
    <div class="ranking-header-row">
      <div style="text-align:center">#</div>
      <div>Aluno</div>
      <div style="text-align:center">Pts</div>
      <div style="text-align:right">Aproveit.</div>
    </div>
    ${ranking.map(a => {
      const pct = pctPontos(a.pontos, maxPts);
      return `
        <div class="ranking-row ${classeRow(a.posicao)}">
          <div class="col-pos ${a.posicao <= 3 ? "medal" : ""}">${medalha(a.posicao)}</div>
          <div class="col-aluno">
            <div class="avatar-sm" style="background:${corAvatar(a.nome)}">${iniciais(a.nome)}</div>
            <div class="aluno-info">
              <div class="aluno-nome">${a.nome}</div>
              <div class="aluno-cat">${a.categoria}</div>
            </div>
          </div>
          <div class="col-pontos">${a.pontos}<small>pts</small></div>
          <div class="barra-wrap">
            <span class="barra-pct">${pct}%</span>
            <div class="barra-track">
              <div class="barra-fill" style="width:${pct}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join("")}
  `;
}

/* ═══════════════════════════════════════════════════
   RENDER — EDITOR ADMIN
═══════════════════════════════════════════════════ */
function renderEditor() {
  const ranking = calcularRanking(filtrarAlunos());
  document.getElementById("editor-lista").innerHTML = ranking.map(a => `
    <div class="editor-row">
      <div class="editor-nome">
        <div class="avatar-sm" style="background:${corAvatar(a.nome)};width:30px;height:30px;font-size:11px;flex-shrink:0">
          ${iniciais(a.nome)}
        </div>
        <span class="txt">${a.nome}</span>
        <span class="cat">${a.categoria}</span>
      </div>
      <input class="input-pontos" type="number" min="0" value="${a.pontos}" data-id="${a.id}" />
      <button class="btn-remover" onclick="removerAluno(${a.id})" title="Remover aluno">✕</button>
    </div>
  `).join("");
}

/* ═══════════════════════════════════════════════════
   RENDER — TUDO
═══════════════════════════════════════════════════ */
function renderizar() {
  const ranking = calcularRanking(filtrarAlunos());
  renderStats(ranking);
  renderPodio(ranking);
  renderTabela(ranking);
  if (adminAberto) renderEditor();
}

/* ═══════════════════════════════════════════════════
   FILTROS
═══════════════════════════════════════════════════ */
document.getElementById("filtros").addEventListener("click", function(e) {
  if (!e.target.matches(".filtro-btn")) return;
  categoriaAtiva = e.target.dataset.cat;
  document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("ativo"));
  e.target.classList.add("ativo");
  renderizar();
});

/* ═══════════════════════════════════════════════════
   MODAL DE SENHA — CONTROLE DE ACESSO
═══════════════════════════════════════════════════ */
function clicarAdmin() {
  // Se já está no painel, sai
  if (adminAberto) { sairAdmin(); return; }

  // Verifica bloqueio ativo
  if (bloqueadoAte && Date.now() < bloqueadoAte) {
    const seg = Math.ceil((bloqueadoAte - Date.now()) / 1000);
    toast(`⛔ Aguarde ${seg}s para tentar novamente.`, "error");
    return;
  }

  // Abre o modal
  document.getElementById("overlay").classList.add("show");
  document.getElementById("input-senha").value = "";
  document.getElementById("msg-erro").textContent = "";
  document.getElementById("input-senha").classList.remove("erro");
  document.getElementById("btn-entrar").disabled = false;
  setTimeout(() => document.getElementById("input-senha").focus(), 80);
}

function fecharModal() {
  document.getElementById("overlay").classList.remove("show");
  document.getElementById("input-senha").value = "";
  document.getElementById("msg-erro").textContent = "";
  document.getElementById("input-senha").classList.remove("erro");
}

function fecharSeClicarFora(e) {
  if (e.target === document.getElementById("overlay")) fecharModal();
}

function toggleVerSenha() {
  const inp = document.getElementById("input-senha");
  const btn = document.getElementById("btn-olho");
  inp.type     = inp.type === "password" ? "text"     : "password";
  btn.textContent = inp.type === "password" ? "👁️" : "🙈";
}

function verificarSenha() {
  // Bloqueia se ainda no período de espera
  if (bloqueadoAte && Date.now() < bloqueadoAte) {
    const seg = Math.ceil((bloqueadoAte - Date.now()) / 1000);
    document.getElementById("msg-erro").textContent = `Aguarde ${seg}s.`;
    return;
  }

  const digitado = document.getElementById("input-senha").value;

  if (digitado === SENHA_ADMIN) {
    // ✅ Senha correta
    tentativas = 0;
    fecharModal();
    abrirAdmin();
    toast("✅ Bem-vindo, professor!", "success");

  } else {
    // ❌ Senha errada
    tentativas++;

    const inp    = document.getElementById("input-senha");
    const msgEl  = document.getElementById("msg-erro");
    const restam = MAX_TENTATIVAS - tentativas;

    // Animação de erro
    inp.classList.remove("erro");
    void inp.offsetWidth;
    inp.classList.add("erro");
    inp.value = "";
    inp.focus();

    if (tentativas >= MAX_TENTATIVAS) {
      // Bloqueia por X minutos
      const ms     = BLOQUEIO_MINUTOS * 60 * 1000;
      bloqueadoAte = Date.now() + ms;
      tentativas   = 0;

      document.getElementById("btn-entrar").disabled = true;
      msgEl.textContent = `Muitas tentativas. Aguarde ${BLOQUEIO_MINUTOS} minuto(s).`;

      // Countdown visual
      const intervalo = setInterval(() => {
        if (!bloqueadoAte || Date.now() >= bloqueadoAte) {
          clearInterval(intervalo);
          bloqueadoAte = null;
          document.getElementById("btn-entrar").disabled = false;
          msgEl.textContent = "";
          return;
        }
        const seg = Math.ceil((bloqueadoAte - Date.now()) / 1000);
        msgEl.textContent = `Aguarde ${seg}s para tentar novamente.`;
      }, 1000);

    } else {
      msgEl.textContent = restam === 1
        ? `Senha incorreta. Última tentativa!`
        : `Senha incorreta. ${restam} tentativas restantes.`;
    }
  }
}

/* ═══════════════════════════════════════════════════
   ADMIN — ABRIR / FECHAR PAINEL
═══════════════════════════════════════════════════ */
function abrirAdmin() {
  adminAberto = true;
  const btn   = document.getElementById("btn-toggle-admin");
  btn.textContent = "🔓 Sair do Painel";
  btn.classList.add("ativo");
  document.getElementById("painel-admin").classList.add("visivel");
  renderEditor();
}

function sairAdmin() {
  adminAberto = false;
  const btn   = document.getElementById("btn-toggle-admin");
  btn.textContent = "🔒 Área do Professor";
  btn.classList.remove("ativo");
  document.getElementById("painel-admin").classList.remove("visivel");
  toast("👋 Painel fechado.", "success");
}

/* ═══════════════════════════════════════════════════
   ADMIN — SALVAR RANKING
═══════════════════════════════════════════════════ */
function salvarRanking() {
  document.querySelectorAll(".input-pontos[data-id]").forEach(input => {
    const id     = parseInt(input.dataset.id);
    const pontos = Math.max(0, parseInt(input.value) || 0);
    const aluno  = alunos.find(a => a.id === id);
    if (aluno) aluno.pontos = pontos;
  });
  renderizar();
  toast("✅ Ranking atualizado com sucesso!", "success");
}

/* ═══════════════════════════════════════════════════
   ADMIN — ADICIONAR ALUNO
═══════════════════════════════════════════════════ */
function adicionarAluno() {
  const nome   = document.getElementById("novo-nome").value.trim();
  const cat    = document.getElementById("novo-cat").value;
  const pontos = Math.max(0, parseInt(document.getElementById("novo-pontos").value) || 0);

  if (!nome) { toast("⚠️ Digite o nome do aluno.", "error"); return; }

  alunos.push({ id: proximoId++, nome, categoria: cat, pontos });

  document.getElementById("novo-nome").value   = "";
  document.getElementById("novo-pontos").value = "";

  // Se o novo aluno é de categoria diferente do filtro atual, volta p/ Todos
  if (categoriaAtiva !== "Todos" && categoriaAtiva !== cat) {
    categoriaAtiva = "Todos";
    document.querySelectorAll(".filtro-btn").forEach(b =>
      b.classList.toggle("ativo", b.dataset.cat === "Todos")
    );
  }

  renderizar();
  toast(`➕ ${nome} adicionado ao ranking!`, "success");
}

/* ═══════════════════════════════════════════════════
   ADMIN — REMOVER ALUNO
═══════════════════════════════════════════════════ */
function removerAluno(id) {
  const aluno = alunos.find(a => a.id === id);
  if (!aluno) return;
  if (!confirm(`Remover "${aluno.nome}" do ranking?`)) return;
  alunos = alunos.filter(a => a.id !== id);
  renderizar();
  toast(`🗑️ ${aluno.nome} removido.`, "success");
}

/* ═══════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════ */
let toastTimer;
function toast(msg, tipo = "success") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className   = `toast ${tipo} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}

/* ═══════════════════════════════════════════════════
   SEMANA AUTOMÁTICA NO HEADER
═══════════════════════════════════════════════════ */
(function() {
  const agora  = new Date();
  const inicio = new Date(agora.getFullYear(), 0, 1);
  const sem    = Math.ceil(((agora - inicio) / 86400000 + inicio.getDay() + 1) / 7);
  const meses  = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  document.getElementById("semana-label").textContent =
    `📅 Semana ${sem} · ${meses[agora.getMonth()]} ${agora.getFullYear()}`;
})();

/* ═══════════════════════════════════════════════════
   INICIALIZAR
═══════════════════════════════════════════════════ */
renderizar();
