import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type { Aluno } from '@rankingkids/types'
import { corAvatar } from '../../lib/utils'
import * as api from '../../lib/api'
import { formatarData } from '../../lib/utils'
import type { HistoricoPontos } from '@rankingkids/types'

interface Props {
  alunos:    Aluno[]
  categoria: string
}

export default function Dashboard({ alunos, categoria }: Props) {
  const [historico, setHistorico]       = useState<HistoricoPontos[]>([])
  const [alunoSel, setAlunoSel]         = useState<number | null>(null)
  const [loadingHist, setLoadingHist]   = useState(false)

  const filtrados = categoria === 'Todos'
    ? alunos
    : alunos.filter(a => a.categoria === categoria)

  const dadosGrafico = [...filtrados]
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, 10)
    .map(a => ({ nome: a.nome.split(' ')[0], pontos: a.pontos, cor: corAvatar(a.nome) }))

  useEffect(() => {
    if (!alunoSel) return
    setLoadingHist(true)
    api.getHistorico(alunoSel)
      .then(setHistorico)
      .catch(() => setHistorico([]))
      .finally(() => setLoadingHist(false))
  }, [alunoSel])

  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Gráfico top 10 */}
      <div>
        <div className="rk-form-label" style={{ marginBottom: 10 }}>
          Top {Math.min(10, filtrados.length)} — Pontuação
        </div>
        {filtrados.length === 0 ? (
          <div className="rk-vazio-txt">Nenhum aluno nesta categoria.</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dadosGrafico} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="nome" tick={{ fontSize: 11, fontFamily: 'DM Sans' }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v: number) => [`${v} pts`, 'Pontos']}
                contentStyle={{ borderRadius: 8, fontSize: 13 }}
              />
              <Bar dataKey="pontos" radius={[6, 6, 0, 0]}>
                {dadosGrafico.map((d, i) => <Cell key={i} fill={d.cor} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Histórico por aluno */}
      <div>
        <div className="rk-form-label" style={{ marginBottom: 8 }}>Histórico de Pontuação</div>
        <select
          className="rk-form-select"
          value={alunoSel ?? ''}
          onChange={e => setAlunoSel(e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">Selecione um aluno...</option>
          {filtrados.map(a => (
            <option key={a.id} value={a.id}>{a.nome} ({a.categoria})</option>
          ))}
        </select>

        {loadingHist && <div style={{ marginTop: 10, color: 'var(--muted)', fontSize: 13 }}>⏳ Carregando...</div>}

        {!loadingHist && alunoSel && historico.length === 0 && (
          <div style={{ marginTop: 10, color: 'var(--muted)', fontSize: 13 }}>Nenhum histórico ainda.</div>
        )}

        {historico.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {historico.map(h => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', background: '#F8FAFC', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13 }}>
                <span style={{ color: 'var(--muted)', flex: 1, fontSize: 12 }}>{formatarData(h.criadoEm)}</span>
                <span style={{ fontWeight: 700 }}>{h.pontosAnt}</span>
                <span style={{ color: 'var(--muted)' }}>→</span>
                <span style={{ fontWeight: 700, color: h.pontosNov > h.pontosAnt ? 'var(--court)' : 'var(--danger)' }}>{h.pontosNov}</span>
                {h.usuarioNome && <span style={{ fontSize: 11, color: 'var(--muted)' }}>por {h.usuarioNome}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
