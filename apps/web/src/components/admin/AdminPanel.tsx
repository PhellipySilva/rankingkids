import { useState } from 'react'
import type { Aluno, Temporada } from '@rankingkids/types'
import StudentEditor from './StudentEditor'
import SeasonManager from './SeasonManager'
import UserManager   from './UserManager'
import Dashboard     from './Dashboard'
import * as api      from '../../lib/api'
import { exportCsv } from '../../lib/api'

type Tab = 'ranking' | 'temporadas' | 'usuarios' | 'dashboard'

interface Props {
  alunos:        Aluno[]
  temporadas:    Temporada[]
  ativa:         Temporada | null
  categoria:     string
  isAdmin:       boolean
  onSair:        () => void
  onRecarregar:  () => void
  onRecarregarTemp: () => void
  onToast:       (msg: string, tipo?: 'success' | 'error') => void
}

export default function AdminPanel({
  alunos, temporadas, ativa, categoria, isAdmin,
  onSair, onRecarregar, onRecarregarTemp, onToast,
}: Props) {
  const [tab, setTab] = useState<Tab>('ranking')

  async function alterarSenha() {
    const atual  = prompt('Senha atual:')
    if (!atual) return
    const nova   = prompt('Nova senha (mín. 6 caracteres):')
    if (!nova || nova.length < 6) { onToast('Nova senha muito curta.', 'error'); return }
    const confirma = prompt('Confirmar nova senha:')
    if (nova !== confirma) { onToast('Senhas não coincidem.', 'error'); return }
    try {
      await api.alterarSenha({ senhaAtual: atual, novaSenha: nova })
      onToast('✅ Senha alterada!')
    } catch (e: unknown) {
      onToast(e instanceof Error ? e.message : 'Erro', 'error')
    }
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'ranking',    label: '✏️ Ranking' },
    { key: 'temporadas', label: '📅 Temporadas' },
    { key: 'dashboard',  label: '📊 Dashboard' },
    ...(isAdmin ? [{ key: 'usuarios' as Tab, label: '👥 Usuários' }] : []),
  ]

  return (
    <div className="rk-painel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', background: 'linear-gradient(90deg, var(--court-dark), var(--court))' }}>
        <div className="rk-painel-titulo" style={{ padding: '13px 0' }}>🔓 Painel do Professor</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => exportCsv(ativa?.id, categoria === 'Todos' ? undefined : categoria)}
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 12, fontFamily: 'DM Sans' }}
          >
            ⬇️ CSV
          </button>
          <button
            onClick={alterarSenha}
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 12, fontFamily: 'DM Sans' }}
          >
            🔑 Senha
          </button>
        </div>
      </div>

      <div className="rk-painel-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`rk-painel-tab ${tab === t.key ? 'ativo' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'ranking' && (
        <StudentEditor alunos={alunos} categoria={categoria} onRecarregar={onRecarregar} onToast={onToast} />
      )}
      {tab === 'temporadas' && (
        <SeasonManager temporadas={temporadas} ativa={ativa} onRecarregar={onRecarregarTemp} onToast={onToast} isAdmin={isAdmin} />
      )}
      {tab === 'dashboard' && (
        <Dashboard alunos={alunos} categoria={categoria} />
      )}
      {tab === 'usuarios' && isAdmin && (
        <UserManager onToast={onToast} />
      )}

      <div className="rk-botoes-admin" style={{ paddingTop: 0 }}>
        <button className="rk-btn-sair" onClick={onSair}>Sair do Painel</button>
      </div>
    </div>
  )
}
