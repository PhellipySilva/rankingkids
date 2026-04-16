import { useState } from 'react'
import { useRanking }     from './hooks/useRanking'
import { useTemporadas }  from './hooks/useTemporadas'
import { useAuth }        from './hooks/useAuth'
import { useToast }       from './hooks/useToast'
import { calcularRanking } from './lib/utils'
import Header       from './components/Header'
import FilterTabs   from './components/FilterTabs'
import StatsRow     from './components/StatsRow'
import Podium       from './components/Podium'
import RankingTable from './components/RankingTable'
import Toast        from './components/Toast'
import LoginModal   from './components/admin/LoginModal'
import AdminPanel   from './components/admin/AdminPanel'

type Categoria = 'Todos' | 'Adulto' | 'Kids'

export default function App() {
  const [categoria, setCategoria]     = useState<Categoria>('Todos')
  const [adminAberto, setAdminAberto] = useState(false)
  const [showLogin, setShowLogin]     = useState(false)

  const { ativa, temporadas, recarregar: recarregarTemp } = useTemporadas()
  const { alunos, loading, erro, recarregar }              = useRanking(ativa?.id)
  const { usuario, loading: authLoading, erro: authErro, setErro: setAuthErro, entrar, sair, isAdmin } = useAuth()
  const { msg, tipo, show, toast }                          = useToast()

  const filtrados = categoria === 'Todos'
    ? alunos
    : alunos.filter(a => a.categoria === categoria)

  const ranking = calcularRanking(filtrados)

  async function handleEntrar(email: string, senha: string) {
    const ok = await entrar(email, senha)
    if (ok) {
      setShowLogin(false)
      setAdminAberto(true)
      toast('✅ Bem-vindo, professor!', 'success')
    }
    return ok
  }

  function handleToggleAdmin() {
    if (adminAberto) {
      setAdminAberto(false)
      sair()
      toast('👋 Painel fechado.', 'success')
    } else if (usuario) {
      setAdminAberto(true)
    } else {
      setShowLogin(true)
      setAuthErro('')
    }
  }

  return (
    <>
      <Header temporada={ativa} />

      <div className="rk-container">
        <FilterTabs ativa={categoria} onChange={setCategoria} />

        <div className="rk-admin-toggle">
          <button
            className={`rk-btn-admin ${adminAberto ? 'ativo' : ''}`}
            onClick={handleToggleAdmin}
          >
            {adminAberto ? '🔓 Sair do Painel' : '🔒 Área do Professor'}
          </button>
        </div>

        {adminAberto && usuario && (
          <AdminPanel
            alunos={alunos}
            temporadas={temporadas}
            ativa={ativa}
            categoria={categoria}
            isAdmin={isAdmin}
            onSair={() => { setAdminAberto(false); sair(); toast('👋 Painel fechado.', 'success') }}
            onRecarregar={recarregar}
            onRecarregarTemp={recarregarTemp}
            onToast={toast}
          />
        )}

        {loading && (
          <div className="rk-card">
            <div className="rk-vazio">
              <div className="rk-vazio-icon">⏳</div>
              <div className="rk-vazio-txt">Carregando ranking...</div>
            </div>
          </div>
        )}

        {!loading && erro && (
          <div className="rk-card">
            <div className="rk-vazio">
              <div className="rk-vazio-icon">❌</div>
              <div className="rk-vazio-txt">{erro}</div>
            </div>
          </div>
        )}

        {!loading && !erro && (
          <>
            <StatsRow ranking={ranking} />
            <Podium ranking={ranking} categoria={categoria} />
            <RankingTable ranking={ranking} />
          </>
        )}
      </div>

      {showLogin && (
        <LoginModal
          onEntrar={handleEntrar}
          onFechar={() => { setShowLogin(false); setAuthErro('') }}
          erro={authErro}
          loading={authLoading}
        />
      )}

      <Toast msg={msg} tipo={tipo} show={show} />
    </>
  )
}
