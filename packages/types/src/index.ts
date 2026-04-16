export type Categoria = 'Adulto' | 'Kids'
export type Role = 'ADMIN' | 'PROFESSOR'

export interface Temporada {
  id: number
  nome: string
  numero: number
  semanaAtual: string | null
  ativa: boolean
  criadaEm: string
}

export interface Aluno {
  id: number
  nome: string
  categoria: Categoria
  pontos: number
  temporadaId: number
  criadoEm: string
}

export interface AlunoRanking extends Aluno {
  posicao: number
  pct: number
}

export interface HistoricoPontos {
  id: number
  alunoId: number
  pontosAnt: number
  pontosNov: number
  usuarioNome: string | null
  criadoEm: string
}

export interface Usuario {
  id: number
  nome: string
  email: string
  role: Role
  ativo: boolean
  criadoEm: string
}

export interface LoginPayload {
  email: string
  senha: string
}

export interface LoginResponse {
  token: string
  usuario: Usuario
}

export interface CriarAlunoPayload {
  nome: string
  categoria: Categoria
  pontos?: number
  temporadaId?: number
}

export interface AtualizarAlunoPayload {
  pontos?: number
  nome?: string
  categoria?: Categoria
}

export interface CriarTemporadaPayload {
  nome: string
  numero: number
  semanaAtual?: string
}

export interface AtualizarTemporadaPayload {
  nome?: string
  semanaAtual?: string
}

export interface CriarUsuarioPayload {
  nome: string
  email: string
  senha: string
  role?: Role
}

export interface AlterarSenhaPayload {
  senhaAtual: string
  novaSenha: string
}
