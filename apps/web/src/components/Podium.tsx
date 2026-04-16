import type { AlunoRanking } from '@rankingkids/types'
import { corAvatar, iniciais } from '../lib/utils'

interface Props {
  ranking:   AlunoRanking[]
  categoria: string
}

const MEDAIS  = ['🥈', '🥇', '🥉']
const CLASSES = ['rk-pos-2', 'rk-pos-1', 'rk-pos-3']

export default function Podium({ ranking, categoria }: Props) {
  if (categoria === 'Todos' || ranking.length < 3) return null

  const top   = ranking.slice(0, 3)
  const ordem = [top[1], top[0], top[2]] // prata, ouro, bronze

  return (
    <div className="rk-podio-wrapper">
      <div className="rk-podio">
        {ordem.map((a, i) => (
          <div key={a.id} className={`rk-podio-item ${CLASSES[i]}`} style={{ animationDelay: `${[0.1,0,0.2][i]}s` }}>
            <div className="rk-podio-avatar" style={{ background: corAvatar(a.nome) }}>
              {iniciais(a.nome)}
              <span className="rk-podio-medal">{MEDAIS[i]}</span>
            </div>
            <div className="rk-podio-nome">{a.nome}</div>
            <div className="rk-podio-pontos">{a.pontos}</div>
            <div className="rk-podio-label">pontos</div>
            <div className="rk-podio-plataforma" />
          </div>
        ))}
      </div>
    </div>
  )
}
