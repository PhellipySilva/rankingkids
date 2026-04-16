import type {
  Aluno, Temporada, Usuario,
  LoginPayload, LoginResponse,
  CriarAlunoPayload, AtualizarAlunoPayload,
  CriarTemporadaPayload, AtualizarTemporadaPayload,
  CriarUsuarioPayload, AlterarSenhaPayload,
  HistoricoPontos,
} from '@rankingkids/types'

const BASE = '/api'

function token() {
  return sessionStorage.getItem('rk_token') ?? ''
}

function headers(auth = false): HeadersInit {
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (auth) h['Authorization'] = `Bearer ${token()}`
  return h
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Erro ${res.status}`)
  }
  return res.json()
}

// ── Auth ─────────────────────────────────────
export const login = (data: LoginPayload) =>
  req<LoginResponse>('/auth/login', { method: 'POST', headers: headers(), body: JSON.stringify(data) })

export const getMe = () =>
  req<Usuario>('/auth/me', { headers: headers(true) })

export const alterarSenha = (data: AlterarSenhaPayload) =>
  req<{ ok: boolean }>('/auth/me/senha', { method: 'PATCH', headers: headers(true), body: JSON.stringify(data) })

// ── Temporadas ───────────────────────────────
export const getTemporadas = () =>
  req<Temporada[]>('/temporadas')

export const getTemporadaAtiva = () =>
  req<Temporada>('/temporadas/ativa')

export const criarTemporada = (data: CriarTemporadaPayload) =>
  req<Temporada>('/temporadas', { method: 'POST', headers: headers(true), body: JSON.stringify(data) })

export const atualizarTemporada = (id: number, data: AtualizarTemporadaPayload) =>
  req<Temporada>(`/temporadas/${id}`, { method: 'PATCH', headers: headers(true), body: JSON.stringify(data) })

export const ativarTemporada = (id: number) =>
  req<Temporada>(`/temporadas/${id}/ativar`, { method: 'PATCH', headers: headers(true) })

// ── Alunos ───────────────────────────────────
export const getAlunos = (params?: { categoria?: string; temporadaId?: number }) => {
  const qs = new URLSearchParams()
  if (params?.categoria)   qs.set('categoria', params.categoria)
  if (params?.temporadaId) qs.set('temporadaId', String(params.temporadaId))
  return req<Aluno[]>(`/alunos${qs.toString() ? '?' + qs : ''}`)
}

export const criarAluno = (data: CriarAlunoPayload) =>
  req<Aluno>('/alunos', { method: 'POST', headers: headers(true), body: JSON.stringify(data) })

export const atualizarAluno = (id: number, data: AtualizarAlunoPayload) =>
  req<Aluno>(`/alunos/${id}`, { method: 'PATCH', headers: headers(true), body: JSON.stringify(data) })

export const salvarLote = (atualizacoes: Array<{ id: number; pontos: number }>) =>
  req<{ ok: boolean }>('/alunos/salvar-lote', { method: 'POST', headers: headers(true), body: JSON.stringify({ atualizacoes }) })

export const removerAluno = (id: number) =>
  req<{ ok: boolean }>(`/alunos/${id}`, { method: 'DELETE', headers: headers(true) })

export const getHistorico = (id: number) =>
  req<HistoricoPontos[]>(`/alunos/${id}/historico`, { headers: headers(true) })

// ── Usuários ─────────────────────────────────
export const getUsuarios = () =>
  req<Usuario[]>('/usuarios', { headers: headers(true) })

export const criarUsuario = (data: CriarUsuarioPayload) =>
  req<Usuario>('/usuarios', { method: 'POST', headers: headers(true), body: JSON.stringify(data) })

export const atualizarUsuario = (id: number, data: Partial<CriarUsuarioPayload> & { ativo?: boolean }) =>
  req<Usuario>(`/usuarios/${id}`, { method: 'PATCH', headers: headers(true), body: JSON.stringify(data) })

export const desativarUsuario = (id: number) =>
  req<{ ok: boolean }>(`/usuarios/${id}`, { method: 'DELETE', headers: headers(true) })

// ── Export ───────────────────────────────────
export function exportCsv(temporadaId?: number, categoria?: string) {
  const qs = new URLSearchParams()
  if (temporadaId) qs.set('temporadaId', String(temporadaId))
  if (categoria)   qs.set('categoria', categoria)
  window.open(`${BASE}/export/ranking?${qs}`, '_blank')
}
