import type { Aluno, AlunoRanking } from '@rankingkids/types'

const PALETA = ['#1A6B4A','#1E7BB5','#7C3AED','#DB2777','#059669','#D97706','#0E7490','#B45309']

export function corAvatar(nome: string): string {
  let h = 0
  for (let i = 0; i < nome.length; i++) h = nome.charCodeAt(i) + ((h << 5) - h)
  return PALETA[Math.abs(h) % PALETA.length]
}

export function iniciais(nome: string): string {
  return nome.trim().split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

export function calcularRanking(alunos: Aluno[]): AlunoRanking[] {
  const sorted = [...alunos].sort((a, b) => b.pontos - a.pontos)
  const max    = sorted[0]?.pontos || 1
  let posAtual = 1
  return sorted.map((aluno, i) => {
    if (i > 0 && aluno.pontos < sorted[i - 1].pontos) posAtual = i + 1
    return {
      ...aluno,
      posicao: posAtual,
      pct: Math.round((aluno.pontos / max) * 100),
    }
  })
}

export function medalha(pos: number): string {
  return pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : String(pos)
}

export function classeRow(pos: number): string {
  return pos === 1 ? 'top1' : pos === 2 ? 'top2' : pos === 3 ? 'top3' : ''
}

export function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
