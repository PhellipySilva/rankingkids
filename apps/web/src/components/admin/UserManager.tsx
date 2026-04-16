import { useState, useEffect } from 'react'
import type { Usuario } from '@rankingkids/types'
import * as api from '../../lib/api'

interface Props {
  onToast: (msg: string, tipo?: 'success' | 'error') => void
}

export default function UserManager({ onToast }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [nome,     setNome]     = useState('')
  const [email,    setEmail]    = useState('')
  const [senha,    setSenha]    = useState('')
  const [role,     setRole]     = useState<'ADMIN' | 'PROFESSOR'>('PROFESSOR')

  useEffect(() => {
    api.getUsuarios().then(setUsuarios).catch(() => {})
  }, [])

  async function criar() {
    if (!nome || !email || !senha) { onToast('Preencha todos os campos.', 'error'); return }
    try {
      const u = await api.criarUsuario({ nome, email, senha, role })
      setUsuarios(prev => [...prev, u])
      setNome(''); setEmail(''); setSenha('')
      onToast(`✅ ${u.nome} criado!`)
    } catch (e: unknown) {
      onToast(e instanceof Error ? e.message : 'Erro', 'error')
    }
  }

  async function desativar(u: Usuario) {
    if (!confirm(`Desativar "${u.nome}"?`)) return
    try {
      await api.desativarUsuario(u.id)
      setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, ativo: false } : x))
      onToast(`👤 ${u.nome} desativado.`)
    } catch (e: unknown) {
      onToast(e instanceof Error ? e.message : 'Erro', 'error')
    }
  }

  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {usuarios.map(u => (
          <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#F8FAFC', borderRadius: 10, border: '1px solid var(--line)', opacity: u.ativo ? 1 : 0.5 }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{u.nome}</span>
              <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--muted)' }}>{u.email}</span>
              <span style={{ marginLeft: 8, fontSize: 11, background: u.role === 'ADMIN' ? '#E8F5EE' : '#EEF2FF', color: u.role === 'ADMIN' ? 'var(--court)' : '#6366F1', padding: '2px 6px', borderRadius: 999 }}>
                {u.role}
              </span>
            </div>
            {u.ativo && (
              <button className="rk-btn-remover" onClick={() => desativar(u)} title="Desativar">✕</button>
            )}
          </div>
        ))}
      </div>

      <div>
        <div className="rk-form-label" style={{ marginBottom: 8 }}>Novo Usuário</div>
        <div className="rk-form-campos" style={{ marginBottom: 8 }}>
          <div className="rk-form-group">
            <label className="rk-form-label">Nome</label>
            <input className="rk-form-input" placeholder="Nome completo" value={nome} onChange={e => setNome(e.target.value)} />
          </div>
          <div className="rk-form-group">
            <label className="rk-form-label">Email</label>
            <input className="rk-form-input" type="email" placeholder="email@..." value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="rk-form-group">
            <label className="rk-form-label">Senha</label>
            <input className="rk-form-input" type="password" placeholder="mín. 6 chars" value={senha} onChange={e => setSenha(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select className="rk-form-select" style={{ width: 'auto' }} value={role} onChange={e => setRole(e.target.value as 'ADMIN' | 'PROFESSOR')}>
            <option value="PROFESSOR">Professor</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button className="rk-btn-add" onClick={criar}>＋ Criar Usuário</button>
        </div>
      </div>
    </div>
  )
}
