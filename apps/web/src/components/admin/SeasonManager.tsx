import { useState } from 'react'
import type { Temporada } from '@rankingkids/types'
import * as api from '../../lib/api'

interface Props {
  temporadas:    Temporada[]
  ativa:         Temporada | null
  onRecarregar:  () => void
  onToast:       (msg: string, tipo?: 'success' | 'error') => void
  isAdmin:       boolean
}

export default function SeasonManager({ temporadas, ativa, onRecarregar, onToast, isAdmin }: Props) {
  const [novoNome,   setNovoNome]   = useState('')
  const [novoNum,    setNovoNum]    = useState('')
  const [novaSemana, setNovaSemana] = useState('')
  const [editSemana, setEditSemana] = useState(ativa?.semanaAtual ?? '')
  const [salvando,   setSalvando]   = useState(false)

  async function criarTemporada() {
    if (!novoNome || !novoNum) { onToast('Nome e número são obrigatórios.', 'error'); return }
    try {
      await api.criarTemporada({ nome: novoNome, numero: parseInt(novoNum), semanaAtual: novaSemana || undefined })
      setNovoNome(''); setNovoNum(''); setNovaSemana('')
      onRecarregar()
      onToast('✅ Temporada criada!')
    } catch (e: unknown) {
      onToast(e instanceof Error ? e.message : 'Erro', 'error')
    }
  }

  async function ativar(id: number) {
    try {
      await api.ativarTemporada(id)
      onRecarregar()
      onToast('✅ Temporada ativada!')
    } catch (e: unknown) {
      onToast(e instanceof Error ? e.message : 'Erro', 'error')
    }
  }

  async function salvarSemana() {
    if (!ativa) return
    setSalvando(true)
    try {
      await api.atualizarTemporada(ativa.id, { semanaAtual: editSemana })
      onRecarregar()
      onToast('✅ Semana atualizada!')
    } catch (e: unknown) {
      onToast(e instanceof Error ? e.message : 'Erro', 'error')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Semana atual */}
      <div>
        <div className="rk-form-label" style={{ marginBottom: 6 }}>Semana Atual ({ativa?.nome ?? '—'})</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="rk-form-input"
            placeholder="Ex: Semana 3 (13/04 a 26/04)"
            value={editSemana}
            onChange={e => setEditSemana(e.target.value)}
          />
          <button className="rk-btn-add" style={{ whiteSpace: 'nowrap' }} onClick={salvarSemana} disabled={salvando}>
            {salvando ? '⏳' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Lista de temporadas */}
      <div>
        <div className="rk-form-label" style={{ marginBottom: 8 }}>Temporadas</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {temporadas.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#F8FAFC', borderRadius: 10, border: '1px solid var(--line)' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{t.nome}</span>
                {t.semanaAtual && <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--muted)' }}>{t.semanaAtual}</span>}
              </div>
              {t.ativa
                ? <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--court)', background: '#E8F5EE', padding: '3px 8px', borderRadius: 999 }}>ATIVA</span>
                : isAdmin && (
                  <button className="rk-btn-add" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => ativar(t.id)}>
                    Ativar
                  </button>
                )
              }
            </div>
          ))}
        </div>
      </div>

      {/* Nova temporada (admin) */}
      {isAdmin && (
        <div>
          <div className="rk-form-label" style={{ marginBottom: 8 }}>Nova Temporada</div>
          <div className="rk-form-campos" style={{ marginBottom: 8 }}>
            <div className="rk-form-group">
              <label className="rk-form-label">Nome</label>
              <input className="rk-form-input" placeholder="Ex: Temporada 30" value={novoNome} onChange={e => setNovoNome(e.target.value)} />
            </div>
            <div className="rk-form-group">
              <label className="rk-form-label">Número</label>
              <input className="rk-form-input" type="number" placeholder="30" value={novoNum} onChange={e => setNovoNum(e.target.value)} />
            </div>
            <div className="rk-form-group">
              <label className="rk-form-label">Semana inicial</label>
              <input className="rk-form-input" placeholder="Semana 1" value={novaSemana} onChange={e => setNovaSemana(e.target.value)} />
            </div>
          </div>
          <button className="rk-btn-add" onClick={criarTemporada}>＋ Criar Temporada</button>
        </div>
      )}
    </div>
  )
}
