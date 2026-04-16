import type { Temporada } from '@rankingkids/types'

interface Props {
  temporada: Temporada | null
}

export default function Header({ temporada }: Props) {
  return (
    <header className="rk-header">
      <div className="rk-header-content">
        <span className="rk-header-icon">🎾</span>
        <h1 className="rk-header-title">RANKING KIDS</h1>
        <p className="rk-header-sub">{temporada?.nome ?? 'Carregando...'}</p>
        {temporada?.semanaAtual && (
          <span className="rk-semana-badge">{temporada.semanaAtual}</span>
        )}
      </div>
    </header>
  )
}
