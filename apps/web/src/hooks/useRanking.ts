import { useState, useEffect, useCallback } from 'react'
import type { Aluno } from '@rankingkids/types'
import * as api from '../lib/api'

export function useRanking(temporadaId?: number) {
  const [alunos, setAlunos]     = useState<Aluno[]>([])
  const [loading, setLoading]   = useState(true)
  const [erro, setErro]         = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    setErro('')
    try {
      const dados = await api.getAlunos(temporadaId ? { temporadaId } : undefined)
      setAlunos(dados)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [temporadaId])

  useEffect(() => { carregar() }, [carregar])

  return { alunos, setAlunos, loading, erro, recarregar: carregar }
}
