import type { AlunoRanking } from '@rankingkids/types'

interface Props { ranking: AlunoRanking[] }

export default function StatsRow({ ranking }: Props) {
  const max  = ranking[0]?.pontos ?? 0
  const cats = new Set(ranking.map(a => a.categoria)).size

  return (
    <div className="rk-stats-row">
      <div className="rk-stat-card">
        <div className="rk-stat-val">{ranking.length}</div>
        <div className="rk-stat-lbl">Participantes</div>
      </div>
      <div className="rk-stat-card">
        <div className="rk-stat-val">{max}</div>
        <div className="rk-stat-lbl">Maior Pontuação</div>
      </div>
      <div className="rk-stat-card">
        <div className="rk-stat-val">{cats}</div>
        <div className="rk-stat-lbl">{cats === 1 ? 'Categoria' : 'Categorias'}</div>
      </div>
    </div>
  )
}
