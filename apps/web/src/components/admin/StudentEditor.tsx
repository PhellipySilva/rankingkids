import { useState } from 'react'
import type { Aluno } from '@rankingkids/types'
import type { Categoria } from '@rankingkids/types'
import { corAvatar, iniciais } from '../../lib/utils'
import * as api from '../../lib/api'

interface Props {
  alunos:      Aluno[]
  categoria:   string
  onRecarregar: () => void
  onToast:     (msg: string, tipo?: 'success' | 'error') => void
}

export default function StudentEditor({ alunos, categoria, onRecarregar, onToast }: Props) {
  const [novoNome,    setNovoNome]    = useState('')
  const [novoCat,     setNovoCat]     = useState<Categoria>('Adulto')
  const [novoPontos,  setNovoPontos]  = useState('')
  const [salvando,    setSalvando]    = useState(false)
  const [pontosMapa,  setPontosMapa]  = useState<Record<number, number>>({})

  const filtrados = categoria === 'Todos'
    ? alunos
    : alunos.filter(a => a.categoria === categoria)

  function getPontos(aluno: Aluno) {
    return pontosMapa[aluno.id] !== undefined ? pontosMapa[aluno.id] : aluno.pontos
  }

  function setPontos(id: number, val: string) {
    setPontosMapa(m => ({ ...m, [id]: Math.max(0, parseInt(val) || 0) }))
  }

  async function salvar() {
    setSalvando(true)
    try {
      const atualizacoes = Object.entries(pontosMapa)
        .map(([id, pontos]) => ({ id: parseInt(id), pontos }))
        .filter(({ id, pontos }) => {
          const original = alunos.find(a => a.id === id)
          return original && original.pontos !== pontos
        })

      if (atualizacoes.length === 0) {
        onToast('Nenhuma alteração para salvar.', 'error')
        return
      }

      await api.salvarLote(atualizacoes)
      setPontosMapa({})
      onRecarregar()
      onToast('✅ Ranking salvo! Todos verão as mudanças.')
    } catch (e: unknown) {
      onToast(e instanceof Error ? e.message : 'Erro ao salvar', 'error')
    } finally {
      setSalvando(false)
    }
  }

  async function remover(aluno: Aluno) {
    if (!confirm(`Remover "${aluno.nome}" do ranking?`)) return
    try {
      await api.removerAluno(aluno.id)
      onRecarregar()
      onToast(`🗑️ ${aluno.nome} removido.`)
    } catch (e: unknown) {
      onToast(e instanceof Error ? e.message : 'Erro ao remover', 'error')
    }
  }

  async function adicionar() {
    if (!novoNome.trim()) { onToast('⚠️ Digite o nome do aluno.', 'error'); return }
    try {
      await api.criarAluno({ nome: novoNome.trim(), categoria: novoCat, pontos: parseInt(novoPontos) || 0 })
      setNovoNome(''); setNovoPontos('')
      onRecarregar()
      onToast(`➕ ${novoNome.trim()} adicionado!`)
    } catch (e: unknown) {
      onToast(e instanceof Error ? e.message : 'Erro ao adicionar', 'error')
    }
  }

  return (
    <>
      <div className="rk-painel-titulo">✏️ Editar Ranking — altere os pontos e clique em Salvar</div>

      <div className="rk-editor-lista">
        {filtrados.map(a => (
          <div key={a.id} className="rk-editor-row">
            <div className="rk-editor-nome">
              <div className="rk-avatar" style={{ background: corAvatar(a.nome), width: 30, height: 30, fontSize: 11, flexShrink: 0 }}>
                {iniciais(a.nome)}
              </div>
              <span className="txt">{a.nome}</span>
              <span className="cat">{a.categoria}</span>
            </div>
            <input
              className="rk-input-pontos"
              type="number"
              min={0}
              value={getPontos(a)}
              onChange={e => setPontos(a.id, e.target.value)}
            />
            <button className="rk-btn-remover" onClick={() => remover(a)} title="Remover aluno">✕</button>
          </div>
        ))}
        {filtrados.length === 0 && (
          <div className="rk-vazio"><div className="rk-vazio-txt">Nenhum aluno nesta categoria.</div></div>
        )}
      </div>

      <div className="rk-form-novo">
        <div className="rk-form-campos">
          <div className="rk-form-group">
            <label className="rk-form-label">Nome do Aluno</label>
            <input className="rk-form-input" placeholder="Ex: João Silva" value={novoNome} onChange={e => setNovoNome(e.target.value)} onKeyDown={e => e.key === 'Enter' && adicionar()} />
          </div>
          <div className="rk-form-group">
            <label className="rk-form-label">Categoria</label>
            <select className="rk-form-select" value={novoCat} onChange={e => setNovoCat(e.target.value as Categoria)}>
              <option value="Adulto">Adulto</option>
              <option value="Kids">Kids</option>
            </select>
          </div>
          <div className="rk-form-group">
            <label className="rk-form-label">Pontos iniciais</label>
            <input className="rk-form-input" type="number" placeholder="0" min={0} value={novoPontos} onChange={e => setNovoPontos(e.target.value)} />
          </div>
        </div>
        <button className="rk-btn-add" onClick={adicionar}>＋ Adicionar Aluno</button>
      </div>

      <div className="rk-botoes-admin">
        <button className="rk-btn-salvar" onClick={salvar} disabled={salvando}>
          {salvando ? '⏳ Salvando...' : '✅ Salvar Ranking'}
        </button>
      </div>
    </>
  )
}
