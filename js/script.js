// ═══════════════════════════════════════════════════
//  🔌 SUPABASE — substitua pelas suas credenciais
// ═══════════════════════════════════════════════════
const SUPABASE_URL = "https://yzvgawtjvjfvsgaqsjwk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6dmdhd3RqdmpmdnNnYXFzandrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTUxMTUsImV4cCI6MjA5MTgzMTExNX0.vbqveaoeFYexI147qOw7GQDr4ET5B9FcrHltCDXbSrU"; // ← troque pela chave anon que começa com eyJ

// ═══════════════════════════════════════════════════
//  🔑 SENHA DO PAINEL ADMIN
// ═══════════════════════════════════════════════════
const SENHA_ADMIN      = "beach2025";
const MAX_TENTATIVAS   = 5;
const BLOQUEIO_MINUTOS = 2;

// ═══════════════════════════════════════════════════
//  ESTADO INTERNO
// ═══════════════════════════════════════════════════
let alunos         = [];
let categoriaAtiva = "Todos";
let adminAberto    = false;
let tentativas     = 0;
let bloqueadoAte   = null;

// ═══════════════════════════════════════════════════
//  SUPABASE HELPERS
// ═══════════════════════════════════════════════════
const headers = {
  "apikey":        SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type":  "application/json",
  "Prefer":        "return=representation",
};

async function dbBuscarTodos() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/alunos?order=pontos.desc`, { headers });
  if (!res.ok) throw new Error("Erro ao buscar alunos");
  return res.json();
}

async function dbAtualizarPontos(id, pontos) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/alunos?id=eq.${id}`, {
    method:  "PATCH",
    headers,
    body: JSON.stringify({ pontos }),
  });
  if (!res.ok) throw new Error("Erro ao atualizar pontos");
}

async function dbInserirAluno(nome, categoria, pontos) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/alunos`, {
    method:  "POST",
    headers,
    body: JSON.stringify({ nome, categoria, pontos }),
  });
  if (!res.ok) throw new Error("Erro ao inserir aluno");
  const data = await res.json();
  return data[0];
}

async function dbRemoverAluno(id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/alunos?id=eq.${id}`, {
    method:  "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Erro ao remover aluno");
}

// ═══════════════════════════════════════════════════
//  CARREGAR DADOS DO BANCO
// ═══════════════════════════════════════════════════
async function carregarDados() {
  try {
    mostrarCarregando(true);
    alunos = await dbBuscarTodos();
    renderizar();
  } catch (e) {
    console.error(e);
    toast("❌ Erro ao carregar dados. Verifique a conexão.", "error");
  } finally {
    mostrarCarregando(false);
  }
}

function mostrarCarregando(sim) {
  if (sim) {
    document.getElementById("ranking-card").innerHTML = `
      <div class="vazio">
        <div class="vazio-icon">⏳</div>
        <div class="vazio-txt">Carregando ranking...</div>
      </div>`;
  }
}

// ═══════════════════════════════════════════════════
//  UTILITÁRIOS — AVATAR
// ═══════════════════════════════════════════════════
const paleta = ["#1A6B4A","#1E7BB5","#7C3AED","#DB2777","#059669","#D97706","#0E7490","#B45309"];

function corAvatar(nome) {
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = nome.charCodeAt(i) + ((h << 5) - h);
  return paleta[Math.abs(h) % paleta.length];
}
function iniciais(nome) {
  return nome.trim().split(/\s+/).map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

// ═══════════════════════════════════════════════════
//  CALCULAR RANKING
// ═══════════════════════════════════════════════════
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

function filtrarAlunos() {
  return categoriaAtiva === "Todos"
    ? alunos
    : alunos.filter(a => a.categoria === categoriaAtiva);
}

// ═══════════════════════════════════════════════════
//  RENDER — STATS
// ═══════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════
//  RENDER — PÓDIO
// ═══════════════════════════════════════════════════
function renderPodio(ranking) {
  const w = document.getElementById("podio-wrapper");
  if (categoriaAtiva === "Todos" || ranking.length < 3) { w.innerHTML = ""; return; }

  const top   = ranking.slice(0, 3);
  const ordem = [top[1], top[0], top[2]];
  const cls   = ["pos-2", "pos-1", "pos-3"];
  const med   = ["🥈", "🥇", "🥉"];

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

// ═══════════════════════════════════════════════════
//  RENDER — TABELA
// ═══════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════
//  RENDER — EDITOR ADMIN
// ═══════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════
//  RENDER — TUDO
// ═══════════════════════════════════════════════════
function renderizar() {
  const ranking = calcularRanking(filtrarAlunos());
  renderStats(ranking);
  renderPodio(ranking);
  renderTabela(ranking);
  if (adminAberto) renderEditor();
}

// ═══════════════════════════════════════════════════
//  FILTROS
// ═══════════════════════════════════════════════════
document.getElementById("filtros").addEventListener("click", function(e) {
  if (!e.target.matches(".filtro-btn")) return;
  categoriaAtiva = e.target.dataset.cat;
  document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("ativo"));
  e.target.classList.add("ativo");
  renderizar();
});

// ═══════════════════════════════════════════════════
//  MODAL DE SENHA
// ═══════════════════════════════════════════════════
function clicarAdmin() {
  if (adminAberto) { sairAdmin(); return; }

  if (bloqueadoAte && Date.now() < bloqueadoAte) {
    const seg = Math.ceil((bloqueadoAte - Date.now()) / 1000);
    toast(`⛔ Aguarde ${seg}s para tentar novamente.`, "error");
    return;
  }

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
  inp.type        = inp.type === "password" ? "text"  : "password";
  btn.textContent = inp.type === "password" ? "👁️"   : "🙈";
}

function verificarSenha() {
  if (bloqueadoAte && Date.now() < bloqueadoAte) {
    const seg = Math.ceil((bloqueadoAte - Date.now()) / 1000);
    document.getElementById("msg-erro").textContent = `Aguarde ${seg}s.`;
    return;
  }

  const digitado = document.getElementById("input-senha").value;

  if (digitado === SENHA_ADMIN) {
    tentativas = 0;
    fecharModal();
    abrirAdmin();
    toast("✅ Bem-vindo, professor!", "success");
  } else {
    tentativas++;
    const inp    = document.getElementById("input-senha");
    const msgEl  = document.getElementById("msg-erro");
    const restam = MAX_TENTATIVAS - tentativas;

    inp.classList.remove("erro");
    void inp.offsetWidth;
    inp.classList.add("erro");
    inp.value = "";
    inp.focus();

    if (tentativas >= MAX_TENTATIVAS) {
      const ms     = BLOQUEIO_MINUTOS * 60 * 1000;
      bloqueadoAte = Date.now() + ms;
      tentativas   = 0;

      document.getElementById("btn-entrar").disabled = true;
      msgEl.textContent = `Muitas tentativas. Aguarde ${BLOQUEIO_MINUTOS} minuto(s).`;

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

// ═══════════════════════════════════════════════════
//  ADMIN — ABRIR / FECHAR
// ═══════════════════════════════════════════════════
function abrirAdmin() {
  adminAberto = true;
  const btn = document.getElementById("btn-toggle-admin");
  btn.textContent = "🔓 Sair do Painel";
  btn.classList.add("ativo");
  document.getElementById("painel-admin").classList.add("visivel");
  renderEditor();
}

function sairAdmin() {
  adminAberto = false;
  const btn = document.getElementById("btn-toggle-admin");
  btn.textContent = "🔒 Área do Professor";
  btn.classList.remove("ativo");
  document.getElementById("painel-admin").classList.remove("visivel");
  toast("👋 Painel fechado.", "success");
}

// ═══════════════════════════════════════════════════
//  ADMIN — SALVAR RANKING
// ═══════════════════════════════════════════════════
async function salvarRanking() {
  const btn = document.querySelector(".btn-salvar");
  btn.disabled = true;
  btn.textContent = "⏳ Salvando...";

  try {
    const inputs   = document.querySelectorAll(".input-pontos[data-id]");
    const promises = [];

    inputs.forEach(input => {
      const id     = parseInt(input.dataset.id);
      const pontos = Math.max(0, parseInt(input.value) || 0);
      const aluno  = alunos.find(a => a.id === id);
      if (aluno && aluno.pontos !== pontos) {
        aluno.pontos = pontos;
        promises.push(dbAtualizarPontos(id, pontos));
      }
    });

    await Promise.all(promises);
    renderizar();
    toast("✅ Ranking salvo! Todos verão as mudanças.", "success");
  } catch (e) {
    console.error(e);
    toast("❌ Erro ao salvar. Tente novamente.", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "✅ Salvar Ranking";
  }
}

// ═══════════════════════════════════════════════════
//  ADMIN — ADICIONAR ALUNO
// ═══════════════════════════════════════════════════
async function adicionarAluno() {
  const nome   = document.getElementById("novo-nome").value.trim();
  const cat    = document.getElementById("novo-cat").value;
  const pontos = Math.max(0, parseInt(document.getElementById("novo-pontos").value) || 0);

  if (!nome) { toast("⚠️ Digite o nome do aluno.", "error"); return; }

  try {
    const novoAluno = await dbInserirAluno(nome, cat, pontos);
    alunos.push(novoAluno);

    document.getElementById("novo-nome").value   = "";
    document.getElementById("novo-pontos").value = "";

    if (categoriaAtiva !== "Todos" && categoriaAtiva !== cat) {
      categoriaAtiva = "Todos";
      document.querySelectorAll(".filtro-btn").forEach(b =>
        b.classList.toggle("ativo", b.dataset.cat === "Todos")
      );
    }

    renderizar();
    toast(`➕ ${nome} adicionado com sucesso!`, "success");
  } catch (e) {
    console.error(e);
    toast("❌ Erro ao adicionar aluno.", "error");
  }
}

// ═══════════════════════════════════════════════════
//  ADMIN — REMOVER ALUNO
// ═══════════════════════════════════════════════════
async function removerAluno(id) {
  const aluno = alunos.find(a => a.id === id);
  if (!aluno) return;
  if (!confirm(`Remover "${aluno.nome}" do ranking?`)) return;

  try {
    await dbRemoverAluno(id);
    alunos = alunos.filter(a => a.id !== id);
    renderizar();
    toast(`🗑️ ${aluno.nome} removido.`, "success");
  } catch (e) {
    console.error(e);
    toast("❌ Erro ao remover aluno.", "error");
  }
}

// ═══════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════
let toastTimer;
function toast(msg, tipo = "success") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className   = `toast ${tipo} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}

// ═══════════════════════════════════════════════════
//  SEMANA NO HEADER
// ═══════════════════════════════════════════════════
(function() {
  const agora  = new Date();
  const inicio = new Date(agora.getFullYear(), 0, 1);
  const sem    = Math.ceil(((agora - inicio) / 86400000 + inicio.getDay() + 1) / 7);
  const meses  = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  document.getElementById("semana-label").textContent =
    `📅 Semana ${sem} · ${meses[agora.getMonth()]} ${agora.getFullYear()}`;
})();

// ═══════════════════════════════════════════════════
//  INICIALIZAR
// ═══════════════════════════════════════════════════
carregarDados();