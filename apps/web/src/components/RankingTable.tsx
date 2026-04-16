import type { AlunoRanking } from '@rankingkids/types'
import { corAvatar, iniciais, medalha, classeRow } from '../lib/utils'

interface Props { ranking: AlunoRanking[] }

export default function RankingTable({ ranking }: Props) {
  if (ranking.length === 0) {
    return (
      <div className="rk-card">
        <div className="rk-vazio">
          <div className="rk-vazio-icon">🏖️</div>
          <div className="rk-vazio-txt">Nenhum aluno nesta categoria ainda.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="rk-card">
      <div className="rk-table-header">
        <div style={{ textAlign: 'center' }}>#</div>
        <div>Aluno</div>
        <div style={{ textAlign: 'center' }}>Pts</div>
        <div style={{ textAlign: 'right' }}>Aproveit.</div>
      </div>
      {ranking.map((a, i) => (
        <div
          key={a.id}
          className={`rk-row ${classeRow(a.posicao)}`}
          style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}
        >
          <div className="rk-col-pos">{medalha(a.posicao)}</div>
          <div className="rk-col-aluno">
            <div className="rk-avatar" style={{ background: corAvatar(a.nome) }}>
              {iniciais(a.nome)}
            </div>
            <div>
              <div className="rk-aluno-nome">{a.nome}</div>
              <div className="rk-aluno-cat">{a.categoria}</div>
            </div>
          </div>
          <div className="rk-col-pontos">
            {a.pontos}<small>pts</small>
          </div>
          <div className="rk-barra-wrap">
            <span className="rk-barra-pct">{a.pct}%</span>
            <div className="rk-barra-track">
              <div className="rk-barra-fill" style={{ width: `${a.pct}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
