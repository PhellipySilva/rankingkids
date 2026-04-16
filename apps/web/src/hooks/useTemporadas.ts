import { useState, useEffect, useCallback } from 'react'
import type { Temporada } from '@rankingkids/types'
import * as api from '../lib/api'

export function useTemporadas() {
  const [temporadas, setTemporadas] = useState<Temporada[]>([])
  const [ativa, setAtiva]           = useState<Temporada | null>(null)
  const [loading, setLoading]       = useState(true)

  const carregar = useCallback(async () => {
    try {
      const [todas, atual] = await Promise.all([
        api.getTemporadas(),
        api.getTemporadaAtiva().catch(() => null),
      ])
      setTemporadas(todas)
      setAtiva(atual)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  return { temporadas, ativa, loading, recarregar: carregar, setAtiva }
}
